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
        @click="() => refreshTab('updateTicketsOpen')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInDevelopLocal?.data?.length ? true : false"
        name="ticketsDevelop"
        icon="mdi-ticket-account"
        label="Desenvolvimento"
        @click="() => refreshTab('updateTicketsDevelop')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInTestsLocal?.data?.length ? true : false"
        name="ticketsTests"
        icon="fa fa-bugs"
        label="Teste"
        @click="() => refreshTab('updateTicketsTests')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInBacklogLocal?.data?.length ? true : false"
        name="ticketsBacklog"
        icon="fa fa-cubes"
        label="Aguardando"
        @click="() => refreshTab('updateTicketsBacklog')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInValidationLocal?.data?.length ? true : false"
        name="ticketsValidation"
        icon="fa fa-fire-extinguisher"
        label="Validação"
        @click="() => refreshTab('updateTicketsValidation')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInPendingLocal?.data?.length ? true : false"
        name="ticketsPending"
        icon="fa fa-hourglass"
        label="Pendentes"
        @click="() => refreshTab('updateTicketsPending')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInDoneLocal?.data?.length ? true : false"
        name="ticketsDone"
        icon="mdi-check"
        label="Finalizados"
        @click="() => refreshTab('updateTicketsDone')"
      >
      </q-tab>
      <q-tab
        :alert="ticketsInMyTicketsLocal?.data?.length ? true : false"
        name="myTickets"
        icon="mdi-ticket"
        label="Meus protocolos"
        @click="() => refreshTab('updateTicketsMy')"
      >
      </q-tab>
    </q-tabs>
    <q-linear-progress v-if="refreshing" indeterminate color="primary" />

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
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>

                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
        <load-more-tickets
          v-if="ticketsOpenYesPriorityLocal.next_page_url"
          :loaded="ticketsOpenYesPriorityLocal.data?.length ?? 0"
          :total="ticketsOpenYesPriorityLocal.total ?? 0"
          :loading="loadingMore === 'ticketsOpenYesPriorityLocal'"
          @more="addTickets('ticketsOpenYesPriorityLocal')"
        />

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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
        <load-more-tickets
          v-if="ticketsOpenNoPriorityLocal.next_page_url"
          :loaded="ticketsOpenNoPriorityLocal.data?.length ?? 0"
          :total="ticketsOpenNoPriorityLocal.total ?? 0"
          :loading="loadingMore === 'ticketsOpenNoPriorityLocal'"
          @more="addTickets('ticketsOpenNoPriorityLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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
        <load-more-tickets
          v-if="ticketsInDevelopLocal.next_page_url"
          :loaded="ticketsInDevelopLocal.data?.length ?? 0"
          :total="ticketsInDevelopLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInDevelopLocal'"
          @more="addTickets('ticketsInDevelopLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <q-badge
                    v-if="ticket?.testing === true"
                    color="purple"
                    label="TESTANDO"
                    class="q-mr-md"
                    style="font-size: 10px; padding: 4px 8px;"
                  />                                
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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

        <load-more-tickets
          v-if="ticketsInTestsLocal.next_page_url"
          :loaded="ticketsInTestsLocal.data?.length ?? 0"
          :total="ticketsInTestsLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInTestsLocal'"
          @more="addTickets('ticketsInTestsLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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
        <load-more-tickets
          v-if="ticketsInBacklogLocal.next_page_url"
          :loaded="ticketsInBacklogLocal.data?.length ?? 0"
          :total="ticketsInBacklogLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInBacklogLocal'"
          @more="addTickets('ticketsInBacklogLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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
        <load-more-tickets
          v-if="ticketsInValidationLocal.next_page_url"
          :loaded="ticketsInValidationLocal.data?.length ?? 0"
          :total="ticketsInValidationLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInValidationLocal'"
          @more="addTickets('ticketsInValidationLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
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
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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
        <load-more-tickets
          v-if="ticketsInPendingLocal.next_page_url"
          :loaded="ticketsInPendingLocal.data?.length ?? 0"
          :total="ticketsInPendingLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInPendingLocal'"
          @more="addTickets('ticketsInPendingLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Finalizado em: {{ dateFormat(ticket?.updated_at) }}
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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
        <load-more-tickets
          v-if="ticketsInDoneLocal.next_page_url"
          :loaded="ticketsInDoneLocal.data?.length ?? 0"
          :total="ticketsInDoneLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInDoneLocal'"
          @more="addTickets('ticketsInDoneLocal')"
        />
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
                  {{ ticket?.subject }}
                  <q-badge
                    v-if="ticket?.platform"
                    rounded
                    :style="`background:${platform[ticket.platform]?.hex}`"
                    class="q-ml-sm"
                  >
                    {{ platform[ticket.platform]?.title }}
                  </q-badge>
                </q-item-label>
                <q-item-label caption lines="1">
                  <q-badge
                    rounded
                    :style="`background:${types[ticket?.type]?.hex}`"
                  >
                  </q-badge>
                  {{ types[ticket?.type]?.title }}
                  <q-badge
                    rounded
                    :style="`background:${ticket?.impact?.color}`"
                  >
                  </q-badge>
                  {{ ticket?.impact?.description }}
                  | Finalizado em: {{ dateFormat(ticket?.updated_at) }}
                  <q-badge
                    v-if="ticket?.validated === 'yes'"
                    color="green"
                    text-color="white"
                    label="VALIDAR"
                    class="q-ml-sm"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section top side>
                <div class="text-grey-8 q-gutter-xs">
                  <template v-if="ticket?.collaborator">
                    <q-chip size="sm">
                      <CollaboratorAvatar
                        v-if="ticket?.collaborator"
                        size="32px"
                        :collaborator="ticket.collaborator"
                      />
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
        <load-more-tickets
          v-if="ticketsInMyTicketsLocal.next_page_url"
          :loaded="ticketsInMyTicketsLocal.data?.length ?? 0"
          :total="ticketsInMyTicketsLocal.total ?? 0"
          :loading="loadingMore === 'ticketsInMyTicketsLocal'"
          @more="addTickets('ticketsInMyTicketsLocal')"
        />
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
import platform from 'src/support/tickets/platform';
import { betweenDates, dateFormat } from 'src/support/dates/dateFormat';
import CollaboratorAvatar from 'src/components/avatar/CollaboratorAvatar.vue';
import LoadMoreTickets from 'src/components/tickets/LoadMoreTickets.vue';
import _ from 'lodash';
import { rememberListTab, savedListTab } from 'src/support/tickets/listTab';

