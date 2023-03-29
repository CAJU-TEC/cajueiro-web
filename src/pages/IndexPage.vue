<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" />
      </q-breadcrumbs>
      <div class="row q-gutter-sm">
        <div class="col">
          <q-card class="my-card" flat bordered>
            <q-card-section horizontal>
              <q-card-section class="col">
                <h5 class="text-overline q-ma-none q-pb-sm">
                  EM DESENVOLVENDO:
                </h5>
                <div
                  class="text-grey-8 q-gutter-xs"
                  v-for="ticket in ticketsInDevelop"
                  :key="ticket.id"
                >
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                    <q-badge
                      rounded
                      flat
                      class="text-caption text-weight-regular"
                      :style="`background:${
                        status[ticket?.status]?.hex
                      }; font-size: 10px;`"
                      :label="`#${ticket?.code}`"
                    />
                  </template>
                </div>
              </q-card-section>

              <q-separator vertical />

              <q-card-section class="col">
                <h5 class="text-overline q-ma-none q-pb-sm">PLANTÃO:</h5>
                Em desenvolvimento
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <apex-bar class="column"></apex-bar>
      <div class="row q-gutter-sm">
        <!-- <div class="col">
          <q-card dark bordered class="bg-blue-9 my-card">
            <q-card-section>
              <div class="text-h6">Média de protocolos finalizados</div>
              <div class="text-subtitle2">
                <h1 class="text-h1 q-pa-none q-ma-none">
                  {{ options?.finals?.averang }}
                </h1>
              </div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section>
              <ul>
                <li v-for="item in getTicketsFinals()" :key="item">
                  {{ item.user }} |
                  {{ item.count }}
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </div> -->
        <!-- <div class="col">
          <q-card dark bordered class="bg-blue-9 my-card">
            <q-card-section>
              <div class="text-h6">Média de somatório por pontos</div>
              <div class="text-subtitle2">
                <h1 class="text-h1 q-pa-none q-ma-none">
                  {{ options?.points?.averang }}
                </h1>
              </div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section>
              <ul>
                <li v-for="item in getTicketsPoints()" :key="item">
                  {{ item.user }} |
                  {{ item.points }}
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </div> -->
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref, reactive } from 'vue';
import ApexBar from 'src/components/charts/apexBar.vue';
import ticketsService from 'src/services/tickets';
import _ from 'lodash';
import status from 'src/support/tickets/status';
import priority from 'src/support/tickets/priority';

export default defineComponent({
  name: 'IndexPage',
  components: { ApexBar },
  setup() {
    onMounted(async () => {
      await getTickets();
      // getTicketsFinals();
      getTicketsInDevelop();
    });

    const options = ref();
    const tickets = ref();
    const ticketsInDevelop = ref();
    const { list, myTickets } = ticketsService();

    const averang = (num, qntItem) => {
      return parseFloat(num / qntItem);
    };

    const recoverCollaborators = () => {
      const listCollaboratorGroupBy = ref(
        _.chain(tickets.value)
          .groupBy('collaborator_id')
          .map((value) => recoverUser(value))
          .filter((value) => value.user !== undefined)
          .value()
      );
      return listCollaboratorGroupBy.value;
    };

    const recoverUser = (collaborator) => {
      const payload = reactive({
        user: null,
        count: 0,
        points: 0,
        averang: 0,
      });

      _.forEach(collaborator, function (value) {
        payload.user = value?.collaborator?.first_name;
        payload.count = collaborator?.length;
        payload.points += parseFloat(value?.impact?.points);
      });

      return payload;
    };

    const getTickets = async () => {
      try {
        tickets.value = await list();
        const data = ref({
          xaxis: {
            categories: [...recoverCollaborators().map((v) => v.user)],
          },
          finals: {
            sum: _.sum([...recoverCollaborators().map((v) => v.count)]),
            averang: _.meanBy([...recoverCollaborators().map((v) => v.count)]),
            elem: [...recoverCollaborators().map((v) => v.count)],
          },
          points: {
            sum: _.sum([...recoverCollaborators().map((v) => v.points)]),
            averang: _.meanBy([...recoverCollaborators().map((v) => v.points)]),
            elem: [...recoverCollaborators().map((v) => v.points)],
          },
        });

        options.value = { ...data.value };
      } catch (error) {
        console.log(error);
      }
    };

    const getTicketsInDevelop = async () => {
      try {
        const data = await myTickets(
          '?filter[collaborator_id]=&filter[status]=development'
        );
        ticketsInDevelop.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    // const getTicketsFinals = () => {
    //   return _.filter(recoverCollaborators(), function (o) {
    //     return o.count >= options.value.finals.averang;
    //   });
    // };

    // const getTicketsPoints = () => {
    //   return _.filter(recoverCollaborators(), function (o) {
    //     return o.points >= options.value.points.averang;
    //   });
    // };

    return {
      options,
      // getTicketsFinals,
      // getTicketsPoints,
      averang,
      ticketsInDevelop,
      status,
      priority,
    };
  },
});
</script>
