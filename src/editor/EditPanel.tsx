import { useState } from 'react';

import {
  IconBrightness,
  IconContrast,
  IconCrop,
  IconFlipH,
  IconFlipV,
  IconPalette,
  IconRotate,
  IconSaturation,
  IconSharpness,
} from '../components/Icons';
import type { Filters, ImageTransform } from './types';

type Tool = 'crop' | 'brightness' | 'contrast' | 'saturation' | 'color' | 'sharpness';

interface EditPanelProps {
  filters: Filters;
  transform: ImageTransform;
  onFilters: (patch: Partial<Filters>) => void;
  onTransform: (patch: Partial<ImageTransform>) => void;
  tool: Tool | null;
  onTool: (tool: Tool | null) => void;
}

const TOOLS: { id: Tool; label: string; Icon: typeof IconCrop }[] = [
  { id: 'crop', label: 'Crop & Rotate', Icon: IconCrop },
  { id: 'brightness', label: 'Brightness', Icon: IconBrightness },
  { id: 'contrast', label: 'Contrast', Icon: IconContrast },
  { id: 'saturation', label: 'Saturation', Icon: IconSaturation },
  { id: 'color', label: 'Color Filter', Icon: IconPalette },
  { id: 'sharpness', label: 'Sharpness', Icon: IconSharpness },
];

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  hue = false,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  hue?: boolean;
}) {
  return (
    <div className="ed__row">
      <span className="ed__label">{label}</span>
      <input
        className={`ed__slider${hue ? ' ed__slider--hue' : ''}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="ed__val">{Math.round(value * (max <= 1 ? 100 : 1))}</span>
    </div>
  );
}

export default function EditPanel({
  filters,
  transform,
  onFilters,
  onTransform,
  tool,
  onTool,
}: EditPanelProps) {
  const [openTools] = useState(true);

  return (
    <div className="ed__panel">
      {tool ? (
        <div className="ed__toolbar">
          <button type="button" className="ed__iconbtn" onClick={() => onTool(null)} aria-label="Back to tools">
            ‹
          </button>
          <strong style={{ fontSize: 'var(--fs-sm)' }}>
            {TOOLS.find((t) => t.id === tool)?.label}
          </strong>
        </div>
      ) : null}

      {tool === null && openTools ? (
        <div className="ed__tools">
          {TOOLS.map(({ id, label, Icon }) => (
            <button key={id} type="button" className="ed__tool" onClick={() => onTool(id)}>
              <Icon size={26} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {tool === 'crop' ? (
        <>
          <p className="ed__label" style={{ width: 'auto', marginBottom: 8 }}>
            Pinch with two fingers on the photo to scale &amp; rotate, or drag to reposition.
          </p>
          <div className="ed__toolbar">
            <button
              type="button"
              className="ed__iconbtn"
              onClick={() => onTransform({ flipH: !transform.flipH })}
              aria-label="Flip horizontal"
            >
              <IconFlipH />
            </button>
            <button
              type="button"
              className="ed__iconbtn"
              onClick={() => onTransform({ flipV: !transform.flipV })}
              aria-label="Flip vertical"
            >
              <IconFlipV />
            </button>
            <button
              type="button"
              className="ed__iconbtn"
              onClick={() => onTransform({ rotation: (transform.rotation + 90) % 360 })}
              aria-label="Rotate 90 degrees"
            >
              <IconRotate />
            </button>
          </div>
          <Slider
            label="Scale"
            min={0.2}
            max={4}
            step={0.01}
            value={transform.scale}
            onChange={(v) => onTransform({ scale: v })}
          />
          <Slider
            label="Rotation"
            min={-180}
            max={180}
            step={1}
            value={transform.rotation}
            onChange={(v) => onTransform({ rotation: v })}
          />
        </>
      ) : null}

      {tool === 'brightness' ? (
        <Slider
          label="Strength"
          min={-1}
          max={1}
          step={0.01}
          value={filters.brightness}
          onChange={(v) => onFilters({ brightness: v })}
        />
      ) : null}

      {tool === 'contrast' ? (
        <Slider
          label="Strength"
          min={-100}
          max={100}
          step={1}
          value={filters.contrast}
          onChange={(v) => onFilters({ contrast: v })}
        />
      ) : null}

      {tool === 'saturation' ? (
        <Slider
          label="Strength"
          min={-1}
          max={2}
          step={0.01}
          value={filters.saturation}
          onChange={(v) => onFilters({ saturation: v })}
        />
      ) : null}

      {tool === 'color' ? (
        <>
          <Slider
            label="Hue"
            min={0}
            max={359}
            step={1}
            value={filters.hue}
            onChange={(v) => onFilters({ hue: v })}
            hue
          />
          <Slider
            label="Strength"
            min={0}
            max={1}
            step={0.01}
            value={filters.hueStrength}
            onChange={(v) => onFilters({ hueStrength: v })}
          />
        </>
      ) : null}

      {tool === 'sharpness' ? (
        <Slider
          label="Strength"
          min={0}
          max={1}
          step={0.01}
          value={filters.sharpness}
          onChange={(v) => onFilters({ sharpness: v })}
        />
      ) : null}
    </div>
  );
}

export type { Tool as EditTool };
