<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Protocolos" :to="{ name: 'tickets.list' }" />
        <q-breadcrumbs-el label="Detalhes" />
      </q-breadcrumbs>
    </div>

    <div class="row items-start q-gutter-md">
      <q-card
        class="my-card col bg-blue-1"
        :class="{ 'bg-green-1': form?.dufy === 'yes' }"
      >
        <q-card-section :class="{ 'bg-green text-white': form?.dufy === 'yes' }"
          ><div class="row">
            <div class="col-md-8">
              Protocolo: #{{ form.code }} {{ form.subject }}
              <span v-if="form.dufy === 'yes'" class="text-weight-bolder"
                >&nbsp;(PLANTÃO)</span
              >&nbsp;
            </div>
            <div class="col-md-2 offset-md-2 text-right">
              <q-btn
                unelevated
                size="xs"
                round
                color="white"
                class="text-green"
                icon="rocket_launch"
                v-if="allowTickets(form?.status)"
                @click="
                  () => {
                    addUserTicker(form?.id);
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
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
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
                    <span v-else-if="form.priority === 'no'"
                      >RELEVÂNCIA BAIXA</span
                    >
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
                      :src="`https://cajueiroapi.cajutec.com.br/storage/images/${form.collaborator?.image?.uri}`"
                    />
                  </q-avatar>
                  {{ form.collaborator?.first_name }}
                </q-chip>
                <span v-else>{{ form.collaborator?.first_name }}</span>
                <span v-if="!form.collaborator">Sem colaborador</span>
              </p>
            </div>
            <div class="col">
              <span class="text-caption">Criador do Protocolo</span>
              <p class="text-subtitle2">
                <q-chip v-if="form.user?.collaborator?.image">
                  <q-avatar>
                    <img
                      :src="`https://cajueiroapi.cajutec.com.br/storage/images/${form.user?.collaborator?.image?.uri}`"
                    />
                  </q-avatar>
                  {{ form.user?.collaborator?.first_name }}
                </q-chip>
                <span v-else>{{ form.user?.collaborator?.first_name }}</span>
                <span v-if="!form.user?.collaborator">Sem colaborador</span>
              </p>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <span class="text-caption">Impacto do protocolo</span>
              <p class="q-mb-xs text-subtitle2">
                <q-badge rounded :style="`background:${form?.impact?.color}`">
                  <q-tooltip
                    :offset="[10, 10]"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    <span> {{ form.impact?.description ?? '[- - -]' }} </span>
                  </q-tooltip>
                </q-badge>
                &nbsp;<strong
                  >({{ form.impact?.description ?? '[- - -]' }})</strong
                >
              </p>
            </div>
            <div class="col">
              <span class="text-caption">Postado</span>
              <p class="text-subtitle2">
                {{ dateFormat(form.created_at ?? null) }}
                {{ dateTimeFormat(form.created_at) }}
              </p>
            </div>
            <div class="col">
              <span class="text-caption">Iníciado</span>
              <p class="text-subtitle2">
                {{ dateFormat(form.date_attribute_ticket ?? null) }}
                {{ dateTimeFormat(form.date_attribute_ticket) }}
              </p>
            </div>
            <div class="col">
              <span class="text-caption" v-if="form.status === 'done'">
                Finalizado
              </span>
              <span class="text-caption" v-else> Em atividade </span>
              <p class="text-subtitle2">
                <template v-if="form.status === 'done'">
                  {{ dateFormat(form.dateFinishTicket ?? null) }}
                  {{ dateTimeFormat(form.dateFinishTicket ?? null) }}
                </template>
                <template v-else-if="form.comments.length > 0">
                  {{
                    `à ${betweenDates(
                      form.created_at,
                      form.dateFinishTicket
                    )} dias`
                  }}
                </template>
                <template v-else> Sem histórico </template>
              </p>
            </div>
          </div>
          <div class="row q-my-md">
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
          <div class="row">
            <div class="col">
              <span class="text-caption">Assunto</span>
              <p>
                <strong>#{{ form.code }} {{ form.subject }}</strong>
              </p>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <span class="text-caption">Mensagem</span>
              <p v-html="form.message"></p>
            </div>
          </div>
          <span class="text-caption" v-if="form.images?.length > 0"
            >Arquivos</span
          >
          <div class="row" v-for="(image, i) in form.images" :key="i">
            <div class="col">
              <p>
                <a
                  :href="`https://cajueiroapi.cajutec.com.br/storage/images/${image?.uri}`"
                  target="_blank"
                >
                  {{ image.uri }}
                </a>
              </p>
            </div>
            <div class="col"></div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <div class="row items-start q-my-md">
      <q-card class="my-card col bg-grey-3">
        <q-card-section> <strong>Histórico</strong> (Kanban) </q-card-section>
        <q-separator />
        <q-card-section v-if="form.comments.length === 0"
          >Não existe comentários no momento</q-card-section
        >
        <q-card-section v-for="comment in form.comments" :key="comment.id">
          <div class="row">
            <div class="col">
              <p class="text-subtitle2">
                <q-badge
                  rounded
                  :color="`${status[comment.status ?? 'backlog'].color}`"
                >
                  <q-tooltip
                    :offset="[10, 10]"
                    anchor="top middle"
                    self="bottom middle"
                  >
                    <span>{{
                      `${status[comment.status ?? 'backlog'].title}`
                    }}</span>
                  </q-tooltip>
                </q-badge>
                {{ `${status[comment.status ?? 'backlog'].title}` }}
              </p>
            </div>
            <div class="col">
              <span class="text-caption">Atribuição</span>
              <p class="text-subtitle2">
                <q-chip v-if="comment.collaborator?.images">
                  <q-avatar>
                    <img
                      :src="`https://cajueiroapi.cajutec.com.br/storage/images/${comment.collaborator?.image?.uri}`"
                    />
                  </q-avatar>
                  {{ comment.collaborator?.full_name }}
                </q-chip>
                <span v-else>{{ comment.collaborator?.full_name }}</span>
              </p>
            </div>
            <div class="col">
              <span class="text-caption">Postado</span>
              <p class="text-subtitle2">
                {{ dateFormat(comment.created_at) }} -
                {{ dateTimeFormat(comment.created_at) }}
              </p>
            </div>
          </div>
          <p v-html="comment.description"></p>

          <span class="text-caption" v-if="comment.images?.length > 0"
            >Arquivos</span
          >
          <div class="row" v-for="(image, i) in comment.images" :key="i">
            <div class="col">
              <p>
                <a
                  :href="`https://cajueiroapi.cajutec.com.br/storage/images/${image?.uri}`"
                  target="_blank"
                >
                  {{ image.uri }}
                </a>
              </p>
            </div>
            <div class="col"></div>
          </div>
          <q-separator />
        </q-card-section>
      </q-card>
    </div>

    <div class="row items-start">
      <q-card class="my-card col bg-grey-1">
        <q-form enctype="multipart/form-data" @submit="onSubmit">
          <q-card-section> <strong>Comentário</strong> </q-card-section>
          <q-separator />
          <q-card-section>
            <h6 class="q-mt-xs q-mb-md">Como protocolo está no momento?</h6>
            <q-btn-toggle
              v-model="formResponse.status"
              push
              glossy
              :toggle-color="`${status[formResponse.status].color}`"
              :options="optionsStatus"
            />
            <h6 class="q-mt-lg q-mb-md">Comentário</h6>
            <div class="col-lg-12 col-xs-12 q-my-xs">
              <q-editor
                v-model="formResponse.description"
                :toolbar="[
                  [
                    {
                      label: $q.lang.editor.align,
                      icon: $q.iconSet.editor.align,
                      fixedLabel: true,
                      list: 'only-icons',
                      options: ['left', 'center', 'right', 'justify'],
                    },
                    {
                      label: $q.lang.editor.align,
                      icon: $q.iconSet.editor.align,
                      fixedLabel: true,
                      options: ['left', 'center', 'right', 'justify'],
                    },
                  ],
                  [
                    'bold',
                    'italic',
                    'strike',
                    'underline',
                    'subscript',
                    'superscript',
                  ],
                  ['token', 'hr', 'link', 'custom_btn'],
                  ['print', 'fullscreen'],
                  [
                    {
                      label: $q.lang.editor.formatting,
                      icon: $q.iconSet.editor.formatting,
                      list: 'no-icons',
                      options: [
                        'p',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'h5',
                        'h6',
                        'code',
                      ],
                    },
                    {
                      label: $q.lang.editor.fontSize,
                      icon: $q.iconSet.editor.fontSize,
                      fixedLabel: true,
                      fixedIcon: true,
                      list: 'no-icons',
                      options: [
                        'size-1',
                        'size-2',
                        'size-3',
                        'size-4',
                        'size-5',
                        'size-6',
                        'size-7',
                      ],
                    },
                    {
                      label: $q.lang.editor.defaultFont,
                      icon: $q.iconSet.editor.font,
                      fixedIcon: true,
                      list: 'no-icons',
                      options: [
                        'default_font',
                        'arial',
                        'arial_black',
                        'comic_sans',
                        'courier_new',
                        'impact',
                        'lucida_grande',
                        'times_new_roman',
                        'verdana',
                      ],
                    },
                    'removeFormat',
                  ],
                  ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

                  ['undo', 'redo'],
                  ['viewsource'],
                ]"
                :fonts="{
                  arial: 'Arial',
                  arial_black: 'Arial Black',
                  comic_sans: 'Comic Sans MS',
                  courier_new: 'Courier New',
                  impact: 'Impact',
                  lucida_grande: 'Lucida Grande',
                  times_new_roman: 'Times New Roman',
                  verdana: 'Verdana',
                }"
                min-height="15rem"
              />
            </div>
            <div class="col-12 q-gutter-sm q-my-lg">
              <q-file
                filled
                multiple
                clearable
                @update:model-value="onChange($event)"
                v-model="formResponse.imageInput"
                label="Documento"
                class="col-lg-6 col-xs-12"
              >
                <template #prepend>
                  <q-icon name="file_upload" />
                </template>
              </q-file>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn flat type="submit">Enviar resposta</q-btn>
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>
<script>
import { defineComponent, ref, onMounted } from 'vue';
import priority from 'src/support/tickets/priority';
import status from 'src/support/tickets/status';
import {
  dateFormat,
  dateTimeFormat,
  betweenDates,
} from 'src/support/dates/dateFormat';
import ticketsService from 'src/services/tickets';
import commentsService from 'src/services/comments';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';

