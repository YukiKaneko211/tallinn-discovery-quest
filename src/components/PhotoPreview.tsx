import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Photo } from '../db/schema';
import { IconBack, IconEdit } from './Icons';
import './photo-preview.css';

interface PhotoPreviewProps {
  photos: Photo[];
  urls: Record<string, string>;
  startIndex: number;
  title: string;
  onClose: () => void;
}

function fmt(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function PhotoPreview({
  photos,
  urls,
  startIndex,
  title,
  onClose,
}: PhotoPreviewProps) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(startIndex);
  const [showInfo, setShowInfo] = useState(true);
  const touch = useRef<{ x: number; moved: boolean } | null>(null);

  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(photos.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, photos.length]);

  if (!photo) return null;

  const start = (x: number) => {
    touch.current = { x, moved: false };
  };
  const end = (x: number) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = x - t.x;
    if (Math.abs(dx) < 40) {
      setShowInfo((s) => !s);
      return;
    }
    // swipe left → previous photo, swipe right → next photo (per PRD)
    if (dx > 0) setIndex((i) => Math.min(photos.length - 1, i + 1));
    else setIndex((i) => Math.max(0, i - 1));
  };

  return (
    <div className="pv">
      <header className="phead pv__head">
        <button type="button" className="phead__back" onClick={onClose} aria-label="Back">
          <IconBack />
        </button>
        <h2 className="phead__title">{title}</h2>
        <span className="phead__count">
          {index + 1} / {photos.length}
        </span>
      </header>

      <div
        className="pv__stage"
        onPointerDown={(e) => start(e.clientX)}
        onPointerUp={(e) => end(e.clientX)}
        role="presentation"
      >
        {urls[photo.id] ? (
          <img className="pv__img" src={urls[photo.id]} alt="" draggable={false} />
        ) : (
          <div className="pv__missing">Image unavailable</div>
        )}
        {showInfo ? (
          <span className="pv__date">🗓 {fmt(new Date(photo.createdAt))}</span>
        ) : null}
        {index > 0 ? (
          <button
            type="button"
            className="pv__nav pv__nav--prev"
            onClick={() => setIndex((i) => i - 1)}
            aria-label="Previous photo"
          >
            ‹
          </button>
        ) : null}
        {index < photos.length - 1 ? (
          <button
            type="button"
            className="pv__nav pv__nav--next"
            onClick={() => setIndex((i) => i + 1)}
            aria-label="Next photo"
          >
            ›
          </button>
        ) : null}
      </div>

      <div className="pv__foot">
        <button
          type="button"
          className="btn btn--accent btn--block"
          onClick={() => navigate(`/deco/edit/${photo.id}`)}
        >
          <IconEdit size={20} /> Edit
        </button>
      </div>
    </div>
  );
}
