import { computed } from 'vue';

export function useQACharts(ticketsByQa, totalTeste, totalValidacao, totalPendentes, totalFinalizados) {
  // Gráfico de QA
  const qaChartOptions = computed(() => {
    const categories = ticketsByQa.value.map((item) => item.qaName);
    return {
      chart: {
        type: 'bar',
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 8,
          horizontal: false,
          columnWidth: '60%',
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { fontSize: '12px', colors: ['#304758'] },
      },
      xaxis: {
        categories,
        labels: {
          rotate: -45,
          rotateAlways: categories.length > 5,
          style: { fontSize: '11px' },
        },
      },
      yaxis: {
        title: { text: 'Quantidade de Protocolos' },
      },
      colors: ['#9C27B0'],
      grid: { show: true, strokeDashArray: 3, borderColor: '#e0e0e0' },
      tooltip: {
        enabled: true,
        y: { formatter: (val) => `${val} protocolos` },
      },
    };
  });

  const qaChartSeries = computed(() => {
    const data = ticketsByQa.value.map((item) => item.total);
    return [{ name: 'Total', data }];
  });

  // Gráfico de Status (otimizado)
  const statusChartOptions = computed(() => ({
    chart: {
      type: 'pie',
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 400,
        animateGradually: { enabled: false },
      },
    },
    labels: ['Em Teste', 'Em Validação', 'Pendentes', 'Finalizados'],
    colors: ['#2196F3', '#009688', '#FF9800', '#4CAF50'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: { fontSize: '11px', fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['#fff'],
    },
    tooltip: {
      enabled: true,
      y: { formatter: (value) => `${value} protocolos` },
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
      },
    },
    states: {
      hover: {
        filter: { type: 'lighten', value: 0.15 },
      },
      active: {
        filter: { type: 'none' },
      },
    },
  }));

  const statusChartSeries = computed(() => [
    totalTeste.value,
    totalValidacao.value,
    totalPendentes.value,
    totalFinalizados.value,
  ]);

  return {
    qaChartOptions,
    qaChartSeries,
    statusChartOptions,
    statusChartSeries,
  };
}
