<template>
  <div class="q-pa-md">
    <q-btn-dropdown stretch flat label="Perfil">
      <div class="row no-wrap q-pa-md">
        <div class="column">
          <div class="text-h6 q-mb-md">Settings</div>
          <q-toggle v-model="mobileData" label="Use Mobile Data" />
          <q-toggle v-model="bluetooth" label="Bluetooth" />
        </div>

        <q-separator vertical inset class="q-mx-lg" />

        <div class="column items-center">
          <q-avatar size="72px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">John Doe</div>

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
import { ref } from 'vue';

export default {
  setup() {
    const router = useRouter();

    const logout = () => {
      router.push({ name: 'auth.logout' });
    };
    return {
      logout,
      mobileData: ref(false),
      bluetooth: ref(false),
    };
  },
};
</script>
