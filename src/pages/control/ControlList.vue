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
              placeholder="Buscar por descrição"
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
              :model-value="filtros.status"
              :options="opcoesTipoProtocolo"
              label="status"
              outlined
              dense
              clearable
              multiple
              use-chips
              emit-value
              map-options
              @update:model-value="atualizarStatus"
            >
              <template #prepend>
                <q-icon name="filter_list" />
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mt-none">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.colaborador"
              :options="opcoesColaboradores"
              label="Colaborador"
              outlined
              dense
              clearable
              use-input
              emit-value
              map-options
              input-debounce="0"
              :loading="loadingColaboradores"
              @filter="filtrarColaboradores"
              @popup-hide="opcoesColaboradores = todosColaboradores"
            >
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.papel"
              :options="opcoesPapel"
              label="Atuação do colaborador"
              hint="Vazio = qualquer atuação"
              :disable="!filtros.colaborador"
              outlined
              dense
              clearable
              multiple
              use-chips
              emit-value
              map-options
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.platform"
              :options="opcoesPlataforma"
              label="Plataforma"
              outlined
              dense
              clearable
              multiple
              use-chips
              emit-value
              map-options
            >
              <template #prepend>
                <q-icon name="devices" />
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
      Exibindo {{ empresas.reduce((soma, e) => soma + e.total, 0) }} resultado(s) para "{{ filtros.pesquisa }}"
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
      <div
        v-for="card in cardsMetricas"
        :key="card.chave"
        class="col-12 col-md-4"
      >
        <q-card flat :class="`bg-${card.cor}-1 metric-card metric-${card.cor}`">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6 text-grey-7">{{ card.titulo }}</div>
                <div :class="`text-h3 text-weight-bold text-${card.cor}-9`">
                  {{ metricas[card.chave] }}
                </div>
              </div>
              <div class="col-auto">
                <q-icon :name="card.icone" size="56px" :class="`text-${card.cor}-4`" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista de Protocolos por Cliente -->
    <template v-if="!loading">
      <div
        v-for="cliente in empresas"
        :key="cliente.id"
        class="q-mb-md"
      >
      <q-expansion-item
        :model-value="!!expandido[cliente.id]"
        :label="cliente.nome"
        :caption="`${cliente.total} protocolo(s)`"
        header-class="bg-grey-2 text-grey-9"
        expand-icon-class="text-primary"
        @update:model-value="(aberto) => alternarEmpresa(cliente, aberto)"
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
              {{ cliente.total }} protocolo(s)
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-badge
              v-if="cliente.abertos > 0"
              :color="cliente.atrasados > 0 ? 'negative' : 'positive'"
              :label="cliente.atrasados > 0 ? 'Com atrasos' : 'No prazo'"
            />
          </q-item-section>
        </template>

        <q-card flat bordered>
          <q-card-section class="q-pa-none">
            <q-table
              v-if="estado[cliente.id]"
              v-model:pagination="estado[cliente.id].pagination"
              :rows="estado[cliente.id].rows"
              :columns="colunas"
              row-key="id"
              flat
              :loading="estado[cliente.id].loading"
              :rows-per-page-options="[10, 20, 50]"
              binary-state-sort
              @request="(req) => aoSolicitarTabela(cliente.id, req)"
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

                    <span v-if="props.row.status !== 'done'">
                      {{ props.row.sla }} {{ props.row.slaUnidade }}
                    </span>
                    
                      


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
      v-if="!loading && empresas.length === 0"
      flat
      bordered
      class="text-center q-pa-xl"
    >
      <template v-if="colaboradorSelecionado">
        <q-icon name="person_off" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">
          {{ colaboradorSelecionado.label }} não possui nenhuma atividade
        </div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          Nenhum protocolo encontrado para este colaborador com os filtros atuais
        </div>
      </template>
      <template v-else>
        <q-icon name="inbox" size="64px" color="grey-5" />
        <div class="text-h6 text-grey-7 q-mt-md">Nenhum protocolo encontrado</div>
        <div class="text-body2 text-grey-5 q-mt-sm">
          Ajuste os filtros para visualizar os protocolos
        </div>
      </template>
    </q-card>
  </q-page>
