/**
 * Animated processes of the Human Body laboratory (schematic, time-compressed).
 * Texts in pt-BR, checked against OpenStax Anatomy and Physiology 2e, ch. 19–20.
 */
import type { LabProcess } from '@/laboratories/shared/process';

const TIME = 'Animação esquemática, com tempo comprimido.';
const VENOSO = { color: '#3B6FD6', label: 'Sangue pobre em O₂' };
const ARTERIAL = { color: '#E0352B', label: 'Sangue rico em O₂' };

export const HUMAN_PROCESSES: Record<string, LabProcess> = {
  circulacao: {
    id: 'circulacao',
    title: 'Caminho do sangue: circulação pulmonar e sistêmica',
    structures: ['coracao', 'veias-cavas', 'right-atrium', 'right-ventricle', 'arterias-pulmonares', 'veias-pulmonares', 'left-atrium', 'left-ventricle', 'aorta', 'grandes-vasos'],
    note: `${TIME} Cada esfera representa muito sangue; o coração bate cerca de 70 vezes por minuto em repouso.`,
    loop: true,
    steps: [
      { title: '1. Retorno pelas veias cavas', text: 'O sangue pobre em oxigênio, que percorreu o corpo, volta pelas veias cavas superior e inferior e entra no átrio direito.', seconds: 5, legend: [VENOSO] },
      { title: '2. Átrio direito → ventrículo direito', text: 'O átrio direito se contrai e o sangue passa pela valva tricúspide para o ventrículo direito.', seconds: 3.5, legend: [VENOSO] },
      {
        title: '3. Circulação pulmonar',
        text: 'O ventrículo direito bombeia o sangue pelo tronco pulmonar para as artérias pulmonares, até os capilares dos alvéolos. Lá o sangue libera CO₂ e recebe O₂ (hematose).',
        seconds: 6,
        legend: [VENOSO, ARTERIAL],
      },
      { title: '4. Veias pulmonares → átrio esquerdo', text: 'Já oxigenado, o sangue volta pelas quatro veias pulmonares e entra no átrio esquerdo.', seconds: 4, legend: [ARTERIAL] },
      { title: '5. Átrio esquerdo → ventrículo esquerdo', text: 'O sangue passa pela valva mitral para o ventrículo esquerdo, a câmara de parede mais espessa.', seconds: 3.5, legend: [ARTERIAL] },
      {
        title: '6. Circulação sistêmica',
        text: 'O ventrículo esquerdo ejeta o sangue pela valva aórtica para a aorta, que o distribui à cabeça, aos braços, aos órgãos do abdome e às pernas. Nos capilares ele entrega O₂ e nutrientes e recolhe CO₂, voltando pelas veias.',
        seconds: 7,
        legend: [ARTERIAL, VENOSO],
      },
    ],
  },
  'ciclo-cardiaco': {
    id: 'ciclo-cardiaco',
    title: 'Ciclo cardíaco: diástole e sístole',
    structures: ['coracao', 'right-atrium', 'left-atrium', 'right-ventricle', 'left-ventricle', 'valva-tricuspide', 'valva-mitral', 'valva-aortica', 'valva-pulmonar'],
    note: `${TIME} Um ciclo completo dura cerca de 0,8 s em repouso; aqui ele está mais lento para ser visto.`,
    loop: true,
    steps: [
      { title: 'Diástole: o coração enche', text: 'Com o músculo relaxado, o sangue das veias cavas e das veias pulmonares entra nos átrios e passa, pelas valvas atrioventriculares abertas, para os ventrículos.', seconds: 3, legend: [VENOSO, ARTERIAL] },
      { title: 'Sístole atrial', text: 'Os átrios se contraem e completam o enchimento dos ventrículos.', seconds: 1.5, legend: [] },
      {
        title: 'Sístole ventricular',
        text: 'Os ventrículos se contraem: as valvas tricúspide e mitral se fecham (1º som, "tum"), as valvas pulmonar e aórtica se abrem e o sangue é ejetado para o tronco pulmonar e para a aorta.',
        seconds: 2.5,
        legend: [VENOSO, ARTERIAL],
      },
      { title: 'Relaxamento', text: 'Os ventrículos relaxam, a pressão cai e as valvas aórtica e pulmonar se fecham (2º som, "tá"). O ciclo recomeça.', seconds: 1.5, legend: [] },
    ],
  },
};
