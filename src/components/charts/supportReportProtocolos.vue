<template>
  <div class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12" style="max-width: 1400px">
        <!-- Cards de Resumo -->
        <div class="row q-col-gutter-md q-mb-lg" v-if="chartData.rows.length">
          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="shadow-2">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="smartphone" size="32px" color="blue-6" />
                <div class="text-h5 text-weight-bold q-mt-sm">
                  {{ getTotalMobile }}
                </div>
                <div class="text-caption text-grey-7">Mobile</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="shadow-2">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="language" size="32px" color="teal-6" />
                <div class="text-h5 text-weight-bold q-mt-sm">
                  {{ getTotalWeb }}
                </div>
                <div class="text-caption text-grey-7">Web</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="shadow-2">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="groups" size="32px" color="orange-6" />
                <div class="text-h5 text-weight-bold q-mt-sm">
                  {{ getTotalExternos }}
                </div>
                <div class="text-caption text-grey-7">Externos</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <q-card flat bordered class="shadow-2">
              <q-card-section class="text-center q-pa-lg">
                <q-icon name="business" size="32px" color="purple-6" />
                <div class="text-h5 text-weight-bold q-mt-sm">
                  {{ getTotalInternos }}
                </div>
                <div class="text-caption text-grey-7">Internos</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Gráfico -->
        <q-card flat bordered class="shadow-2 q-mb-lg">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-h6 text-weight-bold">
                  Distribuição por Cliente
                </div>
                <div class="text-caption text-grey-7">
                  Comparativo de protocolos externos vs internos
                </div>
              </div>
              <q-chip
                icon="bar_chart"
                color="primary"
                text-color="white"
                size="md"
                class="text-weight-medium"
              >
                {{ getTotalProtocolos }} Total
              </q-chip>
            </div>

            <apexchart
              v-if="chartData.categories.length"
              ref="chartRef"
              type="bar"
              height="450"
              :options="chartOptions"
              :series="chartData.series"
            />
            <div v-else class="column items-center text-center q-pa-xl">
              <q-spinner-cube color="primary" size="5.5em" />
              <div class="text-body2 text-grey-7 q-mt-lg">
                Carregando dados do relatório...
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Tabela Detalhada -->
        <q-card flat bordered class="shadow-2">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon
                name="table_chart"
                size="24px"
                color="primary"
                class="q-mr-sm"
              />
              <div class="text-h6 text-weight-bold">
                Detalhamento por Cliente
              </div>
            </div>

            <q-table
              :rows="chartData.rows"
              :columns="tableColumns"
              row-key="cliente"
              flat
              bordered
              :rows-per-page-options="[0]"
              hide-pagination
              separator="cell"
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="bg-primary text-white text-weight-bold"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="cliente" :props="props" class="text-weight-medium">
                    {{ props.row.cliente }}
                  </q-td>
                  <q-td key="mobile" :props="props">
                    <q-badge
                      color="blue-6"
                      :label="props.row.mobile"
                      class="q-px-md q-py-xs text-weight-medium"
                    />
                  </q-td>
                  <q-td key="web" :props="props">
                    <q-badge
                      color="teal-6"
                      :label="props.row.web"
                      class="q-px-md q-py-xs text-weight-medium"
                    />
                  </q-td>
                  <q-td key="externos" :props="props">
                    <q-badge
                      color="orange-6"
                      :label="props.row.externos"
                      class="q-px-md q-py-xs text-weight-medium"
                    />
                  </q-td>
                  <q-td key="internos" :props="props">
                    <q-badge
                      color="purple-6"
                      :label="props.row.internos"
                      class="q-px-md q-py-xs text-weight-medium"
                    />
                  </q-td>
                  <q-td key="total" :props="props">
                    <q-badge
                      color="grey-8"
                      :label="props.row.total"
                      class="q-px-md q-py-xs text-weight-bold"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import reportsService from 'src/services/reports';

export default defineComponent({
  name: 'SupportReportProtocolos',
  props: {
    month: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { getTicketsPorCliente } = reportsService();
    const chartRef = ref(null);
    const chartData = ref({
      series: [],
      categories: [],
      rows: [],
    });

    const chartOptions = computed(() => ({
      chart: {
        type: 'bar',
        height: 450,
        toolbar: { show: true },
        fontFamily: 'Roboto, sans-serif',
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
        },
      },

      dataLabels: {
        enabled: true,
        offsetY: -8,
        style: {
          fontSize: '11px',
          fontWeight: '600',
          colors: ['#304758'],
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: chartData.value.categories,
        labels: {
          style: {
            fontSize: '12px',
            fontWeight: 500,
          },
        },
      },
      yaxis: {
        title: {
          text: 'Quantidade de Protocolos',
          style: {
            fontSize: '13px',
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val) => `${val} protocolos`,
        },
      },
      colors: ['#FB8C00', '#7E57C2'],
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '13px',
        fontWeight: 600,
        markers: {
          radius: 4,
        },
      },
      grid: {
        borderColor: '#e7e7e7',
        strokeDashArray: 4,
      },
    }));

    const tableColumns = [
      {
        name: 'cliente',
        label: 'Cliente',
        align: 'center',
        field: 'cliente',
        sortable: true,
      },
      {
        name: 'mobile',
        label: 'Mobile',
        align: 'center',
        field: 'mobile',
        sortable: true,
      },
      {
        name: 'web',
        label: 'Web',
        align: 'center',
        field: 'web',
        sortable: true,
      },
      {
        name: 'externos',
        label: 'Externos',
        align: 'center',
        field: 'externos',
        sortable: true,
      },
      {
        name: 'internos',
        label: 'Internos',
        align: 'center',
        field: 'internos',
        sortable: true,
      },
      {
        name: 'total',
        label: 'Total',
        align: 'center',
        field: 'total',
        sortable: true,
      },
    ];

    const getTotalMobile = computed(() => {
      return chartData.value.rows.reduce((sum, row) => sum + row.mobile, 0);
    });

    const getTotalWeb = computed(() => {
      return chartData.value.rows.reduce((sum, row) => sum + row.web, 0);
    });

    const getTotalExternos = computed(() => {
      return chartData.value.rows.reduce((sum, row) => sum + row.externos, 0);
    });

    const getTotalInternos = computed(() => {
      return chartData.value.rows.reduce((sum, row) => sum + row.internos, 0);
    });

    const getTotalProtocolos = computed(() => {
      return chartData.value.rows.reduce((sum, row) => sum + row.total, 0);
    });

    const formatMonth = (month) => {
      const months = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
      ];
      const year = new Date().getFullYear();
      return `${months[month - 1]} ${year}`;
    };

    const loadData = async () => {
      try {
        const params = { month: props.month };
        const data = await getTicketsPorCliente(params);

        chartData.value = {
          series: [
            { name: 'Externos', data: data.map((d) => d.externos) },
            { name: 'Internos', data: data.map((d) => d.internos) },
          ],
          categories: data.map((d) => d.cliente),
          rows: data,
        };

        if (chartRef.value) {
          chartRef.value.updateSeries(chartData.value.series, false);
          chartRef.value.updateOptions(
            {
              xaxis: { categories: chartData.value.categories },
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
      tableColumns,
      getTotalMobile,
      getTotalWeb,
      getTotalExternos,
      getTotalInternos,
      getTotalProtocolos,
      formatMonth,
    };
  },
});
</script>
