<template>
  <div>
    <router-view />
    <TicketSearch v-model="dialogTicketSearch" />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import TicketSearch from 'src/components/dialogs/tickets/TicketSearch.vue';

const dialogTicketSearch = ref(false);

export default defineComponent({
  name: 'App',
  components: { TicketSearch },
  setup() {
    onMounted(() => {
      document.addEventListener('keydown', keyListener);
    });

    const keyListener = (event) => {
      if (event.shiftKey && event.key === 'K') {
        dialogTicketSearch.value = true;
      }
    };

    return {
      dialogTicketSearch,
    };
  },
});
</script>
