import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

function Settings() {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');

    if (!profileData.fullName.trim()) {
      setProfileError('Full name is required');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(profileData);
      setProfileMessage('Profile updated successfully');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSaving(false);
    }
  };

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
    <div className="settings-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Section */}
      <div className="settings-section">
        <h3>Profile Information</h3>
        {profileMessage && (
          <div style={{ color: 'var(--success)', fontSize: '14px', marginBottom: '16px' }}>
            {profileMessage}
          </div>
        )}
        {profileError && (
          <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>
            {profileError}
          </div>
        )}
        <form onSubmit={handleProfileUpdate}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Email cannot be changed
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input
              type="text"
              className="form-input"
              value={profileData.avatarUrl}
              onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
              placeholder="Enter avatar URL (optional)"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="settings-section">
        <h3>Update Password</h3>
        {passwordMessage && (
          <div style={{ color: 'var(--success)', fontSize: '14px', marginBottom: '16px' }}>
            {passwordMessage}
          </div>
        )}
        {passwordError && (
          <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>
            {passwordError}
          </div>
        )}
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Theme Section */}
      <div className="settings-section">
        <h3>Theme Preferences</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Dark Mode</div>
            <div className="settings-value" style={{ marginTop: '4px' }}>
              Switch between light and dark theme
            </div>
          </div>
          <button
            className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
          ></button>
        </div>
      </div>

      {/* Storage Section */}
      <div className="settings-section">
        <h3>Storage Usage</h3>
        <div className="settings-row">
          <div className="settings-label">Storage Used</div>
          <div className="settings-value">{formatBytes(user?.storageUsed || 0)}</div>
        </div>
        <div className="settings-row">
          <div className="settings-label">Storage Limit</div>
          <div className="settings-value">{formatBytes(user?.storageLimit || 0)}</div>
        </div>
        <div className="settings-row">
          <div className="settings-label">Usage</div>
          <div className="settings-value" style={{ width: '60%' }}>
            <div className="storage-bar">
              <div
                className="storage-bar-fill"
                style={{ width: `${storagePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="settings-section">
        <h3>Account</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Sign Out</div>
            <div className="settings-value" style={{ marginTop: '4px' }}>
              Sign out of your account on this device
            </div>
          </div>
          <button className="btn btn-danger" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;