export default defineComponent({
  name: 'DetailsView',
  setup() {
    const { getById, addUserPatchTicket } = ticketsService();
    const { post } = commentsService();
    const $q = useQuasar();
    const route = useRoute();
    const comments = ref([{}]);
    const form = ref({
      client_id: ref(''),
      collaborator_id: ref(''),
      impact_id: ref(''),
      priority: ref('no'),
      subject: ref(''),
      message: ref(''),
      status: ref('backlog'),
      image: ref(''),
      imageInput: ref([]),
      comments: ref([{}]),
    });
    const optionsStatus = ref([
      { value: 'backlog', label: 'Aguardando' },
      { value: 'todo', label: 'a fazer' },
      { value: 'analyze', label: 'analise' },
      { value: 'development', label: 'desenvolvimento' },
      { value: 'test', label: 'teste' },
      { value: 'pending', label: 'pendente' },
      { value: 'done', label: 'finalizado' },
      { value: 'validation', label: 'validação' },
    ]);
    const formResponse = ref({
      ticket_id: ref(route.params.id ?? null),
      collaborator_id: ref(''),
      status: ref('backlog'),
      description: ref(''),
      image: ref([]),
      imageInput: ref([]),
    });

    const allowTickets = (roles) => {
      const statusRole = ['backlog', 'todo', 'analyze'];
      return _.includes(statusRole, roles);
    };

    onMounted(async () => {
      if (route.params.id) {
        getTicket(route.params.id);
      }
    });

    const onChange = (event) => {
      createBase64Image(event);
    };

    // const router = useRouter();

    const handleListClient = async (id) => {
      if (route.params.id) {
        getTicket(route.params.id);
      }
    };

    const addUserTicker = async (id) => {
      try {
        $q.dialog({
          title: 'Quero assumir esse protocolo',
          message: 'Desejo esse protocolo, blz?',
          cancel: true,
          persistent: true,
        }).onOk(async () => {
          $q.notify({
            message: 'Esse protocolo agora é meu, ninguém me toma!',
            icon: 'check',
            color: 'positive',
          });

          await addUserPatchTicket({
            id,
          })
            .then(() => {
              handleListClient(id);
            })
            .catch((error) => {
              $q.notify({
                message: error.message,
                caption:
                  'Tente primeiramente resolver os protocolos que estão abertos/pendetes por seu usuário.',
                icon: 'block',
                color: 'negative',
              });
            });
        });
      } catch (error) {
        $q.notify({
          message: 'Ops! Não foi possível associar você a este protocolo.',
          icon: 'block',
          color: 'negative',
        });
      }
    };

    const createBase64Image = (fileObject) => {
      for (let i = 0; i < fileObject.length; i++) {
        const reader = new FileReader();
        formResponse.value.imageInput = fileObject[i].name;

        reader.onloadend = () => {
          formResponse.value.image[i] = reader.result;
        };

        reader.readAsDataURL(fileObject[i]);
      }
    };

    const onSubmit = async () => {
      try {
        await post(formResponse.value);
        formResponse.value.description = null;
        formResponse.value.imageInput = null;
        await getTicket(route.params.id);
        $q.notify({
          message: 'Dados salvos com sucesso',
          icon: 'check',
          color: 'positive',
        });
      } catch (error) {
        $q.notify({
          icon: 'block',
          message: 'Ops! Ocorreu um erro ao salvar commentários.',
          caption: error.message,
          color: 'negative',
        });
      }
    };

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
      addUserTicker,
      allowTickets,
      dateFormat,
      dateTimeFormat,
      comments,
      onSubmit,
      onChange,
      formResponse,
      optionsStatus,
      betweenDates,
      priority,
      status,
      form,
    };
  },
});
</script>

<style>
.my-card {
  width: 100%;
  max-width: 250px;
}
</style>
