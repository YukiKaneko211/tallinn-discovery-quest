export type TextStyle = 'none' | 'border' | 'fill';
export type TextAlign = 'right' | 'center' | 'left';

export interface ImageTransform {
  /** Centre of the image in stage coordinates. */
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export interface Filters {
  /** -1 … 1 */
  brightness: number;
  /** -100 … 100 */
  contrast: number;
  /** -1 … 2 */
  saturation: number;
  /** 0 … 359 — hue of the colour filter overlay */
  hue: number;
  /** 0 … 1 — strength of the colour filter overlay */
  hueStrength: number;
  /** 0 … 1 */
  sharpness: number;
}

interface BaseItem {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface TextItem extends BaseItem {
  type: 'text';
  text: string;
  fontIndex: number;
  fontSize: number;
  align: TextAlign;
  style: TextStyle;
  primary: string;
  secondary: string;
}

export interface DecoItem extends BaseItem {
  type: 'deco';
  decoId: string;
  src: string;
  width: number;
  height: number;
}

export type CanvasItem = TextItem | DecoItem;

export interface EditorState {
  version: 1;
  /** OPFS key of the untouched original, so re-editing never stacks effects. */
  sourcePath: string;
  stageWidth: number;
  stageHeight: number;
  image: ImageTransform;
  filters: Filters;
  items: CanvasItem[];
}

export const DEFAULT_FILTERS: Filters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  hueStrength: 0,
  sharpness: 0,
};

/** Font stacks offered in Text mode. Index 0 is the default (PRD: "default - font 1"). */
export const FONTS: { label: string; stack: string }[] = [
  { label: 'Rounded', stack: "'M PLUS Rounded 1c', 'Trebuchet MS', sans-serif" },
  { label: 'Impact', stack: "Impact, 'Arial Black', sans-serif" },
  { label: 'Serif', stack: "Georgia, 'Times New Roman', serif" },
  { label: 'Mono', stack: "'Courier New', monospace" },
  { label: 'Casual', stack: "'Comic Sans MS', 'Chalkboard SE', cursive" },
  { label: 'Wide', stack: "'Trebuchet MS', Verdana, sans-serif" },
];

export const ALIGN_ORDER: TextAlign[] = ['right', 'center', 'left'];
export const STYLE_ORDER: TextStyle[] = ['none', 'border', 'fill'];

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
