import { View } from 'react-native';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';

import type { PhotoFrame } from '@/lib/types';

interface FrameOverlayProps {
  frame: PhotoFrame;
  /** Square side length in pixels. */
  size: number;
}

/**
 * Renders a Tallinn-themed decorative border for a souvenir photo.
 * Drawn as SVG so it stays crisp at any size and overlays the photo edge.
 */
export function FrameOverlay({ frame, size }: FrameOverlayProps) {
  const color = frame.color;
  const stroke = Math.max(6, size * 0.035);
  const inset = stroke / 2;
  const dim = size;

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }}
    >
      <Svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        {/* Outer border */}
        <Rect
          x={inset}
          y={inset}
          width={dim - stroke}
          height={dim - stroke}
          rx={size * 0.04}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
        />
        {/* Inner thin border */}
        <Rect
          x={stroke * 1.6}
          y={stroke * 1.6}
          width={dim - stroke * 3.2}
          height={dim - stroke * 3.2}
          rx={size * 0.025}
          fill="none"
          stroke={color}
          strokeWidth={Math.max(1.5, size * 0.006)}
          opacity={0.7}
        />

        {/* Corner spires (medieval motif) */}
        {[
          [stroke * 2.2, stroke * 2.2, 0],
          [dim - stroke * 2.2, stroke * 2.2, 90],
          [dim - stroke * 2.2, dim - stroke * 2.2, 180],
          [stroke * 2.2, dim - stroke * 2.2, 270],
        ].map(([cx, cy, rot]) => (
          <G key={rot} transform={`rotate(${rot} ${cx} ${cy})`}>
            <Path
              d={`M ${cx} ${cy - size * 0.05} L ${cx + size * 0.025} ${cy} L ${cx - size * 0.025} ${cy} Z`}
              fill={color}
            />
            <Circle cx={cx} cy={cy} r={size * 0.012} fill={color} />
          </G>
        ))}
      </Svg>
    </View>
  );
}
