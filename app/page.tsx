import Image from 'next/image';
import { Logo } from '@/components/ui/Logo';
import { AccessForm } from '@/components/access/AccessForm';
import { LabArt } from '@/components/dashboard/LabArt';
import { LABORATORIES } from '@/data/biology/laboratories';

const CARD_IMAGE: Partial<Record<string, { src: string; alt: string; position: string }>> = {
  'anatomia-humana': { src: '/images/card-anatomia.webp', alt: 'Modelo 3D do corpo humano com esqueleto e órgãos', position: 'object-[center_35%]' },
  celulas: { src: '/images/card-celulas.webp', alt: 'Modelo 3D de célula animal em corte, com núcleo e organelas', position: 'object-center' },
  plantas: { src: '/images/card-plantas.webp', alt: 'Modelo 3D de planta com flor, folhas, fruto aberto e raízes', position: 'object-center' },
};

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
      <section className="lab-backdrop relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center" aria-label="Os seis laboratórios">
        <div className="mx-auto w-full max-w-4xl px-10 py-10">
          <p className="eyebrow mb-2">Seis laboratórios 3D</p>
          <p className="mb-6 max-w-lg text-sm text-fg-muted">Explore cada tema em modelos interativos: gire, aproxime, abra cortes e clique nas estruturas.</p>
          <ul className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {LABORATORIES.map((lab) => {
              const img = CARD_IMAGE[lab.id];
              return (
                <li key={lab.id} className="float-card overflow-hidden" data-testid={`home-lab-${lab.slug}`}>
                  <div className="relative h-32 overflow-hidden border-b border-line bg-ink-800 2xl:h-40" style={{ backgroundImage: `radial-gradient(circle at 50% 60%, ${lab.accent}1f, transparent 65%)` }}>
                    {img ? (
                      <Image src={img.src} alt={img.alt} fill sizes="(min-width:1280px) 20vw, 30vw" className={`object-cover ${img.position}`} />
                    ) : (
                      <div className="absolute inset-0 p-4 opacity-90">
                        <LabArt id={lab.id} accent={lab.accent} />
                      </div>
                    )}
                    {lab.status !== 'disponivel' && <span className="chip absolute top-2 right-2 bg-ink-900/80 text-[11px]">Em breve</span>}
                  </div>
                  <div className="p-3.5">
                    <p className="eyebrow text-[10px]" style={{ color: lab.accent }}>
                      {lab.category}
                    </p>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-[15px] leading-tight font-bold">{lab.title}</h2>
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-[11px] text-fg-subtle">Imagem do corpo humano derivada do Z-Anatomy / BodyParts3D (CC BY-SA). Demais imagens: modelos próprios do BioLab 3D.</p>
        </div>
      </section>
    </main>
  );
}
