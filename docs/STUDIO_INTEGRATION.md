# Integração Explorer → Studio

O BioLab Studio (plano Completo) vai gerar slides, provas e atividades a partir do que o professor
está vendo no laboratório. **Nesta entrega só o contrato existe**; os geradores são a fase 2.

## Contrato v1 (`data/studio/contract.ts`)

```ts
StudioTopicRef = {
  v: 1,
  laboratoryId: LaboratoryId,  // 'anatomia-humana' | 'plantas' | ...
  structureId: string,         // id estável, /^[a-z0-9-]+$/ (ex.: 'coracao', 'testiculo-dir')
}
```

- O painel científico gera o link com `studioUrl(ref)` → `/studio?v=1&lab=anatomia-humana&estrutura=coracao`.
- `parseStudioParams()` valida com Zod; parâmetros inválidos são ignorados.
- No servidor, `services/content/topics.ts` resolve o tópico (nome, sistema, descrição, referências)
  a partir do `catalog.json` e do conteúdo curado. O Studio nunca confia em texto vindo da URL.

## Studio (`/studio`)

1. **Escolha da aula**: o professor escolhe um laboratório e um dos 41 roteiros de aula. Quando
   chega um tema do laboratório (`?v=1&lab=…&estrutura=…`), o Studio mostra o tema e põe primeiro
   as aulas que mostram aquela estrutura.
2. **Pacote da aula** (`services/studio/pack.ts`, só no servidor): roteiro + conteúdo do catálogo de
   cada estrutura + etapas das animações + imagens 3D (`data/studio/renders.json`).
3. **Geradores** (`lib/studio/*`, puros e testados em `tests/unit/studio.test.ts`):

| Gerador | Imagens | Saída |
|---|---|---|
| Slides | Modelo 3D da aula, estrutura isolada, estrutura destacada no modelo, etapas das animações, modelo com estruturas numeradas | Apresentar em tela cheia, baixar PowerPoint (`pptxgenjs`, mesmo layout), imprimir/PDF |
| Atividade | Desenho em linhas numerado (para colorir) ou imagem 3D colorida, perguntas com imagem, sequência de etapas | Imprimir/PDF, com gabarito opcional e "gerar outra versão" |
| Mapa mental | Imagem 3D ou desenho em cada ramo | Imprimir/PDF (A4 deitado) |
| Plano de aula | — | Imprimir/PDF, baixar para Word |
| Aula emergencial | — | Imprimir/PDF, baixar para Word |

## Imagens 3D (`scripts/studio-renders.ts`)

O script abre cada laboratório num navegador (Playwright), executa as ações de cada roteiro e salva
em `public/studio/<aula>/`:

- `capa.webp` e as vistas de modelo, com `*-linhas.png` (desenho em linhas feito a partir de passes
  de identificação das estruturas e de normais) e a posição na tela de cada estrutura visível
  (rótulos numerados);
- para cada estrutura: a estrutura isolada (`.webp` + `-linhas.png`) e o modelo inteiro com a
  estrutura destacada (`-ctx.webp`);
- para cada animação: até 6 etapas (`-p<n>.webp`).

Para gerar de novo (depois de mudar modelos ou roteiros):

```bash
npm run build && npm start              # em outro terminal, porta 3000
BIOLAB_URL=http://localhost:3000 npm run studio:renders              # todas as aulas
BIOLAB_URL=http://localhost:3000 npm run studio:renders -- animais   # só um laboratório ou aula
```

## Comportamento por plano (com `BIOLAB_REQUIRE_KEY=1`)

| Plano | No painel científico | Em `/studio` |
|---|---|---|
| Básico | Botão "Criar materiais sobre este tema" desativado, com cadeado e aviso do plano Completo | Aviso de que o Studio é do plano Completo |
| Completo | Link "Criar materiais sobre este tema" | Studio completo |

Com o acesso livre (padrão), todos veem o Studio completo.
