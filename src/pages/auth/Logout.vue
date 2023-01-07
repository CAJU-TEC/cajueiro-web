<template>
  <div>Logout</div>
</template>

<script>
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user/user-store.js';
import authService from 'src/services/auth';

export default {
  name: 'LogoutPage',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const userStore = useUserStore();
    const { removeAccessToken } = authService();

    $q.notify({
      message: 'Tchau! Volta depois. :)',
      type: 'info',
    });
    userStore.clearUser();
    removeAccessToken();

    router.push({ name: 'auth.login' });
    return {};
  },
};
</script>

<style lang="scss" scoped></style>
