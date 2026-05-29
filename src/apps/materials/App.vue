<template>
  <div class="screen-page">
    <header class="screen-header panel-card">
      <div class="title-left">
        <div class="main-title">材料工艺数据可视化大屏</div>
        <div class="sub-title">病害识别 · 材料诊断 · 工法匹配 · 修复施工 · 监测回访</div>
      </div>
      <div class="title-right">
        <div class="date-pill">{{ nowText }}</div>
        <div class="mini-stats">
         
        </div>
      </div>
    </header>

    <main class="screen-body">
      <section class="column left-col">
        <PanelCard title="材料病害类型占比" subtitle="开裂 / 腐蚀 / 风化 / 空鼓 / 褪色等占比" badge="诊断">
          <MaterialPie />
        </PanelCard>
        <PanelCard title="修复工法介入强度" subtitle="清洗 / 加固 / 填补 / 防护 / 色差校正" badge="工法">
          <DecorBar />
        </PanelCard>
        <PanelCard title="改性传统灰浆关键性能恢复指数" subtitle="强度、附着、耐候、含水率等恢复表现" badge="评估">
          <MortiseBar />
        </PanelCard>
      </section>

      <section class="column center-col">
       <PanelCard title="修复项目与材料来源分布" subtitle="地图飞线展示修复对象、补配材料和技术支援来源" badge="地图">
          <SourceMap @chart-click="handleChartClick" />
        </PanelCard>
 <PanelCard title="材料修复闭环流程" subtitle="从检测建档到回访监测的修复决策链路" badge="流程">
          <ProcessFlow />
        </PanelCard>
      </section>

      <section class="column right-col">
         <PanelCard title="修复阶段任务趋势" subtitle="检测、试验、施工、养护、复检任务量变化" badge="时间轴">
          <TimelineChart />
        </PanelCard>
        <PanelCard title="病害—材料—修复方案关联" subtitle="病害类型流向材料对象与对应处理方案" badge="桑基图">
          <SankeyChart />
        </PanelCard>
         <PanelCard title="材料修复知识体系" subtitle="材料、病害、工法与监测指标层级关系" badge="树图">
          <TreeChart />
        </PanelCard>
      </section>
    </main>

    <aside class="highlight-bar panel-card">
      <div class="highlight-title">修复重点</div>

      <div class="highlight-list">
        <div class="highlight-item">
          <span class="dot"></span>
           <span>木构件：先控含水率，再做虫蛀封护与结构补强</span>
        </div>
        <div class="highlight-item">
          <span class="dot"></span>
           <span>砖石材：风化层清理后采用可逆性加固剂</span>
        </div>
        <div class="highlight-item">
          <span class="dot"></span>
         <span>彩绘层：微区清洗、颜料相容性测试与封存保护</span>
        </div>
        <div class="highlight-item">
          <span class="dot"></span>
          <span>金属件：除锈钝化、防腐涂层与节点复检同步推进</span>
        </div>
      </div>
    </aside>

    <PalaceStructure :visible="showPalaceModal" :building-type="currentBuilding" @close="showPalaceModal = false" />
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
import PalaceStructure from './components/PalaceStructure.vue'

const now = ref(new Date())
let timer = null

const showPalaceModal = ref(false)
const currentBuilding = ref('')

const handleChartClick = (params) => {
  if (params.name === '故宫') {
    currentBuilding.value = 'palace'
    showPalaceModal.value = true
  } else if (params.name === '河南') {
    currentBuilding.value = 'pavilion'
    showPalaceModal.value = true
  }
}

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
  font-weight: 1000;
  color: var(--primary-deep);
}

.highlight-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 30px;
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
