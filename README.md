# BioLab 3D

**A Biologia ganha vida na sua aula.**

Plataforma web de laboratórios 3D de Biologia para professores apresentarem em sala. Esta é a
**primeira entrega**: página de acesso por chave, painel com os seis laboratórios e o
**Laboratório do Corpo Humano** completo (modelo 3D real, seleção de estruturas, painel científico
e modo apresentação). Os outros cinco laboratórios têm a fundação pronta e estão marcados como
"em desenvolvimento" na interface.

## Começar

```bash
npm install
cp .env.example .env.local        # preencha os dois segredos (openssl rand -base64 48)
npm run keys:create -- --tier completo --label "Teste"   # imprime a chave uma única vez
npm run dev                        # http://localhost:3000
```

Em desenvolvimento, sem `.env.local`, o servidor usa segredos de desenvolvimento e avisa no log.
Em produção ele se recusa a iniciar sem segredos reais.

| Comando | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | TypeScript estrito (ESLint ainda não configurado) |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes de navegador (Playwright, contra o build de produção) |
| `npm run keys:create\|list\|revoke` | Administração de chaves (só no servidor) |

## Planos

- **Básico**: os seis laboratórios e o modo apresentação.
- **Completo**: tudo do Básico + BioLab Studio (geradores de slides, provas e atividades).
  Os geradores são a **fase 2** e ainda não funcionam; a interface diz isso claramente.

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [docs/STATUS_PROJETO.md](docs/STATUS_PROJETO.md) | O que está pronto, o que falta, limitações |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Estrutura de pastas, motor 3D, fluxo de acesso |
| [docs/MODEL_LICENSES.md](docs/MODEL_LICENSES.md) | Origem e licença de cada modelo, exclusões |
| [docs/LABORATORY_ROADMAP.md](docs/LABORATORY_ROADMAP.md) | Plano dos seis laboratórios |
| [docs/ACCESS_KEYS.md](docs/ACCESS_KEYS.md) | Sistema de chaves, segurança, checkout |
| [docs/SCIENTIFIC_CONTENT.md](docs/SCIENTIFIC_CONTENT.md) | Fontes e processo de revisão do conteúdo |
| [docs/PERFORMANCE_TESTS.md](docs/PERFORMANCE_TESTS.md) | Medições de desempenho |
| [docs/TEST_RESULTS.md](docs/TEST_RESULTS.md) | Resultados dos testes |
| [docs/STUDIO_INTEGRATION.md](docs/STUDIO_INTEGRATION.md) | Contrato Explorer → Studio |

## Licença dos modelos 3D

Os modelos anatômicos em `public/models/human/` derivam do **Z-Anatomy** (CC BY-SA 4.0) e do
**BodyParts3D** (CC BY-SA 2.1 JP). Uso comercial permitido, com atribuição e **compartilhamento
pela mesma licença dos modelos derivados**. Veja [docs/MODEL_LICENSES.md](docs/MODEL_LICENSES.md) e a
página `/creditos` do aplicativo. O código-fonte do aplicativo não é afetado pela licença dos modelos.
