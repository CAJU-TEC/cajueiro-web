<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Protocolos" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="tickets"
      :columns="columns"
      row-key="full_name"
      no-data-label="Não existe dados no momento."
      rows-per-page-label="10"
      :rows-per-page-options="[10, 15, 20]"
      :loading="loading"
    >
      <template #top>
        <span class="text-h4">Protocolos</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'tickets.form' }">
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
            <span v-if="col.name === 'code'" class="text-weight-bold"
              >#{{ col.value }}
              <q-badge rounded :color="`${priority[props.row.priority].color}`">
                <q-tooltip
                  :offset="[10, 10]"
                  anchor="top middle"
                  self="bottom middle"
                >
                  <span v-if="props.row.priority === 'yes'">PRIORIDADE</span>
                  <span v-else-if="props.row.priority === 'no'"
                    >RELEVÂNCIA BAIXA</span
                  >
                </q-tooltip>
              </q-badge>
            </span>
            <span v-if="col.name === 'subject'">
              {{ col.value }}
            </span>
            <span v-if="col.name === 'collaborator'">
              <q-chip>
                <template v-if="props.row?.collaborator?.image">
                  <q-avatar>
                    <img
                      :src="`http://localhost:8000/storage/images/${props.row.collaborator.image.uri}`"
                    />
                  </q-avatar>
                  {{ props.row.collaborator?.first_name }}
                </template>
                <template v-else> Sem colaborador </template>
              </q-chip>
            </span>
            <span v-if="col.name === 'impact'">
              <q-tooltip
                :offset="[10, 10]"
                anchor="top middle"
                self="bottom middle"
              >
                {{ col.value.description }}
              </q-tooltip>
              <q-badge rounded :style="`background:${col.value.color}`" />
            </span>
            <span v-if="col.name === 'status'">
              <q-badge
                rounded
                :style="`background:${status[col.value].hex}`"
                :label="`${status[col.value].title}`"
              />
            </span>
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
import ticketsService from 'src/services/tickets';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import status from 'src/support/tickets/status';
import priority from 'src/support/tickets/priority';

export default defineComponent({
  name: 'ListPage',
  setup() {
    const tickets = ref([]);
    const { list, remove } = ticketsService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();

    const columns = [
      {
        name: 'code',
        align: 'center',
        label: '#',
        field: 'code',
      },
      {
        name: 'subject',
        align: 'center',
        label: 'Tem pra fazer?',
        field: 'subject',
      },
      {
        name: 'collaborator',
        align: 'center',
        label: 'Eu que mando!',
        field: 'collaborator',
      },
      {
        name: 'impact',
        align: 'center',
        label: 'Impacto',
        field: 'impact',
      },
      {
        name: 'status',
        align: 'center',
        label: 'Situação',
        field: 'status',
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
        tickets.value = data;
        loading.value = false;
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
      router.push({ name: 'tickets.form', params: { id } });
    };

    return {
      status,
      priority,
      tickets,
      columns,
      handleDeleteClient,
      handleEditClient,
      pagination,
      loading,
    };
  },
});
</script>
