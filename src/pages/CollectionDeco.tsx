import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconBack, IconLock, IconPoint } from '../components/Icons';
import Popup from '../components/Popup';
import type { Deco } from '../db/schema';
import { playUnlock } from '../lib/sound';
import { useApp } from '../state/AppContext';
import '../components/deco.css';

export default function CollectionDeco() {
  const navigate = useNavigate();
  const { spots, decos, unlockedDecoIds, points, unlockDeco } = useApp();
  const [target, setTarget] = useState<Deco | null>(null);

  const groups = [
    ...spots.map((s) => ({ id: s.id, title: s.name, items: decos.filter((d) => d.spotId === s.id) })),
    { id: '__general', title: 'General', items: decos.filter((d) => d.spotId === null) },
  ].filter((g) => g.items.length > 0);

  const confirm = async () => {
    if (!target) return;
    const ok = await unlockDeco(target.id);
    if (ok) playUnlock();
    setTarget(null);
  };

  return (
    <div className="page">
      <header className="phead">
        <button
          type="button"
          className="phead__back"
          onClick={() => navigate('/collection')}
          aria-label="Back"
        >
          <IconBack />
        </button>
        <h2 className="phead__title">Deco</h2>
        <span className="phead__count">
          {unlockedDecoIds.size}/{decos.length}
        </span>
        <span className="cpoints">
          <IconPoint size={18} />
          {points} pt
        </span>
      </header>

      <div className="list">
        {groups.map((group) => {
          const owned = group.items.filter((d) => unlockedDecoIds.has(d.id)).length;
          return (
            <section className="cgroup" key={group.id}>
              <button
                type="button"
                className="cgroup__head"
                onClick={() => group.id !== '__general' && navigate(`/spot/${group.id}`)}
              >
                <span className="cgroup__title">{group.title}</span>
                <span className="cgroup__count">
                  {owned}/{group.items.length}
                </span>
              </button>
              {group.items.map((deco) => {
                const unlocked = unlockedDecoIds.has(deco.id);
                return (
                  <button
                    key={deco.id}
                    type="button"
                    className={`decorow${unlocked ? '' : ' decorow--locked'}`}
                    onClick={() => !unlocked && setTarget(deco)}
                  >
                    <img className="decorow__img" src={deco.imageUrl} alt="" loading="lazy" />
                    <span className="decorow__body">
                      <span className="decorow__name">{deco.name}</span>
                      <span className="decorow__pts">
                        <IconPoint size={16} />
                        {deco.costPoints} pt
                      </span>
                    </span>
                    {!unlocked ? (
                      <span className="decorow__lock">
                        <IconLock size={22} />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </section>
          );
        })}
      </div>

      {target ? (
        points >= target.costPoints ? (
          <Popup
            onBackdrop={() => setTarget(null)}
            title="Unlock this Deco with the point?"
            description={
              <span className="decopop__calc">
                <IconPoint size={18} /> {points} pt → {points - target.costPoints} pt
              </span>
            }
            actions={
              <>
                <button type="button" className="btn btn--accent" onClick={confirm}>
                  Unlock
                </button>
                <button type="button" className="btn btn--inactive" onClick={() => setTarget(null)}>
                  Cancel
                </button>
              </>
            }
          >
            <img className="decopop__img" src={target.imageUrl} alt="" />
          </Popup>
        ) : (
          <Popup
            onBackdrop={() => setTarget(null)}
            title={
              <span style={{ color: 'var(--color-error)' }}>You don't have enough point to unlock!</span>
            }
            description={
              <span className="decopop__calc">
                <IconPoint size={18} /> {target.costPoints} pt to unlock (You have{' '}
                <strong>{points} pt</strong>)
              </span>
            }
            actions={
              <button type="button" className="btn btn--inactive" onClick={() => setTarget(null)}>
                Cancel
              </button>
            }
          >
            <img className="decopop__img" src={target.imageUrl} alt="" />
          </Popup>
        )
      ) : null}
    </div>
  );
}
