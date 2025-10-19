import { and, eq, not} from "drizzle-orm";
import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";
import {
    CallEndedEvent,
    CallSessionParticipantLeftEvent,
    CallSessionStartedEvent,
    CallRecordingReadyEvent,
    CallTranscriptionReadyEvent,
} from "@stream-io/node-sdk";

import { db } from "@/db";
import{ agent, meeting} from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";

function verifySignatureWithSDK(body: string, signature: string): boolean {
    return streamVideo.verifyWebhook(body, signature);
};

export async function POST(request: NextRequest) {
    const signature = request.headers.get("x-signature");
    const apiKey = request.headers.get("x-api-key");

    if (!signature || !apiKey) {
        return NextResponse.json({ error: "Missing signature or api key" }, { status: 401 });
    }

    const body = await request.text();

    if (!verifySignatureWithSDK(body, signature)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;    
    try {
        payload = JSON.parse(body) as Record<string, unknown>;
    } catch (error) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const eventType = (payload as Record<string, unknown>)?.type;

    if (eventType === "call.session_started") {
        const event = payload as CallSessionStartedEvent;
        const meetingID = event.call.custom?.meetingID;

        if (!meetingID) {
            return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
        }

        const [existingMeeting] =await db.select().from(meeting).where(and(eq(meeting.id, meetingID), not(eq(meeting.status, "completed")), not(eq(meeting.status, "active")), not(eq(meeting.status, "cancelled")), not(eq(meeting.status, "processing"))));
    
        if (!existingMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        const [agentData] = await db.select().from(agent).where(eq(agent.id, existingMeeting.agentId));
        
        if (!agentData) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        await db.update(meeting).set({
            status: "active",
            startedAt: new Date(),
        }).where(eq(meeting.id, existingMeeting.id));

        const call = streamVideo.video.call("default", meetingID);
        const realtimeClient = streamVideo.video.connectOpenAi({
            call,
            openAiApiKey: process.env.OPENAI_API_KEY!,
            agentUserId: existingMeeting.agentId,
        });

        (await realtimeClient).updateSession({
            instructions: agentData.instructions,
        })
    }

    else if (eventType === "call.session_ended") {
        const event = payload as CallEndedEvent;
        const meetingID = event.call.custom?.meetingID;

        if (!meetingID) {
            return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
        }

        const [updatedMeeting] = await db.update(meeting).set({
            status: "processing",
            endedAt: new Date(),
        }).where(and(eq(meeting.id, meetingID), eq(meeting.status, "active"))).returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }
    }

    else if (eventType === "call.transcription_ready") {
        const event = payload as CallTranscriptionReadyEvent;
        const meetingID = event.call_cid.split(":")[1];

        if (!meetingID) {
            return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
        }

        const [updatedMeeting] = await db.update(meeting).set({
            transcriptUrl: event.call_transcription.url,
        }).where(eq(meeting.id, meetingID)).returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }

        await inngest.send({
            name: "meetings/processing",
            data: {
                meetingId: updatedMeeting.id,
                transcriptUrl: updatedMeeting.transcriptUrl,
            },
        });
    }

    else if (eventType === "call.recording_ready") {
        const event = payload as CallRecordingReadyEvent;
        const meetingID = event.call_cid.split(":")[1];

        if (!meetingID) {
            return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
        }

        const [updatedMeeting] = await db.update(meeting).set({
            recordingUrl: event.call_recording.url,
        }).where(eq(meeting.id, meetingID)).returning();

        if (!updatedMeeting) {
            return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
        }
    }

    else if (eventType === "call.session_participant_left") {
        const event = payload as CallSessionParticipantLeftEvent;
        const meetingId = event.call_cid.split(":")[1];

        if (!meetingId) {
            return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
        }

        const call = streamVideo.video.call("default", meetingId);
        await call.end();
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}