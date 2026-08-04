<template>
  <div
    class="level-node"
    :class="{
      'level-node--done': data.completed,
      'level-node--late': data.period_state === 'late',
    }"
  >
    <Handle type="target" :position="Position.Left" />

    <q-checkbox
      v-if="data.canAdvance"
      dense
      :model-value="data.completed"
      :disable="data.stageState === 'locked'"
      class="level-node__check"
      @update:model-value="(value) => data.onToggle?.(data.level, value)"
      @click.stop
    />
    <q-icon
      v-else
      :name="data.completed ? 'check_circle' : 'radio_button_unchecked'"
      :color="data.completed ? 'positive' : 'grey-5'"
      size="18px"
      class="level-node__check"
    />

    <q-icon
      v-if="skill"
      :name="skill.icon"
      :color="skill.color"
      size="14px"
      class="level-node__skill"
    />

    <span class="level-node__label">{{ data.description }}</span>

    <q-icon
      v-if="data.materials?.length"
      name="link"
      size="14px"
      color="blue-5"
      class="level-node__link"
    />

    <!-- Prazo: só ícone, que o nó tem 280px e o rótulo já briga por espaço.
         O texto vai no tooltip. -->
    <q-icon
      v-if="period && data.period_state !== 'not_started' && data.period_state !== 'done'"
      :name="period.icon"
      :color="period.color"
      size="15px"
      class="level-node__period"
    />

    <q-tooltip>
      {{ data.description }}
      <template v-if="skill"><br />{{ skill.label }}</template>
      <template v-if="deadline"><br />{{ deadline }}</template>
    </q-tooltip>

    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import { PERIODS, SKILLS, formatDate } from 'src/support/trails/states';

export default defineComponent({
  name: 'LevelNode',
  components: { Handle },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const period = computed(() => PERIODS[props.data.period_state]);
    const skill = computed(() => SKILLS[props.data.skill]);

    const deadline = computed(() => {
      const { period_state: state, starts_at: from, ends_at: to } = props.data;

      if (state === 'late') return `Atrasado desde ${formatDate(to)}`;
      if (state === 'running') return `Prazo até ${formatDate(to)}`;
      if (state === 'scheduled') return `Inicia em ${formatDate(from)}`;

      return null;
    });

    return { Position, period, skill, deadline };
  },
});
</script>

<style lang="scss" scoped>
.level-node {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 280px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 2px solid #dddddd;
  background: #fff;
  cursor: pointer;
}

.level-node--done {
  border-color: #43a047;
  background: #e8f5e9;
}

/* Atrasado só pinta o que ainda não foi concluído: nível entregue fora do
   prazo já era, não interessa mais cobrar. */
.level-node--late:not(.level-node--done) {
  border-color: #c62828;
  background: #ffebee;
}

.level-node__check {
  flex: 0 0 auto;
}

.level-node__label {
  flex: 1 1 auto;
  font-size: 13px;
  color: #37474f;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.level-node--done .level-node__label {
  color: #2e7d32;
}

.level-node__link,
.level-node__period,
.level-node__skill {
  flex: 0 0 auto;
}
</style>
