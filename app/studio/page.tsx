import Link from 'next/link';
import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { can } from '@/lib/permissions/tiers';
import { parseStudioParams, STUDIO_GENERATORS, type StudioGeneratorId } from '@/data/studio/contract';
import { resolveTopic } from '@/services/content/topics';
import { buildPack, lessonCards, lessonsShowing } from '@/services/studio/pack';
import { LABORATORIES } from '@/data/biology/laboratories';
import { lessonById } from '@/data/biology/lessons';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { StudioWorkspace } from '@/components/studio/StudioWorkspace';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Studio' };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function StudioPage({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await requireSession('explorer.labs');
  const hasStudio = can(session.tier, 'studio.access');
  const sp = await searchParams;
  const ref = parseStudioParams(sp);
  const topic = hasStudio && ref ? await resolveTopic(ref) : null;
  const lessonId = one(sp.aula);
  const pack = hasStudio && lessonId && lessonById(lessonId) ? await buildPack(lessonId) : null;
  const tool: StudioGeneratorId = STUDIO_GENERATORS.find((g) => g.id === one(sp.gerador))?.id ?? 'slides';
  const labFilter = one(sp.lab) ?? ref?.laboratoryId;
  const matching = ref && topic ? lessonsShowing(ref.laboratoryId, ref.structureId) : [];
  const keep = (extra: Record<string, string>) => {
    const p = new URLSearchParams();
    if (ref) {
      p.set('v', '1');
      p.set('lab', ref.laboratoryId);
      p.set('estrutura', ref.structureId);
    }
    for (const [k, v] of Object.entries(extra)) p.set(k, v);
    return `/studio?${p.toString()}`;
  };

  return (
    <div className="min-h-dvh bg-ink-900 print:bg-white">
      <header className="border-b border-line print:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/explorar" className="flex items-center gap-2 text-fg-muted hover:text-fg">
            <Icon name="chevronLeft" size={18} /> Laboratórios
          </Link>
          <span className="ml-auto">
            <Logo size={24} />
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 print:max-w-none print:p-0">
        <div className="print:hidden">
          <p className="eyebrow">BioLab 3D Studio</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">{pack ? pack.lesson.title : 'Materiais de aula com imagens 3D'}</h1>
        </div>

        {!hasStudio ? (
          <div className="panel mt-8 p-6" data-testid="studio-locked">
            <p className="flex items-center gap-2 font-semibold">
              <Icon name="lock" size={18} /> O Studio faz parte do Plano Completo.
            </p>
            <p className="mt-2 text-fg-muted">Com o Plano Completo, você gera slides, atividades, mapas mentais, planos de aula e aulas emergenciais a partir das aulas dos laboratórios.</p>
          </div>
        ) : pack ? (
          <>
            <p className="mt-2 mb-8 text-fg-muted print:hidden">
              {pack.lab.title} · {pack.lesson.unit} · {pack.lesson.grade} · {pack.lesson.minutes} min ·{' '}
              <Link href={keep({ lab: pack.lab.id })} className="font-medium text-cyan hover:underline" data-testid="studio-change-lesson">
                trocar aula
              </Link>
            </p>
            <StudioWorkspace pack={pack} initialTool={tool} />
          </>
        ) : (
          <>
            <p className="mt-3 max-w-2xl text-fg-muted">
              Escolha uma aula. O Studio monta slides com imagens dos modelos 3D, atividades com desenhos numerados e gabarito, mapas mentais, plano de aula e aula emergencial, prontos para
              apresentar, imprimir ou baixar.
            </p>
            {topic ? (
              <section className="panel mt-6 p-6" data-testid="studio-topic">
                <p className="eyebrow">Tema recebido do laboratório</p>
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
                <p className="mt-4 text-sm text-fg-muted">{matching.length ? 'Aulas que mostram esta estrutura aparecem primeiro, abaixo.' : 'Nenhuma aula mostra esta estrutura diretamente; veja as aulas do laboratório abaixo.'}</p>
              </section>
            ) : (
              ref && <p className="mt-6 text-sm text-danger">O tema enviado não foi encontrado no catálogo.</p>
            )}
            <LessonPicker labFilter={labFilter} first={matching} link={(id) => keep({ aula: id })} labLink={(id) => keep({ lab: id })} />
          </>
        )}
      </main>
    </div>
  );
}

function LessonPicker({ labFilter, first, link, labLink }: { labFilter?: string; first: string[]; link: (id: string) => string; labLink: (id: string) => string }) {
  const cards = lessonCards();
  const labs = LABORATORIES.filter((l) => cards.some((c) => c.laboratoryId === l.id));
  const active = labs.find((l) => l.id === labFilter)?.id ?? labs[0]?.id;
  const list = cards.filter((c) => c.laboratoryId === active).sort((a, b) => Number(first.includes(b.id)) - Number(first.includes(a.id)));
  return (
    <section className="mt-8" data-testid="studio-picker">
      <nav className="flex flex-wrap gap-2" aria-label="Laboratórios">
        {labs.map((l) => (
          <Link
            key={l.id}
            href={labLink(l.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${l.id === active ? 'border-transparent text-white' : 'border-line-strong text-fg-muted hover:text-fg'}`}
            style={l.id === active ? { background: l.accent } : undefined}
            aria-current={l.id === active ? 'page' : undefined}
          >
            {l.title}
          </Link>
        ))}
      </nav>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <li key={c.id}>
            <Link href={link(c.id)} className="panel block h-full overflow-hidden transition-transform hover:-translate-y-0.5" data-testid={`studio-lesson-${c.id}`}>
              <div className="relative aspect-[16/10] bg-slate-100">
                {c.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.thumb} alt="" className="h-full w-full object-contain" loading="lazy" />
                )}
                {first.includes(c.id) && <span className="chip absolute top-2 left-2 bg-white/90 text-[11px] text-slate-900">Mostra o tema</span>}
              </div>
              <div className="p-4">
                <p className="eyebrow text-[10px]">
                  {c.unit} · {c.grade}
                </p>
                <p className="mt-1 font-semibold">{c.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{c.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
