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
          <span className="brand-mark" aria-hidden="true">
            <img src="/favicon.png" alt="" />
          </span>
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
        <div className="footer-inner">
          <div className="footer-brand">
            <Link className="brand footer-brand-link" to="/">
              <span className="brand-mark" aria-hidden="true">
                <img src="/favicon.png" alt="" />
              </span>
              <span>GoTours</span>
            </Link>
            <p className="footer-tagline">
              Discover curated adventures across the globe. Book your next journey with confidence.
            </p>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-nav-col">
              <span className="footer-nav-heading">Explore</span>
              <Link to="/tours">All Tours</Link>
              <Link to="/tours">Adventure</Link>
              <Link to="/tours">Cultural</Link>
              <Link to="/tours">Nature</Link>
            </div>
            <div className="footer-nav-col">
              <span className="footer-nav-heading">Account</span>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Register</Link>
              <Link to="/my-bookings">My Bookings</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} GoTours. All rights reserved.</span>
          <span className="footer-bottom-links">
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Service</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
