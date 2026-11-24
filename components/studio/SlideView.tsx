'use client';

import { useEffect, useRef, useState } from 'react';
import { callouts } from '@/lib/studio/diagram';
import { SLIDE_H, SLIDE_W, type Slide, type SlideEl } from '@/lib/studio/slides';
import { DiagramView } from './DiagramView';

const FONT = { display: "'Manrope Variable', 'Inter Variable', sans-serif", body: "'Inter Variable', sans-serif" };

export function SlideCanvas({ slide, accent }: { slide: Slide; accent: string }) {
  return (
    <div style={{ width: SLIDE_W, height: SLIDE_H, background: slide.bg, position: 'relative', overflow: 'hidden', color: '#0f172a' }}>
      {slide.els.map((el, i) => (
        <El key={i} el={el} accent={accent} />
      ))}
    </div>
  );
}

function El({ el, accent }: { el: SlideEl; accent: string }) {
  const box = { position: 'absolute' as const, left: el.x, top: el.y, width: el.w, height: el.h };
  if (el.type === 'rect') return <div style={{ ...box, background: el.fill, borderRadius: el.radius ?? 0, border: el.line ? `1px solid ${el.line}` : undefined }} />;
  if (el.type === 'image')
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={el.src} alt="" style={{ ...box, objectFit: el.fit, borderRadius: el.radius ?? 0 }} />;
  if (el.type === 'diagram') {
    const imgW = el.legend ? Math.min(el.w - 300, el.h * 1.6) : el.w;
    const cs = callouts(el.diagram);
    return (
      <div style={box}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: imgW, height: imgW / 1.6 }}>
          <DiagramView src={el.diagram.image.src} callouts={cs} accent={accent} className="h-full w-full" />
        </div>
        {el.legend && (
          <ol style={{ position: 'absolute', left: imgW + 24, top: 10, width: el.w - imgW - 24, fontSize: cs.length > 7 ? 18 : 20, lineHeight: 1.25 }}>
            {cs.map((c) => (
              <li key={c.n} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'baseline' }}>
                <b style={{ color: accent, minWidth: 26 }}>{c.n}</b>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  }
  const style = {
    ...box,
    fontSize: el.size,
    fontWeight: el.bold ? 700 : 400,
    color: el.color ?? '#0f172a',
    fontFamily: FONT[el.font ?? 'body'],
    textAlign: el.align ?? 'left',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: el.valign === 'middle' ? 'center' : el.valign === 'bottom' ? 'flex-end' : 'flex-start',
    lineHeight: el.font === 'display' ? 1.12 : 1.3,
    letterSpacing: el.caps ? '0.08em' : undefined,
    textTransform: el.caps ? ('uppercase' as const) : undefined,
    overflow: 'hidden',
  };
  if (Array.isArray(el.text))
    return (
      <ul style={{ ...style, listStyle: 'none', padding: 0, margin: 0 }}>
        {el.text.map((t, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.55em', marginBottom: '0.35em' }}>
            {el.bullets && <span style={{ color: accent, fontWeight: 800 }}>•</span>}
            <span>{t}</span>
          </li>
        ))}
      </ul>
    );
  return <div style={style}>{el.text}</div>;
}

/** Scales a 1280×720 slide to the width of its container. */
export function ScaledSlide({ slide, accent, className }: { slide: Slide; accent: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / SLIDE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: '100%', aspectRatio: `${SLIDE_W} / ${SLIDE_H}`, overflow: 'hidden' }}>
      {scale > 0 && (
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
          <SlideCanvas slide={slide} accent={accent} />
        </div>
      )}
    </div>
  );
}
