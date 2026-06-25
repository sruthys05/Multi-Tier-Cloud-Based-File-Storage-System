import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { path: '/', icon: 'fa-solid fa-house', label: 'Dashboard' },
  { path: '/my-files', icon: 'fa-solid fa-folder', label: 'My Files' },
  { path: '/recent', icon: 'fa-solid fa-clock-rotate-left', label: 'Recent Files' },
  { path: '/favorites', icon: 'fa-solid fa-star', label: 'Favorites' },
  { path: '/trash', icon: 'fa-solid fa-trash-can', label: 'Trash' },
  { path: '/settings', icon: 'fa-solid fa-gear', label: 'Settings' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercent = user
    ? Math.min((user.storageUsed / user.storageLimit) * 100, 100)
    : 0;

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="secure-logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z" fill="var(--primary)"/>
            <path d="M9 12L11 14L15 10" stroke="var(--bg)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span className="sidebar-logo-text" style={{ fontFamily: "'Sekuya', cursive", fontWeight: 350 }}>DATA VAULT.</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sekuya&display=swap');
      `}</style>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      {user && (
        <div className="sidebar-storage">
          <div className="storage-bar">
            <div
              className="storage-bar-fill"
              style={{ width: `${storagePercent}%` }}
            ></div>
          </div>
          <div className="storage-text">
            {formatBytes(user.storageUsed)} of {formatBytes(user.storageLimit)} used
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
