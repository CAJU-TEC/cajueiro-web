<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Escalas" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="schedules"
      :columns="columns"
      row-key="id"
      no-data-label="Não existe dados no momento."
      rows-per-page-label="10"
      :rows-per-page-options="[10, 15, 20]"
      :loading="loading"
    >
      <template #body="props">
        <q-tr :props="props">
          <q-td
            class="q-gutter-sm"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <span v-if="col.name == 'title'">{{ col.value }}</span>
            <span v-if="col.name == 'date'">{{ dateOnlyFormat(col.value) }}</span>
            <span v-if="col.name == 'period'">{{ props.row.start_time?.slice(0, 5) }} às {{ props.row.end_time?.slice(0, 5) }}</span>
            <span v-if="col.name == 'collaborators_count'">{{ col.value }}</span>

            <q-btn-group v-if="col.name == 'actions'" push size="xs">
              <q-btn
                push
                size="xs"
                icon="visibility"
                color="primary"
                @click="handleShowSchedule(props.row.id)"
              />
              <q-btn
                push
                size="xs"
                icon="edit"
                color="blue"
                @click="handleEditSchedule(props.row.id)"
              />
              <q-btn
                push
                size="xs"
                icon="delete_outline"
                color="red"
                @click="handleDeleteSchedule(props.row.id)"
              />
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
      <template #loading>
        <q-inner-loading showing color="secondy"> </q-inner-loading>
      </template>
      <template #no-data="{ icon, message, filter }">
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span> Bem, isso é triste... {{ message }} </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
      <template #top>
        <span class="text-h4">Escalas</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'schedules.form' }">
          <div class="row items-center no-wrap">
            <q-icon left name="add" />
            <div class="text-center">Nova</div>
          </div>
        </q-btn>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import schedulesService from 'src/services/schedules';
import { dateOnlyFormat } from 'src/support/dates/dateFormat';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'SchedulesListPage',
  setup() {
    const schedules = ref([]);
    const { list, remove } = schedulesService();
    const pagination = ref({
      sortBy: 'date',
      descending: true,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();

    const columns = [
      {
        name: 'title',
        align: 'center',
        label: 'Título',
        field: 'title',
      },
      {
        name: 'date',
        align: 'center',
        label: 'Data',
        field: 'date',
      },
      {
        name: 'period',
        align: 'center',
        label: 'Horário',
        field: 'start_time',
      },
      {
        name: 'collaborators_count',
        align: 'center',
        label: 'Colaboradores',
        field: 'collaborators_count',
      },
      {
        name: 'actions',
        align: 'center',
        label: 'Ações',
        field: 'actions',
      },
    ];

    const $q = useQuasar();
    const router = useRouter();

    onMounted(() => {
      getSchedules();
      loading.value = true;
    });

    const getSchedules = async () => {
      try {
        const data = await list();
        schedules.value = data;
        loading.value = false;
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      }
    };

    const handleDeleteSchedule = async (id) => {
      $q.dialog({
        title: 'Remover',
        message: 'Deseja remover essa escala?',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await remove(id);
          $q.notify({
            message: 'Apagado com sucesso',
            icon: 'check',
            color: 'positive',
          });
          await getSchedules();
        } catch (error) {
          $q.notify({
            message: 'Não foi possível apagar a escala',
            caption: error.message,
            icon: 'block',
            color: 'negative',
          });
        }
      });
    };

    const handleEditSchedule = async (id) => {
      router.push({ name: 'schedules.form', params: { id } });
    };

    const handleShowSchedule = async (id) => {
      router.push({ name: 'schedules.show', params: { id } });
    };

    return {
      schedules,
      columns,
      handleDeleteSchedule,
      handleEditSchedule,
      handleShowSchedule,
      pagination,
      loading,
      dateOnlyFormat,
    };
  },
});
</script>
