# Status do projeto

Atualizado em 23/11/2026 — **rins, encéfalo e sistema reprodutor feminino modelados pelo BioLab**; antes: células orgânicas, coração/circulação, meiose, fissão binária e roteiros de aula.

## Pronto e testado

| Item | Estado |
|---|---|
| Página de acesso premium com validação de chave (Básico/Completo) no servidor | ✅ |
| Chaves com hash + pepper, sessão assinada, revogação, expiração, limite de dispositivos, limite de tentativas | ✅ |
| Painel com os seis laboratórios | ✅ (Corpo Humano, Células e Plantas disponíveis; os demais dizem "em desenvolvimento" e a fase) |
| Corpo humano 3D: rotação, zoom, vistas, seleção por clique e por busca | ✅ |
| Camadas por sistema (14, com reprodutor feminino), transparência, isolar, ocultar, foco, regiões clicáveis | ✅ |
| Painel científico (nomes pt/la/en, descrição, função, "Para a aula", relacionados, referências) | ✅ para ~50 estruturas; demais com nome e aviso |
| Modo apresentação em tela cheia com atalhos de teclado | ✅ |
| Perfis de qualidade, carregamento sob demanda, recuperação de contexto WebGL, liberação de memória | ✅ |
| Contrato Explorer → Studio e controle por plano | ✅ |
| Layout em celular | ✅ (testado em emulação) |
| Laboratório de Células: células animal, vegetal e procariótica (Gram-negativa) com visual orgânico (ruído, borda de Fresnel, membranas em dois tons) e ~55 estruturas clicáveis (microvilosidades, citoesqueleto, plasmodesmos, tonoplasto, amiloplastos, membrana externa, periplasma, inclusões…) | ✅ |
| Células: mitocôndria e cloroplasto em detalhe, mitose em 6 fases, meiose em 9 fases com crossing-over, fissão binária em 4 etapas | ✅ |
| Células: animações de síntese de proteínas, respiração (célula e mitocôndria), fotossíntese (célula e cloroplasto), osmose e flagelos peritríquios girando | ✅ |
| Corpo humano: vasos visíveis por padrão, vista "Coração e circulação", corte coronal do coração (valvas e músculos papilares), animações do caminho do sangue e do ciclo cardíaco, seleção que mantém a cor do órgão | ✅ |
| Corpo humano: rins (córtex, pirâmides, pelve e cálices) com corte frontal; encéfalo (4 lobos com giros, cerebelo, mesencéfalo, ponte, bulbo, corpo caloso, tálamo, hipotálamo, ventrículos) com corte mediano; sistema reprodutor feminino (útero, colo, tubas com fímbrias, ovários, vagina) alternando com o masculino. Geometria própria em `laboratories/human/organs.ts` | ✅ |
| Roteiros de aula (painel "Aulas"): 11 de citologia, 9 de corpo humano, 3 de plantas, com objetivos, botões que controlam o 3D, termos-chave, perguntas e erros comuns | ✅ (texto pendente de revisão pedagógica) |
| Laboratório de Plantas: planta com flores, flor em corte, semente, folha, caule e raiz em corte, com ~55 estruturas clicáveis | ✅ |
| Plantas: animações de transporte de seiva, transpiração, fotossíntese (planta e folha), estômatos, absorção pela raiz, seiva no caule, polinização, fecundação e germinação | ✅ |

## Não pronto

| Item | Situação |
|---|---|
| Laboratórios de Animais, Genética, Microrganismos | Fundação pronta; sem modelos |
| Células: transporte ativo/endocitose animados | Próxima etapa do laboratório |
| Geradores do Studio | Fase 2; a interface não os anuncia como funcionais |
| Orelha interna | Excluída por licença (ver MODEL_LICENSES.md) |
| Revisão do conteúdo por professor | Pendente |
| Checkout / envio automático de chaves | Campo `orderRef` pronto; integração não feita |
| Armazenamento de chaves em banco | Hoje arquivo (servidor único); SQL pronto em `docs/db/` |
| Medição em GPU real e em dispositivos escolares | Pendente (só SwiftShader) |

## Próximos passos sugeridos

1. Revisão pedagógica dos textos do corpo humano.
2. Banco de dados + checkout para começar a vender.
3. Laboratório de Genética ou de Animais, reutilizando o motor procedural de Células e Plantas.
4. Orelha interna modelada pelo projeto; detalhar mamas e órgãos externos femininos.
