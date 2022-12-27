<template>
  <div>
    <q-dialog v-model="open" persistent medium>
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6">Adicionar Cliente (Simplificado)</div>
        </q-card-section>

        <q-form enctype="multipart/form-data" @submit="onSubmit">
          <q-card-section class="">
            <div class="row q-col-gutter-sm">
              <q-input
                v-model="form.first_name"
                filled
                label="Primeiro Nome *"
                lazy-rules
                class="col-lg-6 col-md-6 col-xs-12"
                :rules="[
                  (val) => (val && val.length > 0) || 'Preencha o campo acima',
                ]"
              />
              <q-input
                v-model="form.last_name"
                filled
                label="Último Nome *"
                lazy-rules
                class="col-lg-6 col-md-6 col-xs-12"
                :rules="[
                  (val) => (val && val.length > 0) || 'Preencha o campo acima',
                ]"
              />
            </div>
            <q-input
              v-model="form.email"
              filled
              label="Email *"
              lazy-rules
              class="col-lg-12 col-xs-12"
              :rules="[
                (val) => (val && val.length > 0) || 'Preencha o campo acima',
              ]"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancelar"
              color="grey"
              v-close-popup
              @click="$.emit('return', false)"
            />
            <q-btn
              :disabled="openSubmit"
              flat
              label="Salvar"
              color="primary"
              v-close-popup
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { reactive, ref, toRef, watch } from 'vue';
import clientsService from 'src/services/clients';
import { useQuasar } from 'quasar';

export default {
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['return'],
  setup(props, { emit }) {
    const open = ref(false);
    const propDialog = toRef(props, 'dialog');
    const { storeSimplied } = clientsService();
    const $q = useQuasar();
    open.value = propDialog.value;
    const openSubmit = ref(true);

    const form = reactive({
      first_name: '',
      last_name: '',
      email: '',
    });

    watch(propDialog, (newCurrent, oldCurrent) => {
      open.value = newCurrent;
    });

    watch(form, (newCurrent, oldCurrent) => {
      if (!form.first_name || !form.last_name || !form.email) {
        openSubmit.value = true;
      } else {
        openSubmit.value = false;
      }
    });

    // onSubmit
    const onSubmit = async () => {
      emit('ticket', true);
      try {
        await storeSimplied(form);

        $q.notify({
          message: 'Dados salvos com sucesso',
          icon: 'check',
          color: 'positive',
        });
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
      open,
      openSubmit,
      form,
      onSubmit,
    };
  },
};
</script>

<style lang="scss" scoped></style>
