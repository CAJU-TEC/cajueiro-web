<template>
  <!-- SVG auto-contido: cores fixas nos atributos, não em classes/CSS, porque a
       exportação (svgToPngBlob) serializa este nó direto pra um canvas. -->
  <svg
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${width} ${height}`"
    :width="width"
    :height="height"
    style="width: 100%; max-width: 1080px; height: auto; display: block"
    font-family="Roboto, Arial, sans-serif"
  >
    <rect x="0" y="0" :width="width" :height="height" fill="#ffffff" />

    <rect x="0" y="0" :width="width" :height="titleHeight" fill="#1976d2" />
    <text
      :x="width / 2"
      :y="titleHeight / 2 - 12"
      text-anchor="middle"
      fill="#ffffff"
      font-size="37"
      font-weight="bold"
    >
      {{ schedule.title }}
    </text>
    <text
      :x="width / 2"
      :y="titleHeight / 2 + 33"
      text-anchor="middle"
      fill="#ffffff"
      font-size="25"
    >
      {{ formattedDate }}
    </text>

    <rect
      x="0"
      :y="titleHeight"
      :width="width"
      :height="columnHeaderHeight"
      fill="#e3edf9"
    />
    <text
      :x="timeColumnWidth / 2"
      :y="titleHeight + columnHeaderHeight / 2 + 10"
      text-anchor="middle"
      fill="#0d3c6e"
      font-size="27"
      font-weight="bold"
    >
      Horário
    </text>
    <text
      :x="timeColumnWidth + (width - timeColumnWidth) / 2"
      :y="titleHeight + columnHeaderHeight / 2 + 10"
      text-anchor="middle"
      fill="#0d3c6e"
      font-size="27"
      font-weight="bold"
    >
      Responsável
    </text>

    <g
      v-for="(row, index) in rows"
      :key="`${row.collaborator.id}-${row.start}`"
    >
      <rect
        x="0"
        :y="rowY(index)"
        :width="width"
        :height="rowHeight"
        :fill="index % 2 === 0 ? '#ffffff' : '#f5f7fa'"
      />
      <text
        :x="timeColumnWidth / 2"
        :y="rowY(index) + rowHeight / 2 + 10"
        text-anchor="middle"
        fill="#263238"
        font-size="27"
      >
        {{ row.label }}
      </text>
      <text
        :x="timeColumnWidth + 33"
        :y="rowY(index) + rowHeight / 2 + 10"
        text-anchor="start"
        fill="#263238"
        font-size="27"
      >
        {{ collaboratorName(row.collaborator) }}
      </text>
    </g>

    <line
      :x1="timeColumnWidth"
      :y1="titleHeight"
      :x2="timeColumnWidth"
      :y2="height"
      stroke="#d3dbe3"
      stroke-width="2"
    />
    <rect
      x="0"
      y="0"
      :width="width"
      :height="height"
      fill="none"
      stroke="#d3dbe3"
      stroke-width="2"
    />
  </svg>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { computeShifts, buildRows } from 'src/support/schedules/computeShifts';
import { dateOnlyFormat } from 'src/support/dates/dateFormat';

export default defineComponent({
  name: 'ScheduleBoard',
  props: {
    schedule: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const svg = ref(null);

    const width = 1080;
    const timeColumnWidth = 395;
    const titleHeight = 133;
    const columnHeaderHeight = 66;
    const rowHeight = 71;

    const collaborators = computed(() => props.schedule.collaborators ?? []);

    const rows = computed(() => {
      const shifts = computeShifts(props.schedule, collaborators.value);
      return buildRows(props.schedule, shifts);
    });

    const height = computed(
      () => titleHeight + columnHeaderHeight + rows.value.length * rowHeight
    );

    const formattedDate = computed(() => dateOnlyFormat(props.schedule.date));

    const collaboratorName = (collaborator) =>
      [collaborator.first_name, collaborator.last_name]
        .filter(Boolean)
        .join(' ') ||
      collaborator.label ||
      '';

    const rowY = (index) =>
      titleHeight + columnHeaderHeight + index * rowHeight;

    return {
      svg,
      width,
      timeColumnWidth,
      titleHeight,
      columnHeaderHeight,
      rowHeight,
      rows,
      height,
      formattedDate,
      collaboratorName,
      rowY,
    };
  },
});
</script>
