<template>
  <apexchart
    class="col"
    height="300"
    type="bar"
    :options="options"
    :series="options.series"
  ></apexchart>
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
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [],
      },
    });

    const getTickets = async () => {
      try {
        const data = list();
        tickets.value = await data;
        options.value = {
          xaxis: {
            categories: [...recoverCollaborators().map((v) => v.user)],
          },
          series: [
            {
              data: recoverCollaborators().map((v) => v.count),
            },
          ],
        };
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
      });

      _.forEach(collaborator, function (value) {
        payload.user = value?.collaborator?.first_name;
        payload.count = collaborator?.length;
      });

      return payload;
    };

    return {
      options,
    };
  },
});
</script>
