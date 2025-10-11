<template>
  <div class="bg-purple-8 text-white q-py-sm q-px-md" style="width: 100%;">
    <div class="row items-center justify-between">
      <!-- Título + Dropdown -->
      <div class="row items-center no-wrap">
        <div class="text-h6 text-weight-bold q-mr-sm">
          Brasileira
        </div>

        <!-- Botão que abre o menu -->
        <q-btn
          dense
          flat
          round
          icon="expand_more"
          size="sm"
          class="q-ml-xs"
          @click="toggleDropdown"
        />

        <!-- Menu separado (KanbanUpgradeMenu) -->
        <KanbanUpgradeMenu v-model="showDropdown" />
      </div>

      <!-- Ações à direita -->
      <div class="row items-center no-wrap">
        <q-btn dense flat round icon="more_vert" size="sm" class="q-mx-xs" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import KanbanUpgradeMenu from './KanbanUpgradeMenu.vue';

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};
</script>

<style scoped>
.bg-purple-8 {
  background-color: #673ab7 !important;
}
</style>
