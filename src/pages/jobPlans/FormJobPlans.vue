<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el
          label="Planos de trabalho"
          :to="{ name: 'jobPlans.list' }"
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
        v-model="form.description"
        filled
        label="Descrição *"
        lazy-rules
        class="col-lg-3 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        filled
        :input-style="{ backgroundColor: form.color }"
        v-model="form.color"
        label="Colores *"
        :rules="['anyColor']"
        class="col-lg-3 col-xs-12"
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
        v-model="form.value"
        filled
        label="Valor R$ *"
        lazy-rules
        class="col-lg-3 col-xs-12"
        mask="#.##"
        fill-mask="0"
        reverse-fill-mask
        hint="Máscata: #.##"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.time"
        filled
        label="Período *"
        lazy-rules
        class="col-lg-3 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <div class="col-lg-12 col-xs-12">
        <q-input
          v-model="form.note"
          label="Observações *"
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
            :to="{ name: 'jobPlans.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import jobPlansService from 'src/services/jobPlans';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormJobPlans',
  setup() {
    const { post, getById, update } = jobPlansService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      description: '',
      color: '',
      value: '',
      time: '',
      note: '',
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
        router.push({ name: 'jobPlans.list' });
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
