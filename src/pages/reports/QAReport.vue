<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md" style="max-width: 1400px; margin: 0 auto">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-h4 text-weight-bold text-grey-8">
                Relatório de Desempenho - Q.A.
              </div>
              <div class="text-subtitle1 text-grey-6">
                Acompanhamento de protocolos testados e validados
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
          <q-card class="summary-card border-left-purple">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Total de Protocolos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalProtocolos }}
                  </div>
                </div>
                <q-icon name="description" color="purple" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="summary-card border-left-teal">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Q.A. Ativos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ ticketsByQa.length }}
                  </div>
                </div>
                <q-icon name="people" color="teal" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="summary-card border-left-green">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Finalizados
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalFinalizados }}
                  </div>
                </div>
                <q-icon name="check_circle" color="green" size="40px" />
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
                    Pendentes
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalPendentes }}
                  </div>
                </div>
                <q-icon name="hourglass_empty" color="orange" size="40px" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-md-7">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
                Protocolos por Q.A.
              </div>
              <div class="chart-container">
                <apexchart
                  type="bar"
                  height="300"
                  :options="qaChartOptions"
                  :series="qaChartSeries"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
                Status dos Protocolos
              </div>
              <div class="chart-container">
                <apexchart
                  type="pie"
                  height="300"
                  :options="statusChartOptions"
                  :series="statusChartSeries"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabela Principal -->
      <q-card>
        <q-card-section>
          <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
            Detalhamento por Analista de Q.A.
          </div>
          <q-table
            :rows="ticketsByQa"
            :columns="qaColumns"
            row-key="qaName"
            flat
            bordered
          >
            <template #body-cell-qaName="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-avatar
                    size="24px"
                    color="purple"
                    text-color="white"
                    class="q-mr-sm"
                  >
                    {{ getInitials(props.row.qaName) }}
                  </q-avatar>
                  {{ props.row.qaName }}
                </div>
              </q-td>
            </template>

            <template #body-cell-teste="props">
              <q-td :props="props" class="text-center">
                <q-badge color="blue" :label="props.row.teste" />
              </q-td>
            </template>

            <template #body-cell-validacao="props">
              <q-td :props="props" class="text-center">
                <q-badge color="teal" :label="props.row.validacao" />
              </q-td>
            </template>

            <template #body-cell-pendente="props">
              <q-td :props="props" class="text-center">
                <q-badge color="orange" :label="props.row.pendente" />
              </q-td>
            </template>

            <template #body-cell-finalizado="props">
              <q-td :props="props" class="text-center">
                <q-badge color="green" :label="props.row.finalizado" />
              </q-td>
            </template>

            <template #body-cell-total="props">
              <q-td :props="props" class="text-weight-bold text-center">
                {{ props.row.total }}
              </q-td>
            </template>

            <!-- Linha de total geral -->
            <template #bottom-row>
              <q-tr class="bg-grey-3 text-weight-bold">
                <q-td>TOTAL GERAL</q-td>
                <q-td class="text-center">{{ totalTeste }}</q-td>
                <q-td class="text-center">{{ totalValidacao }}</q-td>
                <q-td class="text-center">{{ totalPendentes }}</q-td>
                <q-td class="text-center">{{ totalFinalizados }}</q-td>
                <q-td class="text-center">{{ totalProtocolos }}</q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { reportsService } from 'src/services/reports';

const $q = useQuasar();

// Filtros
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const loading = ref(false);

// Dados
const ticketsByQa = ref([]);

// Meses e anos
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
const monthOptions = months.map((label, idx) => ({ label, value: idx + 1 }));
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

// Colunas da tabela
const qaColumns = [
  { name: 'qaName', label: 'Analista de Q.A.', field: 'qaName', align: 'left' },
  { name: 'teste', label: 'Em Teste', field: 'teste', align: 'center' },
  {
    name: 'validacao',
    label: 'Em Validação',
    field: 'validacao',
    align: 'center',
  },
  { name: 'pendente', label: 'Pendentes', field: 'pendente', align: 'center' },
  {
    name: 'finalizado',
    label: 'Finalizados',
    field: 'finalizado',
    align: 'center',
  },
  { name: 'total', label: 'Total', field: 'total', align: 'center' },
];

// Gráficos
const qaChartOptions = ref({
  chart: { type: 'bar', toolbar: { show: false } },
  plotOptions: {
    bar: { borderRadius: 6, horizontal: false, columnWidth: '50%' },
  },
  xaxis: { categories: [] },
  colors: ['#9C27B0'],
  dataLabels: { enabled: false },
  legend: { show: false },
});
const qaChartSeries = ref([{ name: 'Total', data: [] }]);

const statusChartOptions = ref({
  chart: { type: 'pie', toolbar: { show: false } },
  labels: ['Em Teste', 'Em Validação', 'Pendentes', 'Finalizados'],
  colors: ['#2196F3', '#009688', '#FF9800', '#4CAF50'],
  legend: { position: 'bottom' },
});
const statusChartSeries = ref([]);

// Computed
const totalTeste = computed(() =>
  ticketsByQa.value.reduce((sum, item) => sum + item.teste, 0)
);
const totalValidacao = computed(() =>
  ticketsByQa.value.reduce((sum, item) => sum + item.validacao, 0)
);
const totalPendentes = computed(() =>
  ticketsByQa.value.reduce((sum, item) => sum + item.pendente, 0)
);
const totalFinalizados = computed(() =>
  ticketsByQa.value.reduce((sum, item) => sum + item.finalizado, 0)
);
const totalProtocolos = computed(() =>
  ticketsByQa.value.reduce((sum, item) => sum + item.total, 0)
);

// Helpers
function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Atualizar gráficos
function updateCharts() {
  // Gráfico por Q.A.
  qaChartOptions.value = {
    ...qaChartOptions.value,
    xaxis: {
      ...qaChartOptions.value.xaxis,
      categories: ticketsByQa.value.map((item) => item.qaName),
    },
  };
  qaChartSeries.value = [
    {
      name: 'Total',
      data: ticketsByQa.value.map((item) => item.total),
    },
  ];

  // Gráfico por status
  statusChartSeries.value = [
    totalTeste.value,
    totalValidacao.value,
    totalPendentes.value,
    totalFinalizados.value,
  ];
}

// Carregar dados
async function loadData() {
  loading.value = true;
  try {
    const params = { month: selectedMonth.value, year: selectedYear.value };
    const data = await reportsService.getTicketsPorQA(params);

    // Transformar para o formato da tabela
    ticketsByQa.value = data.map((item) => ({
      qaName: item.qaName,
      teste: item.statusCounts.teste,
      validacao: item.statusCounts.validacao,
      pendente: item.statusCounts.pendente,
      finalizado: item.statusCounts.finalizado,
      total:
        item.statusCounts.teste +
        item.statusCounts.validacao +
        item.statusCounts.pendente +
        item.statusCounts.finalizado,
    }));

    updateCharts();
  } catch (error) {
    console.error('Erro ao carregar dados de Q.A.:', error);
    $q.notify({
      color: 'negative',
      message: 'Erro ao carregar os dados.',
      icon: 'warning',
    });
  } finally {
    loading.value = false;
  }
}

// Recarregar ao mudar filtros
watch([selectedMonth, selectedYear], loadData);

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.summary-card {
  border-left: 4px solid;
}
.border-left-purple {
  border-left-color: #9c27b0;
}
.border-left-teal {
  border-left-color: #009688;
}
.border-left-green {
  border-left-color: #4caf50;
}
.border-left-orange {
  border-left-color: #ff9800;
}

.chart-container {
  height: 300px;
}
</style>
