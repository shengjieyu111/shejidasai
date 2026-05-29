<template>
  <div class="structure-layers">
    <article v-for="layer in layers" :key="layer.name" class="layer-row">
      <div class="layer-name">{{ layer.name }}</div>
      <div class="layer-content">
        <div class="parts">
          <span v-for="part in layer.parts" :key="part">{{ part }}</span>
        </div>
        <p>{{ layer.note }}</p>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  layers: {
    type: Array,
    required: true
  }
});
</script>

<style scoped>
.structure-layers {
  display: grid;
  height: 100%;
  min-height: 340px;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 12px;
}

.layer-row {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 12px;
  min-height: 0;
  padding: 12px;
  border: 1px solid rgba(98, 138, 138, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.48);
}

.layer-name {
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: white;
  background: var(--teal-700);
  font-size: 17px;
  font-weight: 900;
}

.layer-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.parts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.parts span {
  padding: 6px 10px;
  border: 1px solid rgba(98, 138, 138, 0.22);
  border-radius: 999px;
  color: var(--teal-700);
  background: rgba(214, 235, 232, 0.74);
  font-size: 12px;
  font-weight: 800;
}

p {
  margin: 0;
  color: var(--ink-700);
  font-size: 13px;
  line-height: 1.6;
}
</style>
