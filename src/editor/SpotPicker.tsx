import { useMemo, useState } from 'react';

import { IconBack, IconSearch } from '../components/Icons';
import type { Spot } from '../db/schema';

interface SpotPickerProps {
  spots: Spot[];
  onSelect: (spot: Spot | null) => void;
  onClose: () => void;
}

/** Incremental search over Spot names, opened by tapping the Spot selector. */
export default function SpotPicker({ spots, onSelect, onClose }: SpotPickerProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return spots;
    return spots.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q),
    );
  }, [spots, query]);

  return (
    <div className="picker">
      <div className="picker__search">
        <button type="button" className="phead__back" onClick={onClose} aria-label="Close">
          <IconBack />
        </button>
        <IconSearch size={20} />
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input
          autoFocus
          value={query}
          placeholder="Search a Spot…"
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search a Spot"
        />
      </div>
      <div className="picker__list">
        <button type="button" className="picker__item" onClick={() => onSelect(null)}>
          <em>No Spot</em>
          <small>Keep this photo untagged</small>
        </button>
        {results.map((s) => (
          <button key={s.id} type="button" className="picker__item" onClick={() => onSelect(s)}>
            {s.name}
            <small>{s.address}</small>
          </button>
        ))}
        {results.length === 0 ? <p className="empty">No Spot matches “{query}”.</p> : null}
      </div>
    </div>
  );
}
