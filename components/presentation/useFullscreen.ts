'use client';

import { useCallback, useEffect, useState } from 'react';

/** Fullscreen API wrapper with graceful fallback (e.g. iOS Safari without element fullscreen). */
export function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const onChange = () => setActive(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const enter = useCallback(async () => {
    try {
      if (ref.current && !document.fullscreenElement && ref.current.requestFullscreen) await ref.current.requestFullscreen();
    } catch {
      /* fullscreen not allowed: presentation layout still applies */
    }
  }, [ref]);
  const exit = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  }, []);
  return { active, enter, exit };
}
