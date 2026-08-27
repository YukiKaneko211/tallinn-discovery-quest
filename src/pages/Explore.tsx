import { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

import BottomSheet from '../components/BottomSheet';
import { IconPin, IconQuestion } from '../components/Icons';
import SpotCard from '../components/SpotCard';
import { CHECKIN_RADIUS_M, NEARBY_RADIUS_M } from '../lib/geo';
import { useApp, useSpotsByDistance } from '../state/AppContext';
import './explore.css';

const APP_NAME = 'Tallinn Stamp Rally';

function spotIcon(checkedIn: boolean) {
  const color = checkedIn ? 'var(--color-accent)' : 'var(--color-inactive)';
  return L.divIcon({
    className: 'mapicon',
    html: `<span class="mapicon__pin" style="color:${color}">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
      </svg></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
  });
}

const userIcon = L.divIcon({
  className: 'mapicon',
  html: `<span class="mapicon__me"></span>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const [last, setLast] = useState<string>('');
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (key !== last) {
    setLast(key);
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }
  return null;
}

export default function Explore() {
  const navigate = useNavigate();
  const { spots, quizzes, checkedInIds, completedQuizIds, position, positionSource, simulated, setSimulatedPosition } =
    useApp();
  const ranked = useSpotsByDistance();
  const [sheetOpen, setSheetOpen] = useState(true);

  const closest = ranked[0];
  const inRange = closest && closest.distance <= CHECKIN_RADIUS_M ? closest : null;
  const nearby = useMemo(
    () => ranked.filter((r) => r.distance <= NEARBY_RADIUS_M),
    [ranked],
  );

  return (
    <div className="page explore">
      <header className="explore__head">
        <h1 className="explore__title">{APP_NAME}</h1>
        <div className="explore__stats">
          <span className="explore__stat">
            <IconPin size={18} />
            <span>Spots</span>
            <strong>
              {checkedInIds.size} / {spots.length}
            </strong>
          </span>
          <span className="explore__stat">
            <IconQuestion size={18} />
            <span>Trivia</span>
            <strong>
              {completedQuizIds.size} / {quizzes.length}
            </strong>
          </span>
        </div>
      </header>

      <div className="explore__map">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={16}
          zoomControl={false}
          className="explore__leaflet"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter lat={position.lat} lng={position.lng} />
          {spots.map((s) => (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={spotIcon(checkedInIds.has(s.id))}
              eventHandlers={{ click: () => navigate(`/spot/${s.id}`) }}
            />
          ))}
          <Marker position={[position.lat, position.lng]} icon={userIcon} />
        </MapContainer>

        {positionSource !== 'gps' ? (
          <p className="explore__gpsnote">
            {positionSource === 'last-known'
              ? 'No GPS signal — showing your last known position.'
              : 'No GPS signal — showing Tallinn City Hall.'}
          </p>
        ) : null}

        <div className="explore__sim">
          <select
            aria-label="Simulate position"
            value={simulated ? 'on' : ''}
            onChange={(e) => {
              const id = e.target.value;
              if (!id) return setSimulatedPosition(null);
              const spot = spots.find((s) => s.id === id);
              if (spot) setSimulatedPosition({ lat: spot.latitude, lng: spot.longitude });
            }}
          >
            <option value="">📍 Simulate GPS…</option>
            {spots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} maxRatio={2 / 3}>
        <div className="list">
          <button
            type="button"
            className={`btn btn--block ${inRange ? 'btn--accent' : 'btn--inactive'}`}
            disabled={!inRange}
            onClick={() => inRange && navigate(`/spot/${inRange.spot.id}`)}
          >
            <IconPin size={20} />
            {inRange ? `Check In Now! - ${inRange.spot.name}` : 'No Spot within 200m'}
          </button>

          <p className="list__label" style={{ marginTop: 16 }}>
            Nearby Spots <small>within 1km</small>
          </p>
          {nearby.length === 0 ? (
            <p className="empty">
              No Spot within 1km of you.
              <br />
              Use “Simulate GPS” above to explore the demo data.
            </p>
          ) : (
            <ul>
              {nearby.map(({ spot, distance }) => (
                <li key={spot.id}>
                  <SpotCard spot={spot} distance={distance} checkedIn={checkedInIds.has(spot.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
