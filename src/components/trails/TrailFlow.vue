<template>
  <div class="trail-flow" :style="{ height: `${frameHeight}px` }">
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
      fit-view-on-init
      @node-click="onNodeClick"
    >
      <Background pattern-color="#c8e6c9" :gap="22" />
      <Controls :show-interactive="false" position="bottom-right" />
    </VueFlow>
  </div>
</template>

<script>
import { computed, defineComponent, markRaw, nextTick, watch } from 'vue';
import { VueFlow, useVueFlow, Position } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import dagre from '@dagrejs/dagre';
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

// Precisam bater com o CSS dos nós: o dagre posiciona pela caixa.
const ROOT_SIZE = { width: 200, height: 76 };
// Altura no pior caso: o card da etapa cresce com a linha de "aguardando
// avaliação" e com os botões do líder. Superestimar só afasta um pouco os nós;
// subestimar faz um card cobrir o outro.
const STAGE_SIZE = { width: 240, height: 124 };
const LEVEL_SIZE = { width: 280, height: 40 };

let instances = 0;

export default defineComponent({
  name: 'TrailFlow',
  components: { VueFlow, Background, Controls },
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

    const { fitView } = useVueFlow(flowId);

    const nodeTypes = {
      root: markRaw(TrailRootNode),
      stage: markRaw(StageNode),
      level: markRaw(LevelNode),
    };

    // Monta o grafo e deixa o dagre resolver as posições no sentido
    // esquerda -> direita. Sem cálculo de layout na mão.
    const graph = computed(() => {
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      // nodesep 18 deixava os cards quase encostados (têm borda de 2px); 26 dá
      // respiro sem esticar o desenho. ranksep menor aproxima as colunas e o
      // grafo fica mais largo do que alto, que é a proporção da moldura.
      g.setGraph({ rankdir: 'LR', nodesep: 26, ranksep: 76, marginx: 20, marginy: 20 });

      const nodes = [];
      const edges = [];

      // Raiz = a trilha. Sem ela o dagre encadearia etapa a etapa numa escada
      // diagonal; com ela sai o mesmo desenho do mapa mental: raiz, etapas e
      // níveis em três colunas.
      g.setNode('root', { ...ROOT_SIZE });
      nodes.push({
        id: 'root',
        type: 'root',
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        data: {
          description: props.trail?.description ?? 'Trilha',
          team: props.trail?.team,
          completed: props.stages.filter((s) => s.state === 'completed').length,
          total: props.stages.length,
        },
      });

      props.stages.forEach((stage) => {
        const stageId = `stage-${stage.id}`;

        g.setNode(stageId, { ...STAGE_SIZE });
        g.setEdge('root', stageId);

        edges.push({
          id: `e-root-${stageId}`,
          source: 'root',
          target: stageId,
          type: 'smoothstep',
          style: {
            stroke: stage.state === 'locked' ? COLORS.locked : COLORS.completed,
            strokeWidth: stage.state === 'locked' ? 2 : 5,
          },
        });
        nodes.push({
          id: stageId,
          type: 'stage',
          position: { x: 0, y: 0 },
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

        (stage.levels ?? []).forEach((level) => {
          const levelId = `level-${level.id}`;

          g.setNode(levelId, { ...LEVEL_SIZE });
          g.setEdge(stageId, levelId);

          nodes.push({
            id: levelId,
            type: 'level',
            position: { x: 0, y: 0 },
            sourcePosition: Position.Right,
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

      dagre.layout(g);

      // Soft skill acima, hard skill abaixo, dentro de cada etapa.
      //
      // Em vez de calcular posição nova, as faixas verticais que o dagre já
      // reservou para os níveis da etapa são redistribuídas: os mesmos Y, na
      // ordem soft primeiro. Assim nada passa a se sobrepor e a altura do
      // desenho não muda — só a ordem de quem ocupa cada faixa.
      props.stages.forEach((stage) => {
        const levels = stage.levels ?? [];

        if (levels.length < 2) return;

        const slots = levels.map((level) => g.node(`level-${level.id}`).y).sort((a, b) => a - b);
        const ordered = [
          ...levels.filter((level) => level.skill === 'soft'),
          ...levels.filter((level) => level.skill !== 'soft'),
        ];

        ordered.forEach((level, index) => {
          g.node(`level-${level.id}`).y = slots[index];
        });
      });

      // O dagre devolve o centro do nó; o Vue Flow espera o canto superior esquerdo.
      nodes.forEach((node) => {
        const { x, y, width, height } = g.node(node.id);
        node.position = { x: x - width / 2, y: y - height / 2 };
      });

      // Dimensões que o dagre calculou, para a moldura acompanhar o desenho.
      const { width, height } = g.graph();

      return { nodes, edges, size: { width, height } };
    });

    const nodes = computed(() => graph.value.nodes);
    const edges = computed(() => graph.value.edges);

    /**
     * Altura da moldura acompanha o desenho.
     *
     * Com altura fixa, uma trilha de uma etapa deixava mais de 300px de faixa
     * morta: o grafo tem ~124px de altura, o fitView para no maxZoom e o resto
     * do quadro fica vazio. O piso evita moldura apertada demais para os
     * controles de zoom, e o teto mantém o pan em trilha grande.
     */
    const frameHeight = computed(() =>
      Math.min(620, Math.max(240, (graph.value.size.height ?? 0) + 72))
    );

    // Depois de recalcular (avanço de etapa, por exemplo) reenquadra.
    watch(
      () => props.stages,
      async () => {
        await nextTick();
        fitView({ padding: 0.12 });
      },
      { deep: true }
    );

    const onNodeClick = ({ node }) => {
      if (node.type === 'stage') emit('stage-click', node.data.stage);
      if (node.type === 'level') emit('level-click', node.data.level);
    };

    return { flowId, nodes, edges, frameHeight, nodeTypes, onNodeClick };
  },
});
</script>

<style lang="scss">
/* Sem scoped: as regras precisam alcançar os elementos que a lib renderiza. */
.trail-flow {
  width: 100%;
  /* A altura vem do componente, calculada a partir do tamanho do grafo. */
  background: linear-gradient(180deg, #f6fbf4 0%, #ffffff 100%);
  border-radius: 6px;
}

.trail-flow .vue-flow__handle {
  opacity: 0;
}
</style>
