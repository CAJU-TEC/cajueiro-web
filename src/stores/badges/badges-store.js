import { defineStore } from 'pinia';
import { api } from 'boot/axios';

/**
 * Badges de trilha por colaborador. Carrega uma única vez por sessão de navegação
 * e serve todas as telas que exibem foto de colaborador, evitando um request
 * (ou um N+1 no backend) por avatar renderizado.
 */
export const useBadgesStore = defineStore('badges', {
  state: () => ({
    byCollaborator: {},
    loaded: false,
    loading: false,
  }),
  getters: {
    badgesOf: (state) => (collaboratorId) => state.byCollaborator[collaboratorId] ?? [],
  },
  actions: {
    async ensureLoaded() {
      if (this.loaded || this.loading) return;

      this.loading = true;
      try {
        const { data } = await api.get('api/trails/badges');
        this.byCollaborator = data ?? {};
        this.loaded = true;
      } catch (error) {
        // Badge é enfeite: se falhar, o avatar segue sem selo.
        this.byCollaborator = {};
      } finally {
        this.loading = false;
      }
    },

    // Chamar após avançar/desfazer etapa para refletir os selos na hora.
    async refresh() {
      this.loaded = false;
      await this.ensureLoaded();
    },
  },
});
