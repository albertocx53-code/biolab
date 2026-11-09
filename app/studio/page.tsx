import Link from 'next/link';
import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { can } from '@/lib/permissions/tiers';
import { parseStudioParams, STUDIO_GENERATORS } from '@/data/studio/contract';
import { resolveTopic } from '@/services/content/topics';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Studio' };

export default async function StudioPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireSession('explorer.labs');
  const hasStudio = can(session.tier, 'studio.access');
  const ref = parseStudioParams(await searchParams);
  const topic = hasStudio && ref ? await resolveTopic(ref) : null;

  return (
    <div className="min-h-dvh bg-ink-900">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4 sm:px-6">
          <Link href="/explorar" className="flex items-center gap-2 text-fg-muted hover:text-fg">
            <Icon name="chevronLeft" size={18} /> Laboratórios
          </Link>
          <span className="ml-auto">
            <Logo size={24} />
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="eyebrow">BioLab 3D Studio</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">Materiais didáticos a partir do laboratório</h1>

        {!hasStudio ? (
          <div className="panel mt-8 p-6" data-testid="studio-locked">
            <p className="flex items-center gap-2 font-semibold">
              <Icon name="lock" size={18} /> O Studio faz parte do Plano Completo.
            </p>
            <p className="mt-2 text-fg-muted">Com o Plano Completo, você poderá gerar materiais a partir de qualquer estrutura explorada nos laboratórios, assim que os geradores forem lançados.</p>
          </div>
        ) : (
          <>
            <div className="panel mt-8 border-warn/30 p-5 text-sm" role="status" data-testid="studio-status">
              <p className="flex items-center gap-2 font-semibold text-warn">
                <Icon name="info" size={18} /> Geradores em desenvolvimento
              </p>
              <p className="mt-1.5 text-fg-muted">
                Os cinco geradores chegam na próxima fase do BioLab 3D. Esta página já recebe o tema escolhido no laboratório, para que nada precise ser
                refeito quando eles forem lançados.
              </p>
            </div>
            {topic ? (
              <section className="panel mt-6 p-6" data-testid="studio-topic">
                <p className="eyebrow">Tema recebido do Explorer</p>
                <h2 className="mt-1 text-2xl font-bold">{topic.namePtBR}</h2>
                <p className="text-sm text-fg-muted">
                  {topic.biologicalSystem}
                  {topic.scientificName ? ` · ${topic.scientificName}` : ''}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {topic.educationalTopics.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            ) : (
              ref && <p className="mt-6 text-sm text-danger">O tema enviado não foi encontrado no catálogo.</p>
            )}
          </>
        )}

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STUDIO_GENERATORS.map((g) => (
            <li key={g.id} className="panel p-5 opacity-80">
              <p className="font-semibold">{g.name}</p>
              <p className="mt-1 text-xs text-fg-subtle">Em desenvolvimento</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
