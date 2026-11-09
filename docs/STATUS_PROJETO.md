# Status do projeto

Atualizado em 09/11/2026 — **primeira entrega**.

## Pronto e testado

| Item | Estado |
|---|---|
| Página de acesso premium com validação de chave (Básico/Completo) no servidor | ✅ |
| Chaves com hash + pepper, sessão assinada, revogação, expiração, limite de dispositivos, limite de tentativas | ✅ |
| Painel com os seis laboratórios | ✅ (só Corpo Humano disponível; os demais dizem "em desenvolvimento" e a fase) |
| Corpo humano 3D: rotação, zoom, vistas, seleção por clique e por busca | ✅ |
| Camadas por sistema (13), transparência, isolar, ocultar, foco, regiões clicáveis | ✅ |
| Painel científico (nomes pt/la/en, descrição, função, "Para a aula", relacionados, referências) | ✅ para ~50 estruturas; demais com nome e aviso |
| Modo apresentação em tela cheia com atalhos de teclado | ✅ |
| Perfis de qualidade, carregamento sob demanda, recuperação de contexto WebGL, liberação de memória | ✅ |
| Contrato Explorer → Studio e controle por plano | ✅ |
| Layout em celular | ✅ (testado em emulação) |

## Não pronto

| Item | Situação |
|---|---|
| Laboratórios de Plantas, Animais, Células, Genética, Microrganismos | Fundação pronta; sem modelos |
| Geradores do Studio | Fase 2; a interface não os anuncia como funcionais |
| Rins, orelha interna, encéfalo detalhado | Excluídos por licença (ver MODEL_LICENSES.md) |
| Revisão do conteúdo por professor | Pendente |
| Checkout / envio automático de chaves | Campo `orderRef` pronto; integração não feita |
| Armazenamento de chaves em banco | Hoje arquivo (servidor único); SQL pronto em `docs/db/` |
| Medição em GPU real e em dispositivos escolares | Pendente (só SwiftShader) |

## Próximos passos sugeridos

1. Revisão pedagógica dos textos do corpo humano.
2. Banco de dados + checkout para começar a vender.
3. Laboratório de Células (fase 2), reutilizando o motor.
4. Substitutos licenciados para rins e orelha interna.
