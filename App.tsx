import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { BugsPage } from './pages/BugsPage';

export function App(): JSX.Element {
  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="brand">✓ QA Platform</span>
        <nav className="app-nav">
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
            Projects
          </NavLink>
          <NavLink to="/bugs" className={({ isActive }) => (isActive ? 'active' : '')}>
            Bugs
          </NavLink>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/bugs" element={<BugsPage />} />
          <Route
            path="*"
            element={<div className="empty-state">Page not found.</div>}
          />
        </Routes>
      </main>
    </div>
  );
}
