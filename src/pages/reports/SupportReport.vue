<template>
  <q-page class="support-report">
    <div class="page-container">
      <!-- Header com filtros -->
      <div class="header-section">
        <div class="header-content">
          <div class="title-section">
            <h1 class="page-title">Relatório de Desempenho</h1>
            <p class="page-subtitle">Suporte</p>
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
                <q-icon name="description" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Total de Protocolos</span>
                <span class="metric-value">{{ totalTickets }}</span>
              </div>
            </div>

            <div class="metric-card green">
              <div class="metric-icon">
                <q-icon name="people" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Clientes Atendidos</span>
                <span class="metric-value">{{ totalClients }}</span>
              </div>
            </div>

            <div class="metric-card purple">
              <div class="metric-icon">
                <q-icon name="flight_takeoff" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Externos</span>
                <span class="metric-value">{{ totalExternal }}</span>
              </div>
            </div>

            <div class="metric-card orange">
              <div class="metric-icon">
                <q-icon name="business" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Internos</span>
                <span class="metric-value">{{ totalInternal }}</span>
              </div>
            </div>
          </div>

          <!-- Protocolos por Colaborador -->
          <q-card class="section-card">
            <q-card-section>
              <div class="section-header">
                <div class="section-title-group">
                  <q-icon name="people" color="primary" size="28px" />
                  <h3 class="section-title">Protocolos por Colaborador</h3>
                </div>
                <q-badge color="primary" :label="`${ticketsByCollaborator.length} colaboradores`" />
              </div>

              <div class="chart-wrapper q-mb-md">
                <apexchart
                  v-if="ticketsByCollaborator.length > 0"
                  type="bar"
                  height="280"
                  :options="collaboratorChartOptions"
                  :series="collaboratorChartSeries"
                />
              </div>

              <q-table
                :rows="ticketsByCollaborator"
                :columns="collaboratorColumns"
                row-key="nome"
                flat
                :pagination="{ rowsPerPage: 10 }"
                class="modern-table"
              >
                <template #body-cell-position="props">
                  <q-td :props="props">
                    <q-badge
                      rounded
                      color="primary"
                      :label="props.rowIndex + 1"
                      class="position-badge"
                    />
                  </q-td>
                </template>
                <template #body-cell-nome="props">
                  <q-td :props="props">
                    <div class="colaborador-cell">
                      <q-avatar size="28px" color="primary" text-color="white">
                        {{ getInitials(props.row.nome) }}
                      </q-avatar>
                      <span class="colaborador-name">{{ props.row.nome }}</span>
                    </div>
                  </q-td>
                </template>
                <template #body-cell-total="props">
                  <q-td :props="props">
                    <q-badge color="blue" :label="props.row.total" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- Protocolos por Cliente -->
          <q-card class="section-card">
            <q-card-section>
              <div class="section-header">
                <div class="section-title-group">
                  <q-icon name="description" color="positive" size="28px" />
                  <h3 class="section-title">Protocolos por Cliente</h3>
                </div>
                <q-badge color="positive" :label="`${totalClients} clientes`" />
              </div>

              <!-- Gráficos de pizza -->
              <div class="pie-charts-grid q-mb-md">
                <div class="pie-chart-wrapper">
                  <h4 class="chart-subtitle">Externos vs Internos</h4>
                  <apexchart
                    v-if="totalExternal > 0 || totalInternal > 0"
                    type="pie"
                    height="280"
                    :key="`external-${totalExternal}-${totalInternal}`"
                    :options="externalInternalChartOptions"
                    :series="externalInternalChartSeries"
                  />
                </div>

                <div class="pie-chart-wrapper">
                  <h4 class="chart-subtitle">Mobile vs Web</h4>
                  <apexchart
                    v-if="totalMobile > 0 || totalWeb > 0"
                    type="pie"
                    height="280"
                    :key="`platform-${totalMobile}-${totalWeb}`"
                    :options="platformChartOptions"
                    :series="platformChartSeries"
                  />
                </div>
              </div>

              <!-- Tabela de clientes -->
              <q-table
                :rows="ticketsByClient"
                :columns="clientColumns"
                row-key="cliente"
                flat
                :pagination="{ rowsPerPage: 10 }"
                class="modern-table"
              >
                <template #body-cell-cliente="props">
                  <q-td :props="props">
                    <div class="client-cell">
                      <q-icon name="business" color="grey-6" size="20px" />
                      <span class="client-name">{{ props.row.cliente }}</span>
                    </div>
                  </q-td>
                </template>
                <template #body-cell-externos="props">
                  <q-td :props="props">
                    <q-badge color="purple" :label="props.row.externos" />
                  </q-td>
                </template>
                <template #body-cell-internos="props">
                  <q-td :props="props">
                    <q-badge color="orange" :label="props.row.internos" />
                  </q-td>
                </template>
                <template #body-cell-mobile="props">
                  <q-td :props="props">
                    <q-badge color="primary" :label="props.row.mobile" />
                  </q-td>
                </template>
                <template #body-cell-web="props">
                  <q-td :props="props">
                    <q-badge color="positive" :label="props.row.web" />
                  </q-td>
                </template>
                <template #body-cell-total="props">
                  <q-td :props="props">
                    <q-badge color="blue" :label="props.row.total" />
                  </q-td>
                </template>
                <template #bottom-row>
                  <q-tr class="total-row">
                    <q-td class="text-weight-bold">TOTAL GERAL</q-td>
                    <q-td class="text-center">
                      <q-badge color="purple" :label="totalExternal" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="orange" :label="totalInternal" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="primary" :label="totalMobile" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="positive" :label="totalWeb" />
                    </q-td>
                    <q-td class="text-center">
                      <q-badge color="blue" :label="totalTickets" />
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
import { useSupportReport } from 'src/composables/useSupportReport';
import { useSupportCharts } from 'src/composables/useSupportCharts';

