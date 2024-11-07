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
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ collaborator.name }}</q-item-label>
          <q-item-label caption> {{ collaborator.position }} </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-card-section horizontal>
        <q-card-section class="row">
          <div
            v-for="status in collaborator.protocols"
            :key="status"
            class="text-center"
          >
            <q-circular-progress
              show-value
              font-size="12px"
              :value="status.percent"
              size="50px"
              :thickness="0.22"
              :color="status.color"
              track-color="blue-4"
              class="q-ma-md"
            >
              {{ status.percent }}%
            </q-circular-progress>
            <div class="text-center text-caption text-weight-thin">
              <div>{{ status.count }}</div>
              <div>{{ status.name }}</div>
            </div>
          </div>
        </q-card-section>

        <q-separator vertical />
        <p>Protocolos assumidos</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const collaborators = ref([
  {
    id: 1,
    name: 'Luiz',
    position: 'Desenvolvedor',
    photo: 'link_da_foto_luiz',
    protocols: [
      {
        name: 'Desenvolvimento',
        count: 8,
        percent: 15,
        color: 'light-blue-10',
      },
      { name: 'Teste', count: 5, percent: 10, color: 'light-blue-10' },
      { name: 'Aguardando', count: 3, percent: 5, color: 'light-blue-10' },
      { name: 'Validação', count: 7, percent: 12, color: 'light-blue-10' },
      { name: 'Pendentes', count: 10, percent: 18, color: 'light-blue-10' },
      { name: 'Finalizado', count: 40, percent: 100, color: 'light-blue-10' },
    ],
    currentProtocols: [
      { id: 1, name: 'Protocolo 1', status: 'Desenvolvimento' },
      { id: 2, name: 'Protocolo 2', status: 'Aguardando' },
    ],
  },
  {
    id: 2,
    name: 'Isaias',
    position: 'Analista',
    photo: 'link_da_foto_isaias',
    protocols: [
      { name: 'Desenvolvimento', count: 4, percent: 8, color: 'light-blue-10' },
      { name: 'Teste', count: 7, percent: 14, color: 'light-blue-10' },
      { name: 'Aguardando', count: 2, percent: 4, color: 'light-blue-10' },
      { name: 'Validação', count: 1, percent: 2, color: 'light-blue-10' },
      { name: 'Pendentes', count: 3, percent: 6, color: 'light-blue-10' },
      { name: 'Finalizado', count: 20, percent: 100, color: 'light-blue-10' },
    ],
    currentProtocols: [
      { id: 3, name: 'Protocolo 3', status: 'Teste' },
      { id: 4, name: 'Protocolo 4', status: 'Pendentes' },
    ],
  },
  {
    id: 3,
    name: 'Raphael',
    position: 'Gerente',
    photo: 'link_da_foto_raphael',
    protocols: [
      {
        name: 'Desenvolvimento',
        count: 10,
        percent: 20,
        color: 'light-blue-10',
      },
      { name: 'Teste', count: 3, percent: 5, color: 'light-blue-10' },
      { name: 'Aguardando', count: 6, percent: 10, color: 'light-blue-10' },
      { name: 'Validação', count: 2, percent: 4, color: 'light-blue-10' },
      { name: 'Pendentes', count: 8, percent: 12, color: 'light-blue-10' },
      { name: 'Finalizado', count: 50, percent: 100, color: 'light-blue-10' },
    ],
    currentProtocols: [
      { id: 5, name: 'Protocolo 5', status: 'Validação' },
      { id: 6, name: 'Protocolo 6', status: 'Finalizado' },
    ],
  },
]);
</script>

<style scoped></style>
