import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Mark = 'correct' | 'wrong' | 'stamp';

const Ctx = createContext<(mark: Mark) => void>(() => {});

/** Full-screen ⭕ / ❌ / stamp flash used by the quiz and check-in flows. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [mark, setMark] = useState<{ kind: Mark; seq: number } | null>(null);
  const timer = useRef<number>(0);
  const seq = useRef(0);

  const show = useCallback((kind: Mark) => {
    seq.current += 1;
    setMark({ kind, seq: seq.current });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMark(null), 750);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {mark ? (
        <div className="result" key={mark.seq} aria-live="polite">
          <span
            className="result__mark"
            style={{ color: mark.kind === 'wrong' ? 'var(--color-error)' : 'var(--color-error)' }}
          >
            {mark.kind === 'correct' ? '⭕' : mark.kind === 'wrong' ? '❌' : '🎉'}
          </span>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

export function useFeedback() {
  return useContext(Ctx);
}
