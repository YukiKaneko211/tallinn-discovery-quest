import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';

import { FeedbackProvider } from './components/Feedback';
import GlobalMenu from './components/GlobalMenu';
import Collection from './pages/Collection';
import CollectionDeco from './pages/CollectionDeco';
import CollectionQuiz from './pages/CollectionQuiz';
import CollectionSpots from './pages/CollectionSpots';
import DecoSouvenir from './pages/DecoSouvenir';
import Explore from './pages/Explore';
import SpotPage from './pages/SpotPage';
import { AppProvider, useApp } from './state/AppContext';
import './styles/global.css';

function Shell() {
  const { ready } = useApp();

  if (!ready) {
    return (
      <div className="app">
        <div className="loading">
          <span className="spinner" />
          <span>Preparing your stamp book…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app__body app__body--menu">
        <Routes>
          <Route path="/" element={<Explore />} />
          <Route path="/spot/:spotId" element={<SpotPage />} />
          <Route path="/deco" element={<DecoSouvenir />} />
          <Route path="/deco/edit/:photoId" element={<DecoSouvenir />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/collection/spots" element={<CollectionSpots />} />
          <Route path="/collection/quiz" element={<CollectionQuiz />} />
          <Route path="/collection/deco" element={<CollectionDeco />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <GlobalMenu />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <FeedbackProvider>
          <Shell />
        </FeedbackProvider>
      </AppProvider>
    </HashRouter>
  );
}
