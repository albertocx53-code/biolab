'use client';

import { Icon } from '@/components/ui/Icon';

export const SHORTCUTS: [string, string][] = [
  ['P', 'Entrar / sair do Modo Apresentação'],
  ['H', 'Ocultar / mostrar a interface'],
  ['R', 'Reiniciar a câmera'],
  ['1 – 4', 'Vistas: frente, costas, lado esquerdo, lado direito'],
  ['F', 'Focar a estrutura selecionada'],
  ['I', 'Isolar a estrutura selecionada'],
  ['X', 'Ocultar a estrutura selecionada'],
  ['A', 'Mostrar tudo novamente'],
  ['L', 'Mostrar / ocultar rótulos'],
  ['+ / −', 'Aproximar / afastar'],
  ['/', 'Buscar estrutura'],
  ['Esc', 'Desmarcar seleção / sair'],
];

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" onClick={onClose}>
      <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="flex items-center gap-2 text-lg font-bold">
            <Icon name="keyboard" /> Atalhos de teclado
          </h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <Icon name="close" size={16} />
          </button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="contents">
              <dt>
                <kbd className="rounded-md border border-line-strong bg-ink-950 px-2 py-0.5 font-mono text-xs">{k}</kbd>
              </dt>
              <dd className="text-fg-muted">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