export default {
  name: 'SupportReport',

  setup() {
    const {
      selectedMonth,
      selectedYear,
      loading,
      ticketsByCollaborator,
      ticketsByClient,
      monthOptions,
      years,
      totalTickets,
      totalClients,
      totalExternal,
      totalInternal,
      totalMobile,
      totalWeb,
      loadData,
    } = useSupportReport();

    const {
      collaboratorChartOptions,
      collaboratorChartSeries,
      externalInternalChartOptions,
      externalInternalChartSeries,
      platformChartOptions,
      platformChartSeries,
    } = useSupportCharts(
      ticketsByCollaborator,
      totalExternal,
      totalInternal,
      totalMobile,
      totalWeb
    );

    const collaboratorColumns = [
      { name: 'position', label: 'Posição', field: 'position', align: 'center' },
      { name: 'nome', label: 'Colaborador', field: 'nome', align: 'left' },
      { name: 'total', label: 'Total', field: 'total', align: 'center' },
    ];

    const clientColumns = [
      { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left' },
      { name: 'externos', label: 'Externos', field: 'externos', align: 'center' },
      { name: 'internos', label: 'Internos', field: 'internos', align: 'center' },
      { name: 'mobile', label: 'Mobile', field: 'mobile', align: 'center' },
      { name: 'web', label: 'Web', field: 'web', align: 'center' },
      { name: 'total', label: 'Total', field: 'total', align: 'center' },
    ];

    function getInitials(name) {
      if (!name) return '';
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    onMounted(loadData);

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
      collaboratorChartOptions,
      collaboratorChartSeries,
      externalInternalChartOptions,
      externalInternalChartSeries,
      platformChartOptions,
      platformChartSeries,
      getInitials,
    };
  },
};
</script>

<style scoped>
.support-report {
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

.metric-card.blue::before { background: #1976D2; }
.metric-card.green::before { background: #4CAF50; }
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

.metric-card.blue .metric-icon { background: #e3f2fd; color: #1976D2; }
.metric-card.green .metric-icon { background: #e8f5e9; color: #4CAF50; }
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

/* Section Cards */
.section-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

/* Charts */
.chart-wrapper {
  min-height: 280px;
  margin-bottom: 1rem;
}

.pie-charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.pie-chart-wrapper {
  text-align: center;
}

.chart-subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: #5a6c7d;
  margin: 0 0 1rem 0;
}

/* Tables */
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

.position-badge {
  font-weight: 600;
  padding: 6px 10px;
}

.colaborador-cell,
.client-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.colaborador-name,
.client-name {
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

  .pie-charts-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
