<template>
  <span>
    <q-card class="q-mb-sm" flat bordered>
      <q-item>
        <q-item-section avatar>

          <q-avatar>
            <img :src="`https://cajueiroapi.cajutec.com.br/storage/images/${duty.image?.uri}`" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{
            duty.first_name ? duty.first_name : '- - -'
            }}</q-item-label>
          <q-item-label class="text-caption"> Plantonista </q-item-label>
        </q-item-section>

        <q-item-section>
          <q-select
v-model="model" :options="collaboratorsOptions" label="Selecione um colaborador"
            option-label="first_name" option-value="id" @update:model-value="handleSelectOptions" />
        </q-item-section>
      </q-item>
    </q-card>
    <q-card class="text-caption" flat bordered>
      <div v-if="isLoading" class="q-pa-md text-primary text-center">
        <q-spinner-cube color="blue" size="3.5em" />
      </div>
      <q-list v-else-if="tickets.length > 0" bordered separator>
        <q-item-label header class="text-h6 text-primary q-py-sm q-px-md">
          Protocolos de hoje
        </q-item-label>
        <q-item
:to="{ name: 'tickets.details', params: { id: ticket.id } }" v-for="ticket in tickets" :key="ticket.id"
          :class="{ 'bg-teal-1 text-grey-8': ticket.dufy === 'yes' }">
          <q-item-section>
            <q-item-label caption>#{{ ticket.code }}</q-item-label>
            <q-item-label class="text-weight-bold">
              {{ ticket.subject }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="q-pa-md text-orange text-center">
        Hoje ainda não existem protocolos criados!
      </div>
    </q-card>

    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="live_help" color="primary" text-color="white" />
          <span class="q-ml-sm">Deseja realmente adicionar-lo(a) como plantonista?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Não" color="primary" v-close-popup />
          <q-btn flat label="Sim, agora!" @click="() => (returnDuty = true)" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>

<script setup>
import { ref, watchEffect, watch } from 'vue';
import { date, useQuasar } from 'quasar';
import ticketsService from 'src/services/tickets';
import dutiesService from 'src/services/duties';
import collaboratorsService from 'src/services/collaborators';
import _ from 'loadsh';

const model = ref('');
const tickets = ref([]);
const duty = ref({});
const collaborators = ref({});
const collaboratorsOptions = ref([]);
const isLoading = ref(true);
const confirm = ref(false);
const returnDuty = ref(false);
const collaboratorSelection = ref({});

const $q = useQuasar();

const { myTickets } = ticketsService();
const { list } = dutiesService();
const { list: listCollaborators, syncDuty } = collaboratorsService();

const handleSelectOptions = async (value) => {
  collaboratorSelection.value = value;
  confirm.value = !confirm.value;
};

const setDuty = async (collaborator) => {
  try {
    await syncDuty({ collaborator });
    getDutyLatest();
  } catch (error) {
    $q.notify({
      message: 'Ops! Ocorreu algum erro.',
      icon: 'check',
      color: 'warning',
    });
  }
};

watch(returnDuty, () => {
  if (returnDuty.value) {
    setDuty(collaboratorSelection.value);
  }
  returnDuty.value = false;
});

const getTicketsToday = async () => {
  try {
    const timeStamp = ref(Date.now());
    const formattedString = ref(date.formatDate(timeStamp.value, 'YYYY-MM-DD'));
    const url = (
      `?include=collaborator,impact,user.collaborator,client.corporate.image&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,code,priority,type,dufy,subject,status,date_attribute_ticket,created_at,updated_at,deleted_at&filter[starts_before]=${formattedString.value}&[collaborator_id]=null`
    );
    const data = await myTickets(url);
    tickets.value = data;
  } catch (error) {
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};

const getDutyLatest = async () => {
  try {
    const data = await list();
    const firstItem = _.head(data ?? []);

    const dutyable = firstItem?.dutyable ?? '[]';
    console.table(data);
    duty.value = dutyable;
  } catch (e) {
    console.error('Erro ao tentar definir duty:', e);
  }
};

const getListCollaborators = async () => {
  try {
    const data = await listCollaborators();
    collaborators.value = data;
    collaboratorsOptions.value = _.chain(data)
      .map((o) => ({ first_name: o.first_name, id: o.id }))
      .sortBy('first_name')
      .value();
  } catch (e) {
    console.log(e);
  }
};

watchEffect(() => {
  isLoading.value = true;
  getTicketsToday();
  getDutyLatest();
  getListCollaborators();
});
</script>

<style lang="scss" scoped></style>
