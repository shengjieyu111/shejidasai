<template>
  <main class="dashboard-shell" :class="{ 'is-resizing': resizeState.active, 'is-analysis-fullscreen': isAnalysisFullScreen }">
    <header class="topbar">
      <RouterLink class="structure-return-link" :to="{ name: 'home', hash: '#topic-structure' }" aria-label="返回结构专题" title="返回结构专题"></RouterLink>

      <div class="topbar-title">
        <p>ARCHITECTURE STRUCTURE DATA</p>
        <h1>中国古建筑形制结构数据可视化</h1>
      </div>
      <div class="topbar-meta">
        <span>静态样本 {{ architectureSamples.length }} 处</span>
        <span>筛选结果 {{ filteredSamples.length }} 处</span>
      </div>
    </header>

    <section class="workspace" :style="workspaceStyle">
      <aside class="filter-sidebar">
        <section class="side-block filter-block">
          <div class="side-title">
            <span>FILTER</span>
            <h2>筛选条件</h2>
          </div>

          <label>
            <span>初建朝代</span>
            <select v-model="filters.dynasty">
              <option v-for="item in filterOptions.dynasties" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label>
            <span>地区</span>
            <select v-model="filters.region">
              <option v-for="item in filterOptions.regions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label>
            <span>建筑类型</span>
            <select v-model="filters.type">
              <option v-for="item in filterOptions.types" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label>
            <span>屋顶形式</span>
            <select v-model="filters.roof">
              <option v-for="item in filterOptions.roofs" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <button class="reset-button" type="button" @click="resetFilters">重置筛选</button>
        </section>

        <section class="kpi-grid">
          <article v-for="item in overviewStats" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}<small>{{ item.unit }}</small></strong>
            <p>{{ item.note }}</p>
          </article>
        </section>

        <section class="side-block grow-block">
          <div class="side-title">
            <span>REGION</span>
            <h2>样本集中地区</h2>
          </div>
          <ul class="rank-list">
            <li v-for="item in provinceRank.slice(0, 3)" :key="item.name">
              <span>{{ item.name }}</span>
              <b>{{ item.value }}</b>
            </li>
          </ul>
          <p class="estimate-note">红色字段表示含估算口径的数据；图表会提取字段中的数字参与计算。</p>
        </section>
      </aside>

      <div class="resize-handle resize-handle-x" role="separator" aria-label="调整左侧筛选区宽度" @pointerdown="startColumnResize('left', $event)"></div>

      <section class="center-stage">
        <ChartPanel class="map-panel" title="空间分布" eyebrow="WHERE" tag="可缩放地图">
          <ChinaDistributionMap :samples="filteredSamples" />
        </ChartPanel>

        <div class="resize-handle resize-handle-y" role="separator" aria-label="调整地图和数据表高度" @pointerdown="startTableResize"></div>

        <ChartPanel class="table-panel" title="样本数据表" eyebrow="RAW DATA" tag="筛选联动">
          <DataTable :rows="filteredSamples" />
        </ChartPanel>
      </section>

      <div class="resize-handle resize-handle-x" role="separator" aria-label="调整右侧分析区宽度" @pointerdown="startColumnResize('right', $event)"></div>

      <aside class="analysis-column" :class="{ 'is-fullscreen': isAnalysisFullScreen }">
        <button class="analysis-expand-button" type="button" @click="toggleAnalysisFullScreen">
          {{ isAnalysisFullScreen ? '还原' : '展开' }}
        </button>

        <ChartPanel class="analysis-panel scale-panel" title="尺度差异" eyebrow="SCALE" tag="维度切换">
          <div class="dimension-tabs">
            <button
              v-for="item in dimensionOptions"
              :key="item.key"
              :class="{ active: currentDimension === item.key }"
              type="button"
              @click="currentDimension = item.key"
            >
              {{ item.label }}
            </button>
          </div>
          <div class="chart-fill">
            <BaseChart :option="scaleBarOption" />
          </div>
        </ChartPanel>

        <div class="resize-handle resize-handle-y" role="separator" aria-label="调整尺度图高度" @pointerdown="startRightResize('scale', $event)"></div>

        <div class="mini-chart-row">
          <ChartPanel class="analysis-panel" title="类型占比" eyebrow="TYPE">
            <BaseChart :option="typePieOption" />
          </ChartPanel>

          <ChartPanel class="analysis-panel" title="屋顶占比" eyebrow="ROOF">
            <BaseChart :option="roofPieOption" />
          </ChartPanel>
        </div>

        <div class="resize-handle resize-handle-y" role="separator" aria-label="调整分类图高度" @pointerdown="startRightResize('mini', $event)"></div>

        <ChartPanel class="analysis-panel rule-panel" title="等级规制" eyebrow="RANK RULE" tag="官式对比">
          <BaseChart :option="ruleBarOption" />
        </ChartPanel>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import BaseChart from './components/BaseChart.vue';
