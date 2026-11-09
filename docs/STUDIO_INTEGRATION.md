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

## Comportamento atual

| Plano | No painel científico | Em `/studio` |
|---|---|---|
| Básico | Botão "Criar materiais sobre este tema" desativado, com cadeado e aviso do plano Completo | Aviso de que o Studio é do plano Completo |
| Completo | Link "Criar materiais sobre este tema" | Mostra o tópico recebido e o aviso "Geradores em desenvolvimento" |

## Geradores planejados (`STUDIO_GENERATORS`)

Slides de apresentação, atividades para alunos, mapas mentais, planos de aula e aulas emergenciais. Nenhum funciona ainda.

## Regras para a fase 2

- Os geradores rodam no servidor; chaves de API de IA nunca vão para o cliente.
- Todo conteúdo gerado deve partir dos textos curados e revisados da estrutura.
- Mudanças incompatíveis no contrato criam `v: 2`; o Studio continua aceitando `v: 1`.
