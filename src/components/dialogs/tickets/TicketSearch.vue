<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="model"
      transition-show="flip-down"
      transition-hide="flip-up"
    >
      <q-card class="bg-primary text-white">
        <q-bar>
          <q-icon name="mdi-ticket-outline" />
          <div>Buscar Protocolo</div>

          <q-space />

          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Fechar</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <q-input
            bottom-slots
            rounded
            standout
            autofocus
            class="text-h4"
            v-model="state.code"
          >
            <template #prepend>
              <q-icon name="mdi-pound" />
            </template>
            <template #append>
              <q-icon
                name="close"
                @click="state.code = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row">
            <div v-if="tickets?.length" class="col">
              Cajueiro encontrou:
              <span class="text-weight-bold">{{ tickets?.length }}</span>
              protocolos.
            </div>
            <div v-else class="col">
              Informe o número de protocolo acima para que o cajueiro possa
              encontrar.
            </div>
          </div>
          <div v-if="tickets?.length" class="row">
            <div class="col">
              <q-card
                flat
                bordered
                v-for="ticket in tickets"
                :key="ticket.id"
                class="q-my-lg"
              >
                <q-item
                  class="my-q-item"
                  :href="`/tickets/details/${ticket.id}`"
                >
                  >
                  <q-item-section avatar>
                    <template v-if="ticket.client?.corporate?.image">
                      <q-avatar
                        class="q-ma-none"
                        size="sm"
                        v-if="ticket.client?.corporate?.image"
                      >
                        <q-tooltip
                          :offset="[10, 10]"
                          anchor="top middle"
                          self="bottom middle"
                        >
                          <div>
                            {{ ticket.client?.corporate?.full_name }}
                          </div>
                        </q-tooltip>
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.client?.corporate?.image?.uri}`"
                        />
                      </q-avatar>
                    </template>
                    <template v-else>
                      <q-avatar class="q-ma-none" size="sm" color="primary">{{
                        ticket.client?.corporate?.letter
                      }}</q-avatar>
                    </template>
                  </q-item-section>
                  <q-item-section class="text-grey-10">
                    <q-item-label>#{{ ticket.code }}</q-item-label>
                    <q-item-label caption>
                      {{ ticket.subject }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-card-section horizontal class="text-grey-10">
                  <q-card-section>
                    <div class="row">
                      <div
                        class="col text-caption"
                        v-if="ticket.dufy === 'yes'"
                      >
                        <q-badge rounded color="green">
                          <q-tooltip
                            :offset="[10, 10]"
                            anchor="top middle"
                            self="bottom middle"
                          >
                            <span>PLANTÃO</span>
                          </q-tooltip>
                        </q-badge>
                        PLANTÃO
                      </div>
                    </div>
                    <div class="row">
                      <div class="col text-caption">
                        <q-badge
                          rounded
                          :color="`${priority[ticket?.priority]?.color}`"
                        >
                          <q-tooltip
                            :offset="[10, 10]"
                            anchor="top middle"
                            self="bottom middle"
                          >
                            <span v-if="ticket.priority === 'yes'"
                              >PRIORIDADE</span
                            >
                            <span v-else-if="ticket.priority === 'no'"
                              >RELEVÂNCIA BAIXA</span
                            >
                          </q-tooltip>
                        </q-badge>
                        {{ `${priority[ticket?.priority]?.title}` }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="col text-caption">
                        <q-badge
                          rounded
                          :color="`${status[ticket?.status]?.color}`"
                        >
                          <q-tooltip
                            :offset="[10, 10]"
                            anchor="top middle"
                            self="bottom middle"
                          >
                            <span>{{
                              `${status[ticket?.status]?.title}`
                            }}</span>
                          </q-tooltip>
                        </q-badge>
                        {{ `${status[ticket?.status]?.title}` }}
                      </div>
                    </div>
                    <div class="row">
                      <div class="col text-caption">
                        <q-badge
                          rounded
                          :style="`background:${ticket?.impact?.color}`"
                        >
                          <q-tooltip
                            :offset="[10, 10]"
                            anchor="top middle"
                            self="bottom middle"
                          >
                            <span>
                              {{ ticket.impact?.description ?? '[- - -]' }}
                            </span>
                          </q-tooltip>
                        </q-badge>
                        {{ ticket.impact?.description ?? '[- - -]' }}
                      </div>
                    </div>
                  </q-card-section>

                  <q-separator vertical />

                  <q-card-section>
                    <div class="row">
                      <div class="col">
                        <span class="text-caption">Atribuição</span>
                        <p class="text-caption">
                          <q-chip v-if="ticket.collaborator?.image">
                            <q-avatar>
                              <img
                                :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator?.image?.uri}`"
                              />
                            </q-avatar>
                            {{ ticket.collaborator?.first_name }}
                          </q-chip>
                          <span v-else>{{
                            ticket.collaborator?.first_name
                          }}</span>
                          <span v-if="!ticket.collaborator"
                            >Sem colaborador</span
                          >
                        </p>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col">
                        <span class="text-caption">Criador do Protocolo</span>
                        <p class="text-caption">
                          <q-chip v-if="ticket.user?.collaborator?.image">
                            <q-avatar>
                              <img
                                :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.user?.collaborator?.image?.uri}`"
                              />
                            </q-avatar>
                            {{ ticket.user?.collaborator?.first_name }}
                          </q-chip>
                          <span v-else>{{
                            ticket.user?.collaborator?.first_name
                          }}</span>
                          <span v-if="!ticket.user?.collaborator"
                            >Sem colaborador</span
                          >
                        </p>
                      </div>
                    </div>
                    <div class="row" v-if="(ticket?.comments).length > 0">
                      <div class="col">
                        <span class="text-caption">Histórico</span>
                        <p
                          class="text-caption"
                          v-html="getFirst(ticket?.comments).description"
                        ></p>
                      </div>
                    </div>
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { computed, reactive, ref, watch } from 'vue';
import ticketsService from 'src/services/tickets';
import priority from 'src/support/tickets/priority';
import status from 'src/support/tickets/status';
import { useRouter } from 'vue-router';
import _ from 'lodash';

const state = reactive({
  code: null,
});
const tickets = ref([]);

export default {
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { findTicketsAtCode } = ticketsService();
    const router = useRouter();

    const model = computed({
      get() {
        return props.modelValue;
      },
      set(newValue) {
        state.code = null;
        emit('update:modelValue', newValue);
      },
    });

    const getFirst = (elements) => {
      return _.head(elements);
    };

    const getTickets = async (work) => {
      try {
        const response = await findTicketsAtCode(work);
        tickets.value = await response;
      } catch (error) {
        console.log(error);
      }
    };

    const handleListClient = (id) => {
      router.push({ name: 'tickets.details', params: { id } });
    };

    watch(state, async (newValue) => {
      if (!state.code) {
        tickets.value = null;
        return null;
      }
      if (state.code.length > 3) {
        getTickets(newValue.code);
      }
      tickets.value = null;
      return null;
    });

    return {
      model,
      state,
      tickets,
      status,
      priority,
      handleListClient,
      getFirst,
    };
  },
};
</script>

<style lang="sass" scoped>
.my-card
  width: 100%
.my-q-item:hover
    background-color: #eee
    cursor: pointer
</style>
