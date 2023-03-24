<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" />
      </q-breadcrumbs>
      <h2 class="pt-10 text-h4">Galerinha em atividades!</h2>
      <div class="row q-col-gutter-sm">
        {{ options }}
        <apex-bar height="300"></apex-bar>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, reactive } from 'vue';
import ApexBar from 'src/components/charts/apexBar.vue';
import ticketsService from 'src/services/tickets';
import _ from 'lodash';
import collaborators from 'src/router/collaborators';

export default defineComponent({
  name: 'IndexPage',
  components: { ApexBar },
  setup() {
    const options = reactive({
      chart: {
        id: 'vuechart-example',
      },
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
      },
    });

    const series = ref([
      { name: 'series-1', data: [30, 40, 45, 50, 49, 60, 70, 91] },
    ]);

    const tickets = ref([]);
    const { list } = ticketsService();

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
      const result = ref(recoverCollaborators());
      options.xaxis.categories = _.concat(result.value);
    });

    const recoverCollaborators = () => {
      const listCollaboratorGroupBy = ref(
        _.chain(tickets.value)
          .groupBy('collaborator_id')
          .map((value) => value.map((v) => v.collaborator))
          .value()
      );

      const names = ref(
        _.reduce(listCollaboratorGroupBy.value, (result, value, key) => {
          // console.log(result, value, key);
          const collaborator = ref(_.first(value));
          (result[key] || (result[key] = [])).push(
            collaborator?.value?.first_name
          );
          return result;
        })
      );
      return names.value;
    };

    return {
      options,
      series,
    };
  },
});
</script>
