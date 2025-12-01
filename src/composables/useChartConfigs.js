import { ref, computed, shallowRef } from 'vue';

// Paleta de cores pré-definida para evitar cálculos repetidos
const COLOR_PALETTE = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
  '#E91E63', '#3F51B5', '#8BC34A', '#FF5722', '#009688',
  '#FFC107', '#673AB7', '#CDDC39', '#FF6F00', '#1976D2'
];

export function useChartConfigs(dadosQuantidade) {
  // Memoizar cores para evitar recalculações
  const cachedColors = shallowRef([]);
  let lastCount = 0;

  function getColors(count) {
    if (count === lastCount && cachedColors.value.length > 0) {
      return cachedColors.value;
    }

    if (!count || count <= 0) return [];

    // Se temos menos itens que a paleta, usar diretamente
    if (count <= COLOR_PALETTE.length) {
      cachedColors.value = COLOR_PALETTE.slice(0, count);
    } else {
      // Repetir e variar a paleta se necessário
      cachedColors.value = Array.from({ length: count }, (_, i) =>
        COLOR_PALETTE[i % COLOR_PALETTE.length]
      );
    }

    lastCount = count;
    return cachedColors.value;
  }

  const quantidadeChartOptions = computed(() => {
    const categories = dadosQuantidade.value.map((item) => item.colaborador);
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
      colors: ['#2196F3'],
      grid: { show: true, strokeDashArray: 3, borderColor: '#e0e0e0' },
      tooltip: {
        enabled: true,
        y: { formatter: (val) => `${val} protocolos` },
      },
    };
  });

  const quantidadeChartSeries = computed(() => {
    const seriesData = dadosQuantidade.value.map((item) => item.quantidade);
    return [{ name: 'Protocolos', data: seriesData }];
  });

  // Otimizar gráfico de pizza com configurações de performance
  const distribuicaoChartOptions = computed(() => {
    const categories = dadosQuantidade.value.map((item) => item.colaborador);
    const count = dadosQuantidade.value.length;

    return {
      chart: {
        type: 'pie',
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 400, // Reduzido de 800 para 400
          animateGradually: {
            enabled: false, // Desabilitar animação gradual
          },
        },
      },
      labels: categories,
      colors: getColors(count),
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
        floating: false,
        itemMargin: {
          horizontal: 8,
          vertical: 2,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => (val > 5 ? `${val.toFixed(0)}%` : ''), // Simplificado
        style: {
          fontSize: '11px',
          fontWeight: 600,
        },
        dropShadow: {
          enabled: false, // Remover sombra para performance
        },
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['#fff'],
      },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
        y: {
          formatter: (value) => `${value} protocolos`,
        },
      },
      plotOptions: {
        pie: {
          expandOnClick: false, // Desabilitar expansão ao clicar
          donut: {
            labels: {
              show: false,
            },
          },
        },
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.15,
          },
        },
        active: {
          filter: {
            type: 'none', // Desabilitar filtro ativo
          },
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: { width: 280 },
            legend: {
              position: 'bottom',
              fontSize: '10px',
              itemMargin: {
                horizontal: 4,
                vertical: 2,
              },
            },
          },
        },
      ],
    };
  });

  const distribuicaoChartSeries = computed(() =>
    dadosQuantidade.value.map((item) => item.quantidade)
  );

  return {
    quantidadeChartOptions,
    quantidadeChartSeries,
    distribuicaoChartOptions,
    distribuicaoChartSeries,
  };
}
