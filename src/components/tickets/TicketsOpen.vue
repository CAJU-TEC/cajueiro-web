<template>
  <div class="q-py-md">
    <q-tabs v-model="tab" class="bg-yellow">
      <q-tab
        :alert="
          ticketsOpenYesPriority.length + ticketsOpenNoPriority.length
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
        :alert="ticketsInDevelop.length ? true : false"
        name="ticketsDevelop"
        icon="mdi-ticket-account"
        label="Desenvolvimento"
        @click="() => $emit('updateTicketsDevelop', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInTests.length ? true : false"
        name="ticketsTests"
        icon="fa fa-bugs"
        label="Teste"
        @click="() => $emit('updateTicketsTests', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInPending?.length ? true : false"
        name="ticketsPending"
        icon="fa fa-hourglass"
        label="Pendentes"
        @click="() => $emit('updateTicketsPending', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInDone?.length ? true : false"
        name="ticketsDone"
        icon="mdi-check"
        label="Finalizados"
        @click="() => $emit('updateTicketsDone', true)"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInMyTickets?.length ? true : false"
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
        <template v-if="ticketsOpenYesPriority.length > 0">
          <q-item-label header>PRIORIDADES</q-item-label>
          <template v-for="ticket in ticketsOpenYesPriority" :key="ticket?.id">
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
                >
                  <span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}
                </q-item-label>
                <q-item-label caption lines="1">
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
          </template>
        </template>
        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>

        <q-item-label header>OUTROS</q-item-label>
        <template v-if="ticketsOpenNoPriority.length > 0">
          <div v-for="ticket in ticketsOpenNoPriority" :key="ticket?.id">
            <q-item class="q-my-sm" v-ripple>
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
                  ><span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
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
            <q-separator spaced />
          </div>
        </template>

        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsDevelop'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos em desenvolvimento</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInDevelop.length > 0">
          <div v-for="ticket in ticketsInDevelop" :key="ticket?.id">
            <q-item class="q-my-sm" v-ripple>
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
                  ><span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
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
            <q-separator spaced />
          </div>
        </template>
        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsTests'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos em fase de testes</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInTests.length > 0">
          <div v-for="ticket in ticketsInTests" :key="ticket?.id">
            <q-item class="q-my-sm" v-ripple>
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
                  ><span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
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
            <q-separator spaced />
          </div>
        </template>
        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsPending'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos com pendências</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInPending.length > 0">
          <div v-for="ticket in ticketsInPending" :key="ticket?.id">
            <q-item class="q-my-sm" v-ripple>
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
                  ><span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
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
                  <q-btn
                    unelevated
                    size="xs"
                    round
                    color="primary"
                    icon="rocket_launch"
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
            <q-separator spaced />
          </div>
        </template>
        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'ticketsDone'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Protocolos finalizados</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInDone.length > 0">
          <div v-for="ticket in ticketsInDone" :key="ticket?.id">
            <q-item class="q-my-sm" v-ripple>
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
                  ><span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
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
            <q-separator spaced />
          </div>
        </template>
        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>
      </q-list>
    </template>

    <template v-if="tab === 'myTickets'">
      <q-toolbar class="bg-primary text-white shadow-2">
        <q-toolbar-title>Meus Protocolos</q-toolbar-title>
      </q-toolbar>
      <q-list bordered>
        <template v-if="ticketsInMyTickets.length > 0">
          <div v-for="ticket in ticketsInMyTickets" :key="ticket?.id">
            <q-item class="q-my-sm" v-ripple>
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
                  ><span class="text-weight-bold">#{{ ticket?.code }}</span>
                  {{ ticket?.subject }}</q-item-label
                >
                <q-item-label caption lines="1">
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
            <q-separator spaced />
          </div>
        </template>
        <div v-else class="q-pa-md q-gutter-sm">
          <q-banner inline-actions rounded class="bg-orange text-white">
            Não existem protocolos com esse status no momento.
          </q-banner>
        </div>
      </q-list>
    </template>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import status from 'src/support/tickets/status';
import priority from 'src/support/tickets/priority';
import { betweenDates, dateFormat } from 'src/support/dates/dateFormat';

const tab = ref('ticketsOpen');

export default defineComponent({
  emits: [
    'addUserTicker',
    'updateTicketsOpen',
    'updateTicketsDevelop',
    'updateTicketsTests',
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
  setup() {
    return {
      status,
      priority,
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
