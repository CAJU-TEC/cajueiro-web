<template>
  <div class="trail-flow" :class="{ 'trail-flow--fullscreen': fullscreen }">
    <VueFlow
      :id="flowId"
      :nodes="nodes"
      :edges="edges"
      :node-types="nodeTypes"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :zoom-on-scroll="false"
      :pan-on-scroll="true"
      :min-zoom="0.3"
      :max-zoom="1.4"
      @node-click="onNodeClick"
    >
      <Background pattern-color="#c8e6c9" :gap="22" />
      <Controls :show-interactive="false" position="bottom-right">
        <ControlButton
          :title="fullscreen ? 'Sair da tela cheia (Esc)' : 'Tela cheia'"
          @click="fullscreen = !fullscreen"
        >
          <q-icon :name="fullscreen ? 'fullscreen_exit' : 'fullscreen'" size="16px" />
        </ControlButton>
      </Controls>
    </VueFlow>
  </div>
</template>

<script>
import { computed, defineComponent, markRaw, nextTick, onUnmounted, ref, watch } from 'vue';
import { VueFlow, useVueFlow, Position } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls, ControlButton } from '@vue-flow/controls';
import TrailRootNode from './nodes/TrailRootNode.vue';
import StageNode from './nodes/StageNode.vue';
import LevelNode from './nodes/LevelNode.vue';

// CSS da lib pelo script: o resolver do Vite cuida do caminho em node_modules,
// o que não acontece com @import dentro do bloco de estilo.
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';

const COLORS = {
  completed: '#43A047',
  unlocked: '#F9A825',
  locked: '#CFD8DC',
};

// Precisam bater com o CSS dos nós: o layout posiciona pela caixa.
const ROOT_SIZE = { width: 200, height: 76 };
// Altura no pior caso: o card da etapa cresce com a linha de "aguardando
// avaliação" e com os botões do líder. Superestimar só afasta um pouco os nós;
// subestimar faz o card cobrir o primeiro nível.
const STAGE_SIZE = { width: 240, height: 124 };
const LEVEL_SIZE = { width: 280, height: 40 };

// Altura em que a linha da sequência entra e sai das etapas — bate com o
// chainAnchor do StageNode.
const CHAIN_Y = 24;
const COLUMN_GAP = 72;
const LEVELS_TOP_GAP = 28;
const LEVEL_GAP = 8;
// Recuo dos níveis dentro da coluna: abre espaço para a linha que desce da
// etapa passar à esquerda dos cartões.
const LEVEL_INDENT = 44;
const COLUMN_WIDTH = Math.max(STAGE_SIZE.width, LEVEL_INDENT + LEVEL_SIZE.width);

let instances = 0;

