<template>
  <q-page class="protocol-page">
    <div class="protocol-container">
      <div class="protocol-breadcrumbs">
        <q-breadcrumbs>
          <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
          <q-breadcrumbs-el label="Protocolos" :to="{ name: 'tickets.list' }" />
          <q-breadcrumbs-el label="Adicionar" />
        </q-breadcrumbs>
      </div>
      <h3 class="protocol-title">Adicionar Protocolo</h3>

      <q-form
        enctype="multipart/form-data"
        class="protocol-form"
        @submit="onSubmit"
      >
      <div class="protocol-col">
      <div class="protocol-grid protocol-grid-two">
      <section class="protocol-card">
      <div class="protocol-toggle-content">
      <div>
        <div class="protocol-card-title">Este protocolo é um Plantão?</div>
        <div class="protocol-card-subtitle">
          Ative se for chamado fora do horário
        </div>
      </div>

      <q-toggle
        v-model="form.dufy"
        true-value="yes"
        false-value="no"
        color="positive"
      />
    </div>
  </section>

      <section class="protocol-card">
        <div class="protocol-toggle-content">
          <div>
            <div class="protocol-card-title">Prioridade alta</div>
            <div class="protocol-card-subtitle">
              Demanda urgente de atenção
            </div>
          </div>

          <q-toggle
            v-model="form.priority"
            true-value="yes"
            false-value="no"
            color="positive"
          />
        </div>
      </section>
    </div>
        <section class="protocol-card">
          <div class="protocol-card-header">
            <div class="protocol-icon">
              <q-icon name="layers" />
            </div>
            <div>
              <div class="protocol-card-title">Plataforma</div>
              <div class="protocol-card-subtitle">
                Em que plataforma este protocolo será implementado?
              </div>
            </div>
          </div>
          <q-btn-toggle
            v-model="form.platform"
            class="protocol-segmented plataform-segmented"
            push
            :toggle-color="`${platform[form.platform].color}`"
            :options="[
              { label: 'WEB', value: 'web' },
              { label: 'MOBILE', value: 'mobile' },
              { label: 'NOTIFIQ', value: 'notifiq' },
              { label: 'WEB E MOBILE', value: 'web_mobile' },
            ]"
          />
        </section>
        <div class="protocol-grid protocol-grid-two">
            <section class="protocol-card">
              <div class="protocol-card-header">
                  <div class="protocol-icon">
                    <q-icon name="verified_user" />
                  </div>
              <div>
                <div class="protocol-card-title">Validação</div>
                  <div class="protocol-card-subtitle">
                    Este protocolo deve ser validado?
                  </div>
              </div>
            </div>

            <q-btn-toggle
            v-model="form.validated"
            class="protocol-segmented"
            :options="validationOptions"
            :toggle-color="form.validated === 'yes' ? 'negative' : 'primary'"
            />
            </section>

            <section class ="protocol-card">
              <div class="protocol-card-header">
                <div class="protocol-icon">
                  <q-icon name ="label"/>
                  </div>
                
                  <div>
                    <div class="protocol-card-title">Tipo</div>
                    <div class="protocol-card-subtitle">
                      Qual o tipo deste protocolo?
                    </div>
                  </div>
              </div>

              <q-btn-toggle
                v-model="form.type"
                class="protocol-segmented"
                :options="typeOptions"
                :toggle-color="form.type === 'implementation' ? 'purple' : form.type === 'maintenance' ? 'negative' : 'primary'"
              />
            </section>
          </div>

        <section class="protocol-card">
          <div class="protocol-card-header">
            <div class="protocol-icon">
              <q-icon name="route" />
            </div>
            <div>
              <div class="protocol-card-title">Status do Protocolo</div>
              <div class="protocol-card-subtitle">
                Como o protocolo está no momento?
              </div>
            </div>
          </div>
          <div class="status-track">
            <template v-for="(opt, i) in optionsStatus" :key="opt.value">
              <button
                type="button"
                class="status-step"
                :class="{ active: form.status === opt.value }"
                :style="
                  form.status === opt.value
                    ? {
                        '--status-color':
                          opt.value === 'done'
                            ? '#607d8b'
                            : opt.value === 'backlog'
                              ? '#4caf50'
                              : status[opt.value]?.hex,
                      }
                    : {}
                "
                @click="form.status = opt.value"
              >
                <span class="step-dot"></span>
                <q-icon :name="statusIcons[opt.value]" class="step-icon" />
                <span class="step-label">{{ opt.label }}</span>
              </button>
              <q-icon
                v-if="i < optionsStatus.length - 1"
                name="chevron_right"
                class="step-arrow"
              />
            </template>
          </div>
        </section>
      </div>

      <div class="protocol-col protocol-col-right">
      <section class="protocol-card">
        <div class="protocol-card-header">
          <div class="protocol-icon">
            <q-icon name="bar_chart" />
          </div>
          <div>
            <div class="protocol-card-title">Impacto do Protocolo</div>
            <div class="protocol-card-subtitle">
              Selecione o nível de complexidade estimado
            </div>
          </div>
        </div>
        <div class="impact-list">
          <div
            v-for="option in optionsImpacts"
            :key="option.value"
            class="impact-option"
            :class="{ active: form.impact_id === option.value }"
          >
            <div class="impact-header">
              <q-radio
                v-model="form.impact_id"
                :val="option.value"
                :color="option.color"
                dense
              />
              <div class="impact-title">
                {{ option.label }}
              </div>
              <button
                type="button"
                class="impact-arrow-btn"
                :class="{ open: expandedImpacts[option.value] }"
                @click.stop="toggleExpand(option.value)"
              >
                <q-icon name="keyboard_arrow_down" />
              </button>
            </div>
            <div
              class="impact-details"
              :ref="(el) => setDetailsRef(option.value, el)"
            >
              <div class="impact-details-inner">
                <div class="impact-classification">
                  <span class="impact-badge" :style="{ color: option.color }">
                    {{ option.description }}
                  </span>
                </div>
                <div class="impact-example">
                  <strong>Exemplo:</strong> {{ option.example }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>

      <div class="protocol-col protocol-col-third">
        <section class="protocol-card">
          <q-select
            outlined
            label="Cliente *"
          v-model="form.client_id"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :options="optionsClient"
          @filter="filterFn"
          emit-value
          map-options
        >
          <template #no-option>
            <q-item>
              <q-item-section class="text-grey">
                Sem resultados
              </q-item-section>
            </q-item>
          </template>

          <template #after>
            <q-btn
              round
              dense
              flat
              icon="add"
              @click="dialogAddClient = !dialogAddClient"
            />
          </template>
        </q-select>
      </section>
      <section class="protocol-card">
        <q-file
          outlined
          clearable
          multiple
          @update:model-value="onChange($event)"
          v-model="form.imageName"
          label="Anexos"
          :accept="'.pdf,.docx,.png,.jpg,.jpeg'"
        >
          <template #prepend>
            <q-icon name="cloud_upload" color="primary" />
          </template>
        </q-file>
      </section>

      <section class="protocol-card">
        <q-input
          v-model="form.subject"
          outlined
          label="Título *"
          placeholder="Digite um título claro e objetivo para o protocolo"
        />
      </section>

      <section class="protocol-card">
        <q-editor
          v-model="form.message"
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
                options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
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
                  'jetbrains_mono',
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
            jetbrains_mono: 'JetBrains Mono',
            impact: 'Impact',
            lucida_grande: 'Lucida Grande',
            times_new_roman: 'Times New Roman',
            verdana: 'Verdana',
          }"
          min-height="10rem"
        />
      </section>

      <div class="protocol-actions">
        <q-btn
          class="btn btn-secondary"
          label="Cancelar"
          icon="close"
          :to="{ name: 'tickets.list' }"
        />
        <q-btn
          class="btn btn-primary"
          label="Salvar Protocolo"
          icon="check"
          type="submit"
        />
      </div>
      </div>
    </q-form>
    <AddClient
      :dialog="dialogAddClient"
      @ticket="(e) => getClientSelect"
    ></AddClient>
  </div>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import ticketsService from 'src/services/tickets';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import clientsService from 'src/services/clients';
