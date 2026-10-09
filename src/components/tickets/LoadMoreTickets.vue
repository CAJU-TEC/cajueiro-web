<template>
  <div class="load-more">
    <div class="load-more__meta text-caption text-grey-7">
      Exibindo <strong>{{ loaded }}</strong>
      <template v-if="total">
        de <strong>{{ total }}</strong>
      </template>
      protocolos
    </div>
    <q-linear-progress
      v-if="total"
      class="load-more__bar"
      rounded
      size="4px"
      color="primary"
      track-color="grey-3"
      :value="Math.min(loaded / total, 1)"
    />
    <q-btn
      class="load-more__btn"
      outline
      rounded
      no-caps
      color="primary"
      icon-right="expand_more"
      label="Carregar mais protocolos"
      :loading="loading"
      :disable="loading"
      @click="$emit('more')"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadMoreTickets',
  props: {
    loaded: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
  },
  emits: ['more'],
});
</script>

<style lang="css" scoped>
.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0 24px;
}
.load-more__bar {
  width: 160px;
}
.load-more__btn {
  min-width: 220px;
  transition: transform 0.15s ease;
}
.load-more__btn:hover:not(.disabled) {
  transform: translateY(1px);
}
</style>
