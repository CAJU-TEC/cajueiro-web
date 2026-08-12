<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Escalas" :to="{ name: 'schedules.list' }" />
        <q-breadcrumbs-el :label="form.id ? 'Editar' : 'Adicionar'" />
      </q-breadcrumbs>
    </div>
    <q-form class="row q-col-gutter-sm" @submit="onSubmit">
      <q-input
        v-model="form.title"
        filled
        label="Título *"
        lazy-rules
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input v-model="form.date" filled label="Data *" mask="####-##-##" class="col-lg-4 col-xs-12" :rules="[(val) => (val && val.length === 10) || 'Preencha o campo acima']">
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-date v-model="form.date" mask="YYYY-MM-DD" minimal>
                <div class="row items-center justify-end">
                  <q-btn label="OK" color="primary" flat v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="form.start_time" filled label="Horário de início *" mask="##:##" class="col-lg-4 col-xs-12" :rules="[(val) => (val && val.length === 5) || 'Preencha o campo acima']">
        <template #append>
          <q-icon name="schedule" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="form.start_time" mask="HH:mm" format24h>
                <div class="row items-center justify-end">
                  <q-btn label="OK" color="primary" flat v-close-popup />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input v-model="form.lunch_start_time" filled label="Início do almoço *" mask="##:##" class="col-lg-4 col-xs-12" :rules="[(val) => (val && val.length === 5) || 'Preencha o campo acima']">
        <template #append>
          <q-icon name="schedule" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="form.lunch_start_time" mask="HH:mm" format24h>
                <div class="row items-center justify-end">
                  <q-btn label="OK" color="primary" flat v-close-popup />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model.number="form.lunchDurationHours"
        filled
        type="number"
        step="0.5"
        min="0.5"
        label="Duração do almoço (horas) *"
        class="col-lg-4 col-xs-12"
        :rules="[(val) => (val && val > 0) || 'Preencha o campo acima']"
      />

      <q-input v-model="form.end_time" filled label="Horário de fim *" mask="##:##" class="col-lg-4 col-xs-12" :rules="[(val) => (val && val.length === 5) || 'Preencha o campo acima']">
        <template #append>
          <q-icon name="schedule" class="cursor-pointer">
            <q-popup-proxy transition-show="scale" transition-hide="scale">
              <q-time v-model="form.end_time" mask="HH:mm" format24h>
                <div class="row items-center justify-end">
                  <q-btn label="OK" color="primary" flat v-close-popup />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="col-12">
        <AutoComplete
          :key="pickerKey"
          label="Buscar colaborador para adicionar"
          :options-value="collaboratorOptions"
          @update:modelValue="onPickCollaborator"
        />
      </div>

      <div class="col-12">
        <div class="text-caption text-grey-8 q-mb-xs" v-if="form.collaborators.length">
          Arraste para reordenar — a ordem define a sequência dos horários calculados.
        </div>
        <q-list bordered separator v-if="form.collaborators.length">
          <q-item
            v-for="(collaborator, index) in form.collaborators"
            :key="collaborator.id"
            draggable="true"
            @dragstart="onDragStart(index)"
            @dragover.prevent
            @drop="onDrop(index)"
          >
            <q-item-section avatar>
              <q-icon name="drag_indicator" class="cursor-move" />
            </q-item-section>
            <q-item-section>
              {{ index + 1 }}. {{ collaborator.label }}
            </q-item-section>
            <q-item-section side>
              <q-btn flat round dense size="sm" icon="close" color="grey-7" @click="removeCollaborator(index)" />
            </q-item-section>
          </q-item>
        </q-list>
        <div v-else class="text-caption text-grey-6">
          Nenhum colaborador adicionado ainda.
        </div>
      </div>

      <div class="col-12" v-if="previewSchedule">
        <q-separator class="q-mb-md" />
        <div class="text-caption text-grey-8 q-mb-sm">Pré-visualização</div>
        <div class="row justify-center">
          <ScheduleBoard :schedule="previewSchedule" />
        </div>
      </div>

      <div class="col-12 q-gutter-sm">
        <q-btn-group push class="float-right">
          <q-btn
            push
            label="Salvar"
            color="primary"
            icon="save_alt"
            type="submit"
          />
          <q-btn
            push
            label="Cancelar"
            color="blue-10"
            :to="{ name: 'schedules.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import schedulesService from 'src/services/schedules';
