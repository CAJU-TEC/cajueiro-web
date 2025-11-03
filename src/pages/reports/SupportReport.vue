<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-h4 text-weight-bold text-grey-8">
                Relatório de Desempenho - Suporte
              </div>
              <div class="text-subtitle1 text-grey-6">
                Acompanhamento de protocolos e atendimentos
              </div>
            </div>

            <!-- Filtros -->
            <div class="col-12 col-md-6">
              <div class="row items-center justify-end q-col-gutter-sm">
                <div class="col-auto">
                  <q-icon name="event" color="primary" size="24px" />
                </div>
                <div class="col-auto">
                  <q-select
                    v-model="selectedMonth"
                    :options="monthOptions"
                    map-options
                    emit-value
                    outlined
                    dense
                    style="min-width: 150px"
                  />
                </div>
                <div class="col-auto">
                  <q-select
                    v-model="selectedYear"
                    :options="years"
                    outlined
                    dense
                    style="min-width: 120px"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Cards de Resumo -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="summary-card border-left-primary">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Total de Protocolos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalTickets }}
                  </div>
                </div>
                <q-icon name="description" color="primary" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="summary-card border-left-positive">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Clientes Atendidos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalClients }}
                  </div>
                </div>
                <q-icon name="people" color="positive" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="summary-card border-left-purple">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Protocolos Externos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalExternal }}
                  </div>
                </div>
                <q-icon name="trending_up" color="purple" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="summary-card border-left-orange">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Protocolos Internos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalInternal }}
                  </div>
                </div>
                <q-icon name="trending_up" color="orange" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Protocolos por Colaborador -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold text-grey-8 q-mb-md">
            <q-icon name="people" color="primary" size="28px" class="q-mr-sm" />
            Protocolos Criados por Colaborador
          </div>

          <div class="chart-container q-mb-md">
            <apexchart
              type="bar"
              height="300"
              :options="collaboratorChartOptions"
              :series="collaboratorChartSeries"
            />
          </div>

          <q-table
            :rows="ticketsByCollaborator"
            :columns="collaboratorColumns"
            row-key="nome"
            flat
            bordered
          >
            <template #body-cell-position="props">
              <q-td :props="props">
                <q-badge
                  rounded
                  color="primary"
                  :label="props.rowIndex + 1"
                  class="q-pa-sm"
                />
              </q-td>
            </template>
            <template #body-cell-total="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ props.row.total }}</span>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Protocolos por Cliente -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h5 text-weight-bold text-grey-8 q-mb-md">
            <q-icon
              name="description"
              color="positive"
              size="28px"
              class="q-mr-sm"
            />
            Quantidade de Protocolos por Cliente
          </div>

          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12 col-md-6">
              <div
                class="text-subtitle1 text-weight-medium text-center q-mb-sm"
              >
                Externos vs Internos
              </div>
              <div class="chart-container">
                <apexchart
                  type="pie"
                  height="300"
                  :options="externalInternalChartOptions"
                  :series="externalInternalChartSeries"
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div
                class="text-subtitle1 text-weight-medium text-center q-mb-sm"
              >
                Mobile vs Web
              </div>
              <div class="chart-container">
                <apexchart
                  type="pie"
                  height="300"
                  :options="platformChartOptions"
                  :series="platformChartSeries"
                />
              </div>
            </div>
          </div>

          <q-table
            :rows="ticketsByClient"
            :columns="clientColumns"
            row-key="cliente"
            flat
            bordered
          >
            <template #body-cell-externos="props">
              <q-td :props="props">
                <q-badge
                  color="purple"
                  :label="props.row.externos"
                  class="q-pa-sm"
                />
              </q-td>
            </template>
            <template #body-cell-internos="props">
              <q-td :props="props">
                <q-badge
                  color="orange"
                  :label="props.row.internos"
                  class="q-pa-sm"
                />
              </q-td>
            </template>
            <template #body-cell-mobile="props">
              <q-td :props="props">
                <q-badge
                  color="primary"
                  :label="props.row.mobile"
                  class="q-pa-sm"
                />
              </q-td>
            </template>
            <template #body-cell-web="props">
              <q-td :props="props">
                <q-badge
                  color="positive"
                  :label="props.row.web"
                  class="q-pa-sm"
                />
              </q-td>
            </template>
            <template #body-cell-total="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ props.row.total }}</span>
              </q-td>
            </template>
            <template #bottom-row>
              <q-tr class="bg-grey-3 text-weight-bold">
                <q-td>TOTAL GERAL</q-td>
                <q-td class="text-center">{{ totalExternal }}</q-td>
                <q-td class="text-center">{{ totalInternal }}</q-td>
                <q-td class="text-center">{{ totalMobile }}</q-td>
                <q-td class="text-center">{{ totalWeb }}</q-td>
                <q-td class="text-center">{{ totalTickets }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { reportsService } from 'src/services/reports';

export default {
  name: 'SupportDashboard',

  setup() {
    const $q = useQuasar();

    const selectedMonth = ref(new Date().getMonth() + 1);
    const selectedYear = ref(new Date().getFullYear());
    const loading = ref(false);

    const ticketsByCollaborator = ref([]);
    const ticketsByClient = ref([]);

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

    const monthOptions = months.map((month, idx) => ({
      label: month,
      value: idx + 1,
    }));

    const years = Array.from(
      { length: 5 },
      (_, i) => new Date().getFullYear() - i
    );

    const collaboratorColumns = [
      { name: 'position', label: 'Posição', field: 'position', align: 'left' },
      { name: 'nome', label: 'Colaborador', field: 'nome', align: 'left' },
      { name: 'total', label: 'Total', field: 'total', align: 'right' },
    ];

    const clientColumns = [
      { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
      {
        name: 'externos',
        label: 'Externos',
        field: 'externos',
        align: 'center',
      },
      {
        name: 'internos',
        label: 'Internos',
        field: 'internos',
        align: 'center',
      },
      { name: 'mobile', label: 'Mobile', field: 'mobile', align: 'center' },
      { name: 'web', label: 'Web', field: 'web', align: 'center' },
      { name: 'total', label: 'Total', field: 'total', align: 'center' },
    ];

    // === GRÁFICOS ===
    const collaboratorChartOptions = ref({
      chart: { type: 'bar', toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 8, horizontal: false } },
      xaxis: { categories: [] },
      colors: ['#1976D2'],
      dataLabels: { enabled: false },
      legend: { show: true },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
    });

    const collaboratorChartSeries = ref([{ name: 'Protocolos', data: [] }]);

    const externalInternalChartOptions = ref({
      chart: { type: 'pie', toolbar: { show: false } },
      labels: ['Externos', 'Internos'],
      colors: ['#9C27B0', '#FF9800'],
      legend: { position: 'bottom' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
    });

    const externalInternalChartSeries = ref([]);

    const platformChartOptions = ref({
      chart: { type: 'pie', toolbar: { show: false } },
      labels: ['Mobile', 'Web'],
      colors: ['#1976D2', '#4CAF50'],
      legend: { position: 'bottom' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
    });

    const platformChartSeries = ref([]);

    // === COMPUTED ===
    const totalTickets = computed(() =>
      ticketsByCollaborator.value.reduce((sum, item) => sum + item.total, 0)
    );

    const totalClients = computed(() => ticketsByClient.value.length);
    const totalExternal = computed(() =>
      ticketsByClient.value.reduce((sum, item) => sum + item.externos, 0)
    );
    const totalInternal = computed(() =>
      ticketsByClient.value.reduce((sum, item) => sum + item.internos, 0)
    );
    const totalMobile = computed(() =>
      ticketsByClient.value.reduce((sum, item) => sum + item.mobile, 0)
    );
    const totalWeb = computed(() =>
      ticketsByClient.value.reduce((sum, item) => sum + item.web, 0)
    );

    // === ATUALIZAR GRÁFICOS ===
    const updateCharts = () => {
      const categorias = ticketsByCollaborator.value.map(
        (item) => item.nome || 'Sem nome'
      );
      const dados = ticketsByCollaborator.value.map((item) => item.total || 0);

      // ✅ Atualiza o gráfico de colaboradores com novo objeto reativo
      collaboratorChartOptions.value = {
        ...collaboratorChartOptions.value,
        xaxis: {
          ...collaboratorChartOptions.value.xaxis,
          categories: categorias,
        },
      };

      collaboratorChartSeries.value = [{ name: 'Protocolos', data: dados }];

      // Externos vs Internos
      externalInternalChartSeries.value = [
        totalExternal.value,
        totalInternal.value,
      ];

      // Mobile vs Web
      platformChartSeries.value = [totalMobile.value, totalWeb.value];
    };

    // === CARREGAR DADOS ===
    const loadData = async () => {
      loading.value = true;
      try {
        const params = { month: selectedMonth.value, year: selectedYear.value };
        const [collabData, clientData] = await Promise.all([
          reportsService.getTicketsPorColaborador(params),
          reportsService.getTicketsPorCliente(params),
        ]);

        ticketsByCollaborator.value = collabData;
        ticketsByClient.value = clientData;
        updateCharts();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        $q.notify({
          color: 'negative',
          message: 'Erro ao carregar os dados do relatório.',
          icon: 'warning',
        });
      } finally {
        loading.value = false;
      }
    };

    const handleFilter = () => {
      loadData();
    };

    // Atualizar gráficos quando os dados mudarem
    watch([ticketsByCollaborator, ticketsByClient], updateCharts);

    watch([selectedMonth, selectedYear], () => {
      loadData();
    });

    onMounted(() => {
      loadData();
    });

    return {
      selectedMonth,
      selectedYear,
      loading,
      ticketsByCollaborator,
      ticketsByClient,
      monthOptions,
      years,
      collaboratorColumns,
      clientColumns,
      totalTickets,
      totalClients,
      totalExternal,
      totalInternal,
      totalMobile,
      totalWeb,
      handleFilter,

      // Gráficos
      collaboratorChartOptions,
      collaboratorChartSeries,
      externalInternalChartOptions,
      externalInternalChartSeries,
      platformChartOptions,
      platformChartSeries,
    };
  },
};
</script>

<style scoped>
.summary-card {
  border-left: 4px solid;
}
.border-left-primary {
  border-left-color: #1976d2;
}
.border-left-positive {
  border-left-color: #4caf50;
}
.border-left-purple {
  border-left-color: #9c27b0;
}
.border-left-orange {
  border-left-color: #ff9800;
}

.chart-container {
  height: 300px;
}
</style>
