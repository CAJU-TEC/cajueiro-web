<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Movimentações de protocolos" />
      </q-breadcrumbs>
    </div>

    <q-card
      class="my-card q-mb-lg shadow-2 bg-light-blue-2"
      bordered
      v-for="collaborator in collaborators"
      :key="collaborator.id"
    >
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
          <q-item-label>{{ collaborator.full_name }}</q-item-label>
          <q-item-label caption>
            {{ collaborator.jobplan?.description ?? 'Sem plano de trabalho' }}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <ListMovementsCollaborators :collaborator="collaborator" />
    </q-card>
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
