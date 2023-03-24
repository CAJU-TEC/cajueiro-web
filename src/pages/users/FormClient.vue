<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Usuários" :to="{ name: 'users.list' }" />
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
        label="Nome *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.email"
        filled
        label="E-mail *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.password"
        filled
        label="Password *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <div class="row">
        <div class="col">
          <div class="q-gutter-sm">
            <h6 class="q-ma-xs q-pa-xs">Lista de grupos:</h6>
            <q-option-group
              :options="roles"
              v-model="form.roles"
              type="checkbox"
            />
          </div>
        </div>
        <div class="col">
          <div class="q-gutter-sm">
            <h6 class="q-ma-xs q-pa-xs">Lista de permissões:</h6>
            <q-option-group
              :options="permissions"
              v-model="form.permissions"
              type="checkbox"
            />
          </div>
        </div>
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
            :to="{ name: 'users.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import usersService from 'src/services/users';
import groupsService from 'src/services/groups';
import permissionsService from 'src/services/permissions';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormUsers',
  setup() {
    const { post, getById, update } = usersService();
    const { list: listRoles } = groupsService();
    const { list: listPermissions } = permissionsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      name: '',
      email: '',
      roles: [],
      permissions: [],
    });
    const roles = ref([]);
    const permissions = ref([]);

    onMounted(async () => {
      if (route.params.id) {
        getUsers(route.params.id);
      }
      getRoles();
      getPermissions();
    });

    const getUsers = async (id) => {
      try {
        const response = await getById(id);
        const payloadRoles = response.roles;
        const payloadPermissions = response.permissions;
        response.roles = payloadRoles.map((e) => e.id);
        response.permissions = payloadPermissions.map((e) => e.id);
        form.value = response;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'negative',
        });
      }
    };

    const getRoles = async () => {
      try {
        const payload = await listRoles();
        roles.value = payload.map((e) => {
          return {
            label: e.name,
            value: e.id,
          };
        });
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro nos grupos.',
          icon: 'check',
          color: 'negative',
        });
      }
    };

    const getPermissions = async () => {
      try {
        const payload = await listPermissions();
        permissions.value = payload.map((e) => {
          return {
            label: e.name,
            value: e.id,
          };
        });
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro nas permissões.',
          icon: 'check',
          color: 'negative',
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
        router.push({ name: 'users.list' });
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
      roles,
      permissions,
      form,
      onSubmit,
    };
  },
});
</script>
