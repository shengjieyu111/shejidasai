<template>
  <header class="dashboard-header">
    <div class="title-group">
      <span class="section-mark">二</span>
      <div>
        <p>建筑形制与结构类</p>
        <h1>古建筑形制结构数据可视化</h1>
      </div>
    </div>
    <div class="header-meta">
      <span>静态数据展示</span>
      <span>适配后续合并</span>
      <time>2026</time>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 104px;
  padding: 22px 30px;
  border: 1px solid rgba(98, 138, 138, 0.24);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(214, 235, 232, 0.94), rgba(221, 240, 238, 0.84)),
    var(--mint-200);
  box-shadow: var(--shadow);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 18px;
  min-width: 0;
}

.section-mark {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 1px solid rgba(49, 95, 93, 0.28);
  border-radius: 8px;
  color: white;
  background: var(--teal-700);
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  box-shadow: inset 0 0 0 5px rgba(255, 255, 255, 0.12);
}

p {
  margin: 0 0 6px;
  color: var(--teal-700);
  font-size: 15px;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: var(--ink-900);
  font-size: 34px;
  font-weight: 900;
  line-height: 1.15;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
  color: var(--ink-700);
  font-size: 13px;
  font-weight: 700;
}

.header-meta span,
.header-meta time {
  padding: 7px 12px;
  border: 1px solid rgba(98, 138, 138, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
}
</style>
