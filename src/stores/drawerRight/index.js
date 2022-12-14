import { defineStore } from 'pinia';

export const useDrawerRightStore = defineStore('drawerStore', {
  state: () => ({
    drawerStore: false,
  }),
});
