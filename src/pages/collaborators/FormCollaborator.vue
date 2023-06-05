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
        class="col-md-4 col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-select
        filled
        label="Plano de Trabalho *"
        v-model="form.jobplan_id"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="options"
        @filter="filterFn"
        class="col-lg-4 col-xs-12"
        emit-value
        map-options
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey"> Sem resultados </q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-file
        filled
        @update:model-value="onChange($event)"
        v-model="form.imageInput"
        label="Imagem"
        class="col-md-4 col-lg-4 col-xs-12"
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
        class="col-md-4 col-lg-4 col-xs-12"
        mask="###.###.###-##"
      />

      <q-input
        v-model="form.cnpj"
        filled
        label="CNPJ *"
        class="col-md-4 col-lg-4 col-xs-12"
        mask="##.###.###/####-##"
      />

      <q-input
        v-model="form.pix"
        filled
        label="PIX *"
        class="col-md-4 col-lg-4 col-xs-12"
      />

      <q-input
        v-model="form.address"
        filled
        label="Endereço *"
        class="col-md-4 col-lg-4 col-xs-12"
      />

      <q-input
        v-model="form.postal"
        filled
        label="CEP *"
        class="col-md-4 col-lg-4 col-xs-12"
        mask="##.###-###"
      />

      <q-input
        v-model="form.number"
        filled
        label="Número *"
        class="col-md-4 col-lg-4 col-xs-12"
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
import jobPlansService from 'src/services/jobPlans';

export default defineComponent({
  name: 'FormCollaborator',
  setup() {
    const { post, getById, update } = collaboratorsService();
    const { list } = jobPlansService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const title = ref('Colaboradores');
    const form = ref({
      jobplan_id: '',
      first_name: '',
      last_name: '',
      formation: '',
      image: '',
      birth: '',
      entrance: '',
      egress: '',
      cpf: '',
      cnpj: '',
      email: '',
      address: '',
      postal: '',
      number: '',
      pix: '',
    });
    const loading = ref('true');
    const options = ref();
    const stringOptions = ref(options);

    onMounted(async () => {
      getJobPlan();
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
        form.value.email = response.email?.description;
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
    const getJobPlan = async () => {
      try {
        const response = await list();
        options.value = response.map((m) => {
          return { value: m.id, label: `${m.description} [${m.value}]` };
        });
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };
    const filterFn = (val, update, abort) => {
      update(() => {
        const needle = val.toLowerCase();
        options.value = stringOptions.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
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
      options,
      filterFn,
      stringOptions,
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
