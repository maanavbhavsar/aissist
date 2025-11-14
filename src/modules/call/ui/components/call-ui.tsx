import { StreamTheme, useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";

interface Props {
  meetingName: string;
}

export const CallUI = ({ meetingName }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");

  const { useCallEndedAt, useMicrophoneState, useCameraState } = useCallStateHooks();
  const callEndedAt = useCallEndedAt();
  const micState = useMicrophoneState();
  const cameraState = useCameraState();

  const handleJoin = async () => {
    if (!call) return;
    console.log(`🔄 Transitioning from lobby to active call`);
    
    try {
      await call.join();
      console.log(`✅ Successfully joined call`);
      
      // Wait a bit for call to fully initialize before enabling media
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enable camera and microphone if we have browser permissions
      // Check permissions using Stream SDK hooks which are more reliable
      try {
        // Only enable video if we have browser permission
        if (cameraState.hasBrowserPermission && cameraState.status !== 'disabled') {
          try {
            console.log('🎥 Enabling video...');
            await call.camera.enable();
            console.log('✅ Video enabled successfully');
          } catch (videoError: unknown) {
            const errorMessage = videoError instanceof Error ? videoError.message : String(videoError);
            console.warn('⚠️ Could not enable video:', errorMessage);
            // Video might not be allowed by call settings - that's okay
          }
        } else {
          console.log('⚠️ Skipping video enable - no browser permission or disabled');
        }
        
        // Enable microphone if we have browser permission
        if (micState.hasBrowserPermission) {
          try {
            console.log('🎤 Enabling audio...');
            await call.microphone.enable();
            console.log('✅ Audio enabled successfully');
          } catch (audioError: unknown) {
            const errorMessage = audioError instanceof Error ? audioError.message : String(audioError);
            console.warn('⚠️ Could not enable audio:', errorMessage);
          }
        } else {
          console.log('⚠️ Skipping audio enable - no browser permission');
        }
        
        // Log final state after a delay
        setTimeout(() => {
          console.log('📊 Final media state:', {
            video: {
              enabled: cameraState.isEnabled,
              hasBrowserPermission: cameraState.hasBrowserPermission,
              status: cameraState.status,
            },
            audio: {
              enabled: micState.isEnabled,
              mute: micState.isMute,
              hasBrowserPermission: micState.hasBrowserPermission,
              status: micState.status,
            },
          });
        }, 1000);
      } catch (mediaError) {
        console.warn('⚠️ Error during media setup:', mediaError);
        // Don't block the join if media fails - user can manually enable later via UI
      }
      
      setShow("call");
    } catch (error) {
      console.error(`❌ Failed to join call:`, error);
      // Show error to user - you might want to add a toast notification here
      alert('Failed to join call. Please try again.');
    }
  };

  const handleLeave = async () => {
    if (!call) return;
    console.log(`👋 User initiated leave - ending call`);
    console.log(`📊 Call details before ending:`, {
      callId: call.id,
      callState: call.state,
      participants: call.state.participants?.length || 0
    });
    
    try {
      await call.endCall();
      console.log(`✅ Call ended successfully`);
      setShow("ended");
    } catch (error) {
      console.error(`❌ Error ending call:`, error);
      // Still show ended screen even if there's an error
      setShow("ended");
    }
  };

  // 🔥 Automatically detect if Stream ends the call (time limit, user disconnect, etc.)
  useEffect(() => {
    if (callEndedAt && show === "call") {
      console.log('📊 Call ended at:', callEndedAt);
      console.log('📊 Current show state:', show);
      console.log('🔔 Stream detected call ended - switching to ended screen');
      setShow("ended");
    }
  }, [callEndedAt, show]);

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} />}
      {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} />}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};