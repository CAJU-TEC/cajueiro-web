<template>
  <q-drawer
    v-model="model"
    bordered
    side="right"
    class="q-pa-md text-primary"
    overlay
  >
    <h1 class="text-subtitle2">Protocolos</h1>
    <q-list align="left" bordered separator>
      <q-item
        v-for="item in inputNotification.unRead"
        :key="item.id"
        clickable
        v-ripple
        replace
        :active="active"
        @click="handleListClient(item.data.id)"
      >
        <q-item-section>#{{ item.data?.code ?? '- - -' }}</q-item-section>
        <q-item-section side class="text-weight-medium">
          {{ item.data?.status }}
          <q-item-label caption>{{ item.data?.date }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-drawer>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'TicketsNotifications',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    notifications: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const inputValue = ref(props.modelValue);
    const router = useRouter();
    // const inputNotifications = ref(props.notifications);

    const handleListClient = async (id) => {
      await router.push({ name: 'tickets.details', params: { id } });
    };

    const model = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        emit('update:modelValue', newValue);
      },
    });

    const inputNotification = computed({
      get() {
        return props.notifications;
      },
      set(newValue) {
        emit('update:notifications', newValue);
      },
    });

    function updateInputValue(event) {
      inputValue.value = event.target.value;
    }

    return {
      inputValue,
      active: true,
      updateInputValue,
      model,
      inputNotification,
      handleListClient,
    };
  },
});
</script>

<style>
/* Estilize o menu lateral aqui, se necessário */
</style>
