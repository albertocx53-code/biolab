# Licenças dos modelos 3D

Regra do projeto: o BioLab 3D é um produto pago, então **nenhum recurso com cláusula não comercial
(NC) ou sem licença declarada entra no aplicativo**. Cada decisão abaixo foi verificada na fonte.

## Em uso

| Recurso | Fonte | Licença | Uso comercial | Obrigações |
|---|---|---|---|---|
| Corpo humano (8 GLBs em `public/models/human/v1/`) | Z-Anatomy, `Startup.blend` do repositório `Z-Anatomy/Models-of-human-anatomy` | CC BY-SA 4.0 | Sim | Atribuição; derivados sob a mesma licença |
| Geometria de base do Z-Anatomy | BodyParts3D (DBCLS) | CC BY-SA 2.1 JP | Sim | Atribuição; mesma licença |
| Tabela de traduções (nomes em pt/la/en) | Z-Anatomy (`translations`) | CC BY-SA 4.0 | Sim | Idem |
| Imagem `card-corpo-humano.webp` (também na página de entrada) e `hero-anatomia.webp` (não usada) | Renderizadas por nós a partir dos GLBs acima | CC BY-SA 4.0 (derivado) | Sim | Idem |
| Células animal, vegetal e procariótica; mitocôndria, cloroplasto e mitose (`laboratories/cells/`) | Geometria procedural escrita pelo BioLab 3D (nenhum arquivo de terceiros) | Própria | Sim | Nenhuma |
| Imagem `card-celulas.webp` | Renderizada por nós a partir do modelo procedural | Própria | Sim | Nenhuma |
| Plantas: planta com flores, flor, semente e germinação, cortes de folha, caule e raiz (`laboratories/plants/`) | Geometria procedural escrita pelo BioLab 3D (nenhum arquivo de terceiros) | Própria | Sim | Nenhuma |
| Imagem `card-plantas.webp` | Renderizada por nós a partir do modelo procedural | Própria | Sim | Nenhuma |
| Genética: DNA, RNA, cromossomo, replicação, transcrição, tradução, mutações (`laboratories/genetics/`) | Geometria procedural escrita pelo BioLab 3D | Própria | Sim | Nenhuma |
| Fonte 3D Helvetiker Bold (letras A, T, G, C, U no Genética), de `three/examples/fonts` | MAGENTA Ltd. (Helvetiker) | Licença MAGENTA (livre para uso, inclusive comercial, mantendo o aviso) | Sim | Aviso no rodapé do laboratório |
| Imagem `card-genetica.webp` | Renderizada por nós a partir do modelo procedural | Própria | Sim | Nenhuma |
| Microrganismos: bactérias, vírus, fungos, protozoários e cenas animadas (`laboratories/microbes/`) | Geometria procedural escrita pelo BioLab 3D | Própria | Sim | Nenhuma |
| Imagem `card-microrganismos.webp` | Renderizada por nós a partir do modelo procedural | Própria | Sim | Nenhuma |
| Modelos de `laboratories/animals/` | Gerados por código (procedurais) | Própria | Sim | Nenhuma |
| Imagem `card-animais.webp` | Renderizada por nós a partir do modelo procedural | Própria | Sim | Nenhuma |
| Rins, encéfalo, sistema reprodutor feminino, mamas, vulva e pele púbica feminina do corpo humano (`laboratories/human/organs.ts`) | Geometria procedural escrita pelo BioLab 3D, posicionada pelos pontos de referência do catálogo (vasos renais, crânio, medula, bexiga) | Própria | Sim | Nenhuma |
| Decodificador Draco (`public/draco/`) | three.js | MIT | Sim | Aviso de copyright |
| Fontes Inter e Manrope | @fontsource | SIL OFL 1.1 | Sim | — |

**Share-alike:** a obrigação recai sobre os *modelos derivados* (os GLBs e o catálogo), que são
distribuídos sob CC BY-SA 4.0 (`public/models/LICENSE.md`). O código do aplicativo é uma obra
separada que apenas carrega esses arquivos. A atribuição aparece no rodapé do laboratório e na
página `/creditos`.

### Por que as células são geradas em código

Pesquisamos modelos prontos de célula (Sketchfab, BlendSwap, Poly Haven). Os que têm qualidade quase
sempre são uma malha única (organelas não separadas para clicar) ou têm licença NC/"Standard" sem
redistribuição. Como o laboratório precisa de organelas selecionáveis, cortes e animações, os
modelos foram criados em código (`laboratories/cells/geometry.ts` e `models.ts`): formas
esquemáticas, fora de escala, sem nenhuma dependência de licença. O aviso "Modelo esquemático, fora
de escala" e o tamanho real de cada estrutura aparecem na interface.

## Excluídos do arquivo exportado

O Z-Anatomy reúne malhas de origens diferentes. As que não têm licença compatível foram retiradas
no momento da exportação (`tools/blender/export_z_anatomy.py`, expressões `NONCOMMERCIAL` e `BRAIN`):

| Estruturas | Motivo | Consequência |
|---|---|---|
| Rins e pelve renal | Modelos de terceiros sob CC BY-NC | Substituídos por rins modelados pelo BioLab (córtex, pirâmides, pelve e cálices) |
| Orelha interna (cóclea, vestíbulo, canais semicirculares) | CC BY-NC-SA (Universidade de Dundee) | Os ossículos da audição estão presentes; a orelha interna não |
| Parcelamento do encéfalo, cerebelo, núcleos, ventrículos | Origem "Brainder/White matter" sem licença declarada | Substituído por um encéfalo modelado pelo BioLab (lobos, cerebelo, tronco, corpo caloso, tálamo, hipotálamo, ventrículos laterais) |

Também foram retirados, por motivo **visual** (não de licença): omentos, mesocólon, pleura e
segmentos do fígado, que cobriam órgãos inteiros.

## Pesquisados e não usados

| Recurso | Motivo |
|---|---|
| `nqwrc/3d-anatomy` | Repositório inteiro sob CC BY-NC-SA |
| Textos da Wikipédia (definições do Z-Anatomy) | CC BY-SA, mas preferimos texto próprio em pt-BR baseado no OpenStax (CC BY 4.0) |
| Modelos Sketchfab de órgãos isolados | Licenças mistas por modelo; a maioria NC ou "Standard" sem redistribuição |

## Como substituir as partes que faltam

Rins, encéfalo e o sistema reprodutor feminino (que o corpo do Z-Anatomy não tem) já são
modelados em código pelo próprio projeto (`laboratories/human/organs.ts`): formas didáticas,
sem arquivo de terceiros. Falta a orelha interna; as opções são modelar do zero, contratar
modelagem ou licenciar um modelo com licença comercial explícita. Qualquer novo arquivo deve
ganhar uma linha nesta tabela antes de ser publicado.

## Reproduzir a exportação

```bash
# Requer Blender 4.2+ ou o módulo bpy (Python 3.11)
git clone https://github.com/Z-Anatomy/Models-of-human-anatomy   # descompacte Z-Anatomy.zip
OUT=./out blender -b Startup.blend -P tools/blender/export_z_anatomy.py
node scripts/build-human-catalog.mjs ./out ./translations.txt
```
