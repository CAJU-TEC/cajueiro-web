<template>
  <div class="q-py-md">
    <q-tabs v-model="tab" class="bg-yellow">
      <q-tab
        :alert="
          ticketsOpenYesPriorityLocal.data?.length +
          ticketsOpenNoPriorityLocal.data?.length
            ? true
            : false
        "
        name="ticketsOpen"
        icon="mdi-ticket-outline"
        label="Abertos"
        @click="() => $emit('updateTicketsOpen', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInDevelopLocal?.data?.length ? true : false"
        name="ticketsDevelop"
        icon="mdi-ticket-account"
        label="Desenvolvimento"
        @click="() => $emit('updateTicketsDevelop', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInTestsLocal?.data?.length ? true : false"
        name="ticketsTests"
        icon="fa fa-bugs"
        label="Teste"
        @click="() => $emit('updateTicketsTests', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInBacklogLocal?.data?.length ? true : false"
        name="ticketsBacklog"
        icon="fa fa-cubes"
        label="Aguardando"
        @click="() => $emit('updateTicketsBacklog', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInValidationLocal?.data?.length ? true : false"
        name="ticketsValidation"
        icon="fa fa-fire-extinguisher"
        label="Validação"
        @click="() => $emit('updateTicketsValidation', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInPendingLocal?.data?.length ? true : false"
        name="ticketsPending"
        icon="fa fa-hourglass"
        label="Pendentes"
        @click="() => $emit('updateTicketsPending', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInDoneLocal?.data?.length ? true : false"
        name="ticketsDone"
        icon="mdi-check"
        label="Finalizados"
        @click="() => $emit('updateTicketsDone', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInMyTicketsLocal?.data?.length ? true : false"
        name="myTickets"
        icon="mdi-ticket"
        label="Meus protocolos"
        @click="() => $emit('updateTicketsMy', true)"
      >
      </q-tab>
    </q-tabs>

    <template v-if="tab === 'ticketsOpen'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos abertos</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <q-item-label header>PRIORIDADES</q-item-label>
        <template v-if="ticketsOpenYesPriority.data">
          <div
            v-for="ticket in ticketsOpenYesPriorityLocal.data"
            :key="ticket?.id"
          >
            <q-item class="q-ma-none bg-red-1" v-ripple>
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                  com estimativa: {{ ticket?.impact?.days }} dias. &nbsp;
                  <q-badge
                    v-if="
                      betweenDates(new Date(), ticket?.created_at) >
                      ticket?.impact?.days
                    "
                    rounded
                    color="red"
                    >PRAZO ESTOURADO</q-badge
                  >
                  &nbsp;
                  <q-badge
                    v-if="
                      betweenDates(new Date(), ticket?.created_at) >
                      ticket?.impact?.days
                    "
                    rounded
                    color="info piscar"
                  >
                    {{
                      betweenDates(new Date(), ticket?.created_at) -
                      ticket?.impact?.days
                    }}
                    DIAS</q-badge
                  >
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn
                    unelevated
                    size="xs"
                    round
                    color="primary"
                    icon="rocket_launch"
                    v-if="allowTickets(ticket?.status)"
                    @click="
                      () => {
                        $emit('addUserTicker', ticket?.id);
                      }
                    "
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      <div>Quero esse protocolo</div>
                    </q-tooltip>
                  </q-btn>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsOpenYesPriorityLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsOpenYesPriorityLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>

        <q-item-label header>OUTROS</q-item-label>
        <template v-if="ticketsOpenNoPriorityLocal.data">
          <div
            v-for="ticket in ticketsOpenNoPriorityLocal.data"
            :key="ticket?.id"
          >
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
              v-ripple
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                  com estimativa: {{ ticket?.impact?.days }} dias. &nbsp;
                  <q-badge
                    v-if="
                      betweenDates(new Date(), ticket?.created_at) >
                      ticket?.impact?.days
                    "
                    rounded
                    color="red"
                    label="PRAZO ESTOURADO"
                  />&nbsp;
                  <q-badge
                    v-if="
                      betweenDates(new Date(), ticket?.created_at) >
                      ticket?.impact?.days
                    "
                    rounded
                    color="info piscar"
                  >
                    {{
                      betweenDates(new Date(), ticket?.created_at) -
                      ticket?.impact?.days
                    }}
                    DIAS</q-badge
                  >
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn
                    unelevated
                    size="xs"
                    round
                    color="primary"
                    icon="rocket_launch"
                    v-if="allowTickets(ticket?.status)"
                    @click="
                      () => {
                        $emit('addUserTicker', ticket?.id);
                      }
                    "
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      <div>Quero esse protocolo</div>
                    </q-tooltip>
                  </q-btn>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsOpenNoPriorityLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsOpenNoPriorityLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsDevelop'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos em desenvolvimento</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInDevelopLocal.data">
          <div v-for="ticket in ticketsInDevelopLocal.data" :key="ticket?.id">
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInDevelopLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInDevelopLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsTests'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos em fase de testes</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInTestsLocal.data">
          <div v-for="ticket in ticketsInTestsLocal.data" :key="ticket?.id">
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>

        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInTestsLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInTestsLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsBacklog'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos aguardando (backlog)</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInBacklogLocal.data">
          <div v-for="ticket in ticketsInBacklogLocal.data" :key="ticket?.id">
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInBacklogLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInBacklogLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsValidation'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Aguardando validação (cliente)</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInValidationLocal.data">
          <div
            v-for="ticket in ticketsInValidationLocal.data"
            :key="ticket?.id"
          >
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInValidationLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInValidationLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsPending'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos com pendências</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInPendingLocal.data">
          <div v-for="ticket in ticketsInPendingLocal.data" :key="ticket?.id">
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Criado em: {{ dateFormat(ticket?.created_at) }}
                  | Protocolo aberto
                  <span v-if="betweenDates(new Date(), ticket?.created_at)"
                    >à
                    <span class="text-weight-bold">{{
                      `${betweenDates(new Date(), ticket?.created_at)}`
                    }}</span>
                    dia(s)</span
                  >
                  <span v-else>Hoje</span>
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInPendingLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInPendingLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsDone'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos finalizados</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInDoneLocal.data">
          <div v-for="ticket in ticketsInDoneLocal.data" :key="ticket?.id">
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Finalizado em: {{ dateFormat(ticket?.updated_at) }}
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInDoneLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInDoneLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'myTickets'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Meus Protocolos</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInMyTicketsLocal.data">
          <div v-for="ticket in ticketsInMyTicketsLocal.data" :key="ticket?.id">
            <q-item
              class="q-ma-none"
              :class="{ 'bg-green-1': ticket?.dufy === 'yes' }"
            >
              <q-item-section avatar>
                <template v-if="ticket?.client?.corporate?.image">
                  <q-avatar
                    class="q-ma-none"
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
              </q-item-section>

              <q-item-section>
                <q-item-label
                  @click="$emit('handleListClient', ticket.id)"
                  style="cursor: pointer"
                  class="row"
                >
                  <div class="text-green" v-if="ticket?.dufy == 'yes'">
                    <q-icon size="xs" name="update">
                      <q-tooltip
                        :offset="[10, 10]"
                        anchor="top middle"
                        self="bottom middle"
                      >
                        PLANTÃO
                      </q-tooltip>
                    </q-icon>
                  </div>
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type].hex}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ types[ticket?.type].title }}
                    </q-tooltip>
                  </q-badge>
                  {{ types[ticket?.type].title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                    <q-tooltip
                      :offset="[10, 10]"
                      anchor="top middle"
                      self="bottom middle"
                    >
                      {{ ticket?.impact?.description }}
                    </q-tooltip>
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Finalizado em: {{ dateFormat(ticket?.updated_at) }}
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <q-avatar v-if="ticket?.collaborator?.image">
                        <img
                          :src="`https://cajueiroapi.cajutec.com.br/storage/images/${ticket.collaborator.image.uri}`"
                        />
                      </q-avatar>
                      {{ ticket.collaborator?.first_name }}
                    </q-chip>
                  </template>
                  <q-badge
                    rounded
                    flat
                    class="text-caption text-weight-regular"
                    :style="`background:${
                      status[ticket?.status]?.hex
                    }; font-size: 10px;`"
                    :label="`${status[ticket?.status]?.title}`"
                  />
                </div>
              </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </template>
        <div v-else class="q-pa-xs q-gutter-sm text-center">
          <q-banner inline-actions rounded class="bg-blue-2 text-blue q-pt-lg">
            <div>
              <q-spinner-oval color="primary" size="2em" />
              <p>Aguarde enquanto carrega os dados.</p>
              <q-tooltip :offset="[0, 8]"
                >Aguarde enquanto carrega os dados.</q-tooltip
              >
            </div>
          </q-banner>
        </div>
        <div
          class="q-pa-md q-gutter-sm"
          v-if="ticketsInMyTicketsLocal.next_page_url"
        >
          <q-banner
            inline-actions
            rounded
            class="bg-grey-2 text-grey text-center"
            @click="() => addTickets('ticketsInDoneLocal')"
          >
            Veja mais protocolos.
          </q-banner>
        </div>
      </q-list>
    </template>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import status from 'src/support/tickets/status';
import priority from 'src/support/tickets/priority';
import ticketsService from 'src/services/tickets';
import types from 'src/support/tickets/types';
import { betweenDates, dateFormat } from 'src/support/dates/dateFormat';
import _ from 'lodash';

export default defineComponent({
  emits: [
    'handleListClient',
    'addUserTicker',
    'updateTicketsOpen',
    'updateTicketsDevelop',
    'updateTicketsTests',
    'updateTicketsBacklog',
    'updateTicketsValidation',
    'updateTicketsPending',
    'updateTicketsDone',
    'updateTicketsMy',
  ],
  props: {
    ticketsOpenNoPriority: {
      type: Array,
      default: null,
    },
    ticketsOpenYesPriority: {
      type: Array,
      default: null,
    },
    ticketsInDevelop: {
      type: Array,
      default: null,
    },
    ticketsInTests: {
      type: Array,
      default: null,
    },
    ticketsInBacklog: {
      type: Array,
      default: null,
    },
    ticketsInValidation: {
      type: Array,
      default: null,
    },
    ticketsInPending: {
      type: Array,
      default: null,
    },
    ticketsInDone: {
      type: Array,
      default: null,
    },
    ticketsInMyTickets: {
      type: Array,
      default: null,
    },
  },
  setup(props) {
    const allowTickets = (roles) => {
      const statusRole = ['backlog', 'todo', 'analyze'];
      return _.includes(statusRole, roles);
    };
    const { myTickets } = ticketsService();

    const ticketsOpenYesPriorityLocal = ref(props.ticketsOpenYesPriority);
    const ticketsOpenNoPriorityLocal = ref(props.ticketsOpenNoPriority);
    const ticketsInDevelopLocal = ref(props.ticketsInDevelop);
    const ticketsInTestsLocal = ref(props.ticketsInTests);
    const ticketsInBacklogLocal = ref(props.ticketsInBacklog);
    const ticketsInValidationLocal = ref(props.ticketsInValidation);
    const ticketsInPendingLocal = ref(props.ticketsInPending);
    const ticketsInDoneLocal = ref(props.ticketsInDone);
    const ticketsInMyTicketsLocal = ref(props.ticketsInMyTickets);

    // ticketsOpenYesPriority
    watch(
      () => props.ticketsOpenYesPriority,
      (newVal) => {
        ticketsOpenYesPriorityLocal.value = newVal;
      }
    );
    // ticketsOpenNoPriority
    watch(
      () => props.ticketsOpenNoPriority,
      (newVal) => {
        ticketsOpenNoPriorityLocal.value = newVal;
      }
    );
    // ticketsInDevelop
    watch(
      () => props.ticketsInDevelop,
      (newVal) => {
        ticketsInDevelopLocal.value = newVal;
      }
    );
    // ticketsInTests
    watch(
      () => props.ticketsInTests,
      (newVal) => {
        ticketsInTestsLocal.value = newVal;
      }
    );
    // ticketsInBacklog
    watch(
      () => props.ticketsInBacklog,
      (newVal) => {
        ticketsInBacklogLocal.value = newVal;
      }
    );
    // ticketsInBacklog
    watch(
      () => props.ticketsInValidation,
      (newVal) => {
        ticketsInValidationLocal.value = newVal;
      }
    );
    // ticketsInBacklog
    watch(
      () => props.ticketsInPending,
      (newVal) => {
        ticketsInPendingLocal.value = newVal;
      }
    );
    // ticketsInBacklog
    watch(
      () => props.ticketsInDone,
      (newVal) => {
        ticketsInDoneLocal.value = newVal;
      }
    );
    // ticketsInMyTickets
    watch(
      () => props.ticketsInMyTickets,
      (newVal) => {
        ticketsInMyTicketsLocal.value = newVal;
      }
    );

    const addTickets = async (model) => {
      try {
        const url = eval(`${model}.value.next_page_url`);
        const queryString = _.split(url, '?')[1];
        const data = await myTickets(`?${queryString}`);

        eval(`${model}.value.data = [...${model}.value.data, ...data.data]`);
        eval(`${model}.value.next_page_url = data.next_page_url`);

        console.log(eval(model).value);
      } catch (error) {
        console.log(error);
      }
    };

    return {
      addTickets,
      ticketsOpenYesPriorityLocal,
      ticketsOpenNoPriorityLocal,
      ticketsInDevelopLocal,
      ticketsInTestsLocal,
      ticketsInBacklogLocal,
      ticketsInValidationLocal,
      ticketsInPendingLocal,
      ticketsInDoneLocal,
      ticketsInMyTicketsLocal,
      allowTickets,
      status,
      priority,
      types,
      betweenDates,
      dateFormat,
      tab: ref('ticketsOpen'),
    };
  },
});
</script>

<style lang="css" scoped>
@keyframes animate {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 0.7;
  }

  100% {
    opacity: 0;
  }
}

.piscar {
  animation: animate 1.5s linear infinite;
}
</style>
