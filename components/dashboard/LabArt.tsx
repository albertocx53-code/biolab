/**
 * Lightweight vector previews for laboratory cards (no 3D on the dashboard,
 * by design: heavy scenes load only inside each laboratory).
 * Schematic illustrations — they are not the laboratory models themselves.
 */
import type { LaboratoryId } from '@/data/biology/schema';

export function LabArt({ id, accent }: { id: LaboratoryId; accent: string }) {
  const stroke = { stroke: accent, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const soft = { stroke: '#94A3B8', strokeOpacity: 0.55, strokeWidth: 1.1, fill: 'none', strokeLinecap: 'round' as const };
  switch (id) {
    case 'plantas':
      return (
        <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
          <path d="M100 128V62" {...stroke} />
          <path d="M100 96c-18-4-30-16-32-32 18 2 30 14 32 32ZM100 84c16-6 26-18 26-34-16 4-26 16-26 34Z" {...stroke} fill={accent} fillOpacity=".12" />
          <circle cx="100" cy="44" r="7" {...stroke} fill={accent} fillOpacity=".25" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="100" cy="30" rx="6" ry="13" transform={`rotate(${a} 100 44)`} {...stroke} fill={accent} fillOpacity=".08" />
          ))}
          <path d="M100 128c-6 4-16 6-26 6M100 128c6 5 18 6 30 6M100 128c-2 5-10 9-14 12M100 128c3 5 8 9 10 12" {...soft} />
        </svg>
      );
    case 'animais':
      return (
        <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
          {/* schematic frog, dorsal view */}
          <ellipse cx="100" cy="74" rx="28" ry="34" {...stroke} fill={accent} fillOpacity=".08" />
          <circle cx="86" cy="44" r="7" {...stroke} />
          <circle cx="114" cy="44" r="7" {...stroke} />
          <path d="M76 92c-14 6-22 16-20 28l12-2M124 92c14 6 22 16 20 28l-12-2M78 62c-12 2-20 8-22 18M122 62c12 2 20 8 22 18" {...stroke} />
          <path d="M92 70h16M90 80h20M92 90h16" {...soft} />
        </svg>
      );
    case 'celulas':
      return (
        <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
          <path d="M100 14c38 0 70 22 70 56s-32 56-70 56-70-22-70-56 32-56 70-56Z" {...stroke} fill={accent} fillOpacity=".06" />
          <circle cx="96" cy="68" r="18" {...stroke} fill={accent} fillOpacity=".14" />
          <circle cx="100" cy="64" r="6" fill={accent} fillOpacity=".5" />
          <ellipse cx="140" cy="54" rx="13" ry="6" transform="rotate(-20 140 54)" {...stroke} />
          <path d="M131 55c4-3 6 3 9 0s5 3 9 0" {...soft} />
          <ellipse cx="62" cy="96" rx="12" ry="5.5" transform="rotate(25 62 96)" {...stroke} />
          <path d="M120 92c8-6 18-6 26 0M122 99c8-5 16-5 22 0M124 106c6-4 12-4 18 0" {...soft} />
          {[[60, 50], [70, 40], [150, 86], [84, 106], [112, 112], [52, 76]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill="#94A3B8" fillOpacity=".7" />
          ))}
        </svg>
      );
    case 'genetica':
      return (
        <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
          {Array.from({ length: 13 }, (_, i) => {
            const x = 24 + i * 12.5;
            const y1 = 70 + 34 * Math.sin(i * 0.55);
            const y2 = 70 - 34 * Math.sin(i * 0.55);
            return <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke={i % 2 ? '#94A3B8' : accent} strokeOpacity=".55" strokeWidth="2" />;
          })}
          <path d={Array.from({ length: 61 }, (_, i) => `${i ? 'L' : 'M'}${24 + i * 2.5} ${70 + 34 * Math.sin(i * 0.11)}`).join('')} {...stroke} strokeWidth={2.4} />
          <path d={Array.from({ length: 61 }, (_, i) => `${i ? 'L' : 'M'}${24 + i * 2.5} ${70 - 34 * Math.sin(i * 0.11)}`).join('')} stroke="#F8FAFC" strokeOpacity=".75" strokeWidth={2.4} fill="none" />
        </svg>
      );
    case 'microrganismos':
      return (
        <svg viewBox="0 0 200 140" className="h-full w-full" aria-hidden="true">
          {/* schematic rod bacterium with flagellum */}
          <rect x="58" y="54" width="84" height="34" rx="17" {...stroke} fill={accent} fillOpacity=".1" />
          <rect x="63" y="59" width="74" height="24" rx="12" {...soft} />
          <path d="M142 71c10 0 10-10 20-10s10 10 20 10" {...stroke} />
          <path d="M80 70c6-6 12 6 18 0s12 6 18 0" {...soft} />
          {/* schematic virus */}
          <circle cx="44" cy="32" r="10" {...stroke} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={44 + 10 * Math.cos(a)} y1={32 + 10 * Math.sin(a)} x2={44 + 15 * Math.cos(a)} y2={32 + 15 * Math.sin(a)} stroke={accent} strokeWidth="1.4" />;
          })}
        </svg>
      );
    default:
      return null;
  }
}
