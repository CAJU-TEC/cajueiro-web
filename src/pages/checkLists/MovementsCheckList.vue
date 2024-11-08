<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Movimentações de protocolos" />
      </q-breadcrumbs>
    </div>

    <ListMovementsCollaborators
      :collaborator="collaborator"
      v-for="collaborator in collaborators"
      :key="collaborator.id"
    />
  </q-page>
</template>

<script setup>
import ListMovementsCollaborators from 'src/components/movements/ListMovementsCollaborators.vue';
import collaboratorsService from 'src/services/collaborators';

import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
const $q = useQuasar();

const { list } = collaboratorsService();

const collaborators = ref([]);

const getCollaborators = async () => {
  try {
    const data = await list();
    collaborators.value = data;
  } catch (e) {
    $q.notify({
      message: 'Ops! Ocorreu algum erro',
      icon: 'block',
      color: 'negative',
    });
  }
};

onMounted(() => {
  getCollaborators();
});
</script>

<style scoped></style>
