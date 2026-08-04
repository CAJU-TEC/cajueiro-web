<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Trilhas de aprendizado" :to="{ name: 'trails.list' }" />
        <q-breadcrumbs-el :label="form.id ? 'Editar' : 'Adicionar'" />
      </q-breadcrumbs>
    </div>

    <q-form class="row q-col-gutter-sm" @submit="onSubmit">
      <q-select
        v-model="form.team_id"
        filled
        emit-value
        map-options
        option-value="id"
        option-label="name"
        :options="teams"
        label="Time *"
        class="col-lg-3 col-xs-12"
        :rules="[(val) => !!val || 'Selecione o time da trilha']"
        @update:model-value="loadJobPlans"
      />

      <q-input
        v-model="form.description"
        filled
        label="Descrição *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        filled
        :input-style="{ backgroundColor: form.color }"
        v-model="form.color"
        label="Cor"
        :rules="['anyColor']"
        class="col-lg-3 col-xs-12"
      >
        <template #append>
          <q-icon name="colorize" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-color v-model="form.color" />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="col-lg-2 col-xs-12 flex items-center">
        <q-toggle v-model="form.active" label="Trilha ativa" />
      </div>

      <div class="col-12">
        <q-input v-model="form.note" label="Observações" filled type="textarea" />
      </div>

      <div class="col-12 q-gutter-sm">
        <q-btn-group push class="float-right">
          <q-btn push label="Salvar" color="primary" icon="save_alt" type="submit" />
          <q-btn
            push
            label="Voltar"
            color="blue-10"
            :to="{ name: 'trails.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>

    <q-separator class="q-my-lg" />

    <div v-if="!form.id" class="text-grey-7 q-pa-md text-center">
      Salve a trilha para começar a cadastrar as etapas.
    </div>

    <div v-else>
      <div class="row items-center q-mb-md">
        <span class="text-h5">Etapas</span>
        <q-space />
        <q-btn color="primary" push icon="add" label="Nova etapa" @click="openStageDialog()" />
      </div>

      <div v-if="!stages.length" class="text-grey-7 q-pa-md text-center">
        Nenhuma etapa cadastrada ainda.
      </div>

      <q-list bordered separator class="rounded-borders">
        <q-expansion-item
          v-for="(stage, index) in stages"
          :key="stage.id"
          expand-separator
          group="stages"
        >
          <template #header>
            <q-item-section avatar>
              <q-avatar color="primary" text-color="white" size="32px">
                {{ stage.position }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ stage.description }}</q-item-label>
              <q-item-label caption>
                {{ stage.required_count }} de {{ stage.levels?.length ?? 0 }} níveis necessários
                <span v-if="stage.job_plan"> &middot; promove para {{ stage.job_plan.description }}</span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn-group push size="xs">
                <q-btn
                  push
                  size="xs"
                  icon="arrow_upward"
                  color="grey-7"
                  :disable="index === 0"
                  @click.stop="moveStage(index, -1)"
                />
                <q-btn
                  push
                  size="xs"
                  icon="arrow_downward"
                  color="grey-7"
                  :disable="index === stages.length - 1"
                  @click.stop="moveStage(index, 1)"
                />
                <q-btn push size="xs" icon="edit" color="blue" @click.stop="openStageDialog(stage)" />
                <q-btn push size="xs" icon="delete_outline" color="red" @click.stop="deleteStage(stage)" />
              </q-btn-group>
            </q-item-section>
          </template>

          <q-card>
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <span class="text-subtitle2">Material de apoio da etapa</span>
                <q-space />
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="add_link"
                  label="Anexar"
                  color="primary"
                  @click="openMaterialDialog('stage', stage.id)"
                />
              </div>
              <div v-if="!stage.materials?.length" class="text-grey-6 q-mb-md">
                Nenhum material anexado à etapa.
              </div>
              <div v-else class="q-mb-md">
                <q-chip
                  v-for="material in stage.materials"
                  :key="material.id"
                  icon="link"
                  removable
                  color="blue-1"
                  text-color="primary"
                  @remove="deleteMaterial(material)"
                >
                  <a :href="material.url" target="_blank" rel="noopener">{{ material.description }}</a>
                </q-chip>
              </div>

              <q-separator class="q-my-sm" />

              <div class="row items-center q-mb-sm">
                <span class="text-subtitle2">Níveis</span>
                <q-space />
                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="add"
                  label="Novo nível"
                  color="primary"
                  @click="openLevelDialog(stage.id)"
                />
              </div>

              <div v-if="!stage.levels?.length" class="text-grey-6">
                Nenhum nível cadastrado nessa etapa.
              </div>

              <q-list v-else bordered separator class="rounded-borders">
                <q-item v-for="level in stage.levels" :key="level.id">
                  <q-item-section>
                    <q-item-label>{{ level.description }}</q-item-label>
                    <q-item-label caption>
                      <q-badge
                        :color="SKILLS[level.skill]?.color"
                        :label="SKILLS[level.skill]?.label"
                        class="q-mr-xs"
                      />
                      {{ levelTypeLabel(level.type) }}
                    </q-item-label>
                    <q-item-label v-if="level.materials?.length" class="q-mt-xs">
                      <q-chip
                        v-for="material in level.materials"
                        :key="material.id"
                        dense
                        icon="link"
                        removable
                        color="blue-1"
                        text-color="primary"
                        @remove="deleteMaterial(material)"
                      >
                        <a :href="material.url" target="_blank" rel="noopener">{{ material.description }}</a>
                      </q-chip>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn-group push size="xs">
                      <q-btn
                        push
                        size="xs"
                        icon="add_link"
                        color="teal"
                        @click="openMaterialDialog('level', level.id)"
                      >
                        <q-tooltip>Anexar material</q-tooltip>
                      </q-btn>
                      <q-btn push size="xs" icon="edit" color="blue" @click="openLevelDialog(stage.id, level)" />
                      <q-btn push size="xs" icon="delete_outline" color="red" @click="deleteLevel(level)" />
                    </q-btn-group>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>

    <!-- etapa -->
    <q-dialog v-model="stageDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="text-h6">
          {{ stageForm.id ? 'Editar etapa' : 'Nova etapa' }}
        </q-card-section>
        <q-form @submit="saveStage">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="stageForm.description"
              filled
              label="Descrição *"
              :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
            />
            <q-select
              v-model="stageForm.job_plan_id"
              filled
              clearable
              emit-value
              map-options
              option-value="id"
              option-label="description"
              :options="jobPlans"
              label="Plano-alvo"
              hint="Plano que o colaborador recebe ao concluir a etapa"
            />
            <q-input
              v-model.number="stageForm.required_count"
              filled
              type="number"
              min="1"
              label="Mínimo de níveis para concluir *"
              :rules="[(val) => (val && val >= 1) || 'Informe pelo menos 1']"
            />
            <q-input v-model="stageForm.note" filled type="textarea" label="Observações" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="blue-10" v-close-popup />
            <q-btn push label="Salvar" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- nível -->
    <q-dialog v-model="levelDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="text-h6">
          {{ levelForm.id ? 'Editar nível' : 'Novo nível' }}
        </q-card-section>
        <q-form @submit="saveLevel">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="levelForm.description"
              filled
              label="Descrição *"
              :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
            />
            <div class="row q-col-gutter-sm">
              <q-select
                v-model="levelForm.type"
                class="col"
                filled
                emit-value
                map-options
                :options="typesForSkill"
                label="Tipo *"
              />
              <q-select
                v-model="levelForm.skill"
                class="col"
                filled
                emit-value
                map-options
                :options="levelSkills"
                label="Competência *"
                hint="Soft aparece acima, hard abaixo"
              />
            </div>
            <q-input v-model="levelForm.note" filled type="textarea" label="Observações" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="blue-10" v-close-popup />
            <q-btn push label="Salvar" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- material de apoio -->
    <q-dialog v-model="materialDialog">
      <q-card style="min-width: 420px">
        <q-card-section class="text-h6">Material de apoio</q-card-section>
        <q-form @submit="saveMaterial">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="materialForm.description"
              filled
              label="Descrição *"
              :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
            />
            <q-input
              v-model="materialForm.url"
              filled
              label="URL *"
              hint="https://..."
              :rules="[(val) => /^https?:\/\/.+/.test(val) || 'Informe uma URL válida']"
            />
            <q-select
              v-model="materialForm.type"
              filled
              emit-value
              map-options
              :options="materialTypes"
              label="Tipo *"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancelar" color="blue-10" v-close-popup />
            <q-btn push label="Salvar" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { computed, defineComponent, ref, onMounted, watch } from 'vue';
