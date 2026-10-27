<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Atualizar bancos" :to="{ name: 'apps.list' }" />
        <q-breadcrumbs-el label="Histórico" />
      </q-breadcrumbs>
    </div>
    <q-table
      :rows="dumps"
      :columns="columns"
      row-key="id"
      no-data-label="Nenhuma atualização registrada."
      :rows-per-page-options="[10, 15, 20]"
      :loading="loading"
    >
      <template #top>
        <span class="text-h4">Histórico de atualizações</span>
        <q-space />
        <q-btn color="primary" push icon="refresh" label="Recarregar" @click="getDumps" />
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="cores[props.row.status]" :label="rotulos[props.row.status]" />
          <q-tooltip v-if="props.row.erro">{{ props.row.erro }}</q-tooltip>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import dumpsService from 'src/services/dumps';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'AppsHistoricoPage',
  setup() {
    const { list } = dumpsService();
    const $q = useQuasar();
    const dumps = ref([]);
    const loading = ref(false);

    const rotulos = {
      pendente: 'Pendente',
      executando: 'Em execução',
      concluido: 'Concluído',
      falha: 'Erro',
    };
    const cores = {
      pendente: 'grey',
      executando: 'primary',
      concluido: 'positive',
      falha: 'negative',
    };

    const columns = [
      { name: 'app', align: 'center', label: 'Organização', field: (r) => r.corporate?.nome },
      { name: 'destino', align: 'center', label: 'Destino', field: (r) => r.destino?.toUpperCase() },
      { name: 'status', align: 'center', label: 'Status', field: 'status' },
      { name: 'user', align: 'center', label: 'Disparado por', field: (r) => r.user?.name },
      { name: 'started_at', align: 'center', label: 'Início', field: 'started_at' },
      { name: 'finished_at', align: 'center', label: 'Fim', field: 'finished_at' },
    ];

    const getDumps = async () => {
      loading.value = true;
      try {
        dumps.value = await list();
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      } finally {
        loading.value = false;
      }
    };

    onMounted(getDumps);

    return { dumps, columns, loading, rotulos, cores, getDumps };
  },
});
</script>
