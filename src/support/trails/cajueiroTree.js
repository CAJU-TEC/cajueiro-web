// Cajueiro procedural: tronco com raízes, copa densa e as pontas onde os cajus
// são pendurados — uma por etapa da trilha.
//
// Determinístico de ponta a ponta (PRNG com semente fixa, nenhum Math.random):
// o pôster na tela e o PNG exportado precisam ser exatamente o mesmo desenho,
// porque a exportação serializa o SVG que está montado.
//
// A árvore NÃO muda de forma conforme o número de etapas — isso é proposital.
// Antes cada etapa virava uma bifurcação, então uma trilha de 3 etapas gerava
// um "Y" seco. Agora a copa é sempre a mesma e as etapas só escolhem em quais
// pontas os cajus aparecem.

const VIEW_W = 1000;
const VIEW_H = 960; // sem sobra embaixo: o pôster corta o que passa disso

const GROUND_Y = 944;
const TRUNK_TOP_Y = 706;
const TRUNK_BASE_W = 104;
const TRUNK_TOP_W = 60;

// Copa alvo: os galhos são desviados para dentro dela, o que dá o contorno
// redondo da referência em vez de um respingo de fractal.
const CROWN = { x: VIEW_W / 2, y: 452, rx: 462, ry: 402 };

const MAX_DEPTH = 6;
const MIN_LENGTH = 26;
const LIMB_LENGTH = 152;
const LENGTH_DECAY = 0.8;
const WIDTH_DECAY = 0.7;

const LEAVES_PER_TWIG = 6;
const LEAF_LENGTH = 33;

// Margem em que os cajus podem ser pendurados. O pôster recorta a árvore
// (preserveAspectRatio slice) para preencher o quadro nos dois formatos, e o
// story é o que mais come das laterais.
const SAFE = { x1: 150, x2: 850, y1: 110 };

const SEED = 20260801;

const TAU = Math.PI * 2;
const rad = (deg) => (deg * Math.PI) / 180;
const round = (n) => Math.round(n * 10) / 10;

