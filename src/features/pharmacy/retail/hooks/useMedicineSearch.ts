"use client"
import { useState, useCallback, useEffect, useRef } from 'react';
import { Medicine } from '../types';
import { searchMedicines } from '../api';
import { parseBarcode } from '../utils';

// In-memory cache for medicines
let medicineCache: Medicine[] = [];
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useMedicineSearch = () => {
  const [results, setResults] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all medicines on mount for instant client-side filtering
  useEffect(() => {
    const preload = async () => {
      const now = Date.now();
      if (medicineCache.length > 0 && (now - cacheTimestamp) < CACHE_TTL) return;

      try {
        const response = await searchMedicines('', 'name');
        if (response.success && response.data) {
          medicineCache = response.data.medicines;
          cacheTimestamp = Date.now();
        }
      } catch {
        // Silently fail - will fall back to API search
      }
    };
    preload();
  }, []);

  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Cancel previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Instant client-side filter if cache exists
    if (medicineCache.length > 0) {
      const q = query.toLowerCase();
      const filtered = medicineCache.filter(m =>
        m.brand_name?.toLowerCase().includes(q) ||
        m.generic_name?.toLowerCase().includes(q) ||
        m.barcode?.toLowerCase().includes(q) ||
        m.sku?.toLowerCase().includes(q) ||
        m.batch_number?.toLowerCase().includes(q)
      );
      setResults(filtered.slice(0, 15)); // Limit to 15 results
      setIsSearching(false);
      return;
    }

    // Fallback to API search with debounce
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { type, value } = parseBarcode(query);
        const response = await searchMedicines(value, type);
        if (response.success && response.data) {
          setResults(response.data.medicines);
        } else {
          setError(response.error || 'Search failed');
          setResults([]);
        }
      } catch {
        setError('An error occurred during search');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150);
  }, []);

  // Invalidate cache (call after a sale to refresh stock levels)
  const invalidateCache = useCallback(() => {
    medicineCache = [];
    cacheTimestamp = 0;
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
    clearResults,
    invalidateCache
  };
};