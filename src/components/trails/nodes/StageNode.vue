<template>
  <div class="stage-node" :class="`stage-node--${data.state}`">
    <!-- Na altura do número da etapa, e não no meio do card: a altura varia com
         o botão do líder e com a linha de "aguardando avaliação", e com o
         handle centralizado a linha da sequência serpentearia entre as etapas. -->
    <Handle type="target" :position="Position.Left" :style="chainAnchor" />

    <div class="stage-node__head">
      <div class="stage-node__mark">
        <q-icon v-if="data.state === 'locked'" name="lock" size="16px" />
        <template v-else>{{ data.position }}</template>
      </div>
      <div class="stage-node__title">{{ data.description }}</div>
    </div>

    <div class="stage-node__meta">
      {{ data.completed_levels_count }}/{{ data.required_count }} níveis
      <!-- Duas porcentagens: conclusão é o quórum, avaliação é a média das
           notas dos níveis já avaliados (R9). -->
      <template v-if="data.evaluation_percent !== null">
        · nota {{ data.evaluation_percent }}%
      </template>
      <template v-if="data.job_plan"> · {{ data.job_plan.description }}</template>
    </div>

    <div v-if="data.submitted_levels_count" class="stage-node__pending">
      <q-icon name="hourglass_top" size="13px" />
      {{ data.submitted_levels_count }} aguardando avaliação
    </div>

    <div v-if="data.materials?.length" class="stage-node__materials">
      <q-icon name="link" size="13px" /> {{ data.materials.length }} material(is)
    </div>

    <!-- Ações do líder; a visão do colaborador não passa canAdvance. -->
    <div v-if="data.canAdvance" class="stage-node__actions">
      <q-btn
        v-if="data.state === 'unlocked'"
        dense
        unelevated
        size="sm"
        color="primary"
        icon="done_all"
        label="Concluir"
        :disable="!quorumMet || pending > 0"
        @click.stop="data.onAdvance?.(data.stage)"
      >
        <!-- Desabilitado com o motivo, em vez de esconder: some sem explicação
             o líder fica sem saber por que não consegue fechar a etapa. -->
        <q-tooltip v-if="!quorumMet">
          Faltam {{ required - (data.completed_levels_count ?? 0) }} de
          {{ required }} níveis
        </q-tooltip>
        <q-tooltip v-else-if="pending > 0">
          Avalie {{ pending }} nível(is) aguardando avaliação
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="data.state === 'completed'"
        dense
        flat
        size="sm"
        color="orange-9"
        icon="undo"
        label="Desfazer"
        @click.stop="data.onUndo?.(data.stage)"
      />
    </div>

    <q-tooltip>{{ stateLabel }}</q-tooltip>

    <Handle id="next" type="source" :position="Position.Right" :style="chainAnchor" />

    <!-- Encostado na borda esquerda, e não no centro: assim a linha dos níveis
         desce rente à lateral dos cartões em vez de cruzar por cima deles. -->
    <Handle
      id="levels"
      type="source"
      :position="Position.Bottom"
      :style="{ left: '22px', transform: 'none' }"
    />
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { STATES } from 'src/support/trails/states';

export default defineComponent({
  name: 'StageNode',
  components: { Handle },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    // Limitado aos níveis existentes, igual ao back: uma etapa que exige 3 e
    // tem 2 cadastrados não pode ficar impossível de fechar.
    const required = computed(() =>
      Math.min(props.data.required_count ?? 0, props.data.levels_count ?? 0)
    );

    // Etapa sem nível cadastrado não tem quórum a exigir: o líder fecha na mão.
    // O back valida a mesma coisa; aqui é só para não oferecer o clique.
    const quorumMet = computed(
      () => !props.data.levels_count || (props.data.completed_levels_count ?? 0) >= required.value
    );

    // Envio sem resposta do líder trava o fechamento da etapa (R9): o back
    // recusa, e aqui é para não oferecer o clique.
    const pending = computed(() => props.data.submitted_levels_count ?? 0);

    return {
      Position,
      // Precisa bater com o CHAIN_Y do TrailFlow, que posiciona a raiz.
      chainAnchor: { top: '21px', transform: 'none' },
      required,
      quorumMet,
      pending,
      stateLabel: computed(() => STATES[props.data.state]?.label ?? props.data.state),
    };
  },
});
</script>

<style lang="scss" scoped>
.stage-node {
  width: 240px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 2px solid #bdbdbd;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
  cursor: pointer;
}

.stage-node--completed {
  border-color: #2e7d32;
  background: #e8f5e9;
}

.stage-node--unlocked {
  border-color: #f9a825;
  background: #fff8e1;
}

.stage-node__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-node__mark {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  background: #bdbdbd;
}

.stage-node--completed .stage-node__mark {
  background: #43a047;
}

.stage-node--unlocked .stage-node__mark {
  background: #f9a825;
}

.stage-node__title {
  font-size: 14px;
  font-weight: 600;
  color: #263238;
  line-height: 1.2;
}

.stage-node__meta {
  margin-top: 6px;
  font-size: 11.5px;
  color: #78909c;
}

.stage-node__materials {
  margin-top: 4px;
  font-size: 11px;
  color: #1976d2;
}

.stage-node__pending {
  margin-top: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #f57f17;
}

.stage-node__actions {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}
</style>
