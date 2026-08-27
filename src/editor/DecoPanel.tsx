import { useMemo } from 'react';

import DecoCard from '../components/DecoCard';
import type { Deco } from '../db/schema';
import { useApp } from '../state/AppContext';

interface DecoPanelProps {
  /** Spot tagged on the photo — its Decos are listed first (PRD sort order). */
  spotId: string | null;
  onPick: (deco: Deco) => void;
}

export default function DecoPanel({ spotId, onPick }: DecoPanelProps) {
  const { decos, unlockedDecoIds } = useApp();

  const ordered = useMemo(() => {
    const mine = decos.filter((d) => spotId && d.spotId === spotId);
    const rest = decos
      .filter((d) => !(spotId && d.spotId === spotId))
      .sort(
        (a, b) => Number(unlockedDecoIds.has(b.id)) - Number(unlockedDecoIds.has(a.id)),
      );
    return [...mine, ...rest];
  }, [decos, spotId, unlockedDecoIds]);

  return (
    <div className="ed__panel">
      <div className="decogrid">
        {ordered.map((d) => (
          <DecoCard key={d.id} deco={d} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}
