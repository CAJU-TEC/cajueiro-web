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

  return {
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
  };
}
