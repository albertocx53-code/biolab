# Resultados dos testes

Última execução: 09/11/2026, contêiner Linux, Node 22, Chromium 1.63 (Playwright) com SwiftShader.

| Suíte | Comando | Resultado |
|---|---|---|
| TypeScript | `npm run typecheck` | sem erros |
| Unitários (Vitest) | `npm test` | **27 passando** |
| Navegador (Playwright, build de produção) | `npm run test:e2e` | **19 passando** (≈50 s) |

## O que é coberto

**Unitários:** formato, unicidade, normalização e hash das chaves; validação (válida, inválida,
revogada, expirada, limite de dispositivos, texto da chave nunca gravado); sessão (assinatura,
adulteração de plano, expiração); limitador de tentativas; permissões por plano; catálogo do corpo
humano (esquema, ids únicos, **ausência dos componentes NC**, conteúdo curado ligado às estruturas,
regiões, busca sem acento); contrato do Studio (ida e volta, valores injetados); perfil de qualidade
conservador em renderização por software.

**Navegador (desktop):** entrada em pt-BR com erro amigável; chave revogada recusada; rotas
protegidas exigem sessão; cookie forjado recusado; sair; 429 após tentativas; chave nunca aparece no
HTML/JS; painel com os seis laboratórios e status honesto; Básico sem Studio; Completo recebe o tema
sem prometer geradores; carregamento dos sistemas e camadas sob demanda; clique no coração abre o
painel; busca, foco, isolamento e link do Studio; clique no braço abre a região e mostra os ossos;
ocultar sistema e transparência; vistas, reinício e zoom; modo apresentação e atalhos; memória
liberada ao sair.

**Navegador (celular, Pixel 7 emulado):** entrada, painel e laboratório sem rolagem horizontal.

## Não testado

- GPU real, Safari/iOS, Firefox, tablets físicos, telas de projetor.
- Rede lenta real.
- Leitores de tela (há rótulos ARIA, mas não houve teste com NVDA/VoiceOver).
- Várias instâncias de servidor (o armazenamento de chaves atual é de servidor único).
