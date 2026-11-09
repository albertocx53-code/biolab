import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/ui/Logo';

export const metadata: Metadata = { title: 'Créditos e licenças' };

export default function CreditsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/explorar">
        <Logo />
      </Link>
      <h1 className="mt-10 font-[family-name:var(--font-display)] text-3xl font-bold">Créditos e licenças</h1>
      <section className="mt-8 space-y-3 text-fg-muted">
        <h2 className="text-lg font-semibold text-fg">Modelo anatômico 3D (Laboratório Corpo Humano)</h2>
        <p>
          Os modelos do corpo humano são derivados do <strong className="text-fg">Z-Anatomy</strong> (atlas anatômico de código aberto), que por sua vez
          deriva do <strong className="text-fg">BodyParts3D</strong>:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>&quot;BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan&quot; — https://lifesciencedb.jp/bp3d/</li>
          <li>&quot;Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0&quot; — https://www.z-anatomy.com/</li>
        </ul>
        <p>
          Modificações feitas pelo BioLab 3D: seleção de estruturas, remoção de componentes com licença não comercial (rim e orelha interna) e de
          componentes sem licença declarada (parcelamento do encéfalo), redução de polígonos, compressão Draco e organização por sistemas. Os arquivos
          derivados (modelos .glb e catálogo de nomes) são distribuídos sob a licença CC BY-SA 4.0. Nomes anatômicos em português e latim: tabela de
          traduções do Z-Anatomy (CC BY-SA 4.0), com ajustes para o português do Brasil.
        </p>
        <p>
          Licença: <a className="text-cyan underline" href="https://creativecommons.org/licenses/by-sa/4.0/deed.pt_BR">Creative Commons Atribuição-CompartilhaIgual 4.0</a>.
        </p>
      </section>
      <section className="mt-8 space-y-3 text-fg-muted">
        <h2 className="text-lg font-semibold text-fg">Textos científicos</h2>
        <p>Textos escritos para o BioLab 3D, com base em OpenStax Anatomy and Physiology 2e e Biology 2e (CC BY 4.0).</p>
      </section>
      <section className="mt-8 space-y-3 text-fg-muted">
        <h2 className="text-lg font-semibold text-fg">Software</h2>
        <p>three.js (MIT), React Three Fiber e Drei (MIT), three-mesh-bvh (MIT), decodificador Draco (Apache 2.0), Next.js (MIT), fontes Inter e Manrope (SIL OFL 1.1).</p>
      </section>
    </main>
  );
}
