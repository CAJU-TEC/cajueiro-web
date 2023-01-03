<template>
  <div>Logout</div>
</template>

<script>
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user/user-store.js';

export default {
  name: 'LogoutPage',
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const userStore = useUserStore();

    $q.notify({
      message: 'Tchau! Volta depois. :)',
      type: 'info',
    });
    userStore.clearUser();
    router.push({ name: 'auth.login' });
    return {};
  },
};
</script>

<style lang="scss" scoped></style>