import ChartPanel from './components/ChartPanel.vue';
import ChinaDistributionMap from './components/ChinaDistributionMap.vue';
import DataTable from './components/DataTable.vue';
import { architectureSamples, dimensionOptions, roofFormOptions } from './data/architectureData';

const ALL = '全部';
const currentDimension = ref('height');
const dynastyBuckets = [
  '夏朝',
  '商朝',
  '西周',
  '东周',
  '秦朝',
  '西汉',
  '东汉',
  '三国',
  '西晋',
  '东晋',
  '十六国',
  '南朝',
  '北朝',
  '隋朝',
  '唐朝',
  '北宋',
  '南宋',
  '元朝',
  '明朝',
  '清朝'
];

// 手动按“最初建成时间”归入筛选分组，避免用 dynasty 文本做语义猜测。
// 当前筛选序列不含辽、金：辽代样本按建成年份所在时段归入北宋，金代样本归入南宋。
const initialDynastyById = {
  1: '明朝',
  2: '明朝',
  3: '明朝',
  4: '明朝',
  5: '清朝',
  6: '明朝',
  7: '明朝',
  8: '清朝',
  9: '明朝',
  10: '清朝',
  11: '清朝',
  12: '隋朝',
  13: '唐朝',
  14: '唐朝',
  15: '北宋',
  16: '北宋',
  17: '北宋',
  18: '南宋',
  19: '南宋',
  20: '元朝',
  21: '元朝',
  22: '明朝',
  23: '清朝',
  24: '清朝',
  25: '清朝',
  26: '明朝'
};

const initialDynastyOf = (item) => item.initialDynasty || initialDynastyById[item.id] || '';

const filters = reactive({
  dynasty: ALL,
  region: ALL,
  type: ALL,
  roof: ALL
});

const palette = ['#315f5d', '#4d9a88', '#6fa58d', '#98c6bc', '#c8a96a', '#7fb7ac', '#82aaa5', '#d6ebe8'];
const baseTextStyle = {
  color: '#31504d',
  fontFamily: 'Microsoft YaHei, PingFang SC, Arial, sans-serif'
};

