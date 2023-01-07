<template>
  <q-page
    class="window-height window-width row justify-center items-center"
    style="background: linear-gradient(135deg, #48cae4 0%, #0077b6 100%)"
  >
    <div class="column">
      <div class="row">
        <q-card
          square
          dark
          class="q-pa-md q-ma-none no-shadow bg-blue-10"
          style="width: 320px"
        >
          <q-card-section class="q-mt-xl q-mb-md">
            <p class="text-weight-bolder text-white">Cajueiro versão 1.0.0</p>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input
                dark
                standout="text-white"
                dense
                square
                filled
                clearable
                v-model="form.email"
                type="email"
                label="Email"
              >
                <template #:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>
              <q-input
                dark
                standout="text-white"
                dense
                square
                filled
                clearable
                v-model="form.password"
                type="password"
                label="Password"
              >
                <template #:prepend>
                  <q-icon name="lock" />
                </template>
              </q-input>
            </q-form>
          </q-card-section>
          <q-card-actions>
            <div class="row full-width items-center">
              <div class="col-6">
                <q-btn
                  outline
                  rounded
                  size="md"
                  color="primary"
                  class="full-width text-white"
                  label="Entrar"
                  @click="() => login()"
                />
              </div>
              <div class="col-6">
                <p class="text-no-wrap text-grey text-caption text-right">:)</p>
              </div>
            </div>
          </q-card-actions>
          <q-card-section>
            <p class="text-caption text-weight-light text-grey">
              É sempre importante você está por aqui! Que hoje seja um ótimo
              dia.
            </p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { useUserStore } from '../../stores/user/user-store.js';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginPage',
  setup() {
    const userStore = useUserStore();
    const $q = useQuasar();
    const router = useRouter();
    const form = ref({
      email: ref(''),
      password: ref(''),
    });

    const login = async () => {
      try {
        await userStore.getSanctumCookie();
        await userStore.login(form.value).then((response) => {
          $q.notify({
            type: 'positive',
            message: 'Que da hora!',
            caption: response,
          });
          router.push({ name: 'home' });
        });
        const user = await userStore.fetchUser();
        userStore.setUser(user.data.user);
      } catch (error) {
        userStore.clearUser();
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      }
    };
    return {
      login,
      form,
    };
  },
};
</script>

<style lang="scss" scoped></style>
