<template>
  <q-input v-model="dateComponent" filled :label="label" mask="##/##/####">
    <template #append>
      <q-icon name="calendar_today" class="cursor-pointer">
        <q-popup-proxy transition-show="scale" transition-hide="scale">
          <q-date
            color="primary"
            minimal
            v-model="dateComponent"
            mask="DD/MM/YYYY"
          >
            <div class="row items-center justify-end q-gutter-sm">
              <q-btn label="Cancel" color="primary" flat v-close-popup />
              <q-btn
                label="OK"
                color="primary"
                @click="$emit('input', dateComponent)"
                flat
                v-close-popup
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
import { defineComponent, watch, ref, toRef } from 'vue';

export default defineComponent({
  name: 'CajuDate',
  emits: ['input'],
  props: {
    label: {
      type: String,
      default: null,
    },
    text: {
      type: String,
      default: null,
    },
  },
  setup(props, context) {
    const dateComponent = ref('');
    const newText = toRef(props, 'text');
    dateComponent.value = newText.value;

    watch(dateComponent, (currentValue, oldValue) => {
      context.emit('input', currentValue);
    });

    return {
      dateComponent,
    };
  },
});
</script>

<style scoped></style>
