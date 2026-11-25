/**
 * Cheap, render-loop-friendly interaction flags shared between the camera rig
 * and the pickable models. Kept outside the Zustand store on purpose: they
 * change many times per second and must never trigger React renders.
 */
export const interaction = {
  /** True while the user is orbiting / panning / dollying the camera. */
  cameraMoving: false,
};
