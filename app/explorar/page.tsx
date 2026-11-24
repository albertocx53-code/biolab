import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireSession } from '@/lib/auth/session';
import { can, TIER_LABEL } from '@/lib/permissions/tiers';
import { LABORATORIES } from '@/data/biology/laboratories';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';
import { LabArt } from '@/components/dashboard/LabArt';
import { LogoutButton } from '@/components/dashboard/AccountMenu';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Laboratórios' };

const CARD_IMAGE: Partial<Record<string, { src: string; alt: string; position: string }>> = {
  'anatomia-humana': { src: '/images/card-corpo-humano.webp', alt: 'Modelo 3D da cabeça e do tórax com músculos e vasos', position: 'object-[center_30%]' },
  celulas: { src: '/images/card-celulas.webp', alt: 'Modelo 3D de célula animal em corte, com núcleo e organelas', position: 'object-center' },
  plantas: { src: '/images/card-plantas.webp', alt: 'Modelo 3D de planta com flor, folhas, fruto aberto e raízes', position: 'object-center' },
  genetica: { src: '/images/card-genetica.webp', alt: 'Modelo 3D do DNA se enrolando em nucleossomos, fibra de cromatina e cromossomo', position: 'object-center' },
  microrganismos: { src: '/images/card-microrganismos.webp', alt: 'Modelo 3D de coronavírus em corte, com espículas, envelope e RNA', position: 'object-center' },
  animais: { src: '/images/card-animais.webp', alt: 'Modelo 3D de peixe com a pele translúcida mostrando brânquias, coração, bexiga natatória e coluna vertebral', position: 'object-center' },
};

const STATUS_LABEL = {
  disponivel: 'Disponível',
  'em-desenvolvimento': 'Em desenvolvimento',
  planejado: 'Em breve',
} as const;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await requireSession();
  const sp = await searchParams;
  const studio = can(session.tier, 'studio.access');

  return (
    <div className="min-h-dvh bg-ink-900">
      <header className="sticky top-0 z-10 border-b border-line bg-ink-850/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 text-sm sm:flex" aria-label="Principal">
            <span className="rounded-full bg-ink-800 px-3 py-1.5 font-medium">Explorer</span>
            <Link href="/studio" className="rounded-full px-3 py-1.5 text-fg-muted hover:text-fg">
              Studio
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="chip">{session.open ? 'Acesso livre' : TIER_LABEL[session.tier]}</span>
            {!session.open && <LogoutButton />}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        {sp['sem-permissao'] && (
          <p role="alert" className="panel mb-8 flex items-center gap-2 px-4 py-3 text-sm text-warn">
            <Icon name="lock" size={16} /> Este recurso faz parte do Plano Completo.
          </p>
        )}
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">O que vamos explorar hoje?</h1>
          <p className="mt-3 text-lg text-fg-muted">Escolha um laboratório e transforme a Biologia em uma experiência interativa.</p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Laboratórios">
          {LABORATORIES.map((lab, i) => {
            const available = lab.status === 'disponivel';
            return (
              <li key={lab.id}>
                <Link
                  href={`/explorar/${lab.slug}`}
                  className="group float-card flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong focus-visible:-translate-y-0.5"
                  data-testid={`lab-card-${lab.slug}`}
                >
                  <div className="relative h-48 overflow-hidden border-b border-line bg-ink-800" style={{ backgroundImage: `radial-gradient(circle at 50% 60%, ${lab.accent}1f, transparent 65%)` }}>
                    {CARD_IMAGE[lab.id] ? (
                      <Image src={CARD_IMAGE[lab.id]!.src} alt={CARD_IMAGE[lab.id]!.alt} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className={`object-cover transition-transform duration-500 group-hover:scale-[1.03] ${CARD_IMAGE[lab.id]!.position}`} />
                    ) : (
                      <div className="absolute inset-0 p-6 opacity-90 transition-opacity group-hover:opacity-100">
                        <LabArt id={lab.id} accent={lab.accent} />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 font-mono text-[11px] text-fg-subtle">{String(i + 1).padStart(2, '0')}</span>
                    <span className={`chip absolute top-3 right-3 bg-ink-900/80 ${available ? 'text-ok' : ''}`}>
                      {available && <span className="h-1.5 w-1.5 rounded-full bg-ok" />}
                      {STATUS_LABEL[lab.status]}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="eyebrow" style={{ color: lab.accent }}>
                      {lab.category}
                    </p>
                    <h2 className="mt-1.5 font-[family-name:var(--font-display)] text-xl font-bold">{lab.title}</h2>
                    <p className="mt-2 flex-1 text-sm text-fg-muted">{lab.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-fg group-hover:text-cyan">
                      {available ? lab.cta : 'Ver planejamento'} <Icon name="arrowRight" size={16} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <section className="float-card mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">BioLab 3D Studio</p>
            <p className="mt-1 text-fg-muted">
              {studio
                ? 'Seu plano inclui o Studio. Os geradores de slides, atividades, mapas mentais, planos de aula e aulas emergenciais estão em desenvolvimento.'
                : 'Geradores de materiais didáticos fazem parte do Plano Completo e estão em desenvolvimento.'}
            </p>
          </div>
          <Link href="/studio" className="btn btn-ghost shrink-0">
            Conhecer o Studio <Icon name="arrowRight" size={16} />
          </Link>
        </section>
      </main>
    </div>
  );
}
