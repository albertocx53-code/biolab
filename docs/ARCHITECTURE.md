# Arquitetura

Next.js 15 (App Router) · React 19 · TypeScript estrito · Tailwind CSS 4 · three.js 0.180 com
@react-three/fiber 9 e drei 10 · Zustand · Zod · Vitest · Playwright.

```
app/                      Rotas
  page.tsx                Entrada (chave de acesso)
  explorar/               Painel dos laboratórios e /explorar/[lab]
  studio/                 Studio (contrato pronto; geradores na fase 2)
  creditos/               Atribuições e licenças
  api/access, api/session Validação da chave, sessão, saída
middleware.ts             Verifica a assinatura da sessão nas rotas protegidas
lib/auth/                 Chaves, HMAC, sessão, armazenamento, limitador (só servidor)
lib/permissions/tiers.ts  Planos e capacidades
engine/                   Motor 3D sem React: store, registro de malhas, materiais, qualidade
components/3d/            Canvas, câmera, carregador GLB, sincronização de cena, rótulos
components/laboratory/    Painéis reutilizáveis: camadas, busca, painel científico, região, barra
components/presentation/  Tela cheia e atalhos
laboratories/human/       Laboratório do corpo humano (catálogo, materiais, tela)
data/biology/             Esquema comum, lista dos laboratórios, conteúdo curado
data/studio/contract.ts   Contrato Explorer → Studio
services/content/         Resolução de tópicos no servidor
public/models/human/v1/   8 GLBs (Draco) + catalog.json
scripts/                  CLI de chaves, gerador do catálogo
tools/blender/            Exportação do Z-Anatomy
```

## Motor 3D

- **Um GLB por sistema** (esquelético, muscular, coração, vasos, nervoso, visceral, linfático,
  tegumentar). O laboratório carrega 4 por padrão e os outros quando a camada é ligada.
- **Catálogo** (`catalog.json`): para cada malha, id, modelo, grupo, classe de material, nomes
  pt/la/en, centro e tamanho; mais hierarquia (pai), 19 estruturas compostas (ex.: coração, crânio,
  mão) e 19 regiões do corpo. Permite busca e foco sem ter a geometria carregada.
- **Estado** em um store Zustand (`engine/store.ts`): seleção, visibilidade, opacidade, isolamento,
  qualidade, apresentação, comandos de câmera. A cena (`SceneSync`) só reflete o store.
- **Materiais** compartilhados por sistema × classe; destaque desenhado por cima (sem teste de
  profundidade) para que um órgão selecionado apareça mesmo atrás das costelas.
- **Seleção:** raycast acelerado por BVH; ignora camadas quase transparentes (pele).
- **Ciclo de vida:** descarte adiado para sobreviver ao modo estrito do React; ao sair, geometrias e
  materiais são liberados (verificado por teste).
- **Qualidade:** perfis Econômico/Equilibrado/Alta Qualidade escolhidos pelo hardware e ajustados
  pelo `PerformanceMonitor`; renderização sob demanda.

## Acesso

Ver [ACCESS_KEYS.md](ACCESS_KEYS.md). Resumo: chave → `POST /api/access` → cookie de sessão
assinado → middleware (assinatura) → página (`getSession()`, revalida no armazenamento).

## Coordenadas do modelo humano

glTF Y para cima, frente em +Z, lado direito do corpo em −X, altura ≈ 1,75 m, pés em y ≈ 0.
