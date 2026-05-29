<template>
  <section class="chart-panel">
    <header class="panel-header">
      <div>
        <p class="eyebrow">{{ eyebrow }}</p>
        <h2>{{ title }}</h2>
      </div>
      <span v-if="tag" class="panel-tag">{{ tag }}</span>
    </header>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: 'ARCHITECTURE'
  },
  title: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.chart-panel {
  display: flex;
  height: 100%;
  min-height: 0;
  padding: 18px;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(239, 249, 247, 0.9)),
    var(--surface);
  box-shadow: var(--shadow);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-height: 48px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(98, 138, 138, 0.18);
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--teal-500);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

h2 {
  margin: 0;
  color: var(--ink-900);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
}

.panel-tag {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 999px;
  color: var(--teal-700);
  background: rgba(214, 235, 232, 0.72);
  font-size: 12px;
  font-weight: 700;
}

.panel-body {
  flex: 1;
  min-height: 0;
  padding-top: 14px;
  overflow: hidden;
}

.panel-body :deep(.base-chart) {
  height: 100%;
  min-height: 0;
}
</style>
