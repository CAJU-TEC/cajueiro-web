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
        <q-toolbar-title> Cajueiro App </q-toolbar-title>

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
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <div class="text-weight-bold">{{ user.getName }}</div>
          <div>{{ user.getEmail }}</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import { useDrawerRightStore } from 'src/stores/drawerRight';
import NavBarPerfil from '../components/buttons/users/NavBarPerfil.vue';
import { useUserStore } from '../stores/user/user-store.js';

const linksList = [
  {
    title: 'Home',
    caption: '',
    icon: 'home',
    route: { name: 'home' },
  },
  {
    title: 'Organizações',
    caption: '',
    icon: 'corporate_fare',
    route: { name: 'corporates.list' },
  },
  {
    title: 'Clientes',
    caption: '',
    icon: 'groups',
    route: { name: 'clients.list' },
  },
  {
    title: 'Protocolos',
    caption: '',
    icon: 'local_activity',
    route: { name: 'tickets.list' },
  },
  {
    title: 'Colaboradores',
    caption: '',
    icon: 'groups',
    route: { name: 'collaborators.list' },
  },
  {
    title: 'Impactos',
    caption: '',
    icon: 'local_activity',
    route: { name: 'impacts.list' },
  },
  {
    title: 'Planos de trabalho',
    caption: '',
    icon: 'plans',
    route: { name: 'jobPlans.list' },
  },
  {
    title: 'Métricas',
    caption: '',
    icon: 'bar_chart',
    route: { name: 'tickets.list' },
  },
  {
    title: 'Usuários',
    caption: '',
    icon: 'manage_accounts',
    route: { name: 'users.list' },
  },
  {
    title: 'Grupos & Permissões',
    caption: '',
    icon: 'verified_user',
    route: { name: 'groups.list' },
  },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    NavBarPerfil,
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = useDrawerRightStore();
    const store = useUserStore();

    const user = {
      getId: store.id,
      getName: store.name,
      getEmail: store.email,
      getPermisssion: store.permissions,
      getRoles: store.roles,
    };

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      rightDrawerOpen,
      user,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
