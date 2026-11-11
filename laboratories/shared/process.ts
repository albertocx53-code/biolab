/**
 * Shared process-animation state for the procedural laboratories (Cells,
 * Plants…). Only one laboratory is open at a time, so a single store is used.
 */
import { create } from 'zustand';

export interface LegendItem {
  color: string;
  label: string;
}
export interface ProcessStep {
  title: string;
  text: string;
  seconds: number;
  legend?: LegendItem[];
}
export interface LabProcess {
  id: string;
  title: string;
  /** Structure ids linked to the process (Studio topics, related panel). */
  structures: string[];
  note: string;
  equation?: string;
  loop?: boolean;
  /** Step buttons show the step title instead of its number (e.g. mitosis phases). */
  namedSteps?: boolean;
  steps: ProcessStep[];
}

/** Shared clock for the active process (UI reads id/step; the 3D layer reads progress). */
export interface ProcessState {
  id: string | null;
  step: number;
  playing: boolean;
  start(id: string, playing?: boolean): void;
  stop(): void;
  setStep(step: number): void;
  setPlaying(p: boolean): void;
}
export const useProcess = create<ProcessState>((set) => ({
  id: null,
  step: 0,
  playing: false,
  start: (id, playing = true) => {
    processClock.t = 0;
    set({ id, step: 0, playing });
  },
  stop: () => set({ id: null, step: 0, playing: false }),
  setStep: (step) => {
    processClock.t = 0;
    set({ step });
  },
  setPlaying: (playing) => set({ playing }),
}));

/** Seconds elapsed in the current step (mutable, advanced every frame while playing). */
export const processClock = { t: 0 };

/** Eased progress (0–1) of the current step; `lead` < 1 finishes the motion early. */
export function stepProgress(processes: Record<string, LabProcess>, lead = 1) {
  const st = useProcess.getState();
  if (!st.id) return 0;
  const dur = processes[st.id].steps[st.step].seconds;
  const u = Math.min(1, processClock.t / (dur * lead));
  return u * u * (3 - 2 * u);
}