export default defineComponent({
  name: 'TrailFlow',
  components: { VueFlow, Background, Controls, ControlButton },
  emits: ['stage-click', 'level-click'],
  props: {
    stages: {
      type: Array,
      default: () => [],
    },
    // { description, team } — vira o nó raiz.
    trail: {
      type: Object,
      default: null,
    },
    // Quando true, os nós expõem as ações de avançar/desfazer/marcar nível.
    canAdvance: {
      type: Boolean,
      default: false,
    },
    onAdvance: {
      type: Function,
      default: null,
    },
    onUndo: {
      type: Function,
      default: null,
    },
    onToggleLevel: {
      type: Function,
      default: null,
    },
  },
  setup(props, { emit }) {
    // "Minha trilha" renderiza um TrailFlow por trilha. Sem id explícito cada
    // instância cria um store implícito e o fitView pode agir no gráfico errado.
    instances += 1;
    const flowId = `trail-flow-${instances}`;

    const { fitView, onPaneReady, dimensions } = useVueFlow(flowId);

    const nodeTypes = {
      root: markRaw(TrailRootNode),
      stage: markRaw(StageNode),
      level: markRaw(LevelNode),
    };

    // A trilha é uma sequência: raiz e etapas em linha, da esquerda para a
    // direita, e os níveis pendurados abaixo da etapa a que pertencem.
    const graph = computed(() => {
      const nodes = [];
      const edges = [];

      nodes.push({
        id: 'root',
        type: 'root',
        position: { x: 0, y: CHAIN_Y - ROOT_SIZE.height / 2 },
        sourcePosition: Position.Right,
        data: {
          description: props.trail?.description ?? 'Trilha',
          team: props.trail?.team,
          completed: props.stages.filter((s) => s.state === 'completed').length,
          total: props.stages.length,
        },
      });

      props.stages.forEach((stage, index) => {
        const stageId = `stage-${stage.id}`;
        const columnX = ROOT_SIZE.width + COLUMN_GAP + index * (COLUMN_WIDTH + COLUMN_GAP);
        const previousId = index === 0 ? 'root' : `stage-${props.stages[index - 1].id}`;

        nodes.push({
          id: stageId,
          type: 'stage',
          position: { x: columnX, y: 0 },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          data: {
            ...stage,
            stage,
            canAdvance: props.canAdvance,
            onAdvance: props.onAdvance,
            onUndo: props.onUndo,
          },
        });

        edges.push({
          id: `e-${previousId}-${stageId}`,
          source: previousId,
          sourceHandle: 'next',
          target: stageId,
          type: 'smoothstep',
          style: {
            stroke: stage.state === 'locked' ? COLORS.locked : COLORS.completed,
            strokeWidth: stage.state === 'locked' ? 2 : 5,
          },
        });

        // Soft skill acima, hard skill abaixo, dentro de cada etapa.
        const levels = stage.levels ?? [];
        const ordered = [
          ...levels.filter((level) => level.skill === 'soft'),
          ...levels.filter((level) => level.skill !== 'soft'),
        ];

        ordered.forEach((level, position) => {
          const levelId = `level-${level.id}`;

          nodes.push({
            id: levelId,
            type: 'level',
            position: {
              x: columnX + LEVEL_INDENT,
              y:
                STAGE_SIZE.height +
                LEVELS_TOP_GAP +
                position * (LEVEL_SIZE.height + LEVEL_GAP),
            },
            targetPosition: Position.Left,
            data: {
              ...level,
              level,
              stageState: stage.state,
              canAdvance: props.canAdvance,
              onToggle: props.onToggleLevel,
            },
          });

          edges.push({
            id: `e-${stageId}-${levelId}`,
            source: stageId,
            sourceHandle: 'levels',
            target: levelId,
            type: 'smoothstep',
            animated: stage.state === 'unlocked' && !level.completed,
            style: {
              stroke: level.completed ? COLORS.completed : COLORS.locked,
              strokeWidth: level.completed ? 3 : 2,
            },
          });
        });
      });

      return { nodes, edges };
    });

    const nodes = computed(() => graph.value.nodes);
    const edges = computed(() => graph.value.edges);

    // Uma trilha de dez etapas em linha só caberia inteira na tela num zoom
    // ilegível. Em vez disso enquadra a etapa liberada e as vizinhas — o resto
    // fica a um pan de distância.
    const focus = async () => {
      await nextTick();

      const current = props.stages.findIndex((stage) => stage.state === 'unlocked');
      const start = current < 0 ? 0 : Math.max(current - 1, 0);
      const visible = props.stages.slice(start, start + 3);

      const ids = visible.flatMap((stage) => [
        `stage-${stage.id}`,
        ...(stage.levels ?? []).map((level) => `level-${level.id}`),
      ]);

      if (start === 0) ids.unshift('root');

      fitView({ padding: 0.12, maxZoom: 1, nodes: ids.length ? ids : ['root'] });
    };

    onPaneReady(focus);

    // Depois de recalcular (avanço de etapa, por exemplo) reenquadra.
    watch(() => props.stages, focus, { deep: true });

    // E também quando o painel muda de tamanho — entrar e sair da tela cheia,
    // resize da janela. O fitView depende das dimensões do painel, que a lib só
    // atualiza depois do layout: esperar por elas evita reenquadrar no tamanho
    // antigo.
    watch(dimensions, focus);

    // Overlay em vez da Fullscreen API do navegador: os diálogos de etapa e de
    // nível são renderizados no body e, com o grafo em fullscreen nativo,
    // ficariam por baixo dele — invisíveis.
    const fullscreen = ref(false);

    const exitOnEscape = (event) => {
      // Esc já fecha o diálogo aberto por cima do grafo; sair da tela cheia
      // junto tiraria o usuário de dois lugares de uma tecla só.
      if (event.key !== 'Escape' || document.querySelector('.q-dialog')) return;

      fullscreen.value = false;
    };

    watch(fullscreen, (on) => {
      if (on) window.addEventListener('keydown', exitOnEscape);
      else window.removeEventListener('keydown', exitOnEscape);
    });

    onUnmounted(() => window.removeEventListener('keydown', exitOnEscape));

    const onNodeClick = ({ node }) => {
      if (node.type === 'stage') emit('stage-click', node.data.stage);
      if (node.type === 'level') emit('level-click', node.data.level);
    };

    return { flowId, nodes, edges, nodeTypes, fullscreen, onNodeClick };
  },
});
</script>

<style lang="scss">
/* Sem scoped: as regras precisam alcançar os elementos que a lib renderiza. */
.trail-flow {
  width: 100%;
  height: 520px;
  background: linear-gradient(180deg, #f6fbf4 0%, #ffffff 100%);
  border-radius: 6px;
}

/* Abaixo do z-index de diálogo do Quasar (6000), para os detalhes de etapa e
   de nível continuarem abrindo por cima do grafo em tela cheia. */
.trail-flow--fullscreen {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 5000;
  height: auto;
  border-radius: 0;
}

.trail-flow .vue-flow__handle {
  opacity: 0;
}
</style>
