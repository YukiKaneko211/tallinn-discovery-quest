import type { ReactNode } from 'react';

interface PopupProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  actions: ReactNode;
  onBackdrop?: () => void;
}

export default function Popup({ title, description, children, actions, onBackdrop }: PopupProps) {
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onBackdrop?.();
      }}
    >
      <div className="popup">
        {children}
        <p className="popup__title">{title}</p>
        {description ? <p className="popup__desc">{description}</p> : null}
        <div className="popup__actions">{actions}</div>
      </div>
    </div>
  );
}
