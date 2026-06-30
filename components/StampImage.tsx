import { Image } from 'react-native';

const STAMP = require('@/assets/stamps/stamp.png');
const EMPTY_STAMP = require('@/assets/stamps/empty_stamp.png');

interface StampImageProps {
  stamped: boolean;
  size: number;
}

/**
 * Displays the stamp impression (stamped) or the empty placeholder.
 * Critical dimensions live in `style` for reliable web sizing.
 */
export function StampImage({ stamped, size }: StampImageProps) {
  return (
    <Image
      source={stamped ? STAMP : EMPTY_STAMP}
      style={{ width: size, height: size }}
      resizeMode="contain"
    />
  );
}
