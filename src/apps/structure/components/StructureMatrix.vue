<template>
  <div class="matrix-wrap">
    <div class="matrix">
      <div
        v-for="cell in flatCells"
        :key="cell.name"
        class="matrix-cell"
        :class="cell.center ? 'is-center' : ''"
      >
        {{ cell.name }}
      </div>
    </div>
    <div class="legend">
      <span>柱网布局</span>
      <span>三进深 / 三开间</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  matrix: {
    type: Array,
    required: true
  }
});

const flatCells = computed(() =>
  props.matrix.flatMap((row, rowIndex) =>
    row.map((name, columnIndex) => ({
      name,
      center: rowIndex === 1 && columnIndex === 1
    }))
  )
);
</script>

<style scoped>
.matrix-wrap {
  display: grid;
  height: 100%;
  min-height: 260px;
  grid-template-rows: 1fr auto;
  gap: 16px;
}

.matrix {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(74px, 1fr));
  gap: 10px;
}

.matrix-cell {
  display: grid;
  min-width: 0;
  place-items: center;
  border: 1px solid rgba(98, 138, 138, 0.26);
  border-radius: 8px;
  color: var(--ink-700);
  background:
    linear-gradient(180deg, rgba(221, 240, 238, 0.72), rgba(214, 235, 232, 0.56)),
    rgba(255, 255, 255, 0.6);
  font-size: 15px;
  font-weight: 800;
  text-align: center;
}

.matrix-cell.is-center {
  color: white;
  background: var(--teal-700);
  box-shadow: inset 0 0 0 5px rgba(255, 255, 255, 0.1);
}

.legend {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--ink-500);
  font-size: 13px;
  font-weight: 700;
}
</style>