import trailsService from 'src/services/trails';
import teamsService from 'src/services/teams';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import { SKILLS } from 'src/support/trails/states';

// `skills` diz em qual competência o tipo faz sentido: teste técnico não existe
// para soft skill, mentoria e dinâmica não existem para hard. O formulário
// filtra a lista por isso; a API valida só o valor em si.
const LEVEL_TYPES = [
  { value: 'task', label: 'Tarefa', skills: ['soft', 'hard'] },
  { value: 'course', label: 'Curso', skills: ['soft', 'hard'] },
  { value: 'platform', label: 'Plataforma', skills: ['soft', 'hard'] },
  { value: 'technical_test', label: 'Teste técnico', skills: ['hard'] },
  { value: 'mentoring', label: 'Mentoria', skills: ['soft'] },
  { value: 'presentation', label: 'Apresentação', skills: ['soft'] },
  { value: 'dynamic', label: 'Dinâmica', skills: ['soft'] },
  { value: 'reading', label: 'Leitura', skills: ['soft'] },
  { value: 'other', label: 'Outro', skills: ['soft', 'hard'] },
];

const LEVEL_SKILLS = [
  { value: 'soft', label: 'Soft skill' },
  { value: 'hard', label: 'Hard skill' },
];

const MATERIAL_TYPES = [
  { value: 'course', label: 'Curso' },
  { value: 'platform', label: 'Plataforma' },
  { value: 'technical_test', label: 'Teste técnico' },
  { value: 'documentation', label: 'Documentação' },
  { value: 'other', label: 'Outro' },
];

