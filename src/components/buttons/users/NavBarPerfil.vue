<template>
  <div class="q-pa-md">
    <q-btn-dropdown stretch flat label="Perfil">
      <div class="row no-wrap q-pa-md" style="max-width: 400px">
        <div class="column">
          <div class="q-pa-md q-gutter-xs">
            <div class="text-h6 q-mb-md``">Grupos</div>
            <q-badge
              v-for="badge in user.getRoles.map((e) => e.name)"
              color="grey"
              :label="badge"
              :key="badge"
            ></q-badge>
          </div>
        </div>

        <q-separator vertical inset class="q-mx-lg" />

        <div class="column items-center">
          <q-avatar size="72px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">{{ user.getName }}</div>

          <q-btn
            @click="() => logout()"
            color="primary"
            label="Sair"
            push
            size="sm"
            v-close-popup
          />
        </div>
      </div>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useUserStore } from '../../../stores/user/user-store.js';

export default {
  setup() {
    const router = useRouter();
    const store = useUserStore();

    const user = {
      getId: store.id,
      getName: store.name,
      getEmail: store.email,
      getPermisssion: store.permissions,
      getRoles: store.roles,
    };

    const logout = () => {
      router.push({ name: 'auth.logout' });
    };
    return {
      logout,
      user,
    };
  },
};
</script>
