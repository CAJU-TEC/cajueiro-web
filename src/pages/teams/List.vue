<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Times" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="teams"
      :columns="columns"
      row-key="name"
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
            <q-badge
              :style="`background:${props.row.color || '#1976d2'}`"
              v-if="col.name == 'name'"
            >
              {{ col.value }}
            </q-badge>
            <span v-if="col.name == 'description'">{{ col.value }}</span>
            <span v-if="col.name == 'collaborators_count'">{{ col.value }}</span>
            <span v-if="col.name == 'job_plans_count'">{{ col.value }}</span>
            <span v-if="col.name == 'trails_count'">{{ col.value }}</span>

            <q-btn-group v-if="col.name == 'actions'" push size="xs">
              <q-btn
                push
                size="xs"
                icon="edit"
                color="blue"
                @click="handleEditTeam(props.row.id)"
              />
              <q-btn
                push
                size="xs"
                icon="delete_outline"
                color="red"
                @click="handleDeleteTeam(props.row.id)"
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
        <span class="text-h4">Times</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'teams.form' }">
          <div class="row items-center no-wrap">
            <q-icon left name="add" />
            <div class="text-center">Novo</div>
          </div>
        </q-btn>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import teamsService from 'src/services/teams';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'TeamsListPage',
  setup() {
    const teams = ref([]);
    const { list, remove } = teamsService();
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();

    const columns = [
      {
        name: 'name',
        align: 'center',
        label: 'Time',
        field: 'name',
      },
      {
        name: 'description',
        align: 'center',
        label: 'Descrição',
        field: 'description',
      },
      {
        name: 'collaborators_count',
        align: 'center',
        label: 'Colaboradores',
        field: 'collaborators_count',
      },
      {
        name: 'job_plans_count',
        align: 'center',
        label: 'Planos',
        field: 'job_plans_count',
      },
      {
        name: 'trails_count',
        align: 'center',
        label: 'Trilhas',
        field: 'trails_count',
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
      getTeams();
      loading.value = true;
    });

    const getTeams = async () => {
      try {
        const data = await list();
        teams.value = data;
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

    const handleDeleteTeam = async (id) => {
      $q.dialog({
        title: 'Remover',
        message: 'Deseja remover esse time?',
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
          await getTeams();
        } catch (error) {
          $q.notify({
            message: 'Não foi possível apagar o time',
            caption: error.message,
            icon: 'block',
            color: 'negative',
          });
        }
      });
    };

    const handleEditTeam = async (id) => {
      router.push({ name: 'teams.form', params: { id } });
    };

    return {
      teams,
      columns,
      handleDeleteTeam,
      handleEditTeam,
      pagination,
      loading,
    };
  },
});
</script>