const unique = (items) => [...new Set(items.filter(Boolean))];
const numericValue = (value) => {
  if (typeof value === 'number') return value;
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const formatNumber = (value, digits = 0) => Number(value || 0).toFixed(digits).replace(/\.0$/, '');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const layout = reactive({
  left: 430,
  right: 560,
  table: 340,
  scale: 300,
  mini: 260
});

const isAnalysisFullScreen = ref(false);
const toggleAnalysisFullScreen = () => {
  isAnalysisFullScreen.value = !isAnalysisFullScreen.value;
};

const resizeState = reactive({
  active: false,
  target: '',
  startX: 0,
  startY: 0,
  startLeft: 0,
  startRight: 0,
  startTable: 0,
  startScale: 0,
  startMini: 0
});

const workspaceStyle = computed(() => ({
  '--left-col': `${layout.left}px`,
  '--right-col': `${layout.right}px`,
  '--table-row': `${layout.table}px`,
  '--scale-row': `${layout.scale}px`,
  '--mini-row': `${layout.mini}px`
}));

const handleResize = (event) => {
  if (!resizeState.active) return;

  const dx = event.clientX - resizeState.startX;
  const dy = event.clientY - resizeState.startY;

  if (resizeState.target === 'left') {
    layout.left = clamp(resizeState.startLeft + dx, 200, 560);
  }

  if (resizeState.target === 'right') {
    layout.right = clamp(resizeState.startRight - dx, 260, 760);
  }

  if (resizeState.target === 'table') {
    layout.table = clamp(resizeState.startTable - dy, 100, 480);
  }

  if (resizeState.target === 'scale') {
    layout.scale = clamp(resizeState.startScale + dy, 120, 430);
  }

  if (resizeState.target === 'mini') {
    layout.mini = clamp(resizeState.startMini + dy, 110, 380);
  }
};

const stopResize = () => {
  resizeState.active = false;
  resizeState.target = '';
  window.removeEventListener('pointermove', handleResize);
  window.removeEventListener('pointerup', stopResize);
};

const startResize = (target, event) => {
  event.preventDefault();
  resizeState.active = true;
  resizeState.target = target;
  resizeState.startX = event.clientX;
  resizeState.startY = event.clientY;
  resizeState.startLeft = layout.left;
  resizeState.startRight = layout.right;
  resizeState.startTable = layout.table;
  resizeState.startScale = layout.scale;
  resizeState.startMini = layout.mini;
  event.currentTarget.setPointerCapture?.(event.pointerId);
  window.addEventListener('pointermove', handleResize);
  window.addEventListener('pointerup', stopResize);
};

const startColumnResize = (target, event) => startResize(target, event);
const startTableResize = (event) => startResize('table', event);
const startRightResize = (target, event) => startResize(target, event);

onBeforeUnmount(stopResize);

const countBy = (items, getter, preset = []) => {
  const map = new Map(preset.map((name) => [name, 0]));
  items.forEach((item) => {
    const name = typeof getter === 'function' ? getter(item) : item[getter];
    if (!name) return;
    map.set(name, (map.get(name) || 0) + 1);
  });
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);
};

const filterOptions = computed(() => ({
  dynasties: [ALL, ...dynastyBuckets],
  regions: [ALL, ...unique(architectureSamples.map((item) => item.province))],
  types: [ALL, ...unique(architectureSamples.map((item) => item.type))],
  roofs: [ALL, ...unique(architectureSamples.map((item) => item.roofForm))]
}));

const filteredSamples = computed(() =>
  architectureSamples.filter((item) => {
    return (
      (filters.dynasty === ALL || initialDynastyOf(item) === filters.dynasty) &&
      (filters.region === ALL || item.province === filters.region) &&
      (filters.type === ALL || item.type === filters.type) &&
      (filters.roof === ALL || item.roofForm === filters.roof)
    );
  })
);

const resetFilters = () => {
  filters.dynasty = ALL;
  filters.region = ALL;
  filters.type = ALL;
  filters.roof = ALL;
};

const overviewStats = computed(() => {
  const samples = filteredSamples.value;
  const maxHeight = Math.max(...samples.map((item) => numericValue(item.height)), 0);
  return [
    { label: '建筑总数', value: samples.length, unit: '处', note: '当前筛选样本' },
    { label: '覆盖地区', value: unique(samples.map((item) => item.province)).length, unit: '省市', note: '空间覆盖范围' },
    { label: '类型数量', value: unique(samples.map((item) => item.type)).length, unit: '类', note: '形制分类数量' },
    { label: '最高高度', value: formatNumber(maxHeight, 1), unit: 'm', note: '样本最高值' }
  ];
});

const provinceRank = computed(() =>
  countBy(filteredSamples.value, 'province').sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
);

const typeData = computed(() => {
  const order = ['皇宫', '官府', '民居', '桥梁'];
  return countBy(filteredSamples.value, 'type', order);
});

const roofData = computed(() => countBy(filteredSamples.value, 'roofForm', roofFormOptions));

const selectedDimension = computed(() => dimensionOptions.find((item) => item.key === currentDimension.value) || dimensionOptions[0]);

const scaleData = computed(() =>
  [...filteredSamples.value]
    .sort((a, b) => numericValue(b[currentDimension.value]) - numericValue(a[currentDimension.value]))
    .slice(0, 8)
);

const ruleSamples = computed(() =>
  filteredSamples.value
    .filter((item) => numericValue(item.beastCount) > 0 || numericValue(item.doorNailRows) > 0 || numericValue(item.colorRank) >= 70)
    .sort((a, b) => numericValue(b.colorRank) - numericValue(a.colorRank))
    .slice(0, 6)
);

