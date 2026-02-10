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

  const totalExternos = computed(() =>
    ticketsByQa.value.reduce((total, item) => {
      return (
        total +
        (item.teste_externos || 0) +
        (item.validacao_externos || 0) +
        (item.pendente_externos || 0) +
        (item.finalizado_externos || 0)
      );
    }, 0)
  );

  const totalInternos = computed(() =>
    ticketsByQa.value.reduce((total, item) => {
      return (
        total +
        (item.teste_internos || 0) +
        (item.validacao_internos || 0) +
        (item.pendente_internos || 0) +
        (item.finalizado_internos || 0)
      );
    }, 0)
  );

  const totalTesteExternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.teste_externos || 0),
      0
    )
  );

  const totalTesteInternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.teste_internos || 0),
      0
    )
  );

  const totalValidacaoExternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.validacao_externos || 0),
      0
    )
  );

  const totalValidacaoInternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.validacao_internos || 0),
      0
    )
  );

  const totalPendentesExternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.pendente_externos || 0),
      0
    )
  );

  const totalPendentesInternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.pendente_internos || 0),
      0
    )
  );

  const totalFinalizadosExternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.finalizado_externos || 0),
      0
    )
  );

  const totalFinalizadosInternos = computed(() =>
    ticketsByQa.value.reduce(
      (total, item) => total + (item.finalizado_internos || 0),
      0
    )
  );

  // Load data
  async function loadData() {
    loading.value = true;
    try {
      const params = { month: selectedMonth.value, year: selectedYear.value };
      const data = await reportsService.getTicketsPorQA(params);

      ticketsByQa.value = data.map(item => {
        const { teste, validacao, pendente, finalizado } = item.statusCounts;

        const totalExternos = teste.externos + validacao.externos + pendente.externos + finalizado.externos;
        const totalInternos = teste.internos + validacao.internos + pendente.internos + finalizado.internos;

        return {
          qaName: item.qaName,

          // totais por status
          teste: teste.total,
          validacao: validacao.total,
          pendente: pendente.total,
          finalizado: finalizado.total,

          total:
            teste.total +
            validacao.total +
            pendente.total +
            finalizado.total,

          // totais de externos e internos por analista
          totalExternos,
          totalInternos,

          // flat breakdown properties for template
          teste_externos: teste.externos,
          teste_internos: teste.internos,
          validacao_externos: validacao.externos,
          validacao_internos: validacao.internos,
          pendente_externos: pendente.externos,
          pendente_internos: pendente.internos,
          finalizado_externos: finalizado.externos,
          finalizado_internos: finalizado.internos,
        };
      });

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
    totalExternos,
    totalInternos,
    totalTesteExternos,
    totalTesteInternos,
    totalValidacaoExternos,
    totalValidacaoInternos,
    totalPendentesExternos,
    totalPendentesInternos,
    totalFinalizadosExternos,
    totalFinalizadosInternos,
    loadData,
    getInitials,
  };
}
