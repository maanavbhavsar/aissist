import {Call,CallingState, StreamCall,StreamVideo,StreamVideoClient} from "@stream-io/video-react-sdk"
import { LoaderIcon } from "lucide-react";
import { useEffect, useCallback, useMemo, useRef } from "react";
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
        const response = await fetch('/api/trpc/meetings.generateToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data.result.data;
    }, []);

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
        
        const _call = client.call("default", meetingId);
        // Don't disable camera/microphone here - let the lobby handle permissions
        callRef.current = _call;
        
        // Note: Call settings are configured at the client level or through the Stream dashboard
        
        return _call;
    }, [client, meetingId]);

    // Cleanup effect for the call - only run on component unmount
    useEffect(() => {
        return () => {
            const currentCall = callRef.current;
            if (currentCall && currentCall.state.callingState !== CallingState.LEFT) {
                currentCall.leave();
                currentCall.endCall();
            }
        };
    }, []); // Empty dependency array - only run on unmount

    if(!client || !call){
        return (
            <div className="flex h-screen justify-center items-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
                <div className="flex flex-col items-center gap-4">
                    <LoaderIcon className="size-8 animate-spin text-blue-400"/>
                    <p className="text-blue-200 text-sm">Connecting to call...</p>
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