const donutOption = (data, name) => ({
  color: palette,
  tooltip: {
    trigger: 'item',
    formatter: '{b}<br/>{c} 处 / {d}%'
  },
  legend: {
    bottom: 0,
    itemWidth: 8,
    itemHeight: 8,
    textStyle: { ...baseTextStyle, fontSize: 10 }
  },
  series: [
    {
      name,
      type: 'pie',
      radius: ['48%', '70%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      label: {
        show: false
      },
      itemStyle: {
        borderColor: '#f8fdfc',
        borderWidth: 2
      },
      data
    }
  ]
});

const typePieOption = computed(() => donutOption(typeData.value, '建筑类型'));
const roofPieOption = computed(() => donutOption(roofData.value, '屋顶形式'));

const scaleBarOption = computed(() => ({
  color: ['#4d9a88'],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => {
      const row = params[0];
      return `${row.name}<br/>${selectedDimension.value.label}: ${row.value}${selectedDimension.value.unit}`;
    }
  },
  grid: {
    top: 16,
    right: 16,
    bottom: 54,
    left: 42
  },
  xAxis: {
    type: 'category',
    data: scaleData.value.map((item) => item.name),
    axisLabel: {
      color: '#31504d',
      rotate: 35,
      interval: 0,
      fontSize: 10
    },
    axisLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.35)' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    name: selectedDimension.value.unit,
    nameTextStyle: { color: '#5b7470', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.16)' } },
    axisLabel: { color: '#5b7470', fontSize: 10 }
  },
  series: [
    {
      name: selectedDimension.value.label,
      type: 'bar',
      barWidth: 18,
      data: scaleData.value.map((item) => numericValue(item[currentDimension.value])),
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#315f5d' },
            { offset: 1, color: '#98c6bc' }
          ]
        }
      }
    }
  ]
}));

const dougongLevel = (item) => {
  if (!item.hasDougong) return 0;
  if (item.dougongType.includes('七踩') || item.dougongType.includes('官式') || item.dougongType.includes('多层')) return 9;
  if (item.dougongType.includes('宋') || item.dougongType.includes('辽') || item.dougongType.includes('唐')) return 8;
  return 6;
};

const ruleBarOption = computed(() => ({
  color: ['#315f5d', '#6fa58d', '#c8a96a', '#98c6bc'],
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    top: 0,
    itemWidth: 10,
    itemHeight: 8,
    textStyle: { ...baseTextStyle, fontSize: 10 }
  },
  grid: {
    top: 36,
    right: 8,
    bottom: 44,
    left: 30
  },
  xAxis: {
    type: 'category',
    data: ruleSamples.value.map((item) => item.name),
    axisLabel: { color: '#31504d', interval: 0, rotate: 25, fontSize: 10 },
    axisLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.35)' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    max: 10,
    splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.16)' } },
    axisLabel: { color: '#5b7470', fontSize: 10 }
  },
  series: [
    {
      name: '走兽',
      type: 'bar',
      barWidth: 10,
      data: ruleSamples.value.map((item) => numericValue(item.beastCount))
    },
    {
      name: '门钉',
      type: 'bar',
      barWidth: 10,
      data: ruleSamples.value.map((item) => numericValue(item.doorNailRows))
    },
    {
      name: '色彩/10',
      type: 'bar',
      barWidth: 10,
      data: ruleSamples.value.map((item) => Number((numericValue(item.colorRank) / 10).toFixed(1)))
    },
    {
      name: '斗拱',
      type: 'bar',
      barWidth: 10,
      data: ruleSamples.value.map((item) => dougongLevel(item))
    }
  ]
}));
</script>

<style scoped>
.dashboard-shell {
  display: grid;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  padding: 12px;
  grid-template-rows: 56px minmax(0, 1fr);
  gap: 10px;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(221, 240, 238, 0.96) 0%, rgba(214, 235, 232, 0.9) 48%, rgba(246, 251, 250, 0.94) 100%);
}

