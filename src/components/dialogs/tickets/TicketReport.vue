<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog
      v-model="open"
      persistent
      :maximized="maximizedToggle"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-primary text-white">
        <q-bar>
          <q-space />

          <q-btn
            dense
            flat
            icon="minimize"
            @click="maximizedToggle = false"
            :disable="!maximizedToggle"
          >
            <q-tooltip v-if="maximizedToggle" class="bg-white text-primary"
              >Minimize</q-tooltip
            >
          </q-btn>
          <q-btn
            dense
            flat
            icon="crop_square"
            @click="maximizedToggle = true"
            :disable="maximizedToggle"
          >
            <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary"
              >Maximize</q-tooltip
            >
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup @click="sendEvent">
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section>
          <div class="text-h6">Protocolo para impressão</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <iframe
            :src="reportPdf"
            frameborder="0"
            style="min-height: 100vh; width: 100%"
          ></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, toRef, watch } from 'vue';

export default defineComponent({
  props: {
    dialog: {
      type: Boolean,
      default: false,
    },
    reportPdf: {
      type: String,
      default: '',
    },
  },
  emits: ['receiveEvent'],
  setup(props, context) {
    const open = ref(false);
    const propDialog = toRef(props, 'dialog');

    watch(propDialog, (newCurrent, oldCurrent) => {
      open.value = newCurrent;
    });

    function sendEvent() {
      context.emit('receiveEvent', false);
    }

    return {
      open,
      sendEvent,
      maximizedToggle: ref(false),
    };
  },
});
</script>
