# Testes de desempenho

Script: `tests/perf/measure.mjs` (Playwright contra `npm run build && npm start`).

```bash
BASE=http://localhost:3000 KEY=BIO3D-... node tests/perf/measure.mjs           # SwiftShader (CPU)
BASE=http://localhost:3000 KEY=BIO3D-... node tests/perf/measure.mjs --gpu     # Chromium headless (ainda cai em software)
BASE=http://localhost:3000 KEY=BIO3D-... node tests/perf/measure.mjs --headed  # janela real = GPU de verdade
CHANNEL=msedge ... --headed                                                     # usa o Edge/Chrome instalado
```

Em qualquer laboratório, `?stats=1` na URL mostra fps, chamadas de desenho e triângulos do quadro
inteiro. Em repouso o esperado é **0 fps**: o canvas só redesenha quando algo muda.

## Medição de 24/11/2026 — antes e depois da revisão do motor

Ambiente: Windows 11, RTX 5050, Chromium headless do Playwright (que mesmo com `--gpu` renderiza
por software, portanto piso de CPU), janela 1366×768, build de produção, perfil Econômico
(escolhido pelo detector ao ver renderização por software). Este branch abre o Corpo Humano com
músculos, vasos e esqueleto visíveis (1.540 chamadas, 2,09 milhões de triângulos), muito mais pesado
que a primeira entrega.

| Métrica (Chromium headless, software) | Antes | Depois |
|---|---|---|
| Cena 3D interativa | 4,06 s | 3,06 s |
| Girando o modelo (cena padrão) | 4 fps | 6,7 fps |
| Girando com todos os sistemas | 1,3 fps | 1,7 fps |
| Heap JS inicial / tudo ligado / ao sair | 35 / 33 / 19 MB | 38 / 33 / 19 MB |
| Malhas registradas ao sair | 0 | 0 |

O ganho em software é limitado pela própria rasterização na CPU; o que a revisão remove é o custo do
lado JavaScript/React e os quadros desnecessários.

| Métrica (Edge em janela real, RTX 5050, perfil Alta) | Antes | Depois |
|---|---|---|
| Girando o modelo (cena padrão, 1.582 chamadas, 2,09 M triângulos) | 74,7 fps | 75 fps (teto do monitor) |
| Girando com todos os sistemas | 75,3 fps | 73,7 fps (teto do monitor) |
| Pior quadro | 19 ms | 18 ms |
| Heap JS com tudo ligado | 63 MB | 46 MB |
| GPU em repouso num modelo com animação pausada (mitose, meiose, genética…) | renderização contínua a 60 fps | **0 quadros** |

Leitura honesta: numa placa dedicada o Corpo Humano já girava no teto do monitor antes da revisão. O
que muda para quem tem GPU é o custo invisível (CPU/JavaScript por quadro, memória, ventoinha e
bateria com a animação parada, resolução que caía por engano) e, principalmente, o que acontece em
máquinas escolares mais fracas, onde o custo de JavaScript por quadro era o gargalo. A medição em
GPU integrada continua pendente (ver "Próximos passos").

### O que mudou no motor (24/11/2026)

- **Tone mapping ACES restaurado** nos perfis com oclusão ambiente: o compositor de pós-processamento
  desligava o tone mapping do renderizador, e "Equilibrado"/"Alta" ficavam lavados em relação a
  "Econômico". Agora `ToneMapping` é o último passe.
- **Perfis com diferença real:** "Alta" usa reflexos a 256 px, oclusão em resolução plena e qualidade
  alta, MSAA 8× e malhas procedurais 25 % mais densas; "Econômico" usa malhas 30 % mais leves e
  reflexos a 64 px.
- **Zero trabalho por quadro de câmera na UI:** o leitor de zoom só atualiza quando o inteiro muda
  (≤ 8×/s), e os laboratórios leem fatias do store (`useShallow`) em vez do store inteiro, que
  re-renderizava 800 linhas de componente a cada quadro de órbita.
- **`SceneSync` por diferença:** hover e seleção tocam só as malhas envolvidas; mudanças de
  visibilidade varrem a cena uma vez; o registro de malhas notifica uma vez por lote (antes, carregar
  um GLB com 683 malhas disparava 683 varreduras de até 2.206 malhas).
