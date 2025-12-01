import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { reportsService } from 'src/services/reports';

export function useQAReport() {
  const $q = useQuasar();

  const selectedMonth = ref(new Date().getMonth() + 1);
  const selectedYear = ref(new Date().getFullYear());
  const loading = ref(false);
  const ticketsByQa = ref([]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const monthOptions = months.map((label, idx) => ({ label, value: idx + 1 }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Computed totals
  const totalTeste = computed(() =>
    ticketsByQa.value.reduce((sum, item) => sum + item.teste, 0)
  );

  const totalValidacao = computed(() =>
    ticketsByQa.value.reduce((sum, item) => sum + item.validacao, 0)
  );

  const totalPendentes = computed(() =>
    ticketsByQa.value.reduce((sum, item) => sum + item.pendente, 0)
  );

  const totalFinalizados = computed(() =>
    ticketsByQa.value.reduce((sum, item) => sum + item.finalizado, 0)
  );

  const totalProtocolos = computed(() =>
    ticketsByQa.value.reduce((sum, item) => sum + item.total, 0)
  );

  // Load data
  async function loadData() {
    loading.value = true;
    try {
      const params = { month: selectedMonth.value, year: selectedYear.value };
      const data = await reportsService.getTicketsPorQA(params);

      ticketsByQa.value = data.map((item) => ({
        qaName: item.qaName,
        teste: item.statusCounts.teste,
        validacao: item.statusCounts.validacao,
        pendente: item.statusCounts.pendente,
        finalizado: item.statusCounts.finalizado,
        total:
          item.statusCounts.teste +
          item.statusCounts.validacao +
          item.statusCounts.pendente +
          item.statusCounts.finalizado,
      }));
    } catch (error) {
      console.error('Erro ao carregar dados de Q.A.:', error);
      $q.notify({
        color: 'negative',
        message: 'Erro ao carregar os dados.',
        icon: 'warning',
      });
    } finally {
      loading.value = false;
    }
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
  };
}
