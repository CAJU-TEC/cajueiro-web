<template>
  <q-page class="development-report">
    <div class="page-container">
      <!-- Header com filtros -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">Relatório de Desempenho</h1>
            <p class="page-subtitle">Desenvolvimento</p>
          </div>

          <div class="filters-section">
            <q-icon name="event" color="primary" size="20px" class="q-mr-sm" />
            <q-select
              v-model="selectedMonth"
              :options="monthOptions"
              map-options
              emit-value
              outlined
              dense
              class="filter-select"
            />
            <q-select
              v-model="selectedYear"
              :options="years"
              outlined
              dense
              class="filter-select"
            />
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <q-inner-loading :showing="loading" color="primary">
        <q-spinner-gears size="50px" />
      </q-inner-loading>

      <!-- Content -->
      <transition name="fade">
        <div v-if="!loading" class="content-wrapper">
          <!-- Cards de métricas -->
          <div class="metrics-grid">
            <div class="metric-card blue">
              <div class="metric-icon">
                <q-icon name="assignment" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Total de Protocolos</span>
                <span class="metric-value">{{ totalProtocolosQuantidade }}</span>
              </div>
            </div>

            <div class="metric-card teal">
              <div class="metric-icon">
                <q-icon name="group" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Colaboradores</span>
                <span class="metric-value">{{ dadosQuantidade.length }}</span>
              </div>
            </div>

            <div class="metric-card purple">
              <div class="metric-icon">
                <q-icon name="schedule" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Tempo Médio</span>
                <span class="metric-value">{{ tempoMedioGeral }}</span>
              </div>
            </div>

            <div class="metric-card orange">
              <div class="metric-icon">
                <q-icon name="speed" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Média por Dev</span>
                <span class="metric-value">{{ mediaProtocolosPorColaborador }}</span>
              </div>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="charts-grid">
            <q-card class="chart-card">
              <q-card-section>
                <div class="chart-header">
                  <h3 class="chart-title">Protocolos por Colaborador</h3>
                  <q-badge color="primary" :label="`${dadosQuantidade.length} devs`" />
                </div>
                <div class="chart-wrapper">
                  <apexchart
                    v-if="dadosQuantidade.length > 0"
                    type="bar"
                    height="280"
                    :options="quantidadeChartOptions"
                    :series="quantidadeChartSeries"
                  />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="chart-card">
              <q-card-section>
                <div class="chart-header">
                  <h3 class="chart-title">Distribuição</h3>
                  <q-badge color="secondary" label="%" />
                </div>
                <div class="chart-wrapper">
                  <apexchart
                    v-if="dadosQuantidade.length > 0"
                    type="pie"
                    height="280"
                    :key="`pie-${dadosQuantidade.length}`"
                    :options="distribuicaoChartOptions"
                    :series="distribuicaoChartSeries"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Tabelas -->
          <div class="tables-grid">
            <q-card class="table-card">
              <q-card-section>
                <div class="table-header">
                  <h3 class="table-title">Desempenho por Quantidade</h3>
                  <q-chip
                    color="primary"
                    text-color="white"
                    icon="analytics"
                    :label="`${totalProtocolosQuantidade} total`"
                  />
                </div>
                <q-table
                  :rows="dadosQuantidade"
                  :columns="colunasQuantidade"
                  row-key="colaborador"
                  flat
                  :pagination="{ rowsPerPage: 10 }"
                  class="modern-table"
                >
                  <template #body-cell-colaborador="props">
                    <q-td :props="props">
                      <div class="colaborador-cell">
                        <q-avatar size="28px" color="primary" text-color="white">
                          {{ getInitials(props.row.colaborador) }}
                        </q-avatar>
                        <span class="colaborador-name">{{ props.row.colaborador }}</span>
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
                      <div class="percentual-cell">
                        <q-linear-progress
                          :value="props.row.percentual / 100"
                          color="teal"
                          size="8px"
                          rounded
                        />
                        <span class="percentual-text">{{ props.row.percentual }}%</span>
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-produtividade="props">
                    <q-td :props="props">
                      <q-chip
                        :color="getProdutividadeColor(props.row.produtividade)"
                        text-color="white"
                        :icon="getProdutividadeIcon(props.row.produtividade)"
                        size="sm"
                      >
                        {{ props.row.produtividade }}
                      </q-chip>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>

            <q-card class="table-card">
              <q-card-section>
                <div class="table-header">
                  <h3 class="table-title">Tempo de Execução</h3>
                  <q-chip
                    color="purple"
                    text-color="white"
                    icon="timer"
                    :label="tempoMedioGeral"
                  />
                </div>
                <q-table
                  :rows="dadosTempo"
                  :columns="colunasTempo"
                  row-key="colaborador"
                  flat
                  :pagination="{ rowsPerPage: 10 }"
                  class="modern-table"
                >
                  <template #body-cell-colaborador="props">
                    <q-td :props="props">
                      <div class="colaborador-cell">
                        <q-avatar size="28px" color="primary" text-color="white">
                          {{ getInitials(props.row.colaborador) }}
                        </q-avatar>
                        <span class="colaborador-name">{{ props.row.colaborador }}</span>
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
        </div>
      </transition>
    </div>
  </q-page>
