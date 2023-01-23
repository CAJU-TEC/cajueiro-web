<template>
  <q-page padding>
    <q-ajax-bar
      ref="bar"
      color="primary"
      size="5px"
      skip-hijack
      position="bottom"
    />

    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Grupos" />
      </q-breadcrumbs>
    </div>

    <q-table
      v-model:pagination="pagination"
      :rows="groups.data"
      :columns="columns"
      row-key="full_name"
      no-data-label="Não existe dados no momento."
      rows-per-page-label="10"
      :rows-per-page-options="[10, 15, 20]"
      :loading="loading"
      @request="handleRequest"
    >
      <template #top>
        <span class="text-h4">Grupos</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'groups.form' }">
          <div class="row items-center no-wrap">
            <q-icon left name="add" />
            <div class="text-center">Novo</div>
          </div>
        </q-btn>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td
            class="q-gutter-sm"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <span v-if="col.name == 'name'">{{ col.value }}</span>
            <q-btn-group v-if="col.name == 'actions'" push>
              <q-btn
                push
                icon="edit"
                color="blue"
                size="xs"
                @click="handleEditClient(props.row.id)"
              />
              <q-btn
                push
                icon="delete_outline"
                color="red"
                size="xs"
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
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import groupsService from 'src/services/groups';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ListPage',
  setup() {
    const groups = ref([]);
    const bar = ref(null);
    const { index, remove } = groupsService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 0,
    });
    const loading = ref();

    const columns = [
      {
        name: 'name',
        align: 'center',
        label: 'Grupos',
        field: 'name',
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
      loading.value = true;
      getGroups();
    });

    const getGroups = async (page) => {
      const barRef = bar.value;
      barRef.start();
      try {
        const data = await index(page);
        pagination.value.page = data.current_page;
        pagination.value.rowsPerPage = data.per_page;
        pagination.value.rowsNumber = data.total;
        groups.value = data;
        loading.value = false;
        barRef.stop();
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro',
          icon: 'block',
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
          await getGroups();
        });
      } catch (error) {
        $q.notify({
          message: 'Erro ao apagar cliente',
          icon: 'times',
          color: 'negative',
        });
      }
    };

    const handleRequest = async (props) => {
      loading.value = true;
      await getGroups(props.pagination.page);
      loading.value = false;
    };

    const handleEditClient = async (id) => {
      router.push({ name: 'groups.form', params: { id } });
    };

    const showBagde = () => {
      return '<q-badge rounded color="red" label="sfsdf" />';
    };

    return {
      bar,
      groups,
      columns,
      handleDeleteClient,
      handleEditClient,
      pagination,
      loading,
      handleRequest,
      showBagde,
    };
  },
});
</script>
