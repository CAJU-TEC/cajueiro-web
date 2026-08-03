<template>
  <q-page padding>
    <div class="q-pb-md row items-center">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Minha trilha" />
      </q-breadcrumbs>
      <q-space />
      <q-btn
        flat
        color="green-8"
        icon="park"
        label="Meu Cajueiro"
        :to="{ name: 'trails.cajueiro' }"
      />
    </div>

    <div v-if="loading" class="q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
    </div>

    <div v-else-if="!trails.length" class="text-grey-7 q-pa-lg text-center">
      Você ainda não está matriculado em nenhuma trilha. Fale com seu líder.
    </div>

    <div v-for="item in trails" :key="item.trail.id" class="q-mb-lg">
      <q-card flat bordered class="q-mb-md">
        <q-card-section class="trail-header">
          <CollaboratorAvatar :collaborator="item.collaborator" size="56px" />

          <div class="trail-header__info">
            <div class="text-h6">{{ item.trail.description }}</div>
            <div class="text-caption text-grey-7">
              {{ item.team?.name }} &middot;
              {{ item.completed_stages_count }} de {{ item.stages_count }} etapas
              <template v-if="levelTotals(item).required">
                &middot; {{ levelTotals(item).done }} de
                {{ levelTotals(item).required }} níveis
              </template>
            </div>
          </div>

          <q-btn
            v-if="lastCompletedStage(item)"
            push
            class="trail-header__action"
            color="teal"
            icon="workspace_premium"
            label="Certificado"
            @click="openCertificate(lastCompletedStage(item), item.collaborator.id)"
          >
            <q-tooltip>Certificado de "{{ lastCompletedStage(item).description }}"</q-tooltip>
          </q-btn>

          <q-linear-progress
            rounded
            size="28px"
            class="trail-header__progress"
            :value="ratioOf(item)"
            :color="isComplete(item) ? 'positive' : 'light-green-6'"
          >
            <!-- Badge branco por cima: o texto precisa ler tanto na parte
                 preenchida quanto na vazia da barra. -->
            <div class="absolute-full flex flex-center">
              <q-badge
                color="white"
                :text-color="isComplete(item) ? 'positive' : 'green-9'"
                class="text-weight-bold"
              >
                <q-icon v-if="isComplete(item)" name="check_circle" size="15px" class="q-mr-xs" />
                {{ percentOf(item) }}%
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
          :stages="item.stages"
          :trail="{ description: item.trail.description, team: item.team?.name }"
          @stage-click="openStage($event, item)"
          @level-click="openLevel"
        />
      </q-card>

      <TrailStageList
        v-else
        :stages="item.stages"
        @certificate="openCertificate($event, item.collaborator.id)"
      />
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
            <div class="text-h6">
              {{ selectedStage.position }}. {{ selectedStage.description }}
            </div>
            <div class="text-caption text-grey-7">
              {{ stateLabel(selectedStage.state) }} &middot;
              {{ selectedStage.completed_levels_count }} de
              {{ selectedStage.required_count }} níveis necessários
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="selectedStage.note || selectedStage.job_plan" class="q-pt-none">
          <div v-if="selectedStage.job_plan" class="q-mb-sm">
            Leva para o plano
            <q-badge
              :style="`background: ${selectedStage.job_plan.badge_color || '#1976d2'}`"
            >
              {{ selectedStage.job_plan.description }}
            </q-badge>
          </div>
          <div v-if="selectedStage.note" class="text-body2 text-grey-8">
            {{ selectedStage.note }}
          </div>
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
            label="Meu certificado"
            @click="openCertificate(selectedStage, selectedCollaboratorId)"
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
          <div class="text-h6">{{ selectedLevel.description }}</div>
        </q-card-section>

        <q-card-section v-if="selectedLevel.note" class="q-pt-none text-body2 text-grey-8">
          {{ selectedLevel.note }}
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
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import trailsService from 'src/services/trails';
import CollaboratorAvatar from 'src/components/avatar/CollaboratorAvatar.vue';
import TrailFlow from 'src/components/trails/TrailFlow.vue';
import TrailStageList from 'src/components/trails/TrailStageList.vue';
import { STATES } from 'src/support/trails/states';
import { levelTotals, trailComplete, trailPercent, trailRatio } from 'src/support/trails/progress';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'MyTrailPage',
  components: { CollaboratorAvatar, TrailFlow, TrailStageList },
  setup() {
    const { mine, certificate } = trailsService();
    const $q = useQuasar();

    const trails = ref([]);
    const loading = ref(true);

    const stageDialog = ref(false);
    const levelDialog = ref(false);
    const selectedStage = ref(null);
    const selectedLevel = ref(null);
    const selectedCollaboratorId = ref(null);

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

    const openStage = (stage, item) => {
      selectedStage.value = stage;
      selectedCollaboratorId.value = item.collaborator.id;
      stageDialog.value = true;
    };

    const openLevel = (level) => {
      selectedLevel.value = level;
      levelDialog.value = true;
    };

    const openCertificate = async (stage, collaboratorId) => {
      try {
        const blob = await certificate(stage.id, collaboratorId);
        window.open(URL.createObjectURL(blob), '_blank');
      } catch (error) {
        notifyError(error);
      }
    };

    // O certificado é por etapa; no cabeçalho mostramos o da conquista mais
    // avançada, que é a que o colaborador quer exibir.
    const lastCompletedStage = (item) =>
      [...(item.stages ?? [])].reverse().find((stage) => stage.state === 'completed') ?? null;

    return {
      trails,
      loading,
      stageDialog,
      levelDialog,
      selectedStage,
      selectedLevel,
      selectedCollaboratorId,
      openStage,
      openLevel,
      openCertificate,
      ratioOf: trailRatio,
      percentOf: trailPercent,
      isComplete: trailComplete,
      levelTotals,
      lastCompletedStage,
      stateLabel: (state) => STATES[state]?.label ?? state,
      stateColor: (state) => STATES[state]?.color ?? 'grey',
      stateIcon: (state) => STATES[state]?.icon ?? 'help',
    };
  },
});
</script>

