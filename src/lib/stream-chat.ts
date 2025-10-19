import serverOnly from 'server-only'
serverOnly()

import { StreamChat } from 'stream-chat'

export const streamChatClient = new StreamChat(process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!, {
  // if you prefer, use secret on server-only code paths
})

// Export as streamChat for backward compatibility with webhook
export const streamChat = streamChatClient
