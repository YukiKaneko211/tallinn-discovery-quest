import { useNavigate } from 'react-router-dom';

import { IconBack } from '../components/Icons';
import QuizCard from '../components/QuizCard';
import { useApp } from '../state/AppContext';

export default function CollectionQuiz() {
  const navigate = useNavigate();
  const { spots, quizzes, completedQuizIds } = useApp();

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
        <h2 className="phead__title">Trivia Quiz</h2>
        <span className="phead__count">
          {completedQuizIds.size}/{quizzes.length}
        </span>
      </header>

      <div className="list">
        {spots.map((spot) => {
          const items = quizzes.filter((q) => q.spotId === spot.id);
          if (items.length === 0) return null;
          const done = items.filter((q) => completedQuizIds.has(q.id)).length;
          return (
            <section className="cgroup" key={spot.id}>
              <button
                type="button"
                className="cgroup__head"
                onClick={() => navigate(`/spot/${spot.id}`)}
              >
                <span className="cgroup__title">{spot.name}</span>
                <span className="cgroup__count">
                  {done}/{items.length}
                </span>
              </button>
              {items.map((q) => (
                <QuizCard key={q.id} quiz={q} />
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