import AddClient from 'src/components/dialogs/clients/AddClient.vue';
import impactsService from 'src/services/impacts';
import status from 'src/support/tickets/status';
import types from 'src/support/tickets/types';
import priority from 'src/support/tickets/priority';
import platform from 'src/support/tickets/platform';

export default defineComponent({
  name: 'FormClient',
  setup() {
    const { post, getById, update } = ticketsService();
    const { list } = clientsService();
    const { list: impactsList } = impactsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const dialogAddClient = ref(false);
    const optionsClient = ref([]);
    const stringOptionsClient = ref([]);
    const optionsImpacts = ref();
    const expandedImpacts = ref({});
    const detailsEls = ref({});
    const optionsStatus = ref([
      { value: 'backlog', label: 'Aguardando' },
      { value: 'todo', label: 'A Fazer' },
      { value: 'analyze', label: 'Análise' },
      { value: 'development', label: 'Desenvolvimento' },
      { value: 'test', label: 'Teste' },
      { value: 'pending', label: 'Pendente' },
      { value: 'done', label: 'Finalizado' },
      { value: 'validation', label: 'Validação' },
    ]);
    const validationOptions = ref([
      { label: 'Validar', value: 'yes' },
      { label: 'Não validar', value: 'no' },
    ]);
    const typeOptions = ref([
      { label: 'Implementação', value: 'implementation' },
      { label: 'Manutenção', value: 'maintenance' },
    ]);
    const statusIcons = {
      backlog: 'hourglass_top',
      todo: 'checklist',
      analyze: 'search',
      development: 'code',
      test: 'science',
      pending: 'schedule',
      done: 'check_circle',
      validation: 'verified',
    };

    const form = ref({
      client_id: ref(''),
      collaborator_id: ref(''),
      impact_id: ref(''),
      priority: ref('no'),
      type: ref('maintenance'),
      dufy: ref('no'),
      platform: ref('web'),
      validated: ref('no'),
      subject: ref(''),
      message: ref(''),
      status: ref('backlog'),
      image: ref([]),
      imageName: ref([]),
    });

    onMounted(async () => {
      if (route.params.id) {
        getClient(route.params.id);
      }
      getClientSelect();
      getImpactSelect();
    });

    const getClient = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
        form.value.email = response.email?.description;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const getImpactSelect = async () => {
      try {
        const response = await impactsList();
        optionsImpacts.value = response.map((m) => {
          return {
            value: m.id,
            label: `${m.description}`,
            description: `${m.classification}`,
            example: `${m.example}`,
            color: `${m.color}`,
          };
        });
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro. Os impactos não foram carregados.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const getClientSelect = async () => {
      try {
        const response = await list();
        optionsClient.value = response.map((m) => {
          return {
            value: m.id,
            label: `${m.full_name} (${m.email?.description})`,
          };
        });
        stringOptionsClient.value = optionsClient.value;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const setDetailsRef = (value, el) => {
      if (el) detailsEls.value[value] = el;
    };

    const toggleExpand = (value) => {
      const el = detailsEls.value[value];
      if (!el) return;
      const isOpen = expandedImpacts.value[value];
      if (isOpen) {
        el.style.height = el.scrollHeight + 'px';
        void el.offsetHeight;
        el.style.height = '0px';
        expandedImpacts.value[value] = false;
      } else {
        el.style.height = '0px';
        void el.offsetHeight;
        el.style.height = el.scrollHeight + 'px';
        expandedImpacts.value[value] = true;
      }
    };

    const filterFn = (val, update, abort) => {
      update(() => {
        const needle = val.toLowerCase();
        optionsClient.value = stringOptionsClient.value.filter(
          (v) => v.label.toLowerCase().indexOf(needle) > -1
        );
      });
    };

    const onChange = (event) => {
      createBase64Image(event);
    };

    const createBase64Image = (fileObject) => {
      for (let i = 0; i < fileObject.length; i++) {
        const reader = new FileReader();
        form.value.imageName = fileObject[i].name;

        reader.onloadend = () => {
          form.value.image[i] = reader.result;
        };

        reader.readAsDataURL(fileObject[i]);
      }
    };

    const onSubmit = async () => {
      try {
        if (form.value.id) {
          await update(form.value);
        } else {
          await post(form.value);
        }

        $q.notify({
          message: 'Dados salvos com sucesso',
          icon: 'check',
          color: 'positive',
        });
        router.push({ name: 'tickets.list' });
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
      status,
      priority,
      platform,
      types,
      dialogAddClient,
      optionsClient,
      optionsImpacts,
      expandedImpacts,
      optionsStatus,
      validationOptions,
      typeOptions,
      statusIcons,
      stringOptionsClient,
      filterFn,
      setDetailsRef,
      toggleExpand,
      onSubmit,
      onChange,
    };
  },
  components: { AddClient },
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.protocol-page {
  background: #f5f5f7;
  color: #1d1d1f;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.protocol-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px 24px 40px;
}

.protocol-breadcrumbs {
  padding-bottom: 4px;
  color: #86868b;
  font-size: 12px;
  font-weight: 500;
}

.protocol-breadcrumbs :deep(a) {
  color: #0071e3;
  text-decoration: none;
}

.protocol-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.3px;
  margin: 4px 0 12px;
  color: #1d1d1f;
}

.protocol-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}

.protocol-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.protocol-col-right .protocol-card:last-child {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.protocol-col-third {
  display: flex;
  flex-direction: column;
  grid-column: 1 / -1;
  min-width: 0;
}

.protocol-col-third .protocol-card:last-of-type {
  display: flex;
  flex-direction: column;
}

.protocol-col-third .protocol-card:last-of-type :deep(.q-editor) {
  min-height: 24rem;
}

.protocol-col-third .protocol-actions {
  margin-top: auto;
}

.protocol-card {
  background: #ffffff;
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  padding: 12px 14px;
  margin-bottom: 0;
}

.protocol-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.protocol-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 113, 227, 0.08);
  border-radius: 6px;
}

.protocol-icon .q-icon {
  font-size: 12px;
  color: #0071e3;
}

.protocol-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.protocol-card-subtitle {
  font-size: 11px;
  color: #6e6e73;
  margin-top: 1px;
}

.protocol-grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.protocol-toggle-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.protocol-toggle-content :deep(.q-toggle) {
  font-size: 12px;
}

.protocol-toggle-content .protocol-card-subtitle {
  margin-top: 2px;
}

.protocol-segmented {
  width: fit-content;
  margin: 0 auto;
  display: block;
}

.protocol-segmented :deep(.q-btn-group) {
  width: 100%;
  background: #f2f2f7;
  border-radius: 6px;
  padding: 2px;
}

.protocol-segmented :deep(.q-btn) {
  border-radius: 5px;
  text-transform: none;
  font-weight: 600;
  font-size: 11px;
  padding: 4px 10px;
  min-height: 26px;
}

.plataform-segmented :deep(.q-btn) {
  letter-spacing: 1.8px;
}
/* ===== Status Track ===== */
.status-track {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.status-step {
  text-align: center;
  padding: 6px 4px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1.5px solid transparent;
  position: relative;
  background: transparent;
  font-family: inherit;
  overflow: hidden;
}

.status-step:hover {
  background: #f2f2f7;
}

.status-step.active {
  background: color-mix(in srgb, var(--status-color) 12%, transparent);
  border-color: var(--status-color);
}

.status-step .step-icon {
  font-size: 14px;
  margin-bottom: 2px;
  display: block;
  color: #86868b;
}

.status-step.active .step-icon {
  color: var(--status-color);
}

.status-step .step-label {
  font-size: 10px;
  font-weight: 600;
  color: #6e6e73;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  display: block;
  white-space: nowrap;
}

.status-step.active .step-label {
  color: var(--status-color);
}

.status-step .step-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34c759;
  display: none;
}

.status-step.active .step-dot {
  display: block;
  background: var(--status-color);
}

.step-arrow {
  display: none;
}

/* ===== Impact List ===== */
.impact-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}

.impact-option {
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  background: #ffffff;
  overflow: hidden;
}

.impact-option:hover {
  border-color: #d2d2d7;
  background: #f2f2f7;
}

.impact-option.active {
  border-color: #0071e3;
  background: rgba(0, 113, 227, 0.04);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.08);
}

.impact-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  min-height: 32px;
}

.impact-option :deep(.q-radio) {
  margin-top: 0;
}

.impact-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #1d1d1f;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: capitalize;
  min-width: 0;
}

