import React, { useState, useEffect, useCallback } from 'react';
import { filesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getAll();
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const response = await filesAPI.search(query);
        setFiles(response.data);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      loadFiles();
    }
  };

  const recentFiles = files.slice(0, 5);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!</p>
        </div>
        <div className="dashboard-actions">
          <div className="navbar-search" style={{ margin: 0 }}>
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <i className="fa-solid fa-search"></i>
          </div>
        </div>
      </div>

      <FileUpload onUploadComplete={loadFiles} />

      {user && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Files</div>
            <div className="stat-value">{files.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Storage Used</div>
            <div className="stat-value">{formatBytes(user.storageUsed)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Storage Limit</div>
            <div className="stat-value">{formatBytes(user.storageLimit)}</div>
          </div>
        </div>
      )}

      <h3 className="recent-header">Recent Files</h3>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <FileList files={recentFiles} onRefresh={loadFiles} />
      )}
    </>
  );
}

export default Dashboard;