import collaboratorsService from 'src/services/collaborators';
import AutoComplete from 'src/components/select-search/AutoComplete.vue';
import ScheduleBoard from 'src/components/schedules/ScheduleBoard.vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
  name: 'FormSchedule',
  components: { AutoComplete, ScheduleBoard },
  setup() {
    const { post, getById, update } = schedulesService();
    const { list: listCollaborators } = collaboratorsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();

    const form = ref({
      title: '',
      date: '',
      start_time: '',
      lunch_start_time: '',
      lunchDurationHours: 2,
      end_time: '',
      collaborators: [],
    });

    const collaboratorOptions = ref([]);
    const pickerKey = ref(0);
    const draggedIndex = ref(null);

    const previewSchedule = computed(() => {
      if (!form.value.title) return null;

      return {
        title: form.value.title,
        date: form.value.date,
        start_time: form.value.start_time,
        lunch_start_time: form.value.lunch_start_time,
        lunch_duration_minutes: Math.round((form.value.lunchDurationHours || 0) * 60),
        end_time: form.value.end_time,
        collaborators: form.value.collaborators,
      };
    });

    onMounted(async () => {
      await getCollaboratorOptions();
      if (route.params.id) {
        getSchedule(route.params.id);
      }
    });

    const getCollaboratorOptions = async () => {
      try {
        const data = await listCollaborators();
        collaboratorOptions.value = data
          .filter((collaborator) => !collaborator.egress)
          .map((collaborator) => ({ id: collaborator.id, label: collaborator.full_name }));
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro ao buscar colaboradores.',
          caption: error.message,
          icon: 'block',
          color: 'warning',
        });
      }
    };

    const getSchedule = async (id) => {
      try {
        const response = await getById(id);
        form.value = {
          id: response.id,
          title: response.title,
          date: response.date,
          start_time: response.start_time?.slice(0, 5),
          lunch_start_time: response.lunch_start_time?.slice(0, 5),
          lunchDurationHours: response.lunch_duration_minutes / 60,
          end_time: response.end_time?.slice(0, 5),
          collaborators: (response.collaborators ?? []).map((collaborator) => ({
            id: collaborator.id,
            label: [collaborator.first_name, collaborator.last_name].filter(Boolean).join(' '),
          })),
        };
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          caption: error.message,
          icon: 'block',
          color: 'warning',
        });
      }
    };

    const onPickCollaborator = (picked) => {
      pickerKey.value += 1;

      if (!picked?.id) return;

      if (form.value.collaborators.some((collaborator) => collaborator.id === picked.id)) {
        $q.notify({ message: 'Esse colaborador já foi adicionado.', color: 'warning', icon: 'block' });
        return;
      }

      form.value.collaborators.push(picked);
    };

    const removeCollaborator = (index) => {
      form.value.collaborators.splice(index, 1);
    };

    const onDragStart = (index) => {
      draggedIndex.value = index;
    };

    const onDrop = (targetIndex) => {
      if (draggedIndex.value === null || draggedIndex.value === targetIndex) return;

      const collaborators = [...form.value.collaborators];
      const [dragged] = collaborators.splice(draggedIndex.value, 1);
      collaborators.splice(targetIndex, 0, dragged);

      form.value.collaborators = collaborators;
      draggedIndex.value = null;
    };

    const onSubmit = async () => {
      if (!form.value.collaborators.length) {
        $q.notify({ message: 'Adicione ao menos um colaborador.', color: 'warning', icon: 'block' });
        return;
      }

      const payload = {
        id: form.value.id,
        title: form.value.title,
        date: form.value.date,
        start_time: form.value.start_time,
        lunch_start_time: form.value.lunch_start_time,
        lunch_duration_minutes: Math.round(form.value.lunchDurationHours * 60),
        end_time: form.value.end_time,
        collaborator_ids: form.value.collaborators.map((collaborator) => collaborator.id),
      };

      try {
        if (payload.id) {
          await update(payload);
        } else {
          await post(payload);
        }

        $q.notify({
          message: 'Dados salvos com sucesso',
          icon: 'check',
          color: 'positive',
        });
        router.push({ name: 'schedules.list' });
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro.',
          caption: error.message,
          color: 'negative',
        });
      }
    };

    return {
      form,
      collaboratorOptions,
      pickerKey,
      previewSchedule,
      onPickCollaborator,
      removeCollaborator,
      onDragStart,
      onDrop,
      onSubmit,
    };
  },
});
</script>
