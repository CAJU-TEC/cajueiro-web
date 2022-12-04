<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el
          label="Colaboradores"
          :to="{ name: 'collaborators.list' }"
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
        v-model="form.first_name"
        filled
        label="Primeiro Nome *"
        lazy-rules
        class="col-md-6 col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.last_name"
        filled
        label="Último Nome *"
        lazy-rules
        class="col-md-6 col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.formation"
        filled
        label="Formação *"
        lazy-rules
        hint="Formação academica ou cursos"
        class="col-md-6 col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-file
        filled
        @update:model-value="onChange($event)"
        v-model="form.imageInput"
        label="Imagem"
        class="col-md-6 col-lg-6 col-xs-12"
        accept=".jpg, .png, .jpeg"
      >
        <template #prepend>
          <q-icon name="file_upload" />
        </template>
      </q-file>

      <q-input
        v-model="form.email"
        filled
        label="E-mail *"
        lazy-rules
        class="col-md-6 col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <CajuDate
        v-if="loading === true"
        class="col-md-2 col-lg-2 col-xs-12"
        :text="form.birth"
        :label="'Data Nascimento*'"
        @input="(value) => (form.birth = value)"
      ></CajuDate>

      <CajuDate
        v-if="loading === true"
        :text="form.entrance"
        class="col-md-2 col-lg-2 col-xs-12"
        :label="'Ingresso na empresa*'"
        @input="(value) => (form.entrance = value)"
      ></CajuDate>

      <CajuDate
        v-if="loading === true"
        :text="form.egress"
        class="col-md-2 col-lg-2 col-xs-12"
        :label="'Egresso na empresa *'"
        @input="(value) => (form.egress = value)"
      ></CajuDate>

      <q-input
        v-model="form.cpf"
        filled
        label="CPF *"
        class="col-md-6 col-lg-6 col-xs-12"
        mask="###.###.###-##"
      />

      <q-input
        v-model="form.cnpj"
        filled
        label="CNPJ *"
        class="col-md-6 col-lg-6 col-xs-12"
        mask="##.###.###/####-##"
      />

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
            :to="{ name: 'collaborators.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useQuasar, useMeta } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import collaboratorsService from 'src/services/collaborators';
import CajuDate from 'src/components/CajuDate.vue';

export default defineComponent({
  name: 'FormCollaborator',
  setup() {
    const { post, getById, update } = collaboratorsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const title = ref('Colaboradores');
    const form = ref({
      first_name: '',
      last_name: '',
      formation: '',
      image: '',
      birth: '',
      entrance: '',
      egress: '',
      cpf: '',
      cnpj: '',
    });
    const loading = ref('true');

    onMounted(async () => {
      if (route.params.id) {
        getClient(route.params.id);
      } else {
        loading.value = true;
      }
    });
    useMeta(() => {
      return {
        title: title.value,
      };
    });

    const alterBirth = (value) => {
      form.value.birth = value;
    };

    const getClient = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
        loading.value = true;
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
        router.push({ name: 'collaborators.list' });
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
      onSubmit,
      onChange,
      alterBirth,
      loading,
    };
  },
  components: { CajuDate },
});
</script>
