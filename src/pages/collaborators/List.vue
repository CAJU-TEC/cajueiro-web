<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Colaboradores" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="collaborators"
      :columns="columns"
      row-key="description"
      no-data-label="Não existe dados no momento."
      rows-per-page-label="10"
      :rows-per-page-options="[10, 15, 20]"
      :loading="loading"
    >
      <template #top>
        <span class="text-h4">Colaboradores</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'collaborators.form' }">
          <div class="row items-center no-wrap">
            <q-icon left name="add" />
            <div class="text-center">Novo</div>
          </div>
        </q-btn>
      </template>
      <template #body="props">
        <q-tr :props="props">
          <q-td
            class="q-gutter-sm"
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          >
            <span v-if="col.name != 'image'">{{ col.value }}</span>
            <q-avatar v-if="col.name == 'image' && props.row.image">
              <img
                :src="`https://cajueiroapi.cajutec.com.br/storage/images/${props.row.image.uri}`"
              />
            </q-avatar>
            <q-avatar
              v-if="col.name == 'image' && !props.row.image"
              color="primary"
              >{{ props.row.letter }}</q-avatar
            >

            <span v-if="col.name === 'full_name'">
              {{ props.row.full_name }}
              <q-tooltip> Login: {{ props.row.user.email }} </q-tooltip>
            </span>

            <span v-if="col.name === 'jobplan'">
              <q-badge
                rounded
                :style="`background: ${props.row.jobplan?.color};`"
              >
                {{ props.row.jobplan?.description }}
                <q-tooltip> Valor: {{ props.row.jobplan?.value }} </q-tooltip>
              </q-badge>
            </span>

            <q-btn-group v-if="col.name == 'actions'" push>
              <q-btn
                push
                icon="edit"
                color="blue"
                size="xs"
                @click="handleEditClient(props.row.id)"
              />
              <q-btn
                push
                icon="delete_outline"
                color="red"
                size="xs"
                @click="handleDeleteClient(props.row.id)"
              />
            </q-btn-group>
          </q-td>
        </q-tr>
      </template>
      <template #loading>
        <q-inner-loading showing color="secondy"> </q-inner-loading>
      </template>
      <template #no-data="{ icon, message, filter }">
        <div class="full-width row flex-center text-accent q-gutter-sm">
          <q-icon size="2em" name="sentiment_dissatisfied" />
          <span> Bem, isso é triste... {{ message }} </span>
          <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import collaboratorsService from 'src/services/collaborators';

export default defineComponent({
  name: 'ListPage',
  setup() {
    const collaborators = ref([]);
    const { list, remove } = collaboratorsService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();

    const columns = [
      {
        name: 'image',
        align: 'center',
        label: '#',
        field: 'image',
      },
      {
        name: 'full_name',
        align: 'center',
        label: 'Me chamam!',
      },
      {
        name: 'jobplan',
        align: 'center',
        label: 'Que tipo de caju sou eu?',
      },
      {
        name: 'cpf',
        align: 'center',
        label: 'CPF',
        field: 'cpf',
      },
      {
        name: 'cnpj',
        align: 'center',
        label: 'CNPJ',
        field: 'cnpj',
      },
      {
        name: 'actions',
        align: 'center',
        label: 'Ações',
        field: 'actions',
      },
    ];

    const $q = useQuasar();
    const router = useRouter();

    onMounted(() => {
      getClients();
      loading.value = true;
    });

    const getClients = async () => {
      try {
        const data = await list();
        collaborators.value = data;
        loading.value = false;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro',
          icon: 'block',
          color: 'negative',
        });
      }
    };

    const handleDeleteClient = async (id) => {
      try {
        $q.dialog({
          title: 'Remover',
          message: 'Deseja remover ou deletar?',
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          await remove(id);
          $q.notify({
            message: 'Apagado com sucesso',
            icon: 'check',
            color: 'positive',
          });
          await getClients();
        });
      } catch (error) {
        $q.notify({
          message: 'Erro ao apagar cliente',
          icon: 'times',
          color: 'negative',
        });
      }
    };

    const handleEditClient = async (id) => {
      router.push({ name: 'collaborators.form', params: { id } });
    };

    return {
      collaborators,
      columns,
      handleDeleteClient,
      handleEditClient,
      pagination,
      loading,
    };
  },
});
</script>
