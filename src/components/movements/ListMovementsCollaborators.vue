<template>
  <q-card-section horizontal>
    <q-card-section class="row">
      <template v-if="!loading">
        <div v-for="item in status" :key="item" class="text-center">
          <q-circular-progress
            show-value
            font-size="12px"
            :value="20"
            size="50px"
            :thickness="0.22"
            color="blue-light-4"
            track-color="blue-4"
            class="q-ma-md"
          >
            20%
          </q-circular-progress>
          <div class="text-center text-caption text-weight-thin">
            <div>{{ item?.count }}</div>
            <div>{{ item }}</div>
          </div>
        </div>
      </template>
      <div v-else class="loading-container">
        <q-spinner-dots color="primary" size="40px" />
        <p class="text-caption text-grey-7">Carregando...</p>
      </div>
    </q-card-section>

    <q-separator vertical />
    <p>Protocolos assumidos</p>
  </q-card-section>
</template>

<script setup>
import { useQuasar } from 'quasar';
import _ from 'loadsh';
import ticketsService from 'src/services/tickets';
import { onMounted, ref, reactive } from 'vue';

const { myTickets: myTicketsService } = ticketsService();

const $q = useQuasar();
const props = defineProps({
  collaborator: {
    type: Object,
    default: () => {},
  },
});

const tickets = ref();
const loading = ref(true);
const status = reactive([
  'backlog',
  'todo',
  'analyze',
  'develpment',
  'test',
  'pending',
  'done',
  'validation',
]);

const getProtocols = async () => {
  await getTickets();
  convertForStatistics();
};

const convertForStatistics = () => {
  console.log('here statistics');
};

const getTickets = async () => {
  try {
    const { data } = await myTicketsService(
      `?include=collaborator,impact,user.collaborator,client.corporate.image&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,code,priority,type,dufy,subject,status,date_attribute_ticket,created_at,updated_at,deleted_at&filter[collaborator_id]=${props.collaborator.id}`
    );
    tickets.value = _.groupBy(tickets.value, 'status');
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
