<template>
  <q-page padding>
    <div class="q-pb-md">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Organizações" :to="{ name: 'corporates.list' }" />
        <q-breadcrumbs-el label="Grupos" />
      </q-breadcrumbs>
    </div>

    <q-table
      :rows="grupos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="Nenhum grupo cadastrado."
      :rows-per-page-options="[10, 25, 50]"
    >
      <template #top>
        <div>
          <div class="text-h4">Grupos de organizações</div>
          <div class="text-caption text-grey-7">Ex.: os municípios de um mesmo estado. Servem para separar a visualização.</div>
        </div>
        <q-space />
        <q-btn color="primary" push icon="add" label="Novo" @click="abrir()" />
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn-group push>
            <q-btn push icon="edit" color="blue" size="xs" @click="abrir(props.row)" />
            <q-btn push icon="delete_outline" color="red" size="xs" @click="apagar(props.row)" />
          </q-btn-group>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogo.show">
      <q-card style="min-width: 360px; max-width: 95vw">
        <q-form @submit="salvar">
          <q-card-section class="text-h6">{{ dialogo.id ? 'Editar grupo' : 'Novo grupo' }}</q-card-section>
          <q-card-section>
            <q-input
              v-model="dialogo.nome"
              autofocus
              filled
              label="Nome *"
              :rules="[(val) => (val && val.trim().length > 0) || 'Preencha o campo acima']"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn color="primary" label="Salvar" type="submit" :loading="dialogo.salvando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import corporateGroupsService from 'src/services/corporateGroups';

export default defineComponent({
  name: 'CorporateGroupsPage',
  setup() {
    const $q = useQuasar();
    const { list, post, update, remove } = corporateGroupsService();

    const grupos = ref([]);
    const loading = ref(true);
    const dialogo = ref({ show: false, id: null, nome: '', salvando: false });

    const columns = [
      { name: 'nome', align: 'left', label: 'Nome', field: 'nome', sortable: true },
      { name: 'corporates_count', align: 'center', label: 'Organizações', field: 'corporates_count' },
      { name: 'actions', align: 'center', label: 'Ações', field: 'actions' },
    ];

    const notificarErro = (error) =>
      $q.notify({ icon: 'block', message: 'Ops! Ocorreu um erro.', caption: error.message, color: 'negative' });

    const carregar = async () => {
      try {
        grupos.value = await list();
      } catch (error) {
        notificarErro(error);
      } finally {
        loading.value = false;
      }
    };

    const abrir = (grupo) => {
      dialogo.value = { show: true, id: grupo?.id || null, nome: grupo?.nome || '', salvando: false };
    };

    const salvar = async () => {
      dialogo.value.salvando = true;
      try {
        const dados = { id: dialogo.value.id, nome: dialogo.value.nome.trim() };
        await (dados.id ? update(dados) : post(dados));
        dialogo.value.show = false;
        $q.notify({ message: 'Dados salvos com sucesso', icon: 'check', color: 'positive' });
        await carregar();
      } catch (error) {
        notificarErro(error);
      } finally {
        dialogo.value.salvando = false;
      }
    };

    const apagar = (grupo) => {
      $q.dialog({
        title: 'Remover grupo',
        message: grupo.corporates_count
          ? `As ${grupo.corporates_count} organizações de "${grupo.nome}" não serão apagadas, só ficarão sem grupo.`
          : `Remover "${grupo.nome}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await remove(grupo.id);
          $q.notify({ message: 'Apagado com sucesso', icon: 'check', color: 'positive' });
          await carregar();
        } catch (error) {
          notificarErro(error);
        }
      });
    };

    onMounted(carregar);

    return { grupos, loading, columns, dialogo, abrir, salvar, apagar };
  },
});
</script>
