<template>
  <q-card flat bordered class="q-mt-lg q-ml-lg">
    <q-card-section>
      <apexchart
        v-if="options.xaxis.categories.length"
        height="400"
        type="bar"
        :options="options"
        :series="options.series"
      ></apexchart>
      <div v-else class="column items-center text-center q-ma-xl">
        <q-spinner-cube color="blue" size="5.5em" />
        <div class="text-caption q-ma-xl">Carregando dados...</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, onMounted, reactive, ref, watch } from 'vue';
import _ from 'lodash';
import ticketsService from 'src/services/tickets';

export default defineComponent({
  name: 'ApexBar',
  setup() {
    const { list } = ticketsService();
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

    const getTickets = async () => {
      try {
        tickets.value = await list();
        const data = ref({
          xaxis: {
            categories: [...recoverCollaborators().map((v) => v.user)],
          },
          series: [
            {
              name: 'Total protocolos finalizados p/ usuários',
              data: [...recoverCollaborators().map((v) => v.count)],
            },
            {
              name: 'Total do somatório de pontos',
              data: [...recoverCollaborators().map((v) => v.points)],
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
        payload.points += parseFloat(value?.impact?.points);
      });

      return payload;
    };

    return {
      options,
    };
  },
});
</script>
