import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { can, TIER_LABEL } from '@/lib/permissions/tiers';
import { labBySlug } from '@/data/biology/laboratories';
import HumanLabLoader from '@/laboratories/human/HumanLabLoader';
import { LabArt } from '@/components/dashboard/LabArt';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';

// Access is checked per request: never prerender protected pages.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lab: string }> }): Promise<Metadata> {
  const lab = labBySlug((await params).lab);
  return { title: lab?.title ?? 'Laboratório' };
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const session = await requireSession('explorer.labs');
  const lab = labBySlug((await params).lab);
  if (!lab) notFound();

  if (lab.id === 'anatomia-humana') {
    return <HumanLabLoader canUseStudio={can(session.tier, 'studio.access')} tierLabel={TIER_LABEL[session.tier]} />;
  }

  // Foundations for the remaining laboratories: honest status, planned scope.
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
        <div className="grid items-center gap-10 md:grid-cols-[1fr_320px]">
          <div>
            <p className="eyebrow" style={{ color: lab.accent }}>
              {lab.category}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">{lab.title}</h1>
            <p className="mt-4 text-lg text-fg-muted">{lab.summary}</p>
            <p className="panel mt-6 flex items-start gap-3 p-4 text-sm">
              <Icon name="info" size={18} className="mt-0.5 shrink-0 text-cyan" />
              <span>
                Este laboratório está em desenvolvimento (fase {lab.phase} do roteiro). A estrutura compartilhada — motor 3D, seleção, camadas,
                painel científico e Modo Apresentação — já está pronta e será reutilizada aqui.
              </span>
            </p>
          </div>
          <div className="panel aspect-[10/7] p-6" style={{ backgroundImage: `radial-gradient(circle at 50% 60%, ${lab.accent}22, transparent 70%)` }}>
            <LabArt id={lab.id} accent={lab.accent} />
            <p className="mt-2 text-center text-[11px] text-fg-subtle">Ilustração esquemática</p>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="panel p-6">
            <h2 className="eyebrow mb-3">Modelos previstos</h2>
            <ul className="space-y-2 text-sm">
              {lab.plannedContent.map((c) => (
                <li key={c} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: lab.accent }} />
                  {c}
                </li>
              ))}
            </ul>
          </section>
          <section className="panel p-6">
            <h2 className="eyebrow mb-3">Processos e animações previstos</h2>
            <ul className="space-y-2 text-sm">
              {lab.plannedProcesses.map((c) => (
                <li key={c} className="flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: lab.accent }} />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-fg-subtle">Todas as animações indicarão quando forem esquemáticas, fora de escala ou com tempo comprimido.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