// mulberry32: pequeno, sem dependência e estável entre navegadores.
function makeRandom(seed) {
  let a = seed >>> 0;

  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Diferença entre ângulos no intervalo [-PI, PI], para poder interpolar sem
// dar meia volta quando cruza o -180/180.
const angleDelta = (to, from) => {
  const d = (to - from + Math.PI) % TAU;
  return (d < 0 ? d + TAU : d) - Math.PI;
};

/**
 * Galho como faixa preenchida (não traço): começa com a largura do pai e
 * afina até a ponta, o que dá a silhueta orgânica. A bézier quadrática sai
 * tangente ao ângulo de entrada e chega tangente ao de saída.
 */
function ribbon(x1, y1, a1, x2, y2, a2, cx, cy, w1, w2) {
  const n1x = Math.cos(a1 + Math.PI / 2) * (w1 / 2);
  const n1y = Math.sin(a1 + Math.PI / 2) * (w1 / 2);
  const n2x = Math.cos(a2 + Math.PI / 2) * (w2 / 2);
  const n2y = Math.sin(a2 + Math.PI / 2) * (w2 / 2);
  const am = (a1 + a2) / 2;
  const wm = (w1 + w2) / 4;
  const ncx = Math.cos(am + Math.PI / 2) * wm;
  const ncy = Math.sin(am + Math.PI / 2) * wm;

  return (
    `M ${round(x1 + n1x)} ${round(y1 + n1y)}` +
    ` Q ${round(cx + ncx)} ${round(cy + ncy)}, ${round(x2 + n2x)} ${round(y2 + n2y)}` +
    ` L ${round(x2 - n2x)} ${round(y2 - n2y)}` +
    ` Q ${round(cx - ncx)} ${round(cy - ncy)}, ${round(x1 - n1x)} ${round(y1 - n1y)} Z`
  );
}

// Folha lanceolada, o formato do cajueiro: dois arcos que se encontram numa
// ponta, com a base arredondada.
export function leafPath(x, y, angle, length) {
  const w = length * 0.42;
  const tipX = x + Math.cos(angle) * length;
  const tipY = y + Math.sin(angle) * length;
  const nx = Math.cos(angle + Math.PI / 2) * w;
  const ny = Math.sin(angle + Math.PI / 2) * w;
  const mx = x + Math.cos(angle) * length * 0.42;
  const my = y + Math.sin(angle) * length * 0.42;

  return (
    `M ${round(x)} ${round(y)}` +
    ` Q ${round(mx + nx)} ${round(my + ny)}, ${round(tipX)} ${round(tipY)}` +
    ` Q ${round(mx - nx)} ${round(my - ny)}, ${round(x)} ${round(y)} Z`
  );
}

export function buildCajueiro(anchorCount) {
  const random = makeRandom(SEED);
  const branches = [];
  const joints = [];
  const leaves = [];
  const tips = [];

  const push = (x1, y1, a1, x2, y2, a2, cx, cy, w1, w2, depth) => {
    branches.push({ d: ribbon(x1, y1, a1, x2, y2, a2, cx, cy, w1, w2), depth });

    // Nas bifurcações grossas as faixas se encontram em ângulo e deixam um
    // canto reto no encontro. Um disco do mesmo marrom arredonda a forquilha.
    // Só nas primeiras profundidades: nos raminhos ninguém vê e seriam
    // centenas de nós a mais.
    if (depth <= 3) joints.push({ x: round(x1), y: round(y1), r: round(w1 / 2) });
  };

  // Quanto mais perto da borda da copa, mais o galho é puxado de volta para
  // dentro. Sem isso os ramos externos escapam e a copa perde o contorno.
  const steer = (x, y, angle) => {
    const dx = (x - CROWN.x) / CROWN.rx;
    const dy = (y - CROWN.y) / CROWN.ry;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.55) return angle;

    const pull = Math.min(0.55, (dist - 0.55) * 1.4);
    const inward = Math.atan2(CROWN.y - y, CROWN.x - x);

    return angle + angleDelta(inward, angle) * pull;
  };

  // Peso do galho: quanto mais longe do tronco, mais ele cai. É o que dá o
  // contorno "chorão" da referência, em que as pontas laterais descem em vez
  // de apontarem todas para cima.
  // Só a partir do terceiro nível e fraco: aplicado desde a base, o efeito se
  // acumula a cada bifurcação e a copa desaba num "U" com o topo pelado.
  const droop = (angle, depth) =>
    angle + angleDelta(Math.PI / 2, angle) * (0.03 * Math.max(0, depth - 2));

  const sprig = (x, y, angle, length) => {
    for (let i = 0; i < LEAVES_PER_TWIG; i += 1) {
      const t = i / (LEAVES_PER_TWIG - 1);
      // Alterna os lados ao longo do último ramo, como as folhas compostas
      // da referência.
      const side = i % 2 === 0 ? 1 : -1;
      const spread = rad(46 + random() * 26) * side;
      const px = x + Math.cos(angle) * length * (0.25 + t * 0.75);
      const py = y + Math.sin(angle) * length * (0.25 + t * 0.75);
      const size = LEAF_LENGTH * (0.78 + random() * 0.42);

      leaves.push({ d: leafPath(px, py, angle + spread, size), tone: i % 3 });
    }
  };

  const grow = (x, y, angle, length, width, depth) => {
    if (depth > MAX_DEPTH || length < MIN_LENGTH) {
      tips.push({ x: round(x), y: round(y), angle });
      sprig(x, y, angle, length);
      return;
    }

    // Três filhos de vez em quando quebram a simetria do galho binário.
    const kids = depth === 0 ? 3 : random() < 0.24 ? 3 : 2;
    const spread = rad(depth === 0 ? 40 : 30 + random() * 22);

    for (let i = 0; i < kids; i += 1) {
      const offset = (i - (kids - 1) / 2) / Math.max(1, (kids - 1) / 2);
      const jitter = rad((random() - 0.5) * 20);
      const childAngle = droop(steer(x, y, angle + spread * offset + jitter), depth);
      const childLength = length * LENGTH_DECAY * (0.85 + random() * 0.3);
      const childWidth = width * WIDTH_DECAY;

      // Controle a meio caminho na direção do pai: o galho sai alinhado com
      // quem o gerou e só depois vira para o próprio rumo.
      const cx = x + Math.cos(angle) * childLength * 0.5;
      const cy = y + Math.sin(angle) * childLength * 0.5;
      const x2 = cx + Math.cos(childAngle) * childLength * 0.5;
      const y2 = cy + Math.sin(childAngle) * childLength * 0.5;

      push(x, y, angle, x2, y2, childAngle, cx, cy, width, childWidth, depth);
      grow(x2, y2, childAngle, childLength, childWidth, depth + 1);
    }
  };

  // Raízes antes do tronco: desenhadas primeiro ficam atrás dele, então a
  // emenda entre uma coisa e outra não aparece.
  [-1, 1].forEach((side) => {
    [
      { angle: 24, length: 96, width: 44 },
      { angle: 8, length: 148, width: 32 },
    ].forEach(({ angle, length, width }) => {
      const a = rad(angle) * side;
      const x1 = VIEW_W / 2 + side * 22;
      const y1 = GROUND_Y - 58;
      const cx = x1 + side * length * 0.42;
      const cy = y1 + 8;
      const x2 = cx + Math.cos(a) * length * 0.6 * side;
      const y2 = cy + Math.sin(rad(angle)) * length * 0.6;

      push(x1, y1, rad(side > 0 ? 6 : 174), x2, y2, side > 0 ? a : Math.PI - a, cx, cy, width, 6, 9);
    });
  });

  // tronco
  push(
    VIEW_W / 2,
    GROUND_Y,
    rad(-90),
    VIEW_W / 2,
    TRUNK_TOP_Y,
    rad(-90),
    VIEW_W / 2 + 16,
    (GROUND_Y + TRUNK_TOP_Y) / 2,
    TRUNK_BASE_W,
    TRUNK_TOP_W,
    0
  );

  grow(VIEW_W / 2, TRUNK_TOP_Y, rad(-90), LIMB_LENGTH, TRUNK_TOP_W, 0);

  return {
    width: VIEW_W,
    height: VIEW_H,
    ground: GROUND_Y,
    crown: CROWN,
    branches,
    joints,
    leaves,
    anchors: pickAnchors(tips, anchorCount),
  };
}

