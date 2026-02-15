import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AppShell = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/events');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/events" className="brand">
            Bellcorp Events
          </Link>

          <nav className="topbar-nav">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Explore
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              Dashboard
            </NavLink>
            {isAuthenticated && user?.isCreator && (
              <NavLink
                to="/events/create"
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                Create Event
              </NavLink>
            )}
          </nav>

          <div className="topbar-actions">
            {isAuthenticated ? (
              <>
                <span className="user-chip">
                  {user?.name || user?.email || 'Account'}
                </span>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="button button-outline" to="/login">
                  Login
                </Link>
                <Link className="button button-primary" to="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container page-body">{children}</main>
    </div>
  );
};

export default AppShell;
