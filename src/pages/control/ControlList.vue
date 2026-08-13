<template>
  <q-page class="q-pa-md">
    <!-- Cabeçalho -->
    <div class="q-mb-lg">
      <div class="text-h4 text-weight-bold text-grey-9">
        Controle de Protocolos em Aberto
      </div>
      <div class="text-subtitle1 text-grey-7">
        Visão geral por cliente e status de validação
      </div>
    </div>

    <!-- Filtros -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12">
            <q-input
              v-model="filtros.pesquisa"
              label="Pesquisar protocolo"
              outlined
              dense
              clearable
              placeholder="Buscar por número, descrição, DEV ou Q.A..."
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.corporate"
              :options="opcoesCorporates"
              label="Empresa"
              outlined
              dense
              clearable
              emit-value
              map-options
              :loading="loadingCorporates"
            >
              <template #prepend>
                <q-icon name="business" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.periodo"
              :options="opcoesAnos"
              label="Ano"
              outlined
              dense
              clearable
              emit-value
              map-options
            >
              <template #prepend>
                <q-icon name="event" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="filtros.tipoProtocolo"
              :options="opcoesTipoProtocolo"
              label="Tipo do Protocolo"
              outlined
              dense
              emit-value
              map-options
            >
              <template #prepend>
                <q-icon name="filter_list" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="loading" class="row justify-center q-my-lg">
      <q-spinner color="primary" size="3em" />
    </div>

    <!-- Indicador de Pesquisa Ativa -->
    <q-banner
      v-if="!loading && filtros.pesquisa && filtros.pesquisa.trim() !== ''"
      class="bg-blue-1 text-blue-9 q-mb-md"
      rounded
    >
      <template #avatar>
        <q-icon name="search" color="blue-9" />
      </template>
      Exibindo {{ metricasTotais.total }} resultado(s) para "{{ filtros.pesquisa }}"
      <template #action>
        <q-btn
          flat
          dense
          icon="close"
          color="blue-9"
          @click="filtros.pesquisa = ''"
        />
      </template>
    </q-banner>

    <!-- Cards de Métricas -->
    <div v-else class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-md-4">
        <q-card flat class="bg-blue-1 metric-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6 text-grey-7">Total de Protocolos</div>
                <div class="text-h3 text-weight-bold text-blue-9">
                  {{ metricasTotais.total }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="description" size="56px" class="text-blue-4" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat class="bg-amber-1 metric-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6 text-grey-7">Aguardando Validação</div>
                <div class="text-h3 text-weight-bold text-amber-9">
                  {{ metricasTotais.aguardandoValidacao }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon
                  name="hourglass_empty"
                  size="56px"
                  class="text-amber-4"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat class="bg-indigo-1 metric-card">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6 text-grey-7">Em Análise</div>
                <div class="text-h3 text-weight-bold text-indigo-9">
                  {{ metricasTotais.emAnalise }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon name="search" size="56px" class="text-indigo-4" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista de Protocolos por Cliente -->
    <template v-if="!loading">
      <div
        v-for="cliente in protocolosFiltrados"
        :key="cliente.id"
        class="q-mb-md"
      >
      <q-expansion-item
        v-model="cliente.expanded"
        :label="cliente.nome"
        :caption="`${cliente.protocolos.length} protocolo(s) em aberto`"
        header-class="bg-grey-2 text-grey-9"
        expand-icon-class="text-primary"
        default-opened
      >
        <template #header>
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" icon="business" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-h6">
              {{ cliente.nome }}
            </q-item-label>
            <q-item-label caption>
              {{ cliente.protocolos.length }} protocolo(s) em aberto
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge
              :color="
                cliente.protocolos.some((p) => p.atrasado)
                  ? 'negative'
                  : 'positive'
              "
              :label="
                cliente.protocolos.some((p) => p.atrasado)
                  ? 'Com atrasos'
                  : 'No prazo'
              "
            />
          </q-item-section>
        </template>

        <q-card flat bordered>
          <q-card-section class="q-pa-none">
            <q-table
              :rows="cliente.protocolos"
              :columns="colunas"
              row-key="numero"
              flat
              :pagination="{ rowsPerPage: 10 }"
              hide-bottom
            >
              <template #body-cell-numero="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-primary">
                    #{{ props.row.numero }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatusColor(props.row.status)"
                    text-color="white"
                    :icon="getStatusIcon(props.row.status)"
                    size="sm"
                  >
                    {{ getStatusLabel(props.row.status) }}
                  </q-chip>
                </q-td>
              </template>

              <template #body-cell-sla="props">
                <q-td :props="props">
                  <div class="row items-center no-wrap">
                    <div
                      :class="
                        props.row.atrasado
                          ? 'text-negative text-weight-bold'
                          : 'text-grey-7'
                      "
                    >
                      {{ props.row.sla }} {{ props.row.slaUnidade }}
                    </div>
                    <q-icon
                      v-if="props.row.atrasado"
                      name="warning"
                      color="negative"
                      size="sm"
                      class="q-ml-xs"
                    >
                      <q-tooltip>Fora do SLA</q-tooltip>
                    </q-icon>
                  </div>
                </q-td>
              </template>

              <template #body-cell-acoes="props">
                <q-td :props="props">
                  <div class="row q-gutter-xs no-wrap">
                    <q-btn
                      flat
                      dense
                      round
                      color="primary"
                      icon="visibility"
                      size="sm"
                      @click="verDetalhes(props.row)"
                    >
                      <q-tooltip>Ver detalhes</q-tooltip>
                    </q-btn>

                    <q-btn
                      v-if="props.row.status === 'validation'"
                      flat
                      dense
                      round
                      color="positive"
                      icon="check_circle"
                      size="sm"
                      @click="irParaValidacao(props.row)"
                    >
                      <q-tooltip>Ir para validação</q-tooltip>
                    </q-btn>

                    <q-btn
                      flat
                      dense
                      round
                      color="grey-7"
                      icon="person_add"
                      size="sm"
                      @click="reatribuir(props.row)"
                    >
                      <q-tooltip>Reatribuir responsável</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      </div>
    </template>

    <!-- Mensagem quando não há dados -->
    <q-card
      v-if="protocolosFiltrados.length === 0"
      flat
      bordered
      class="text-center q-pa-xl"
    >
      <q-icon name="inbox" size="64px" color="grey-5" />
      <div class="text-h6 text-grey-7 q-mt-md">Nenhum protocolo encontrado</div>
      <div class="text-body2 text-grey-5 q-mt-sm">
        Ajuste os filtros para visualizar os protocolos
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import controlService from 'src/services/control';
import corporatesService from 'src/services/corporate';

export default {
  name: 'ControleProtocolos',

  setup() {
    const $q = useQuasar();
    const { listByClient } = controlService();
    const { list: listCorporates } = corporatesService();

    // Estado
    const loading = ref(false);
    const loadingCorporates = ref(false);

    // Filtros
    const filtros = ref({
      corporate: null,
      periodo: null,
      tipoProtocolo: 'todos',
      pesquisa: '',
    });

    // Opções para selects
    const opcoesCorporates = ref([
      { label: 'Todas as Empresas', value: null },
    ]);

    const opcoesTipoProtocolo = ref([
      { label: 'Todos', value: 'todos' },
      { label: 'Aguardando', value: 'backlog' },
      { label: 'A Fazer', value: 'todo' },
      { label: 'Análise', value: 'analyze' },
      { label: 'Desenvolvimento', value: 'development' },
      { label: 'Teste', value: 'test' },
      { label: 'Pendente', value: 'pending' },
      { label: 'Validação', value: 'validation' },
    ]);

    // Gerar lista de anos (5 anos atrás até ano atual + 1)
    const anoAtual = new Date().getFullYear();
    const opcoesAnos = ref(
      Array.from({ length: 7 }, (_, i) => {
        const ano = anoAtual - 5 + i;
        return { label: ano.toString(), value: ano };
      })
    );

    // Dados
    const protocolosData = ref([]);

    // Colunas da tabela
    const colunas = [
      {
        name: 'numero',
        label: 'Nº Protocolo',
        field: 'numero',
        align: 'left',
        sortable: true,
      },
      {
        name: 'descricao',
        label: 'Descrição',
        field: 'descricao',
        align: 'left',
        sortable: true,
      },
      {
        name: 'dataAbertura',
        label: 'Data Abertura',
        field: 'dataAbertura',
        align: 'center',
        sortable: true,
      },
      {
        name: 'dev',
        label: 'DEV',
        field: 'dev',
        align: 'left',
        sortable: true,
      },
      {
        name: 'qa',
        label: 'Q.A',
        field: 'qa',
        align: 'left',
        sortable: true,
      },
      {
        name: 'status',
        label: 'Status',
        field: 'status',
        align: 'center',
        sortable: true,
      },
      {
        name: 'sla',
        label: 'SLA',
        field: 'sla',
        align: 'center',
        sortable: true,
      },
      {
        name: 'acoes',
        label: 'Ações',
        field: 'acoes',
        align: 'center',
      },
    ];

    // Métodos auxiliares (definidos antes dos computed)
    const getStatusColor = (status) => {
      const colors = {
        backlog: 'green-7',
        todo: 'yellow-7',
        analyze: 'grey-7',
        development: 'blue-7',
        test: 'purple-7',
        pending: 'orange-7',
        validation: 'teal-7',
      };
      return colors[status] || 'grey-7';
    };

    const getStatusIcon = (status) => {
      const icons = {
        backlog: 'hourglass_empty',
        todo: 'assignment',
        analyze: 'search',
        development: 'code',
        test: 'bug_report',
        pending: 'schedule',
        validation: 'verified',
      };
      return icons[status] || 'label';
    };

    const getStatusLabel = (status) => {
      const labels = {
        backlog: 'Aguardando',
        todo: 'A Fazer',
        analyze: 'Análise',
        development: 'Desenvolvimento',
        test: 'Teste',
        pending: 'Pendente',
        validation: 'Validação',
      };
      return labels[status] || status;
    };

    // Computed: Métricas totais
    const metricasTotais = computed(() => {
      let total = 0;
      let aguardandoValidacao = 0;
      let emAnalise = 0;

      protocolosFiltrados.value.forEach((corporate) => {
        corporate.protocolos.forEach((protocolo) => {
          total++;
          if (protocolo.status === 'backlog') {
            aguardandoValidacao++;
          } else if (protocolo.status === 'analyze') {
            emAnalise++;
          }
        });
      });

      return { total, aguardandoValidacao, emAnalise };
    });

    // Computed: Protocolos filtrados
    const protocolosFiltrados = computed(() => {
      let dados = [...protocolosData.value];

      // Filtro por corporate
      if (filtros.value.corporate) {
        dados = dados.filter((corporate) => corporate.id === filtros.value.corporate);
      }

      // Filtro por tipo de protocolo
      if (filtros.value.tipoProtocolo !== 'todos') {
        dados = dados
          .map((corporate) => ({
            ...corporate,
            protocolos: (corporate.protocolos || []).filter((protocolo) => {
              return protocolo.status === filtros.value.tipoProtocolo;
            }),
          }))
          .filter((corporate) => corporate.protocolos.length > 0);
      }

      // Filtro por pesquisa (busca em múltiplos campos)
      if (filtros.value.pesquisa && filtros.value.pesquisa.trim() !== '') {
        const termoPesquisa = filtros.value.pesquisa.toLowerCase().trim();

        dados = dados
          .map((corporate) => ({
            ...corporate,
            protocolos: (corporate.protocolos || []).filter((protocolo) => {
              const numero = String(protocolo.numero || '').toLowerCase();
              const descricao = String(protocolo.descricao || '').toLowerCase();
              const dev = String(protocolo.dev || '').toLowerCase();
              const qa = String(protocolo.qa || '').toLowerCase();
              const statusLabel = getStatusLabel(protocolo.status).toLowerCase();
              const nomeEmpresa = String(corporate.nome || '').toLowerCase();

              return (
                numero.includes(termoPesquisa) ||
                descricao.includes(termoPesquisa) ||
                dev.includes(termoPesquisa) ||
                qa.includes(termoPesquisa) ||
                statusLabel.includes(termoPesquisa) ||
                nomeEmpresa.includes(termoPesquisa)
              );
            }),
          }))
          .filter((corporate) => corporate.protocolos.length > 0);
      }

      return dados;
    });

    // Ações
    const verDetalhes = (protocolo) => {
      console.log('Ver detalhes do protocolo:', protocolo);
      // Implementar navegação ou modal
    };

    const irParaValidacao = (protocolo) => {
      console.log('Ir para validação:', protocolo);
      // Implementar navegação para tela de validação
    };

    const reatribuir = (protocolo) => {
      console.log('Reatribuir protocolo:', protocolo);
      // Implementar modal de reatribuição
    };

    // Funções de API
    const carregarCorporates = async () => {
      try {
        loadingCorporates.value = true;
        const corporates = await listCorporates();

        // Mapear corporates para o formato do select
        const corporatesFormatados = corporates.map((corporate) => ({
          label: corporate.full_name || corporate.first_name,
          value: corporate.id,
        }));

        opcoesCorporates.value = [
          { label: 'Todas as Empresas', value: null },
          ...corporatesFormatados,
        ];
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar empresas',
          position: 'top',
        });
      } finally {
        loadingCorporates.value = false;
      }
    };

    const carregarProtocolos = async () => {
      try {
        loading.value = true;
        const params = {};

        // Aplicar filtros
        if (filtros.value.corporate) {
          params.corporate_id = filtros.value.corporate;
        }
        if (filtros.value.periodo) {
          params.periodo = filtros.value.periodo;
        }
        if (filtros.value.tipoProtocolo !== 'todos') {
          params.status = filtros.value.tipoProtocolo;
        }

        const response = await listByClient(params);
        protocolosData.value = response.data.map((corporate) => ({
          ...corporate,
          expanded: true,
        }));
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Erro ao carregar protocolos',
          position: 'top',
        });
      } finally {
        loading.value = false;
      }
    };

    // Carregar dados ao montar o componente
    onMounted(() => {
      carregarCorporates();
      carregarProtocolos();
    });

    // Recarregar quando filtros mudarem (exceto pesquisa que é local)
    watch(
      () => [filtros.value.corporate, filtros.value.periodo, filtros.value.tipoProtocolo],
      () => {
        carregarProtocolos();
      }
    );

    return {
      filtros,
      opcoesCorporates,
      opcoesTipoProtocolo,
      opcoesAnos,
      protocolosData,
      colunas,
      metricasTotais,
      protocolosFiltrados,
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      verDetalhes,
      irParaValidacao,
      reatribuir,
      loading,
      loadingCorporates,
      carregarCorporates,
      carregarProtocolos,
    };
  },
};
</script>

<style scoped>
.metric-card {
  border-left: 4px solid;
  transition: all 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bg-blue-1 {
  border-left-color: #1976d2;
}

.bg-amber-1 {
  border-left-color: #ffa000;
}

.bg-indigo-1 {
  border-left-color: #3949ab;
}
</style>
