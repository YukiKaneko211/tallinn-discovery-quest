import { NavLink, useLocation } from 'react-router-dom';

import { IconBook, IconCamera, IconPin } from './Icons';

const ITEMS = [
  { to: '/', label: 'Explore', Icon: IconPin, match: (p: string) => p === '/' || p.startsWith('/spot') },
  { to: '/deco', label: 'Deco Souvenir', Icon: IconCamera, match: (p: string) => p.startsWith('/deco') },
  {
    to: '/collection',
    label: 'Collection',
    Icon: IconBook,
    match: (p: string) => p.startsWith('/collection'),
  },
];

export default function GlobalMenu() {
  const { pathname } = useLocation();
  return (
    <nav className="gmenu" aria-label="Global menu">
      {ITEMS.map(({ to, label, Icon, match }) => {
        const on = match(pathname);
        return (
          <NavLink
            key={to}
            to={to}
            className={`gmenu__item${on ? ' gmenu__item--on' : ''}`}
            aria-current={on ? 'page' : undefined}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