export default defineComponent({
  name: 'FormTrail',
  setup() {
    const {
      post,
      getById,
      update,
      storeStage,
      updateStage,
      removeStage,
      reorderStages,
      storeLevel,
      updateLevel,
      removeLevel,
      storeMaterial,
      removeMaterial,
    } = trailsService();
    const { list: listTeams } = teamsService();

    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      team_id: null,
      description: '',
      note: '',
      color: '',
      active: true,
    });
    const stages = ref([]);
    const teams = ref([]);
    const jobPlans = ref([]);

    const stageDialog = ref(false);
    const levelDialog = ref(false);
    const materialDialog = ref(false);

    const stageForm = ref({});
    const levelForm = ref({});
    const materialForm = ref({});

    const notifyError = (error) => {
      $q.notify({
        icon: 'block',
        message: 'Ops! Ocorreu um erro.',
        caption: error.message,
        color: 'negative',
      });
    };

    const notifySaved = () => {
      $q.notify({ message: 'Dados salvos com sucesso', icon: 'check', color: 'positive' });
    };

    onMounted(async () => {
      try {
        teams.value = await listTeams();
      } catch (error) {
        notifyError(error);
      }

      if (route.params.id) {
        await getTrail(route.params.id);
      }
    });

    const getTrail = async (id) => {
      try {
        const response = await getById(id);
        form.value = {
          id: response.id,
          team_id: response.team_id,
          description: response.description,
          note: response.note,
          color: response.color,
          active: !!response.active,
        };
        stages.value = response.stages ?? [];
        await loadJobPlans(response.team_id);
      } catch (error) {
        notifyError(error);
      }
    };

    const loadJobPlans = async (teamId) => {
      if (!teamId) {
        jobPlans.value = [];
        return;
      }

      try {
        const { data } = await api.get('api/jobPlans', { params: { team_id: teamId } });
        jobPlans.value = data;
      } catch (error) {
        jobPlans.value = [];
        notifyError(error);
      }
    };

    const onSubmit = async () => {
      try {
        const saved = form.value.id ? await update(form.value) : await post(form.value);
        notifySaved();

        if (!form.value.id) {
          router.replace({ name: 'trails.form', params: { id: saved.id } });
          await getTrail(saved.id);
        }
      } catch (error) {
        notifyError(error);
      }
    };

    // etapas
    const openStageDialog = (stage) => {
      stageForm.value = stage
        ? {
          id: stage.id,
          description: stage.description,
          note: stage.note,
          job_plan_id: stage.job_plan_id,
          required_count: stage.required_count,
        }
        : { description: '', note: '', job_plan_id: null, required_count: 1 };
      stageDialog.value = true;
    };

    const saveStage = async () => {
      try {
        if (stageForm.value.id) {
          await updateStage(stageForm.value.id, stageForm.value);
        } else {
          await storeStage(form.value.id, stageForm.value);
        }
        stageDialog.value = false;
        notifySaved();
        await getTrail(form.value.id);
      } catch (error) {
        notifyError(error);
      }
    };

    const deleteStage = (stage) => {
      $q.dialog({
        title: 'Remover',
        message: `Remover a etapa "${stage.description}" e seus níveis?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await removeStage(stage.id);
          notifySaved();
          await getTrail(form.value.id);
        } catch (error) {
          notifyError(error);
        }
      });
    };

    const moveStage = async (index, direction) => {
      const ordered = [...stages.value];
      const target = index + direction;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

      try {
        await reorderStages(form.value.id, ordered.map((stage) => stage.id));
        await getTrail(form.value.id);
      } catch (error) {
        notifyError(error);
      }
    };

    // níveis
    const openLevelDialog = (stageId, level) => {
      levelForm.value = level
        ? {
          id: level.id,
          stage_id: stageId,
          description: level.description,
          note: level.note,
          type: level.type,
          skill: level.skill,
        }
        : { stage_id: stageId, description: '', note: '', type: 'task', skill: 'hard' };
      levelDialog.value = true;
    };

    const saveLevel = async () => {
      try {
        if (levelForm.value.id) {
          await updateLevel(levelForm.value.id, levelForm.value);
        } else {
          await storeLevel(levelForm.value.stage_id, levelForm.value);
        }
        levelDialog.value = false;
        notifySaved();
        await getTrail(form.value.id);
      } catch (error) {
        notifyError(error);
      }
    };

    const deleteLevel = (level) => {
      $q.dialog({
        title: 'Remover',
        message: `Remover o nível "${level.description}"?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        try {
          await removeLevel(level.id);
          notifySaved();
          await getTrail(form.value.id);
        } catch (error) {
          notifyError(error);
        }
      });
    };

    // materiais de apoio
    const openMaterialDialog = (materialableType, materialableId) => {
      materialForm.value = {
        description: '',
        url: '',
        type: 'course',
        materialable_type: materialableType,
        materialable_id: materialableId,
      };
      materialDialog.value = true;
    };

    const saveMaterial = async () => {
      try {
        await storeMaterial(materialForm.value);
        materialDialog.value = false;
        notifySaved();
        await getTrail(form.value.id);
      } catch (error) {
        notifyError(error);
      }
    };

    const deleteMaterial = async (material) => {
      try {
        await removeMaterial(material.id);
        notifySaved();
        await getTrail(form.value.id);
      } catch (error) {
        notifyError(error);
      }
    };

    const levelTypeLabel = (type) =>
      LEVEL_TYPES.find((option) => option.value === type)?.label ?? 'Tarefa';

    const typesForSkill = computed(() =>
      LEVEL_TYPES.filter((option) => option.skills.includes(levelForm.value.skill ?? 'hard'))
    );

    // Trocar a competência pode invalidar o tipo já escolhido (teste técnico
    // em soft, mentoria em hard). Volta para "Tarefa", que serve nas duas, em
    // vez de deixar o select com um valor que a lista não oferece mais.
    watch(
      () => levelForm.value.skill,
      () => {
        if (!typesForSkill.value.some((option) => option.value === levelForm.value.type)) {
          levelForm.value.type = 'task';
        }
      }
    );

    return {
      form,
      stages,
      teams,
      jobPlans,
      levelSkills: LEVEL_SKILLS,
      typesForSkill,
      SKILLS,
      materialTypes: MATERIAL_TYPES,
      stageDialog,
      levelDialog,
      materialDialog,
      stageForm,
      levelForm,
      materialForm,
      onSubmit,
      loadJobPlans,
      openStageDialog,
      saveStage,
      deleteStage,
      moveStage,
      openLevelDialog,
      saveLevel,
      deleteLevel,
      openMaterialDialog,
      saveMaterial,
      deleteMaterial,
      levelTypeLabel,
    };
  },
});
</script>
