<template>
  <span>
    <q-btn
      class="full-width q-mb-sm"
      color="primary"
      outline
      no-caps
      icon="mdi-ticket-outline"
      :loading="isLoading"
      :label="`Protocolos de plantão (${rows.length})`"
      @click="open = true"
    />

    <q-dialog
      v-model="open"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-bar class="bg-primary text-white">
          <div class="text-weight-bold">Protocolos de plantão em aberto</div>
          <q-space />
          <q-btn v-close-popup dense flat icon="close">
            <q-tooltip class="bg-white text-primary">Fechar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-table
          v-model:pagination="pagination"
          :rows="rows"
          :columns="columns"
          :filter="filter"
          :loading="isLoading"
          row-key="id"
          flat
          rows-per-page-label="Linhas por página"
          :rows-per-page-options="[15, 30, 50, 0]"
          @row-click="handleRowClick"
        >
          <template #top>
            <q-input
              v-model="filter"
              dense
              debounce="300"
              clearable
              placeholder="Buscar"
              class="full-width"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="status[props.value]?.color">
                {{ status[props.value]?.title }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-daysOpen="props">
            <q-td
              :props="props"
              :class="{ 'text-negative text-weight-bold': props.value > 30 }"
            >
              {{ props.value }}
            </q-td>
          </template>

          <template #loading>
            <q-inner-loading showing>
              <q-spinner-cube color="blue" size="3.5em" />
            </q-inner-loading>
          </template>

          <template #no-data>
            <div class="full-width text-orange text-center q-pa-md">
              Não existem protocolos de plantão em aberto!
            </div>
          </template>
        </q-table>
      </q-card>
    </q-dialog>
  </span>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import ticketsService from 'src/services/tickets';
import status from 'src/support/tickets/status';

const open = ref(false);
const filter = ref('');
const isLoading = ref(true);
const tickets = ref([]);
const pagination = ref({
  sortBy: 'daysOpen',
  descending: true,
  page: 1,
  rowsPerPage: 15,
});

const columns = [
  {
    name: 'code',
    align: 'left',
    label: '#CODE',
    field: 'code',
    sortable: true,
  },
  {
    name: 'subject',
    align: 'left',
    label: 'ASSUNTO',
    field: 'subject',
    sortable: true,
  },
  {
    name: 'creator',
    align: 'left',
    label: 'CRIADOR',
    field: 'creator',
    sortable: true,
  },
  { name: 'dev', align: 'left', label: 'DEV', field: 'dev', sortable: true },
  { name: 'qa', align: 'left', label: 'QA', field: 'qa', sortable: true },
  {
    name: 'status',
    align: 'center',
    label: 'STATUS',
    field: 'status',
    sortable: true,
  },
  {
    name: 'daysOpen',
    align: 'center',
    label: 'DIAS ABERTO',
    field: 'daysOpen',
    sortable: true,
  },
];

const $q = useQuasar();
const router = useRouter();
const { dutyTickets } = ticketsService();

const daysOpen = (createdAt) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const from = new Date(
    created.getFullYear(),
    created.getMonth(),
    created.getDate()
  );
  const today = new Date();
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((to - from) / 86400000);
};

const rows = computed(() =>
  tickets.value.map((ticket) => ({
    id: ticket.id,
    code: ticket.code,
    subject: ticket.subject,
    creator: ticket.user?.name ?? '- - -',
    dev: ticket.collaborator?.first_name ?? '- - -',
    qa: ticket.tester?.first_name ?? '- - -',
    status: ticket.status,
    daysOpen: daysOpen(ticket.created_at),
  }))
);

const handleRowClick = (evt, row) => {
  const { href } = router.resolve({
    name: 'tickets.details',
    params: { id: row.id },
  });
  window.open(href, '_blank');
};

const getDutyTickets = async () => {
  try {
    tickets.value = await dutyTickets();
  } catch (error) {
    $q.notify({
      icon: 'block',
      message: 'Ops! Não foi possível carregar os protocolos de plantão.',
      caption: error.message,
      color: 'negative',
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(getDutyTickets);
</script>

<style lang="scss" scoped>
:deep(tbody tr) {
  cursor: pointer;
}
</style>
