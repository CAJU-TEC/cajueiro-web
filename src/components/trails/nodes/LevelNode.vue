<template>
  <div class="level-node" :class="{ 'level-node--done': data.completed }">
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

    <span class="level-node__label">{{ data.description }}</span>

    <q-icon
      v-if="data.materials?.length"
      name="link"
      size="14px"
      color="blue-5"
      class="level-node__link"
    />

    <q-tooltip>{{ data.description }}</q-tooltip>

    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Handle, Position } from '@vue-flow/core';

export default defineComponent({
  name: 'LevelNode',
  components: { Handle },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return { Position };
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

.level-node__link {
  flex: 0 0 auto;
}
</style>