export default defineComponent({
  name: 'TicketsOpen',
  components: { CollaboratorAvatar, LoadMoreTickets },
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
      type: Object,
      default: null,
    },
    ticketsOpenYesPriority: {
      type: Object,
      default: null,
    },
    ticketsInDevelop: {
      type: Object,
      default: null,
    },
    ticketsInTests: {
      type: Object,
      default: null,
    },
    ticketsInBacklog: {
      type: Object,
      default: null,
    },
    ticketsInValidation: {
      type: Object,
      default: null,
    },
    ticketsInPending: {
      type: Object,
      default: null,
    },
    ticketsInDone: {
      type: Object,
      default: null,
    },
    ticketsInMyTickets: {
      type: Object,
      default: null,
    },
  },
  setup(props, { emit }) {
    const allowTickets = (roles) => {
      const statusRole = ['backlog', 'todo', 'analyze'];
      return _.includes(statusRole, roles);
    };
    const { myTickets } = ticketsService();

    const validTabs = [
      'ticketsOpen',
      'ticketsDevelop',
      'ticketsTests',
      'ticketsBacklog',
      'ticketsValidation',
      'ticketsPending',
      'ticketsDone',
      'myTickets',
    ];
    const targetTab = savedListTab(validTabs);
    const tab = ref('ticketsOpen');
    watch(tab, (value, old) => {
      if (!restored && value !== targetTab && old === 'ticketsOpen') {
        userPickedTab = true;
      }
      rememberListTab(value);
    });

    const ticketsOpenYesPriorityLocal = ref(props.ticketsOpenYesPriority);
    const ticketsOpenNoPriorityLocal = ref(props.ticketsOpenNoPriority);
    const ticketsInDevelopLocal = ref(props.ticketsInDevelop);
    const ticketsInTestsLocal = ref(props.ticketsInTests);
    const ticketsInBacklogLocal = ref(props.ticketsInBacklog);
    const ticketsInValidationLocal = ref(props.ticketsInValidation);
    const ticketsInPendingLocal = ref(props.ticketsInPending);
    const ticketsInDoneLocal = ref(props.ticketsInDone);
    const ticketsInMyTicketsLocal = ref(props.ticketsInMyTickets);

    // Ao voltar de um protocolo a aba salva é restaurada assim que a lista dessa aba
    // chega. As demais listas são aplicadas em lote (debounce) enquanto isso: cada
    // resposta isolada re-renderizava a aba pesada e travava a tela.
    let restored = targetTab === 'ticketsOpen';
    let userPickedTab = false;
    const listMap = [
      ['ticketsOpenYesPriority', ticketsOpenYesPriorityLocal, 'ticketsOpen'],
      ['ticketsOpenNoPriority', ticketsOpenNoPriorityLocal, 'ticketsOpen'],
      ['ticketsInDevelop', ticketsInDevelopLocal, 'ticketsDevelop'],
      ['ticketsInTests', ticketsInTestsLocal, 'ticketsTests'],
      ['ticketsInBacklog', ticketsInBacklogLocal, 'ticketsBacklog'],
      ['ticketsInValidation', ticketsInValidationLocal, 'ticketsValidation'],
      ['ticketsInPending', ticketsInPendingLocal, 'ticketsPending'],
      ['ticketsInDone', ticketsInDoneLocal, 'ticketsDone'],
      ['ticketsInMyTickets', ticketsInMyTicketsLocal, 'myTickets'],
    ];
    const applyAll = () => {
      listMap.forEach(([prop, local]) => {
        local.value = props[prop];
      });
    };
    const applyAllDebounced = _.debounce(applyAll, 400);
    let restoreTimer = null;
    const restoreTab = () => {
      if (restored) return;
      restored = true;
      clearTimeout(restoreTimer);
      if (!userPickedTab) tab.value = targetTab;
      applyAllDebounced();
    };
    if (!restored) restoreTimer = setTimeout(restoreTab, 10000);

    listMap.forEach(([prop, local, listTab]) => {
      watch(
        () => props[prop],
        (newVal) => {
          if (restored || listTab === targetTab) {
            local.value = newVal;
            if (!restored && newVal?.data) restoreTab();
          } else {
            applyAllDebounced();
          }
        }
      );
    });

    const localLists = {
      ticketsOpenYesPriorityLocal,
      ticketsOpenNoPriorityLocal,
      ticketsInDevelopLocal,
      ticketsInTestsLocal,
      ticketsInBacklogLocal,
      ticketsInValidationLocal,
      ticketsInPendingLocal,
      ticketsInDoneLocal,
      ticketsInMyTicketsLocal,
    };

    const loadingMore = ref(null);
    const addTickets = async (model) => {
      if (loadingMore.value) return;
      loadingMore.value = model;
      try {
        const list = localLists[model];
        const queryString = _.split(list.value.next_page_url, '?')[1];
        const data = await myTickets(`?${queryString}`);

        list.value = {
          ...list.value,
          data: [...list.value.data, ...data.data],
          next_page_url: data.next_page_url,
        };
      } catch (error) {
        console.log(error);
      } finally {
        loadingMore.value = null;
      }
    };

    // indicador de carregamento enquanto a lista da aba é atualizada
    const refreshing = ref(false);
    let refreshTimer = null;
    const stopRefreshing = () => {
      refreshing.value = false;
      clearTimeout(refreshTimer);
    };
    const refreshTab = (eventName) => {
      refreshing.value = true;
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(stopRefreshing, 15000);
      emit(eventName, true);
    };
    watch(
      () => [
        props.ticketsOpenYesPriority,
        props.ticketsOpenNoPriority,
        props.ticketsInDevelop,
        props.ticketsInTests,
        props.ticketsInBacklog,
        props.ticketsInValidation,
        props.ticketsInPending,
        props.ticketsInDone,
        props.ticketsInMyTickets,
      ],
      stopRefreshing
    );

    return {
      refreshing,
      refreshTab,
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
      loadingMore,
      status,
      priority,
      types,
      platform,
      betweenDates,
      dateFormat,
      tab,
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
