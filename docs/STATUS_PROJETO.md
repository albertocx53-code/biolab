# Status do projeto

Atualizado em 11/11/2026 — **laboratório de Plantas**.

## Pronto e testado

| Item | Estado |
|---|---|
| Página de acesso premium com validação de chave (Básico/Completo) no servidor | ✅ |
| Chaves com hash + pepper, sessão assinada, revogação, expiração, limite de dispositivos, limite de tentativas | ✅ |
| Painel com os seis laboratórios | ✅ (Corpo Humano, Células e Plantas disponíveis; os demais dizem "em desenvolvimento" e a fase) |
| Corpo humano 3D: rotação, zoom, vistas, seleção por clique e por busca | ✅ |
| Camadas por sistema (13), transparência, isolar, ocultar, foco, regiões clicáveis | ✅ |
| Painel científico (nomes pt/la/en, descrição, função, "Para a aula", relacionados, referências) | ✅ para ~50 estruturas; demais com nome e aviso |
| Modo apresentação em tela cheia com atalhos de teclado | ✅ |
| Perfis de qualidade, carregamento sob demanda, recuperação de contexto WebGL, liberação de memória | ✅ |
| Contrato Explorer → Studio e controle por plano | ✅ |
| Layout em celular | ✅ (testado em emulação) |
| Laboratório de Células: células animal, vegetal e procariótica com ~45 estruturas clicáveis | ✅ |
| Células: mitocôndria e cloroplasto em detalhe, mitose em 6 fases | ✅ |
| Células: animações de síntese de proteínas, respiração (célula e mitocôndria), fotossíntese (célula e cloroplasto), osmose e flagelo | ✅ |
| Laboratório de Plantas: planta com flores, flor em corte, semente, folha, caule e raiz em corte, com ~55 estruturas clicáveis | ✅ |
| Plantas: animações de transporte de seiva, transpiração, fotossíntese (planta e folha), estômatos, absorção pela raiz, seiva no caule, polinização, fecundação e germinação | ✅ |

## Não pronto

| Item | Situação |
|---|---|
| Laboratórios de Animais, Genética, Microrganismos | Fundação pronta; sem modelos |
| Células: meiose e transporte pela membrana animados | Próxima etapa do laboratório |
| Geradores do Studio | Fase 2; a interface não os anuncia como funcionais |
| Rins, orelha interna, encéfalo detalhado | Excluídos por licença (ver MODEL_LICENSES.md) |
| Revisão do conteúdo por professor | Pendente |
| Checkout / envio automático de chaves | Campo `orderRef` pronto; integração não feita |
| Armazenamento de chaves em banco | Hoje arquivo (servidor único); SQL pronto em `docs/db/` |
| Medição em GPU real e em dispositivos escolares | Pendente (só SwiftShader) |

## Próximos passos sugeridos

1. Revisão pedagógica dos textos do corpo humano.
2. Banco de dados + checkout para começar a vender.
3. Laboratório de Genética ou de Animais, reutilizando o motor procedural de Células e Plantas.
4. Substitutos licenciados para rins e orelha interna.
