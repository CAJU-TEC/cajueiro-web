<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Ficheiros de protocolos" />
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
            <span v-if="col.name == 'description'">{{ col.value }}</span>
            <span v-if="col.name == 'collaborators_count'">{{
              col.value
            }}</span>
            <span v-if="col.name == 'tickets_count'">{{ col.value }}</span>
            <span v-if="col.name == 'status'">{{ col.value }}</span>
            <span v-if="col.name == 'started'">{{ col.value }}</span>
            <span v-if="col.name == 'delivered'">{{ col.value }}</span>

            <q-btn-group v-if="col.name == 'actions'" push size="˜xs">
              <q-btn
                push
                size="xs"
                icon="delete_outline"
                color="red"
                @click="handleCheckListReport(props.row.id)"
              />
              <q-btn
                push
                size="xs"
                icon="delete_outline"
                color="red"
                @click="handleDeleteCheckList(props.row.id)"
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
        <span class="text-h4">Lista dos ficheiros de protocolos</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'checkLists.form' }">
          <div class="row items-center no-wrap">
            <q-icon left name="add" />
            <div class="text-center">Novo</div>
          </div>
        </q-btn>
      </template>
    </q-table>
    <TicketReport
      :dialog="dialog"
      :report-pdf="reportPdf"
      @receive-event="receiveEvent"
    ></TicketReport>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import checkListsService from 'src/services/checkLists';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import TicketReport from 'src/components/dialogs/checklists/CheckListReport.vue';

export default defineComponent({
  name: 'ListPage',
  components: { TicketReport },
  setup() {
    const checkLists = ref([]);
    const { list, remove, report } = checkListsService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();
    const dialog = ref(false);
    const receiveEvent = (event) => {
      dialog.value = event;
    };
    const reportPdf = ref('');
    const handleCheckListReport = async (id) => {
      dialog.value = true;
      reportPdf.value = null;
      reportPdf.value = await report(id);
    };

    const columns = [
      {
        name: 'description',
        align: 'center',
        label: 'Descrição',
        field: 'description',
      },
      {
        name: 'collaborators_count',
        align: 'center',
        label: 'Qnt Colaboradores',
        field: 'collaborators_count',
      },
      {
        name: 'tickets_count',
        align: 'center',
        label: 'Qnt Protocolos',
        field: 'tickets_count',
      },
      {
        name: 'status',
        align: 'center',
        label: 'Situação',
        field: 'status',
      },
      {
        name: 'started',
        align: 'center',
        label: 'Iniciado',
        field: 'started',
      },
      {
        name: 'delivered',
        align: 'center',
        label: 'Previsão',
        field: 'delivered',
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
      getCheckList();
      loading.value = true;
    });

    const getCheckList = async () => {
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

    const handleDeleteCheckList = async (id) => {
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
          await getCheckList();
        });
      } catch (error) {
        $q.notify({
          message: 'Erro ao apagar cliente',
          icon: 'times',
          color: 'negative',
        });
      }
    };

    const handleEditCheckList = async (id) => {
      router.push({ name: 'checkLists.form', params: { id } });
    };

    return {
      checkLists,
      columns,
      handleDeleteCheckList,
      handleEditCheckList,
      pagination,
      loading,
      dialog,
      receiveEvent,
      reportPdf,
      handleCheckListReport,
    };
  },
});
</script>
