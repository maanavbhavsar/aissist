import {Call,CallingState, StreamCall,StreamVideo,StreamVideoClient} from "@stream-io/video-react-sdk"
import Image from "next/image";
import { useCallback, useMemo, useRef } from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { CallUI } from "./call-ui";

interface Props {
    meetingId: string;
    meetingName:string;
    userName:string;
    userId: string;
    userImage: string;
};

export const CallConnect = ({
    meetingId,
    meetingName,
    userName,
    userId,
    userImage,
}:Props) => {
    
    // Memoize the token provider function to prevent recreation on every render
    const tokenProvider = useCallback(async () => {
        try {
            const response = await fetch('/api/trpc/meetings.generateToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            return data.result.data;
        } catch (error) {
            console.error(`❌ Token request failed:`, error);
            throw error;
        }
    }, [userId]);

    // Memoize user object to prevent recreation on every render
    const user = useMemo(() => ({
        id: userId,
        name: userName,
        image: userImage,
    }), [userId, userName, userImage]);

    // Use getOrCreateInstance to prevent duplicate client instances
    const client = useMemo(() => {
        return StreamVideoClient.getOrCreateInstance({
            apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
            user,
            tokenProvider,
        });
    }, [user, tokenProvider]);

    // Store call reference for cleanup
    const callRef = useRef<Call | undefined>(undefined);

    // Memoize the call to prevent recreation unless meetingId changes
    const call = useMemo(() => {
        if (!client) return undefined;
        
        console.log(`🔄 Creating call for meeting: ${meetingId}`);
        const _call = client.call("default", meetingId);
        callRef.current = _call;
        
        console.log(`✅ Call created with ID: ${_call.id}`);
        
        // Add a small delay to ensure the server-side call is fully created
        setTimeout(async () => {
            try {
                const callState = await _call.get();
                console.log(`📊 Call state after creation:`, {
                    id: callState?.call?.id,
                    participants: (callState as any)?.call?.participants?.length || 0,
                    state: (callState as any)?.call?.state
                });
            } catch (error) {
                console.warn(`⚠️ Could not fetch call state:`, error);
                console.log(`📝 Call may still be initializing on server`);
            }
        }, 1000);
        
        return _call;
    }, [client, meetingId]);

    if(!client || !call){
        return (
            <div className="flex h-screen justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
                <div className="flex flex-col items-center gap-4">
                    <Image 
                        src="/Science.png" 
                        alt="Loading" 
                        width={64} 
                        height={64}
                        className="animate-spin-slow"
                        style={{ animationDuration: '3s' }}
                    />
                    <p className="text-xl font-medium bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Loading...</p>
                </div>
            </div>

        );

    }


    return (<StreamVideo client={client}>
        <StreamCall call={call}>
                <CallUI meetingName={meetingName}/>
            </StreamCall>
        </StreamVideo>);
}
