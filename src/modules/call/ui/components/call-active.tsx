import Link from "next/link";
import Image from "next/image";
import { SpeakerLayout, useCallStateHooks, CallControls } from "@stream-io/video-react-sdk";

interface Props {
    onLeave: () => void;
    meetingName: string;
}

export const CallActive = ({onLeave,meetingName}:Props) =>{
    const { useMicrophoneState, useCameraState } = useCallStateHooks();
    const micState = useMicrophoneState();
    const cameraState = useCameraState();

    return (
        <div className=" flex flex-col justify-between p-4 h-full text-white bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative z-10">
            <div className="rounded-full p-3 sm:p-6 flex items-center gap-2 sm:gap-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-cyan-500/30 shadow-lg shadow-cyan-500/10 flex-wrap">
                <Link href="/" className="flex items-center justify-center p-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full w-fit shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300 flex-shrink-0">
                    <Image src="/Aissist Logo.png" alt="AISSIST" width={30} height={30} style={{width: "auto", height: "22px", objectFit: "contain", maxWidth: "none"}} className="logo-glow-subtle" />
                </Link>
                <h4 className="text-sm sm:text-base text-white font-medium truncate flex-1 min-w-0">
                    {meetingName}
                </h4>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Microphone status indicator */}
                    {micState.isMute && (
                        <div className="flex items-center gap-1 sm:gap-2 text-red-400">
                            <div className="w-2 h-2 bg-red-400 rounded-full" />
                            <span className="text-xs hidden sm:inline">Mic Muted</span>
                        </div>
                    )}
                    {/* Camera status indicator */}
                    {!cameraState.isEnabled && (
                        <div className="flex items-center gap-1 sm:gap-2 text-yellow-400">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                            <span className="text-xs hidden sm:inline">Camera Off</span>
                        </div>
                    )}
                </div>
            </div>

            <SpeakerLayout/>
            
                    <div className=" rounded-full px-4 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                <div className="debug-call-controls" style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* CallControls handles video/audio toggles, screenshare, emoji reactions, and leave button */}
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </div>
    );
}