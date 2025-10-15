import { DefaultVideoPlaceholder, StreamVideoParticipant,ToggleAudioPreviewButton,ToggleVideoPreviewButton,VideoPreview,useCallStateHooks, useCall} from "@stream-io/video-react-sdk";
import { LogInIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { generateAvatarURI } from "@/lib/avatar";
import { useState } from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import Link from "next/link";

interface Props{
    onJoin : ()=> void;
}

const DisabledVideoPreview = () => {
    const { data } = authClient.useSession();
  
    return (
      <DefaultVideoPlaceholder
        participant={{
          name: data?.user.name ?? "",
          image:
            data?.user.image ??
            generateAvatarURI({
              seed: data?.user.name ?? "",
              variant: "initials",
            }),
        } as StreamVideoParticipant}
      />
    );
  };

const AllowBrowserPermission = () =>{
    return (<p className="text-sm text-blue-200">
        Please grant your browser permission to your camera and microphone.
    </p>);

}

export const CallLobby = ({onJoin}:Props) =>{
    const {useCameraState, useMicrophoneState} = useCallStateHooks();
    const call = useCall();
    const [isJoining, setIsJoining] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const {hasBrowserPermission: hasMicPermission} = useMicrophoneState();
    const {hasBrowserPermission: hasCameraPermission} = useCameraState();

    const hasBrowserMediaPermission = hasMicPermission && hasCameraPermission;

    // Handle joining the call with proper permission handling
    const handleJoin = async () => {
        if (!call || isJoining) return;
        
        setIsJoining(true);
        setPermissionError(null);
        
        try {
            // Request all media permissions
            await requestMediaPermissions();
            
            // Join the call
            await call.join();
            onJoin();
        } catch (error) {
            console.error('Failed to join call:', error);
            setPermissionError('Failed to join call. Please check your permissions and try again.');
        } finally {
            setIsJoining(false);
        }
    };

    // Request camera and microphone permissions using browser API
    const requestMediaPermissions = async () => {
        try {
            // Always request both video and audio permissions to ensure they're properly granted
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Immediately stop the stream since we just wanted to request permissions
            stream.getTracks().forEach(track => track.stop());
            console.log('Media permissions granted');
            
            // Small delay to ensure permissions are fully processed
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (permissionError) {
            console.warn('Permission request failed:', permissionError);
            // Continue anyway - user might have granted permissions manually
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
            <div className="py-4 px-8 items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-y-6 bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-xl border border-blue-600/30">
                    <div className="flex flex-col gap-y-2 text-center">
                        <h6 className="text-lg font-medium text-white"> Ready to join mate?</h6>
                        <p className="text-sm text-blue-200"> Call setup before you join</p>

                    </div>
                    <VideoPreview DisabledVideoPreview={hasBrowserMediaPermission ? DisabledVideoPreview : AllowBrowserPermission}/>
                    <div className="flex gap-x-2">
                        <ToggleAudioPreviewButton/>
                        <ToggleVideoPreviewButton/>
                    </div>
                    
                    {permissionError && (
                        <div className="text-red-400 text-sm text-center p-2 bg-red-900/20 rounded border border-red-600/30">
                            {permissionError}
                        </div>
                    )}
                    
                    <div className="flex gap-x-2 justify-between w-full">
                        <Button asChild variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-600/20">
                            <Link href="/dashboard/meetings">Cancel</Link>
                        </Button>
                        <Button 
                            onClick={handleJoin} 
                            disabled={isJoining}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50"
                        >
                            <LogInIcon className={isJoining ? "animate-spin" : ""}/>
                            {isJoining ? "Joining..." : "Join Call"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

}