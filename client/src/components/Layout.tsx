import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../lib/auth';

export function Layout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">
          <span className="brand-mark">GT</span>
          <span>GoTours</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/tours">Tours</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/my-bookings">My bookings</NavLink>
              <NavLink to="/profile">{user?.name ?? 'Profile'}</NavLink>
              <button className="link-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link className="button button-small nav-cta" to="/signup">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <Outlet />

      <footer className="site-footer">
        <span>React client for the original Express GoTours API.</span>
        <span>Backend: localhost:3000</span>
      </footer>
    </div>
  );
}
