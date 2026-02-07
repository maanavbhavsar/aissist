import 'server-only';
import { StreamClient } from '@stream-io/node-sdk';

// Permissions required for users to join and use calls (Stream error code 17)
const REQUIRED_USER_PERMISSIONS = [
  'read-call',
  'join-call',
  'create-call',
  'send-audio',
  'send-video',
  'mute-users',
  'update-call',
  'end-call',
  'screenshare',
  'update-call-settings',
] as const;

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

let callTypePermissionsEnsured = false;

/**
 * Ensures the default call type grants the user role permissions to join and read calls.
 * Fixes Stream error: "User with role 'user' is not allowed to perform action JoinCall/ReadCall"
 * Runs once per process to avoid repeated API calls.
 */
export async function ensureCallTypePermissions(): Promise<void> {
  if (callTypePermissionsEnsured) return;
  callTypePermissionsEnsured = true; // Claim immediately to prevent concurrent execution

  try {
    const callType = await streamVideo.video.getCallType({ name: 'default' });
    const userGrants = callType.grants?.user ?? [];
    const missingPermissions = REQUIRED_USER_PERMISSIONS.filter(
      (p) => !userGrants.includes(p)
    );

    if (missingPermissions.length > 0) {
      const mergedUserGrants = [...new Set([...userGrants, ...missingPermissions])];
      await streamVideo.video.updateCallType({
        name: 'default',
        grants: {
          ...callType.grants,
          user: mergedUserGrants,
        },
      });
      console.log(
        `✅ Updated default call type: added permissions for user role:`,
        missingPermissions.join(', ')
      );
    }
  } catch (error) {
    console.error(
      '❌ Failed to ensure call type permissions (call joining may fail):',
      error
    );
  }
}

// Only log once to avoid spam
declare global {
  var streamVideoInitialized: boolean | undefined;
}

if (!globalThis.streamVideoInitialized) {
  console.log('✅ Stream Video client initialized with API key:', process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY?.substring(0, 8) + '...');
  globalThis.streamVideoInitialized = true;
}
