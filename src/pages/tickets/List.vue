<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Protocolos" />
      </q-breadcrumbs>
    </div>
    <div class="q-py-md">
      <q-btn
        v-if="pusherMessage.length > 0"
        :label="`protocolos (${pusherMessage.length})`"
        @click="getClients()"
        push
        class="full-width"
        color="primary"
      />
    </div>
    <q-table
      dense
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
        <q-btn
          push
          color="white"
          text-color="primary"
          round
          icon="add"
          size="sm"
          :to="{ name: 'tickets.form' }"
        >
          <q-tooltip> Criar protocolo </q-tooltip>
        </q-btn>
        &nbsp;&nbsp;
        <q-btn
          push
          color="white"
          text-color="primary"
          round
          icon="mdi-file-eye-outline"
          size="sm"
          @click="myTickets(user?.user?.collaborator?.id)"
        >
          <q-tooltip> Recuperar/Listar meus protocolos </q-tooltip>
        </q-btn>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td
            class="q-gutter-sm text-center"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <span
              v-if="col.name === 'code'"
              class="text-weight-bold text-center"
              style="font-size: 12px"
            >
              #{{ col.value }}
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
            <template v-if="col.name === 'avatars'">
              <template v-if="props.row.client?.corporate?.image">
                <q-avatar
                  class="q-ma-none"
                  size="sm"
                  v-if="props.row.client?.corporate?.image"
                >
                  <q-tooltip
                    :offset="[10, 10]"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    <div>
                      {{ props.row.client?.corporate?.full_name }}
                    </div>
                  </q-tooltip>
                  <img
                    :src="`https://cajueiroapi.cajutec.com.br/storage/images/${props.row.client?.corporate?.image?.uri}`"
                  />
                </q-avatar>
              </template>
              <template v-else>
                <q-avatar class="q-ma-none" size="sm" color="primary">{{
                  props.row.client?.corporate?.letter
                }}</q-avatar>
              </template>
            </template>
            <div v-if="col.name === 'subject'" class="text-left q-ma-none">
              <q-btn
                class="q-ma-none"
                flat
                rounded
                color="primary"
                size="sm"
                :label="col.value"
                @click="handleListClient(props.row.id)"
              />
            </div>
            <span v-if="col.name === 'collaborator'">
              <template v-if="props.row?.collaborator">
                <q-chip size="sm">
                  <q-avatar v-if="props.row?.collaborator?.image">
                    <img
                      :src="`https://cajueiroapi.cajutec.com.br/storage/images/${props.row.collaborator.image.uri}`"
                    />
                  </q-avatar>
                  {{ props.row.collaborator?.first_name }}
                </q-chip>
              </template>
              <template v-else>
                <q-btn
                  unelevated
                  size="xs"
                  round
                  color="primary"
                  icon="rocket_launch"
                  @click="addUserTicker(props.row.id)"
                >
                </q-btn>
              </template>
            </span>
            <span v-if="col.name === 'impact'">
              <q-tooltip
                :offset="[10, 10]"
                anchor="top middle"
                self="bottom middle"
              >
                {{ col.value.description }}
              </q-tooltip>
              <q-badge rounded :style="`background:${col?.value?.color}`" />
            </span>
            <span v-if="col.name === 'status'">
              <q-badge
                rounded
                class="text-caption text-weight-regular"
                :style="`background:${status[col.value].hex}; font-size: 10px;`"
                :label="`${status[col.value].title}`"
              />
            </span>
            <q-btn-group v-if="col.name == 'actions'" push>
              <!-- <q-btn
                push
                icon="list"
                color="green"
                size="xs"
                @click="handleListClient(props.row.id)"
              >
                <q-badge
                  color="orange"
                  floating
                  v-if="props.row.comments.length > 0"
                >
                  {{ props.row.comments.length }}
                </q-badge>
              </q-btn> -->
              <q-btn
                push
                icon="picture_as_pdf"
                color="orange"
                size="xs"
                @click="handleTicketReport(props.row.id)"
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
    <TicketReport
      :dialog="dialog"
      :report-pdf="reportPdf"
      @receiveEvent="receiveEvent"
    ></TicketReport>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import ticketsService from 'src/services/tickets';
