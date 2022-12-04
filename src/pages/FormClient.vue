<template>
  <q-page padding>
    <q-form class="row q-col-gutter-sm" @submit="onSubmit" @reset="onReset">
      <q-input
        v-model="form.description"
        filled
        label="Descrição *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Por favor preencha']"
      />
      <q-input
        v-model="form.image"
        filled
        label="Image *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Por favor preencha']"
      />

      <q-input
        v-model="form.color"
        filled
        label="Image *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Por favor preencha']"
      />
      <div class="col-12 q-gutter-sm">
        <q-btn
          label="Salvar"
          color="primary"
          class="float-right"
          icon="save"
          type="submit"
        />
        <q-btn
          label="Cancelar"
          color="white"
          class="float-right"
          text-color="primary"
          :to="{ name: 'home' }"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import clientsService from 'src/services/clients';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormClient',
  setup() {
    const { post, getById, update } = clientsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      description: '',
      image: '',
      color: '',
    });

    onMounted(async () => {
      if (route.params.id) {
        getClient(route.params.id);
      }
    });

    const getClient = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
      } catch (error) {
        console.error(error);
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
        router.push({ name: 'home' });
      } catch (error) {
        console.error(error);
      }
    };

    return {
      form,
      onSubmit,
    };
  },
});
</script>
