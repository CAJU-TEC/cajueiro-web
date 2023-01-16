<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Protocolos" :to="{ name: 'tickets.list' }" />
        <q-breadcrumbs-el label="Detalhes" />
      </q-breadcrumbs>
    </div>
    <div class="q-pa-md">
      <div class="row">
        <div class="col">
          <span class="text-caption">Prioridade</span>
          <p class="text-subtitle2">
            <q-badge rounded :color="`${priority[form.priority].color}`">
              <q-tooltip
                :offset="[10, 10]"
                anchor="top middle"
                self="bottom middle"
              >
                <span v-if="form.priority === 'yes'">PRIORIDADE</span>
                <span v-else-if="form.priority === 'no'">RELEVÂNCIA BAIXA</span>
              </q-tooltip>
            </q-badge>
            {{ `${priority[form.priority].title}` }}
          </p>
        </div>
        <div class="col">
          <span class="text-caption">Kanban</span>
          <p class="text-subtitle2">
            <q-badge rounded :color="`${status[form.status].color}`">
              <q-tooltip
                :offset="[10, 10]"
                anchor="top middle"
                self="bottom middle"
              >
                <span>{{ `${status[form.status].title}` }}</span>
              </q-tooltip>
            </q-badge>
            {{ `${status[form.status].title}` }}
          </p>
        </div>
        <div class="col">
          <span class="text-caption">Atribuição</span>
          <p class="text-subtitle2">
            <q-chip v-if="form.collaborator?.image">
              <q-avatar>
                <img
                  :src="`http://localhost:8000/storage/images/${form.collaborator?.image?.uri}`"
                />
              </q-avatar>
              {{ form.collaborator?.full_name }}
            </q-chip>
            <span v-else>{{ form.collaborator?.full_name }}</span>
          </p>
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="col">
          <span class="text-caption">Impacto do protocolo</span>
          <p class="q-mb-xs text-subtitle2">
            <q-badge rounded :color="`${form.impact}`">
              <q-tooltip
                :offset="[10, 10]"
                anchor="top middle"
                self="bottom middle"
              >
                <span> {{ form.impact?.description ?? '[- - -]' }} </span>
              </q-tooltip>
            </q-badge>
            &nbsp;<strong
              >( {{ form.impact?.description ?? '[- - -]' }} )</strong
            >&nbsp;-&nbsp; {{ form.impact?.classification }}
          </p>
          <p class="q-mb-xs text-caption">
            <strong> Exemplos:</strong> {{ form.impact?.example ?? '[- - -]' }}
          </p>
        </div>
      </div>
      <hr />
      <div class="row">
        <div class="col">
          <span class="text-caption">Cliente</span>
          <p class="q-mb-xs text-subtitle2">
            {{ form.client?.full_name ?? '[- - -]' }}
          </p>
        </div>
        <div class="col">
          <span class="q-mb-xs text-caption">
            <span class="text-caption">Contato</span>
            <p class="q-mb-xs text-subtitle2">
              {{ form.client?.email?.description }}
            </p>
          </span>
        </div>
      </div>
      <hr v-if="form.image" />
      <div class="row" v-if="form.image">
        <div class="col">
          <span class="text-caption">Imagens</span>
          <p>
            <a
              :href="`http://localhost:8000/storage/images/${form.image?.uri}`"
              target="_blank"
            >
              <q-img
                :src="`http://localhost:8000/storage/images/${form.image?.uri}`"
                spinner-color="white"
                :ratio="16 / 9"
              />
            </a>
          </p>
        </div>
        <div class="col"></div>
      </div>
      <hr />
      <div class="row">
        <div class="col">
          <span class="text-caption">Assunto</span>
          <p>
            {{ form.subject }}
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <span class="text-caption">Mensagem</span>
          <p v-html="form.message"></p>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script>
import { defineComponent, ref, onMounted } from 'vue';
import priority from 'src/support/tickets/priority';
import status from 'src/support/tickets/status';
import ticketsService from 'src/services/tickets';
import { useQuasar } from 'quasar';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'DetailsView',
  setup() {
    const { getById } = ticketsService();
    const $q = useQuasar();
    const route = useRoute();
    const form = ref({
      client_id: ref(''),
      collaborator_id: ref(''),
      impact_id: ref(''),
      priority: ref('no'),
      subject: ref(''),
      message: ref(''),
      status: ref('backlog'),
      image: ref(''),
    });

    onMounted(async () => {
      if (route.params.id) {
        getTicket(route.params.id);
      }
    });

    const getTicket = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro na busca do protocolo.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    return {
      priority,
      status,
      form,
    };
  },
});
</script>
