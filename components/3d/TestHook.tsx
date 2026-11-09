'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/** Exposes the R3F state to automated tests / performance probes (read-only use). */
export function TestHook() {
  const get = useThree((s) => s.get);
  useEffect(() => {
    const w = window as unknown as { __biolab?: Record<string, unknown> };
    w.__biolab = { ...(w.__biolab ?? {}), three: get };
  }, [get]);
  return null;
}
