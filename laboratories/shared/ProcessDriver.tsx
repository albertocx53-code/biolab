'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { processClock, useProcess, type LabProcess } from './process';

/** Advances the process clock and moves through the steps while playing. */
export function ProcessDriver({ processes }: { processes: Record<string, LabProcess> }) {
  const invalidate = useThree((s) => s.invalidate);
  const id = useProcess((s) => s.id);
  const playing = useProcess((s) => s.playing);
  useEffect(() => {
    if (id) invalidate();
  }, [id, playing, invalidate]);
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
    }
    invalidate(); // keep particles moving (also while paused, for a gentle idle motion)
  });
  return null;
}
