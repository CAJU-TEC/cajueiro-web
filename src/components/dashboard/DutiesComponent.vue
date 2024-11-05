<template>
  <span>
    <q-card class="" flat bordered>
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img
              :src="`https://cajueiroapi.cajutec.com.br/storage/images/${duty.image?.uri}`"
            />
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
            v-model="model"
            :options="collaboratorsOptions"
            label="Selecione um colaborador"
            option-label="first_name"
            option-value="id"
          />
        </q-item-section>
      </q-item>
    </q-card>
    <q-card class="text-caption" flat bordered>
      <div v-if="isLoading" class="q-pa-md text-primary text-center">
        Carregando...
      </div>

      <!-- Verifica se há tickets -->
      <q-list v-else-if="tickets.length > 0" bordered separator>
        <!-- Cabeçalho indicando que são os protocolos do dia -->
        <q-item-label header class="text-h6 text-primary q-py-sm q-px-md">
          Protocolos de hoje
        </q-item-label>
        <!-- Listagem dos tickets com link para cada item -->
        <q-item
          :to="{ name: 'tickets.details', params: { id: ticket.id } }"
          v-for="ticket in tickets"
          :key="ticket.id"
        >
          <q-item-section>
            <q-item-label caption>#{{ ticket.code }}</q-item-label>
            <q-item-label class="text-weight-bold">{{
              ticket.subject
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Mensagem caso não haja tickets -->
      <div v-else class="q-pa-md text-orange text-center">
        Sem protocolos para hoje!
      </div>
    </q-card>
  </span>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { date } from 'quasar';
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

const { myTickets } = ticketsService();
const { list } = dutiesService();
const { list: listCollaborators } = collaboratorsService();

const getTicketsToday = async () => {
  try {
    const timeStamp = ref(Date.now());
    const formattedString = ref(date.formatDate(timeStamp.value, 'YYYY-MM-DD'));
    const { data } = await myTickets(
      `?include=collaborator,impact,user.collaborator,client.corporate.image&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,code,priority,type,dufy,subject,status,date_attribute_ticket,created_at,updated_at,deleted_at&filter[starts_before]=${formattedString.value}&[collaborator_id]=null`
    );
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

    // Define dutyable como um valor padrão caso esteja undefined ou null
    const dutyable = firstItem?.dutyable ?? '[]';

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
