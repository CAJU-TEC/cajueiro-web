<template>
  <!-- Pôster inteiro num SVG só. Tudo aqui é auto-contido (gradientes, filtros
       e fontes por atributo), porque a exportação serializa este mesmo nó e o
       desenha num canvas — CSS de fora não acompanha. -->
  <svg
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${W} ${H}`"
    :width="W"
    :height="H"
    class="cajueiro-poster"
  >
    <defs>
      <linearGradient id="cpSky" x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0%" stop-color="#1B7A57" />
        <stop offset="55%" stop-color="#0F3D2E" />
        <stop offset="100%" stop-color="#05170F" />
      </linearGradient>

      <!-- Casca: userSpaceOnUse de propósito. Em objectBoundingBox cada galho
           (e cada disco de forquilha) ganha o próprio degradê e a árvore fica
           remendada; assim todos compartilham a mesma luz. -->
      <linearGradient
        id="cpBark"
        gradientUnits="userSpaceOnUse"
        :x1="treeBox.x + treeBox.w * 0.18"
        y1="0"
        :x2="treeBox.x + treeBox.w * 0.86"
        y2="0"
      >
        <stop offset="0%" stop-color="#4A2F1C" />
        <stop offset="45%" stop-color="#7A5133" />
        <stop offset="100%" stop-color="#3E2716" />
      </linearGradient>

      <radialGradient id="cpLeafA" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0%" stop-color="#2E7D32" />
        <stop offset="100%" stop-color="#14431A" />
      </radialGradient>
      <radialGradient id="cpLeafB" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0%" stop-color="#66BB6A" />
        <stop offset="100%" stop-color="#2E7D32" />
      </radialGradient>
      <radialGradient id="cpLeafC" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0%" stop-color="#9CCC65" />
        <stop offset="100%" stop-color="#4CAF50" />
      </radialGradient>

      <!-- Brilho contido: com raio e opacidade altos ele lavava a cor do caju. -->
      <radialGradient id="cpGloss" cx="0.3" cy="0.22" r="0.42">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".42" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
      </radialGradient>

      <linearGradient id="cpTopScrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05170F" stop-opacity=".85" />
        <stop offset="100%" stop-color="#05170F" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="cpFooter" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#05170F" stop-opacity="0" />
        <stop offset="45%" stop-color="#05170F" stop-opacity=".92" />
        <stop offset="100%" stop-color="#05170F" />
      </linearGradient>

      <radialGradient id="cpVignette" cx="0.5" cy="0.42" r="0.75">
        <stop offset="58%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity=".42" />
      </radialGradient>

      <filter id="cpShadow" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#000000" flood-opacity=".5" />
      </filter>
    </defs>

    <rect :width="W" :height="H" fill="url(#cpSky)" />

    <!-- A árvore vive num svg aninhado com o próprio sistema de coordenadas.
         "slice" em vez de "meet": a copa sangra pelas bordas e ocupa o pôster
         inteiro, em vez de virar uma arvorezinha centralizada com margem
         morta em volta. -->
    <svg
      :x="treeBox.x"
      :y="treeBox.y"
      :width="treeBox.w"
      :height="treeBox.h"
      :viewBox="`0 0 ${tree.width} ${tree.height}`"
      preserveAspectRatio="xMidYMid slice"
    >
      <ellipse
        :cx="tree.width / 2"
        :cy="tree.ground"
        :rx="tree.width * 0.3"
        ry="26"
        fill="#000000"
        opacity=".3"
      />

      <path v-for="(b, i) in tree.branches" :key="`b-${i}`" :d="b.d" fill="url(#cpBark)" />
      <circle
        v-for="(j, i) in tree.joints"
        :key="`j-${i}`"
        :cx="j.x"
        :cy="j.y"
        :r="j.r"
        fill="url(#cpBark)"
      />

      <path v-for="(l, i) in tree.leaves" :key="`l-${i}`" :d="l.d" :fill="LEAF_FILL[l.tone]" />

      <!-- Cajus: os conquistados na cor do plano, os que faltam apagados na
           mesma posição — a árvore já mostra quanto ainda tem para colher. -->
      <g v-for="(fruit, i) in fruits" :key="`f-${i}`" filter="url(#cpShadow)">
        <path
          :d="stemPath(fruit.x, fruit.y, FRUIT_R)"
          :stroke="fruit.lit ? '#7CB342' : '#33604B'"
          stroke-width="7"
          stroke-linecap="round"
          fill="none"
        />
        <path
          :d="castanhaPath(fruit.x, fruit.y, FRUIT_R)"
          :fill="fruit.lit ? '#5D4037' : '#08221A'"
        />
        <path
          :d="cajuPath(fruit.x, fruit.y, FRUIT_R)"
          :fill="fruit.lit ? fruit.color : '#08221A'"
          :fill-opacity="fruit.lit ? 1 : 0.92"
        />
        <path
          v-if="fruit.lit"
          :d="cajuPath(fruit.x, fruit.y, FRUIT_R)"
          fill="url(#cpGloss)"
        />
        <path
          v-else
          :d="cajuPath(fruit.x, fruit.y, FRUIT_R)"
          fill="none"
          stroke="#8FD3A8"
          stroke-width="3.5"
          stroke-opacity=".85"
        />
        <text
          :x="fruit.x"
          :y="fruit.y + 12"
          text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-size="34"
          font-weight="bold"
          :fill="fruit.lit ? '#FFFFFF' : '#8FD3A8'"
          :fill-opacity="fruit.lit ? 1 : 0.75"
        >
          {{ i + 1 }}
        </text>
      </g>
    </svg>

    <rect :width="W" :height="H" fill="url(#cpVignette)" />
    <rect :width="W" :height="head.scrim" fill="url(#cpTopScrim)" />
    <rect :y="H - foot.height" :width="W" :height="foot.height" fill="url(#cpFooter)" />

    <!-- cabeçalho -->
    <text
      :x="W / 2"
      :y="head.eyebrow"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      letter-spacing="8"
      fill="#8FD3A8"
    >
      TRILHA DE APRENDIZADO
    </text>
    <text
      :x="W / 2"
      :y="head.title"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      :font-size="head.size"
      font-weight="bold"
      fill="#FFFFFF"
      filter="url(#cpShadow)"
    >
      Esse é meu cajueiro
    </text>

    <!-- rodapé -->
    <text
      x="72"
      :y="foot.name"
      font-family="Arial, Helvetica, sans-serif"
      font-size="46"
      font-weight="bold"
      fill="#FFFFFF"
    >
      {{ payload.collaborator.full_name }}
    </text>
    <text
      x="72"
      :y="foot.meta"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      fill="#B6E3C6"
    >
      {{ metaLine }}
    </text>

    <g v-if="payload.job_plan">
      <rect
        x="72"
        :y="foot.plan"
        :width="planWidth"
        height="52"
        rx="26"
        :fill="payload.job_plan.badge_color || '#F9A825'"
      />
      <text
        :x="72 + planWidth / 2"
        :y="foot.plan + 34"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="24"
        font-weight="bold"
        fill="#FFFFFF"
      >
        {{ payload.job_plan.description }}
      </text>
    </g>

    <text
      :x="W - 72"
      :y="foot.count"
      text-anchor="end"
      font-family="Arial, Helvetica, sans-serif"
      font-size="90"
      font-weight="bold"
      fill="#FFD54F"
    >
      {{ payload.harvested }}
    </text>
    <text
      :x="W - 72"
      :y="foot.count + 30"
      text-anchor="end"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      letter-spacing="3"
      fill="#8FD3A8"
    >
      {{ payload.harvested === 1 ? 'CAJU' : 'CAJUS' }}
    </text>
  </svg>
</template>

<script>
import { computed, defineComponent, ref } from 'vue';
import {
  buildCajueiro,
  cajuPath,
  castanhaPath,
  stemPath,
} from 'src/support/trails/cajueiroTree';

const FORMATS = {
  square: { w: 1080, h: 1080 },
  story: { w: 1080, h: 1920 },
};

const LEAF_FILL = ['url(#cpLeafA)', 'url(#cpLeafB)', 'url(#cpLeafC)'];
const FRUIT_R = 44;

export default defineComponent({
  name: 'CajueiroPoster',
  props: {
    payload: {
      type: Object,
      required: true,
    },
    format: {
      type: String,
      default: 'square',
    },
  },
  setup(props) {
    const svg = ref(null);

    const size = computed(() => FORMATS[props.format] ?? FORMATS.square);
    const W = computed(() => size.value.w);
    const H = computed(() => size.value.h);
    const isStory = computed(() => H.value > W.value);

    // Uma ponta por etapa da trilha: as conquistadas viram caju maduro, as
    // demais ficam apagadas.
    const tree = computed(() =>
      buildCajueiro(Math.max(props.payload.total_stages ?? 0, props.payload.fruits?.length ?? 0))
    );

    const fruits = computed(() =>
      tree.value.anchors.map((anchor, index) => {
        const fruit = props.payload.fruits?.[index];

        return {
          ...anchor,
          lit: !!fruit,
          color: fruit?.color || '#F9A825',
        };
      })
    );

    const head = computed(() =>
      isStory.value
        ? { eyebrow: 168, title: 246, size: 74, scrim: 380 }
        : { eyebrow: 78, title: 148, size: 64, scrim: 260 }
    );

    // A caixa avança por baixo do rodapé de propósito: o tronco desce e some
    // no degradê, em vez de sobrar uma faixa vazia entre a árvore e o texto.
    // As alturas mantêm a proporção perto da da árvore (1000x960), para o
    // "slice" cortar pouco das laterais da copa.
    const treeBox = computed(() =>
      isStory.value
        ? { x: 0, y: 300, w: W.value, h: 1250 }
        : { x: 0, y: 60, w: W.value, h: 1020 }
    );

    const foot = computed(() =>
      isStory.value
        ? {
          height: 460,
          name: H.value - 250,
          meta: H.value - 208,
          plan: H.value - 180,
          count: H.value - 210,
        }
        : {
          height: 300,
          name: H.value - 168,
          meta: H.value - 126,
          plan: H.value - 98,
          count: H.value - 128,
        }
    );

    const metaLine = computed(() => {
      const team = props.payload.team?.name ? `Time ${props.payload.team.name} · ` : '';
      return `${team}${props.payload.harvested} de ${props.payload.total_stages} etapas colhidas`;
    });

    // Sem medir texto no SVG: aproximação suficiente para a pílula do plano.
    const planWidth = computed(() =>
      Math.min(700, (props.payload.job_plan?.description?.length ?? 0) * 13 + 52)
    );

    return {
      svg,
      W,
      H,
      tree,
      fruits,
      head,
      treeBox,
      foot,
      metaLine,
      planWidth,
      LEAF_FILL,
      FRUIT_R,
      cajuPath,
      castanhaPath,
      stemPath,
    };
  },
});
</script>

<style lang="scss" scoped>
.cajueiro-poster {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}
</style>
