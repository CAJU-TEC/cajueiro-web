<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Impactos" :to="{ name: 'impacts.list' }" />
        <q-breadcrumbs-el label="Adicionar" />
      </q-breadcrumbs>
    </div>
    <q-form
      enctype="multipart/form-data"
      class="row q-col-gutter-sm"
      @submit="onSubmit"
    >
      <q-input
        v-model="form.description"
        filled
        label="Descrição *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        filled
        :input-style="{ backgroundColor: form.color }"
        v-model="form.color"
        :rules="['anyColor']"
        class="col-lg-4 col-xs-12"
      >
        <template #append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-color v-model="form.color" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="form.points"
        filled
        label="Pontos *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        mask="#.##"
        fill-mask="0"
        reverse-fill-mask
        hint="Máscata: #.##"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <div class="col-lg-12 col-xs-12">
        <q-input
          v-model="form.classification"
          label="Classificação *"
          filled
          type="textarea"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Preencha o campo acima',
          ]"
        />
      </div>

      <div class="col-lg-12 col-xs-12">
        <q-input
          v-model="form.example"
          label="Exemplo *"
          filled
          type="textarea"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Preencha o campo acima',
          ]"
        />
      </div>

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
            :to="{ name: 'impacts.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import impactsService from 'src/services/impacts';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormClient',
  setup() {
    const { post, getById, update } = impactsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      description: '',
      color: '',
      points: '',
      classification: '',
      example: '',
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
        router.push({ name: 'impacts.list' });
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
