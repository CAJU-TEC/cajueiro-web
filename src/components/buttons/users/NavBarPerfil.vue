<template>
  <div class="q-pa-md">
    <q-btn flat round dense icon="sms" class="q-ml-md" @click="openDialog()">
      <q-badge
        v-if="notificationsUnReads.length > 0"
        color="red"
        :label="notificationsUnReads.length"
        floating
      ></q-badge>
    </q-btn>
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
    <tickets-notifications
      v-model="inputValue"
      :notifications="notificationsAll"
    />
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import Pusher from 'pusher-js';
import usersService from 'src/services/users';
import ticketsService from 'src/services/tickets';
import { onMounted, ref } from 'vue';
import TicketsNotifications from 'src/components/dialogs/notifications/TicketsNotifications.vue';

export default {
  setup() {
    const router = useRouter();
    const { fetchUser } = usersService();
    const { notifications } = ticketsService();
    const notificationsUnReads = ref({});
    const notificationsReads = ref({});
    const notificationsAll = ref({});

    const $q = useQuasar();

    onMounted(async () => {
      handleGetUser();
      await getPusher();
      await getNotifications();
    });

    const getCountUnRead = async () => {
      const result = await getNotifications();
      return result;
    };

    const pusherMessage = ref([]);

    const getPusher = () => {
      const pusher = new Pusher('429c853a3dec3f30148c', {
        cluster: 'sa1',
      });

      const channel = pusher.subscribe('tickets-notification');
      channel.bind('notification-tickets-pusher', function (data) {
        if (data) {
          getNotifications();
        }
      });
    };

    const getNotifications = async () => {
      try {
        const data = await notifications();
        notificationsAll.value = data;
        notificationsUnReads.value = notificationsAll.value.unRead;
        notificationsReads.value = notificationsAll.value.read;
        return data;
      } catch (error) {
        $q.notify({
          message: error.message ?? 'Ops! Ocorreu algum erro',
          icon: 'block',
          color: 'negative',
        });
      }
    };

    const user = ref({});
    const inputValue = ref(false);
    const handleGetUser = async () => {
      const dados = await fetchUser();
      user.value = dados.data.user;
    };
    const getImage = () => {
      if (!user.value.collaborator?.image?.uri) {
        return 'https://cdn.quasar.dev/img/boy-avatar.png';
      }
      return `https://cajueiroapi.cajutec.com.br/storage/images/${user.value.collaborator?.image?.uri}`;
    };

    const openDialog = () => {
      return (inputValue.value = !inputValue.value);
    };

    const logout = () => {
      router.push({ name: 'auth.logout' });
    };
    return {
      logout,
      getImage,
      user,
      inputValue,
      openDialog,
      getNotifications,
      getCountUnRead,
      notificationsUnReads,
      notificationsReads,
      notificationsAll,
    };
  },
  components: { TicketsNotifications },
};
</script>
