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
                class="col-lg-6 col-md-6 col-xs-6"
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
import { ref, toRef, watch } from 'vue';

export default {
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const open = ref(false);
    const propDialog = toRef(props, 'dialog');
    open.value = propDialog.value;

    const form = ref({
      first_name: '',
      last_name: '',
      email: '',
    });

    watch(propDialog, (newCurrent, oldCurrent) => {
      open.value = newCurrent;
    });

    // onSubmit
    const onSubmit = () => {
      console.log(form);
    };

    return {
      open,
      form,
      onSubmit,
    };
  },
};
</script>

<style lang="scss" scoped></style>
