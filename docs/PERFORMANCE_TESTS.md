# Testes de desempenho

Script: `tests/perf/measure.mjs` (Playwright contra `npm run build && npm start`).

```bash
BASE=http://localhost:3000 KEY=BIO3D-... node tests/perf/measure.mjs        # SwiftShader
BASE=http://localhost:3000 KEY=BIO3D-... node tests/perf/measure.mjs --gpu  # GPU da máquina
```

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
`AdaptiveDpr` + `PerformanceMonitor`, perfis Econômico/Equilibrado/Alta Qualidade (salvos no
navegador), recuperação de perda de contexto WebGL, descarte de geometrias ao sair.

## Próximos passos

1. Medir com `--gpu` em: notebook com GPU integrada, Chromebook escolar, tablet Android, iPad.
2. Reduzir chamadas de desenho com tudo ligado (mesclar malhas não selecionáveis por sistema ou
   usar `BatchedMesh`): é o principal custo hoje (694 chamadas).
3. Testar em rede 4G simulada (o download total dos 8 modelos é 13 MB).
