<template>
  <div>
    <q-expansion-item
      v-if="submenus.length > 0 && can(permissions)"
      :icon="icon"
      :label="title"
      expand-icon="keyboard_arrow_down"
    >
      <q-item
        v-for="sub in submenus"
        :key="sub"
        clickable
        :to="sub.route"
        exact
      >
        <q-item-section v-if="sub.icon" avatar>
          <q-icon :name="sub.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ sub.title }}</q-item-label>
          <q-item-label caption>
            {{ sub.caption }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-expansion-item>
    <q-item
      v-if="submenus.length == 0 && can(permissions)"
      clickable
      :to="route"
      exact
    >
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
  </div>
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

    submenus: {
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
