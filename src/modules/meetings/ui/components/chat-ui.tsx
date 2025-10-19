'use client'

import React, { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  Thread,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/index.css'
import { trpc } from '@/trpc/client'

interface ChatUIProps {
  meetingId: string
  meetingName: string
  userId: string
  username: string
  userImage?: string
}

export default function ChatUI({ meetingId, meetingName, userId, username, userImage }: ChatUIProps) {
  const [client, setClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<any>(null)
  const generateChatToken = trpc.meetings.generateChatToken.useMutation()

  useEffect(() => {
    let mounted = true
    async function init() {
      const token = await generateChatToken.mutateAsync()
      if (!mounted) return
      const c = new StreamChat(process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!)
      await c.connectUser({ id: userId, name: username, image: userImage ?? '' }, token)
      setClient(c)
      const ch = c.channel('messaging', meetingId, {
        members: [userId],
        // optional: add extra metadata
      })
      await ch.watch()
      setChannel(ch)
    }
    init()
    return () => {
      mounted = false
      if (client) client.disconnectUser().catch(() => {})
    }
  }, [userId, username, userImage, generateChatToken])

  if (!client || !channel) {
    return <div className="p-4">Loading chat...</div>
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Chat client={client}>
        <Channel channel={channel}>
          <Window>
            <div style={{ height: '60vh', overflow: 'auto' }}>
              <MessageList />
            </div>
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}
