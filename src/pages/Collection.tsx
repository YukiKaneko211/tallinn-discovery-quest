import { useNavigate } from 'react-router-dom';

import { IconBook, IconDeco, IconPin, IconQuestion } from '../components/Icons';
import { useApp } from '../state/AppContext';
import './collection.css';

export default function Collection() {
  const navigate = useNavigate();
  const { spots, quizzes, decos, checkedInIds, completedQuizIds, unlockedDecoIds } = useApp();

  const tiles = [
    {
      to: '/collection/spots',
      label: 'Spots',
      value: `${checkedInIds.size}/${spots.length}`,
      Icon: IconPin,
    },
    {
      to: '/collection/quiz',
      label: 'Trivia Quiz',
      value: `${completedQuizIds.size}/${quizzes.length}`,
      Icon: IconQuestion,
    },
    {
      to: '/collection/deco',
      label: 'Deco',
      value: `${unlockedDecoIds.size}/${decos.length}`,
      Icon: IconDeco,
    },
  ];

  return (
    <div className="page cmenu">
      <header className="phead">
        <span className="phead__back" aria-hidden="true">
          <IconBook />
        </span>
        <h2 className="phead__title">Collection</h2>
      </header>

      <div className="cmenu__tiles">
        {tiles.map(({ to, label, value, Icon }) => (
          <button key={to} type="button" className="ctile" onClick={() => navigate(to)}>
            <span className="ctile__pattern" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <Icon key={i} size={34} />
              ))}
            </span>
            <span className="ctile__label">{label}</span>
            <span className="ctile__value">{value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
