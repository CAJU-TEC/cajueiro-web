import { defineStore } from 'pinia';
import usersService from 'src/services/users.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    firstName: null,
    lastName: null,
    email: null,
  }),
  getters: {
    getId: (state) => state.id,
    getFirstName: (state) => state.firstName,
    getLastName: (state) => state.lastName,
    getEmail: (state) => state.email,
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
      if(payload.firstName) this.firstName = payload.firstName;
      if(payload.lastName) this.lastName = payload.lastName;
      if(payload.email) this.email = payload.email;
    },

    clearUser() {
      this.id = null;
      this.firstName = null;
      this.lastName = null;
      this.email = null;
    }
  },
});
