<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el
          label="Lista de Protocolos"
          :to="{ name: 'checkLists.list' }"
        />
        <q-breadcrumbs-el label="Adicionar" />
      </q-breadcrumbs>
    </div>
    <q-form
      enctype="multipart/form-data"
      class="row q-col-gutter-sm"
      @submit="onSubmit"
    >
      <div class="q-pa-md col-12">
        <q-stepper v-model="step" vertical color="primary" animated>
          <q-step
            :name="1"
            title="Informe a denominação do ficheiro"
            icon="settings"
            class="col-12"
            :done="step > 1"
          >
            <q-input
              v-model="form.description"
              filled
              label="Descrição *"
              lazy-rules
              class="col-lg-12 col-xs-12"
              :rules="[
                (val) => (val && val.length > 0) || 'Preencha o campo acima',
              ]"
            />

            <q-stepper-navigation>
              <q-btn @click="step = 2" color="primary" label="Próximo" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="2"
            title="Informe o prazo de resolução"
            icon="create_new_folder"
            :done="step > 2"
          >
            <q-date class="row" v-model="date" range />

            <q-stepper-navigation>
              <q-btn @click="step = 3" color="primary" label="Próximo" />
              <q-btn
                flat
                @click="step = 1"
                color="primary"
                label="Anterior"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="3"
            title="Informe os proprietários do ficheiro"
            icon="create_new_folder"
            :done="step > 3"
          >
            <q-select
              v-model="model"
              :options="['Publico', 'Privado']"
              label="Standard"
            />

            <q-stepper-navigation>
              <q-btn @click="step = 4" color="primary" label="Próximo" />
              <q-btn
                flat
                @click="step = 2"
                color="primary"
                label="Anterior"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="4"
            title="Associar os ticktes ao ficheiro"
            icon="create_new_folder"
            :done="step > 4"
          >
            <div class="q-pb-sm">
              <SelectSearch
                label="Escolha um cliente na busca"
                :options-value="optionsCorporates"
                @update:modelValue="updateOptionsValue"
              />
            </div>
            <div class="q-pb-sm">
              <SelectSearch
                label="Escolha a situação do protocolo"
                multiple
                :options-value="optionsStatus"
                @update:modelValue="updateOptionsStatusValue"
              />
            </div>

            <div class="row q-gutter-sm">
              <div class="col">
                <ListTicketsFindsComponent
                  title="Protocolos encontrados no filtro"
                  subtitle="Para adicionar protocolos à listagem,
                  clique na seta correspondente.
                  Isso os incluirá automaticamente no arquivo de protocolos.
                  Se desejar visualizar mais detalhes sobre um protocolo
                  específico, basta clicar nele."
                  :tickets="listTicketsFinds"
                  @update:modelValue="updateListTicketsFindsValue"
                />
              </div>
              <div class="col">
                <ListTicketsFindsComponent
                  title="Lista de protocolos"
                  subtitle="Protocolos que foram adicionados na lista"
                  :tickets="ticketsBinder"
                  @update:modelValue="updateListTicketsBinderFindsValue"
                />
              </div>
            </div>

            <q-stepper-navigation>
              <q-btn
                flat
                @click="step = 3"
                color="primary"
                label="Anterior"
                class="q-ml-sm"
              />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>
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
            :to="{ name: 'jobPlans.list' }"
            icon="logout"
          />
        </q-btn-group>
      </div>
    </q-form>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import checkListsService from 'src/services/checkLists';
import corporateService from 'src/services/corporate';
import ticketsService from 'src/services/tickets';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import SelectSearch from 'src/components/select-search/AutoComplete.vue';
import ListTicketsFindsComponent from 'src/components/tickets/ListTicketsFinds.vue';
import status from 'src/support/tickets/status';
import _ from 'lodash';
// import tickets from 'src/router/tickets';

export default defineComponent({
  name: 'FormCheckList',
  components: { SelectSearch, ListTicketsFindsComponent },
  setup() {
    const { post, getById, update } = checkListsService();
    const { findStatus } = ticketsService();
    const { list: listCorporate } = corporateService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const step = ref(1);

    const optionsCorporates = ref([{}]);
    const optionsStatus = ref([{}]);
    const selectValue = ref({});
    const selectStatusValue = ref({});
    const ticketsBinder = ref([]);
    const listTicketsFinds = ref({});
    const form = ref({
      description: '',
      status: '',
      started: null,
      delivered: null,
    });
    const date = ref({ from: '', to: '' });

    watch(date, (newDate) => {
      form.value.started = formatDateFromAmerica(newDate.from);
      form.value.delivered = formatDateFromAmerica(newDate.to);
    });

    watch(selectStatusValue, async (newValue) => {
      listTicketsFinds.value = await getTicketsFindStatus({
        status: selectStatusValue.value,
        corporate_id: selectValue.value,
      });
    });

    const removeItem = (id, data, add) => {
      const index = data.value.findIndex((item) => item.id === id);
      if (index !== -1) {
        // data.value.splice(index, 0);
        const [item] = data.value.splice(index, 1);
        add.value.push(item);
      }
    };

    const transferItem = (id, tickets, add) => {
      removeItem(id, tickets, add);
      // ticketsBinder.value.push(removeItem(id, tickets));
    };

    const formatDateFromAmerica = (date) => {
      // Verifica se a data é válida usando Date.parse
      const parsedDate = Date.parse(date);
      if (isNaN(parsedDate)) {
        throw new Error('Data inválida');
      }

      // Cria um objeto Date a partir da data fornecida
      const dateObj = new Date(parsedDate);

      // Formata a data no formato YYYY-MM-DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Mês começa de 0
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    const updateOptionsValue = (value) => {
      selectValue.value = value;
    };

    const updateOptionsStatusValue = (value) => {
      selectStatusValue.value = value;
    };

    const updateListTicketsFindsValue = (value) => {
      transferItem(value, listTicketsFinds, ticketsBinder);
    };

    const updateListTicketsBinderFindsValue = (value) => {
      transferItem(value, ticketsBinder, listTicketsFinds);
    };

    onMounted(() => {
      getCorporates();
      getStatus();
      if (route.params.id) {
        getCheckList(route.params.id);
      }
    });

    const getTicketsFindStatus = async (data) => {
      try {
        const response = await findStatus(data).then((response) => {
          return response.data;
        });
        return response;
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const getCheckList = async (id) => {
      try {
        const response = await getById(id);
        form.value = response;
        date.value.from = response.started.replace(/-/g, '/');
        date.value.to = response.delivered.replace(/-/g, '/');
      } catch (error) {
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const getCorporates = async () => {
      try {
        const data = await listCorporate();

        optionsCorporates.value = _.map(data, (item) => {
          return { id: item.id, label: item.full_name };
        });
      } catch (error) {
        console.error(error);
        $q.notify({
          message: 'Ops! Ocorreu algum erro.',
          icon: 'check',
          color: 'warning',
        });
      }
    };

    const getStatus = () => {
      optionsStatus.value = _.map(status, (item, key) => {
        return { id: key, label: item.title };
      });
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
        router.push({ name: 'checkLists.list' });
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
      optionsCorporates,
      form,
      updateOptionsValue,
      getCorporates,
      selectValue,
      date,
      onSubmit,
      status,
      getStatus,
      optionsStatus,
      selectStatusValue,
      updateOptionsStatusValue,
      updateListTicketsFindsValue,
      updateListTicketsBinderFindsValue,
      step,
      getTicketsFindStatus,
      listTicketsFinds,
      ListTicketsFindsComponent,
      transferItem,
      ticketsBinder,
    };
  },
});
</script>
