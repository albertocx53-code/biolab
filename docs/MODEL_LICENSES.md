# Licenças dos modelos 3D

Regra do projeto: o BioLab 3D é um produto pago, então **nenhum recurso com cláusula não comercial
(NC) ou sem licença declarada entra no aplicativo**. Cada decisão abaixo foi verificada na fonte.

## Em uso

| Recurso | Fonte | Licença | Uso comercial | Obrigações |
|---|---|---|---|---|
| Corpo humano (8 GLBs em `public/models/human/v1/`) | Z-Anatomy, `Startup.blend` do repositório `Z-Anatomy/Models-of-human-anatomy` | CC BY-SA 4.0 | Sim | Atribuição; derivados sob a mesma licença |
| Geometria de base do Z-Anatomy | BodyParts3D (DBCLS) | CC BY-SA 2.1 JP | Sim | Atribuição; mesma licença |
| Tabela de traduções (nomes em pt/la/en) | Z-Anatomy (`translations`) | CC BY-SA 4.0 | Sim | Idem |
| Imagens `hero-anatomia.webp`, `card-anatomia.webp` | Renderizadas por nós a partir dos GLBs acima | CC BY-SA 4.0 (derivado) | Sim | Idem |
| Decodificador Draco (`public/draco/`) | three.js | MIT | Sim | Aviso de copyright |
| Fontes Inter e Manrope | @fontsource | SIL OFL 1.1 | Sim | — |

**Share-alike:** a obrigação recai sobre os *modelos derivados* (os GLBs e o catálogo), que são
distribuídos sob CC BY-SA 4.0 (`public/models/LICENSE.md`). O código do aplicativo é uma obra
separada que apenas carrega esses arquivos. A atribuição aparece no rodapé do laboratório e na
página `/creditos`.

## Excluídos do arquivo exportado

O Z-Anatomy reúne malhas de origens diferentes. As que não têm licença compatível foram retiradas
no momento da exportação (`tools/blender/export_z_anatomy.py`, expressões `NONCOMMERCIAL` e `BRAIN`):

| Estruturas | Motivo | Consequência |
|---|---|---|
| Rins e pelve renal | Modelos de terceiros sob CC BY-NC | Sistema urinário mostra bexiga, ureteres e uretra; o painel da bexiga avisa sobre a ausência dos rins |
| Orelha interna (cóclea, vestíbulo, canais semicirculares) | CC BY-NC-SA (Universidade de Dundee) | Os ossículos da audição estão presentes; a orelha interna não |
| Parcelamento do encéfalo, cerebelo, núcleos, ventrículos | Origem "Brainder/White matter" sem licença declarada | O sistema nervoso mostra nervos periféricos e medula, mas não o encéfalo detalhado |

Também foram retirados, por motivo **visual** (não de licença): omentos, mesocólon, pleura e
segmentos do fígado, que cobriam órgãos inteiros.

## Pesquisados e não usados

| Recurso | Motivo |
|---|---|
| `nqwrc/3d-anatomy` | Repositório inteiro sob CC BY-NC-SA |
| Textos da Wikipédia (definições do Z-Anatomy) | CC BY-SA, mas preferimos texto próprio em pt-BR baseado no OpenStax (CC BY 4.0) |
| Modelos Sketchfab de órgãos isolados | Licenças mistas por modelo; a maioria NC ou "Standard" sem redistribuição |

## Como substituir as partes que faltam

Para rins, orelha interna e encéfalo, as opções a avaliar na próxima fase são: modelar do zero
(propriedade do projeto), contratar modelagem, ou licenciar modelos com licença comercial
explícita. Qualquer novo arquivo deve ganhar uma linha nesta tabela antes de ser publicado.

## Reproduzir a exportação

```bash
# Requer Blender 4.2+ ou o módulo bpy (Python 3.11)
git clone https://github.com/Z-Anatomy/Models-of-human-anatomy   # descompacte Z-Anatomy.zip
OUT=./out blender -b Startup.blend -P tools/blender/export_z_anatomy.py
node scripts/build-human-catalog.mjs ./out ./translations.txt
```
