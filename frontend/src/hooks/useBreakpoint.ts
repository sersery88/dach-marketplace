import { useState, useEffect } from 'react';

// TailwindCSS default breakpoints
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current breakpoint
 * @returns Object with current breakpoint info and helper functions
 */
export function useBreakpoint() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isAbove = (bp: Breakpoint) => windowWidth >= breakpoints[bp];
  const isBelow = (bp: Breakpoint) => windowWidth < breakpoints[bp];
  const isBetween = (minBp: Breakpoint, maxBp: Breakpoint) =>
    windowWidth >= breakpoints[minBp] && windowWidth < breakpoints[maxBp];

  const current: Breakpoint | 'xs' =
    windowWidth >= breakpoints['2xl'] ? '2xl' :
    windowWidth >= breakpoints.xl ? 'xl' :
    windowWidth >= breakpoints.lg ? 'lg' :
    windowWidth >= breakpoints.md ? 'md' :
    windowWidth >= breakpoints.sm ? 'sm' : 'xs';

  return {
    width: windowWidth,
    current,
    isMobile: windowWidth < breakpoints.md,
    isTablet: isBetween('md', 'lg'),
    isDesktop: windowWidth >= breakpoints.lg,
    isAbove,
    isBelow,
    isBetween,
  };
}

/**
 * Simple hook for mobile detection
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

export default useBreakpoint;

