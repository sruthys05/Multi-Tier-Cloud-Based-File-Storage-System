import { useState, useEffect, useCallback } from 'react';
import { filesAPI } from '../services/api';

export function useFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await filesAPI.getAll();
      setFiles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return { files, loading, error, refresh: loadFiles };
}

export function useFavoriteFiles() {
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

  return { files, loading, refresh: loadFiles };
}

export function useTrashFiles() {
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

  return { files, loading, refresh: loadFiles };
}

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const response = await filesAPI.search(query);
      setResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, search };
}

export function useFilter() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const filter = useCallback(async (type, sort = 'desc') => {
    try {
      setLoading(true);
      const response = await filesAPI.filter(type, sort);
      setFiles(response.data);
    } catch (err) {
      console.error('Filter failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { files, loading, filter };
}

export function useFileVersions(fileId) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadVersions = useCallback(async () => {
    if (!fileId) return;
    try {
      setLoading(true);
      const response = await filesAPI.getVersions(fileId);
      setVersions(response.data);
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return { versions, loading, refresh: loadVersions };
}

export function useFileShares(fileId) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadShares = useCallback(async () => {
    if (!fileId) return;
    try {
      setLoading(true);
      const response = await filesAPI.getShares(fileId);
      setShares(response.data);
    } catch (err) {
      console.error('Failed to load shares:', err);
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  const createShare = useCallback(async (fileId, permission, expiryHours) => {
    try {
      const response = await filesAPI.share(fileId, { permission, expiryHours });
      setShares((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  const revokeShare = useCallback(async (shareId) => {
    try {
      await filesAPI.revokeShare(shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch (err) {
      throw err;
    }
  }, []);

  return { shares, loading, createShare, revokeShare, refresh: loadShares };
}