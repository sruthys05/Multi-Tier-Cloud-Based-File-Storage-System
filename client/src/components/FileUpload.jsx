import React, { useState, useRef, useCallback } from "react";
import { filesAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "./Toast";

function FileUpload({ onUploadComplete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Upload file
  const uploadFile = async (file) => {
    if (!user) {
      showToast("Please sign in or register to upload files.", "error");
      navigate("/auth");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      showToast("File size exceeds 500MB limit.", "error");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

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

      showToast("File uploaded successfully!", "success");

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      setUploading(false);
      setProgress(0);

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please try again.";

      showToast(msg, "error");
    }
  };

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

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      const files = e.dataTransfer.files;

      if (files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [user]
  );

  const handleFileSelect = (e) => {
    const files = e.target.files;

    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      <i className="fa-solid fa-cloud-arrow-up"></i>

      <h3>Drag and Drop Files Here</h3>

      <p>or click to browse</p>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
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