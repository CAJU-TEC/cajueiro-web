<template>
  <q-card flat class="birthday-card">
    <div class="birthday-banner">
      <span class="birthday-banner__text">Feliz Aniversário</span>
    </div>

    <div class="row justify-center items-start q-col-gutter-md q-pa-md">
      <div
        v-for="person in birthdays"
        :key="person.id"
        class="column items-center"
      >
        <div class="birthday-photo">
          <img
            v-if="person.image"
            :style="photoStyle"
            :src="`https://cajueiroapi.cajutec.com.br/storage/images/${person.image.uri}`"
          />
          <div v-else class="birthday-photo__letter" :style="photoStyle">
            {{ person.letter }}
          </div>
          <div class="birthday-photo__date">{{ dayMonth(person.birth) }}</div>
          <div v-if="latestBadge(person.id)" class="birthday-photo__badges">
            <q-icon
              :name="latestBadge(person.id).badge_icon"
              size="22px"
              class="birthday-photo__badge birthday-photo__badge--featured"
              :style="{ backgroundColor: latestBadge(person.id).badge_color || '#1976d2' }"
            >
              <q-tooltip>
                {{ latestBadge(person.id).job_plan }} &middot;
                {{ latestBadge(person.id).trail_stage }}
              </q-tooltip>
            </q-icon>

            <span v-if="hiddenCount(person.id)" class="birthday-photo__more">
              +{{ hiddenCount(person.id) }}
              <q-tooltip>
                <div v-for="badge in badgesOf(person.id)" :key="badge.trail_stage_id">
                  {{ badge.job_plan }} &middot; {{ badge.trail_stage }}
                </div>
              </q-tooltip>
            </span>
          </div>
        </div>
        <div class="birthday-name">{{ person.first_name }}</div>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useBadgesStore } from 'src/stores/badges/badges-store';

const props = defineProps({
  birthdays: {
    type: Array,
    default: () => [],
  },
});

// O cartão tem markup próprio de foto, então usa a store direto em vez do
// CollaboratorAvatar. Só a conquista mais recente aparece; o resto vira "+N".
const badgesStore = useBadgesStore();
onMounted(() => badgesStore.ensureLoaded());

const badgesOf = (collaboratorId) => badgesStore.badgesOf(collaboratorId);

const latestBadge = (collaboratorId) => badgesOf(collaboratorId).at(-1) ?? null;

const hiddenCount = (collaboratorId) => Math.max(0, badgesOf(collaboratorId).length - 1);

// A foto é o elemento principal do cartão, então encolhe conforme entram mais aniversariantes.
const photoStyle = computed(() => {
  const sizes = { 1: 148, 2: 116 };
  const size = sizes[props.birthdays.length] ?? 92;
  return { width: `${size}px`, height: `${size}px` };
});

const dayMonth = (birth) => birth?.substring(0, 5);
</script>

<style lang="scss" scoped>
.birthday-card {
  background: linear-gradient(135deg, #f0a03c 0%, #f7b866 100%);
  border-radius: 6px;
  overflow: hidden;
}

.birthday-banner {
  background: #2a3ec8;
  transform: rotate(-1.5deg);
  margin: 10px -8px 0 -8px;
  padding: 6px 12px;
  text-align: center;
}

.birthday-banner__text {
  color: #fff;
  font-style: italic;
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.birthday-photo {
  position: relative;
  background: #fff;
  padding: 7px 7px 18px 7px;
  transform: rotate(-3deg);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
}

.birthday-photo img,
.birthday-photo__letter {
  display: block;
  object-fit: cover;
}

.birthday-photo__badges {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  flex-direction: row-reverse;
}

.birthday-photo__badge {
  position: relative;
  border-radius: 50%;
  color: #fff;
  padding: 2px;
  border: 1px solid #fff;
  margin-left: -5px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.birthday-photo__badge--featured {
  border-width: 2px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

.birthday-photo__more {
  background-color: #616161;
  color: #fff;
  font-size: 8px;
  font-weight: 600;
  line-height: 1;
  padding: 2px 4px;
  margin-left: -5px;
  border: 1px solid #fff;
  border-radius: 7px;
}

.birthday-photo__letter {
  background: #2a3ec8;
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fica dentro da moldura: o overflow hidden do cartão cortaria um offset negativo. */
.birthday-photo__date {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f4614e;
  color: #fff;
  border-radius: 999px;
  padding: 2px 9px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.birthday-name {
  margin-top: 10px;
  color: #fff;
  font-weight: 700;
  font-size: 1.15rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
</style>
