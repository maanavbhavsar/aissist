'use client'

import React from 'react'
import { authClient } from '@/lib/auth-client'
import LoadingState from '@/components/loading-state'
import ChatUI from '@/modules/meetings/ui/components/chat-ui'

export default function ChatProvider({ meetingId, meetingName }: { meetingId: string; meetingName: string }) {
  const { data, isPending } = authClient.useSession()

  if (!data || isPending) {
    return <LoadingState title="Loading chat..." />
  }

  return (
    <ChatUI
      meetingId={meetingId}
      meetingName={meetingName}
      userId={data.user.id}
      username={data.user.name}
      userImage={data.user.image ?? undefined}
    />
  )
}
