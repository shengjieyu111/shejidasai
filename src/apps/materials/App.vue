<template>
  <div class="screen-page">
    <header class="screen-header panel-card">
      <div class="title-left">
        <div class="main-title">古建筑材料与工艺可视化大屏</div>
        <div class="sub-title">细节出彩 · 材料构成 · 榫卯体系 · 来源分布 · 建造工序</div>
      </div>
      <div class="title-right">
        <div class="date-pill">{{ nowText }}</div>
        <div class="mini-stats">
          <div class="mini-item">
            <span class="label">材料类别</span>
            <span class="value">6</span>
          </div>
          <div class="mini-item">
            <span class="label">工艺类型</span>
            <span class="value">5</span>
          </div>
          <div class="mini-item">
            <span class="label">来源节点</span>
            <span class="value">6</span>
          </div>
        </div>
      </div>
    </header>

    <main class="screen-body">
      <section class="column left-col">
        <PanelCard title="主体材料使用占比" subtitle="木 / 砖 / 石 / 土 / 琉璃等占比" badge="环图">
          <MaterialPie />
        </PanelCard>
        <PanelCard title="装饰工艺数量统计" subtitle="木雕 / 砖雕 / 石雕 / 彩绘 / 匾额" badge="柱图">
          <DecorBar />
        </PanelCard>
        <PanelCard title="榫卯结构使用频率" subtitle="典型榫卯结构应用热度" badge="频率">
          <MortiseBar />
        </PanelCard>
      </section>

      <section class="column center-col">
        <PanelCard title="构件来源与产地分布" subtitle="地图飞线展示材料和构件来源" badge="地图">
          <SourceMap />
        </PanelCard>
        <PanelCard title="建造工序与工艺流程" subtitle="从选材到装饰修缮的工艺链路" badge="流程">
          <ProcessFlow />
        </PanelCard>
      </section>

      <section class="column right-col">
        <PanelCard title="用材年代分布" subtitle="不同历史时期构件和材料数量" badge="时间轴">
          <TimelineChart />
        </PanelCard>
        <PanelCard title="材料与工艺关联分析" subtitle="材料流向具体工艺类型" badge="桑基图">
          <SankeyChart />
        </PanelCard>
        <PanelCard title="构件分类体系" subtitle="构件层级与细分构成" badge="树图">
          <TreeChart />
        </PanelCard>
      </section>
    </main>

    <aside class="highlight-bar panel-card">
      <div class="highlight-title">工艺热点</div>
      <div class="highlight-list">
        <div class="highlight-item">
          <span class="dot"></span>
          <span>徽州木雕：层次丰富，纹样细密</span>
        </div>
        <div class="highlight-item">
          <span class="dot"></span>
          <span>山西砖雕：装饰题材集中，节奏感强</span>
        </div>
        <div class="highlight-item">
          <span class="dot"></span>
          <span>福建石雕：结构厚重，耐久性突出</span>
        </div>
        <div class="highlight-item">
          <span class="dot"></span>
          <span>宫廷彩绘：色彩庄重，等级感鲜明</span>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import PanelCard from './components/PanelCard.vue'
import MaterialPie from './components/MaterialPie.vue'
import DecorBar from './components/DecorBar.vue'
import MortiseBar from './components/MortiseBar.vue'
import SourceMap from './components/SourceMap.vue'
import ProcessFlow from './components/ProcessFlow.vue'
import TimelineChart from './components/TimelineChart.vue'
import SankeyChart from './components/SankeyChart.vue'
import TreeChart from './components/TreeChart.vue'

const now = ref(new Date())
let timer = null

const pad = (n) => String(n).padStart(2, '0')
const nowText = computed(() => {
  const d = now.value
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.screen-page {
  width: 100%;
  height: 100%;
  padding: 16px;
  display: grid;
  grid-template-rows: 84px minmax(0, 1fr) 78px;
  gap: 14px;
}

.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.main-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--primary-deep);
}

.sub-title {
  margin-top: 8px;
  font-size: 16px;
  color: rgba(62, 94, 93, 0.72);
  letter-spacing: 1px;
}

.title-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.date-pill {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(98,138,138,0.2);
  background: rgba(255,255,255,0.45);
  color: var(--primary-deep);
  font-weight: 700;
  min-width: 180px;
  text-align: center;
  font-size: 14px;
}

.mini-stats {
  display: flex;
  gap: 10px;
}

.mini-item {
  min-width: 70px;
  padding: 8px 10px;
  border-radius: 16px;
  background: rgba(255,255,255,0.34);
  border: 1px solid rgba(98,138,138,0.15);
  text-align: center;
}

.mini-item .label {
  display: block;
  font-size: 14px;
  color: rgba(62,94,93,0.72);
}

.mini-item .value {
  display: block;
  margin-top: 4px;
  font-size: 18px;
  font-weight: 800;
  color: #628A8A;
}

.screen-body {
  min-height: 0;
  display: grid;
  grid-template-columns: 24% 1fr 24%;
  gap: 14px;
}

.column {
  min-height: 0;
  display: grid;
  gap: 14px;
}

.left-col,
.right-col {
  grid-template-rows: repeat(3, minmax(0, 1fr));
}

.center-col {
  grid-template-rows: 1.08fr 0.92fr;
}

.highlight-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.highlight-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-deep);
}

.highlight-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(62,94,93,0.88);
  font-size: 16px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(180deg, #628A8A, #7CB7A8);
  box-shadow: 0 0 12px rgba(124,183,168,0.45);
}

@media (max-width: 1440px) {
  .main-title { font-size: 26px; }
  .screen-body { grid-template-columns: 26% 1fr 26%; }
  .highlight-list { gap: 12px; }
}
</style>
