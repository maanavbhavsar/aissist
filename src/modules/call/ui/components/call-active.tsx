import Link from "next/link";
import Image from "next/image";
import { SpeakerLayout, useCallStateHooks, useCall, ToggleVideoButton, ToggleAudioButton } from "@stream-io/video-react-sdk";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";

interface Props {
    onLeave: () => void;
    meetingName: string;
}

export const CallActive = ({onLeave,meetingName}:Props) =>{
    const { useMicrophoneState, useCameraState } = useCallStateHooks();
    const micState = useMicrophoneState();
    const cameraState = useCameraState();
    const call = useCall();
    const [audioLevel, setAudioLevel] = useState(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    
    useEffect(() => {
        if (!call || !micState.isEnabled || micState.isMute) {
            setAudioLevel(0);
            return;
        }
        
        const setupAudioAnalyser = async () => {
            try {
                // Get the microphone stream from browser
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                
                audioContextRef.current = audioContext;
                analyserRef.current = analyser;
                
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                
                const updateLevel = () => {
                    if (!analyserRef.current) return;
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                    setAudioLevel(Math.min(average / 100, 1)); // Normalize to 0-1
                    requestAnimationFrame(updateLevel);
                };
                
                updateLevel();
            } catch (error) {
                console.warn('Could not setup audio analyser:', error);
            }
        };
        
        setupAudioAnalyser();
        
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            analyserRef.current = null;
            audioContextRef.current = null;
            streamRef.current = null;
        };
    }, [call, micState.isEnabled, micState.isMute]);
    
    // Generate heights for the three bars based on audio level
    const getBarHeight = (index: number) => {
        const heights = [
            Math.max(0.3, audioLevel * 0.5),
            Math.max(0.4, audioLevel * 0.8),
            Math.max(0.5, audioLevel)
        ];
        return heights[index] * 100;
    };
    
    return (
        <div className=" flex flex-col justify-between p-4 h-full text-white bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
            <div className="rounded-full p-6 flex items-center gap-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                <Link href="/" className="flex items-center justify-center p-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full w-fit shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all duration-300">
                    <Image src="/aissist_colored_only.png" alt="AISSIST" width={25} height={25} style={{width: "auto", height: "auto"}} className="logo-glow-subtle" />
                </Link>
                <h4 className="text-base text-white font-medium">
                    {meetingName}
                </h4>
                {/* Microphone status indicator */}
                {micState.isMute && (
                    <div className="flex items-center gap-2 text-red-400">
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                        <span className="text-xs">Mic Muted</span>
                    </div>
                )}
                {!micState.isEnabled && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span className="text-xs">Mic Disabled</span>
                    </div>
                )}
                {/* Camera status indicator */}
                {!cameraState.isEnabled && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <span className="text-xs">Camera Off</span>
                    </div>
                )}
            </div>

            <SpeakerLayout/>
            
                    <div className=" rounded-full px-4 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
                <div className="debug-call-controls" style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {micState.isEnabled && !micState.isMute && (
                        <div className="flex items-end gap-1 px-2" style={{ height: '20px' }}>
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className="bg-blue-400 rounded-sm transition-all duration-75"
                                    style={{
                                        width: '3px',
                                        height: `${getBarHeight(index)}%`,
                                        minHeight: '4px',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    {/* Explicit video and audio toggle buttons - always visible */}
                    <div className="flex items-center gap-2">
                        <ToggleVideoButton />
                        <ToggleAudioButton />
                    </div>
                    {/* Leave button */}
                    <Button
                        onClick={onLeave}
                        variant="destructive"
                        size="icon"
                        className="rounded-full"
                        aria-label="Leave call"
                    >
                        <PhoneOff className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}