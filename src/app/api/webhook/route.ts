import { eq, and } from "drizzle-orm";
import {OpenAI} from "openai"
import { NextRequest,NextResponse } from "next/server";
import {
    MessageNewEvent,
    CallEndedEvent,
    CallTranscriptionReadyEvent,
    CallSessionParticipantLeftEvent,
    CallRecordingReadyEvent,
    CallSessionStartedEvent

} from "@stream-io/node-sdk";
import { db } from "@/db";
import { agent,meeting, user } from "@/db/schema";
import { StreamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";
import { streamChat } from "@/lib/stream-chat";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { generateAvatarURI } from "@/lib/avatar";
import { UNRESTRICTED_EMAILS } from "@/constants";

const openAiClient = new OpenAI({apiKey: process.env.OPENAI_API_KEY!});


function verifySignatureWithSDK(body:string,signature:string):boolean {
    try {
        const isValid = StreamVideo.verifyWebhook(body,signature);
        console.log(`🔐 Signature verification:`, {
            isValid,
            bodyLength: body.length,
            signatureLength: signature.length,
            signaturePrefix: signature.substring(0, 8) + '...'
        });
        return isValid;
    } catch (error) {
        console.error(`❌ Signature verification error:`, error);
        return false;
    }
};

// Rate limiting for webhook requests
const webhookRequests = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per minute per IP

function isRateLimited(ip: string): boolean {
    const requests = webhookRequests.get(ip) || 0;
    
    if (requests >= RATE_LIMIT_MAX_REQUESTS) {
        return true;
    }
    
    webhookRequests.set(ip, requests + 1);
    
    // Clean up old entries
    setTimeout(() => {
        webhookRequests.delete(ip);
    }, RATE_LIMIT_WINDOW);
    
    return false;
}

// Deduplication for message.new events - track processed message IDs
const processedMessages = new Set<string>();
const MESSAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function hasProcessedMessage(messageId: string): boolean {
    return processedMessages.has(messageId);
}

function markMessageProcessed(messageId: string): void {
    processedMessages.add(messageId);
    // Clean up after TTL
    setTimeout(() => {
        processedMessages.delete(messageId);
    }, MESSAGE_CACHE_TTL);
}

// Deduplication for agent connections - track meetings where agent is being/has been connected
const agentConnectionsInProgress = new Set<string>();
const AGENT_CONNECTION_TTL = 2 * 60 * 1000; // 2 minutes

function isAgentConnectionInProgress(meetingId: string): boolean {
    return agentConnectionsInProgress.has(meetingId);
}

function markAgentConnectionInProgress(meetingId: string): void {
    agentConnectionsInProgress.add(meetingId);
    // Clean up after TTL
    setTimeout(() => {
        agentConnectionsInProgress.delete(meetingId);
    }, AGENT_CONNECTION_TTL);
}

export async function POST(req:NextRequest){
    const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    
    // Rate limiting check
    if (isRateLimited(clientIP)) {
        console.warn(`⚠️ Rate limited webhook request from IP: ${clientIP}`);
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    
    console.log(`🔔 Webhook request received at: ${new Date().toISOString()}`);
    
    const signature = req.headers.get("x-signature");
    const apiKey = req.headers.get("x-api-key")

    console.log(`📊 Webhook headers:`, {
        hasSignature: !!signature,
        signatureLength: signature?.length || 0,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0,
        userAgent: req.headers.get("user-agent")?.substring(0, 50) + "...",
        clientIP: clientIP
    });

    if (!signature || !apiKey) {
        console.error(`❌ Missing signature or api key`);
        return NextResponse.json(
            {error: "Missing signature or api key"},
            {status: 400}
        );
    }
    const body = await req.text();
    console.log(`📊 Webhook body length: ${body.length}`);
    
    // Handle empty body requests (health checks, etc.)
    if (!body || body.trim() === '') {
        console.log(`📊 Empty webhook body - likely health check, returning 200`);
        return NextResponse.json({ success: true });
    }
    
    if(!verifySignatureWithSDK(body,signature)){
        console.error(`❌ Invalid webhook signature`);
        console.error(`📊 Signature details:`, {
            signature: signature.substring(0, 8) + '...',
            bodyLength: body.length,
            bodyPreview: body.substring(0, 100) + (body.length > 100 ? '...' : '')
        });
        return NextResponse.json({error: "Invalid signature"},{status:401});
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body) as Record<string,unknown>;
    } catch (parseError) {
        console.error(`❌ Invalid JSON in webhook body:`, parseError);
        return NextResponse.json({ error:"Invalid JSON"},{status:400});
    }
    const eventType = (payload as Record<string,unknown>)?.type;
    
    console.log(`📊 Webhook event type: ${eventType}`, {
        eventType,
        payloadKeys: Object.keys(payload as Record<string,unknown>),
        timestamp: new Date().toISOString()
    });

    if(eventType === "call.session_started"){
        const event = payload as CallSessionStartedEvent;
        const meetingId = event.call_cid.split(":")[1];

        console.log(`🚀 Call session started for meeting: ${meetingId}`);
        console.log(`📊 Event details:`, {
            callCid: event.call_cid,
            meetingId: meetingId,
            hasCall: !!event.call,
            callId: event.call?.id,
            timestamp: new Date().toISOString()
        });

        if(!meetingId){
            console.error(`❌ No meetingId found in call_cid: ${event.call_cid}`);
            return NextResponse.json({error:"meetingId is not present"},{status:400});
        }
        const [existingMeeting] = await db
            .select()
            .from(meeting)
            .where(eq(meeting.id,meetingId));
        
        if (!existingMeeting){
            console.error(`❌ Meeting not found in database: ${meetingId}`);
            return NextResponse.json({
                error:"Meeting not found"
            },
            {
                status:400
            }
        );
        }
        
        console.log(`📊 Existing meeting status: ${existingMeeting.status}`);
        
        // Only update status if meeting is upcoming (to avoid overwriting active/completed states)
        // But always ensure startedAt is set if it's not already set
        if (existingMeeting.status === "upcoming") {
            await db
                .update(meeting)
                .set({
                    status: "active",
                    startedAt: new Date(),
                })
                .where(eq(meeting.id,existingMeeting.id));
            console.log(`✅ Meeting status updated to active: ${meetingId}`);
        } else if (!existingMeeting.startedAt) {
            // If status is not upcoming but startedAt is not set, set it now
            await db
                .update(meeting)
                .set({
                    startedAt: new Date(),
                })
                .where(eq(meeting.id,existingMeeting.id));
            console.log(`✅ Meeting startedAt set for ${meetingId} (status: ${existingMeeting.status})`);
        } else {
            console.log(`⚠️ Meeting already has status '${existingMeeting.status}' - skipping status update for ${meetingId}`);
        }

        const [existingAgent] = await db
                .select()
                .from(agent)
                .where(eq(agent.id,existingMeeting.agentId));
        
        if (!existingAgent){
            console.error(`❌ Agent not found for meeting: ${meetingId}, agentId: ${existingMeeting.agentId}`);
            return NextResponse.json({
                error:"Agent Associated with the meeting not found"
            },
            {
                status:400
            }
        );
        }
        
        console.log(`✅ Agent found: ${existingAgent.name} (${existingAgent.id})`);

        // Check if agent connection is already in progress for this meeting (deduplication)
        if (isAgentConnectionInProgress(meetingId)) {
            console.log(`⚠️ Agent connection already in progress for meeting ${meetingId} - skipping duplicate webhook`);
            return NextResponse.json({ success: true, message: "Agent connection already in progress" });
        }

        const call = StreamVideo.video.call("default",meetingId);

        // Check if agent is already in the call to prevent duplicates
        const callState = await call.get();
        type CallState = { call?: { participants?: Array<{ user?: { id?: string }; user_id?: string }>; state?: { participants?: Array<{ user?: { id?: string }; user_id?: string }> } } } };
        const state = callState as unknown as CallState;
        const existingParticipants = state?.call?.participants || state?.call?.state?.participants || [];
        const agentAlreadyPresent = existingParticipants.some((p) => p.user?.id === existingAgent.id || p.user_id === existingAgent.id);
        
        if (agentAlreadyPresent) {
            console.log(`⚠️ Agent ${existingAgent.name} (${existingAgent.id}) already present in call ${meetingId} - skipping duplicate connection`);
            console.log(`📊 Participants in call:`, existingParticipants.map((p) => ({ id: p.user?.id || p.user_id, name: p.user?.name })));
            return NextResponse.json({ success: true, message: "Agent already connected" });
        }
        
        // Mark connection as in progress to prevent race conditions
        markAgentConnectionInProgress(meetingId);
        console.log(`✅ Agent not present yet - proceeding with connection`);

        const [meetingOwner] = await db
        .select()
        .from(user) // Adjust to your users table name
        .where(eq(user.id, existingMeeting.userId));

         // Skip time limit for unrestricted emails
         if (!meetingOwner?.email || !UNRESTRICTED_EMAILS.includes(meetingOwner.email)) {
            await call.update({
                settings_override: {
                    limits: {
                        max_duration_seconds: 600
                    }
                }
            });
            console.log(`⏱️ Time limit set to 10 minutes for meeting ${meetingId}`);
        }

            console.log(`🔗 Connecting OpenAI Realtime client...`);
            console.log(`📊 Pre-connection diagnostics:`, {
                agentId: existingAgent.id,
                agentName: existingAgent.name,
                hasInstructions: !!existingAgent.instructions,
                instructionsLength: existingAgent.instructions?.length || 0,
                openAiKeyPresent: !!process.env.OPENAI_API_KEY,
                openAiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
                meetingId: meetingId,
                callId: call.id,
                sdkVersion: '0.7.17',
                timestamp: new Date().toISOString()
            });
        
        // Type for Stream Video client with OpenAI methods
        type VideoClient = { connectToOpenAIRealtime?: unknown; connectOpenAi?: unknown };
        
        let realtimeClient;
        try {
            console.log(`🔄 Step 1: Validating OpenAI API key...`);
            if (!process.env.OPENAI_API_KEY) {
                throw new Error('OPENAI_API_KEY environment variable is not set');
            }
            console.log(`✅ OpenAI API key validation passed`);

            console.log(`🔄 Step 2: Checking Stream.io SDK methods...`);
            const availableMethods = Object.getOwnPropertyNames(StreamVideo.video).filter(name => 
                name.includes('connect') || name.includes('OpenAi') || name.includes('openai') || name.includes('Realtime')
            );
            console.log(`📋 Available OpenAI methods:`, availableMethods);
            
            // Check for both new and old method names for backward compatibility
            // Use dynamic property access to avoid TypeScript errors with new SDK versions
            const videoClient = StreamVideo.video as unknown as VideoClient;
            const hasNewMethod = typeof videoClient.connectToOpenAIRealtime === 'function';
            const hasOldMethod = typeof videoClient.connectOpenAi === 'function';
            
            if (!hasNewMethod && !hasOldMethod) {
                throw new Error(`No OpenAI Realtime connector found. Available methods: ${availableMethods.join(', ')}`);
            }
            console.log(`✅ OpenAI Realtime connector method found (new: ${hasNewMethod}, old: ${hasOldMethod})`);

            console.log(`🔄 Step 3: Attempting OpenAI connection...`);
            // Use new API if available, fallback to old API for backward compatibility
            if (hasNewMethod) {
                realtimeClient = await videoClient.connectToOpenAIRealtime({
                    call,
                    openAiApiKey: process.env.OPENAI_API_KEY!,
                    agentUserId: existingAgent.id,
                    model: "gpt-4o-realtime-preview-2024-12-17",
                });
            } else if (hasOldMethod) {
                realtimeClient = await videoClient.connectOpenAi({
                    call,
                    openAiApiKey: process.env.OPENAI_API_KEY!,
                    agentUserId: existingAgent.id,
                    model: "gpt-4o-realtime-preview-2024-12-17",
                });
            } else {
                throw new Error("No valid OpenAI Realtime connector found in Stream SDK");
            }
            
            console.log(`✅ OpenAI Realtime client connected successfully`);
            console.log(`📊 Connection details:`, {
                clientType: typeof realtimeClient,
                hasUpdateSession: typeof realtimeClient.updateSession === 'function',
                hasOn: typeof realtimeClient.on === 'function',
                hasSendMessage: typeof realtimeClient.sendUserMessageContent === 'function'
            });
            
            console.log(`🔄 Step 4: Updating agent session with instructions...`);
            try {
                // Small delay to ensure connection is fully established
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Enhance instructions to ensure agent introduces itself
                const enhancedInstructions = `You are ${existingAgent.name}. 

IMPORTANT: When a participant joins the call, you should immediately introduce yourself in a friendly and welcoming manner. Briefly explain who you are and how you can help them.

Your role and behavior guidelines:
${existingAgent.instructions}

Remember to introduce yourself when someone joins the call, and be proactive in engaging with participants.`;

                console.log(`📝 Setting instructions (length: ${enhancedInstructions.length} chars)`);
                console.log(`📝 Instructions preview: ${enhancedInstructions.substring(0, 200)}...`);
                
                await realtimeClient.updateSession({
                    instructions: enhancedInstructions
                });
                
                console.log('✅ Session updated successfully with instructions');
                console.log(`📊 Agent ${existingAgent.name} is ready with instructions`);
            } catch (sessionError) {
                console.error('❌ Error updating session:', sessionError);
                console.error('Session error details:', {
                    error: sessionError instanceof Error ? sessionError.message : String(sessionError),
                    stack: sessionError instanceof Error ? sessionError.stack : undefined,
                    instructions: existingAgent.instructions?.substring(0, 100) + '...',
                    instructionsLength: existingAgent.instructions?.length || 0
                });
                // Don't throw - agent is connected but session update failed
                // However, this is critical, so log it prominently
                console.error('⚠️ WARNING: Agent instructions were NOT set. Agent may not behave correctly.');
            }
            
            console.log(`📊 Agent ${existingAgent.name} (${existingAgent.id}) is now active in the call`);
            
        } catch (connectionError) {
            console.error(`❌ Failed to connect OpenAI Realtime client:`, connectionError);
            console.error('🔍 Detailed error analysis:', {
                errorType: connectionError instanceof Error ? connectionError.constructor.name : typeof connectionError,
                errorMessage: connectionError instanceof Error ? connectionError.message : String(connectionError),
                errorStack: connectionError instanceof Error ? connectionError.stack : undefined,
                agentId: existingAgent.id,
                agentName: existingAgent.name,
                meetingId: meetingId,
                callId: call.id,
                openAiKeyPresent: !!process.env.OPENAI_API_KEY,
                openAiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 8) + '...',
                sdkVersion: '0.7.17',
                timestamp: new Date().toISOString(),
                availableMethods: Object.getOwnPropertyNames(StreamVideo.video).filter(name => 
                    name.includes('connect') || name.includes('OpenAi') || name.includes('openai') || name.includes('Realtime')
                ),
                hasNewMethod: typeof (StreamVideo.video as unknown as VideoClient).connectToOpenAIRealtime === 'function',
                hasOldMethod: typeof (StreamVideo.video as unknown as VideoClient).connectOpenAi === 'function'
            });
            
            // Try to provide specific troubleshooting advice
            if (connectionError instanceof Error) {
                if (connectionError.message.includes('API key')) {
                    console.error(`💡 Troubleshooting: Check your OpenAI API key configuration`);
                } else if (connectionError.message.includes('model')) {
                    console.error(`💡 Troubleshooting: Model 'gpt-4o-realtime-preview-2024-12-17' might not be available`);
                } else if (connectionError.message.includes('connectToOpenAIRealtime') || connectionError.message.includes('connectOpenAi')) {
                    console.error(`💡 Troubleshooting: Stream.io SDK version might need upgrade. Try updating @stream-io/node-sdk to latest version`);
                } else {
                    console.error(`💡 Troubleshooting: Check OpenAI service status and network connectivity`);
                }
            }
            
            console.log(`⚠️ OpenAI Realtime integration failed - agent will be available for post-call chat only`);
            // Continue anyway - meeting can still proceed without agent
        }

        
        return NextResponse.json({ success: true });


    }else if (eventType === "call.session_participant_left"){
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];

        console.log(`👤 Participant left meeting: ${meetingId}`);
        console.log(`📊 Participant left event details:`, {
            callCid: event.call_cid,
            meetingId: meetingId,
            participant: event.participant,
            timestamp: new Date().toISOString()
        });

        if(!meetingId){
            console.error(`❌ No meetingId found in participant left event: ${event.call_cid}`);
            return NextResponse.json({
                error:"Meeting not found / participant left"
            },
            {
                status:400
            }
        );
        }
        
        // Update meeting status to processing when participant leaves (same as call.session_ended)
        // This allows transcript processing and summary generation to happen
        try {
            const result = await db
                .update(meeting)
                .set({
                    status: "processing",
                    endedAt: new Date(),
                })
                .where(and(eq(meeting.id, meetingId), eq(meeting.status, "active")))
                .returning();
            
            if (result.length > 0) {
                console.log(`✅ Meeting marked as processing: ${meetingId}`);
                console.log(`📊 Updated meeting:`, {
                    id: result[0].id,
                    status: result[0].status,
                    endedAt: result[0].endedAt
                });
            } else {
                console.log(`⚠️ No active meeting found to update: ${meetingId}`);
            }
        } catch (updateError) {
            console.error(`❌ Failed to update meeting status:`, updateError);
        }

        // End the call
        try {
            const call = StreamVideo.video.call("default",meetingId);
            await call.end();
            console.log(`📞 Call ended for meeting: ${meetingId}`);
        } catch (endError) {
            console.error(`❌ Failed to end call:`, endError);
        }

        return NextResponse.json({success: true});

    }else if (eventType === "call.ended" || eventType === "call.session_ended"){
        const event = payload as CallEndedEvent;
        const meetingId = event.call_cid.split(":")[1];

        if(!meetingId){
            return NextResponse.json({
                error:"Meeting not found / call ended"
            },
            {
                status:400
            }
        );
        }
        
        console.log(`📊 Call ended for meeting: ${meetingId} (eventType: ${eventType})`);
        
        // Update meeting status to processing when call ends
        try {
            const result = await db
                .update(meeting)
                .set({
                    status: "processing",
                    endedAt: new Date(),
                })
                .where(and(eq(meeting.id, meetingId), eq(meeting.status, "active")))
                .returning();
            
            if (result.length > 0) {
                console.log(`✅ Meeting marked as processing: ${meetingId}`);
                console.log(`📊 Updated meeting:`, {
                    id: result[0].id,
                    status: result[0].status,
                    endedAt: result[0].endedAt
                });
            } else {
                console.log(`⚠️ No active meeting found to update: ${meetingId}`);
            }
        } catch (updateError) {
            console.error(`❌ Failed to update meeting status:`, updateError);
        }

        return NextResponse.json({success: true});

    }else if(eventType === "call.transcription_ready"){
        const event = payload as CallTranscriptionReadyEvent;
        const meetingId = event.call_cid.split(":")[1];

        const [updatedMeeting] = await db
        .update(meeting)
            .set({
                transcriptUrl: event.call_transcription.url,
                
            })
            .where(eq(meeting.id,meetingId))
            .returning();


        if (!updatedMeeting){
            return NextResponse.json({
                error:"Meeting not found / not updated"
            },
            {
                status:400
            }
        );
        }
         // call inngest bg job to summarize transcript
         console.log(`🔄 Triggering Inngest job for meeting: ${meetingId}`);
         try {
         if (inngest) {
             await inngest.send({
                name:"meeting/processing",
                data:{
                    meetingId:updatedMeeting.id,
                    transcriptUrl: updatedMeeting.transcriptUrl,
                }
             });
             console.log(`✅ Inngest job triggered successfully for meeting: ${meetingId}`);
         } else {
             console.log(`⚠️ Inngest not configured - skipping background job`);
         }
         } catch (error) {
            console.error(`❌ Failed to trigger Inngest job for meeting ${meetingId}:`, error);
         }

        return NextResponse.json({success: true}); // ← Added return

    }else if(eventType === "call.recording_ready"){
        const event = payload as CallRecordingReadyEvent ;
        const meetingId = event.call_cid.split(":")[1];
        
        await db
            .update(meeting)
            .set({
                recordingUrl:event.call_recording.url,
            })
            .where(eq(meeting.id,meetingId));

        return NextResponse.json({success: true}); // ← Added return
        
    }else if(eventType === "message.new"){
        const event = payload as MessageNewEvent;
    
        const userId = event.user?.id;
        const channelId = event.channel_id;
        const text = event.message?.text;
        const messageId = event.message?.id;
    
        if (!userId || !channelId || !text){
            return NextResponse.json({error:"Missing Chat info not found"},{status:404})
        }

        // Deduplication: Check if we've already processed this message
        if (messageId && hasProcessedMessage(messageId)) {
            console.log(`⚠️ Message ${messageId} already processed - skipping duplicate webhook`);
            return NextResponse.json({success: true, message: "Already processed"});
        }

        // Mark message as processed early to prevent race conditions
        if (messageId) {
            markMessageProcessed(messageId);
        }
    
        const [existingMeeting] = await db
            .select()
            .from(meeting)
            .where(and(eq(meeting.id,channelId), eq(meeting.status,"completed")));
        
        if(!existingMeeting){
            return NextResponse.json({error:"Meeting info not found"},{status:404})
        }
    
        const [existingAgent] = await db
            .select()
            .from(agent)
            .where(eq(agent.id,existingMeeting.agentId))
    
        if (!existingAgent){
            return NextResponse.json({
                error:"Agent Associated with the meeting not found"
            },
            {
                status:404
            });
        }
    
        // Only respond if the message is NOT from the agent
        if(userId !== existingAgent.id){
            console.log(`💬 Processing message from user ${userId} in channel ${channelId}`);
            const instructions = `
                You are an AI assistant helping the user revisit a recently completed meeting.
                Below is a summary of the meeting, generated from the transcript:
                
                ${existingMeeting.summary}
                
                The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
                
                ${existingAgent.instructions}
                
                The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
                Always base your responses on the meeting summary above.
                
                You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
                
                If the summary does not contain enough information to answer a question, politely let the user know.
                
                Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
            `;
            
            const channel = streamChat.channel("messaging", channelId);
            await channel.watch();
    
            const previousMessages = channel.state.messages.slice(-5)
                .filter((msg)=> msg.text && msg.text.trim() !== "")
                .map<ChatCompletionMessageParam>((message)=>({
                    role: message.user?.id === existingAgent.id ? "assistant" : "user",
                    content: message.text || "",
                }));
    
            const resp = await openAiClient.chat.completions.create({
                messages: [
                    {role:"system", content:instructions},
                    ...previousMessages,
                    {role:"user", content: text},
                ],
                model: "gpt-4o"
            })
    
            const respText = resp.choices[0].message.content;
    
            if(!respText){
                return NextResponse.json({error:"GPT message not found"},{status:400})
            }
    
            const avatarUrl = generateAvatarURI({
                seed: existingAgent.name, 
                variant:"botttsNeutral"
            })
    
            await streamChat.upsertUser({
                id:existingAgent.id,
                name:existingAgent.name,
                image:avatarUrl,
            });

            console.log(`📤 Sending agent response for message ${messageId}`);
            await channel.sendMessage({
                text:respText,
                user:{
                    id:existingAgent.id,
                    name:existingAgent.name,
                    image:avatarUrl,
                },
            });
            console.log(`✅ Agent response sent successfully for message ${messageId}`);
        } else {
            console.log(`⚠️ Message from agent ${userId} - skipping response`);
        }
        
        return NextResponse.json({success: true});
    }

    // ← Added final fallback return for unknown event types
    return NextResponse.json({success: true});
}