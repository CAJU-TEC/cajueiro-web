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
        class="col-lg-12 col-xs-12"
        emit-value
        map-options
      >
        <template #no-option>
          <q-item>
            <q-item-section class="text-grey"> No results </q-item-section>
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
      <q-input
        v-model="form.last_name"
        filled
        label="Último Nome *"
        lazy-rules
        class="col-lg-6 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-input
        v-model="form.email"
        filled
        label="E-mail *"
        lazy-rules
        class="col-lg-5 col-xs-12"
        :rules="[(val) => (val && val.length > 0) || 'Preencha o campo acima']"
      />

      <q-file
        filled
        @update:model-value="onChange($event)"
        v-model="form.imageInput"
        label="Imagem"
        class="col-lg-3 col-xs-12"
        accept=".jpg, .png, .jpeg"
      >
        <template #prepend>
          <q-icon name="file_upload" />
        </template>
      </q-file>

      <div class="col-lg-12 col-xs-12">
        <q-input
          v-model="form.address"
          label="Endereço *"
          filled
          type="textarea"
        />
      </div>
      Luizmagao dafads
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
      @return="(e) => (dialogAddClient = e)"
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

export default defineComponent({
  name: 'FormClient',
  setup() {
    const { post, getById, update } = ticketsService();
    const { list } = clientsService();
    const $q = useQuasar();
    const router = useRouter();
    const route = useRoute();
    const dialogAddClient = ref(false);

    const form = ref({
      client_id: '',
      corporate_id: '',
      first_name: '',
      last_name: '',
      email: '',
      image: '',
      address: '',
    });
    const optionsClient = ref();
    const stringOptionsClient = ref(optionsClient);

    onMounted(async () => {
      if (route.params.id) {
        getClient(route.params.id);
      }
      getClientSelect();
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

    const getClientSelect = async () => {
      try {
        const response = await list();
        optionsClient.value = response.map((m) => {
          return {
            value: m.id,
            label: `${m.full_name} (${m.email.description})`,
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
      const reader = new FileReader();

      reader.onloadend = () => {
        form.value.image = reader.result;
      };

      reader.readAsDataURL(fileObject);
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
      dialogAddClient,
      optionsClient,
      stringOptionsClient,
      filterFn,
      onSubmit,
      onChange,
    };
  },
  components: { AddClient },
});
</script>