</template>

<script>
import { onMounted } from 'vue';
import { useDevelopmentReport } from 'src/composables/useDevelopmentReport';
import { useChartConfigs } from 'src/composables/useChartConfigs';

export default {
  name: 'DevelopmentReport',

  setup() {
    const {
      selectedMonth,
      selectedYear,
      loading,
      dadosQuantidade,
      dadosTempo,
      monthOptions,
      years,
      totalProtocolosQuantidade,
      mediaProtocolosPorColaborador,
      tempoMedioGeral,
      loadData,
      getInitials,
      getProdutividadeColor,
      getProdutividadeIcon,
    } = useDevelopmentReport();

    const {
      quantidadeChartOptions,
      quantidadeChartSeries,
      distribuicaoChartOptions,
      distribuicaoChartSeries,
    } = useChartConfigs(dadosQuantidade);

    const colunasQuantidade = [
      { name: 'colaborador', label: 'Colaborador', field: 'colaborador', align: 'left' },
      { name: 'quantidade', label: 'Qtd.', field: 'quantidade', align: 'center' },
      { name: 'percentual', label: 'Participação', field: 'percentual', align: 'left' },
      { name: 'produtividade', label: 'Produtividade', field: 'produtividade', align: 'center' },
    ];

    const colunasTempo = [
      { name: 'colaborador', label: 'Colaborador', field: 'colaborador', align: 'left' },
      { name: 'tempoMedio', label: 'Tempo Médio', field: 'tempoMedio', align: 'center' },
      { name: 'quantidade', label: 'Qtd.', field: 'quantidade', align: 'center' },
    ];

    onMounted(loadData);

    return {
      selectedMonth,
      selectedYear,
      loading,
      dadosQuantidade,
      dadosTempo,
      monthOptions,
      years,
      colunasQuantidade,
      colunasTempo,
      totalProtocolosQuantidade,
      mediaProtocolosPorColaborador,
      tempoMedioGeral,
      quantidadeChartOptions,
      quantidadeChartSeries,
      distribuicaoChartOptions,
      distribuicaoChartSeries,
      getInitials,
      getProdutividadeColor,
      getProdutividadeIcon,
    };
  },
};
</script>

<style scoped>
.development-report {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  min-height: 100vh;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Header */
.header-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.title-section {
  flex: 1;
  min-width: 250px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 0.95rem;
  color: #7f8c8d;
  margin: 0;
}

.filters-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-select {
  min-width: 140px;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.metric-card.blue::before { background: #2196F3; }
.metric-card.teal::before { background: #009688; }
.metric-card.purple::before { background: #9C27B0; }
.metric-card.orange::before { background: #FF9800; }

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-card.blue .metric-icon { background: #e3f2fd; color: #2196F3; }
.metric-card.teal .metric-icon { background: #e0f2f1; color: #009688; }
.metric-card.purple .metric-icon { background: #f3e5f5; color: #9C27B0; }
.metric-card.orange .metric-icon { background: #fff3e0; color: #FF9800; }

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
}

.metric-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.chart-wrapper {
  min-height: 280px;
}

/* Tables Grid */
.tables-grid {
  display: grid;
  gap: 1.5rem;
}

.table-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.table-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
}

.modern-table :deep(thead tr) {
  background: #f8f9fa;
}

.modern-table :deep(thead th) {
  font-weight: 600;
  color: #5a6c7d;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modern-table :deep(tbody tr) {
  transition: background 0.2s;
}

.modern-table :deep(tbody tr:hover) {
  background: #f8f9fa;
}

.colaborador-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.colaborador-name {
  font-weight: 500;
  color: #2c3e50;
}

.percentual-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.percentual-cell .q-linear-progress {
  flex: 1;
  max-width: 100px;
}

.percentual-text {
  font-weight: 500;
  color: #2c3e50;
  min-width: 45px;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-section {
    justify-content: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .metric-card {
    padding: 1rem;
  }

  .metric-icon {
    width: 48px;
    height: 48px;
  }

  .metric-value {
    font-size: 1.5rem;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-wrapper {
    min-height: 240px;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    flex-direction: row;
  }
}
</style>
