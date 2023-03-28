<template>
  <div>
    <apexchart height="300" type="bar" :options="reactiveValue"></apexchart>
    {{ reactiveValue }}
  </div>
</template>

<script>
import { computed, defineComponent, reactive, ref, toRef, watch } from 'vue';
export default defineComponent({
  name: 'ApexBar',
  props: {
    optionsProps: {
      type: Object,
      default: null,
    },
  },
  setup(props) {
    const reactiveValue = ref(props.optionsProps);

    watch(
      () => props.optionsProps,
      (newValue, oldValue) => {
        console.log(newValue, oldValue);
        reactiveValue.value = newValue;
      }
    );

    return {
      reactiveValue,
    };
  },
});
</script>
