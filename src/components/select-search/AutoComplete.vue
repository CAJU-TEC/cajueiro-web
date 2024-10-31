<template>
  <div class="q-gutter-md">
    <q-select
      filled
      v-model="model"
      use-input
      :hide-selected="!multiple"
      fill-input
      :multiple="multiple"
      input-debounce="0"
      :label="label"
      option-value="id"
      :options="options"
      @filter="filterFn"
      @filter-abort="abortFilterFn"
      :hint="hint"
    >
      <template #no-option>
        <q-item>
          <q-item-section class="text-grey"> Sem resultados </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'AutoComplete',
  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: 'Buscar',
    },
    hint: {
      type: String,
      default: 'Preencha o campo acima',
    },
    optionsValue: {
      type: Array,
      default: () => [],
    },
    modelValue: {
      type: [String, Object], // Adicionei isso para garantir que a prop modelValue seja reconhecida
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const options = ref(props.optionsValue);
    const model = props.multiple ? ref([]) : ref({ id: '', label: '' });

    watch(
      () => options.value,
      (newVal) => {
        options.value = newVal;
      }
    );

    watch(
      () => model.value,
      (newVal) => {
        model.value = newVal;
        emit('update:modelValue', newVal);
      }
    );

    const filterFn = (val, update, abort) => {
      setTimeout(() => {
        update(() => {
          if (val === '') {
            options.value = props.optionsValue;
          } else {
            const needle = val.toLowerCase();
            options.value = props.optionsValue.filter((v) =>
              v.label.toLowerCase().includes(needle)
            );
          }
        });
      }, 500);
    };

    const abortFilterFn = () => {
      console.log('delayed filter aborted');
    };

    return {
      model,
      options,
      filterFn,
      abortFilterFn,
    };
  },
};
</script>
