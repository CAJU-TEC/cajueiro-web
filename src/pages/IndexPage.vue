<template>
  <q-page padding>
    <div class="q-pb-md q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" />
      </q-breadcrumbs>
      <h2 class="pt-10 text-h4">Galerinha em atividades!</h2>
      <div class="row q-col-gutter-sm">
        <apex-bar height="300"></apex-bar>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import ApexBar from 'src/components/charts/apexBar.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { ApexBar },
  setup() {
    return {};
  },
});
</script>
