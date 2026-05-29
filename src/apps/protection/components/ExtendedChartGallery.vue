<template>
  <section class="gallery-shell">
    <div class="gallery-toolbar">
      <button
        v-for="item in chartCatalog"
        :key="item.key"
        type="button"
        class="gallery-pill"
        :class="{ active: item.key === activeKey }"
        @click="activeKey = item.key"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="gallery-layout">
      <div class="gallery-stage">
        <div ref="chartRef" class="chart"></div>
      </div>
      <aside class="gallery-note">
        <span>{{ currentChart.category }}</span>
        <h3>{{ currentChart.label }}</h3>
        <p>{{ currentChart.description }}</p>
        <div class="note-grid">
          <article class="note-card">
            <strong>可读取的数据关系</strong>
            <p>{{ currentChart.dataStory }}</p>
          </article>
          <article class="note-card">
            <strong>适合落在哪个板块</strong>
            <p>{{ currentChart.bestUse }}</p>
          </article>
        </div>
        <ul>
          <li v-for="item in currentChart.points" :key="item">{{ item }}</li>
        </ul>
        <div class="insight-block">
          <strong>可直接讲出的洞察</strong>
          <p>{{ currentChart.insight }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref(null)
const activeKey = ref('bullet')
let chart = null
let resizeHandler = null

const chartCatalog = [
  {
    key: 'bullet',
    label: '子弹图',
    category: '比较与目标',
    description: '把当前值、目标值和警戒线放到同一尺度里，最适合讲“推进到了哪一步，还差多少”。',
    dataStory: '把修缮完成度、监测覆盖率和数字建模率放在同一读法中，观众会更容易看出哪些环节已经接近目标，哪些还停留在警戒区。',
    bestUse: '适合放在数字化推进页或年度执行页，充当“结果判断”卡。',
    insight: '如果扫描率已经较高、建模率仍低于警戒线，就能直接说明问题不在采集端，而在成果加工和转化端。',
    points: ['同一视图里同时比较现状、目标与阈值。', '比普通柱状图更适合讲“完成度是否达标”。']
  },
  {
    key: 'dumbbell',
    label: '哑铃图',
    category: '差值比较',
    description: '强调两组数之间的差距，而不是单独展示绝对值，适合讲修缮前后、国保与县保、投入与缺口的距离。',
    dataStory: '把高等级与基层对象放到同一轴线时，差值本身就会变成结论，尤其适合解释资源响应不均衡。',
    bestUse: '适合放在层级结构分析页，突出“资源差距”和“状态差距”。',
    insight: '当两端距离明显拉开时，观众会自然理解为什么同一套保护策略不能平均分配。',
    points: ['差值比绝对值更醒目。', '很适合做层级或区域的对照表达。']
  },
  {
    key: 'parallel',
    label: '平行坐标图',
    category: '多指标画像',
    description: '一次性比较多维指标，适合展示不同遗产类型在病害、环境、监测、资金上的组合特征。',
    dataStory: '不是看单个分数高低，而是看整条折线经过哪些高值区，从而判断类型风险画像。',
    bestUse: '适合放在风险类型分析页，作为雷达图的补充版。',
    insight: '如果某类对象同时在环境压力和修缮需求上偏高，就很适合被定义为“复合高压类型”。',
    points: ['适合联合判断，不只看单项指标。', '能快速找出多维同时偏高的对象。']
  },
  {
    key: 'sunburst',
    label: '旭日图',
    category: '层级展开',
    description: '把层级关系逐层展开，适合展示文保等级与保存状态之间的嵌套结构。',
    dataStory: '从整体到局部一层层往里看，最容易把“层级差异”和“状态落点”讲成一套结构故事。',
    bestUse: '适合放在保存现状或层级结构的展开页，承担“结构总览”的作用。',
    insight: '如果县保层里破损和濒危扇区更厚，就能非常直观地说明基层对象承压更集中。',
    points: ['适合从总体结构读到局部结构。', '层级嵌套关系会比普通饼图更有解释力。']
  },
  {
    key: 'treemap',
    label: '矩形树图',
    category: '结构占比',
    description: '用面积表达占比，适合展示不同类型对象在整体风险池中的份额大小。',
    dataStory: '当某类对象面积明显更大时，观众会先感知“哪一类是主要盘子”，再进一步看内部差异。',
    bestUse: '适合放在类型结构页或病害结构页，讲清楚主导对象是谁。',
    insight: '如果木构和古城街区占据更大面积，就能自然引出后续风险和资金为什么优先围绕它们展开。',
    points: ['面积编码很直观。', '适合和病害或等级标签并置展示。']
  },
  {
    key: 'waterfall',
    label: '瀑布图',
    category: '过程拆解',
    description: '最适合解释总预算如何一步步被修缮、监测、数字化和应急响应消耗掉。',
    dataStory: '把总量拆成多个流向后，资金缺口就不再只是一个结果，而是一个逐步形成的过程。',
    bestUse: '适合放在投入与缺口页，让“为什么还不够”说得更清楚。',
    insight: '如果常规修护和监测已经消耗掉大部分预算，数字化和应急加固就会天然挤压后续空间。',
    points: ['特别适合讲资金结构。', '能把“缺口”变成一个可解释的过程。']
  },
  {
    key: 'heatmap',
    label: '热力图',
    category: '交叉分布',
    description: '适合展示病害类型与保护层级交叉后的高密度区域，回答“问题最集中出现在哪一组”。',
    dataStory: '颜色越深代表问题越密集，能快速找到最值得优先展开分析的交叉象限。',
    bestUse: '适合放在病害展开页，作为排序图之外的结构补充。',
    insight: '如果县保对象在开裂和漏水上出现连续深色区，就能支持“基层对象更需要预防性维护”的判断。',
    points: ['颜色非常适合表达高低密度。', '很适合看多类别交叉关系。']
  },
  {
    key: 'scatter',
    label: '散点图',
    category: '相关关系',
    description: '适合观察投入强度与风险指数、数字化程度与监测覆盖之间是否存在联动关系。',
    dataStory: '点的位置决定关系方向，点的大小还能再编码对象规模或修缮紧迫度。',
    bestUse: '适合放在资金与风险联动页，承担“关联判断”的角色。',
    insight: '如果低投入却高风险的点集中在高风险区之外，就能直接识别出最值得优先补资源的对象。',
    points: ['适合判断正相关、负相关和异常点。', '可以同时编码点大小，增强信息密度。']
  },
  {
    key: 'sankey',
    label: '桑基图',
    category: '流程流向',
    description: '把病害识别、风险预警、修缮计划、数字建模和资金安排连成一条流向链，非常适合做“管理闭环”表达。',
    dataStory: '它不是单纯展示数量，而是讲清楚数据怎样一步步流向行动。',
    bestUse: '适合放在关键发现页，作为整页叙事的收束图。',
    insight: '如果很多预警最终没有顺利流向修缮计划，观众会立刻意识到问题卡在响应机制而不是监测发现。',
    points: ['特别适合展示流程和流向。', '能把多环节关系讲得很清楚。']
  },
  {
    key: 'radialBar',
    label: '环形柱状图',
    category: '紧凑概览',
    description: '适合把几个核心指标压缩到一张圆形概览图中，形成更像专题展板的视觉焦点。',
    dataStory: '不同长度的圆弧会把“谁领先、谁滞后”展示得很直观，非常适合作为概览结论。',
    bestUse: '适合放在首页英雄区或弹层页眉，作为快速概览图。',
    insight: '如果监测与扫描都较高、全景显著偏短，就能很快说明当前系统更偏管理采集端，而展示转译仍弱。',
    points: ['很适合单页看板。', '视觉上更像专题展陈图形。']
  }
]

const currentChart = computed(
  () => chartCatalog.find((item) => item.key === activeKey.value) ?? chartCatalog[0]
)

const buildOptions = {
  bullet: () => ({
    grid: { left: 28, right: 30, top: 20, bottom: 16, containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.12)' } },
      axisLabel: { color: 'rgb(46, 78, 78)' }
    },
    yAxis: {
      type: 'category',
      data: ['修缮完成度', '监测覆盖率', '数字建模率'],
      axisLabel: { color: 'rgb(46, 78, 78)', fontSize: 11 },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'bar',
        data: [78, 73, 55],
        barWidth: 16,
        itemStyle: { color: 'rgba(214, 235, 232, 0.95)', borderRadius: 10 },
        z: 1
      },
      {
        type: 'bar',
        data: [64, 73, 55],
        barWidth: 10,
        itemStyle: { color: 'rgb(98, 138, 138)', borderRadius: 10 },
        z: 3
      },
      {
        type: 'scatter',
        symbol: 'rect',
        symbolSize: [3, 20],
        data: [[82, 0], [78, 1], [68, 2]],
        itemStyle: { color: 'rgb(201, 81, 93)' },
        z: 4
      }
    ]
  }),
  dumbbell: () => ({
    grid: { left: 36, right: 28, top: 20, bottom: 16, containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: 'rgb(46, 78, 78)' },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.12)' } }
    },
    yAxis: {
      type: 'category',
      data: ['国保', '省保', '市保', '县保'],
      axisLabel: { color: 'rgb(46, 78, 78)' },
      axisTick: { show: false },
      axisLine: { show: false }
    },
    series: [
      {
        type: 'custom',
        renderItem(params, api) {
          const y = api.coord([0, params.dataIndex])[1]
          const start = api.coord([api.value(0), params.dataIndex])[0]
          const end = api.coord([api.value(1), params.dataIndex])[0]
          return {
            type: 'line',
            shape: { x1: start, y1: y, x2: end, y2: y },
            style: { stroke: 'rgba(98, 138, 138, 0.28)', lineWidth: 3 }
          }
        },
        data: [
          [72, 41],
          [64, 46],
          [53, 39],
          [41, 28]
        ]
      },
      {
        type: 'scatter',
        data: [72, 64, 53, 41],
        symbolSize: 12,
        itemStyle: { color: 'rgb(98, 138, 138)' }
      },
      {
        type: 'scatter',
        data: [41, 46, 39, 28],
        symbolSize: 12,
        itemStyle: { color: 'rgb(201, 81, 93)' }
      }
    ]
  }),
  parallel: () => ({
    parallelAxis: [
      { dim: 0, name: '病害风险', nameTextStyle: { color: 'rgb(46, 78, 78)' }, axisLabel: { color: 'rgb(46, 78, 78)' } },
      { dim: 1, name: '环境压力', nameTextStyle: { color: 'rgb(46, 78, 78)' }, axisLabel: { color: 'rgb(46, 78, 78)' } },
      { dim: 2, name: '监测覆盖', nameTextStyle: { color: 'rgb(46, 78, 78)' }, axisLabel: { color: 'rgb(46, 78, 78)' } },
      { dim: 3, name: '投入强度', nameTextStyle: { color: 'rgb(46, 78, 78)' }, axisLabel: { color: 'rgb(46, 78, 78)' } }
    ],
    parallel: {
      left: 30,
      right: 30,
      top: 28,
      bottom: 20,
      parallelAxisDefault: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.26)' } }
      }
    },
    series: [
      {
        type: 'parallel',
        lineStyle: { width: 3, color: 'rgb(98, 138, 138)' },
        data: [[92, 74, 82, 68], [95, 90, 78, 62], [78, 83, 69, 48]]
      }
    ]
  }),
  sunburst: () => ({
    series: [{
      type: 'sunburst',
      radius: ['18%', '90%'],
      sort: null,
      itemStyle: { borderWidth: 2, borderColor: 'rgba(221, 240, 238, 0.9)' },
      label: { color: 'rgb(46, 78, 78)', rotate: 'radial', fontSize: 11 },
      data: [
        {
          name: '国保',
          children: [
            { name: '完好', value: 188 },
            { name: '一般', value: 141 },
            { name: '破损', value: 82 },
            { name: '濒危', value: 28 }
          ]
        },
        {
          name: '县保',
          children: [
            { name: '完好', value: 3200 },
            { name: '一般', value: 4100 },
            { name: '破损', value: 2100 },
            { name: '濒危', value: 1100 }
          ]
        }
      ]
    }]
  }),
  treemap: () => ({
    series: [{
      type: 'treemap',
      roam: false,
      breadcrumb: { show: false },
      label: { color: 'rgb(46, 78, 78)', fontSize: 11 },
      itemStyle: {
        borderColor: 'rgba(221, 240, 238, 0.9)',
        borderWidth: 2,
        gapWidth: 2
      },
      data: [
        { name: '木构古建', value: 38 },
        { name: '石窟寺石刻', value: 26 },
        { name: '古城街区', value: 18 },
        { name: '园林建筑', value: 12 },
        { name: '近现代建筑', value: 6 }
      ]
    }]
  }),
  waterfall: () => ({
    grid: { left: 24, right: 20, top: 22, bottom: 18, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['年度预算', '常规修护', '监测系统', '数字建模', '应急加固', '资金缺口'],
      axisLabel: { color: 'rgb(46, 78, 78)', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: 'rgb(46, 78, 78)' },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.12)' } }
    },
    series: [
      {
        type: 'bar',
        stack: 'sum',
        silent: true,
        itemStyle: { color: 'transparent' },
        emphasis: { itemStyle: { color: 'transparent' } },
        data: [0, 126, 88, 63, 45, 0]
      },
      {
        type: 'bar',
        stack: 'sum',
        data: [126, -38, -25, -18, -15, -30],
        itemStyle: {
          color: (params) => (params.data >= 0 ? 'rgb(98, 138, 138)' : 'rgb(201, 81, 93)'),
          borderRadius: [8, 8, 0, 0]
        }
      }
    ]
  }),
  heatmap: () => ({
    grid: { left: 48, right: 20, top: 20, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['国保', '省保', '市保', '县保'],
      axisLabel: { color: 'rgb(46, 78, 78)' }
    },
    yAxis: {
      type: 'category',
      data: ['开裂', '漏水', '风化', '腐朽', '人为破坏'],
      axisLabel: { color: 'rgb(46, 78, 78)' }
    },
    visualMap: {
      min: 10,
      max: 90,
      show: false,
      inRange: { color: ['rgb(221, 240, 238)', 'rgb(98, 138, 138)', 'rgb(201, 81, 93)'] }
    },
    series: [{
      type: 'heatmap',
      label: { show: true, color: 'rgb(46, 78, 78)', fontSize: 10 },
      data: [
        [0, 0, 28], [1, 0, 34], [2, 0, 46], [3, 0, 72],
        [0, 1, 22], [1, 1, 38], [2, 1, 48], [3, 1, 69],
        [0, 2, 40], [1, 2, 55], [2, 2, 58], [3, 2, 61],
        [0, 3, 18], [1, 3, 25], [2, 3, 37], [3, 3, 56],
        [0, 4, 12], [1, 4, 19], [2, 4, 26], [3, 4, 42]
      ]
    }]
  }),
  scatter: () => ({
    grid: { left: 28, right: 18, top: 18, bottom: 24, containLabel: true },
    xAxis: {
      type: 'value',
      name: '投入强度',
      nameTextStyle: { color: 'rgb(46, 78, 78)' },
      axisLabel: { color: 'rgb(46, 78, 78)' },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.12)' } }
    },
    yAxis: {
      type: 'value',
      name: '风险指数',
      nameTextStyle: { color: 'rgb(46, 78, 78)' },
      axisLabel: { color: 'rgb(46, 78, 78)' },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.12)' } }
    },
    series: [{
      type: 'scatter',
      symbolSize: (val) => val[2],
      data: [
        [72, 38, 22],
        [61, 52, 18],
        [48, 68, 25],
        [36, 82, 28],
        [55, 46, 16]
      ],
      itemStyle: { color: 'rgb(98, 138, 138)' }
    }]
  }),
  sankey: () => ({
    series: [{
      type: 'sankey',
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
      lineStyle: { color: 'gradient', curveness: 0.4 },
      label: { color: 'rgb(46, 78, 78)', fontSize: 11 },
      data: [
        { name: '病害识别' },
        { name: '风险预警' },
        { name: '修缮计划' },
        { name: '数字建模' },
        { name: '资金投入' },
        { name: '应急加固' }
      ],
      links: [
        { source: '病害识别', target: '风险预警', value: 8 },
        { source: '风险预警', target: '修缮计划', value: 6 },
        { source: '风险预警', target: '应急加固', value: 3 },
        { source: '修缮计划', target: '资金投入', value: 5 },
        { source: '数字建模', target: '修缮计划', value: 4 }
      ]
    }]
  }),
  radialBar: () => ({
    angleAxis: {
      type: 'category',
      data: ['扫描', '建模', '全景', '监测'],
      axisLabel: { color: 'rgb(46, 78, 78)', fontSize: 11 }
    },
    radiusAxis: { show: false },
    polar: {},
    series: [{
      type: 'bar',
      data: [68, 55, 41, 73],
      coordinateSystem: 'polar',
      roundCap: true,
      barWidth: 18,
      itemStyle: {
        color: (params) => ['rgb(98, 138, 138)', 'rgb(125, 170, 166)', 'rgb(150, 196, 190)', 'rgb(201, 81, 93)'][params.dataIndex]
      },
      label: {
        show: true,
        position: 'middle',
        formatter: '{c}%',
        color: 'rgb(46, 78, 78)'
      }
    }]
  })
}

