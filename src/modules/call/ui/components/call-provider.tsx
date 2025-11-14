"use client";

import Image from "next/image";
import { authClient } from "@/lib/auth-client";

import { generateAvatarURI } from "@/lib/avatar";
import { CallConnect } from "./call-connect";


interface Props {
    meetingId: string;
    meetingName:string;
}
export const CallProvider = ({meetingId,meetingName}:Props) =>{
    const {data,isPending} = authClient.useSession();

    if(! data || isPending){
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
    return ( <CallConnect meetingId={meetingId} meetingName={meetingName} userName={data.user.name}
         userImage={data.user.image?? generateAvatarURI({seed: data.user.name, variant:"initials"})}
         userId={data.user.id}
         />);
}