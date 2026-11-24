/**
 * PowerPoint export of the Studio slides (browser only). Uses the same
 * element layout as the HTML preview: 1280×720 px = 13.33×7.5 in.
 */
import { callouts } from './diagram';
import type { Slide, SlideEl } from './slides';

type PSlide = ReturnType<InstanceType<typeof import('pptxgenjs').default>['addSlide']>;

const IN = (px: number) => px / 96;
const PT = (px: number) => Math.round(px * 0.75 * 10) / 10;
const hex = (c: string) => c.replace('#', '').toUpperCase();

/** PowerPoint does not read webp: images are converted to JPEG/PNG data URLs. */
async function dataUrl(src: string, cache: Map<string, Promise<{ data: string; w: number; h: number }>>, cropAspect?: number) {
  const key = cropAspect ? `${src}#${cropAspect.toFixed(3)}` : src;
  if (!cache.has(key))
    cache.set(
      key,
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // 'cover' pictures are cropped here (PowerPoint would stretch them)
          let sw = img.naturalWidth;
          let sh = img.naturalHeight;
          if (cropAspect) {
            if (sw / sh > cropAspect) sw = sh * cropAspect;
            else sh = sw / cropAspect;
          }
          const c = document.createElement('canvas');
          c.width = Math.round(sw);
          c.height = Math.round(sh);
          const g = c.getContext('2d')!;
          const png = src.endsWith('.png');
          if (!png) {
            g.fillStyle = '#ffffff';
            g.fillRect(0, 0, c.width, c.height);
          }
          g.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, 0, 0, c.width, c.height);
          resolve({ data: png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.9), w: c.width, h: c.height });
        };
        img.onerror = () => reject(new Error(`imagem não carregou: ${src}`));
        img.src = src;
      }),
    );
  return cache.get(key)!;
}

function contain(boxW: number, boxH: number, w: number, h: number) {
  const s = Math.min(boxW / w, boxH / h);
  return { w: w * s, h: h * s, dx: (boxW - w * s) / 2, dy: (boxH - h * s) / 2 };
}

export async function exportPptx(slides: Slide[], opts: { title: string; accent: string; fileName: string }) {
  const { default: PptxGenJS } = await import('pptxgenjs');
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = opts.title;
  pptx.company = 'BioLab 3D';
  const cache = new Map<string, Promise<{ data: string; w: number; h: number }>>();
  const accent = hex(opts.accent);

  for (const slide of slides) {
    const s = pptx.addSlide();
    s.background = { color: hex(slide.bg) };
    for (const el of slide.els) await addEl(s, el);
    if (slide.notes) s.addNotes(slide.notes);
  }
  await pptx.writeFile({ fileName: opts.fileName });

  async function addEl(s: PSlide, el: SlideEl) {
    if (el.type === 'rect') {
      s.addShape(el.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect, {
        x: IN(el.x),
        y: IN(el.y),
        w: IN(el.w),
        h: IN(el.h),
        fill: { color: hex(el.fill) },
        line: el.line ? { color: hex(el.line), width: 0.75 } : { type: 'none' },
        rectRadius: el.radius ? Math.min(0.5, el.radius / Math.min(el.w, el.h)) : undefined,
      });
      return;
    }
    if (el.type === 'image') {
      const img = await dataUrl(el.src, cache, el.fit === 'cover' ? el.w / el.h : undefined);
      const r = contain(el.w, el.h, img.w, img.h);
      s.addImage({ data: img.data, x: IN(el.x + r.dx), y: IN(el.y + r.dy), w: IN(r.w), h: IN(r.h) });
      return;
    }
    if (el.type === 'diagram') {
      const imgW = el.legend ? Math.min(el.w - 300, el.h * 1.6) : el.w;
      const imgH = imgW / 1.6;
      const img = await dataUrl(el.diagram.image.src, cache);
      s.addImage({ data: img.data, x: IN(el.x), y: IN(el.y), w: IN(imgW), h: IN(imgH) });
      const cs = callouts(el.diagram);
      const P = (fx: number, fy: number) => ({ x: el.x + fx * imgW, y: el.y + fy * imgH });
      for (const c of cs) {
        const a = P(c.ax, c.ay);
        const b = P(c.bx, c.by);
        const elbow = { x: b.x + (c.side === 'left' ? 1 : -1) * 46 * (imgW / 1280), y: b.y };
        for (const [p, q] of [
          [b, elbow],
          [elbow, a],
        ]) {
          s.addShape(pptx.ShapeType.line, {
            x: IN(Math.min(p.x, q.x)),
            y: IN(Math.min(p.y, q.y)),
            w: IN(Math.abs(q.x - p.x)),
            h: IN(Math.abs(q.y - p.y)),
            line: { color: accent, width: 1.5 },
            flipV: (q.x - p.x) * (q.y - p.y) < 0,
          });
        }
        const r = 15 * (imgW / 832);
        s.addShape(pptx.ShapeType.ellipse, { x: IN(a.x - 4), y: IN(a.y - 4), w: IN(8), h: IN(8), fill: { color: accent }, line: { color: 'FFFFFF', width: 1 } });
        s.addText(String(c.n), {
          shape: pptx.ShapeType.ellipse,
          x: IN(b.x - r),
          y: IN(b.y - r),
          w: IN(2 * r),
          h: IN(2 * r),
          fill: { color: 'FFFFFF' },
          line: { color: accent, width: 2 },
          align: 'center',
          valign: 'middle',
          fontSize: PT(r * 0.95),
          bold: true,
          color: accent,
          margin: 0,
        });
      }
      if (el.legend)
        s.addText(
          cs.map((c) => ({ text: `${c.n}  ${c.name}`, options: { breakLine: true, bold: true } })),
          { x: IN(el.x + imgW + 24), y: IN(el.y), w: IN(el.w - imgW - 24), h: IN(el.h), fontSize: PT(cs.length > 7 ? 18 : 20), color: '0F172A', valign: 'top', paraSpaceAfter: 8, fontFace: 'Calibri' },
        );
      return;
    }
    const base = {
      x: IN(el.x),
      y: IN(el.y),
      w: IN(el.w),
      h: IN(el.h),
      fontSize: PT(el.size),
      bold: !!el.bold,
      color: hex(el.color ?? '#0F172A'),
      fontFace: el.font === 'display' ? 'Calibri' : 'Calibri',
      align: el.align ?? 'left',
      valign: el.valign ?? 'top',
      margin: 0,
      charSpacing: el.caps ? 2 : undefined,
      fit: 'shrink' as const,
    };
    if (Array.isArray(el.text)) {
      s.addText(
        el.text.map((t) => ({ text: t, options: { bullet: el.bullets ? { code: '2022' } : false, breakLine: true } })),
        { ...base, paraSpaceAfter: PT(el.size * 0.35), lineSpacingMultiple: 1.05 },
      );
    } else s.addText(el.caps ? el.text.toUpperCase() : el.text, base);
  }
}
