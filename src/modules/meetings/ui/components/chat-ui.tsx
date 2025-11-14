'use client'

import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useEffect, useState } from "react";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { useCreateChatClient } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { MessageSquare } from "lucide-react";
import "stream-chat-react/dist/css/v2/index.css";
import { useMutation } from "@tanstack/react-query";

interface ChatUIProps {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string | undefined;
}

export const ChatUI = ({
    meetingId,
    meetingName,
    userId,
    userName,
    userImage
}: ChatUIProps) => {

    const trpc = useTRPC();
    const generateChatToken = useMutation(trpc.meetings.generateChatToken.mutationOptions());

    const [channel, setChannel] = useState<StreamChannel>();

    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
        tokenOrProvider: generateChatToken.mutateAsync,
        userData: {
            id: userId,
            name: userName,
            image: userImage
        }
    });

    useEffect(() => {
        if (!client) return;

        const channel = client.channel("messaging", meetingId, {
            members: [userId],
        });

        setChannel(channel);
    }, [client, meetingId, meetingName, userId]);

    if (!client) {
        return (
            <LoadingState title="Loading Chat.." description="This may take many seconds" />
        );
    }

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-600">
                        Chat
                    </h3>
                </div>
            </div>

            {/* Chat */}
            <div className="flex-1 rounded-lg bg-zinc-800/40 border border-zinc-700/30 overflow-hidden">
                <Chat client={client} theme="str-chat__theme-dark">
                    <Channel channel={channel}>
                        <Window>
                            <MessageList />
                            <MessageInput />
                        </Window>
                        <Thread />
                    </Channel>
                </Chat>
            </div>

            {/* Minimal custom styles */}
            <style jsx global>{`
                .str-chat__container {
                    background: transparent !important;
                }
                
                .str-chat__message-simple {
                    background: rgba(39, 39, 42, 0.4) !important;
                    border-radius: 0.5rem !important;
                }
                
                .str-chat__message-sender-name {
                    color: rgb(34, 211, 238) !important;
                }
                
                .str-chat__input-flat {
                    background: rgba(39, 39, 42, 0.6) !important;
                    border: 1px solid rgba(113, 113, 122, 0.4) !important;
                    border-radius: 0.5rem !important;
                }
                
                .str-chat__input-flat:focus-within {
                    border-color: rgba(6, 182, 212, 0.5) !important;
                }
            `}</style>
        </div>
    );
};
