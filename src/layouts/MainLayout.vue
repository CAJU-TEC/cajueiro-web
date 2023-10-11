<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          class="q-mr-sm"
          @click="toggleLeftDrawer"
        />
        <q-separator dark vertical inset />
        <q-toolbar-title> SOL App </q-toolbar-title>

        <div>
          <nav-bar-perfil></nav-bar-perfil>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area
        style="
          height: calc(100% - 150px);
          margin-top: 150px;
          border-right: 1px solid #ddd;
        "
      >
        <q-list>
          <q-item-label header> Menus </q-item-label>

          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            :permissions="link.route.permissions"
            v-bind="link"
          />
        </q-list>
      </q-scroll-area>

      <q-img
        class="absolute-top"
        src="https://cdn.quasar.dev/img/material.png"
        style="height: 150px"
      >
        <div class="absolute-bottom bg-transparent">
          <q-avatar size="56px" class="q-mb-sm">
            <img :src="getImage()" />
          </q-avatar>
          <div class="text-weight-bold">{{ user.name }}</div>
          <div>{{ user.email }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view :key="route.path" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import NavBarPerfil from '../components/buttons/users/NavBarPerfil.vue';
import usersService from 'src/services/users';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    NavBarPerfil,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const { fetchUser } = usersService();
    const router = useRouter();
    const route = useRoute();

    const linksList = [
      {
        title: 'Home',
        caption: '',
        icon: 'home',
        route: { name: 'home', permissions: [true] },
      },
      {
        title: 'Organizações',
        caption: '',
        icon: 'corporate_fare',
        route: { name: 'corporates.list', permissions: ['corporates.*'] },
      },
      {
        title: 'Clientes',
        caption: '',
        icon: 'groups',
        route: { name: 'clients.list', permissions: ['clients.*'] },
      },
      {
        title: 'Protocolos',
        caption: '',
        icon: 'local_activity',
        route: {
          name: 'tickets.list',
          permissions: ['tickets.*', 'tickets.list'],
        },
      },
      {
        title: 'Colaboradores',
        caption: '',
        icon: 'groups',
        route: { name: 'collaborators.list', permissions: ['collaborators.*'] },
      },
      {
        title: 'Impactos',
        caption: '',
        icon: 'local_activity',
        route: { name: 'impacts.list', permissions: ['impacts.*'] },
      },
      {
        title: 'Planos de trabalho',
        caption: '',
        icon: 'plans',
        route: { name: 'jobPlans.list', permissions: ['jobplans.*'] },
      },
      {
        title: 'Métricas',
        caption: '',
        icon: 'bar_chart',
        route: { name: 'tickets.list', permissions: ['metricas.*'] },
      },
      {
        title: 'Usuários',
        caption: '',
        icon: 'manage_accounts',
        route: { name: 'users.list', permissions: ['users.*'] },
      },
      {
        title: 'Grupos & Permissões',
        caption: '',
        icon: 'verified_user',
        route: { name: 'groups.list', permissions: ['groups.*'] },
      },
    ];

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

      return `https://cajueiroapi.cajutec.com.br/storage/images/${user.value.collaborator?.image?.uri}`;
    };

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      user,
      getImage,
      router,
      route,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
