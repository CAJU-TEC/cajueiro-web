<template>
  <div>
    <div v-if="isLoading" class="q-pa-md text-primary text-center">
      <q-spinner-cube color="blue" size="3.5em" />
    </div>

    <div v-else-if="schedules.length" class="row q-gutter-md">
      <q-card v-for="schedule in schedules" :key="schedule.id" class="col" flat bordered>
        <q-card-section class="flex flex-center">
          <ScheduleBoard :schedule="schedule" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            dense
            color="primary"
            icon="visibility"
            label="Ver escala"
            :to="{ name: 'schedules.show', params: { id: schedule.id } }"
          />
        </q-card-actions>
      </q-card>
    </div>

    <div v-else class="text-caption text-grey-6 q-pa-sm">
      Nenhuma escala para hoje.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import schedulesService from 'src/services/schedules';
import ScheduleBoard from 'src/components/schedules/ScheduleBoard.vue';

const schedules = ref([]);
const isLoading = ref(true);

const { today } = schedulesService();

onMounted(async () => {
  try {
    schedules.value = await today();
  } catch (error) {
    console.error('Erro ao buscar escalas de hoje:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>
