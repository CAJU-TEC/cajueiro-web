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
        <q-btn
          color="orange-8"
          push
          class="q-mr-sm"
          :loading="downloading"
          @click="handleDownloadBirthdays"
        >
          <div class="row items-center no-wrap">
            <q-icon left name="cake" />
            <div class="text-center">Aniversários</div>
          </div>
          <q-tooltip>Baixar o cartaz de aniversariantes em PDF</q-tooltip>
        </q-btn>
        <q-btn
          color="teal-7"
          push
          class="q-mr-sm"
          :loading="downloadingAnniversaries"
          @click="handleDownloadAnniversaries"
        >
          <div class="row items-center no-wrap">
            <q-icon left name="workspace_premium" />
            <div class="text-center">Aniversário de casa</div>
          </div>
          <q-tooltip>Baixar o cartaz de tempo de casa em PDF</q-tooltip>
        </q-btn>
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
            <CollaboratorAvatar
              v-if="col.name == 'image'"
              :collaborator="props.row"
            />

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

            <span v-if="col.name === 'team'">
              <q-badge
                v-if="props.row.team"
                rounded
                :style="`background: ${props.row.team?.color || '#1976d2'};`"
              >
                {{ props.row.team?.name }}
              </q-badge>
              <span v-else class="text-grey-6">-</span>
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
import CollaboratorAvatar from 'src/components/avatar/CollaboratorAvatar.vue';

export default defineComponent({
  components: { CollaboratorAvatar },
  name: 'ListPage',
  setup() {
    const collaborators = ref([]);
    const { list, remove, birthdaysReport, anniversariesReport } = collaboratorsService();
    const pagination = ref({
      sortBy: 'description',
      descending: false,
      page: 1,
      rowsPerPage: 15,
    });
    const loading = ref();
    const downloading = ref(false);
    const downloadingAnniversaries = ref(false);

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
        name: 'team',
        align: 'center',
        label: 'Time',
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

    const handleDownloadBirthdays = async () => {
      downloading.value = true;
      let url = null;
      try {
        url = URL.createObjectURL(await birthdaysReport());
        const link = document.createElement('a');
        link.href = url;
        link.download = 'aniversarios-caju.pdf';
        link.click();
      } catch (error) {
        $q.notify({
          message: 'Ops! Não foi possível gerar o cartaz de aniversários',
          icon: 'block',
          color: 'negative',
        });
      } finally {
        if (url) URL.revokeObjectURL(url);
        downloading.value = false;
      }
    };

    const handleDownloadAnniversaries = async () => {
      downloadingAnniversaries.value = true;
      let url = null;
      try {
        url = URL.createObjectURL(await anniversariesReport());
        const link = document.createElement('a');
        link.href = url;
        link.download = 'aniversarios-de-casa-caju.pdf';
        link.click();
      } catch (error) {
        $q.notify({
          message: 'Ops! Não foi possível gerar o cartaz de tempo de casa',
          icon: 'block',
          color: 'negative',
        });
      } finally {
        if (url) URL.revokeObjectURL(url);
        downloadingAnniversaries.value = false;
      }
    };

    return {
      collaborators,
      columns,
      handleDeleteClient,
      handleEditClient,
      handleDownloadBirthdays,
      handleDownloadAnniversaries,
      pagination,
      loading,
      downloading,
      downloadingAnniversaries,
    };
  },
});
</script>
