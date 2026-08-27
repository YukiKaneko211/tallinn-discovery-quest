import { useNavigate } from 'react-router-dom';

import type { Spot } from '../db/schema';
import { EMPTY_STAMP_THUMB } from '../db/seedData';
import { formatDistance } from '../lib/geo';

interface SpotCardProps {
  spot: Spot;
  distance?: number;
  checkedIn: boolean;
}

export default function SpotCard({ spot, distance, checkedIn }: SpotCardProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={`spotcard${checkedIn ? ' spotcard--in' : ''}`}
      onClick={() => navigate(`/spot/${spot.id}`)}
    >
      <img className="spotcard__pic" src={spot.spotImage} alt="" loading="lazy" />
      <span className="spotcard__body">
        <span className="spotcard__name">{spot.name}</span>
        {distance !== undefined ? (
          <span className="spotcard__dist">{formatDistance(distance)}</span>
        ) : null}
      </span>
      <img
        className="spotcard__stamp"
        src={checkedIn ? spot.stampImage : EMPTY_STAMP_THUMB}
        alt={checkedIn ? 'Checked in' : 'Not checked in'}
        loading="lazy"
      />
    </button>
  );
}
