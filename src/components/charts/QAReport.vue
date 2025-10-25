<template>
  <div>
    <div v-if="qas.length">
      <div v-for="qa in qas" :key="qa.qa" class="q-mb-xl">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 text-weight-bold text-primary q-mb-md">
              {{ qa.qa }}
            </div>
            <apexchart
              type="pie"
              height="350"
              :options="getChartOptions(qa)"
              :series="getChartSeries(qa)"
            />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else class="column items-center text-center q-ma-xl">
      <q-spinner-cube color="blue" size="5.5em" />
      <div class="text-caption q-ma-xl">Carregando dados...</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import reportsService from 'src/services/reports';

// Constantes
const CHART_COLORS = [
  '#1E88E5',
  '#FB8C00',
  '#C0CA33',
  '#7E57C2',
  '#6D4C41',
  '#00897B',
  '#D81B60',
  '#F4511E',
  '#43A047',
  '#3949AB',
  '#FDD835',
  '#8E24AA',
  '#00ACC1',
  '#E53935',
  '#757575',
  '#039BE5',
  '#FBC02D',
  '#009688',
  '#AFB42B',
  '#5E35B1',
];

const STATUS_LABELS = ['Teste', 'Validação', 'Pendente', 'Finalizado'];

export default defineComponent({
  name: 'SupportReportQA',

  props: {
    month: {
      type: Number,
      required: true,
    },
  },

  setup(props) {
    const { getTicketsPorQA } = reportsService();
    const qas = ref([]);

    // Métodos auxiliares
    const getChartSeries = (qa) => Object.values(qa.status);

    const createBaseChartOptions = () => ({
      chart: {
        type: 'pie',
        height: 450,
        offsetX: -50,
        animations: {
          enabled: true,
          speed: 400,
          animateGradually: {
            enabled: false,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      colors: CHART_COLORS,
      labels: STATUS_LABELS,
      legend: {
        show: true,
        position: 'right',
        horizontalAlign: 'left',
        fontSize: '13px',
        fontWeight: 500,
        offsetX: 10,
        width: 250,
        offsetY: 0,
        markers: {
          width: 12,
          height: 12,
          radius: 2,
        },
        itemMargin: {
          horizontal: 5,
          vertical: 5,
        },
        formatter(seriesName, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `${seriesName}: ${value}`;
        },
      },
      dataLabels: {
        enabled: true,
        formatter(val, opts) {
          return opts.w.globals.series[opts.seriesIndex];
        },
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
        dropShadow: {
          enabled: false,
        },
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} protocolos`,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: false,
            },
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 300,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    });

    const getChartOptions = (qa) => ({
      ...createBaseChartOptions(),
      title: {
        text: `Status de ${qa.qa}`,
        align: 'center',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
        },
      },
    });

    const loadData = async () => {
      try {
        const data = await getTicketsPorQA({ month: props.month });
        qas.value = data;
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Aqui você pode adicionar notificação de erro ao usuário
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      loadData();
    });

    watch(
      () => props.month,
      () => {
        loadData();
      }
    );

    return {
      qas,
      getChartSeries,
      getChartOptions,
    };
  },
});
</script>
