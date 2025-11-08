import 'server-only';
import { StreamClient } from '@stream-io/node-sdk';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY) {
  throw new Error('NEXT_PUBLIC_STREAM_VIDEO_API_KEY is required');
}
if (!process.env.STREAM_VIDEO_SECRET_KEY) {
  throw new Error('STREAM_VIDEO_SECRET_KEY is required');
}

export const streamVideo = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
  process.env.STREAM_VIDEO_SECRET_KEY
);

// Export the instance as StreamVideo for compatibility
export const StreamVideo = streamVideo;

// Only log once to avoid spam
declare global {
  var streamVideoInitialized: boolean | undefined;
}

if (!globalThis.streamVideoInitialized) {
  console.log('✅ Stream Video client initialized with API key:', process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY?.substring(0, 8) + '...');
  globalThis.streamVideoInitialized = true;
}
