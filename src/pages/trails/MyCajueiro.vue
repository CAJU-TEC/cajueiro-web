<template>
  <q-page padding>
    <div class="q-pb-md row items-center">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el label="Minha trilha" :to="{ name: 'trails.mine' }" />
        <q-breadcrumbs-el label="Meu Cajueiro" />
      </q-breadcrumbs>
    </div>

    <div v-if="loading" class="q-pa-lg text-center">
      <q-spinner color="green-8" size="3em" />
    </div>

    <div v-else-if="!cajueiro" class="text-grey-7 q-pa-lg text-center">
      Você ainda não está matriculado em nenhuma trilha. Fale com seu líder.
    </div>

    <template v-else>
      <div class="cajueiro-frame" :class="{ 'cajueiro-frame--story': format === 'story' }">
        <CajueiroPoster ref="poster" :payload="cajueiro" :format="format" />
      </div>

      <div class="row justify-center items-center q-gutter-sm q-mt-lg">
        <q-btn-toggle
          v-model="format"
          no-caps
          rounded
          unelevated
          toggle-color="green-8"
          color="grey-3"
          text-color="grey-8"
          :options="[
            { label: 'Post 1080x1080', value: 'square' },
            { label: 'Story 1080x1920', value: 'story' },
          ]"
        />
        <q-btn
          push
          color="green-8"
          icon="download"
          label="Baixar"
          :loading="generating"
          @click="download"
        />
        <q-btn
          v-if="canShare"
          push
          color="primary"
          icon="share"
          label="Compartilhar"
          :loading="generating"
          @click="share"
        />
        <q-btn flat color="blue-10" icon="arrow_back" label="Minha trilha" :to="{ name: 'trails.mine' }" />
      </div>

      <div v-if="cajueiro.harvested === 0" class="text-center text-grey-7 q-mt-md">
        Seu cajueiro ainda não deu frutos. Conclua a primeira etapa da sua trilha!
      </div>
    </template>
  </q-page>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from 'vue';
import trailsService from 'src/services/trails';
import CajueiroPoster from 'src/components/trails/CajueiroPoster.vue';
import { svgToPngBlob } from 'src/support/images/exportSvg';
import { useQuasar } from 'quasar';

const SIZES = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export default defineComponent({
  name: 'MyCajueiroPage',
  components: { CajueiroPoster },
  setup() {
    const { myCajueiro } = trailsService();
    const $q = useQuasar();

    const cajueiro = ref(null);
    const loading = ref(true);
    const generating = ref(false);
    const format = ref('square');
    const poster = ref(null);

    const canShare = computed(
      () => typeof navigator !== 'undefined' && !!navigator.canShare
    );

    const notifyError = (error) => {
      $q.notify({
        icon: 'block',
        message: 'Ops! Ocorreu um erro.',
        caption: error.message,
        color: 'negative',
      });
    };

    onMounted(async () => {
      try {
        cajueiro.value = await myCajueiro();
      } catch (error) {
        notifyError(error);
      } finally {
        loading.value = false;
      }
    });

    const fileName = () =>
      `meu-cajueiro-${(cajueiro.value?.collaborator?.first_name ?? 'caju').toLowerCase()}-${format.value}.png`;

    // Exporta o próprio pôster que está na tela, então o arquivo é idêntico
    // ao preview por construção.
    const render = async () => {
      const { width, height } = SIZES[format.value];
      return svgToPngBlob(poster.value?.svg, width, height);
    };

    const saveBlob = (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName();
      link.click();
      URL.revokeObjectURL(url);
    };

    const download = async () => {
      generating.value = true;
      try {
        saveBlob(await render());
      } catch (error) {
        notifyError(error);
      } finally {
        generating.value = false;
      }
    };

    const share = async () => {
      generating.value = true;
      try {
        const blob = await render();
        const file = new File([blob], fileName(), { type: 'image/png' });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Esse é meu cajueiro',
            text: `Já colhi ${cajueiro.value.harvested} cajus na minha trilha!`,
          });
        } else {
          // Sem suporte a compartilhar arquivo: cai para o download.
          saveBlob(blob);
        }
      } catch (error) {
        // Cancelar o diálogo nativo dispara AbortError; não é erro para o usuário.
        if (error.name !== 'AbortError') notifyError(error);
      } finally {
        generating.value = false;
      }
    };

    return {
      cajueiro,
      loading,
      generating,
      format,
      poster,
      canShare,
      download,
      share,
    };
  },
});
</script>

<style lang="scss" scoped>
.cajueiro-frame {
  max-width: 620px;
  margin: 0 auto;
}

/* O story é bem mais alto; sem limite ele empurra os botões para fora da tela. */
.cajueiro-frame--story {
  max-width: 380px;
}
</style>
