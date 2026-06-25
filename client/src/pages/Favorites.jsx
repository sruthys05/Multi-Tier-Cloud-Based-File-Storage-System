import React, { useState, useEffect, useCallback } from 'react';
import { filesAPI } from '../services/api';
import FileList from '../components/FileList';

function Favorites() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getFavorites();
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Favorites</h1>
          <p>Your starred files and folders</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <FileList files={files} onRefresh={loadFiles} />
      )}
    </>
  );
}

export default Favorites;