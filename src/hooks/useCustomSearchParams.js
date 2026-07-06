'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useCustomSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams = useCallback(
    (params) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (typeof params === 'function') {
        params(newSearchParams);
      } else {
        Object.entries(params).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            newSearchParams.delete(key);
          } else {
            newSearchParams.set(key, value);
          }
        });
      }
      router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  return [searchParams, setSearchParams];
}
