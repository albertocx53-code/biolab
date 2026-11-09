# Conteúdo científico

## Fontes

| Fonte | Licença | Uso |
|---|---|---|
| OpenStax *Anatomy and Physiology 2e* | CC BY 4.0 | Base dos textos de descrição e função (reescritos em pt-BR) |
| Terminologia Anatômica (TA2) / FIPAT | Referência | Nomes latinos e hierarquia |
| Z-Anatomy translations | CC BY-SA 4.0 | Nomes em português, latim e inglês |

Nenhum texto foi copiado da Wikipédia.

## Onde fica

- `data/biology/schema.ts`: formato de uma estrutura (nome pt/la/en, sistema, descrição, função,
  nota educacional "Para a aula", relacionados, tópicos, referências, `sourceName`, `contentReviewed`).
- `data/biology/human/content.ts`: textos curados de ~50 estruturas (coração e câmaras, aorta,
  pulmões, traqueia, diafragma, fígado, estômago, pâncreas, sistema reprodutor masculino,
  glândulas endócrinas, baço, ossos do membro superior, músculos e nervos principais, pele).
- Estruturas sem texto curado mostram apenas os dados do catálogo e "Conteúdo em elaboração".

## Revisão

**Nenhum texto passou ainda por revisão de um professor de Biologia.** Foi escrito a partir das
fontes acima, mas precisa dessa leitura antes de ser divulgado como revisado. Hoje o campo
`contentReviewed` do catálogo só indica que a estrutura *tem texto curado* (é usado para ordenar a
busca); ele não aparece na interface. Quando a revisão começar, o próximo passo é separar os dois
conceitos (`curated` e `reviewedBy`/`reviewedAt`).

## Cuidados adotados

- Linguagem para ensino médio, sem simplificações erradas.
- O sistema reprodutor é tratado em linguagem técnica e escolar.
- Quando o modelo não mostra algo (rins, orelha interna), o painel diz isso em vez de omitir.
