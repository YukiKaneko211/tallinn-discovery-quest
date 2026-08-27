import { useState } from 'react';

import type { Quiz } from '../db/schema';
import { playCorrect, playWrong } from '../lib/sound';
import { useApp } from '../state/AppContext';
import { useFeedback } from './Feedback';
import { IconCaretDown, IconPlay, IconPoint } from './Icons';
import './quiz.css';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const { completedQuizIds, completeQuiz } = useApp();
  const showMark = useFeedback();
  const completed = completedQuizIds.has(quiz.id);
  // Closed state is the default whenever the tab is opened.
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (selected === null || busy) return;
    setBusy(true);
    try {
      if (selected === quiz.correctAnswerIndex) {
        playCorrect();
        showMark('correct');
        await completeQuiz(quiz.id);
      } else {
        playWrong();
        showMark('wrong');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`quiz${completed ? ' quiz--done' : ''}`}>
      <button
        type="button"
        className="quiz__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="quiz__caret">{open ? <IconCaretDown /> : <IconPlay />}</span>
        <span className="quiz__title">{quiz.title}</span>
        <span className="quiz__pts">
          <IconPoint size={17} />
          {quiz.rewardPoints} pt
        </span>
      </button>
      <p className="quiz__state">{completed ? 'Completed!' : 'Incompleted'}</p>

      {open ? (
        <div className="quiz__body">
          <p className="quiz__question">{quiz.question}</p>
          <ul className="quiz__answers">
            {quiz.choices.map((choice, i) => {
              const isCorrect = i === quiz.correctAnswerIndex;
              const cls = completed
                ? isCorrect
                  ? 'quiz__answer quiz__answer--on'
                  : 'quiz__answer'
                : selected === i
                  ? 'quiz__answer quiz__answer--on'
                  : 'quiz__answer';
              return (
                <li key={choice}>
                  <button
                    type="button"
                    className={cls}
                    disabled={completed}
                    onClick={() => setSelected(i)}
                  >
                    {choice}
                  </button>
                </li>
              );
            })}
          </ul>
          {!completed ? (
            <button
              type="button"
              className={`btn btn--block ${selected === null ? 'btn--weak' : 'btn--accent'}`}
              disabled={selected === null || busy}
              onClick={submit}
            >
              Submit Answer
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