.dashboard-shell::before {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background-image:
    linear-gradient(rgba(98, 138, 138, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(98, 138, 138, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
}

.dashboard-shell.is-analysis-fullscreen::after {
  position: fixed;
  inset: 0;
  z-index: 35;
  content: '';
  background: rgba(17, 47, 45, 0.34);
  backdrop-filter: blur(3px);
}

.dashboard-shell > * {
  position: relative;
  z-index: 1;
}

.dashboard-shell.is-analysis-fullscreen .workspace {
  z-index: auto;
}

.topbar {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  min-height: 0;
  padding: 9px 14px;
  border: 1px solid rgba(98, 138, 138, 0.24);
  border-radius: 8px;
  background: rgba(248, 253, 252, 0.78);
  box-shadow: var(--shadow);
}

.structure-return-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 50%;
  color: white;
  background: rgba(37, 71, 70, 0.78);
  box-shadow: 0 8px 18px rgba(17, 47, 45, 0.16);
  font-size: 0;
  text-decoration: none;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.structure-return-link::before {
  content: "<";
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
}

.structure-return-link:hover,
.structure-return-link:focus-visible {
  background: var(--teal-900);
  border-color: rgba(98, 138, 138, 0.48);
  transform: translateX(-1px);
}

.topbar-title {
  min-width: 0;
}

.topbar p,
.side-title span {
  margin: 0 0 4px;
  color: var(--teal-500);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0;
}

.topbar h1 {
  margin: 0;
  color: var(--ink-900);
  font-size: 22px;
  font-weight: 900;
  line-height: 1.1;
}

.topbar-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  color: var(--teal-700);
  font-size: 12px;
  font-weight: 900;
}

.topbar-meta span {
  padding: 7px 10px;
  border: 1px solid rgba(98, 138, 138, 0.2);
  border-radius: 999px;
  background: rgba(214, 235, 232, 0.62);
}

.workspace {
  display: grid;
  min-height: 0;
  height: 100%;
  grid-template-columns: var(--left-col) 10px minmax(360px, 1fr) 10px var(--right-col);
  gap: 0;
  overflow: hidden;
}

.resize-handle {
  position: relative;
  z-index: 4;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  touch-action: none;
  user-select: none;
}

.resize-handle::before {
  display: block;
  border-radius: 999px;
  background: rgba(98, 138, 138, 0.28);
  content: '';
  transition:
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.resize-handle:hover::before,
.is-resizing .resize-handle::before {
  background: var(--teal-700);
  box-shadow: 0 0 0 4px rgba(98, 138, 138, 0.12);
}

.resize-handle-x {
  cursor: col-resize;
}

.resize-handle-x::before {
  width: 2px;
  height: 78px;
}

.resize-handle-y {
  cursor: row-resize;
}

.resize-handle-y::before {
  width: 96px;
  height: 2px;
}

.filter-sidebar,
.analysis-column,
.center-stage {
  min-height: 0;
}

.filter-sidebar {
  display: grid;
  height: 100%;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  gap: 10px;
  overflow: hidden;
}

.side-block,
.kpi-grid article {
  border: 1px solid rgba(98, 138, 138, 0.22);
  border-radius: 8px;
  background: rgba(248, 253, 252, 0.78);
  box-shadow: 0 12px 30px rgba(36, 86, 82, 0.08);
}

.side-block {
  display: grid;
  gap: 8px;
  padding: 12px;
  min-height: 0;
  overflow: hidden;
}

.filter-block {
  gap: 7px;
  padding: 11px 12px;
  overflow: auto;
}

.grow-block {
  align-content: start;
  overflow: hidden;
}

.grow-block .estimate-note {
  display: none;
}

.side-title h2 {
  margin: 0;
  color: var(--ink-900);
  font-size: 17px;
  font-weight: 900;
}

label {
  display: grid;
  gap: 5px;
}

label span {
  color: var(--ink-500);
  font-size: 12px;
  font-weight: 900;
}

select,
.reset-button,
.dimension-tabs button {
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 8px;
  color: var(--ink-900);
  background: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  font-weight: 800;
}

select {
  width: 100%;
  height: 30px;
  padding: 0 9px;
}

.reset-button {
  height: 32px;
  color: white;
  cursor: pointer;
  background: var(--teal-700);
}

.reset-button:hover {
  background: var(--teal-900);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-height: 0;
}

.kpi-grid article {
  min-height: 0;
  padding: 8px;
}

.kpi-grid span {
  color: var(--ink-500);
  font-size: 12px;
  font-weight: 900;
}

.kpi-grid strong {
  display: block;
  margin-top: 5px;
  color: var(--teal-900);
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.kpi-grid small {
  margin-left: 4px;
  color: var(--teal-500);
  font-size: 12px;
}

.kpi-grid p,
.estimate-note {
  margin: 5px 0 0;
  color: var(--ink-500);
  font-size: 11px;
  font-weight: 800;
}

.rank-list {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  list-style: none;
}

.rank-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 8px;
  border: 1px solid rgba(98, 138, 138, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.52);
}

.rank-list span {
  color: var(--ink-700);
  font-size: 12px;
  font-weight: 900;
}

.rank-list b {
  color: var(--teal-900);
  font-size: 14px;
}

.estimate-note {
  color: #c9433b;
  line-height: 1.5;
}

.center-stage {
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr) 10px var(--table-row);
  gap: 0;
  overflow: hidden;
}

.analysis-column {
  position: relative;
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-rows: var(--scale-row) 10px var(--mini-row) 10px minmax(0, 1fr);
  gap: 0;
  overflow: hidden;
}

.analysis-column.is-fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 100;
  width: min(1180px, calc(100vw - 48px));
  height: min(760px, calc(100vh - 48px));
  padding: 42px 12px 12px;
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(221, 240, 238, 0.98), rgba(248, 253, 252, 0.96)),
    var(--surface);
  box-shadow: 0 28px 70px rgba(36, 86, 82, 0.28);
  transform: translate(-50%, -50%);
}

