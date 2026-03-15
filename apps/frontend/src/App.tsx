import { Link, Route, Routes } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LobbyPage } from './pages/LobbyPage';
import { SessionPage } from './pages/SessionPage';

const navLinks = [
  { to: '/', label: 'Каталог' },
  { to: '/lobby', label: 'Лобби' },
  { to: '/session', label: 'Сессия' }
];

export function App() {
  return (
    <main
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: 24,
        minHeight: '100vh',
        background: '#f7fafc',
        color: '#1a202c'
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ marginBottom: 8 }}>Quiz Sprint</h1>
        <p style={{ marginTop: 0, color: '#4a5568' }}>
          Мини-продукт для быстрых онлайн-квизов с друзьями.
        </p>
      </header>
      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              textDecoration: 'none',
              border: '1px solid #cbd5e0',
              color: '#2d3748',
              background: '#fff'
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/session" element={<SessionPage />} />
      </Routes>
    </main>
  );
}
