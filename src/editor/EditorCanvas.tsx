import Konva from 'konva';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentProps,
} from 'react';
import { Image as KImage, Layer, Rect, Stage, Text as KText, Transformer } from 'react-konva';

import { Sharpen } from './sharpen';
import { FONTS, type CanvasItem, type EditorState, type TextItem } from './types';

/**
 * Konva measures Text from its top-left. We keep item.x / item.y as the visual
 * centre, so the node's offset has to track its own measured box.
 */
type CenteredTextProps = ComponentProps<typeof KText> & { item: TextItem };

const CenteredText = forwardRef<Konva.Text, CenteredTextProps>(
  function CenteredText({ item, ...rest }, ref) {
    const inner = useRef<Konva.Text>(null);
    useImperativeHandle(ref, () => inner.current as Konva.Text);

    useLayoutEffect(() => {
      const node = inner.current;
      if (!node) return;
      node.offsetX(node.width() / 2);
      node.offsetY(node.height() / 2);
      node.getLayer()?.batchDraw();
    }, [item.text, item.fontSize, item.fontIndex, item.align, item.style]);

    const font = FONTS[item.fontIndex] ?? FONTS[0];
    const strokeW = Math.max(2, item.fontSize * 0.09);
    return (
      <KText
        ref={inner}
        {...rest}
        text={item.text || ' '}
        fontFamily={font.stack}
        fontSize={item.fontSize}
        fontStyle="bold"
        align={item.align}
        fill={item.style === 'fill' ? item.secondary : item.primary}
        stroke={
          item.style === 'none' ? undefined : item.style === 'fill' ? item.primary : item.secondary
        }
        strokeWidth={item.style === 'none' ? 0 : strokeW}
        fillAfterStrokeEnabled
        lineJoin="round"
      />
    );
  },
);

export interface EditorCanvasHandle {
  /** Exports the flattened result at 2x for saving. */
  toBlob: () => Promise<Blob>;
}

interface EditorCanvasProps {
  image: HTMLImageElement | null;
  state: EditorState;
  onChange: (next: EditorState) => void;
  width: number;
  height: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Hide overlay items while the Edit tab is open (PRD: Edit Mode). */
  hideItems: boolean;
  /** Allow moving/scaling the base photo (Crop & Rotate tool). */
  transformImage: boolean;
  onItemDragChange: (dragging: boolean, dropped?: { id: string; x: number; y: number }) => void;
  onTextActivate: (id: string) => void;
}

/** Loads a deco SVG into an <img> once and keeps it around. */
function useDecoImages(items: CanvasItem[]) {
  const cache = useRef(new Map<string, HTMLImageElement>());
  const srcs = items.filter((i) => i.type === 'deco').map((i) => i.src);
  const key = srcs.join('|');
  return useMemo(() => {
    for (const src of srcs) {
      if (!cache.current.has(src)) {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        cache.current.set(src, img);
      }
    }
    return cache.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

const EditorCanvas = forwardRef<EditorCanvasHandle, EditorCanvasProps>(function EditorCanvas(
  {
    image,
    state,
    onChange,
    width,
    height,
    selectedId,
    onSelect,
    hideItems,
    transformImage,
    onItemDragChange,
    onTextActivate,
  },
  ref,
) {
  const stageRef = useRef<Konva.Stage>(null);
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const itemRefs = useRef(new Map<string, Konva.Node>());
  const decoImages = useDecoImages(state.items);
  const { filters, image: tf } = state;

  useImperativeHandle(ref, () => ({
    toBlob: () =>
      new Promise<Blob>((resolve, reject) => {
        const stage = stageRef.current;
        if (!stage) return reject(new Error('stage not ready'));
        stage.toCanvas({ pixelRatio: 2 }).toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('export failed'));
        }, 'image/png');
      }),
  }));

  /* re-cache the photo whenever a filter or the transform changes */
  useEffect(() => {
    const node = imgRef.current;
    if (!node || !image) return;
    node.setAttr('sharpenAmount', filters.sharpness);
    node.cache();
    node.getLayer()?.batchDraw();
  }, [image, filters, tf, width, height]);

  /* keep the transformer attached to the selection */
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? itemRefs.current.get(selectedId) : null;
    tr.nodes(node && !hideItems ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, hideItems, state.items]);

  const patchItem = (id: string, patch: Partial<CanvasItem>) => {
    onChange({
      ...state,
      items: state.items.map((it) => (it.id === id ? ({ ...it, ...patch } as CanvasItem) : it)),
    });
  };

  const konvaFilters = useMemo(
    () => [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSV, Sharpen],
    [],
  );

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) onSelect(null);
      }}
    >
      <Layer listening={transformImage}>
        <Rect x={0} y={0} width={width} height={height} fill="#000" />
        {image ? (
          <KImage
            ref={imgRef}
            image={image}
            x={tf.x}
            y={tf.y}
            width={image.naturalWidth}
            height={image.naturalHeight}
            offsetX={image.naturalWidth / 2}
            offsetY={image.naturalHeight / 2}
            scaleX={tf.scale * (tf.flipH ? -1 : 1)}
            scaleY={tf.scale * (tf.flipV ? -1 : 1)}
            rotation={tf.rotation}
            draggable={transformImage}
            onDragEnd={(e) =>
              onChange({ ...state, image: { ...tf, x: e.target.x(), y: e.target.y() } })
            }
            filters={konvaFilters}
            brightness={filters.brightness}
            contrast={filters.contrast}
            saturation={filters.saturation}
            value={0}
            hue={0}
          />
        ) : null}
        {filters.hueStrength > 0 ? (
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill={`hsl(${filters.hue}, 100%, 50%)`}
            opacity={filters.hueStrength}
            globalCompositeOperation="color"
            listening={false}
          />
        ) : null}
      </Layer>

      <Layer visible={!hideItems}>
        {state.items.map((item) => {
          const common = {
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            scaleX: item.scaleX,
            scaleY: item.scaleY,
            draggable: true,
            onDragStart: () => {
              onSelect(item.id);
              onItemDragChange(true);
            },
            onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
              const p = e.target.getStage()?.getPointerPosition();
              onItemDragChange(false, p ? { id: item.id, x: p.x, y: p.y } : undefined);
              patchItem(item.id, { x: e.target.x(), y: e.target.y() });
            },
            onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
              const n = e.target;
              patchItem(item.id, {
                x: n.x(),
                y: n.y(),
                rotation: n.rotation(),
                scaleX: n.scaleX(),
                scaleY: n.scaleY(),
              });
            },
            onMouseDown: () => onSelect(item.id),
            onTouchStart: () => onSelect(item.id),
          };

          if (item.type === 'text') {
            return (
              <CenteredText
                key={item.id}
                {...common}
                item={item}
                ref={(n) => {
                  if (n) itemRefs.current.set(item.id, n);
                  else itemRefs.current.delete(item.id);
                }}
                onDblClick={() => onTextActivate(item.id)}
                onDblTap={() => onTextActivate(item.id)}
              />
            );
          }

          return (
            <KImage
              key={item.id}
              {...common}
              ref={(n) => {
                if (n) itemRefs.current.set(item.id, n);
                else itemRefs.current.delete(item.id);
              }}
              image={decoImages.get(item.src)}
              width={item.width}
              height={item.height}
              offsetX={item.width / 2}
              offsetY={item.height / 2}
            />
          );
        })}
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={14}
          borderStroke="#0072ce"
          anchorStroke="#0072ce"
        />
      </Layer>
    </Stage>
  );
});

export default EditorCanvas;
