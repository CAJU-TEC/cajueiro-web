<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Times" :to="{ name: 'teams.list' }" />
        <q-breadcrumbs-el :label="form.id ? 'Editar' : 'Adicionar'" />
      </q-breadcrumbs>
    </div>
    <q-form class="row q-col-gutter-sm" @submit="onSubmit">
      <q-input
        v-model="form.name"
        filled
        label="Nome do time *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.description"
        filled
        label="Descrição"
        class="col-lg-4 col-xs-12"
      />

      <q-input
        filled
        :input-style="{ backgroundColor: form.color }"
        v-model="form.color"
        label="Cor"
        :rules="['anyColor']"
        class="col-lg-4 col-xs-12"
      >
        <template #append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-color v-model="form.color" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

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
            :to="{ name: 'teams.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import teamsService from 'src/services/teams';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormTeam',
  setup() {
    const { post, getById, update } = teamsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      name: '',
      description: '',
      color: '',
    });

    onMounted(async () => {
      if (route.params.id) {
        getTeam(route.params.id);
      }
    });

    const getTeam = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          caption: error.message,
          icon: 'block',
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
        router.push({ name: 'teams.list' });
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
