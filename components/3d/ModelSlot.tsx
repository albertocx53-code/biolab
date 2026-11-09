'use client';

import { Component, Suspense, useEffect, type ReactNode } from 'react';
import { useViewer } from '@/engine/store';

/** Marks a model as loading while its Suspense boundary is pending. */
function LoadingMarker({ modelId }: { modelId: string }) {
  useEffect(() => {
    const s = useViewer.getState();
    if (s.modelState[modelId] !== 'ready') s.setModelState(modelId, 'loading');
  }, [modelId]);
  return null;
}

class ModelErrorBoundary extends Component<{ modelId: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(`[BioLab] falha ao carregar o modelo ${this.props.modelId}`, error);
    useViewer.getState().setModelState(this.props.modelId, 'error');
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Suspense + error boundary around one lazily-loaded model. */
export function ModelSlot({ modelId, children }: { modelId: string; children: ReactNode }) {
  return (
    <ModelErrorBoundary modelId={modelId}>
      <Suspense fallback={<LoadingMarker modelId={modelId} />}>{children}</Suspense>
    </ModelErrorBoundary>
  );
}
