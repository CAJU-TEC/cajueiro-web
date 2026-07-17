import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { reportsService } from 'src/services/reports';

export function useDevelopmentReport() {
  const $q = useQuasar();

  const selectedMonth = ref(new Date().getMonth() + 1);
  const selectedYear = ref(new Date().getFullYear());
  const loading = ref(false);
  const dadosQuantidade = ref([]);
  const dadosTempo = ref([]);
  const protocolosSemPendencia = ref([]);
  const loadingSemPendencia = ref(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const monthOptions = months.map((label, idx) => ({ label, value: idx + 1 }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Computed properties
  const totalProtocolosQuantidade = computed(() =>
    dadosQuantidade.value.reduce((sum, item) => sum + item.quantidade, 0)
  );

  const totalExternos = computed(() =>
    dadosQuantidade.value.reduce((sum, item) => sum + (item.externos || 0), 0)
  );

  const totalInternos = computed(() =>
    dadosQuantidade.value.reduce((sum, item) => sum + (item.internos || 0), 0)
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

  // Helper functions
  function calcularProdutividade(quantidade, media) {
    if (quantidade >= media * 1.2) return 'Alta';
    if (quantidade >= media * 0.8) return 'Média';
    return 'Baixa';
  }

  function calcularScorePonderado(quantidade, pontuacaoTotal) {
    // Score = (Pontos Totais * 60%) + (Quantidade * 40%)
    // Normaliza a quantidade para uma escala equivalente aos pontos
    const quantidadeNormalizada = quantidade * 0.5; // Cada ticket vale 0.5 no score
    return (pontuacaoTotal * 0.6) + (quantidadeNormalizada * 0.4);
  }

  function calcularPerformance(score) {
    // Classificação baseada no score ponderado
    if (score >= 20) return 'Excelente';
    if (score >= 12) return 'Ótimo';
    if (score >= 6) return 'Bom';
    if (score >= 3) return 'Regular';
    return 'Baixo';
  }

  function getDescricaoImpacto(pontuacaoMedia) {
    // Retorna a descrição baseada na pontuação média
    if (pontuacaoMedia >= 8) return 'Insano';
    if (pontuacaoMedia >= 4) return 'Muito difícil';
    if (pontuacaoMedia >= 2) return 'Difícil';
    if (pontuacaoMedia >= 1) return 'Médio';
    if (pontuacaoMedia >= 0.5) return 'Normal';
    if (pontuacaoMedia >= 0.25) return 'Fácil';
    return 'N/A';
  }

  function calcularAvaliacaoPorImpacto(pontuacaoMedia) {
    // Baseado na tabela impacts:
    // Insano: 8.00, Muito difícil: 4.00, Difícil: 2.00, Médio: 1.00, Normal: 0.50, Fácil: 0.25
    if (pontuacaoMedia >= 8) return 'Insano';
    if (pontuacaoMedia >= 4) return 'Muito Difícil';
    if (pontuacaoMedia >= 2) return 'Difícil';
    if (pontuacaoMedia >= 1) return 'Médio';
    if (pontuacaoMedia >= 0.5) return 'Normal';
    if (pontuacaoMedia >= 0.25) return 'Fácil';
    return 'Sem Impacto';
  }

  // Formata duração (em minutos): >= 1 dia -> dias; < 1 dia -> horas;
  // < 1 hora -> horas com 1 casa decimal (ex.: "0,3 horas").
  function formatDuracao(minutos) {
    if (minutos === null || minutos === undefined) return null;
    const min = Math.max(0, minutos);
    const horas = min / 60;

    if (horas >= 24) {
      const dias = Math.round(horas / 24);
      return `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
    }

    if (horas >= 1) {
      const h = Math.round(horas);
      return `${h} ${h === 1 ? 'hora' : 'horas'}`;
    }

    const h = horas.toFixed(1).replace('.', ',');
    return `${h} ${h === '1,0' ? 'hora' : 'horas'}`;
  }

  function getInitials(name) {
    if (!name) return '';
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

  function getAvaliacaoImpactoColor(avaliacao) {
    // Cores baseadas na tabela impacts
    const colors = {
      'Insano': 'red-9',           // #bf0f0f
      'Muito Difícil': 'pink-9',   // #d60076
      'Difícil': 'orange-7',       // #f57b00
      'Médio': 'deep-purple-6',    // #5d3cf0
      'Normal': 'blue-6',          // #3399ff
      'Fácil': 'light-blue-4',     // #99ccff
      'Sem Impacto': 'grey-5'
    };
    return colors[avaliacao] || 'grey';
  }

  function getAvaliacaoImpactoIcon(avaliacao) {
    const icons = {
      'Insano': 'whatshot',
      'Muito Difícil': 'local_fire_department',
      'Difícil': 'trending_up',
      'Médio': 'adjust',
      'Normal': 'horizontal_rule',
      'Fácil': 'sentiment_satisfied',
      'Sem Impacto': 'help_outline'
    };
    return icons[avaliacao] || 'help';
  }

  function getPerformanceColor(performance) {
    const colors = {
      'Excelente': 'deep-purple-8',
      'Ótimo': 'green-7',
      'Bom': 'blue-6',
      'Regular': 'orange-6',
      'Baixo': 'grey-6'
    };
    return colors[performance] || 'grey';
  }

  function getPerformanceIcon(performance) {
    const icons = {
      'Excelente': 'emoji_events',
      'Ótimo': 'military_tech',
      'Bom': 'star',
      'Regular': 'show_chart',
      'Baixo': 'trending_flat'
    };
    return icons[performance] || 'help';
  }

  // Load data
  async function loadData() {
    loading.value = true;
    try {
      const params = { month: selectedMonth.value, year: selectedYear.value };
      const [quantidadeData, tempoData] = await Promise.all([
        reportsService.getDesempenhoQuantidade(params),
        reportsService.getDesempenhoTempoMedio(params),
      ]);

      const total = quantidadeData.reduce((sum, item) => sum + item.quantidade, 0);
      const media = total / quantidadeData.length || 0;

      dadosQuantidade.value = quantidadeData.map((item) => {
        const pontuacaoTotal = item.pontuacao_total_impacto || 0;
        const score = calcularScorePonderado(item.quantidade, pontuacaoTotal);

        return {
          colaborador: item.colaborador,
          quantidade: item.quantidade,
          externos: item.externos || 0,
          internos: item.internos || 0,
          percentual: total ? ((item.quantidade / total) * 100).toFixed(1) : '0.0',
          pontuacao_media_impacto: item.pontuacao_media_impacto || 0,
          pontuacao_total_impacto: pontuacaoTotal,
          descricao_impacto: getDescricaoImpacto(item.pontuacao_media_impacto || 0),
          score_ponderado: score,
          performance: calcularPerformance(score),
        };
      });

      dadosTempo.value = tempoData.map((item) => ({
        colaborador: item.colaborador,
        tempoMedio: item.tempo_medio,
        quantidade: item.quantidade,
      }));
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

  // Watch for changes with debounce
  let debounceTimer = null;
  watch([selectedMonth, selectedYear], () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadData();
    }, 300);
  });

  // Protocolos finalizados sem pendência (carregamento independente)
  async function loadProtocolosSemPendencia() {
    loadingSemPendencia.value = true;
    try {
      const params = { month: selectedMonth.value, year: selectedYear.value };
      const data = await reportsService.getProtocolosSemPendencia(params);
      protocolosSemPendencia.value = data.map((item) => ({
        codigo: item.codigo,
        protocolo: item.protocolo,
        colaborador: item.colaborador,
        tempoExecucao: item.tempo_execucao,
        tempoVida: item.tempo_vida,
        dufy: item.dufy,
      }));
    } catch (error) {
      console.error('Erro ao carregar protocolos sem pendência:', error);
      protocolosSemPendencia.value = [];
    } finally {
      loadingSemPendencia.value = false;
    }
  }

  let debounceTimerSemPendencia = null;
  watch([selectedMonth, selectedYear], () => {
    if (debounceTimerSemPendencia) clearTimeout(debounceTimerSemPendencia);
    debounceTimerSemPendencia = setTimeout(() => {
      loadProtocolosSemPendencia();
    }, 300);
  });

  return {
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
  };
}
