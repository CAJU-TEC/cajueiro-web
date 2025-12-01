import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { reportsService } from 'src/services/reports';

export function useSupportReport() {
  const $q = useQuasar();

  const selectedMonth = ref(new Date().getMonth() + 1);
  const selectedYear = ref(new Date().getFullYear());
  const loading = ref(false);
  const ticketsByCollaborator = ref([]);
  const ticketsByClient = ref([]);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const monthOptions = months.map((label, idx) => ({ label, value: idx + 1 }));
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Computed totals
  const totalTickets = computed(() =>
    ticketsByCollaborator.value.reduce((sum, item) => sum + item.total, 0)
  );

  const totalClients = computed(() => ticketsByClient.value.length);

  const totalExternal = computed(() =>
    ticketsByClient.value.reduce((sum, item) => sum + item.externos, 0)
  );

  const totalInternal = computed(() =>
    ticketsByClient.value.reduce((sum, item) => sum + item.internos, 0)
  );

  const totalMobile = computed(() =>
    ticketsByClient.value.reduce((sum, item) => sum + item.mobile, 0)
  );

  const totalWeb = computed(() =>
    ticketsByClient.value.reduce((sum, item) => sum + item.web, 0)
  );

  // Load data
  async function loadData() {
    loading.value = true;
    try {
      const params = { month: selectedMonth.value, year: selectedYear.value };
      const [collabData, clientData] = await Promise.all([
        reportsService.getTicketsPorColaborador(params),
        reportsService.getTicketsPorCliente(params),
      ]);

      ticketsByCollaborator.value = collabData;
      ticketsByClient.value = clientData;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      $q.notify({
        color: 'negative',
        message: 'Erro ao carregar os dados do relatório.',
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
  };
}