import authService from 'src/services/auth';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import status from 'src/support/tickets/status';
import priority from 'src/support/tickets/priority';
import Pusher from 'pusher-js';
import TicketReport from 'src/components/dialogs/tickets/TicketReport.vue';

export default defineComponent({
  name: 'ListPage',
  components: { TicketReport },
  setup() {
    const tickets = ref([]);
    const {
      list,
      addUserPatchTicket,
      remove,
      report,
      myTickets: myTicketsService,
    } = ticketsService();
    const { fetchUser } = authService();

    const pagination = ref({
      descending: false,
      page: 1,
      rowsPerPage: 15,
      rowsNumber: 15,
    });
    const loading = ref();
    const pusherMessage = ref([]);
    const user = ref({});
    const recoverTickets = ref(false);

    const columns = [
      {
        name: 'code',
        align: 'center',
        label: '#',
        field: 'code',
      },
      {
        name: 'avatars',
        align: 'center',
        label: '',
        field: 'avatars',
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

    const myTickets = async (id) => {
      loading.value = true;
      try {
        const idLocal = recoverTickets.value ? '' : id;
        const data = await myTicketsService(idLocal);
        recoverTickets.value = !recoverTickets.value;

        tickets.value = data;
        loading.value = false;
        $q.notify({
          message: 'Listando meus/todos os protocolos',
          color: 'positive',
        });
      } catch (error) {
        $q.notify({
          message: error.message,
          icon: 'block',
          color: 'negative',
        });
        loading.value = false;
      }
    };

    const $q = useQuasar();
    const router = useRouter();

    onMounted(() => {
      loading.value = true;
      getClients();
      getPusher();
      getFetchUser();
    });

    const getFetchUser = async () => {
      try {
        const data = await fetchUser();
        user.value = data.data;
      } catch (error) {
        $q.notify({
          message: error.message,
          icon: 'block',
          color: 'negative',
        });
      }
    };

    const getPusher = () => {
      const pusher = new Pusher('429c853a3dec3f30148c', {
        cluster: 'sa1',
      });

      const channel = pusher.subscribe('tickets');
      channel.bind('index', function (data) {
        if (data) {
          pusherMessage.value.push(data);
        }
      });
    };

    const receiveEvent = (event) => {
      dialog.value = event;
    };

    const getClients = async () => {
      try {
        const data = await list();
        tickets.value = data;
        loading.value = false;
        pusherMessage.value = [];
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro',
          icon: 'block',
          color: 'negative',
        });
      }
    };

    const dialog = ref(false);
    const reportPdf = ref('');
    const handleTicketReport = async (id) => {
      dialog.value = true;
      reportPdf.value = null;
      reportPdf.value = await report(id);
    };

    const addUserTicker = async (id) => {
      try {
        $q.dialog({
          title: 'Quero assumir esse protocolo',
          message: 'Desejo esse protocolo, blz?',
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          $q.notify({
            message: 'Esse protocolo agora é meu, ninguém me toma!',
            icon: 'check',
            color: 'positive',
          });
          addUserPatchTicket({
            id,
          });
          await getClients();
        });
      } catch (error) {
        $q.notify({
          message: 'Ops! Não foi possível associar você a este protocolo.',
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

    const handleListClient = async (id) => {
      router.push({ name: 'tickets.details', params: { id } });
    };

    return {
      getClients,
      addUserTicker,
      pusherMessage,
      status,
      priority,
      tickets,
      receiveEvent,
      columns,
      handleDeleteClient,
      handleListClient,
      handleTicketReport,
      pagination,
      loading,
      dialog,
      reportPdf,
      myTickets,
      user,
      recoverTickets,
    };
  },
});
</script>