- **Render sob demanda de verdade:** uma animação pausada (todos os modelos com `autoProcess`) não
  pede mais quadros; antes, abrir mitose, meiose, fissão, genética ou germinação rodava a GPU a
  60 fps para sempre, com oclusão e MSAA.
- **Hover barato:** sem raycast durante a órbita, `firstHitOnly` no BVH.
- **Membranas animadas** (citocinese da mitose e da meiose) reescrevem a geometria no lugar em vez de
  reconstruir e descartar uma parede completa por quadro.
- **Modelos procedurais em cache** por laboratório e nível de detalhe (voltar a um modelo é
  instantâneo); BVH de seleção montado em fatias ociosas depois da primeira pintura, não antes.
- **Resolução adaptativa coerente:** `PerformanceMonitor` saiu (com render sob demanda ele lia pausas
  como quadros lentos e rebaixava a resolução para sempre); agora a resolução cai só enquanto a câmera
  se move (`regress`) e volta em repouso.
- Em desenvolvimento, o modo estrito do React não descarta mais os BVHs de modelos em uso.

## Medição de 09/11/2026

Ambiente: contêiner Linux **sem GPU**, Chromium com **SwiftShader** (renderização WebGL por CPU),
janela 1366×768, servidor local (sem latência de rede). Perfil de qualidade escolhido automaticamente:
Econômico (o detector reconhece renderização por software).

| Métrica | Valor |
|---|---|
| HTML pronto (DOMContentLoaded) | 65 ms |
| Cena 3D interativa (4 sistemas padrão) | 1,69 s |
| Download inicial do laboratório | 5,8 MB (inclui JS; modelos padrão ≈ 3,0 MB + catálogo 0,58 MB) |
| Malhas / chamadas de desenho / triângulos (padrão) | 401 / 401 / 866 mil |
| Quadros por segundo girando o modelo (padrão) | 14 fps (pior quadro 328 ms) |
| Seleção por busca → painel aberto | 58 ms |
| Ativar os outros 4 sistemas (download + montagem) | 2,1 s |
| Todos os sistemas: chamadas / triângulos | 694 / 1,26 milhão |
| Quadros por segundo com tudo ligado | 4 fps (pior quadro 855 ms) |
| Heap JS: inicial / tudo ligado / após sair do laboratório | 19 / 38 / 17 MB |
| Malhas registradas após sair do laboratório | 0 (memória liberada) |

Tamanho de cada modelo (Draco): coração 199 KB, pele 332 KB, vísceras 934 KB, esqueleto 1,5 MB,
linfático 716 KB, nervoso 2,0 MB, muscular 3,6 MB, vasos 3,6 MB.

## Como ler esses números

- **Os fps acima são um piso, não uma previsão.** SwiftShader desenha tudo na CPU; qualquer GPU
  integrada de notebook escolar é muitas vezes mais rápida. **Não há ainda medição em GPU real**,
  portanto o projeto não afirma 30 ou 60 fps.
- O canvas usa `frameloop="demand"`: parado, ele não redesenha nada (0% de GPU em repouso).
- Carregamento sob demanda funciona: músculos, vasos e nervos (9,3 MB) só baixam quando ligados.
- Os modelos têm cache imutável (`Cache-Control: immutable`, versão na pasta `v1/`).

## Otimizações já aplicadas

Draco, decimação na exportação, materiais compartilhados por sistema, BVH para seleção por clique,
`AdaptiveDpr` com `regress` da câmera, perfis Econômico/Equilibrado/Alta Qualidade (salvos no
navegador) com fator de detalhe das malhas procedurais, recuperação de perda de contexto WebGL,
descarte de geometrias ao sair, e a revisão de 24/11/2026 descrita acima.

## Próximos passos

1. Medir `--headed` em: notebook com GPU integrada, Chromebook escolar, tablet Android, iPad.
2. Reduzir chamadas de desenho do Corpo Humano (1.540 na cena padrão deste branch): mesclar as malhas
   não selecionáveis por sistema ou usar `BatchedMesh`. É o principal custo restante na GPU.
3. Testar em rede 4G simulada (o download total dos 8 modelos é 13 MB).
