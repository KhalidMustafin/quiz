import { Link, Route, Routes } from 'react-router-dom';

import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Quiz Admin</h1>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/">Dashboard</Link>
        <Link to="/users">Users</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </main>
  );
}
