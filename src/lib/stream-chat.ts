import 'server-only'

import { StreamChat } from 'stream-chat'

// Validate environment variables
const apiKey = process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY
const secretKey = process.env.STREAM_CHAT_SECRET_KEY

if (!apiKey) {
  throw new Error('NEXT_PUBLIC_STREAM_CHAT_API_KEY is required');
}

if (!secretKey) {
  console.warn('⚠️ STREAM_CHAT_SECRET_KEY is not set. Chat token generation will fail.');
  console.warn('⚠️ Available env vars:', Object.keys(process.env).filter(k => k.includes('STREAM')));
}

// Initialize Stream Chat client with secret key
// The second parameter should be the secret key string directly
export const streamChatClient = new StreamChat(apiKey, secretKey || undefined)

// Verify initialization
if (secretKey) {
  console.log('✅ Stream Chat client initialized with secret key');
} else {
  console.warn('⚠️ Stream Chat client initialized WITHOUT secret key');
}

// Export as streamChat for backward compatibility with webhook
export const streamChat = streamChatClient
