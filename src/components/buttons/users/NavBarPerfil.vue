<template>
  <div class="q-pa-md">
    <q-btn-dropdown stretch flat label="Perfil">
      <div class="row no-wrap q-pa-md" style="max-width: 400px">
        <div class="column">
          <div class="q-pa-md q-gutter-xs">
            <div class="text-h6 q-mb-md``">Grupos</div>
            <q-badge
              v-for="badge in user.roles.map((e) => e.name)"
              color="grey"
              :label="badge"
              :key="badge"
            ></q-badge>
          </div>
        </div>

        <q-separator vertical inset class="q-mx-lg" />

        <div class="column items-center">
          <q-avatar size="72px">
            <img :src="getImage()" />
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">{{ user.name }}</div>

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
import usersService from 'src/services/users';
import { onMounted, ref } from 'vue';

export default {
  setup() {
    const router = useRouter();
    const { fetchUser } = usersService();

    onMounted(async () => {
      handleGetUser();
    });

    const user = ref({});

    const handleGetUser = async () => {
      const dados = await fetchUser();
      user.value = dados.data.user;
    };

    const getImage = () => {
      if (!user.value.collaborator?.image?.uri) {
        return 'https://cdn.quasar.dev/img/boy-avatar.png';
      }

      return `https://cajueiro.cajutec.com/storage/images/${user.value.collaborator?.image?.uri}`;
    };

    const logout = () => {
      router.push({ name: 'auth.logout' });
    };
    return {
      logout,
      getImage,
      user,
    };
  },
};
</script>
