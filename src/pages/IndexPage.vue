<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" />
      </q-breadcrumbs>
      <h2 class="pt-10 text-h4">Galerinha em atividades!</h2>
      <div class="row q-col-gutter-sm">
        <apex-bar height="300" :optionsProps="options"></apex-bar>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, reactive } from 'vue';
import ApexBar from 'src/components/charts/apexBar.vue';
import ticketsService from 'src/services/tickets';
import _ from 'lodash';

export default defineComponent({
  name: 'IndexPage',
  components: { ApexBar },
  setup() {
    const tickets = ref([]);
    const { list } = ticketsService();
    const options = reactive({
      series: [
        {
          data: [1, 2],
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
        categories: [1, 2],
      },
    });

    const getTickets = async () => {
      try {
        const data = await list();
        tickets.value = data;
      } catch (error) {
        console.log(error);
      }
    };

    onMounted(async () => {
      await getTickets();
      // const result = ref(recoverCollaborators());

      // options.xaxis.categories = await result.value.map((v) => v.user);
      // options.count = await result.value.map((v) => v.count);
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
