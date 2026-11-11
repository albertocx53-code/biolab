# Roteiro dos laboratórios

Fonte de verdade: `data/biology/laboratories.ts` (o painel lê dali).

| Laboratório | Estado | Fase | Conteúdo previsto |
|---|---|---|---|
| Corpo Humano | **Disponível** | 1 | 13 camadas/sistemas, 2.206 malhas, 19 regiões clicáveis, painel científico |
| Células | **Disponível** | 3 | Células animal, vegetal e procariótica; mitocôndria e cloroplasto em detalhe; mitose; 8 animações |
| Genética | Planejado | 2 | DNA, replicação, transcrição, tradução, cromossomos, heredogramas |
| Plantas | Planejado | 3 | Flor, raiz, caule, folha, fotossíntese, transpiração |
| Animais | Planejado | 3 | Comparação de sistemas entre grupos, embriologia |
| Microrganismos | Planejado | 4 | Bactéria, vírus, fungos, protozoários, ciclos de doenças |

## O que já é compartilhado

Motor 3D (`engine/`, `components/3d/`): canvas com perfis de qualidade, câmera com vistas e foco,
carregamento GLB com Draco e BVH, registro de malhas, materiais compartilhados, visibilidade,
isolamento, destaque e rótulos, recuperação de perda de contexto WebGL. Um novo laboratório precisa
de: modelos, um catálogo no formato de `catalog.json`, conteúdo em `data/biology/<lab>/` e um
componente em `laboratories/<lab>/`.

## Corpo Humano: pendências

- Rins, orelha interna e encéfalo detalhado (ver `MODEL_LICENSES.md`).
- 148 nomes ainda sem tradução para o português (aparecem em inglês/latim).
- Conteúdo curado para ~50 estruturas; as demais mostram nome, sistema e o aviso "em elaboração".
- Processos animados (batimento cardíaco, respiração, contração muscular).
- Modelo feminino (o Z-Anatomy é masculino).

## Células: pendências

- Meiose, transporte ativo/difusão facilitada e endocitose como animações próprias.
- Citoesqueleto (microtúbulos e filamentos) e peroxissomos com mais detalhe.
- Revisão pedagógica dos textos.
