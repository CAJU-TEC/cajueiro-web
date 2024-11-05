<template>
  <q-list bordered>
    <q-item style="background: #f5f5f5">
      <q-item-section>
        <q-item-label overline>{{ title }}</q-item-label>
        <q-item-label caption>{{ subtitle }}</q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>Qnt. {{ ticketsLocal.length }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />

    <!-- Carregando Spinner -->
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="30px" />
      <div>Carregando...</div>
    </div>

    <!-- Lista de Tickets -->
    <div v-else>
      <div v-for="ticket in ticketsLocal" :key="ticket.id">
        <q-separator spaced inset />

        <q-item>
          <q-item-section>
            <q-item-label>{{ dateFormat(ticket.created_at) }}</q-item-label>
            <q-item-label caption>
              <strong>#{{ ticket.code }}</strong> - {{ ticket.subject }}
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>
              <q-badge
                rounded
                :color="status[ticket.status]?.color"
                :label="status[ticket.status]?.title"
              />
            </q-item-label>
            <q-btn-group class="mt-2">
              <q-btn size="sm" color="grey" icon="mdi-feature-search">
                <q-tooltip>Visualizar detalhes</q-tooltip>
              </q-btn>
              <q-btn
                @click="transferItem(ticket.id)"
                size="sm"
                color="grey"
                icon="mdi-page-next"
              >
                <q-tooltip>Alternar entre os ficheiros</q-tooltip>
              </q-btn>
            </q-btn-group>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-list>
</template>

<script>
import { defineComponent, watch, ref, nextTick } from 'vue';
import status from 'src/support/tickets/status';
import { dateFormat } from 'src/support/dates/dateFormat';

export default defineComponent({
  name: 'ListTicketsFinds',
  props: {
    title: {
      type: String,
      default: 'Protocolos encontrados',
    },
    subtitle: {
      type: String,
      default: '',
    },
    tickets: {
      type: [Array, Object],
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const ticketsLocal = ref([]);
    const loading = ref(true); // Estado de carregamento

    // Observa alterações nos tickets e exibe o "carregando"
    watch(
      () => props.tickets,
      async (newTickets) => {
        loading.value = true; // Ativa o estado de carregamento
        await nextTick(); // Aguarda a renderização para mostrar o spinner
        setTimeout(() => {
          ticketsLocal.value = newTickets;
          loading.value = false; // Desativa o estado de carregamento após atualizar
        }, 1000); // Ajuste o tempo conforme necessário
      },
      { immediate: true, deep: true }
    );

    const transferItem = (id) => {
      emit('update:modelValue', id);
    };

    return {
      ticketsLocal,
      status,
      dateFormat,
      transferItem,
      loading,
    };
  },
});
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
