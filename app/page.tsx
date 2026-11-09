import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
import { AccessForm } from '@/components/access/AccessForm';

export default async function AccessPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  return (
    <main className="relative grid min-h-dvh lg:grid-cols-[minmax(420px,520px)_1fr]">
      <section className="relative z-10 flex flex-col justify-between bg-ink-850 px-6 py-8 sm:px-12 lg:border-r lg:border-line">
        <Logo />
        <div className="my-14 max-w-md">
          <p className="eyebrow mb-4">Laboratórios virtuais de Biologia</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.1] font-bold tracking-tight sm:text-[2.75rem]">
            Bem-vindo ao BioLab 3D
          </h1>
          <p className="mt-4 text-lg text-fg-muted">A Biologia ganha vida na sua aula.</p>
          <div className="mt-10">
            <AccessForm expired={sp.expirada === '1'} />
          </div>
          <ul className="mt-10 grid gap-3 text-sm text-fg-muted">
            <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />Sem cadastro e sem senha: sua chave é o seu acesso.</li>
            <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />Plano Básico: os seis laboratórios 3D e o Modo Apresentação.</li>
            <li className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan" />Plano Completo: tudo do Básico e o BioLab 3D Studio (geradores em desenvolvimento).</li>
          </ul>
        </div>
        <footer className="text-xs text-fg-subtle">
          Precisa de ajuda com sua chave? Responda ao e-mail de compra que nossa equipe atende você.
        </footer>
      </section>
      <section className="lab-backdrop relative hidden overflow-hidden lg:block" aria-hidden="true">
        <Image src="/images/hero-anatomia.webp" alt="" fill priority sizes="60vw" className="object-contain object-center p-6" />
        <div className="absolute right-10 bottom-10 left-10 flex items-end justify-between gap-6">
          <p className="max-w-sm text-sm text-fg-muted">
            Modelo anatômico 3D derivado do Z-Anatomy / BodyParts3D (CC BY-SA). Explore sistemas, camadas e estruturas em tempo real.
          </p>
          <span className="chip">Renderização em tempo real</span>
        </div>
      </section>
    </main>
  );
}
