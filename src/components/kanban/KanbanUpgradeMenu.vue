<template>
  <q-menu
    v-model="menuVisible"
    :offset="[0, 10]"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="bg-white text-dark q-pa-sm" style="min-width: 260px;" elevation="2">
      <q-card-section class="text-subtitle2">
        Escolha uma das opções disponíveis
      </q-card-section>

      <!-- Scroll apenas na lista -->
      <q-scroll-area style="height: 250px;">
        <q-list dense separator>
          <q-item
            v-for="epublic in data"
            :key="epublic.id"
            clickable
            :disable="epublic.private"
            active-color="green"
            active-class="bg-green-1 text-dark"
          >
            <q-item-section avatar>
              <q-icon :name="epublic.private ? 'lock' : 'lock_open'" color="grey-7" />
            </q-item-section>

            <q-item-section>
              {{ epublic.name }}
            </q-item-section>

            <q-item-section side v-if="epublic.private">
              <q-icon name="lock" size="16px" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <q-separator class="q-my-sm" color="grey-3" />

      <!-- Formulário para cadastro -->
      <!-- <q-card-section class="text-caption text-grey-7">
        Cadastre um novo epublic abaixo:
      </q-card-section>

      <div class="q-pa-sm">
        <q-input
          v-model="newEpublic.acronym"
          label="Acrônimo"
          dense
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="newEpublic.name"
          label="Nome"
          dense
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="newEpublic.responsible"
          label="Responsável"
          dense
          outlined
          class="q-mb-sm"
        />
        <q-toggle
          v-model="newEpublic.private"
          label="Privado"
          color="green"
          class="q-mb-sm"
        />

        <q-btn
          label="Adicionar epublic"
          color="green"
          unelevated
          class="full-width text-bold"
          @click="adicionarEpublic"
        />
      </div> -->
    </q-card>
  </q-menu>
</template>


<script setup>
import { computed, ref } from 'vue';
import { epublics } from 'src/constants/globalConstants';

const data = ref([...epublics]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

const menuVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Modelo reativo para o novo epublic
const newEpublic = ref({
  id: null,
  acronym: '',
  name: '',
  responsible: '',
  private: false
});

// Função para adicionar novo epublic
function adicionarEpublic() {
  if (!newEpublic.value.name || !newEpublic.value.acronym || !newEpublic.value.responsible) {
    alert('Preencha todos os campos!');
    return;
  }

  // Define um ID automático incremental
  const newId = data.value.length ? Math.max(...data.value.map(e => e.id)) + 1 : 1;

  data.value.push({
    id: newId,
    acronym: newEpublic.value.acronym,
    name: newEpublic.value.name,
    responsible: newEpublic.value.responsible,
    private: newEpublic.value.private
  });

  // Limpa o formulário
  newEpublic.value = { id: null, acronym: '', name: '', responsible: '', private: false };
}
</script>
