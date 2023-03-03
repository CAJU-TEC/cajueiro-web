<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Protocolos" :to="{ name: 'tickets.list' }" />
        <q-breadcrumbs-el label="Adicionar" />
      </q-breadcrumbs>
    </div>
    <q-form
      enctype="multipart/form-data"
      class="row q-col-gutter-sm"
      @submit="onSubmit"
    >
      <div class="column">
        <div class="">
          <h6 class="q-mt-lg q-mb-md">Qual a prioridade desse protocolo?</h6>
          <q-btn-toggle
            v-model="form.priority"
            push
            glossy
            :toggle-color="`${priority[form.priority].color}`"
            :options="[
              { label: 'Prioridade', value: 'yes' },
              { label: 'Não prioridade', value: 'no' },
            ]"
          />
        </div>
        <div class="">
          <h6 class="q-mt-lg q-mb-md">Como protocolo está no momento?</h6>
          <q-btn-toggle
            v-model="form.status"
            push
            glossy
            :toggle-color="`${status[form.status].color}`"
            :options="optionsStatus"
          />
        </div>
      </div>

      <div class="column q-gutter-sm q-mb-md">
        <h6 class="q-mt-lg q-mb-none">Impacto do protocolo</h6>
        <q-list class="">
          <q-item
            v-for="option in optionsImpacts"
            :key="option.value"
            tag="label"
            v-ripple
          >
            <q-item-section avatar>
              <q-radio
                v-model="form.impact_id"
                :val="option.value"
                :color="option.color"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label :style="`color: ${option.color};`">{{
                option.label
              }}</q-item-label>
              <q-item-label caption>{{ option.description }} </q-item-label>
              <q-item-label caption>
                <strong>Example:</strong> {{ option.example }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <h6 class="q-mt-lg q-mb-none">Siga no cadastro do protocolo</h6>

      <div class="col-12 q-gutter-sm q-mb-lg">
        <q-select
          filled
          label="Cliente *"
          v-model="form.client_id"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :options="optionsClient"
          @filter="filterFn"
          class="col-lg-6 col-xs-12"
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
      </div>
      <div class="col-12 q-gutter-sm q-mb-lg">
        <q-file
          filled
          clearable
          multiple
          @update:model-value="onChange($event)"
          v-model="form.imageName"
          label="Arquivo"
          class="col-lg-6 col-xs-12"
        >
          <template #prepend>
            <q-icon name="file_upload" />
          </template>
        </q-file>
      </div>

      <div class="col-lg-12 col-xs-12">
        <q-input v-model="form.subject" label="Título *" filled />
      </div>

      <div class="col-lg-12 col-xs-12">
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
            :to="{ name: 'tickets.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
    <AddClient
      :dialog="dialogAddClient"
      @ticket="(e) => getClientSelect"
    ></AddClient>
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
import priority from 'src/support/tickets/priority';

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
    const optionsClient = ref();
    const stringOptionsClient = ref(optionsClient);
    const optionsImpacts = ref();
    const optionsStatus = ref([
      { value: 'backlog', label: 'Aguardando' },
      { value: 'todo', label: 'a fazer' },
      { value: 'analyze', label: 'analise' },
      { value: 'development', label: 'desenvolvimento' },
      { value: 'test', label: 'teste' },
      { value: 'pending', label: 'pendente' },
      { value: 'done', label: 'finalizado' },
    ]);

    const form = ref({
      client_id: ref(''),
      collaborator_id: ref(''),
      impact_id: ref(''),
      priority: ref('no'),
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
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
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
      dialogAddClient,
      optionsClient,
      optionsImpacts,
      optionsStatus,
      stringOptionsClient,
      filterFn,
      onSubmit,
      onChange,
    };
  },
  components: { AddClient },
});
</script>
