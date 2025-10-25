<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12" style="max-width: 1400px">
        <!-- Header Principal -->
        <q-card flat class="bg-primary text-white q-mb-lg">
          <q-card-section class="q-pa-lg">
            <div class="row items-center justify-between">
              <div class="col-12 col-md-8">
                <div class="row items-center q-mb-sm">
                  <q-icon name="analytics" size="48px" class="q-mr-md" />
                  <div>
                    <div class="text-h4 text-weight-bold">
                      Relatório de Acompanhamento de Desempenho
                    </div>
                    <div class="text-subtitle1 text-blue-2">
                      Q.A — {{ mesSelecionadoLabel }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-4 text-right">
                <q-btn-dropdown
                  color="white"
                  text-color="primary"
                  icon="event"
                  :label="mesSelecionadoLabel || 'Escolha o mês'"
                  size="lg"
                  unelevated
                  class="text-weight-bold"
                >
                  <q-list>
                    <q-item
                      v-for="item in meses"
                      :key="item.value"
                      clickable
                      v-close-popup
                      @click="definirPeriodo(item.value)"
                      :active="mesSelecionado === item.value"
                      active-class="bg-primary text-white"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="
                            mesSelecionado === item.value
                              ? 'check_circle'
                              : 'calendar_month'
                          "
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ item.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
            </div>

            <q-separator color="white" class="q-my-md" :dark="true" />

            <div class="text-body2 text-blue-1">
              Acompanhe o desempenho da equipe de Q.A através de métricas
              detalhadas de protocolos criados e atendimentos realizados.
              Selecione o período desejado para visualizar os dados.
            </div>
          </q-card-section>
        </q-card>

        <!-- Seção 1: Protocolos por Colaborador -->
        <q-card flat bordered class="shadow-2 q-mb-xl">
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon
                name="people"
                size="28px"
                color="primary"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-weight-bold text-grey-9">
                  1. Protocolos Testados por Colaborador
                </div>
                <div class="text-caption text-grey-7">
                  Visualize a produtividade individual da equipe
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-section class="q-pa-none">
            <QAReport :month="mesSelecionadoNumber" />
          </q-card-section>
        </q-card>

        <!-- Seção 2: Protocolos por Cliente -->
        <q-card flat bordered class="shadow-2 q-mb-lg">
          <q-card-section class="bg-grey-2">
            <div class="row items-center">
              <q-icon
                name="business_center"
                size="28px"
                color="primary"
                class="q-mr-md"
              />
              <div>
                <div class="text-h6 text-weight-bold text-grey-9">
                  2. Quantidade de Protocolos por Cliente
                </div>
                <div class="text-caption text-grey-7">
                  Análise comparativa: protocolos externos vs internos
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <SupportReportProtocolos :month="mesSelecionadoNumber" />
          </q-card-section>
        </q-card>

        <!-- Rodapé com informações -->
        <q-card flat bordered class="bg-blue-1 q-mt-lg">
          <q-card-section horizontal>
            <q-card-section class="col-auto flex items-center">
              <q-icon name="info" size="24px" color="blue-7" />
            </q-card-section>
            <q-card-section class="col">
              <div class="text-caption text-blue-9">
                <strong>Nota:</strong> Os dados apresentados são atualizados em
                tempo real e refletem apenas o período selecionado. Para
                exportar os relatórios, utilize as opções disponíveis em cada
                gráfico.
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import QAReport from 'src/components/charts/QAReport.vue';
import SupportReportProtocolos from 'src/components/charts/supportReportProtocolos.vue';

// Meses
const anoAtual = new Date().getFullYear();
const nomesMeses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const meses = Array.from({ length: 12 }, (_, i) => {
  const mes = String(i + 1).padStart(2, '0');
  return {
    label: `${nomesMeses[i]} de ${anoAtual}`,
    value: `${anoAtual}-${mes}`,
  };
});

const mesSelecionado = ref('');
const periodo = ref({ inicio: '', fim: '' });

const mesSelecionadoLabel = computed(() => {
  const m = meses.find((m) => m.value === mesSelecionado.value);
  return m ? m.label : '';
});

const mesSelecionadoNumber = computed(() => {
  return mesSelecionado.value
    ? Number(mesSelecionado.value.split('-')[1])
    : new Date().getMonth() + 1;
});

function definirPeriodo(valor) {
  const [ano, mes] = valor.split('-');
  const inicio = `${ano}-${mes}-01`;
  const fim = new Date(ano, Number(mes), 0).toISOString().split('T')[0];
  periodo.value = { inicio, fim };
  mesSelecionado.value = valor;
}

onMounted(() => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  mesSelecionado.value = `${ano}-${mes}`;
});
</script>
