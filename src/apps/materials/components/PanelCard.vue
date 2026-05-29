<template>
  <section class="panel-card panel-wrap">
    <div class="panel-head">
      <div>
        <div class="panel-title">{{ title }}</div>
        <div v-if="subtitle" class="panel-subtitle">{{ subtitle }}</div>
      </div>
      <div v-if="badge" class="panel-badge">{{ badge }}</div>
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  badge: String
})
</script>

<style scoped>
.panel-wrap {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 18px 10px;
}

.panel-title {
  position: relative;
  padding-left: 14px;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 700;
  color: var(--primary-deep);
}

.panel-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 2px;
  width: 5px;
  height: 3px;
  border-radius: 6px;
  background: linear-gradient(180deg, var(--primary), var(--glaze));
}

.panel-subtitle {
  margin-top: 4px;
  color: rgba(62, 94, 93, 0.72);
  font-size: 8px;
}

.panel-badge {
  padding: 3px 5px;
  border-radius: 999px;
  background: rgba(98, 138, 138, 0.12);
  color: var(--primary);
  font-size: 8px;
}

.panel-body {
  flex: 1;
  min-height: 0;
  padding: 0 10px 12px;
}
</style>
