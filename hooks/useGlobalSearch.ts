'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SearchResult {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  image_path: string | null;
  division_id: string;
  divisions: {
    slug: string;
  };
}

export function useGlobalSearch(division?: string, debounceMs = 300) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchResults = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    
    // Short query check (avoid unnecessary backend calls)
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setError(null);
      // Abort any ongoing request if we backspaced below threshold
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    setIsSearching(true);
    setError(null);

    // Cancel previous request if it's still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for the current request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let url = `/api/search?q=${encodeURIComponent(trimmed)}&limit=10`;
      if (division) {
        url += `&division=${encodeURIComponent(division)}`;
      }

      const response = await fetch(url, {
        signal: abortController.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: Failed to search`);
      }

      const { data } = await response.json();
      
      // Ensure we only update state if this is the most recent request
      if (!abortController.signal.aborted) {
        setResults(data || []);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong while searching.');
        setResults([]);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [division]);

  // Debounce the fetch call
  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchResults(query);
    }, debounceMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [query, fetchResults, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    hasNoResults: query.trim().length >= 2 && !isSearching && !error && results.length === 0,
    isIdle: query.trim().length < 2
  };
}
