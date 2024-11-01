<template>
  <span>
    <q-card class="my-card" flat bordered>
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img
              :src="`https://cajueiroapi.cajutec.com.br/storage/images/${duty.image?.uri}`"
            />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ duty.first_name ?? '- - -' }}</q-item-label>
          <q-item-label caption> Plantonista </q-item-label>
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
    <q-card class="my-card text-caption" flat bordered>
      <q-list bordered separator v-for="ticket in tickets" :key="ticket.id">
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label caption>#{{ ticket.code }}</q-item-label>
            <q-item-label class="text-weight-bold">{{
              ticket.subject
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </span>
</template>

<script setup>
import { ref, watchEffect, reactive } from 'vue';
import ticketsService from 'src/services/tickets';
import dutiesService from 'src/services/duties';
import collaboratorsService from 'src/services/collaborators';
import _ from 'loadsh';

const model = ref('');
const tickets = ref([]);
const duty = ref({});
const collaborators = ref({});
const collaboratorsOptions = ref([]);

const { myTickets } = ticketsService();
const { list } = dutiesService();
const { list: listCollaborators } = collaboratorsService();

const getTicketsToday = async () => {
  try {
    const { data } = await myTickets(
      '?include=collaborator,impact,user.collaborator,client.corporate.image&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,code,priority,type,dufy,subject,status,date_attribute_ticket,created_at,updated_at,deleted_at&filter[starts_before]=2024-11-01&[collaborator_id]=null'
    );
    tickets.value = data;
  } catch (error) {
    console.log(error);
  }
};

const getDutyLatest = async () => {
  try {
    const data = await list();
    const { dutyable } = _.head(data);
    duty.value = dutyable;
  } catch (e) {
    console.log(e);
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
  getTicketsToday();
  getDutyLatest();
  getListCollaborators();
});
</script>

<style lang="scss" scoped>
.my-card {
  margin: 10px auto;
}
</style>
