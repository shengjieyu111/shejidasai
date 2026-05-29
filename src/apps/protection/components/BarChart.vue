<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { popularityData } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

const detailMap = {
  国保: {
    title: '国保数量结构',
    subtitle: '本地全国重点文物保护单位试用数据直接可见层',
    summary: '国保层级在当前页面中直接对应本地样本数据，可作为保护层级结构的最高等级基准。',
    tags: ['国保', '分级结构', '本地样本'],
    facts: [
      { label: '当前口径', value: '本地样本可直接读取 439 条' },
      { label: '展示适合', value: '柱状图、对比图、结构图' }
    ],
    highlights: [
      '国保层级是页面中最直接、最真实的数据底座。',
      '其余层级用于补足完整的保护结构叙事。'
    ]
  },
  省保: {
    title: '省保数量结构',
    subtitle: '保护层级中的区域级主体',
    summary: '省保对象通常数量更大，也更能体现区域文化遗产保护的广泛性。',
    tags: ['省保', '区域保护', '结构对比'],
    facts: [
      { label: '展示适合', value: '柱状图、环形图、等级结构图' },
      { label: '现实意义', value: '体现区域层级保护资源压力' }
    ],
    highlights: [
      '省保最适合与国保、市保一起展示层级结构。',
      '它是现实管理中最具规模感的一层。'
    ]
  },
  市保: {
    title: '市保数量结构',
    subtitle: '城市日常文化遗产保护的中间层',
    summary: '市保对象往往更接近城市日常管理和更新现实，是保护体系中的承上启下层。',
    tags: ['市保', '城市保护', '管理层级'],
    facts: [
      { label: '展示适合', value: '结构图、分布图、比较图' },
      { label: '现实意义', value: '反映城市管理中的遗产覆盖面' }
    ],
    highlights: [
      '市保层级能把遗产保护和城市更新连接起来。',
      '适合与活化利用和风险分布同时展示。'
    ]
  },
  县保: {
    title: '县保数量结构',
    subtitle: '基层遗产保护体系中的广覆盖对象',
    summary: '县保数量通常最多，最能体现基层保护对象的广泛分布和管理难度。',
    tags: ['县保', '基层保护', '广覆盖'],
    facts: [
      { label: '展示适合', value: '柱状图、热力图、分级地图' },
      { label: '现实意义', value: '反映基层资源分散与管理压力' }
    ],
    highlights: [
      '县保是保护体系中最具规模感的一层。',
      '它特别适合和风险预警分布一起解释。'
    ]
  }
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    color: ['rgb(98, 138, 138)'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: popularityData.map((item) => item.name),
      axisLabel: { color: 'rgb(46, 78, 78)', fontWeight: 'bold', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.4)' } }
    },
    yAxis: {
      type: 'value',
      name: '保护单位数量（处）',
      nameTextStyle: { color: 'rgb(46, 78, 78)' },
      axisLabel: { color: 'rgb(46, 78, 78)' },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.16)' } }
    },
    series: [{
      name: '文保等级',
      type: 'bar',
      data: popularityData.map((item) => item.value),
      itemStyle: { borderRadius: [8, 8, 0, 0], color: 'rgb(98, 138, 138)' },
      emphasis: { itemStyle: { color: 'rgb(125, 170, 166)' } },
      label: { show: true, position: 'top', color: 'rgb(46, 78, 78)', fontSize: 10 }
    }],
    grid: { containLabel: true, top: 26, bottom: 20, left: 10, right: 8 }
  })

  chart.on('click', (params) => {
    const detail = detailMap[params.name]
    if (detail) emit('select', detail)
  })

  resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  chart?.dispose()
})
</script>

<style scoped>
.chart { width: 100%; height: 360px; }
</style>
