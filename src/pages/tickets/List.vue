<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Protocolos" />
        <q-chip dense size="xs" icon="search">control + K</q-chip>
      </q-breadcrumbs>
    </div>
    <div class="row">
      <div class="col text-right">
        <q-btn
          push
          color="white"
          text-color="primary"
          icon="add"
          size="sm"
          :to="{ name: 'tickets.form' }"
        >
          <q-tooltip> Criar protocolo </q-tooltip>
          Criar protocolo
        </q-btn>
      </div>
    </div>
    <div class="q-py-md">
      <q-btn
        v-if="pusherMessage.length > 0"
        :label="`protocolos (${pusherMessage.length})`"
        @click="
          {
            window.load;
          }
        "
        push
        class="full-width"
        color="primary"
      />
    </div>
    <TicketsOpen
      v-if="
        openNoPriority ||
        openYesPriority ||
        ticketsInDevelop ||
        ticketsInTests ||
        ticketsInBacklog ||
        ticketsInValidation ||
        ticketsInPending ||
        ticketsInDone
      "
      :tickets-open-no-priority="openNoPriority"
      :tickets-open-yes-priority="openYesPriority"
      :tickets-in-develop="ticketsInDevelop"
      :tickets-in-tests="ticketsInTests"
      :tickets-in-backlog="ticketsInBacklog"
      :tickets-in-validation="ticketsInValidation"
      :tickets-in-pending="ticketsInPending"
      :tickets-in-done="ticketsInDone"
      :tickets-in-my-tickets="ticketsInMyTickets"
      @addUserTicker="
        (id) => {
          addUserTicker(id);
        }
      "
      @handleListClient="
        (id) => {
          handleListClient(id);
        }
      "
      @updateTicketsOpen="
        () => {
          getTicketsOpenYesPriority();
          getTicketsOpenNoPriority();
        }
      "
      @updateTicketsDevelop="
        () => {
          getTicketsInDevelop();
        }
      "
      @updateTicketsTests="
        () => {
          getTicketsInTests();
        }
      "
      @updateTicketsBacklog="
        () => {
          getTicketsInBacklog();
        }
      "
      @updateTicketsValidation="
        () => {
          getTicketsInValidation();
        }
      "
      @updateTicketsPending="
        () => {
          getTicketsInPending();
        }
      "
      @updateTicketsDone="
        () => {
          getTicketsInDone();
        }
      "
      @updateTicketsMy="
        () => {
          getTicketsOpenMyTickets();
        }
      "
    />

    <TicketReport
      :dialog="dialog"
      :report-pdf="reportPdf"
      @receive-event="receiveEvent"
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
import TicketsOpen from 'src/components/tickets/TicketsOpen.vue';

export default defineComponent({
  name: 'ListPage',
  components: { TicketReport, TicketsOpen },
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
    const openNoPriority = ref([]);
    const openYesPriority = ref([]);
    const ticketsInDevelop = ref([]);
    const ticketsInTests = ref([]);
    const ticketsInBacklog = ref([]);
    const ticketsInValidation = ref([]);
    const ticketsInPending = ref([]);
    const ticketsInDone = ref([]);
    const ticketsInMyTickets = ref([]);

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
      getTicketsOpenMyTickets();
      getTicketsOpenNoPriority();
      getTicketsOpenYesPriority();
      getTicketsInDevelop();
      getTicketsInValidation();
      getTicketsInTests();
      getTicketsInBacklog();
      getTicketsInPending();
      getTicketsInDone();
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

    const getTicketsOpenMyTickets = async () => {
      try {
        const user = await fetchUser();
        const data = await myTicketsService(
          `?filter[collaborator_id]=${user.data.user.collaborator?.id}`
        );
        ticketsInMyTickets.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsOpenNoPriority = async () => {
      try {
        const data = await myTicketsService(
          '?include=collaborator,impact,user.collaborator&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,code,priority,type,dufy,subject,status,date_attribute_ticket,created_at,updated_at,deleted_at&filter[collaborator_id]=null&filter[priority]=no'
        );
        openNoPriority.value = data.data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsOpenYesPriority = async () => {
      try {
        const data = await myTicketsService(
          '?include=collaborator,impact,user.collaborator&fields[tickets]=id,client_id,created_id,collaborator_id,impact_id,code,priority,type,dufy,subject,status,date_attribute_ticket,created_at,updated_at,deleted_at&filter[collaborator_id]=null&filter[priority]=yes'
        );
        openYesPriority.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInDevelop = async () => {
      try {
        const data = await myTicketsService(
          '?filter[collaborator_id]=&filter[status]=development'
        );
        ticketsInDevelop.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInTests = async () => {
      try {
        const data = await myTicketsService(
          '?filter[collaborator_id]=&filter[status]=test'
        );
        ticketsInTests.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInBacklog = async () => {
      try {
        const data = await myTicketsService(
          '?filter[collaborator_id]=&filter[status]=backlog'
        );
        ticketsInBacklog.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInValidation = async () => {
      try {
        const data = await myTicketsService(
          '?filter[collaborator_id]=&filter[status]=validation'
        );
        ticketsInValidation.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInPending = async () => {
      try {
        const data = await myTicketsService(
          '?filter[collaborator_id]=&filter[status]=pending'
        );
        ticketsInPending.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInDone = async () => {
      try {
        const data = await myTicketsService(
          '?filter[collaborator_id]=&filter[status]=done'
        );
        ticketsInDone.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    const addUserTicker = async (id) => {
      try {
        $q.dialog({
          title: 'Quero assumir esse protocolo',
          message: 'Desejo esse protocolo, blz?',
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          // $q.notify({
          //   message: 'Esse protocolo agora é meu, ninguém me toma!',
          //   icon: 'check',
          //   color: 'positive',
          // });

          await addUserPatchTicket({
            id,
          })
            .then((response) => {
              handleListClient(id);
            })
            .catch((error) => {
              $q.notify({
                message: error.message,
                caption:
                  'Tente primeiramente resolver os protocolos que estão abertos/pendetes por seu usuário.',
                icon: 'block',
                color: 'negative',
              });
            });

          await getClients();
          await getTicketsOpenNoPriority();
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
      openNoPriority,
      openYesPriority,
      ticketsInDevelop,
      ticketsInTests,
      ticketsInBacklog,
      ticketsInValidation,
      ticketsInPending,
      ticketsInDone,
      ticketsInMyTickets,
      getTicketsOpenYesPriority,
      getTicketsOpenNoPriority,
      getTicketsOpenMyTickets,
      getTicketsInDevelop,
      getTicketsInTests,
      getTicketsInBacklog,
      getTicketsInValidation,
      getTicketsInPending,
      getTicketsInDone,
    };
  },
});
</script>
