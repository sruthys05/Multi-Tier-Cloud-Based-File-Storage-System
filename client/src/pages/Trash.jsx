import React, { useState, useEffect, useCallback } from 'react';
import { filesAPI } from '../services/api';
import FileList from '../components/FileList';

function Trash() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getTrash();
      setFiles(response.data);
    } catch (err) {
      console.error('Failed to load trash:', err);
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
          <h1>Trash</h1>
          <p>Deleted files are moved here for 30 days</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <FileList files={files} onRefresh={loadFiles} showTrashActions={true} />
      )}
    </>
  );
}

export default Trash;