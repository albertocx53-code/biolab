'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { processClock, useProcess, type LabProcess } from './process';

/** How long frames keep coming after a change while paused, so eased poses settle. */
const SETTLE_MS = 1200;

/**
 * Advances the process clock and moves through the steps while playing.
 * The canvas renders on demand: frames are requested while a process plays
 * (or declares `idle` motion) and for a short settle window after any change
 * (start, step, pause), so a paused or finished animation costs nothing on
 * the GPU once its pose has settled.
 */
export function ProcessDriver({ processes }: { processes: Record<string, LabProcess> }) {
  const invalidate = useThree((s) => s.invalidate);
  const id = useProcess((s) => s.id);
  const playing = useProcess((s) => s.playing);
  const step = useProcess((s) => s.step);
  const settleUntil = useRef(0);
  useEffect(() => {
    settleUntil.current = performance.now() + SETTLE_MS;
    invalidate();
  }, [id, playing, step, invalidate]);
  useFrame((_, dt) => {
    const st = useProcess.getState();
    if (!st.id) return;
    const proc = processes[st.id];
    if (!proc) return;
    if (st.playing) {
      processClock.t += Math.min(dt, 0.1);
      const dur = proc.steps[st.step].seconds;
      if (processClock.t >= dur) {
        if (st.step < proc.steps.length - 1) st.setStep(st.step + 1);
        else if (proc.loop) st.setStep(0);
        else {
          processClock.t = dur;
          st.setPlaying(false);
        }
      }
      invalidate();
    } else if (proc.idle || performance.now() < settleUntil.current) {
      invalidate();
    }
  });
  return null;
}
