<template>
  <q-card class="my-card q-mb-lg shadow-2 bg-light-blue-1" bordered>
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img
            v-if="!collaborator?.image"
            src="https://cdn.quasar.dev/img/boy-avatar.png"
          />
          <img
            v-else
            :src="`https://cajueiroapi.cajutec.com.br/storage/images/${collaborator?.image?.uri}`"
          />
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label class="text-subtitle2 text-weight-bold">{{
          collaborator.full_name
        }}</q-item-label>
        <q-item-label caption>
          {{ collaborator.jobplan?.description ?? 'Sem plano de trabalho' }}
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />
    <q-card-section horizontal>
      <q-card-section class="col-4 row">
        <template v-if="!loading">
          <div
            v-for="item in status"
            :key="item"
            class="justify-center content-center"
          >
            <div class="text-center">
              <q-circular-progress
                show-value
                font-size="12px"
                :value="convertForStatistics(item.en)[0].percentage"
                size="50px"
                :thickness="0.22"
                color="blue-light-4"
                :track-color="
                  convertForStatistics(item.en)[0].percentage
                    ? 'blue-4'
                    : 'blue-grey-2'
                "
                class="q-ma-md"
              >
                {{ convertForStatistics(item.en)[0].percentage }}%
              </q-circular-progress>
              <div class="text-center text-weight-thin text-caption">
                <!-- <div>{{ convertForStatistics(item.en)[0].amount }}</div> -->
                <q-btn
                  flat
                  size="x-small"
                  text
                  @click="
                    selectStatus({
                      status: item.en,
                      collaborator_id: collaborator.id,
                    })
                  "
                  :disabled="!convertForStatistics(item.en)[0].percentage"
                  :color="
                    convertForStatistics(item.en)[0].percentage > 0
                      ? 'blue'
                      : 'grey'
                  "
                >
                  <div>{{ item.br }}</div>
                </q-btn>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="loading-container">
          <q-spinner-dots color="primary" size="40px" />
          <p class="text-caption text-grey-7">Carregando...</p>
        </div>
      </q-card-section>
      <q-separator vertical />
      <q-card-section class="col-4">
        <q-table
          flat
          bordered
          :title="titleToday"
          dense
          :rows="rowsGeneralSummary"
          :columns="columnsGeneralSummary"
          row-key="name"
          :rows-class="getRowClass"
          striped
          separator="vertical"
          color="light-blue-7"
          class="text-uppercase col-6"
          :style="{
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          }"
        />
      </q-card-section>
      <q-separator vertical />
      <q-card-section class="col-4">
        <q-table
          flat
          bordered
          title="Resumo geral"
          dense
          :rows="rowsGeneralSummary"
          :columns="columnsGeneralSummary"
          row-key="name"
          :rows-class="getRowClass"
          striped
          separator="vertical"
          color="light-blue-7"
          class="text-uppercase col-6"
          :style="{
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
          }"
          hide-pagination
          :pagination="{ rowsPerPage: 20 }"
        />
      </q-card-section>
    </q-card-section>

    <q-separator />
    <q-card-actions horizontal class="justify-start">
      <q-btn flat size="x-small" text disabled color="grey">
        <div>Total de protocolos: {{ ticketsProps.length }}</div>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { useQuasar, date } from 'quasar';
import _ from 'loadsh';
import ticketsService from 'src/services/tickets';
import { onMounted, ref, reactive, watch, computed } from 'vue';
const { myTickets: myTicketsService } = ticketsService();

const $q = useQuasar();
const props = defineProps({
  collaborator: {
    type: Object,
    default: () => {},
  },
});

const getRowClass = (row) => {
  return row.rowIndex % 2 === 0 ? 'q-pa-none bg-grey-2' : 'q-pa-none bg-white';
};
const titleToday = computed(() => {
  const newDate = date.formatDate(new Date(), 'DD/MM/YYYY');
  return `Histórico de hoje(${newDate})`;
});
const columnsGeneralSummary = [
  {
    name: 'status',
    align: 'left',
    label: 'Status',
    field: 'status',
    sortable: true,
  },
  {
    name: 'quantidade',
    label: 'Quantidade',
    field: 'amount',
    sortable: true,
  },
  {
    name: 'porcentagens',
    label: 'Porcentagens',
    field: 'percentage',
    sortable: true,
  },
];
const rowsGeneralSummary = ref([]);
const tickets = ref();
const loading = ref(true);
const ticketsProps = ref([]);
const status = reactive([
  { en: 'backlog', br: 'aguardando' },
  { en: 'todo', br: 'à fazer' },
  { en: 'analyze', br: 'analise' },
  { en: 'development', br: 'desenvolvimento' },
  { en: 'test', br: 'teste' },
  { en: 'pending', br: 'pendente' },
  { en: 'validation', br: 'validação' },
  { en: 'done', br: 'finalizado' },
]);

const getStatusInPortuguese = (enStatus) => {
  const statusItem = status.find((item) => item.en === enStatus);
  return statusItem ? statusItem.br : null;
};

const getProtocols = async () => {
  await getTickets();
};

const convertForStatistics = (status) => {
  let amountTicketsStatus = tickets.value[status]
    ? tickets.value[status].length
    : 0;

  amountTicketsStatus = (amountTicketsStatus * 100) / ticketsProps.value.length;
  amountTicketsStatus = Math.ceil(amountTicketsStatus);
  return [
    {
      percentage: amountTicketsStatus,
      amount: tickets.value[status] ? tickets.value[status].length : 0,
    },
  ];
};

const getTickets = async () => {
  try {
    const data = await myTicketsService(
      `?include=collaborator,user.collaborator,client.corporate.image&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,status&filter[collaborator_id]=${props.collaborator.id}`
    );
    tickets.value = _.groupBy(data, 'status');
    ticketsProps.value = data;
  } catch (error) {
    $q.notify({
      message: 'Ops! Ocorreu algum erro',
      icon: 'block',
      color: 'negative',
    });
  } finally {
    loading.value = false;
  }
};

const selectStatus = async (data) => {
  console.log(data);
};

watch(tickets, () => {
  for (const [key, value] of Object.entries(tickets.value)) {
    rowsGeneralSummary.value.push({
      status: getStatusInPortuguese(key),
      percentage: `${convertForStatistics(key)[0].percentage}%`,
      amount: `${convertForStatistics(key)[0].amount}`,
    });
  }
});

onMounted(() => {
  getProtocols();
});
</script>

<style lang="scss" scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%; /* Adicione isso se precisar centralizar verticalmente dentro de uma altura específica */
  min-height: 150px; /* Ajuste a altura mínima conforme necessário */
}
</style>
