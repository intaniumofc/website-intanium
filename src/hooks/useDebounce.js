import { useState, useEffect } from 'react';

/**
 * Reusable debouncing hook for delay filters and fetch inputs.
 * @param {any} value 
 * @param {number} delay time in milliseconds
 * @returns {any}
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
