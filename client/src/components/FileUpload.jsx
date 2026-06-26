import React, { useState, useRef, useCallback } from 'react';
import { filesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';

function FileUpload({ onUploadComplete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  // ✅ MAIN UPLOAD FUNCTION
  const uploadFile = useCallback(async (file) => {
    if (!user) {
      showToast('Please sign in or register to upload files.', 'error');
      navigate('/auth');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await filesAPI.upload(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        }
      });

      setUploading(false);
      setProgress(0);

      onUploadComplete?.();
    } catch (err) {
      setUploading(false);
      setProgress(0);

      const msg =
        err.response?.data?.message ||
        err.message ||
        'Upload failed. Please try again.';

      showToast(msg, 'error');
    }
  }, [user, navigate, showToast, onUploadComplete]);

  // ✅ FIXED: include uploadFile dependency properly
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      const files = e.dataTransfer.files;
      if (files?.length) {
        const file = files[0];

        if (file.size > 500 * 1024 * 1024) {
          showToast('File size exceeds 500MB limit', 'error');
          return;
        }

        uploadFile(file);
      }
    },
    [uploadFile, showToast]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  // ✅ FIXED: wrap in useCallback
  const handleFileSelect = useCallback(
    (e) => {
      const files = e.target.files;
      if (files?.length) {
        uploadFile(files[0]);
      }
    },
    [uploadFile]
  );

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <i className="fa-solid fa-cloud-arrow-up"></i>
      <h3>Drag and drop files here</h3>
      <p>or click to browse files</p>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">
            Uploading... {progress}%
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;