.analysis-expand-button {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 8;
  height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  background: var(--teal-700);
  font-size: 12px;
  font-weight: 900;
}

.analysis-expand-button:hover {
  background: var(--teal-900);
}

.scale-panel :deep(.panel-tag) {
  margin-right: 58px;
}

.mini-chart-row {
  display: grid;
  min-height: 0;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  overflow: hidden;
}

.map-panel,
.table-panel,
.analysis-panel {
  height: 100%;
  overflow: hidden;
  min-height: 0;
  padding: 10px;
}

.map-panel :deep(.panel-header),
.table-panel :deep(.panel-header),
.analysis-panel :deep(.panel-header) {
  min-height: 38px;
  padding-bottom: 7px;
}

.map-panel :deep(h2),
.table-panel :deep(h2),
.analysis-panel :deep(h2) {
  font-size: 15px;
}

.map-panel :deep(.panel-body),
.table-panel :deep(.panel-body),
.analysis-panel :deep(.panel-body) {
  height: calc(100% - 46px);
  padding-top: 7px;
  overflow: hidden;
}

.map-panel :deep(.china-map-shell),
.map-panel :deep(.map-canvas),
.map-panel :deep(svg) {
  height: 100%;
  min-height: 0;
}

.table-panel :deep(.table-wrap) {
  height: 100%;
  overflow: auto;
}

.table-panel :deep(table) {
  font-size: 12px;
}

.table-panel :deep(th),
.table-panel :deep(td) {
  padding: 7px 8px;
}

.dimension-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.dimension-tabs button {
  height: 28px;
  padding: 0 9px;
  cursor: pointer;
}

.dimension-tabs button.active,
.dimension-tabs button:hover {
  color: white;
  background: var(--teal-700);
}

.chart-fill {
  height: calc(100% - 36px);
  min-height: 0;
  overflow: hidden;
}

.chart-fill :deep(.base-chart),
.analysis-panel :deep(.base-chart) {
  height: 100%;
  min-height: 0;
}

@media (max-width: 1400px) {
  :global(html),
  :global(body),
  :global(#app) {
    min-width: 1180px;
  }

  .workspace {
    grid-template-columns: var(--left-col) 10px minmax(320px, 1fr) 10px var(--right-col);
  }

  .filter-sidebar {
    grid-template-rows: repeat(3, minmax(0, 1fr));
  }

  .analysis-column {
    grid-template-rows: var(--scale-row) 10px var(--mini-row) 10px minmax(0, 1fr);
  }
}
</style>