const renderChart = () => {
  if (!chart) return
  const option = buildOptions[activeKey.value]?.() ?? {}
  chart.clear()
  chart.setOption(option, true)
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  renderChart()
  resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)
})

watch(activeKey, () => {
  renderChart()
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  chart?.dispose()
})
</script>

<style scoped>
.gallery-shell {
  display: grid;
  gap: 14px;
}

.gallery-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gallery-pill {
  border: 1px solid rgba(98, 138, 138, 0.2);
  background: rgba(214, 235, 232, 0.7);
  color: rgb(46, 78, 78);
  border-radius: 999px;
  padding: 7px 12px;
  cursor: pointer;
  font-size: 0.8rem;
}

.gallery-pill.active {
  background: rgb(98, 138, 138);
  color: white;
}

.gallery-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.8fr);
  gap: 14px;
  min-height: 0;
}

.gallery-stage,
.gallery-note {
  border-radius: 20px;
  border: 1px solid rgba(98, 138, 138, 0.12);
  background: rgba(214, 235, 232, 0.45);
}

.gallery-stage {
  padding: 12px;
}

.gallery-note {
  padding: 16px;
}

.gallery-note span {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(98, 138, 138, 0.14);
  color: rgb(98, 138, 138);
  font-size: 0.72rem;
}

