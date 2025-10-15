import { createAvatar } from '@dicebear/core';
import { initials } from '@dicebear/collection';
import { botttsNeutral } from '@dicebear/collection';

export function generateAvatarURI({ 
  seed, 
  variant 
}: { 
  seed: string; 
  variant: 'initials' | 'botttsNeutral' 
}) {
  const avatar = variant === 'initials'
    ? createAvatar(initials, { seed })
    : createAvatar(botttsNeutral, { seed });
  
  return avatar.toDataUri();
}
