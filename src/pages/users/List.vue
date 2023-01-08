<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Usuários" />
      </q-breadcrumbs>
    </div>
    <q-table
      v-model="pagination"
      :rows="users"
      :columns="columns"
      row-key="full_name"
      no-data-label="Não existe dados no momento."
      rows-per-page-label="10"
      :rows-per-page-options="[10, 15, 20]"
      :loading="loading"
    >
      <template #top>
        <span class="text-h4">Usuários</span>
        <q-space />
        <q-btn color="primary" push :to="{ name: 'users.form' }">
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
                :src="`http://localhost:8000/storage/images/${props.row.image.uri}`"
              />
            </q-avatar>
            <q-avatar
              v-if="col.name == 'image' && !props.row.image"
              color="primary"
              >{{ props.row.letter }}</q-avatar
            >
            <span v-if="col.name == 'roles'">
              <div class="q-pa-md q-gutter-xs">
                <q-badge
                  v-for="badge in props.row.roles.map((e) => e.name)"
                  color="grey"
                  :label="badge"
                  :key="badge"
                ></q-badge>
              </div>
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
import usersService from 'src/services/users';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ListPage',
  setup() {
    const users = ref([]);
    const { list, remove } = usersService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();

    const columns = [
      {
        name: 'name',
        align: 'center',
        label: '#',
        field: 'name',
      },
      {
        name: 'email',
        align: 'center',
        label: 'E-mail',
        field: 'email',
      },
      {
        name: 'roles',
        align: 'center',
        label: 'Grupos',
        field: '',
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
      getUsers();
      loading.value = true;
    });

    const getUsers = async () => {
      try {
        const data = await list();
        users.value = data;
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
          await getUsers();
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
      router.push({ name: 'users.form', params: { id } });
    };

    return {
      users,
      columns,
      handleDeleteClient,
      handleEditClient,
      pagination,
      loading,
    };
  },
});
</script>
