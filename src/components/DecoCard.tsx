import { useState } from 'react';

import type { Deco } from '../db/schema';
import { playUnlock } from '../lib/sound';
import { useApp } from '../state/AppContext';
import { IconLock, IconPoint } from './Icons';
import Popup from './Popup';
import './deco.css';

interface DecoCardProps {
  deco: Deco;
  /** Called when a user taps an already-unlocked Deco (e.g. place it on canvas). */
  onPick?: (deco: Deco) => void;
  /** Show the name + price row underneath (Collection / Spot list style). */
  withMeta?: boolean;
}

export default function DecoCard({ deco, onPick, withMeta = false }: DecoCardProps) {
  const { unlockedDecoIds, points, unlockDeco } = useApp();
  const [popup, setPopup] = useState(false);
  const unlocked = unlockedDecoIds.has(deco.id);
  const affordable = points >= deco.costPoints;

  const handle = () => {
    if (unlocked) onPick?.(deco);
    else setPopup(true);
  };

  const confirm = async () => {
    const ok = await unlockDeco(deco.id);
    if (ok) playUnlock();
    setPopup(false);
  };

  return (
    <>
      <div className={`decocard${withMeta ? ' decocard--meta' : ''}`}>
        <button
          type="button"
          className={`decocard__btn${unlocked ? '' : ' decocard__btn--locked'}`}
          onClick={handle}
          aria-label={unlocked ? deco.name : `${deco.name} — locked, ${deco.costPoints} pt`}
        >
          <img src={deco.imageUrl} alt="" loading="lazy" />
          {!unlocked ? (
            <span className="decocard__lock">
              <IconLock size={22} />
            </span>
          ) : null}
        </button>
        {withMeta ? (
          <div className="decocard__meta">
            <span className="decocard__name">{deco.name}</span>
            <span className="decocard__pts">
              <IconPoint size={16} />
              {deco.costPoints} pt
            </span>
          </div>
        ) : null}
      </div>

      {popup ? (
        affordable ? (
          <Popup
            onBackdrop={() => setPopup(false)}
            title="Unlock this Deco with the point?"
            description={
              <span className="decopop__calc">
                <IconPoint size={18} /> {points} pt → {points - deco.costPoints} pt
              </span>
            }
            actions={
              <>
                <button type="button" className="btn btn--accent" onClick={confirm}>
                  Unlock
                </button>
                <button type="button" className="btn btn--inactive" onClick={() => setPopup(false)}>
                  Cancel
                </button>
              </>
            }
          >
            <img className="decopop__img" src={deco.imageUrl} alt="" />
          </Popup>
        ) : (
          <Popup
            onBackdrop={() => setPopup(false)}
            title={<span style={{ color: 'var(--color-error)' }}>You don't have enough point to unlock!</span>}
            description={
              <span className="decopop__calc">
                <IconPoint size={18} /> {deco.costPoints} pt to unlock (You have{' '}
                <strong>{points} pt</strong>)
              </span>
            }
            actions={
              <button type="button" className="btn btn--inactive" onClick={() => setPopup(false)}>
                Cancel
              </button>
            }
          >
            <img className="decopop__img" src={deco.imageUrl} alt="" />
          </Popup>
        )
      ) : null}
    </>
  );
}
