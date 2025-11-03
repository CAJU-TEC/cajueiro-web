<template>
  <q-page class="q-pa-md">
    <div class="q-pa-md" style="max-width: 1400px; margin: 0 auto">
      <!-- Header -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-h4 text-weight-bold text-grey-8">
                Relatório de Desempenho - Desenvolvimento
              </div>
              <div class="text-subtitle1 text-grey-6">
                Acompanhamento de protocolos e tempo de desenvolvimento
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
          <q-card class="summary-card border-left-blue">
            <q-card-section>
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-7 text-weight-medium">
                    Total de Protocolos
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ totalProtocolosQuantidade }}
                  </div>
                </div>
                <q-icon name="assignment" color="blue" size="40px" />
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
                    Colaboradores
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ dadosQuantidade.length }}
                  </div>
                </div>
                <q-icon name="person" color="teal" size="40px" />
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
                    Tempo Médio Geral
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ tempoMedioGeral }}
                  </div>
                </div>
                <q-icon name="schedule" color="purple" size="40px" />
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
                    Média por Dev
                  </div>
                  <div class="text-h4 text-weight-bold text-grey-8 q-mt-sm">
                    {{ mediaProtocolosPorColaborador }}
                  </div>
                </div>
                <q-icon name="speed" color="orange" size="40px" />
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
                Protocolos por Colaborador
              </div>
              <div class="chart-container">
                <apexchart
                  type="bar"
                  height="300"
                  :options="quantidadeChartOptions"
                  :series="quantidadeChartSeries"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
                Distribuição de Protocolos
              </div>

              <div class="chart-container">
                <apexchart
                  type="pie"
                  height="300"
                  :options="distribuicaoChartOptions"
                  :series="distribuicaoChartSeries"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Tabelas -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
            Desempenho por Quantidade
          </div>
          <q-table
            :rows="dadosQuantidade"
            :columns="colunasQuantidade"
            row-key="colaborador"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-colaborador="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-avatar
                    size="24px"
                    color="primary"
                    text-color="white"
                    class="q-mr-sm"
                  >
                    {{ getInitials(props.row.colaborador) }}
                  </q-avatar>
                  {{ props.row.colaborador }}
                </div>
              </q-td>
            </template>
            <template #body-cell-quantidade="props">
              <q-td :props="props">
                <q-badge color="blue" :label="props.row.quantidade" />
              </q-td>
            </template>
            <template #body-cell-percentual="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-linear-progress
                    :value="props.row.percentual / 100"
                    color="teal"
                    class="q-mr-sm"
                    style="width: 80px"
                    size="6px"
                  />
                  {{ props.row.percentual }}%
                </div>
              </q-td>
            </template>
            <template #body-cell-produtividade="props">
              <q-td :props="props">
                <q-chip
                  :color="getProdutividadeColor(props.row.produtividade)"
                  text-color="white"
                  :icon="getProdutividadeIcon(props.row.produtividade)"
                >
                  {{ props.row.produtividade }}
                </q-chip>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section>
          <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
            Desempenho por Tempo de Execução
          </div>
          <q-table
            :rows="dadosTempo"
            :columns="colunasTempo"
            row-key="colaborador"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
          >
            <template #body-cell-colaborador="props">
              <q-td :props="props">
                <div class="row items-center">
                  <q-avatar
                    size="24px"
                    color="primary"
                    text-color="white"
                    class="q-mr-sm"
                  >
                    {{ getInitials(props.row.colaborador) }}
                  </q-avatar>
                  {{ props.row.colaborador }}
                </div>
              </q-td>
            </template>
            <template #body-cell-tempoMedio="props">
              <q-td :props="props">
                <q-badge color="purple" :label="props.row.tempoMedio" />
              </q-td>
            </template>
            <template #body-cell-quantidade="props">
              <q-td :props="props">
                <q-badge color="indigo" :label="props.row.quantidade" />
              </q-td>
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

const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const loading = ref(false);

const dadosQuantidade = ref([]);
const dadosTempo = ref([]);

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

// Colunas
const colunasQuantidade = [
  {
    name: 'colaborador',
    label: 'Colaborador',
    field: 'colaborador',
    align: 'left',
  },
  { name: 'quantidade', label: 'Qtd.', field: 'quantidade', align: 'center' },
  { name: 'percentual', label: '%', field: 'percentual', align: 'left' },
  {
    name: 'produtividade',
    label: 'Produtividade',
    field: 'produtividade',
    align: 'center',
  },
];

const colunasTempo = [
  {
    name: 'colaborador',
    label: 'Colaborador',
    field: 'colaborador',
    align: 'left',
  },
  {
    name: 'tempoMedio',
    label: 'Tempo Médio',
    field: 'tempoMedio',
    align: 'center',
  },
  { name: 'quantidade', label: 'Qtd.', field: 'quantidade', align: 'center' },
];

// Opções de gráficos otimizadas
function updateCharts() {
  quantidadeChartOptions.value = {
    ...quantidadeChartOptions.value,
    xaxis: {
      categories: dadosQuantidade.value.map((item) => item.colaborador),
    },
  };
  quantidadeChartSeries.value = [
    {
      name: 'Protocolos',
      data: dadosQuantidade.value.map((item) => item.quantidade),
    },
  ];

  distribuicaoChartOptions.value = {
    ...distribuicaoChartOptions.value,
    labels: dadosQuantidade.value.map((item) => item.colaborador),
    // Gera um conjunto de cores suficientes para cada fatia do gráfico
    colors: generateColors(dadosQuantidade.value.length),
  };

  distribuicaoChartSeries.value = dadosQuantidade.value.map(
    (item) => item.quantidade
  );
}

