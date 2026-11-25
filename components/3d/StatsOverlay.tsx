'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

/**
 * Tiny diagnostics readout (frames per second, draw calls, triangles, DPR),
 * shown only when the page is opened with `?stats=1`. Writes straight to a DOM
 * node twice a second, so it never re-renders React.
 */
export function StatsOverlay() {
  const gl = useThree((s) => s.gl);
  const el = useRef<HTMLDivElement | null>(null);
  const frames = useRef(0);
  const last = useRef(performance.now());

  useEffect(() => {
    // With the post-processing composer each pass resets gl.info; accumulate the whole frame instead
    // (reset by hand at the start of every frame, below).
    gl.info.autoReset = false;
    const div = document.createElement('div');
    div.setAttribute('data-testid', 'stats-overlay');
    div.style.cssText =
      'position:fixed;left:12px;bottom:12px;z-index:60;padding:6px 10px;border-radius:8px;font:11px/1.4 ui-monospace,monospace;' +
      'background:rgba(10,16,28,.82);color:#e2f2ff;pointer-events:none;white-space:pre';
    div.textContent = 'stats…';
    document.body.appendChild(div);
    el.current = div;
    // also report idle frames: with on-demand rendering the counter should stop at rest
    const timer = setInterval(() => {
      const now = performance.now();
      const dt = (now - last.current) / 1000;
      const fps = frames.current / Math.max(dt, 1e-3);
      frames.current = 0;
      last.current = now;
      const r = gl.info.render;
      const mem = gl.info.memory;
      div.textContent = `${fps.toFixed(0).padStart(3)} fps  ·  ${r.calls} draws  ·  ${(r.triangles / 1000).toFixed(0)}k tris\n${mem.geometries} geom · ${mem.textures} tex · dpr ${gl.getPixelRatio().toFixed(2)}`;
    }, 500);
    return () => {
      clearInterval(timer);
      gl.info.autoReset = true;
      div.remove();
      el.current = null;
    };
  }, [gl]);

  // runs before everything else in the frame: counts it and clears last frame's totals
  useFrame(() => {
    frames.current += 1;
    gl.info.reset();
  }, -1000);
  return null;
}

export function statsRequested() {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('stats') === '1';
  } catch {
    return false;
  }
}
