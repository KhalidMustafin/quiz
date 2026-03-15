import { Link, Route, Routes } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { SessionPage } from './pages/SessionPage';

export function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Quiz Frontend</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/lobby">Lobby</Link>
        <Link to="/session">Session</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/session" element={<SessionPage />} />
      </Routes>
    </main>
  );
}
