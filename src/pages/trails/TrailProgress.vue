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
        <q-card-section class="trail-header">
          <CollaboratorAvatar :collaborator="progress.collaborator" size="56px" />

          <div class="trail-header__info">
            <div class="text-subtitle1">{{ progress.collaborator.full_name }}</div>
            <div class="text-caption text-grey-7">
              {{ progress.completed_stages_count }} de {{ progress.stages_count }} etapas
              <template v-if="levels.required">
                &middot; {{ levels.done }} de {{ levels.required }} níveis
              </template>
            </div>
          </div>

          <q-btn
            v-if="lastCompletedStage"
            push
            class="trail-header__action"
            color="teal"
            icon="workspace_premium"
            label="Certificado"
            @click="openCertificate(lastCompletedStage)"
          >
            <q-tooltip>Certificado de "{{ lastCompletedStage.description }}"</q-tooltip>
          </q-btn>

          <q-linear-progress
            rounded
            size="28px"
            class="trail-header__progress"
            :value="completionRatio"
            :color="isComplete ? 'positive' : 'light-green-6'"
          >
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                :text-color="isComplete ? 'positive' : 'green-9'"
                class="text-weight-bold"
              >
                <q-icon v-if="isComplete" name="check_circle" size="15px" class="q-mr-xs" />
                {{ completionPercent }}%
              </q-badge>
            </div>
            <q-tooltip>
              Cada etapa vale a mesma fatia; os níveis já concluídos contam dentro dela.
            </q-tooltip>
          </q-linear-progress>
        </q-card-section>
      </q-card>

      <!-- No celular a lista lê melhor que um grafo com pan e zoom. -->
      <q-card v-if="$q.screen.gt.xs" flat bordered>
        <TrailFlow
          :stages="progress.stages"
          :trail="{ description: trail.description, team: trail.team?.name }"
          :can-advance="canAdvance"
          :on-advance="advance"
          :on-undo="undo"
          :on-toggle-level="toggleLevel"
          @stage-click="openStageDetail"
          @level-click="openLevelDetail"
        />
      </q-card>

      <TrailStageList v-else :stages="progress.stages" @certificate="openCertificate" />
    </div>

    <!-- detalhe da etapa -->
    <q-dialog v-model="stageDialog">
      <q-card v-if="selectedStage" style="min-width: 340px; max-width: 560px">
        <q-card-section class="row items-center">
          <q-icon
            :name="stateIcon(selectedStage.state)"
            :color="stateColor(selectedStage.state)"
            size="28px"
            class="q-mr-sm"
          />
          <div>
            <div class="text-h6">{{ selectedStage.position }}. {{ selectedStage.description }}</div>
            <div class="text-caption text-grey-7">
              {{ stateLabel(selectedStage.state) }} &middot;
              {{ selectedStage.completed_levels_count }} de
              {{ selectedStage.required_count }} níveis necessários
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="selectedStage.job_plan || selectedStage.note" class="q-pt-none">
          <div v-if="selectedStage.job_plan" class="q-mb-sm">
            Promove para
            <q-badge :style="`background: ${selectedStage.job_plan.badge_color || '#1976d2'}`">
              {{ selectedStage.job_plan.description }}
            </q-badge>
          </div>
          <div v-if="selectedStage.note" class="text-body2 text-grey-8">{{ selectedStage.note }}</div>
        </q-card-section>

        <q-card-section v-if="selectedStage.materials?.length" class="q-pt-none">
          <div class="text-subtitle2 q-mb-xs">Material de apoio</div>
          <q-chip
            v-for="material in selectedStage.materials"
            :key="material.id"
            icon="link"
            color="blue-1"
            text-color="primary"
          >
            <a :href="material.url" target="_blank" rel="noopener">{{ material.description }}</a>
          </q-chip>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            v-if="selectedStage.state === 'completed'"
            push
            color="teal"
            icon="workspace_premium"
            label="Certificado"
            @click="openCertificate(selectedStage)"
          />
          <q-btn flat label="Fechar" color="blue-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- detalhe do nível -->
    <q-dialog v-model="levelDialog">
      <q-card v-if="selectedLevel" style="min-width: 320px; max-width: 520px">
        <q-card-section class="row items-center">
          <q-icon
            :name="selectedLevel.completed ? 'check_circle' : 'radio_button_unchecked'"
            :color="selectedLevel.completed ? 'positive' : 'grey-5'"
            size="26px"
            class="q-mr-sm"
          />
          <div>
            <div class="text-h6">{{ selectedLevel.description }}</div>
            <q-badge
              v-if="SKILLS[selectedLevel.skill]"
              :color="SKILLS[selectedLevel.skill].color"
              :label="SKILLS[selectedLevel.skill].label"
              class="q-mr-xs"
            />
            <q-badge
              :color="PERIODS[selectedLevel.period_state]?.color"
              :label="periodCaption(selectedLevel)"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="selectedLevel.note" class="q-pt-none text-body2 text-grey-8">
          {{ selectedLevel.note }}
        </q-card-section>

        <!-- O que o colaborador enviou: é o que o líder precisa para avaliar. -->
        <q-card-section v-if="selectedLevel.submitted_at" class="q-pt-none">
          <q-banner dense class="bg-amber-1">
            <template #avatar><q-icon name="hourglass_top" color="amber-9" /></template>
            Enviado em {{ formatDate(selectedLevel.submitted_at) }}
            <q-btn
              v-if="selectedLevel.certificate_uri"
              dense
              flat
              no-caps
              color="primary"
              icon="attach_file"
              label="Abrir certificado"
              class="q-ml-sm"
              @click="openLevelCertificate(selectedLevel)"
            />
            <span v-else class="text-grey-7"> · sem certificado anexado</span>
          </q-banner>
        </q-card-section>

        <q-card-section v-if="selectedLevel.score !== null" class="q-pt-none">
          <q-banner dense :class="selectedLevel.reproved ? 'bg-red-1' : 'bg-green-1'">
            <template #avatar>
              <q-icon
                :name="selectedLevel.reproved ? 'error_outline' : 'grading'"
                :color="selectedLevel.reproved ? 'negative' : 'positive'"
              />
            </template>
            <div class="text-weight-bold">
              Nota {{ selectedLevel.score }}%
              <span v-if="selectedLevel.reproved">
                (corte {{ selectedLevel.cut_score }}%)
              </span>
            </div>
            <div v-if="selectedLevel.evaluation_note" class="text-body2">
              {{ selectedLevel.evaluation_note }}
            </div>
            <!-- Corrigir a nota sem desfazer a conclusão: desfazer devolveria o
                 nível para a fila e tiraria o quórum da etapa. -->
            <template v-if="canAdvance" #action>
              <q-btn
                dense
                flat
                color="primary"
                icon="edit"
                label="Editar nota"
                @click="openEvaluation(selectedLevel)"
              />
              <q-btn
                dense
                flat
                color="grey-8"
                icon="delete_outline"
                label="Remover nota"
                :loading="saving"
                @click="removeEvaluation"
              />
            </template>
          </q-banner>
        </q-card-section>

        <!-- Concluído sem nota: dá para avaliar depois, sem desfazer nada. -->
        <q-card-section
          v-else-if="canAdvance && selectedLevel.completed"
          class="q-pt-none"
        >
          <q-btn
            dense
            flat
            color="primary"
            icon="grading"
            label="Avaliar nível"
            @click="openEvaluation(selectedLevel)"
          />
        </q-card-section>

        <!-- Prazo por matrícula: é deste colaborador, não do nível. -->
        <q-card-section v-if="canEdit" class="q-pt-none">
          <div class="text-subtitle2 q-mb-sm">
            Prazo de {{ progress?.collaborator?.full_name }}
          </div>
          <div class="row q-col-gutter-sm">
            <q-input
              v-model="period.starts_at"
              class="col"
              dense
              filled
              mask="##/##/####"
              label="Início"
            >
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="period.starts_at" mask="DD/MM/YYYY" minimal />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              v-model="period.ends_at"
              class="col"
              dense
              filled
              mask="##/##/####"
              label="Fim"
            >
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="period.ends_at" mask="DD/MM/YYYY" minimal />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <div class="row items-center q-gutter-sm q-mt-sm">
            <q-btn
              dense
              unelevated
              color="primary"
              icon="event_available"
              label="Salvar prazo"
              :loading="savingPeriod"
              :disable="!periodComplete"
              @click="savePeriod"
            >
              <q-tooltip v-if="!periodComplete">Selecione as duas datas</q-tooltip>
            </q-btn>
            <q-btn
              v-if="selectedLevel.starts_at"
              dense
              flat
              color="grey-8"
              icon="event_busy"
              label="Limpar"
              :loading="savingPeriod"
              @click="clearPeriod"
            />
          </div>
        </q-card-section>

        <q-card-section v-if="selectedLevel.materials?.length" class="q-pt-none">
          <div class="text-subtitle2 q-mb-xs">Material de apoio</div>
          <q-chip
            v-for="material in selectedLevel.materials"
            :key="material.id"
            icon="link"
            color="blue-1"
            text-color="primary"
          >
            <a :href="material.url" target="_blank" rel="noopener">{{ material.description }}</a>
          </q-chip>
        </q-card-section>

        <q-card-section v-else class="q-pt-none text-grey-6">
          Sem material de apoio cadastrado.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Fechar" color="blue-10" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- avaliação do nível: concluir é dar a nota e a resposta -->
    <q-dialog v-model="evaluationDialog">
      <q-card v-if="evaluationForm.level" style="min-width: 380px">
        <q-card-section>
          <div class="text-h6">Avaliar nível</div>
          <div class="text-caption text-grey-7">{{ evaluationForm.level.description }}</div>
        </q-card-section>
        <q-form @submit="saveEvaluation">
          <q-card-section class="q-gutter-md q-pt-none">
            <q-input
              v-model.number="evaluationForm.score"
              filled
              type="number"
              min="0"
              max="100"
              step="1"
              label="Nota (0 a 100) *"
              :hint="`Abaixo de ${evaluationForm.level.cut_score}% o nível fica reprovado, mas a etapa não trava`"
              suffix="%"
              :rules="requiredScoreRules"
            />
            <q-input
              v-model="evaluationForm.note"
              filled
              type="textarea"
              rows="3"
              label="Resposta ao colaborador *"
              :rules="answerRules"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="blue-10" v-close-popup />
            <q-btn
              push
              color="primary"
              icon="grading"
              label="Concluir nível"
              :loading="saving"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- resposta do líder ao concluir a etapa -->
    <q-dialog v-model="stageAnswerDialog">
      <q-card v-if="stageAnswerForm.stage" style="min-width: 380px">
        <q-card-section>
          <div class="text-h6">Concluir etapa</div>
          <div class="text-caption text-grey-7">{{ stageAnswerForm.stage.description }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="stageAnswerForm.note"
            filled
            type="textarea"
            rows="3"
            label="Resposta ao colaborador"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="blue-10" v-close-popup />
          <q-btn
            push
            color="primary"
            icon="done_all"
            label="Concluir"
            :loading="saving"
            @click="saveStageAnswer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import TrailFlow from 'src/components/trails/TrailFlow.vue';
import TrailStageList from 'src/components/trails/TrailStageList.vue';
import { useBadgesStore } from 'src/stores/badges/badges-store';
import {
  LEVEL_STATES,
  PERIODS,
  SKILLS,
  STATES,
  formatDate,
  periodCaption,
  toIsoDate,
} from 'src/support/trails/states';
import { levelTotals, trailComplete, trailPercent, trailRatio } from 'src/support/trails/progress';
import { answerRules, requiredScoreRules } from 'src/support/trails/rules';
import can from 'src/middleware/authMiddleware';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';


export default defineComponent({
  name: 'TrailProgressPage',
  components: { CollaboratorAvatar, TrailFlow, TrailStageList },
  setup() {
    const {
      getById,
      progress: fetchProgress,
      completeLevel,
      undoLevel,
      clearLevelEvaluation,
      advanceStage,
      undoStage,
      enroll,
      certificate,
      levelCertificate,
      setLevelPeriod,
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
    const stageDialog = ref(false);
    const levelDialog = ref(false);
    const selectedStage = ref(null);
    const selectedLevel = ref(null);
    const enrollCollaboratorId = ref(null);

    const canAdvance = computed(() => !!can(['super-admin', 'trails.advance', 'trails.*']));
    // Quem edita a trilha é quem planeja o prazo (mesma permissão da matrícula).
    const canEdit = computed(() => !!can(['super-admin', 'trails.update', 'trails.*']));

    const period = ref({ starts_at: null, ends_at: null });
    const savingPeriod = ref(false);
    const saving = ref(false);
    const evaluationDialog = ref(false);
    const evaluationForm = ref({ level: null, score: null, note: null });
    const stageAnswerDialog = ref(false);
    const stageAnswerForm = ref({ stage: null, note: null });

    const completionRatio = computed(() => trailRatio(progress.value));
    const completionPercent = computed(() => trailPercent(progress.value));
    const isComplete = computed(() => trailComplete(progress.value));
    const levels = computed(() => levelTotals(progress.value));

    // O certificado é por etapa; no cabeçalho mostramos o da conquista mais
    // avançada, que é a que interessa exibir.
    const lastCompletedStage = computed(
      () =>
        [...(progress.value?.stages ?? [])]
          .reverse()
          .find((stage) => stage.state === 'completed') ?? null
    );

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

    // Vem pré-preenchido para a edição da nota: reavaliar é o mesmo diálogo.
    const openEvaluation = (level) => {
      evaluationForm.value = {
        level,
        score: level.score ?? null,
        note: level.evaluation_note ?? null,
      };
      evaluationDialog.value = true;
    };

    /**
     * Marcar o nível abre a avaliação em vez de concluir na hora: concluir é o
     * ato de dar a nota e a resposta (R9). Desmarcar continua desfazendo direto.
     */
    const toggleLevel = async (level, value) => {
      if (value) {
        openEvaluation(level);

        return;
      }

      try {
        progress.value = await undoLevel(level.id, collaboratorId.value);
        await badgesStore.refresh();
      } catch (error) {
        notifyError(error);
        await loadProgress();
      }
    };

    const saveEvaluation = async () => {
      const { level, score, note } = evaluationForm.value;

      saving.value = true;

      try {
        // As regras do formulário garantem nota inteira de 0 a 100 e resposta
        // preenchida: concluir o nível é avaliá-lo (R9).
        progress.value = await completeLevel(level.id, collaboratorId.value, note, Number(score));
        await badgesStore.refresh();
        syncSelectedLevel();
        evaluationDialog.value = false;
        $q.notify({ message: 'Nível avaliado!', icon: 'grading', color: 'positive' });
      } catch (error) {
        notifyError(error);
        await loadProgress();
      } finally {
        saving.value = false;
      }
    };

    // Só a avaliação sai; o nível continua concluído e contando no quórum, então
    // não há badge nem etapa para reavaliar aqui. Confirma porque a resposta
    // escrita ao colaborador vai junto e não tem como voltar.
    const removeEvaluation = () => {
      const level = selectedLevel.value;

      $q.dialog({
        title: 'Remover nota',
        message: `Apagar a nota e a resposta de "${level.description}"? O nível continua concluído.`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        saving.value = true;

        try {
          progress.value = await clearLevelEvaluation(level.id, collaboratorId.value);
          syncSelectedLevel();
          $q.notify({ message: 'Nota removida!', icon: 'grading', color: 'positive' });
        } catch (error) {
          notifyError(error);
          await loadProgress();
        } finally {
          saving.value = false;
        }
      });
    };

    // Concluir a etapa também pede uma resposta do líder (R9).
    const advance = (stage) => {
      stageAnswerForm.value = { stage, note: null };
      stageAnswerDialog.value = true;
    };

    const saveStageAnswer = async () => {
      const { stage, note } = stageAnswerForm.value;

      saving.value = true;

      try {
        progress.value = await advanceStage(stage.id, collaboratorId.value, note);
        await badgesStore.refresh();
        stageAnswerDialog.value = false;
        $q.notify({ message: 'Etapa concluída!', icon: 'check', color: 'positive' });
      } catch (error) {
        notifyError(error);
      } finally {
        saving.value = false;
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

    // O anexo do colaborador vem pela API, e não do /storage público: assim vale
    // o auth:sanctum e não depende de `php artisan storage:link`.
    const openLevelCertificate = async (level) => {
      try {
        const blob = await levelCertificate(level.id, collaboratorId.value);
        window.open(URL.createObjectURL(blob), '_blank');
      } catch (error) {
        notifyError(error);
      }
    };

    const openStageDetail = (stage) => {
      selectedStage.value = stage;
      stageDialog.value = true;
    };

    const openLevelDetail = (level) => {
      selectedLevel.value = level;
      period.value = {
        starts_at: formatDate(level.starts_at),
        ends_at: formatDate(level.ends_at),
      };
      levelDialog.value = true;
    };

    // O diálogo do nível segue aberto depois de salvar: recarrego o nível do
    // payload novo para o que está na tela acompanhar o que acabou de ser salvo.
    const syncSelectedLevel = () => {
      if (!selectedLevel.value) return;

      selectedLevel.value =
        progress.value.stages
          .flatMap((stage) => stage.levels)
          .find((level) => level.id === selectedLevel.value.id) ?? selectedLevel.value;
    };

    const applyPeriod = async (startsAt, endsAt) => {
      savingPeriod.value = true;

      try {
        progress.value = await setLevelPeriod(
          selectedLevel.value.id,
          collaboratorId.value,
          startsAt,
          endsAt
        );
        syncSelectedLevel();
        period.value = {
          starts_at: formatDate(selectedLevel.value.starts_at),
          ends_at: formatDate(selectedLevel.value.ends_at),
        };
        $q.notify({ message: 'Prazo salvo!', icon: 'event_available', color: 'positive' });
      } catch (error) {
        notifyError(error);
      } finally {
        savingPeriod.value = false;
      }
    };

    // Duas datas nulas são como o back entende "limpar prazo", então salvar com
    // os campos vazios respondia "Prazo salvo!" sem prazo nenhum. Limpar é o
    // outro botão.
    const periodComplete = computed(
      () => !!toIsoDate(period.value.starts_at) && !!toIsoDate(period.value.ends_at)
    );

    const savePeriod = () =>
      applyPeriod(toIsoDate(period.value.starts_at), toIsoDate(period.value.ends_at));

    const clearPeriod = () => applyPeriod(null, null);

    return {
      trail,
      progress,
      stageDialog,
      levelDialog,
      selectedStage,
      selectedLevel,
      openStageDetail,
      openLevelDetail,
      collaboratorId,
      enrolled,
      teamCollaborators,
      enrollDialog,
      enrollCollaboratorId,
      canAdvance,
      canEdit,
      period,
      savingPeriod,
      saving,
      evaluationDialog,
      evaluationForm,
      saveEvaluation,
      openEvaluation,
      removeEvaluation,
      requiredScoreRules,
      answerRules,
      stageAnswerDialog,
      stageAnswerForm,
      saveStageAnswer,
      LEVEL_STATES,
      savePeriod,
      periodComplete,
      clearPeriod,
      periodCaption,
      formatDate,
      openLevelCertificate,
      PERIODS,
      SKILLS,
      completionRatio,
      completionPercent,
      isComplete,
      levels,
      lastCompletedStage,
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
