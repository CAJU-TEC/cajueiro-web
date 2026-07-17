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
                <span class="metric-value">{{
                  totalProtocolosQuantidade
                }}</span>
                <div class="metric-breakdown">
                  <span class="breakdown-item">
                    <q-icon name="check_circle" size="14px" color="green-6" />
                    Externos: {{ totalExternos }}
                  </span>
                  <span class="breakdown-item">
                    <q-icon name="home" size="14px" color="blue-6" />
                    Internos: {{ totalInternos }}
                  </span>
                </div>
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

            <!-- <div class="metric-card purple">
              <div class="metric-icon">
                <q-icon name="schedule" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Tempo Médio</span>
                <span class="metric-value">{{ tempoMedioGeral }}</span>
              </div>
            </div> -->

            <div class="metric-card orange">
              <div class="metric-icon">
                <q-icon name="speed" size="32px" />
              </div>
              <div class="metric-content">
                <span class="metric-label">Média por Dev</span>
                <span class="metric-value">{{
                  mediaProtocolosPorColaborador
                }}</span>
              </div>
            </div>
          </div>

          <!-- Gráficos -->
          <div class="charts-grid">
            <q-card class="chart-card">
              <q-card-section>
                <div class="chart-header">
                  <h3 class="chart-title">Protocolos por Colaborador</h3>
                  <q-badge
                    color="primary"
                    :label="`${dadosQuantidade.length} devs`"
                  />
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
                  :pagination="{
                    rowsPerPage: 10,
                    sortBy: 'performance',
                    descending: true,
                  }"
                  class="modern-table"
                >
                  <template #body-cell-colaborador="props">
                    <q-td :props="props">
                      <div class="colaborador-cell-clean">
                        <q-avatar size="36px" class="colaborador-avatar">
                          <img v-if="false" src="" alt="" />
                          <span class="avatar-initials">{{
                            getInitials(props.row.colaborador)
                          }}</span>
                        </q-avatar>
                        <span class="colaborador-name-clean">{{
                          props.row.colaborador
                        }}</span>
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-quantidade="props">
                    <q-td :props="props">
                      <div class="quantidade-cell-clean">
                        <span class="quantidade-number">{{
                          props.row.quantidade
                        }}</span>
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-tickets_breakdown="props">
                    <q-td :props="props">
                      <div class="breakdown-cell-clean">
                        <div class="breakdown-box ext">
                          <span class="breakdown-value">{{
                            props.row.externos
                          }}</span>
                          <span class="breakdown-label-clean">Ext</span>
                        </div>
                        <div class="breakdown-box int">
                          <span class="breakdown-value">{{
                            props.row.internos
                          }}</span>
                          <span class="breakdown-label-clean">Int</span>
                        </div>
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-percentual="props">
                    <q-td :props="props">
                      <div class="percentual-cell">
                        <q-linear-progress
                          :value="props.row.percentual / 100"
                          color="teal"
                          size="10px"
                          rounded
                          class="percentual-progress"
                        />
                        <span class="percentual-text"
                          >{{ props.row.percentual }}%</span
                        >
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-impacto_medio="props">
                    <q-td :props="props">
                      <div
                        class="impacto-cell-clean"
                        :class="`impacto-${props.row.descricao_impacto.toLowerCase()}`"
                      >
                        <span class="impacto-text">{{
                          props.row.descricao_impacto
                        }}</span>
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>

            <!-- Protocolos finalizados sem pendência -->
            <q-card class="table-card">
              <q-card-section>
                <div class="table-header">
                  <h3 class="table-title">Protocolos sem Pendência</h3>
                  <q-chip
                    color="green"
                    text-color="white"
                    icon="task_alt"
                    :label="`${protocolosSemPendencia.length} finalizados`"
                  />
                </div>
                <q-table
                  :rows="protocolosSemPendencia"
                  :columns="colunasSemPendencia"
                  :loading="loadingSemPendencia"
                  row-key="codigo"
                  flat
                  :pagination="{ rowsPerPage: 10 }"
                  class="modern-table"
                >
                  <template #body-cell-codigo="props">
                    <q-td :props="props">
                      <span class="codigo-badge">#{{ props.row.codigo }}</span>
                    </q-td>
                  </template>
                  <template #body-cell-protocolo="props">
                    <q-td :props="props">
                      <div class="protocolo-cell">
                        <q-icon
                          v-if="props.row.dufy"
                          name="fiber_manual_record"
                          color="green"
                          size="12px"
                          class="dufy-dot"
                        >
                          <q-tooltip>Plantão (Dufy)</q-tooltip>
                        </q-icon>
                        <span>{{ props.row.protocolo }}</span>
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-colaborador="props">
                    <q-td :props="props">
                      <div class="colaborador-cell-clean">
                        <q-avatar size="36px" class="colaborador-avatar">
                          <span class="avatar-initials">{{
                            getInitials(props.row.colaborador)
                          }}</span>
                        </q-avatar>
                        <span class="colaborador-name-clean">{{
                          props.row.colaborador
                        }}</span>
                      </div>
                    </q-td>
                  </template>
                  <template #body-cell-tempoExecucao="props">
                    <q-td :props="props">
                      <q-badge
                        v-if="props.row.tempoExecucao !== null"
                        color="teal"
                        :label="formatDuracao(props.row.tempoExecucao)"
                      />
                      <span v-else class="tempo-vazio">—</span>
                    </q-td>
                  </template>
                  <template #body-cell-tempoVida="props">
                    <q-td :props="props">
                      <q-badge
                        color="indigo"
                        :label="formatDuracao(props.row.tempoVida)"
                      />
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>

            <!-- <q-card class="table-card">
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
            </q-card> -->
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
      protocolosSemPendencia,
      loadingSemPendencia,
      loadProtocolosSemPendencia,
      monthOptions,
      years,
      totalProtocolosQuantidade,
      totalExternos,
      totalInternos,
      mediaProtocolosPorColaborador,
      tempoMedioGeral,
      loadData,
      formatDuracao,
      getInitials,
      getProdutividadeColor,
      getProdutividadeIcon,
      getAvaliacaoImpactoColor,
      getAvaliacaoImpactoIcon,
      getDescricaoImpacto,
      getPerformanceColor,
      getPerformanceIcon,
    } = useDevelopmentReport();

    const {
      quantidadeChartOptions,
      quantidadeChartSeries,
      distribuicaoChartOptions,
      distribuicaoChartSeries,
    } = useChartConfigs(dadosQuantidade);

    const colunasQuantidade = [
      {
        name: 'colaborador',
        label: 'Colaborador',
        field: 'colaborador',
        align: 'left',
        sortable: true,
      },
      {
        name: 'quantidade',
        label: 'Total',
        field: 'quantidade',
        align: 'center',
        sortable: true,
      },
      {
        name: 'tickets_breakdown',
        label: 'Externos / Internos',
        field: 'externos',
        align: 'center',
      },
      {
        name: 'impacto_medio',
        label: 'Impacto Médio',
        field: 'descricao_impacto',
        align: 'center',
        sortable: true,
      },
      {
        name: 'percentual',
        label: 'Participação',
        field: 'percentual',
        align: 'center',
        sortable: true,
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
      {
        name: 'quantidade',
        label: 'Qtd.',
        field: 'quantidade',
        align: 'center',
      },
    ];

    const colunasSemPendencia = [
      {
        name: 'codigo',
        label: 'Código',
        field: 'codigo',
        align: 'center',
        sortable: true,
      },
      {
        name: 'protocolo',
        label: 'Protocolo',
        field: 'protocolo',
        align: 'left',
        sortable: true,
      },
      {
        name: 'colaborador',
        label: 'Colaborador',
        field: 'colaborador',
        align: 'left',
        sortable: true,
      },
      {
        name: 'tempoExecucao',
        label: 'Tempo de Execução',
        field: 'tempoExecucao',
        align: 'center',
        sortable: true,
      },
      {
        name: 'tempoVida',
        label: 'Tempo de Vida',
        field: 'tempoVida',
        align: 'center',
        sortable: true,
      },
    ];

    onMounted(loadData);
    onMounted(loadProtocolosSemPendencia);

    return {
      selectedMonth,
      selectedYear,
      loading,
      dadosQuantidade,
      dadosTempo,
      protocolosSemPendencia,
      loadingSemPendencia,
      monthOptions,
      years,
      colunasQuantidade,
      colunasTempo,
      colunasSemPendencia,
      totalProtocolosQuantidade,
      totalExternos,
      totalInternos,
      mediaProtocolosPorColaborador,
      tempoMedioGeral,
      quantidadeChartOptions,
      quantidadeChartSeries,
      distribuicaoChartOptions,
      distribuicaoChartSeries,
      formatDuracao,
      getInitials,
      getProdutividadeColor,
      getProdutividadeIcon,
      getAvaliacaoImpactoColor,
      getAvaliacaoImpactoIcon,
      getDescricaoImpacto,
      getPerformanceColor,
      getPerformanceIcon,
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

.metric-card.blue::before {
  background: #2196f3;
}
.metric-card.teal::before {
  background: #009688;
}
.metric-card.purple::before {
  background: #9c27b0;
}
.metric-card.orange::before {
  background: #ff9800;
}

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

.metric-card.blue .metric-icon {
  background: #e3f2fd;
  color: #2196f3;
}
.metric-card.teal .metric-icon {
  background: #e0f2f1;
  color: #009688;
}
.metric-card.purple .metric-icon {
  background: #f3e5f5;
  color: #9c27b0;
}
.metric-card.orange .metric-icon {
  background: #fff3e0;
  color: #ff9800;
}

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

.metric-breakdown {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #5a6c7d;
  font-weight: 500;
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
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.quantidade-cell {
  display: flex;
  justify-content: center;
}

.quantidade-badge {
  font-size: 0.9rem;
  font-weight: 700;
  padding: 6px 12px;
}

.breakdown-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.breakdown-item-compact {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.breakdown-badge {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 8px;
  min-width: 28px;
}

.breakdown-label {
  font-size: 0.7rem;
  color: #7f8c8d;
  font-weight: 500;
  text-transform: uppercase;
}

.breakdown-separator {
  color: #bdc3c7;
  font-weight: 300;
  font-size: 1.1rem;
}

/* Clean cells */
.colaborador-cell-clean {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.colaborador-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
}

.avatar-initials {
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
}

.colaborador-name-clean {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.quantidade-cell-clean {
  display: flex;
  justify-content: center;
}

.quantidade-number {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  background: #f0f4f8;
  padding: 6px 14px;
  border-radius: 8px;
  min-width: 42px;
  text-align: center;
}

.codigo-badge {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2c3e50;
  background: #eef2f7;
  padding: 4px 10px;
  border-radius: 6px;
}

.protocolo-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dufy-dot {
  flex-shrink: 0;
}

.tempo-vazio {
  color: #b0bec5;
  font-weight: 600;
}

.breakdown-cell-clean {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.breakdown-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  min-width: 48px;
}

.breakdown-box.ext {
  background: #e8f5e9;
}

.breakdown-box.int {
  background: #e3f2fd;
}

.breakdown-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.breakdown-label-clean {
  font-size: 0.65rem;
  color: #7f8c8d;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

.impacto-cell-clean {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: capitalize;
}

.impacto-cell-clean.impacto-baixo {
  background: #fff3e0;
  color: #ef6c00;
}

.impacto-cell-clean.impacto-médio {
  background: #fff9c4;
  color: #f57f17;
}

.impacto-cell-clean.impacto-alto {
  background: #ffebee;
  color: #c62828;
}

.impacto-cell-clean.impacto-crítico {
  background: #f3e5f5;
  color: #6a1b9a;
}

.tooltip-clean {
  font-size: 0.85rem;
  background: #2c3e50;
  padding: 8px 12px;
  border-radius: 6px;
}

.tooltip-subtitle {
  font-size: 0.75rem;
  color: #95a5a6;
}

.percentual-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
}

.percentual-progress {
  flex: 1;
  max-width: 80px;
}

.percentual-text {
  font-weight: 600;
  color: #2c3e50;
  min-width: 45px;
  font-size: 0.85rem;
}

.impacto-badge {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 10px;
  display: flex;
  align-items: center;
}

.impacto-badge-descricao {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 6px 14px;
  text-transform: capitalize;
  letter-spacing: 0.3px;
  cursor: help;
  transition: transform 0.2s;
}

.impacto-badge-descricao:hover {
  transform: scale(1.05);
}

.avaliacao-chip {
  font-weight: 600;
  min-width: 90px;
  justify-content: center;
}

.pontos-badge {
  font-size: 0.9rem;
  font-weight: 700;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  cursor: help;
}

.performance-chip {
  font-weight: 700;
  min-width: 100px;
  justify-content: center;
  font-size: 0.85rem;
  padding: 8px 12px;
  cursor: help;
  transition: transform 0.2s, box-shadow 0.2s;
}

.performance-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
