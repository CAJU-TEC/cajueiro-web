<template>
  <div class="collaborator-avatar" :style="{ width: size, height: size }">
    <q-avatar :size="size" :color="imageSrc ? undefined : color" text-color="white">
      <img v-if="imageSrc" :src="imageSrc" />
      <template v-else>{{ letter }}</template>
      <q-tooltip v-if="collaborator?.full_name">{{ collaborator.full_name }}</q-tooltip>
    </q-avatar>

    <div v-if="visibleBadges.length" class="collaborator-avatar__badges">
      <q-icon
        v-for="(badge, index) in visibleBadges"
        :key="badge.trail_stage_id"
        :name="badge.badge_icon"
        :size="index === 0 ? featuredBadgeSize : badgeSize"
        class="collaborator-avatar__badge"
        :class="{ 'collaborator-avatar__badge--featured': index === 0 }"
        :style="{
          backgroundColor: badge.badge_color || '#1976d2',
          zIndex: visibleBadges.length - index,
        }"
      >
        <q-tooltip>{{ badge.job_plan }} &middot; {{ badge.trail_stage }}</q-tooltip>
      </q-icon>

      <span v-if="hiddenCount" class="collaborator-avatar__badge collaborator-avatar__more">
        +{{ hiddenCount }}
        <q-tooltip>
          <div v-for="badge in badges" :key="badge.trail_stage_id">
            {{ badge.job_plan }} &middot; {{ badge.trail_stage }}
          </div>
        </q-tooltip>
      </span>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted } from 'vue';
import { useBadgesStore } from 'src/stores/badges/badges-store';

const STORAGE_URL = 'https://cajueiroapi.cajutec.com.br/storage/images';

export default defineComponent({
  name: 'CollaboratorAvatar',
  props: {
    collaborator: {
      type: Object,
      default: null,
    },
    size: {
      type: String,
      default: '48px',
    },
    color: {
      type: String,
      default: 'primary',
    },
    // Só a conquista mais recente aparece; o resto vira o contador "+N",
    // para o selo não cobrir a foto.
    maxBadges: {
      type: Number,
      default: 1,
    },
    // Usado onde a tela já exibia uma imagem padrão em vez da inicial do nome.
    fallbackImage: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const badgesStore = useBadgesStore();

    onMounted(() => badgesStore.ensureLoaded());

    const imageSrc = computed(() => {
      const uri = props.collaborator?.image?.uri;
      if (uri) return `${STORAGE_URL}/${uri}`;
      return props.fallbackImage;
    });

    const letter = computed(
      () =>
        props.collaborator?.letter ??
        props.collaborator?.first_name?.charAt(0)?.toUpperCase() ??
        props.collaborator?.full_name?.charAt(0)?.toUpperCase() ??
        '?'
    );

    // Um badge por etapa concluída. Vem embutido nos payloads de progresso;
    // nas demais telas sai da store carregada uma vez só.
    const badges = computed(() => {
      if (props.collaborator?.badges) return props.collaborator.badges;
      if (!props.collaborator?.id) return [];
      return badgesStore.badgesOf(props.collaborator.id);
    });

    // Mostra as conquistas mais recentes (últimas etapas da trilha); o
    // container é row-reverse, então a mais nova fica por cima.
    const visibleBadges = computed(() => badges.value.slice(-props.maxBadges).reverse());

    const hiddenCount = computed(() => Math.max(0, badges.value.length - props.maxBadges));

    const avatarSize = computed(() => parseInt(props.size, 10) || 40);

    const badgeSize = computed(() => `${Math.max(9, Math.round(avatarSize.value * 0.24))}px`);

    // A conquista mais recente vem maior e por cima das anteriores.
    const featuredBadgeSize = computed(
      () => `${Math.max(12, Math.round(avatarSize.value * 0.32))}px`
    );

    return {
      imageSrc,
      letter,
      badges,
      visibleBadges,
      hiddenCount,
      badgeSize,
      featuredBadgeSize,
    };
  },
});
</script>

<style lang="scss" scoped>
.collaborator-avatar {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.collaborator-avatar__badges {
  position: absolute;
  right: -4px;
  bottom: -4px;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}

.collaborator-avatar__badge {
  position: relative; // permite o z-index inline empilhar o mais recente por cima
  border-radius: 50%;
  color: #fff;
  padding: 2px;
  border: 1px solid #fff;
  margin-left: -5px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.collaborator-avatar__badge--featured {
  border-width: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.collaborator-avatar__more {
  z-index: 0; // sempre atrás do badge em destaque
  background-color: #616161;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
  padding: 2px 4px;
  border-radius: 7px;
}
</style>
