<template>
  <q-page class="qa-report">
    <div class="page-container">
      <!-- Header com filtros -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">Relatório de Desempenho</h1>
            <p class="page-subtitle">Q.A.</p>
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
            <div class="metric-card purple">
              <div class="metric-icon">
                <q-icon name="description" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Total de Protocolos</span>
                <span class="metric-value">{{ totalProtocolos }}</span>
              </div>
            </div>

            <div class="metric-card teal">
              <div class="metric-icon">
                <q-icon name="people" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Q.A. Ativos</span>
                <span class="metric-value">{{ ticketsByQa.length }}</span>
              </div>
            </div>

            <div class="metric-card green">
              <div class="metric-icon">
                <q-icon name="check_circle" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Finalizados</span>
                <span class="metric-value">{{ totalFinalizados }}</span>
              </div>
            </div>

            <div class="metric-card orange">
              <div class="metric-icon">
                <q-icon name="hourglass_empty" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Pendentes</span>
                <span class="metric-value">{{ totalPendentes }}</span>
              </div>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="charts-grid">
            <q-card class="chart-card">
              <q-card-section>
                <div class="chart-header">
                  <h3 class="chart-title">Protocolos por Q.A.</h3>
                  <q-badge color="purple" :label="`${ticketsByQa.length} analistas`" />
                </div>
                <div class="chart-wrapper">
                  <apexchart
                    v-if="ticketsByQa.length > 0"
                    type="bar"
                    height="280"
                    :options="qaChartOptions"
                    :series="qaChartSeries"
                  />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="chart-card">
              <q-card-section>
                <div class="chart-header">
                  <h3 class="chart-title">Status dos Protocolos</h3>
                  <q-badge color="secondary" label="Distribuição" />
                </div>
                <div class="chart-wrapper">
                  <apexchart
                    v-if="totalProtocolos > 0"
                    type="pie"
                    height="280"
                    :key="`status-${totalTeste}-${totalValidacao}-${totalPendentes}-${totalFinalizados}`"
                    :options="statusChartOptions"
                    :series="statusChartSeries"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Tabela -->
          <q-card class="table-card">
            <q-card-section>
              <div class="table-header">
                <h3 class="table-title">Detalhamento por Analista de Q.A.</h3>
                <q-chip
                  color="purple"
                  text-color="white"
                  icon="analytics"
                  :label="`${totalProtocolos} total`"
                />
              </div>

              <q-table
                :rows="ticketsByQa"
                :columns="qaColumns"
                row-key="qaName"
                flat
                :pagination="{ rowsPerPage: 10 }"
                class="modern-table"
              >
                <template #body-cell-qaName="props">
                  <q-td :props="props">
                    <div class="colaborador-cell">
                      <q-avatar size="28px" color="purple" text-color="white">
                        {{ getInitials(props.row.qaName) }}
                      </q-avatar>
                      <span class="colaborador-name">{{ props.row.qaName }}</span>
                    </div>
                  </q-td>
                </template>

                <template #body-cell-teste="props">
                  <q-td :props="props">
                    <q-badge color="blue" :label="props.row.teste" />
                  </q-td>
                </template>

                <template #body-cell-validacao="props">
                  <q-td :props="props">
                    <q-badge color="teal" :label="props.row.validacao" />
                  </q-td>
                </template>

                <template #body-cell-pendente="props">
                  <q-td :props="props">
                    <q-badge color="orange" :label="props.row.pendente" />
                  </q-td>
                </template>

                <template #body-cell-finalizado="props">
                  <q-td :props="props">
                    <q-badge color="green" :label="props.row.finalizado" />
                  </q-td>
                </template>

                <template #body-cell-total="props">
                  <q-td :props="props">
                    <q-badge color="purple" :label="props.row.total" />
                  </q-td>
                </template>

                <template #bottom-row>
                  <q-tr class="total-row">
                    <q-td class="text-weight-bold">TOTAL GERAL</q-td>
                    <q-td class="text-center">
                      <q-badge color="blue" :label="totalTeste" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="teal" :label="totalValidacao" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="orange" :label="totalPendentes" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="green" :label="totalFinalizados" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="purple" :label="totalProtocolos" />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </transition>
    </div>
  </q-page>
</template>

<script>
import { onMounted } from 'vue';
import { useQAReport } from 'src/composables/useQAReport';
import { useQACharts } from 'src/composables/useQACharts';

export default {
  name: 'QAReport',

  setup() {
    const {
      selectedMonth,
      selectedYear,
      loading,
      ticketsByQa,
      monthOptions,
      years,
      totalTeste,
      totalValidacao,
      totalPendentes,
      totalFinalizados,
      totalProtocolos,
      loadData,
      getInitials,
    } = useQAReport();

    const {
      qaChartOptions,
      qaChartSeries,
      statusChartOptions,
      statusChartSeries,
    } = useQACharts(
      ticketsByQa,
      totalTeste,
      totalValidacao,
      totalPendentes,
      totalFinalizados
    );

    const qaColumns = [
      { name: 'qaName', label: 'Analista de Q.A.', field: 'qaName', align: 'left' },
      { name: 'teste', label: 'Em Teste', field: 'teste', align: 'center' },
      { name: 'validacao', label: 'Em Validação', field: 'validacao', align: 'center' },
      { name: 'pendente', label: 'Pendentes', field: 'pendente', align: 'center' },
      { name: 'finalizado', label: 'Finalizados', field: 'finalizado', align: 'center' },
      { name: 'total', label: 'Total', field: 'total', align: 'center' },
    ];

    onMounted(loadData);

    return {
      selectedMonth,
      selectedYear,
      loading,
      ticketsByQa,
      monthOptions,
      years,
      qaColumns,
      totalTeste,
      totalValidacao,
      totalPendentes,
      totalFinalizados,
      totalProtocolos,
      qaChartOptions,
      qaChartSeries,
      statusChartOptions,
      statusChartSeries,
      getInitials,
    };
  },
};
</script>

<style scoped>
.qa-report {
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

.metric-card.purple::before { background: #9C27B0; }
.metric-card.teal::before { background: #009688; }
.metric-card.green::before { background: #4CAF50; }
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

.metric-card.purple .metric-icon { background: #f3e5f5; color: #9C27B0; }
.metric-card.teal .metric-icon { background: #e0f2f1; color: #009688; }
.metric-card.green .metric-icon { background: #e8f5e9; color: #4CAF50; }
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

/* Table */
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

.total-row {
  background: #f8f9fa;
  font-weight: 600;
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
