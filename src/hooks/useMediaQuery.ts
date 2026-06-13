import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks the state of a CSS media query.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    media.addEventListener('change', listener);
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Custom hook to check if the current viewport is mobile (<= breakpoint).
 */
export function useIsMobile(breakpoint = 1024): boolean {
  return useMediaQuery(`(max-width: ${breakpoint}px)`);
}
