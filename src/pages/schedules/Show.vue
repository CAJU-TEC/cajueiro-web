<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Escalas" :to="{ name: 'schedules.list' }" />
        <q-breadcrumbs-el label="Visualizar" />
      </q-breadcrumbs>
    </div>

    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner-cube color="blue" size="3.5em" />
    </div>

    <div v-else-if="schedule" class="column items-center q-gutter-md">
      <ScheduleBoard ref="board" :schedule="schedule" />

      <q-btn
        color="primary"
        push
        icon="download"
        label="Baixar imagem"
        :loading="generating"
        @click="download"
      />
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import schedulesService from 'src/services/schedules';
import ScheduleBoard from 'src/components/schedules/ScheduleBoard.vue';
import { svgToPngBlob } from 'src/support/images/exportSvg';

export default defineComponent({
  name: 'ScheduleShowPage',
  components: { ScheduleBoard },
  setup() {
    const route = useRoute();
    const $q = useQuasar();
    const { getById } = schedulesService();

    const schedule = ref(null);
    const loading = ref(true);
    const generating = ref(false);
    const board = ref(null);

    onMounted(async () => {
      try {
        schedule.value = await getById(route.params.id);
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      } finally {
        loading.value = false;
      }
    });

    const fileName = () => `escala-${(schedule.value?.title ?? 'escala').toLowerCase()}-${schedule.value?.date}.png`;

    const saveBlob = (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName();
      link.click();
      URL.revokeObjectURL(url);
    };

    const download = async () => {
      generating.value = true;
      try {
        const blob = await svgToPngBlob(board.value?.svg, board.value?.width, board.value?.height);
        saveBlob(blob);
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      } finally {
        generating.value = false;
      }
    };

    return {
      schedule,
      loading,
      generating,
      board,
      download,
    };
  },
});
</script>
