import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useFeedback } from '../components/Feedback';
import DecoCard from '../components/DecoCard';
import {
  IconBack,
  IconCamera,
  IconDeco,
  IconQuestion,
} from '../components/Icons';
import PhotoPreview from '../components/PhotoPreview';
import Popup from '../components/Popup';
import QuizCard from '../components/QuizCard';
import { usePhotoUrls } from '../components/usePhotoUrls';
import { listPhotos } from '../db/queries';
import type { Photo } from '../db/schema';
import { UNCHECKED_STAMP } from '../db/seedData';
import { playStamp } from '../lib/sound';
import { useApp } from '../state/AppContext';
import './spot.css';

type Tab = 'quiz' | 'photos' | 'deco';

const TABS: { id: Tab; label: string; Icon: typeof IconQuestion }[] = [
  { id: 'quiz', label: 'Trivia Quiz', Icon: IconQuestion },
  { id: 'photos', label: 'Your Photos', Icon: IconCamera },
  { id: 'deco', label: 'Deco', Icon: IconDeco },
];

export default function SpotPage() {
  const { spotId = '' } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const showMark = useFeedback();
  const {
    spots,
    quizzes,
    decos,
    checkedInIds,
    completedQuizIds,
    checkIn,
    uncheckIn,
    refreshPhotosToken,
  } = useApp();

  const spot = spots.find((s) => s.id === spotId);
  const initialTab = (params.get('tab') as Tab | null) ?? 'quiz';
  const [tab, setTab] = useState<Tab>(
    TABS.some((t) => t.id === initialTab) ? initialTab : 'quiz',
  );
  const [confirmUncheck, setConfirmUncheck] = useState(false);
  const [stamping, setStamping] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const urls = usePhotoUrls(photos);

  useEffect(() => {
    if (!spotId) return;
    let cancelled = false;
    listPhotos(spotId).then((rows) => !cancelled && setPhotos(rows));
    return () => {
      cancelled = true;
    };
  }, [spotId, refreshPhotosToken]);

  const spotQuizzes = useMemo(() => quizzes.filter((q) => q.spotId === spotId), [quizzes, spotId]);
  const spotDecos = useMemo(() => decos.filter((d) => d.spotId === spotId), [decos, spotId]);
  const doneCount = spotQuizzes.filter((q) => completedQuizIds.has(q.id)).length;

  if (!spot) {
    return (
      <div className="page">
        <header className="phead">
          <button type="button" className="phead__back" onClick={() => navigate(-1)} aria-label="Back">
            <IconBack />
          </button>
          <h2 className="phead__title">Spot</h2>
        </header>
        <p className="empty">This Spot could not be found.</p>
      </div>
    );
  }

  const isIn = checkedInIds.has(spot.id);

  const onStampTap = async () => {
    if (isIn) {
      setConfirmUncheck(true);
      return;
    }
    setStamping(true);
    playStamp();
    showMark('stamp');
    await checkIn(spot.id);
    window.setTimeout(() => setStamping(false), 600);
  };

  return (
    <div className="page spot">
      <header className="phead">
        <button type="button" className="phead__back" onClick={() => navigate(-1)} aria-label="Back">
          <IconBack />
        </button>
        <h2 className="phead__title">{spot.name}</h2>
      </header>

      <section className="spot__info">
        <p className="spot__addr">{spot.address}</p>
        <p className="spot__desc">{spot.description}</p>
      </section>

      <section className="spot__stampwrap">
        <button
          type="button"
          className={`spot__stamp${stamping ? ' spot__stamp--hit' : ''}`}
          onClick={onStampTap}
          aria-label={isIn ? 'Checked in — tap to uncheck-in' : 'Tap to check in and stamp'}
        >
          <img src={isIn ? spot.stampImage : UNCHECKED_STAMP} alt="" />
          {!isIn ? <span className="spot__finger" aria-hidden="true">👆</span> : null}
        </button>
      </section>

      <nav className="tabs" role="tablist">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`tabs__tab${tab === id ? ' tabs__tab--on' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="list">
        {tab === 'quiz' ? (
          <>
            <p className="list__label">
              Trivia QUIZ{' '}
              <small>
                {doneCount}/{spotQuizzes.length}
              </small>
            </p>
            {spotQuizzes.length === 0 ? (
              <p className="empty">No quiz for this Spot yet.</p>
            ) : (
              spotQuizzes.map((q) => <QuizCard key={q.id} quiz={q} />)
            )}
          </>
        ) : null}

        {tab === 'photos' ? (
          <>
            <button
              type="button"
              className="btn btn--accent btn--block"
              onClick={() => navigate(`/deco?spot=${spot.id}`)}
            >
              <IconCamera size={20} /> Take a Deco photo!
            </button>
            {photos.length === 0 ? (
              <p className="empty">
                No photo yet for this Spot.
                <br />
                Take one and decorate it!
              </p>
            ) : (
              <ul className="photogrid">
                {photos.map((p, i) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="photogrid__cell"
                      onClick={() => setPreviewIndex(i)}
                    >
                      {urls[p.id] ? <img src={urls[p.id]} alt="" /> : <span />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}

        {tab === 'deco' ? (
          spotDecos.length === 0 ? (
            <p className="empty">No Deco for this Spot yet.</p>
          ) : (
            <div className="decogrid">
              {spotDecos.map((d) => (
                <DecoCard key={d.id} deco={d} withMeta />
              ))}
            </div>
          )
        ) : null}
      </div>

      {confirmUncheck ? (
        <Popup
          onBackdrop={() => setConfirmUncheck(false)}
          title="Are you sure uncheck-in this Spot?"
          description="The earned points will remain but you won't get points when your check-in again this Spot."
          actions={
            <>
              <button
                type="button"
                className="btn btn--danger"
                onClick={async () => {
                  await uncheckIn(spot.id);
                  setConfirmUncheck(false);
                }}
              >
                Uncheck-in
              </button>
              <button
                type="button"
                className="btn btn--inactive"
                onClick={() => setConfirmUncheck(false)}
              >
                Cancel
              </button>
            </>
          }
        />
      ) : null}

      {previewIndex !== null ? (
        <PhotoPreview
          photos={photos}
          urls={urls}
          startIndex={previewIndex}
          title={spot.name}
          onClose={() => setPreviewIndex(null)}
        />
      ) : null}
    </div>
  );
}
