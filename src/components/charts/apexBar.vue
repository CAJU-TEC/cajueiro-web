<template>
  <div>
    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <apexchart
          v-if="options.xaxis.categories.length"
          height="400"
          :options="options"
          :series="options.series"
        ></apexchart>
        <div v-else class="column items-center text-center q-ma-xl">
          <q-spinner-cube color="blue" size="5.5em" />
          <div class="text-caption q-ma-xl">Carregando dados...</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import _ from 'lodash';
import ticketsService from 'src/services/tickets';

export default defineComponent({
  name: 'ApexBar',
  props: ['month'],
  setup(props) {
    const { ticketsGraphUsers } = ticketsService();
    const tickets = ref([]);
    const options = ref({
      series: [
        {
          data: [],
        },
        {
          data: [],
        },
      ],
      chart: {
        type: 'bar',
        height: 730,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
          fontSize: '12px',
          colors: ['#fff'],
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff'],
      },
      tooltip: {
        shared: true,
        intersect: false,
      },
      xaxis: {
        categories: [],
      },
    });

    const dateActual = () => {
      const date = new Date();
      const month = date.getMonth();
      return parseInt(month) + 1;
    };

    const getTickets = async () => {
      try {
        tickets.value = await ticketsGraphUsers('?filter[status]=done', {
          month: monthSelect.value !== '' ? monthSelect.value : dateActual(),
        });

        const payloadRecoverCollaborators = recoverCollaborators();

        const data = ref({
          chart: {
            type: 'bar',
          },
          plotOptions: {
            bar: {
              horizontal: true,
            },
          },
          xaxis: {
            categories: [...payloadRecoverCollaborators.map((v) => v.user)],
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
          series: [
            {
              name: 'Total protocolos finalizados p/ usuários',
              data: [...payloadRecoverCollaborators.map((v) => v.count)],
            },
            {
              name: 'Total do somatório de pontos',
              data: [...payloadRecoverCollaborators.map((v) => v.points)],
            },
          ],
        });
        options.value = { ...data.value };
      } catch (error) {
        console.log(error);
      }
    };

    onMounted(async () => {
      await getTickets();
    });

    const monthSelect = ref('');
    watch(props, (newValue) => {
      monthSelect.value = newValue.month;
      getTickets();
    });

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
      });

      _.forEach(collaborator, function (value) {
        payload.user = value?.collaborator?.first_name;
        payload.count = collaborator?.length;
        payload.points +=
          parseFloat(value?.impact?.points) +
          (value.priority === 'yes' ? 1 : 0);
        // payload.priority += value.priority === 'yes' ? 1 : 0;
      });

      return payload;
    };

    return {
      options,
      monthSelect,
    };
  },
});
</script>