/**
 * Escolhe onde pendurar os cajus.
 *
 * Amostragem do ponto mais distante (farthest-point sampling) entre as pontas
 * mais externas da copa: garante frutos espalhados em vez de amontoados num
 * canto, e é determinística porque começa sempre da mesma ponta.
 */
function pickAnchors(tips, count) {
  const wanted = Math.max(0, count);

  if (!wanted || !tips.length) return [];

  // Pontas de fora primeiro (um caju no meio da copa fica soterrado de folha),
  // mas dentro da margem segura: o pôster recorta a árvore para preencher o
  // quadro, e um fruto encostado na borda sai pela metade — justamente o que
  // ninguém quer ver cortado.
  const safe = tips.filter((t) => t.x > SAFE.x1 && t.x < SAFE.x2 && t.y > SAFE.y1);
  const outer = (safe.length >= wanted ? safe : tips)
    .sort((a, b) => radiusOf(b) - radiusOf(a))
    .slice(0, Math.max(wanted, Math.ceil(tips.length * 0.55)));

  // Começa pela ponta mais baixa da metade esquerda: é onde o primeiro caju
  // aparece melhor, e fixa a ordem (a amostragem em si é determinística).
  const first =
    [...outer].filter((t) => t.x < CROWN.x).sort((a, b) => b.y - a.y)[0] ?? outer[0];

  const chosen = [first];

  while (chosen.length < Math.min(wanted, outer.length)) {
    let best = null;
    let bestGap = -1;

    outer.forEach((tip) => {
      if (chosen.includes(tip)) return;

      const gap = Math.min(...chosen.map((c) => Math.hypot(c.x - tip.x, c.y - tip.y)));

      if (gap > bestGap) {
        bestGap = gap;
        best = tip;
      }
    });

    if (!best) break;
    chosen.push(best);
  }

  // Devolve na ordem da amostragem, NÃO ordenado por x: como os cajus acesos
  // são sempre os primeiros da lista, ordenar por posição faria os frutos de
  // quem tem meia trilha se amontoarem todos num canto. A amostragem já
  // garante que qualquer prefixo da lista está espalhado pela copa.
  return chosen.map(({ x, y }) => ({ x, y }));
}

const radiusOf = (tip) =>
  Math.hypot((tip.x - CROWN.x) / CROWN.rx, (tip.y - CROWN.y) / CROWN.ry);

/**
 * Caju: pseudofruto em forma de sino (largo em cima, afunilando) com a
 * castanha pendurada embaixo. `r` é o raio nominal do fruto.
 */
export const cajuPath = (cx, cy, r) =>
  `M ${cx} ${cy - r}` +
  ` C ${cx + r * 0.98} ${cy - r * 0.94}, ${cx + r * 0.86} ${cy + r * 0.34}, ${cx + r * 0.2} ${cy + r * 0.76}` +
  ` C ${cx + r * 0.08} ${cy + r * 0.84}, ${cx - r * 0.08} ${cy + r * 0.84}, ${cx - r * 0.2} ${cy + r * 0.76}` +
  ` C ${cx - r * 0.86} ${cy + r * 0.34}, ${cx - r * 0.98} ${cy - r * 0.94}, ${cx} ${cy - r} Z`;

// Castanha: o rim clássico, preso na base do pseudofruto.
export const castanhaPath = (cx, cy, r) => {
  const top = cy + r * 0.72;

  return (
    `M ${cx - r * 0.36} ${top}` +
    ` C ${cx - r * 0.58} ${top + r * 0.36}, ${cx - r * 0.3} ${top + r * 0.72}, ${cx + r * 0.06} ${top + r * 0.66}` +
    ` C ${cx + r * 0.42} ${top + r * 0.6}, ${cx + r * 0.56} ${top + r * 0.2}, ${cx + r * 0.34} ${top - r * 0.06}` +
    ` C ${cx + r * 0.4} ${top + r * 0.26}, ${cx + r * 0.1} ${top + r * 0.36}, ${cx - r * 0.06} ${top + r * 0.16}` +
    ` C ${cx - r * 0.16} ${top + r * 0.04}, ${cx - r * 0.24} ${top - r * 0.02}, ${cx - r * 0.36} ${top} Z`
  );
};

// O talo que prende o caju ao galho.
export const stemPath = (cx, cy, r) =>
  `M ${cx} ${cy - r * 0.96} C ${cx - r * 0.1} ${cy - r * 1.3}, ${cx + r * 0.12} ${cy - r * 1.5}, ${cx} ${cy - r * 1.72}`;
