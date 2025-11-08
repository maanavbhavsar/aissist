"use client";

import { LoaderIcon } from "lucide-react";

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
                    <LoaderIcon className="size-8 animate-spin text-cyan-400"/>
                    <p className="text-cyan-200 text-sm">Loading session...</p>
                </div>
            </div>

        );
    }
    return ( <CallConnect meetingId={meetingId} meetingName={meetingName} userName={data.user.name}
         userImage={data.user.image?? generateAvatarURI({seed: data.user.name, variant:"initials"})}
         userId={data.user.id}
         />);
}