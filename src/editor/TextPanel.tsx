import { useEffect, useRef, useState } from 'react';

import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconFontSize,
  IconPalette,
  IconStyle,
} from '../components/Icons';
import { hexToHsv, hsvToHex } from './color';
import { ALIGN_ORDER, FONTS, STYLE_ORDER, type TextItem } from './types';

interface TextPanelProps {
  item: TextItem | null;
  onPatch: (patch: Partial<TextItem>) => void;
  onFinish: () => void;
}

const ALIGN_ICON = {
  left: IconAlignLeft,
  center: IconAlignCenter,
  right: IconAlignRight,
} as const;

export default function TextPanel({ item, onPatch, onFinish }: TextPanelProps) {
  const [sub, setSub] = useState<'font' | 'color'>('font');
  const [slot, setSlot] = useState<'primary' | 'secondary'>('primary');
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (sub === 'font') areaRef.current?.focus();
  }, [sub, item?.id]);

  if (!item) {
    return <p className="empty">Add a text from the preview to start editing.</p>;
  }

  const AlignIcon = ALIGN_ICON[item.align];
  const color = slot === 'primary' ? item.primary : item.secondary;
  const hsv = hexToHsv(color);
  const setColor = (next: Partial<ReturnType<typeof hexToHsv>>) =>
    onPatch({ [slot]: hsvToHex({ ...hsv, ...next }) } as Partial<TextItem>);

  return (
    <div className="ed__panel">
      <div className="ed__submenu">
        <button
          type="button"
          className={`ed__subbtn${sub === 'font' ? ' ed__subbtn--on' : ''}`}
          onClick={() => setSub('font')}
          aria-label="Text and font"
        >
          <IconFontSize />
        </button>
        <button
          type="button"
          className={`ed__subbtn${sub === 'color' ? ' ed__subbtn--on' : ''}`}
          onClick={() => setSub('color')}
          aria-label="Colour"
        >
          <IconPalette />
        </button>
        <button
          type="button"
          className="ed__subbtn"
          onClick={() =>
            onPatch({
              align: ALIGN_ORDER[(ALIGN_ORDER.indexOf(item.align) + 1) % ALIGN_ORDER.length],
            })
          }
          aria-label={`Alignment: ${item.align}`}
        >
          <AlignIcon />
        </button>
        <button
          type="button"
          className="ed__subbtn"
          onClick={() =>
            onPatch({
              style: STYLE_ORDER[(STYLE_ORDER.indexOf(item.style) + 1) % STYLE_ORDER.length],
            })
          }
          aria-label={`Style: ${item.style}`}
        >
          <IconStyle />
        </button>
      </div>

      {sub === 'font' ? (
        <>
          <textarea
            ref={areaRef}
            className="ed__textarea"
            value={item.text}
            placeholder="Type your text…"
            onChange={(e) => onPatch({ text: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onFinish();
              }
            }}
          />
          <div className="ed__fonts">
            {FONTS.map((f, i) => (
              <button
                key={f.label}
                type="button"
                className={`ed__font${item.fontIndex === i ? ' ed__font--on' : ''}`}
                style={{ fontFamily: f.stack }}
                onClick={() => onPatch({ fontIndex: i })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="ed__swatches">
            {(['primary', 'secondary'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`ed__swatch${slot === s ? ' ed__swatch--on' : ''}`}
                onClick={() => setSlot(s)}
              >
                {s === 'primary' ? 'Primary' : 'Secondary'}
                <span
                  className="ed__chip"
                  style={{ background: s === 'primary' ? item.primary : item.secondary }}
                />
              </button>
            ))}
          </div>
          <div className="ed__row">
            <span className="ed__label">Hue</span>
            <input
              className="ed__slider ed__slider--hue"
              type="range"
              min={0}
              max={359}
              value={Math.round(hsv.h)}
              onChange={(e) => setColor({ h: Number(e.target.value) })}
            />
          </div>
          <div className="ed__row">
            <span className="ed__label">Saturation</span>
            <input
              className="ed__slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(hsv.s)}
              onChange={(e) => setColor({ s: Number(e.target.value) })}
              style={{
                background: `linear-gradient(to right, #fff, ${hsvToHex({ ...hsv, s: 100 })})`,
              }}
            />
          </div>
          <div className="ed__row">
            <span className="ed__label">Value</span>
            <input
              className="ed__slider"
              type="range"
              min={0}
              max={100}
              value={Math.round(hsv.v)}
              onChange={(e) => setColor({ v: Number(e.target.value) })}
              style={{
                background: `linear-gradient(to right, #000, ${hsvToHex({ ...hsv, v: 100 })})`,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
