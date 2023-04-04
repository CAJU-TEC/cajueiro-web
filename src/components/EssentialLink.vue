<template>
  <q-item clickable :to="route" exact v-if="can(permissions)">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue';
import can from 'src/middleware/authMiddleware';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    route: {
      type: Object,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: '',
    },

    icon: {
      type: String,
      default: '',
    },

    permissions: {
      type: Array,
      default: function () {
        return [];
      },
    },
  },

  setup() {
    return {
      can,
    };
  },
});
</script>
