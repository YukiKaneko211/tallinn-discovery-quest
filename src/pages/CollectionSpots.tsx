import { useNavigate } from 'react-router-dom';

import { IconBack } from '../components/Icons';
import SpotCard from '../components/SpotCard';
import { useApp, useSpotsByDistance } from '../state/AppContext';

export default function CollectionSpots() {
  const navigate = useNavigate();
  const { spots, checkedInIds } = useApp();
  const ranked = useSpotsByDistance();

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
        <h2 className="phead__title">Spots</h2>
        <span className="phead__count">
          {checkedInIds.size}/{spots.length}
        </span>
      </header>

      <div className="list">
        <ul>
          {ranked.map(({ spot, distance }) => (
            <li key={spot.id}>
              <SpotCard spot={spot} distance={distance} checkedIn={checkedInIds.has(spot.id)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
