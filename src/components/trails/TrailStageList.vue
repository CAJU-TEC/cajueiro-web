<template>
  <q-list bordered separator class="rounded-borders">
    <q-expansion-item
      v-for="stage in stages"
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
              @click="$emit('certificate', stage)"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { defineComponent } from 'vue';
import { STATES } from 'src/support/trails/states';

export default defineComponent({
  name: 'TrailStageList',
  emits: ['certificate'],
  props: {
    stages: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    return {
      stateLabel: (state) => STATES[state]?.label ?? state,
      stateColor: (state) => STATES[state]?.color ?? 'grey',
      stateIcon: (state) => STATES[state]?.icon ?? 'help',
    };
  },
});
</script>
