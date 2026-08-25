/**
 * Custom hook for managing a debounced search input value.
 *
 * Prevents excessive re-renders and API calls by only updating
 * the search value after the user stops typing for a set delay.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchText, 300);
 */

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
