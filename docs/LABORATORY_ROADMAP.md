# Roteiro dos laboratórios

Fonte de verdade: `data/biology/laboratories.ts` (o painel lê dali).

| Laboratório | Estado | Fase | Conteúdo previsto |
|---|---|---|---|
| Corpo Humano | **Disponível** | 1 | 13 camadas/sistemas, 2.206 malhas, 19 regiões clicáveis, painel científico |
| Células | **Disponível** | 3 | Células animal, vegetal e procariótica; mitocôndria e cloroplasto em detalhe; mitose; 8 animações |
| Genética | Planejado | 2 | DNA, replicação, transcrição, tradução, cromossomos, heredogramas |
| Plantas | **Disponível** | 4 | Planta com flores, flor, semente e germinação, cortes de folha, caule e raiz; 10 animações |
| Animais | Planejado | 3 | Comparação de sistemas entre grupos, embriologia |
| Microrganismos | Planejado | 4 | Bactéria, vírus, fungos, protozoários, ciclos de doenças |

## O que já é compartilhado

Motor 3D (`engine/`, `components/3d/`): canvas com perfis de qualidade, câmera com vistas e foco,
carregamento GLB com Draco e BVH, registro de malhas, materiais compartilhados, visibilidade,
isolamento, destaque e rótulos, recuperação de perda de contexto WebGL. Um novo laboratório precisa
de: modelos, um catálogo no formato de `catalog.json`, conteúdo em `data/biology/<lab>/` e um
componente em `laboratories/<lab>/`.

## Corpo Humano: pendências

- Orelha interna (ver `MODEL_LICENSES.md`). Rins, encéfalo e órgãos femininos internos já são modelados em `laboratories/human/organs.ts`.
- 148 nomes ainda sem tradução para o português (aparecem em inglês/latim).
- Conteúdo curado para ~50 estruturas; as demais mostram nome, sistema e o aviso "em elaboração".
- Processos animados de respiração e contração muscular (circulação e ciclo cardíaco já existem em `laboratories/human/CirculationLayer.tsx`).
- Corpo feminino completo (pelve, mamas, órgãos externos): hoje só os órgãos reprodutores internos alternam com os masculinos.

## Motor procedural compartilhado

Células e Plantas usam o mesmo motor em `laboratories/shared/`: `ProceduralLab` (interface completa:
modelos, legenda, busca, painel científico, processos, Modo Apresentação, atalhos), `createCatalog`
(estruturas no formato do esquema e busca sem acento), geometria procedural, partículas (`Flow`, com
caminhos) e o relógio das animações. Um novo laboratório procedural precisa de conteúdo em
`data/biology/<lab>/`, um catálogo, materiais, construtores de modelos e uma configuração.

## Células: pendências

- Transporte ativo/difusão facilitada e endocitose como animações próprias.
- Conjugação bacteriana animada.
- Revisão pedagógica dos textos.

## Roteiros de aula

`data/biology/lessons/` guarda os roteiros (`Lesson`: unidade, série, duração, objetivos, seções com
botões de ação, termos-chave, perguntas, erros comuns, referências). `components/laboratory/LessonsPanel.tsx`
os mostra; cada laboratório traduz as ações (`structure`, `process`, `model`, `group`) para o seu motor
(`runLessonAction` em `ProceduralLab` e em `HumanLab`). `tests/unit/lessons.test.ts` garante que todo id
citado existe no laboratório.

## Plantas: pendências

- Monocotiledônea (milho) para comparar raiz fasciculada, nervação paralela e feixes espalhados.
- Ciclo de vida das briófitas, pteridófitas e gimnospermas.
- Tropismos (fototropismo e gravitropismo) e hormônios vegetais animados.
- Revisão pedagógica dos textos.
