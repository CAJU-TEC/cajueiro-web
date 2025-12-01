import { computed } from 'vue';

export function useSupportCharts(ticketsByCollaborator, totalExternal, totalInternal, totalMobile, totalWeb) {
  // Gráfico de colaboradores
  const collaboratorChartOptions = computed(() => {
    const categories = ticketsByCollaborator.value.map((item) => item.nome || 'Sem nome');
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
      colors: ['#1976D2'],
      grid: { show: true, strokeDashArray: 3, borderColor: '#e0e0e0' },
      tooltip: {
        enabled: true,
        y: { formatter: (val) => `${val} protocolos` },
      },
    };
  });

  const collaboratorChartSeries = computed(() => {
    const data = ticketsByCollaborator.value.map((item) => item.total || 0);
    return [{ name: 'Protocolos', data }];
  });

  // Gráfico Externos vs Internos (otimizado)
  const externalInternalChartOptions = computed(() => ({
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
    labels: ['Externos', 'Internos'],
    colors: ['#9C27B0', '#FF9800'],
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

  const externalInternalChartSeries = computed(() => [
    totalExternal.value,
    totalInternal.value,
  ]);

  // Gráfico Mobile vs Web (otimizado)
  const platformChartOptions = computed(() => ({
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
    labels: ['Mobile', 'Web'],
    colors: ['#1976D2', '#4CAF50'],
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

  const platformChartSeries = computed(() => [
    totalMobile.value,
    totalWeb.value,
  ]);

  return {
    collaboratorChartOptions,
    collaboratorChartSeries,
    externalInternalChartOptions,
    externalInternalChartSeries,
    platformChartOptions,
    platformChartSeries,
  };
}
