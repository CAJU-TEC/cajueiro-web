import { defineStore } from 'pinia';
import usersService from 'src/services/auth.js';
import { useStorage } from '@vueuse/core';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: useStorage('id', null),
    name: useStorage('name', null),
    email: useStorage('email', null),
    permissions: useStorage('permissions', []),
    roles: useStorage('roles', {}),
  }),
  getters: {
    getId: (state) => state.id,
    getName: (state) => state.name,
    getEmail: (state) => state.email,
    getPermisssion: (state) => state.permissions,
    getRoles: (state) => state.roles
  },
  actions: {
    async getSanctumCookie() {
      const { getSanctumCookie } = usersService();

      try {
        await getSanctumCookie();
      } catch (error) {
        if(error) throw (error);
      }
    },

    async login(form) {
      const { login } = usersService();

      try {
        return await login(form);
      } catch (error) {
        if(error) throw error;
      }
    },

    async fetchUser() {
      const { fetchUser } = usersService();
      try {
        const payload = await fetchUser();
        return payload;
      } catch (error) {
        if(error) throw error;
      }
    },

    setUser(payload) {
      if(payload.id) this.id = payload.id;
      if(payload.name) this.name = payload.name;
      if(payload.email) this.email = payload.email;
      if(payload.permissions) this.permissions = payload.permissions;
      if(payload.roles) this.roles = payload.roles;
    },

    clearUser() {
      this.id = null;
      this.name = null;
      this.email = null;
      this.permissions = null;
      this.roles = null;
    }
  },
});