</template>

<script>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';
import controlService from 'src/services/control';
import corporatesService from 'src/services/corporate';
import collaboratorsService from 'src/services/collaborators';

export default {
  name: 'ControleProtocolos',

  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const { listByClient, listProtocols, getMetrics } = controlService();
    const { list: listCorporates } = corporatesService();
    const { list: listCollaborators } = collaboratorsService();

    // Estado
    const loading = ref(false);
    const loadingCorporates = ref(false);
    const loadingColaboradores = ref(false);
    const todosColaboradores = ref([]);
    const opcoesColaboradores = ref([]);

    // Filtros
    const filtros = ref({
      corporate: null,
      periodo: null,
      status: [],
      colaborador: null,
      papel: [],
      platform: [],
      pesquisa: '',
    });

    // Opções para selects
    const opcoesCorporates = ref([
      { label: 'Todas as Empresas', value: null },
    ]);

    // Fonte única de rótulo, cor e ícone de cada status.
    const STATUS = {
      backlog: { label: 'Aguardando', color: 'green-7', icon: 'hourglass_empty' },
      todo: { label: 'A Fazer', color: 'yellow-7', icon: 'assignment' },
      analyze: { label: 'Análise', color: 'grey-7', icon: 'search' },
      development: { label: 'Desenvolvimento', color: 'blue-7', icon: 'code' },
      test: { label: 'Teste', color: 'purple-7', icon: 'bug_report' },
      pending: { label: 'Pendente', color: 'orange-7', icon: 'schedule' },
      validation: { label: 'Validação', color: 'teal-7', icon: 'verified' },
      done: { label: 'Finalizado', color: 'grey-7', icon: 'check_circle' },
    };

    const opcoesTipoProtocolo = [
      { label: 'Todos', value: 'todos' },
      ...Object.entries(STATUS).map(([value, { label }]) => ({ label, value })),
    ];

    // "Todos" é exclusivo: escolhê-lo limpa os demais; escolher outro status o remove.
    const atualizarStatus = (selecionados) => {
      const novos = selecionados || [];
      const tinhaTodos = filtros.value.status.includes('todos');

      if (novos.includes('todos') && !tinhaTodos) {
        filtros.value.status = ['todos'];
      } else if (tinhaTodos && novos.length > 1) {
        filtros.value.status = novos.filter((status) => status !== 'todos');
      } else {
        filtros.value.status = novos;
      }
    };

    const opcoesPapel = [
      { label: 'Desenvolvendo', value: 'dev' },
      { label: 'Testando', value: 'qa' },
      { label: 'Criou', value: 'criador' },
    ];

    const opcoesPlataforma = [
      { label: 'Web', value: 'web' },
      { label: 'Mobile', value: 'mobile' },
      { label: 'Notifiq', value: 'notifiq' },
    ];

    // Gerar lista de anos (5 anos atrás até ano atual + 1)
    const anoAtual = new Date().getFullYear();
    const opcoesAnos = Array.from({ length: 7 }, (_, i) => {
      const ano = anoAtual - 5 + i;
      return { label: ano.toString(), value: ano };
    });

    // Dados
    const empresas = ref([]);
    const metricas = ref({
      total: 0,
      aguardandoValidacao: 0,
      emAnalise: 0,
      todo: 0,
      development: 0,
      test: 0,
    });

    const cardsMetricas = [
      { chave: 'total', titulo: 'Total de Protocolos', icone: 'description', cor: 'blue' },
      { chave: 'aguardandoValidacao', titulo: 'Aguardando Validação', icone: 'hourglass_empty', cor: 'amber' },
      { chave: 'emAnalise', titulo: 'Em Análise', icone: 'search', cor: 'indigo' },
      { chave: 'todo', titulo: 'A Fazer', icone: 'assignment', cor: 'yellow' },
      { chave: 'development', titulo: 'Desenvolvimento', icone: 'code', cor: 'light-blue' },
      { chave: 'test', titulo: 'Teste', icone: 'bug_report', cor: 'purple' },
    ];
    // Estado por empresa: { rows, loading, pagination }
    const estado = reactive({});
    const expandido = reactive({});

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

    const getStatusColor = (status) => STATUS[status]?.color || 'grey-7';
    const getStatusIcon = (status) => STATUS[status]?.icon || 'label';
    const getStatusLabel = (status) => STATUS[status]?.label || status;

    // Ações
    const verDetalhes = (protocolo) => {
      const { href } = router.resolve({
        name: 'tickets.details',
        params: { id: protocolo.id },
      });
      window.open(href, '_blank');
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
        notificarErro(error, 'Erro ao carregar empresas');
      } finally {
        loadingCorporates.value = false;
      }
    };

    const carregarColaboradores = async () => {
      try {
        loadingColaboradores.value = true;
        const colaboradores = await listCollaborators();
        todosColaboradores.value = colaboradores
          .map((c) => ({
            label: `${c.first_name} ${c.last_name || ''}`.trim(),
            value: c.id,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        opcoesColaboradores.value = todosColaboradores.value;
      } catch (error) {
        notificarErro(error, 'Erro ao carregar colaboradores');
      } finally {
        loadingColaboradores.value = false;
      }
    };

    const colaboradorSelecionado = computed(() =>
      todosColaboradores.value.find((c) => c.value === filtros.value.colaborador)
    );

    const filtrarColaboradores = (texto, update) => {
      update(() => {
        const termo = texto.toLowerCase();
        opcoesColaboradores.value = todosColaboradores.value.filter((c) =>
          c.label.toLowerCase().includes(termo)
        );
      });
    };

    // Parâmetros enviados ao servidor: todos os filtros são aplicados no banco.
    const montarParams = () => {
      const params = {};
      if (filtros.value.corporate) params.corporate_id = filtros.value.corporate;
      if (filtros.value.periodo) params.periodo = filtros.value.periodo;
      if (
        filtros.value.status.length > 0 &&
        !filtros.value.status.includes('todos')
      ) {
        params.status = filtros.value.status.join(',');
      }
      if (filtros.value.colaborador) {
        params.colaborador_id = filtros.value.colaborador;
        if (filtros.value.papel.length > 0) {
          params.papel = filtros.value.papel.join(',');
        }
      }
      if (filtros.value.platform.length > 0) {
        params.platform = filtros.value.platform.join(',');
      }
      const busca = (filtros.value.pesquisa || '').trim();
      if (busca) params.search = busca;
      return params;
    };

    // Cancela a requisição anterior quando uma nova é disparada.
    const cancelamentos = {};
    const novaRequisicao = (chave) => {
      if (cancelamentos[chave]) cancelamentos[chave].cancel();
      const source = axios.CancelToken.source();
      cancelamentos[chave] = source;
      return source;
    };

    const notificarErro = (error, mensagem) => {
      if (axios.isCancel(error)) return;
      $q.notify({
        type: 'negative',
        message: error.message || mensagem,
        position: 'top',
      });
    };

    const estadoPadrao = () => ({
      rows: [],
      loading: false,
      carregado: false,
      pagination: {
        page: 1,
        rowsPerPage: 10,
        rowsNumber: 0,
        sortBy: 'dataAbertura',
        descending: true,
      },
    });

    // Protocolos de UMA empresa (paginação/ordenação no servidor)
    const carregarProtocolosEmpresa = async (corporateId, paginacao) => {
      if (!estado[corporateId]) estado[corporateId] = estadoPadrao();
      const e = estado[corporateId];
      const pag = { ...e.pagination, ...(paginacao || {}) };
      const source = novaRequisicao(`empresa:${corporateId}`);

      e.loading = true;
      try {
        const response = await listProtocols(
          {
            ...montarParams(),
            corporate_id: corporateId,
            page: pag.page,
            per_page: pag.rowsPerPage,
            sort_by: pag.sortBy || undefined,
            descending: pag.descending ? 1 : 0,
          },
          { cancelToken: source.token }
        );
        e.rows = response.data;
        e.pagination = { ...pag, rowsNumber: response.meta.total };
        e.carregado = true;
        e.loading = false;
      } catch (error) {
        if (axios.isCancel(error)) return;
        e.loading = false;
        notificarErro(error, 'Erro ao carregar protocolos');
      }
    };

    const aoSolicitarTabela = (corporateId, { pagination }) => {
      carregarProtocolosEmpresa(corporateId, pagination);
    };

    const alternarEmpresa = (empresa, aberto) => {
      expandido[empresa.id] = aberto;
      if (aberto && !(estado[empresa.id] && estado[empresa.id].carregado)) {
        carregarProtocolosEmpresa(empresa.id);
      }
    };

    // Resumo por empresa + métricas (2 consultas leves, em paralelo)
    const carregarProtocolos = async () => {
      const resumo = novaRequisicao('resumo');
      const metr = novaRequisicao('metricas');
      const params = montarParams();

      // Dados das tabelas ficam obsoletos quando o filtro muda.
      Object.keys(estado).forEach((id) => delete estado[id]);
      Object.keys(cancelamentos)
        .filter((k) => k.startsWith('empresa:'))
        .forEach((k) => cancelamentos[k].cancel());

      loading.value = true;
      try {
        const [lista, resumoMetricas] = await Promise.all([
          listByClient(params, { cancelToken: resumo.token }),
          getMetrics(params, { cancelToken: metr.token }),
        ]);
        empresas.value = lista.data;
        metricas.value = resumoMetricas.data;
        loading.value = false;

        // Reabre as empresas que o usuário já estava vendo.
        empresas.value
          .filter((empresa) => expandido[empresa.id])
          .forEach((empresa) => carregarProtocolosEmpresa(empresa.id));
      } catch (error) {
        if (axios.isCancel(error)) return;
        loading.value = false;
        notificarErro(error, 'Erro ao carregar protocolos');
      }
    };

    // Carregar dados ao montar o componente
    onMounted(() => {
      carregarCorporates();
      carregarColaboradores();
      carregarProtocolos();
    });

    onBeforeUnmount(() => {
      Object.values(cancelamentos).forEach((s) => s.cancel());
      clearTimeout(temporizador);
    });

    // Debounce: várias mudanças seguidas (ex.: marcar 3 status ou digitar)
    // geram uma única requisição.
    let temporizador = null;
    watch(
      () => [
        filtros.value.corporate,
        filtros.value.periodo,
        [...filtros.value.status],
        filtros.value.colaborador,
        [...filtros.value.papel],
        [...filtros.value.platform],
        filtros.value.pesquisa,
      ],
      () => {
        clearTimeout(temporizador);
        temporizador = setTimeout(carregarProtocolos, 400);
      }
    );

    return {
      filtros,
      opcoesCorporates,
      opcoesTipoProtocolo,
      opcoesAnos,
      atualizarStatus,
      opcoesPapel,
      opcoesPlataforma,
      opcoesColaboradores,
      loadingColaboradores,
      filtrarColaboradores,
      colaboradorSelecionado,
      empresas,
      estado,
      expandido,
      metricas,
      cardsMetricas,
      alternarEmpresa,
      aoSolicitarTabela,
      colunas,
      getStatusColor,
      getStatusIcon,
      getStatusLabel,
      verDetalhes,
      irParaValidacao,
      reatribuir,
      loading,
      loadingCorporates,
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

.metric-blue {
  border-left-color: #1976d2;
}

.metric-amber {
  border-left-color: #ffa000;
}

.metric-indigo {
  border-left-color: #3949ab;
}

.metric-yellow {
  border-left-color: #fbc02d;
}

.metric-light-blue {
  border-left-color: #0288d1;
}

.metric-purple {
  border-left-color: #7b1fa2;
}
</style>
