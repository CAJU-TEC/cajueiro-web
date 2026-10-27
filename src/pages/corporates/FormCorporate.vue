<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el
          label="Organizações"
          :to="{ name: 'corporates.list' }"
        />
        <q-breadcrumbs-el label="Adicionar" />
      </q-breadcrumbs>
    </div>
    <q-form
      enctype="multipart/form-data"
      class="row q-col-gutter-sm"
      @submit="onSubmit"
    >
      <q-input
        v-model="form.initials"
        filled
        label="Iniciais *"
        lazy-rules
        class="col-lg-2 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.first_name"
        filled
        label="Primeiro Nome *"
        lazy-rules
        class="col-lg-5 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.last_name"
        filled
        label="Último Nome *"
        lazy-rules
        class="col-lg-5 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />
      <q-input
        v-model="form.email"
        filled
        label="E-mail *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-select
        v-model="form.corporate_group_id"
        filled
        clearable
        emit-value
        map-options
        :options="grupos"
        option-value="id"
        option-label="nome"
        label="Grupo (ex.: estado)"
        class="col-lg-6 col-xs-12"
      />

      <q-file
        filled
        @update:model-value="onChange($event)"
        v-model="form.imageInput"
        label="Imagem"
        class="col-lg-6 col-xs-12"
        accept=".jpg, .png, .jpeg"
      >
        <template #prepend>
          <q-icon name="file_upload" />
        </template>
      </q-file>

      <div class="col-lg-12 col-xs-12">
        <q-input
          v-model="form.address"
          label="Endereço *"
          filled
          type="textarea"
        />
      </div>

      <div class="col-12 q-mt-md">
        <div class="text-subtitle1 text-weight-medium">Banco de dados</div>
        <div class="text-caption text-grey-7">
          Usado pela atualização de DEV/HMG a partir de PROD. A organização só aparece lá se estiver ativa e com o
          banco de produção preenchido.
        </div>
      </div>

      <div class="col-12">
        <q-toggle v-model="form.ativo" label="Ativo" />
      </div>

      <template v-for="amb in ambientes" :key="amb.chave">
        <q-input
          v-model="form['host_' + amb.chave]"
          filled
          :label="`Host ${amb.rotulo}`"
          class="col-lg-6 col-xs-12"
        />
        <q-input
          v-model="form['banco_' + amb.chave]"
          filled
          :label="`Banco ${amb.rotulo}`"
          class="col-lg-6 col-xs-12"
          :rules="[(val) => !val || /^[A-Za-z0-9_]+$/.test(val) || 'Use só letras, números e _']"
        />
      </template>

      <div class="col-12 q-gutter-sm">
        <q-btn-group push class="float-right">
          <q-btn
            push
            label="Salvar"
            color="primary"
            icon="save_alt"
            type="submit"
          />
          <q-btn
            push
            label="Cancelar"
            color="blue-10"
            :to="{ name: 'corporates.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watchEffect } from 'vue';
import corporatesService from 'src/services/corporate';
import corporateGroupsService from 'src/services/corporateGroups';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormClient',
  setup() {
    const { post, getById, update } = corporatesService();
    const { list: listGroups } = corporateGroupsService();
    const grupos = ref([]);
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      initials: '',
      first_name: '',
      last_name: '',
      email: '',
      image: '',
      address: '',
      ativo: false,
      corporate_group_id: null,
      host_prod: '',
      banco_prod: '',
      host_dev: '',
      banco_dev: '',
      host_hmg: '',
      banco_hmg: '',
    });

    const ambientes = [
      { chave: 'prod', rotulo: 'PROD' },
      { chave: 'dev', rotulo: 'DEV' },
      { chave: 'hmg', rotulo: 'HMG' },
    ];

    onMounted(async () => {
      try {
        grupos.value = await listGroups();
      } catch (error) {
        grupos.value = [];
      }

      if (route.params.id) {
        getClient(route.params.id);
      }
    });

    // watchEffect(() => {
    //   form.value.initials = form.value.initials.toUpperCase();
    // });

    const getClient = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
        form.value.email = response.email?.description;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const onChange = (event) => {
      createBase64Image(event);
    };

    const createBase64Image = (fileObject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        form.value.image = reader.result;
      };

      reader.readAsDataURL(fileObject);
    };

    const onSubmit = async () => {
      try {
        if (form.value.id) {
          await update(form.value);
        } else {
          await post(form.value);
        }

        $q.notify({
          message: 'Dados salvos com sucesso',
          icon: 'check',
          color: 'positive',
        });
        router.push({ name: 'corporates.list' });
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      }
    };

    return {
      form,
      ambientes,
      grupos,
      onSubmit,
      onChange,
    };
  },
});
</script>