// Gera cores HSL distintas com base na quantidade de itens.
// Retorna valores CSS (ex.: "hsl(120, 70%, 50%)") aceitos pelo ApexCharts.
function generateColors(count) {
  if (!count || count <= 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((i / count) * 360);
    const saturation = 68; // ajuste para paleta mais/menos vibrante
    const lightness = 48; // ajuste para mais/menos claro
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });
}

async function loadData() {
  loading.value = true;
  try {
    const params = { month: selectedMonth.value, year: selectedYear.value };

    const [quantidadeData, tempoData] = await Promise.all([
      reportsService.getDesempenhoQuantidade(params),
      reportsService.getDesempenhoTempoMedio(params),
    ]);

    const total = quantidadeData.reduce(
      (sum, item) => sum + item.quantidade,
      0
    );
    const media = total / quantidadeData.length || 0;

    dadosQuantidade.value = quantidadeData.map((item) => ({
      colaborador: item.colaborador,
      quantidade: item.quantidade,
      percentual: total ? ((item.quantidade / total) * 100).toFixed(1) : '0.0',
      produtividade: calcularProdutividade(item.quantidade, media),
    }));

    dadosTempo.value = tempoData.map((item) => ({
      colaborador: item.colaborador,
      tempoMedio: item.tempo_medio,
      quantidade: item.quantidade,
    }));

    updateCharts(); // ✅ atualiza gráficos de forma eficiente
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    $q.notify({
      color: 'negative',
      message: 'Erro ao carregar os dados.',
      icon: 'warning',
    });
  } finally {
    loading.value = false;
  }
}

// Computed
const totalProtocolosQuantidade = computed(() =>
  dadosQuantidade.value.reduce((sum, item) => sum + item.quantidade, 0)
);

const mediaProtocolosPorColaborador = computed(() => {
  const total = totalProtocolosQuantidade.value;
  const qtd = dadosQuantidade.value.length;
  return qtd > 0 ? Math.round(total / qtd) : 0;
});

const tempoMedioGeral = computed(() => {
  const totalDias = dadosTempo.value.reduce((sum, item) => {
    const dias = parseFloat(item.tempoMedio) || 0;
    return sum + dias * item.quantidade;
  }, 0);
  const totalProtocolos = dadosTempo.value.reduce(
    (sum, item) => sum + item.quantidade,
    0
  );
  return totalProtocolos > 0
    ? (totalDias / totalProtocolos).toFixed(1) + ' dias'
    : '0 dias';
});

// ... após years ...

// Gráficos - refs
const quantidadeChartOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 350 },
  },
  plotOptions: {
    bar: { borderRadius: 6, horizontal: false, columnWidth: '50%' },
  },
  xaxis: { categories: [] },
  colors: ['#2196F3'],
  dataLabels: { enabled: false },
  legend: { show: false },
  tooltip: { enabled: true, followCursor: false },
  grid: { show: true, strokeDashArray: 3 },
  responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
});

const quantidadeChartSeries = ref([{ name: 'Protocolos', data: [] }]);

const distribuicaoChartOptions = ref({
  chart: {
    type: 'pie',
    toolbar: { show: false },
    // animações leves para dar fluidez, sem exagerar no tempo
    animations: { enabled: true, easing: 'easeinout', speed: 300 },
  },
  labels: [],
  legend: { position: 'bottom', horizontalAlign: 'center' },
  dataLabels: {
    enabled: true,
    formatter: (val) => (val > 3 ? `${val.toFixed(1)}%` : ''),
  },
  tooltip: {
    enabled: true,
    y: {
      // Retorna apenas a quantidade para evitar repetir o nome do colaborador
      // (o nome já aparece via labels/legend do gráfico)
      formatter: (value) => `${value} protocolos`,
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: { chart: { width: 200 }, legend: { position: 'bottom' } },
    },
  ],
});

const distribuicaoChartSeries = ref([]);

// Helpers
function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getProdutividadeColor(produtividade) {
  return produtividade === 'Alta'
    ? 'green'
    : produtividade === 'Média'
      ? 'orange'
      : 'red';
}

function getProdutividadeIcon(produtividade) {
  return produtividade === 'Alta'
    ? 'trending_up'
    : produtividade === 'Média'
      ? 'remove'
      : 'trending_down';
}

function calcularProdutividade(quantidade, media) {
  if (quantidade >= media * 1.2) return 'Alta';
  if (quantidade >= media * 0.8) return 'Média';
  return 'Baixa';
}

const timeoutId = null;

// Atualiza charts sempre que os filtros mudam ou os dados são atualizados
watch([selectedMonth, selectedYear], loadData);
watch([dadosQuantidade, dadosTempo], updateCharts);

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.summary-card {
  border-left: 4px solid;
}
.border-left-blue {
  border-left-color: #2196f3;
}
.border-left-teal {
  border-left-color: #009688;
}
.border-left-purple {
  border-left-color: #9c27b0;
}
.border-left-orange {
  border-left-color: #ff9800;
}

.chart-container {
  height: 300px;
  position: relative;
}
</style>
