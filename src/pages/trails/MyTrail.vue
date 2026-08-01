<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Minha trilha" />
      </q-breadcrumbs>
    </div>

    <div v-if="loading" class="q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!trails.length" class="text-grey-7 q-pa-lg text-center">
      Você ainda não está matriculado em nenhuma trilha. Fale com seu líder.
    </div>

    <div v-for="item in trails" :key="item.trail.id" class="q-mb-lg">
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <CollaboratorAvatar :collaborator="item.collaborator" size="56px" />
          <div>
            <div class="text-h6">{{ item.trail.description }}</div>
            <div class="text-caption text-grey-7">
              {{ item.team?.name }} &middot;
              {{ item.completed_stages_count }} de {{ item.stages_count }} etapas concluídas
            </div>
          </div>
          <q-space />
          <q-linear-progress
            rounded
            size="14px"
            class="col-lg-4 col-xs-12"
            :value="item.stages_count ? item.completed_stages_count / item.stages_count : 0"
            color="positive"
          />
        </q-card-section>
      </q-card>

      <q-list bordered separator class="rounded-borders">
        <q-expansion-item
          v-for="stage in item.stages"
          :key="stage.id"
          expand-separator
          :default-opened="stage.state === 'unlocked'"
        >
          <template #header>
            <q-item-section avatar>
              <q-icon :name="stateIcon(stage.state)" :color="stateColor(stage.state)" size="28px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ stage.position }}. {{ stage.description }}</q-item-label>
              <q-item-label caption>
                {{ stage.completed_levels_count }} de {{ stage.required_count }} níveis necessários
                <span v-if="stage.job_plan"> &middot; leva para {{ stage.job_plan.description }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge :color="stateColor(stage.state)">{{ stateLabel(stage.state) }}</q-badge>
            </q-item-section>
          </template>

          <q-card>
            <q-card-section>
              <div v-if="stage.materials?.length" class="q-mb-md">
                <div class="text-subtitle2 q-mb-xs">Material de apoio da etapa</div>
                <q-chip
                  v-for="material in stage.materials"
                  :key="material.id"
                  icon="link"
                  color="blue-1"
                  text-color="primary"
                >
                  <a :href="material.url" target="_blank" rel="noopener">{{ material.description }}</a>
                </q-chip>
              </div>

              <q-list bordered separator class="rounded-borders">
                <q-item v-for="level in stage.levels" :key="level.id">
                  <q-item-section side>
                    <q-icon
                      :name="level.completed ? 'check_circle' : 'radio_button_unchecked'"
                      :color="level.completed ? 'positive' : 'grey-5'"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="level.completed ? 'text-strike text-grey-6' : ''">
                      {{ level.description }}
                    </q-item-label>
                    <q-item-label caption>{{ level.note }}</q-item-label>
                    <q-item-label v-if="level.materials?.length" class="q-mt-xs">
                      <q-chip
                        v-for="material in level.materials"
                        :key="material.id"
                        dense
                        icon="link"
                        color="blue-1"
                        text-color="primary"
                      >
                        <a :href="material.url" target="_blank" rel="noopener">{{ material.description }}</a>
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="stage.state === 'completed'" class="row justify-end q-mt-md">
                <q-btn
                  push
                  color="teal"
                  icon="workspace_premium"
                  label="Meu certificado"
                  @click="openCertificate(stage, item.collaborator.id)"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import trailsService from 'src/services/trails';
import CollaboratorAvatar from 'src/components/avatar/CollaboratorAvatar.vue';
import { useQuasar } from 'quasar';

const STATES = {
  completed: { label: 'Concluída', color: 'positive', icon: 'check_circle' },
  unlocked: { label: 'Liberada', color: 'primary', icon: 'radio_button_unchecked' },
  locked: { label: 'Bloqueada', color: 'grey-6', icon: 'lock' },
};

export default defineComponent({
  name: 'MyTrailPage',
  components: { CollaboratorAvatar },
  setup() {
    const { mine, certificate } = trailsService();
    const $q = useQuasar();

    const trails = ref([]);
    const loading = ref(true);

    const notifyError = (error) => {
      $q.notify({
        icon: 'block',
        message: 'Ops! Ocorreu um erro.',
        caption: error.message,
        color: 'negative',
      });
    };

    onMounted(async () => {
      try {
        trails.value = await mine();
      } catch (error) {
        notifyError(error);
      } finally {
        loading.value = false;
      }
    });

    const openCertificate = async (stage, collaboratorId) => {
      try {
        const blob = await certificate(stage.id, collaboratorId);
        window.open(URL.createObjectURL(blob), '_blank');
      } catch (error) {
        notifyError(error);
      }
    };

    return {
      trails,
      loading,
      openCertificate,
      stateLabel: (state) => STATES[state]?.label ?? state,
      stateColor: (state) => STATES[state]?.color ?? 'grey',
      stateIcon: (state) => STATES[state]?.icon ?? 'help',
    };
  },
});
</script>
