<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Trilhas de aprendizado" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="trails"
      :columns="columns"
      row-key="description"
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
              v-if="col.name == 'description'"
            >
              {{ col.value }}
            </q-badge>

            <span v-if="col.name == 'team'">{{ props.row.team?.name ?? '-' }}</span>
            <span v-if="col.name == 'stages_count'">{{ col.value }}</span>
            <span v-if="col.name == 'collaborators_count'">{{ col.value }}</span>

            <q-badge
              v-if="col.name == 'active'"
              :color="props.row.active ? 'positive' : 'grey-6'"
            >
              {{ props.row.active ? 'Ativa' : 'Inativa' }}
            </q-badge>

            <q-btn-group v-if="col.name == 'actions'" push size="xs">
              <q-btn
                push
                size="xs"
                icon="timeline"
                color="teal"
                @click="handleProgress(props.row.id)"
              >
                <q-tooltip>Acompanhamento</q-tooltip>
              </q-btn>
              <q-btn
                push
                size="xs"
                icon="edit"
                color="blue"
                @click="handleEditTrail(props.row.id)"
              />
              <q-btn
                push
                size="xs"
                icon="delete_outline"
                color="red"
                @click="handleDeleteTrail(props.row.id)"
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
        <span class="text-h4">Trilhas de aprendizado</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'trails.form' }">
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
import trailsService from 'src/services/trails';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'TrailsListPage',
  setup() {
    const trails = ref([]);
    const { list, remove } = trailsService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();

    const columns = [
      {
        name: 'description',
        align: 'center',
        label: 'Trilha',
        field: 'description',
      },
      {
        name: 'team',
        align: 'center',
        label: 'Time',
        field: 'team',
      },
      {
        name: 'stages_count',
        align: 'center',
        label: 'Etapas',
        field: 'stages_count',
      },
      {
        name: 'collaborators_count',
        align: 'center',
        label: 'Colaboradores',
        field: 'collaborators_count',
      },
      {
        name: 'active',
        align: 'center',
        label: 'Situação',
        field: 'active',
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
      getTrails();
      loading.value = true;
    });

    const getTrails = async () => {
      try {
        const data = await list();
        trails.value = data;
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

    const handleDeleteTrail = async (id) => {
      $q.dialog({
        title: 'Remover',
        message: 'Deseja remover essa trilha e todas as suas etapas?',
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
          await getTrails();
        } catch (error) {
          $q.notify({
            message: 'Não foi possível apagar a trilha',
            caption: error.message,
            icon: 'block',
            color: 'negative',
          });
        }
      });
    };

    const handleEditTrail = async (id) => {
      router.push({ name: 'trails.form', params: { id } });
    };

    const handleProgress = async (id) => {
      router.push({ name: 'trails.progress', params: { id } });
    };

    return {
      trails,
      columns,
      handleDeleteTrail,
      handleEditTrail,
      handleProgress,
      pagination,
      loading,
    };
  },
});
</script>
