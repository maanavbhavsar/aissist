import Link from "next/link";

import Image from "next/image";
import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
interface Props {
    onLeave: () => void;
    meetingName: string;
}


export const CallActive = ({onLeave,meetingName}:Props) =>{
    return (
        <div className="relative flex flex-col justify-between p-4 h-full text-white bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
            <div className="rounded-full p-6 flex items-center gap-5 bg-gray-800/90 backdrop-blur-sm border border-blue-600/30">
                <Link href="/" className="flex items-center justify-center p-1 bg-blue-600 rounded-full w-fit shadow-lg">
                    <Image src="/aissist_colored_only.png" alt="AISSIST" width={25} height={25} style={{width: "auto", height: "auto"}}/>
                </Link>
                <h4 className="text-base text-white font-medium">
                    {meetingName}
                </h4>
            </div>

            <SpeakerLayout/>
            
            <div className="rounded-full px-4 bg-gray-800/90 backdrop-blur-sm border border-blue-600/30 shadow-xl">
                <CallControls onLeave={onLeave}/>
            </div>
        </div>
    );
}