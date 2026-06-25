import React, { useState, useEffect, useCallback } from 'react';
import { filesAPI } from '../services/api';
import FileUpload from '../components/FileUpload';
import FileList from '../components/FileList';

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

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

  const handleFilter = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.filter(typeFilter, sortOrder);
      setFiles(response.data);
    } catch (err) {
      console.error('Filter failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTypeFilter('');
    setSortOrder('desc');
    loadFiles();
  };

  return (
    <>
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>My Files</h1>
          <p>All your uploaded files</p>
        </div>
        <div className="dashboard-actions">
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="">All Types</option>
            <option value="image/">Images</option>
            <option value="video/">Videos</option>
            <option value="audio/">Audio</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="excel">Excel</option>
            <option value="zip">ZIP</option>
          </select>
          <select
            className="form-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
          <button className="btn btn-primary" onClick={handleFilter}>Apply</button>
          <button className="btn btn-outline" onClick={handleReset}>Reset</button>
        </div>
      </div>

      <FileUpload onUploadComplete={handleReset} />

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <FileList files={files} onRefresh={handleReset} />
      )}
    </>
  );
}

export default MyFiles;
