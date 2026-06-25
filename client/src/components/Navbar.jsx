import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="navbar-right">
        {user ? (
          <>
            <button
              className="navbar-btn"
              onClick={() => navigate('/settings')}
              title="Manage Account"
            >
              <i className="fa-solid fa-user-gear"></i>
              <span>Manage Account</span>
            </button>

            <button
              className="navbar-btn navbar-btn-icon"
              onClick={() => navigate('/settings')}
              title="User Profile"
            >
              <div className="user-avatar">
                {getInitials(user.fullName)}
              </div>
            </button>

            <button
              className="navbar-btn navbar-btn-icon"
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <i className="fa-solid fa-gear"></i>
            </button>

            <button
              className="navbar-btn"
              onClick={logout}
              title="Sign Out"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/auth')}
              style={{ borderRadius: '20px', padding: '6px 18px', fontSize: '13px', fontWeight: 500 }}
            >
              <i className="fa-solid fa-user" style={{ fontSize: '13px' }}></i>
              <span>Sign In</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
