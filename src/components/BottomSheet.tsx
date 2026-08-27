import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import './bottom-sheet.css';

interface BottomSheetProps {
  /** Always-visible part: the drag handle is added automatically above it. */
  peek?: ReactNode;
  children: ReactNode;
  /** Fraction of the parent height the sheet occupies when fully open. */
  maxRatio?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export default function BottomSheet({
  peek,
  children,
  maxRatio = 2 / 3,
  open,
  onOpenChange,
  className = '',
}: BottomSheetProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const [peekH, setPeekH] = useState(56);
  const [drag, setDrag] = useState<{ startY: number; startOffset: number } | null>(null);
  const [offset, setOffset] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = peekRef.current;
    if (!el) return;
    const measure = () => setPeekH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxH = useCallback(
    () => (rootRef.current?.parentElement?.clientHeight ?? 600) * maxRatio,
    [maxRatio],
  );
  const closedOffset = useCallback(() => Math.max(0, maxH() - peekH), [maxH, peekH]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDrag({ startY: e.clientY, startOffset: offset ?? (open ? 0 : closedOffset()) });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const next = Math.min(closedOffset(), Math.max(0, drag.startOffset + (e.clientY - drag.startY)));
    setOffset(next);
  };

  const endDrag = () => {
    if (!drag) return;
    const current = offset ?? (open ? 0 : closedOffset());
    onOpenChange(current < closedOffset() / 2);
    setDrag(null);
    setOffset(null);
  };

  useEffect(() => {
    if (!drag) setOffset(null);
  }, [drag, open]);

  const translate = drag && offset !== null ? offset : open ? 0 : closedOffset();

  return (
    <div
      ref={rootRef}
      className={`sheet ${className}`}
      style={{
        height: `${maxRatio * 100}%`,
        transform: `translateY(${translate}px)`,
        transition: drag ? 'none' : 'transform 0.24s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <div ref={peekRef} className="sheet__peek">
        <div
          className="sheet__handle-zone"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={() => !drag && onOpenChange(!open)}
          role="button"
          tabIndex={0}
          aria-label={open ? 'Close panel' : 'Open panel'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpenChange(!open);
          }}
        >
          <span className="sheet__handle" />
        </div>
        {peek}
      </div>
      <div className="sheet__body">{children}</div>
    </div>
  );
}