.gallery-note h3 {
  margin-top: 10px;
  font-size: 1.08rem;
  color: rgb(46, 78, 78);
}

.gallery-note p {
  margin-top: 8px;
  font-size: 0.84rem;
  line-height: 1.55;
  color: rgba(46, 78, 78, 0.88);
}

.note-grid {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.note-card,
.insight-block {
  padding: 12px;
  border-radius: 16px;
  background: rgba(221, 240, 238, 0.82);
  border: 1px solid rgba(98, 138, 138, 0.12);
}

.note-card strong,
.insight-block strong {
  color: rgb(46, 78, 78);
  font-size: 0.82rem;
}

.note-card p,
.insight-block p {
  margin-top: 6px;
}

.gallery-note ul {
  margin-top: 12px;
  padding-left: 18px;
  color: rgba(46, 78, 78, 0.88);
  line-height: 1.55;
  font-size: 0.82rem;
}

.insight-block {
  margin-top: 12px;
  background: rgba(255, 235, 231, 0.72);
  border-color: rgba(201, 81, 93, 0.12);
}

.chart {
  width: 100%;
  height: 420px;
}

@media (max-width: 980px) {
  .gallery-layout {
    grid-template-columns: 1fr;
  }

  .chart {
    height: 320px;
  }
}
</style>
