<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Trilhas de aprendizado" :to="{ name: 'trails.list' }" />
        <q-breadcrumbs-el label="Acompanhamento" />
      </q-breadcrumbs>
    </div>

    <div class="row items-center q-col-gutter-sm q-mb-md">
      <div class="col-lg-4 col-xs-12">
        <div class="text-h5">{{ trail.description }}</div>
        <div class="text-caption text-grey-7">Time: {{ trail.team?.name ?? '-' }}</div>
      </div>

      <div class="col-lg-4 col-xs-12">
        <q-select
          v-model="collaboratorId"
          filled
          emit-value
          map-options
          option-value="id"
          option-label="full_name"
          :options="enrolled"
          label="Colaborador"
          @update:model-value="loadProgress"
        />
      </div>

      <div class="col-lg-4 col-xs-12 text-right">
        <q-btn
          push
          color="primary"
          icon="person_add"
          label="Matricular"
          @click="enrollDialog = true"
        />
      </div>
    </div>

    <div v-if="!collaboratorId" class="text-grey-7 q-pa-lg text-center">
      Selecione um colaborador para acompanhar o progresso.
    </div>

    <div v-else-if="progress">
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <CollaboratorAvatar :collaborator="progress.collaborator" size="56px" />
          <div>
            <div class="text-subtitle1">{{ progress.collaborator.full_name }}</div>
            <div class="text-caption text-grey-7">
              {{ progress.completed_stages_count }} de {{ progress.stages_count }} etapas concluídas
            </div>
          </div>
          <q-space />
          <q-linear-progress
            rounded
            size="14px"
            class="col-lg-4 col-xs-12"
            :value="completionRatio"
            color="positive"
          />
        </q-card-section>
      </q-card>

      <q-list bordered separator class="rounded-borders">
        <q-expansion-item
          v-for="stage in progress.stages"
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
                <span v-if="stage.job_plan"> &middot; promove para {{ stage.job_plan.description }}</span>
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
                    <q-checkbox
                      :model-value="level.completed"
                      :disable="stage.state === 'locked' || !canAdvance"
                      @update:model-value="(value) => toggleLevel(level, value)"
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

              <div class="row q-gutter-sm q-mt-md justify-end">
                <q-btn
                  v-if="stage.state === 'completed'"
                  push
                  color="teal"
                  icon="workspace_premium"
                  label="Certificado"
                  @click="openCertificate(stage)"
                />
                <q-btn
                  v-if="stage.state === 'completed' && canAdvance"
                  push
                  color="orange-9"
                  icon="undo"
                  label="Desfazer etapa"
                  @click="undo(stage)"
                />
                <q-btn
                  v-if="stage.state === 'unlocked' && canAdvance"
                  push
                  color="primary"
                  icon="done_all"
                  label="Concluir etapa"
                  @click="advance(stage)"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>

    <q-dialog v-model="enrollDialog">
      <q-card style="min-width: 380px">
        <q-card-section class="text-h6">Matricular colaborador</q-card-section>
        <q-card-section>
          <q-select
            v-model="enrollCollaboratorId"
            filled
            emit-value
            map-options
            option-value="id"
            option-label="full_name"
            :options="teamCollaborators"
            label="Colaborador do time"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="blue-10" v-close-popup />
          <q-btn push label="Matricular" color="primary" @click="doEnroll" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from 'vue';
import trailsService from 'src/services/trails';
import collaboratorsService from 'src/services/collaborators';
import CollaboratorAvatar from 'src/components/avatar/CollaboratorAvatar.vue';
import { useBadgesStore } from 'src/stores/badges/badges-store';
import can from 'src/middleware/authMiddleware';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';

const STATES = {
  completed: { label: 'Concluída', color: 'positive', icon: 'check_circle' },
  unlocked: { label: 'Liberada', color: 'primary', icon: 'radio_button_unchecked' },
  locked: { label: 'Bloqueada', color: 'grey-6', icon: 'lock' },
};

