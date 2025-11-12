"use client"
import { useState, useCallback } from 'react';
import { Medicine } from '../types';
import { searchMedicines } from '../api';
import { parseBarcode } from '../utils';

export const useMedicineSearch = () => {
  const [results, setResults] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { type, value } = parseBarcode(query);
      const response = await searchMedicines(value, type);
      console.log(response);
      
      if (response.success && response.data) {
        setResults(response.data.medicines);
      } else {
        setError(response.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      setError('An error occurred during search');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isSearching,
    error,
    search,
    clearResults
  };
};