.impact-arrow-btn {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #6e6e73;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.impact-arrow-btn:hover {
  background: #e5e5ea;
  color: #0071e3;
}

.impact-arrow-btn .q-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.impact-arrow-btn.open .q-icon {
  transform: rotate(180deg);
}

.impact-details {
  height: 0;
  overflow: hidden;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0 8px 0 34px;
}

.impact-details-inner {
  padding-bottom: 8px;
}

.impact-classification {
  margin-bottom: 4px;
}

.impact-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.impact-example {
  font-size: 10px;
  color: #86868b;
  font-style: italic;
  line-height: 1.3;
}

/* ===== Form Fields Inside Cards ===== */
.protocol-card :deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
  min-height: 36px;
}

.protocol-card :deep(.q-field--outlined .q-field__native),
.protocol-card :deep(.q-field--outlined .q-field__input) {
  padding: 6px 10px;
  font-size: 12px;
}

.protocol-card :deep(.q-field--outlined .q-field__label) {
  font-size: 12px;
}

.protocol-card :deep(.q-select) {
  width: 100%;
}

/* ===== Actions Footer ===== */
.protocol-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  flex-wrap: wrap;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.btn {
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 6px;
  letter-spacing: 0.2px;
}

.btn-primary {
  background: #0071e3;
  color: white;
  box-shadow: 0 4px 14px rgba(0, 113, 227, 0.3);
}

.btn-primary:hover {
  background: #0077ed;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 113, 227, 0.35);
}

.btn-secondary {
  background: #f2f2f7;
  color: #1d1d1f;
}

.btn-secondary:hover {
  background: #e5e5ea;
}

/* ===== Animation ===== */
@keyframes protocolFadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .protocol-form {
    grid-template-columns: 1fr;
  }

  .protocol-actions {
    grid-column: 1 / -1;
  }

  .protocol-col-right .protocol-card:last-child {
    flex: none;
  }
}

@media (max-width: 768px) {
  .status-track {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .protocol-container {
    padding: 12px 12px 40px;
  }

  .protocol-breadcrumbs {
    padding-top: 8px;
  }

  .protocol-title {
    font-size: 22px;
  }

  .protocol-grid-two {
    grid-template-columns: 1fr;
  }

  .protocol-actions {
    flex-direction: column-reverse;
  }

  .protocol-actions .btn {
    width: 100%;
  }
}
</style>
