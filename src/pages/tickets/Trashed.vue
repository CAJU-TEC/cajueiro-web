<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el
          label="Protocolos"
          :to="{ name: 'tickets.list' }"
          @click="markListRestore"
        />
        <q-breadcrumbs-el label="Apagados" />
      </q-breadcrumbs>
    </div>

    <q-table
      flat
      bordered
      title="Protocolos apagados"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :filter="filter"
      :pagination="{ rowsPerPage: 15, sortBy: 'deleted_at', descending: true }"
      no-data-label="Nenhum protocolo apagado"
      rows-per-page-label="Linhas por página"
    >
      <template #top-right>
        <q-input
          v-model="filter"
          dense
          outlined
          debounce="300"
          placeholder="Buscar protocolo"
        >
          <template #append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn
            flat
            round
            dense
            size="sm"
            color="primary"
            icon="restore_from_trash"
            @click="confirmRestore(props.row)"
          >
            <q-tooltip>Restaurar protocolo</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import ticketsService from 'src/services/tickets';
import platform from 'src/support/tickets/platform';
import { markListRestore } from 'src/support/tickets/listTab';

const formatDateTime = (value) =>
  value ? new Date(String(value).replace(' ', 'T')).toLocaleString('pt-BR') : '';

export default defineComponent({
  name: 'TicketsTrashed',
  setup() {
    const $q = useQuasar();
    const { listTrashed, restore } = ticketsService();
    const rows = ref([]);
    const loading = ref(false);
    const filter = ref('');

    const columns = [
      { name: 'code', label: 'Código', field: 'code', align: 'left', sortable: true },
      { name: 'subject', label: 'Título', field: 'subject', align: 'left', sortable: true },
      { name: 'client', label: 'Cliente', field: 'client', align: 'left', sortable: true },
      {
        name: 'platform',
        label: 'Plataforma',
        field: (row) => platform[row.platform]?.title ?? row.platform,
        align: 'left',
        sortable: true,
      },
      {
        name: 'deleted_at',
        label: 'Apagado em',
        field: 'deleted_at',
        format: formatDateTime,
        align: 'left',
        sortable: true,
      },
      {
        name: 'deleted_by',
        label: 'Apagado por',
        field: (row) => row.deleted_by ?? 'Não registrado',
        align: 'left',
        sortable: true,
      },
      { name: 'actions', label: '', field: 'id', align: 'right' },
    ];

    const load = async () => {
      loading.value = true;
      try {
        rows.value = await listTrashed();
      } catch (error) {
        $q.notify({
          message: 'Não foi possível carregar os protocolos apagados.',
          icon: 'block',
          color: 'negative',
        });
      } finally {
        loading.value = false;
      }
    };

    const confirmRestore = (ticket) => {
      $q.dialog({
        title: 'Restaurar protocolo',
        message: `Tem certeza que deseja restaurar o protocolo #${ticket.code}? Ele voltará a aparecer nas listas.`,
        persistent: true,
        cancel: { label: 'Cancelar', flat: true },
        ok: { label: 'Restaurar' },
      }).onOk(async () => {
        try {
          await restore(ticket.id);
          $q.notify({
            message: `Protocolo #${ticket.code} restaurado com sucesso`,
            icon: 'check',
            color: 'positive',
          });
          await load();
        } catch (error) {
          $q.notify({
            message: 'Não foi possível restaurar o protocolo.',
            icon: 'block',
            color: 'negative',
          });
        }
      });
    };

    onMounted(load);

    return { rows, columns, loading, filter, confirmRestore, markListRestore };
  },
});
</script>
