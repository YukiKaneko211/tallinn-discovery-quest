import Konva from 'konva';

/**
 * Unsharp-mask style 3x3 convolution. Konva ships no sharpen filter, so this
 * one reads `sharpenAmount` (0…1) from the node.
 */
export function Sharpen(this: Konva.Node, imageData: ImageData) {
  const amount = (this.getAttr('sharpenAmount') as number) ?? 0;
  if (amount <= 0.001) return;

  const { width, height, data } = imageData;
  const src = new Uint8ClampedArray(data);
  const c = 1 + 4 * amount; // centre weight
  const n = -amount; // 4-neighbour weight

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const up = i - width * 4;
      const down = i + width * 4;
      for (let ch = 0; ch < 3; ch++) {
        data[i + ch] =
          src[i + ch] * c +
          (src[up + ch] + src[down + ch] + src[i - 4 + ch] + src[i + 4 + ch]) * n;
      }
    }
  }
}
