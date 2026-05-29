<template>
  <article class="stat-card">
    <p>{{ item.label }}</p>
    <div class="value-row">
      <strong class="mono">{{ item.value }}</strong>
      <span>{{ item.unit }}</span>
    </div>
    <small>{{ item.note || item.trend }}</small>
  </article>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.stat-card {
  display: flex;
  min-height: 112px;
  padding: 18px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(98, 138, 138, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 12px 28px rgba(36, 86, 82, 0.08);
}

p {
  margin: 0;
  color: var(--ink-700);
  font-size: 14px;
  font-weight: 700;
}

.value-row {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

strong {
  color: var(--teal-900);
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

span {
  color: var(--teal-500);
  font-size: 14px;
  font-weight: 700;
}

small {
  color: var(--jade-500);
  font-size: 12px;
  font-weight: 800;
}
</style>
