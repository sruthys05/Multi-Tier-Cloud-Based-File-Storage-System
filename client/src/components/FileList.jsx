import React, { useState } from 'react';
import { filesAPI } from '../services/api';

const getFileIcon = (fileName, fileType) => {
  if (fileType?.startsWith('image/')) return 'fa-regular fa-file-image file-icon-image';
  if (fileType?.startsWith('video/')) return 'fa-regular fa-file-video file-icon-video';
  if (fileType?.startsWith('audio/')) return 'fa-regular fa-file-audio file-icon-audio';
  if (fileType?.includes('pdf')) return 'fa-regular fa-file-pdf file-icon-pdf';
  if (fileType?.includes('word') || fileType?.includes('document')) return 'fa-regular fa-file-word file-icon-word';
  if (fileType?.includes('excel') || fileType?.includes('sheet')) return 'fa-regular fa-file-excel file-icon-excel';
  if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return 'fa-regular fa-file-powerpoint file-icon-ppt';
  if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('compress')) return 'fa-regular fa-file-zipper file-icon-zip';
  if (fileType?.includes('javascript') || fileType?.includes('json') || fileType?.includes('xml') || fileType?.includes('html')) return 'fa-regular fa-file-code file-icon-code';
  if (fileType?.startsWith('text/')) return 'fa-regular fa-file-lines file-icon-text';
  return 'fa-regular fa-file file-icon-default';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `Today at ${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

function FileList({ files, onRefresh, showTrashActions = false }) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const handleDownload = async (file) => {
    try {
      const response = await filesAPI.download(file.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  const handleToggleFavorite = async (fileId) => {
    try {
      await filesAPI.toggleFavorite(fileId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to update favorite');
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Move this file to trash?')) return;
    try {
      await filesAPI.delete(fileId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  const handleRename = async (fileId) => {
    if (!renameValue.trim()) return;
    try {
      await filesAPI.rename(fileId, renameValue.trim());
      setRenamingId(null);
      setRenameValue('');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to rename file');
    }
  };

  const handleShare = async (file) => {
    const permission = window.prompt('Enter permission (VIEW or DOWNLOAD):', 'VIEW');
    if (!permission) return;
    const hours = window.prompt('Enter expiry hours (e.g., 24):', '24');
    if (!hours) return;
    try {
      await filesAPI.share(file.id, { permission: permission.toUpperCase(), expiryHours: parseInt(hours, 10) });
      alert('Share link generated');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create share link');
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (!window.confirm('Permanently delete this file? This action cannot be undone.')) return;
    try {
      await filesAPI.permanentDelete(fileId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to permanently delete file');
    }
  };

  const handleRestore = async (fileId) => {
    try {
      await filesAPI.restore(fileId);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to restore file');
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa-regular fa-folder-open"></i>
        <h3>No files found</h3>
        <p>Upload files to get started</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <span>Name</span>
        <span>Size</span>
        <span>Date</span>
        <span>Actions</span>
      </div>
      {files.map((file) => (
        <div key={file.id} className="file-item">
          <div className="file-name" onClick={() => handleDownload(file)} title="Download">
            <i className={getFileIcon(file.originalFileName, file.fileType)}></i>
            {renamingId === file.id ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRename(file.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(file.id)}
                className="form-input"
                style={{ padding: '4px 8px', fontSize: '14px' }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{file.originalFileName}</span>
            )}
          </div>
          <div className="file-size">{formatSize(file.fileSize)}</div>
          <div className="file-date">{formatDate(file.createdAt)}</div>
          <div className="file-actions">
            {showTrashActions ? (
              <>
                <button
                  className="file-action-btn"
                  onClick={() => handleRestore(file.id)}
                  title="Restore"
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </button>
                <button
                  className="file-action-btn delete"
                  onClick={() => handlePermanentDelete(file.id)}
                  title="Delete permanently"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </>
            ) : (
              <>
                <button
                  className="file-action-btn"
                  onClick={() => handleShare(file)}
                  title="Share"
                >
                  <i className="fa-solid fa-share-nodes"></i>
                </button>
                <button
                  className="file-action-btn"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <i className="fa-solid fa-download"></i>
                </button>
                <button
                  className={`file-action-btn ${file.favorite ? 'favorite' : ''}`}
                  onClick={() => handleToggleFavorite(file.id)}
                  title={file.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <i className={`fa-solid ${file.favorite ? 'fa-star' : 'fa-regular fa-star'}`}></i>
                </button>
                <button
                  className="file-action-btn"
                  onClick={() => {
                    setRenamingId(file.id);
                    setRenameValue(file.originalFileName);
                  }}
                  title="Rename"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button
                  className="file-action-btn delete"
                  onClick={() => handleDelete(file.id)}
                  title="Delete"
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FileList;