export default defineComponent({
  name: 'TrailProgressPage',
  components: { CollaboratorAvatar },
  setup() {
    const {
      getById,
      progress: fetchProgress,
      completeLevel,
      undoLevel,
      advanceStage,
      undoStage,
      enroll,
      certificate,
    } = trailsService();
    const { list: listCollaborators } = collaboratorsService();

    const $q = useQuasar();
    const route = useRoute();
    const badgesStore = useBadgesStore();

    const trail = ref({});
    const progress = ref(null);
    const collaboratorId = ref(null);
    const enrolled = ref([]);
    const collaborators = ref([]);
    const enrollDialog = ref(false);
    const enrollCollaboratorId = ref(null);

    const canAdvance = computed(() => !!can(['super-admin', 'trails.advance', 'trails.*']));

    const completionRatio = computed(() => {
      if (!progress.value?.stages_count) return 0;
      return progress.value.completed_stages_count / progress.value.stages_count;
    });

    const teamCollaborators = computed(() =>
      collaborators.value.filter((collaborator) => collaborator.team_id === trail.value.team_id)
    );

    const notifyError = (error) => {
      $q.notify({
        icon: 'block',
        message: 'Ops! Ocorreu um erro.',
        caption: error.message,
        color: 'negative',
      });
    };

    onMounted(async () => {
      await loadTrail();

      try {
        collaborators.value = await listCollaborators();
      } catch (error) {
        notifyError(error);
      }
    });

    const loadTrail = async () => {
      try {
        const data = await getById(route.params.id);
        trail.value = data;
        enrolled.value = data.collaborators ?? [];

        if (enrolled.value.length && !collaboratorId.value) {
          collaboratorId.value = enrolled.value[0].id;
          await loadProgress();
        }
      } catch (error) {
        notifyError(error);
      }
    };

    const loadProgress = async () => {
      if (!collaboratorId.value) return;

      try {
        progress.value = await fetchProgress(route.params.id, collaboratorId.value);
      } catch (error) {
        notifyError(error);
      }
    };

    const toggleLevel = async (level, value) => {
      try {
        progress.value = value
          ? await completeLevel(level.id, collaboratorId.value)
          : await undoLevel(level.id, collaboratorId.value);
        await badgesStore.refresh();
      } catch (error) {
        notifyError(error);
        await loadProgress();
      }
    };

    const advance = async (stage) => {
      try {
        progress.value = await advanceStage(stage.id, collaboratorId.value);
        await badgesStore.refresh();
        $q.notify({ message: 'Etapa concluída!', icon: 'check', color: 'positive' });
      } catch (error) {
        notifyError(error);
      }
    };

    const undo = (stage) => {
      $q.dialog({
        title: 'Desfazer',
        message: `Desfazer a conclusão da etapa "${stage.description}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          progress.value = await undoStage(stage.id, collaboratorId.value);
          await badgesStore.refresh();
        } catch (error) {
          notifyError(error);
        }
      });
    };

    const doEnroll = async () => {
      try {
        await enroll(route.params.id, enrollCollaboratorId.value);
        enrollDialog.value = false;
        collaboratorId.value = enrollCollaboratorId.value;
        enrollCollaboratorId.value = null;
        await loadTrail();
        await loadProgress();
      } catch (error) {
        notifyError(error);
      }
    };

    const openCertificate = async (stage) => {
      try {
        const blob = await certificate(stage.id, collaboratorId.value);
        window.open(URL.createObjectURL(blob), '_blank');
      } catch (error) {
        notifyError(error);
      }
    };

    return {
      trail,
      progress,
      collaboratorId,
      enrolled,
      teamCollaborators,
      enrollDialog,
      enrollCollaboratorId,
      canAdvance,
      completionRatio,
      loadProgress,
      toggleLevel,
      advance,
      undo,
      doEnroll,
      openCertificate,
      stateLabel: (state) => STATES[state]?.label ?? state,
      stateColor: (state) => STATES[state]?.color ?? 'grey',
      stateIcon: (state) => STATES[state]?.icon ?? 'help',
    };
  },
});
</script>
