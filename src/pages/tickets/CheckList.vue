<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Planos de trabalho" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="checkLists"
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
              :style="`background:${props.row.color}`"
              v-if="col.name == 'description'"
            >
              {{ col.value }}
            </q-badge>
            <span v-if="col.name == 'value'">{{ col.value }}</span>
            <span v-if="col.name == 'time'">{{ col.value }}</span>

            <q-btn-group v-if="col.name == 'actions'" push size="˜xs">
              <q-btn
                push
                size="xs"
                icon="edit"
                color="blue"
                @click="handleEditClient(props.row.id)"
              />
              <q-btn
                push
                size="xs"
                icon="delete_outline"
                color="red"
                @click="handleDeleteClient(props.row.id)"
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
        <span class="text-h4">Planos de trabalho</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'checkLists.form' }">
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
import checkListsService from 'src/services/checkList';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ListPage',
  setup() {
    const checkLists = ref([]);
    const { list, remove } = checkListsService();
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
        label: 'Descrição',
        field: 'description',
      },
      {
        name: 'value',
        align: 'center',
        label: 'Valor R$',
        field: 'value',
      },
      {
        name: 'time',
        align: 'center',
        label: 'Tempo/Período',
        field: 'time',
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
      getClients();
      loading.value = true;
    });

    const getClients = async () => {
      try {
        const data = await list();
        checkLists.value = data;
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

    const handleDeleteClient = async (id) => {
      try {
        $q.dialog({
          title: 'Remover',
          message: 'Deseja remover ou deletar?',
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          await remove(id);
          $q.notify({
            message: 'Apagado com sucesso',
            icon: 'check',
            color: 'positive',
          });
          await getClients();
        });
      } catch (error) {
        $q.notify({
          message: 'Erro ao apagar cliente',
          icon: 'times',
          color: 'negative',
        });
      }
    };

    const handleEditClient = async (id) => {
      router.push({ name: 'checkLists.form', params: { id } });
    };

    return {
      checkLists,
      columns,
      handleDeleteClient,
      handleEditClient,
      pagination,
      loading,
    };
  },
});
</script>
