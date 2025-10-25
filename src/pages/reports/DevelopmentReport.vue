<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12" style="max-width: 1400px">
        <!-- Header Principal -->
        <q-card flat class="bg-primary text-white q-mb-lg">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between">
              <div class="col-12 col-md-8">
                <div class="row items-center q-mb-sm">
                  <q-icon name="code" size="48px" class="q-mr-md" />
                  <div>
                    <div class="text-h4 text-weight-bold">
                      Relatório de Acompanhamento de Desempenho
                    </div>
                    <div class="text-subtitle1 text-blue-2">
                      Desenvolvimento — {{ mesSelecionadoLabel }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4 text-right">
                <q-btn-dropdown
                  color="white"
                  text-color="primary"
                  icon="event"
                  :label="mesSelecionadoLabel || 'Escolha o mês'"
                  size="lg"
                  unelevated
                  class="text-weight-bold"
                >
                  <q-list>
                    <q-item
                      v-for="item in meses"
                      :key="item.value"
                      clickable
                      v-close-popup
                      @click="definirPeriodo(item.value)"
                      :active="mesSelecionado === item.value"
                      active-class="bg-primary text-white"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="
                            mesSelecionado === item.value
                              ? 'check_circle'
                              : 'calendar_month'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>

            <q-separator color="white" class="q-my-md" :dark="true" />

            <div class="text-body2 text-blue-1">
              Acompanhe o desempenho da equipe de desenvolvimento através de
              métricas detalhadas de protocolos realizados. Selecione o período
              desejado para visualizar os dados.
            </div>
          </q-card-section>
        </q-card>

        <!-- Seção 1: Desempenho Individual por Quantidade -->
        <q-card flat bordered class="shadow-2 q-mb-xl">
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon
                name="trending_up"
                size="28px"
                color="primary"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-weight-bold text-grey-9">
                  1. Desempenho Individual por Quantidade
                </div>
                <div class="text-caption text-grey-7">
                  Quantidade de protocolos únicos enviados para teste durante o
                  mês
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <!-- Loading State -->
            <div
              v-if="loadingQuantidade"
              class="column items-center text-center q-pa-xl"
            >
              <q-spinner-cube color="primary" size="5.5em" />
              <div class="text-body2 text-grey-7 q-mt-lg">
                Carregando dados de quantidade...
              </div>
            </div>

            <!-- Cards de Resumo -->
            <div v-else class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="bg-blue-1">
                  <q-card-section class="text-center q-pa-md">
                    <q-icon name="assignment" size="32px" color="blue-7" />
                    <div class="text-h5 text-weight-bold text-blue-9 q-mt-sm">
                      {{ totalProtocolosQuantidade }}
                    </div>
                    <div class="text-caption text-blue-8">
                      Total de Protocolos
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="bg-teal-1">
                  <q-card-section class="text-center q-pa-md">
                    <q-icon name="person" size="32px" color="teal-7" />
                    <div class="text-h5 text-weight-bold text-teal-9 q-mt-sm">
                      {{ dadosQuantidade.length }}
                    </div>
                    <div class="text-caption text-teal-8">Colaboradores</div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-sm-6 col-md-4">
                <q-card flat bordered class="bg-orange-1">
                  <q-card-section class="text-center q-pa-md">
                    <q-icon name="speed" size="32px" color="orange-7" />
                    <div class="text-h5 text-weight-bold text-orange-9 q-mt-sm">
                      {{ mediaProtocolosPorColaborador }}
                    </div>
                    <div class="text-caption text-orange-8">Média por Dev</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Tabela de Quantidade -->
            <q-table
              :rows="dadosQuantidade"
              :columns="colunasQuantidade"
              row-key="colaborador"
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
                  <q-td
                    key="colaborador"
                    :props="props"
                    class="text-weight-medium"
                  >
                    <div class="row items-center">
                      <q-avatar
                        size="32px"
                        color="primary"
                        text-color="white"
                        class="q-mr-sm"
                      >
                        {{ getInitials(props.row.colaborador) }}
                      </q-avatar>
                      {{ props.row.colaborador }}
                    </div>
                  </q-td>
                  <q-td key="quantidade" :props="props">
                    <q-badge
                      color="blue-6"
                      :label="props.row.quantidade"
                      class="q-px-md q-py-xs text-weight-bold"
                    />
                  </q-td>
                  <q-td key="percentual" :props="props">
                    <div class="row items-center">
                      <q-linear-progress
                        :value="props.row.percentual / 100"
                        color="teal-6"
                        class="q-mr-md"
                        style="width: 100px"
                        size="8px"
                      />
                      <span class="text-weight-medium">
                        {{ props.row.percentual }}%
                      </span>
                    </div>
                  </q-td>
                  <q-td key="produtividade" :props="props">
                    <q-chip
                      :color="getProdutividadeColor(props.row.produtividade)"
                      text-color="white"
                      :icon="getProdutividadeIcon(props.row.produtividade)"
                      class="text-weight-medium"
                    >
                      {{ props.row.produtividade }}
                    </q-chip>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Seção 2: Desempenho Individual por Tempo -->
        <q-card flat bordered class="shadow-2 q-mb-xl">
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon
                name="schedule"
                size="28px"
                color="primary"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-weight-bold text-grey-9">
                  2. Desempenho Individual por Tempo de Execução
                </div>
                <div class="text-caption text-grey-7">
                  Tempo médio de desenvolvimento de protocolos enviados para
                  teste
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <!-- Cards de Resumo Tempo -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6 col-md-6">
                <q-card flat bordered class="bg-purple-1">
                  <q-card-section class="text-center q-pa-md">
                    <q-icon name="timer" size="32px" color="purple-7" />
                    <div class="text-h5 text-weight-bold text-purple-9 q-mt-sm">
                      {{ tempoMedioGeral }}
                    </div>
                    <div class="text-caption text-purple-8">
                      Tempo Médio Geral
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-sm-6 col-md-6">
                <q-card flat bordered class="bg-indigo-1">
                  <q-card-section class="text-center q-pa-md">
                    <q-icon name="check_circle" size="32px" color="indigo-7" />
                    <div class="text-h5 text-weight-bold text-indigo-9 q-mt-sm">
                      {{ totalProtocolosTempo }}
                    </div>
                    <div class="text-caption text-indigo-8">
                      Protocolos Analisados
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Tabela de Tempo -->
            <q-table
              :rows="dadosTempo"
              :columns="colunasTempo"
              row-key="colaborador"
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
                  <q-td
                    key="colaborador"
                    :props="props"
                    class="text-weight-medium"
                  >
                    <div class="row items-center">
                      <q-avatar
                        size="32px"
                        color="primary"
                        text-color="white"
                        class="q-mr-sm"
                      >
                        {{ getInitials(props.row.colaborador) }}
                      </q-avatar>
                      {{ props.row.colaborador }}
                    </div>
                  </q-td>
                  <q-td key="tempoMedio" :props="props">
                    <q-badge
                      color="purple-6"
                      :label="props.row.tempoMedio"
                      class="q-px-md q-py-xs text-weight-bold"
                    />
                  </q-td>
                  <q-td key="quantidade" :props="props">
                    <q-badge
                      color="indigo-6"
                      :label="props.row.quantidade"
                      class="q-px-md q-py-xs text-weight-medium"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>

        <!-- Seção 3: Análise Estratégica -->
        <q-card flat bordered class="shadow-2 q-mb-lg">
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon
                name="insights"
                size="28px"
                color="primary"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-weight-bold text-grey-9">
                  3. Análise Estratégica
                </div>
                <div class="text-caption text-grey-7">
                  Indicadores de eficiência e desempenho
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Taxa de Conclusão -->
              <div class="col-12 col-md-4">
                <q-card flat bordered class="bg-green-1">
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-subtitle2 text-green-9 text-weight-bold">
                        Taxa de Conclusão
                      </div>
                      <q-icon name="task_alt" size="24px" color="green-7" />
                    </div>
                    <div class="text-h4 text-weight-bold text-green-9">
                      {{ indicadores.taxaConclusao }}%
                    </div>
                    <div class="text-caption text-green-8 q-mt-sm">
                      Protocolos enviados para teste
                    </div>
                    <q-linear-progress
                      :value="indicadores.taxaConclusao / 100"
                      color="green-7"
                      size="8px"
                      class="q-mt-md"
                    />
                  </q-card-section>
                </q-card>
              </div>

              <!-- Tempo Médio do Mês -->
              <div class="col-12 col-md-4">
                <q-card flat bordered class="bg-amber-1">
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-subtitle2 text-amber-9 text-weight-bold">
                        Tempo Médio - {{ mesAtualNome }}
                      </div>
                      <q-icon name="event" size="24px" color="amber-7" />
                    </div>
                    <div class="text-h4 text-weight-bold text-amber-9">
                      {{ indicadores.tempoMedioMes }}
                    </div>
                    <div class="text-caption text-amber-8 q-mt-sm">
                      Tempo de resolução no mês
                    </div>
                    <div class="row items-center q-mt-md">
                      <q-icon
                        :name="
                          indicadores.variacaoMes >= 0
                            ? 'arrow_upward'
                            : 'arrow_downward'
                        "
                        :color="
                          indicadores.variacaoMes >= 0 ? 'red-7' : 'green-7'
                        "
                        size="16px"
                      />
                      <span
                        class="text-caption q-ml-xs"
                        :class="
                          indicadores.variacaoMes >= 0
                            ? 'text-red-7'
                            : 'text-green-7'
                        "
                      >
                        {{ Math.abs(indicadores.variacaoMes) }}% vs mês anterior
                      </span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Tempo Médio do Ano -->
              <div class="col-12 col-md-4">
                <q-card flat bordered class="bg-cyan-1">
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-subtitle2 text-cyan-9 text-weight-bold">
                        Tempo Médio - {{ anoAtual }}
                      </div>
                      <q-icon
                        name="calendar_today"
                        size="24px"
                        color="cyan-7"
                      />
                    </div>
                    <div class="text-h4 text-weight-bold text-cyan-9">
                      {{ indicadores.tempoMedioAno }}
                    </div>
                    <div class="text-caption text-cyan-8 q-mt-sm">
                      Tempo de resolução no ano
                    </div>
                    <div class="row items-center q-mt-md">
                      <q-icon name="trending_flat" color="cyan-7" size="16px" />
                      <span class="text-caption text-cyan-7 q-ml-xs">
                        Média anual consolidada
                      </span>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Rodapé com informações -->
        <q-card flat bordered class="bg-blue-1">
          <q-card-section horizontal>
            <q-card-section class="col-auto flex items-center">
              <q-icon name="info" size="24px" color="blue-7" />
            </q-card-section>
            <q-card-section class="col">
              <div class="text-caption text-blue-9">
                <strong>Nota:</strong> Os dados apresentados são atualizados em
                tempo real e refletem apenas o período selecionado. A
                produtividade é calculada com base na média de protocolos da
                equipe.
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import reportsService from 'src/services/reports';

// Service
const {
  getDesempenhoQuantidade,
  getDesempenhoTempoMedio,
  getIndicadoresEstrategicos,
} = reportsService();

// Meses
const anoAtual = new Date().getFullYear();
const nomesMeses = [
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

const meses = Array.from({ length: 12 }, (_, i) => {
  const mes = String(i + 1).padStart(2, '0');
  return {
    label: `${nomesMeses[i]} de ${anoAtual}`,
    value: `${anoAtual}-${mes}`,
  };
});

const mesSelecionado = ref('');
const periodo = ref({ inicio: '', fim: '' });

const mesSelecionadoLabel = computed(() => {
  const m = meses.find((m) => m.value === mesSelecionado.value);
  return m ? m.label : '';
});

const mesSelecionadoNumber = computed(() => {
  return mesSelecionado.value
    ? Number(mesSelecionado.value.split('-')[1])
    : new Date().getMonth() + 1;
});

const mesAtualNome = computed(() => {
  return nomesMeses[mesSelecionadoNumber.value - 1];
});

// Dados mockados - Seção 1: Quantidade
const dadosQuantidade = ref([]);

// Dados mockados - Seção 2: Tempo
const dadosTempo = ref([]);

// Dados mockados - Seção 3: Indicadores
const indicadores = ref({
  taxaConclusao: 0,
  tempoMedioMes: '0 dias',
  tempoMedioAno: '0 dias',
  variacaoMes: 0,
});

// Loading states
const loadingQuantidade = ref(false);
const loadingTempo = ref(false);
const loadingIndicadores = ref(false);

// Colunas das tabelas
const colunasQuantidade = [
  {
    name: 'colaborador',
    label: 'Colaborador',
    align: 'left',
    field: 'colaborador',
    sortable: true,
  },
  {
    name: 'quantidade',
    label: 'Qtd. Protocolos',
    align: 'center',
    field: 'quantidade',
    sortable: true,
  },
  {
    name: 'percentual',
    label: '% do Total',
    align: 'left',
    field: 'percentual',
    sortable: true,
  },
  {
    name: 'produtividade',
    label: 'Produtividade',
    align: 'center',
    field: 'produtividade',
    sortable: true,
  },
];

const colunasTempo = [
  {
    name: 'colaborador',
    label: 'Colaborador',
    align: 'left',
    field: 'colaborador',
    sortable: true,
  },
  {
    name: 'tempoMedio',
    label: 'Tempo Médio em Desenvolvimento',
    align: 'center',
    field: 'tempoMedio',
    sortable: true,
  },
  {
    name: 'quantidade',
    label: 'Quantidade de Protocolos',
    align: 'center',
    field: 'quantidade',
    sortable: true,
  },
];

// Computed properties
const totalProtocolosQuantidade = computed(() => {
  return dadosQuantidade.value.reduce((sum, item) => sum + item.quantidade, 0);
});

const mediaProtocolosPorColaborador = computed(() => {
  const total = totalProtocolosQuantidade.value;
  const colaboradores = dadosQuantidade.value.length;
  return colaboradores > 0 ? Math.round(total / colaboradores) : 0;
});

const totalProtocolosTempo = computed(() => {
  return dadosTempo.value.reduce((sum, item) => sum + item.quantidade, 0);
});

const tempoMedioGeral = computed(() => {
  return '3.2 dias'; // Calcular com base nos dados reais
});

// Helper functions
function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getProdutividadeColor(produtividade) {
  const colors = {
    Alta: 'green-6',
    Média: 'orange-6',
    Baixa: 'red-6',
  };
  return colors[produtividade] || 'grey-6';
}

function getProdutividadeIcon(produtividade) {
  const icons = {
    Alta: 'trending_up',
    Média: 'remove',
    Baixa: 'trending_down',
  };
  return icons[produtividade] || 'help';
}

function calcularProdutividade(quantidade, media) {
  if (quantidade >= media * 1.2) return 'Alta';
  if (quantidade >= media * 0.8) return 'Média';
  return 'Baixa';
}

// Load Data Functions
async function loadDesempenhoQuantidade() {
  try {
    loadingQuantidade.value = true;
    const params = {
      month: mesSelecionadoNumber.value,
      year: anoAtual,
    };

    const data = await getDesempenhoQuantidade(params);

    // Calcular total e percentuais
    const total = data.reduce((sum, item) => sum + item.quantidade, 0);
    const media = total / data.length;

    // Processar dados
    dadosQuantidade.value = data.map((item) => ({
      colaborador: item.colaborador,
      quantidade: item.quantidade,
      percentual: ((item.quantidade / total) * 100).toFixed(1),
      produtividade: calcularProdutividade(item.quantidade, media),
    }));
  } catch (error) {
    console.error('Erro ao carregar desempenho por quantidade:', error);
    dadosQuantidade.value = [];
  } finally {
    loadingQuantidade.value = false;
  }
}

async function loadDesempenhoTempo() {
  try {
    loadingTempo.value = true;
    const params = {
      month: mesSelecionadoNumber.value,
      year: anoAtual,
    };

    const data = await getDesempenhoTempoMedio(params);

    // Processar dados
    dadosTempo.value = data.map((item) => ({
      colaborador: item.colaborador,
      tempoMedio: item.tempo_medio, // Ex: "2.3 dias"
      quantidade: item.quantidade,
    }));
  } catch (error) {
    console.error('Erro ao carregar desempenho por tempo:', error);
    dadosTempo.value = [];
  } finally {
    loadingTempo.value = false;
  }
}

async function loadIndicadores() {
  try {
    loadingIndicadores.value = true;
    const params = {
      month: mesSelecionadoNumber.value,
      year: anoAtual,
    };

    const data = await getIndicadoresEstrategicos(params);

    indicadores.value = {
      taxaConclusao: data.taxa_conclusao || 0,
      tempoMedioMes: data.tempo_medio_mes || '0 dias',
      tempoMedioAno: data.tempo_medio_ano || '0 dias',
      variacaoMes: data.variacao_mes || 0,
    };
  } catch (error) {
    console.error('Erro ao carregar indicadores:', error);
    indicadores.value = {
      taxaConclusao: 0,
      tempoMedioMes: '0 dias',
      tempoMedioAno: '0 dias',
      variacaoMes: 0,
    };
  } finally {
    loadingIndicadores.value = false;
  }
}

async function loadData() {
  await Promise.all([
    loadDesempenhoQuantidade(),
    loadDesempenhoTempo(),
    loadIndicadores(),
  ]);
}

function definirPeriodo(valor) {
  const [ano, mes] = valor.split('-');
  const inicio = `${ano}-${mes}-01`;
  const fim = new Date(ano, Number(mes), 0).toISOString().split('T')[0];
  periodo.value = { inicio, fim };
  mesSelecionado.value = valor;

  // Carregar dados da API
  loadData();
}

onMounted(() => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  mesSelecionado.value = `${ano}-${mes}`;

  // Carregar dados iniciais
  loadData();
});
</script>
