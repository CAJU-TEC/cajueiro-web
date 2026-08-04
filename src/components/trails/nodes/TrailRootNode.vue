<template>
  <div class="root-node">
    <div class="root-node__title">{{ data.description }}</div>
    <div v-if="data.team" class="root-node__team">{{ data.team }}</div>
    <div class="root-node__progress">
      {{ data.completed }}/{{ data.total }} etapas
    </div>

    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Handle, Position } from '@vue-flow/core';

export default defineComponent({
  name: 'TrailRootNode',
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
.root-node {
  width: 200px;
  padding: 12px 16px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(160deg, #5d4037 0%, #4e3620 100%);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.24);
}

.root-node__title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.root-node__team {
  margin-top: 3px;
  font-size: 11.5px;
  color: #d7ccc8;
}

.root-node__progress {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #ffd54f;
}
</style>
