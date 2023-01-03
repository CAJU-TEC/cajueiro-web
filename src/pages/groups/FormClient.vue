<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Grupos" :to="{ name: 'groups.list' }" />
        <q-breadcrumbs-el label="Adicionar" />
      </q-breadcrumbs>
    </div>
    <q-form
      enctype="multipart/form-data"
      class="row q-col-gutter-sm"
      @submit="onSubmit"
    >
      <q-input
        v-model="form.name"
        filled
        label="Nome do rota *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.display_name"
        filled
        label="Nome do grupo *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.description"
        filled
        label="Descrição *"
        lazy-rules
        type="textarea"
        class="col-lg-12 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
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
            :to="{ name: 'groups.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import groupsService from 'src/services/groups';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormClient',
  setup() {
    const { post, getById, update } = groupsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      name: '',
      display_name: '',
      description: '',
    });

    onMounted(async () => {
      if (route.params.id) {
        getGroups(route.params.id);
      }
    });

    const getGroups = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
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
        router.push({ name: 'groups.list' });
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
    };
  },
});
</script>
