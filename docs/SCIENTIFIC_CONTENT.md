# Conteúdo científico

## Fontes

| Fonte | Licença | Uso |
|---|---|---|
| OpenStax *Anatomy and Physiology 2e* | CC BY 4.0 | Base dos textos de descrição e função (reescritos em pt-BR) |
| Terminologia Anatômica (TA2) / FIPAT | Referência | Nomes latinos e hierarquia |
| Z-Anatomy translations | CC BY-SA 4.0 | Nomes em português, latim e inglês |
| OpenStax *Biology 2e* (caps. 4, 5, 7, 8, 10, 11, 21 e 22) | CC BY 4.0 | Base dos textos do laboratório de Células e das animações (reescritos em pt-BR) |
| OpenStax *Biology 2e* e *Anatomy and Physiology 2e* | CC BY 4.0 | Base dos roteiros de aula em `data/biology/lessons/` (texto original, conferido capítulo a capítulo) |
| OpenStax *Biology 2e* (caps. 8, 30 e 32) | CC BY 4.0 | Base dos textos do laboratório de Plantas e das animações (reescritos em pt-BR) |

Nenhum texto foi copiado da Wikipédia.

## Onde fica

- `data/biology/schema.ts`: formato de uma estrutura (nome pt/la/en, sistema, descrição, função,
  nota educacional "Para a aula", relacionados, tópicos, referências, `sourceName`, `contentReviewed`).
- `data/biology/human/content.ts`: textos curados de ~50 estruturas (coração e câmaras, aorta,
  pulmões, traqueia, diafragma, fígado, estômago, pâncreas, sistema reprodutor masculino,
  glândulas endócrinas, baço, ossos do membro superior, músculos e nervos principais, pele).
- `data/biology/cells/content.ts`: ~45 estruturas celulares (envoltórios, núcleo, endomembranas,
  mitocôndria e cloroplasto em detalhe, estruturas bacterianas, mitose), cada uma com tamanho real
  aproximado, sinônimos usados nos livros brasileiros (carioteca, complexo de Golgi…) e referências.
- `laboratories/cells/processes.ts`: textos das 10 animações (síntese de proteínas, respiração celular,
  fotossíntese, osmose, flagelo, mitose, meiose, fissão binária), sempre marcadas como esquemáticas e com tempo comprimido.
- `laboratories/human/processes.ts`: caminho do sangue e ciclo cardíaco.
- `data/biology/lessons/`: 23 roteiros de aula (citologia, fisiologia humana, botânica) para o painel "Aulas".
  Cada roteiro cita os capítulos da OpenStax usados (`LESSON_REFS`).
- `data/biology/plants/content.ts`: ~55 estruturas de botânica (órgãos, partes da flor, tecidos da
  folha, do caule e da raiz, semente e embrião), com sinônimos dos livros brasileiros (líber, lenho,
  caliptra, seiva bruta/elaborada…) e referências por seção do OpenStax.
- `laboratories/plants/processes.ts`: textos das 10 animações de Plantas, marcadas como esquemáticas e
  com tempo comprimido.
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
- Células: cores são convenções didáticas (organelas reais são quase transparentes); números como
  "30 a 32 ATP por glicose" seguem a estimativa atual do OpenStax; o modelo de mitose usa 2n = 4
  e diz isso na tela.
- Plantas: a planta é uma eudicotiledônea genérica (como um feijoeiro), não uma espécie real; o fruto
  aberto lembra um tomate. Cores dos cortes seguem a convenção das lâminas coradas (xilema
  avermelhado, floema azulado). A germinação mostrada é a epígea do feijão.
- Quando o modelo não mostra algo (rins, orelha interna), o painel diz isso em vez de omitir.
