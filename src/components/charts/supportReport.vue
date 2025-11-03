<template>
  <div>
    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <apexchart
          v-if="chartData.labels.length"
          ref="chartRef"
          type="pie"
          height="400"
          :options="chartOptions"
          :series="chartData.series"
        />
        <div v-else class="column items-center text-center q-ma-xl">
          <q-spinner-cube color="blue" size="5.5em" />
          <div class="text-caption q-ma-xl">Carregando dados...</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import reportsService from 'src/services/reports';

export default defineComponent({
  name: 'SupportReport',
  props: {
    month: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { getTicketsPorColaborador } = reportsService();
    const chartRef = ref(null);
    const chartData = ref({
      series: [],
      labels: [],
    });

    const chartOptions = computed(() => ({
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

      colors: [
        '#1E88E5', // Azul
        '#FB8C00', // Laranja
        '#C0CA33', // Verde Lima
        '#7E57C2', // Roxo
        '#6D4C41', // Marrom
        '#00897B', // Verde Água
        '#D81B60', // Rosa
        '#F4511E', // Vermelho Alaranjado
        '#43A047', // Verde
        '#3949AB', // Azul Escuro
        '#FDD835', // Amarelo
        '#8E24AA', // Roxo Médio
        '#00ACC1', // Ciano
        '#E53935', // Vermelho
        '#757575', // Cinza
        '#039BE5', // Azul Claro
        '#FBC02D', // Amarelo Ouro
        '#009688', // Verde Petróleo
        '#AFB42B', // Verde Musgo
        '#5E35B1', // Roxo Escuro
      ],

      labels: chartData.value.labels,
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
        formatter: function (seriesName, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return seriesName + ': ' + value;
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
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
    }));

    const loadData = async () => {
      try {
        const params = { month: props.month };
        const data = await getTicketsPorColaborador(params);

        chartData.value = {
          series: data.map((d) => d.total),
          labels: data.map((d) => d.nome),
        };

        if (chartRef.value) {
          chartRef.value.updateSeries(chartData.value.series, false);
          chartRef.value.updateOptions(
            {
              labels: chartData.value.labels,
            },
            false,
            true
          );
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

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
      chartRef,
      chartData,
      chartOptions,
    };
  },
});
</script>
