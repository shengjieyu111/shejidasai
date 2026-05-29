<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { fundingMetrics } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

const fundingSeries = [
  {
    name: '总投入',
    normalized: 100,
    display: fundingMetrics.total,
    hint: '累计投入规模',
    color: 'rgb(98, 138, 138)'
  },
  {
    name: '年均投入',
    normalized: 67,
    display: fundingMetrics.annualAverage,
    hint: '年度投入强度',
    color: 'rgb(125, 170, 166)'
  },
  {
    name: '单处平均',
    normalized: 46,
    display: fundingMetrics.siteAverage,
    hint: '单体对象平均投入',
    color: 'rgb(150, 196, 190)'
  },
  {
    name: '资金缺口',
    normalized: 82,
    display: fundingMetrics.gap,
    hint: '估算需求与投入差额',
    color: 'rgb(201, 81, 93)'
  }
]

const detailMap = {
  总投入: {
    title: '修缮总投入',
    subtitle: '当前专题口径下的累计资金规模',
    summary: '总投入用于判断保护工程整体资源强度，适合和资金缺口、高风险对象一起解读。',
    tags: ['总投入', '资金规模', '修缮资源'],
    facts: [
      { label: '当前值', value: fundingMetrics.total },
      { label: '图中表达', value: '标准化强度 100' }
    ],
    highlights: [
      '总投入越高，越能支撑系统性修缮与预防性保护。',
      '图中长度做了标准化处理，真实金额仍以标签为准。'
    ]
  },
  年均投入: {
    title: '年均投入',
    subtitle: '年度资金强度的简化观察值',
    summary: '年均投入适合观察近期修缮节奏是否稳定，也能和时间趋势联动分析。',
    tags: ['年均投入', '年度强度', '修缮节奏'],
    facts: [
      { label: '当前值', value: fundingMetrics.annualAverage },
      { label: '图中表达', value: '标准化强度 67' }
    ],
    highlights: [
      '年均投入能够帮助判断修缮节奏是否连续。',
      '和总投入一起看，能更快理解资金结构。'
    ]
  },
  单处平均: {
    title: '单处平均投入',
    subtitle: '单个保护对象可获得的平均资金',
    summary: '单处平均投入更适合和对象规模、病害严重度与保护层级一起分析，体现资源分配密度。',
    tags: ['单处平均', '对象强度', '资源分配'],
    facts: [
      { label: '当前值', value: fundingMetrics.siteAverage },
      { label: '图中表达', value: '标准化强度 46' }
    ],
    highlights: [
      '单处平均投入偏低时，精细化修缮压力会更明显。',
      '图中用标准化值保证四项都能被清楚看见。'
    ]
  },
  资金缺口: {
    title: '资金缺口',
    subtitle: '估算需求与当前投入之间的差额',
    summary: '资金缺口是最直接服务决策判断的指标，说明当前投入仍不足以覆盖全部修缮与监测需求。',
    tags: ['资金缺口', '决策判断', '现实压力'],
    facts: [
      { label: '当前值', value: fundingMetrics.gap },
      { label: '图中表达', value: '标准化强度 82' }
    ],
    highlights: [
      '资金缺口不是装饰型指标，而是最现实的约束条件。',
      '它应与破损、濒危和高风险点位一起解读。'
    ]
  }
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    animationDuration: 450,
    grid: {
      left: 74,
      right: 18,
      top: 18,
      bottom: 12
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = fundingSeries[params[0].dataIndex]
        return `${item.name}<br/>${item.display}<br/>${item.hint}`
      }
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: fundingSeries.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: 'rgb(46, 78, 78)',
        fontSize: 11,
        fontWeight: 600
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: fundingSeries.map((item) => ({
          value: item.normalized,
          itemStyle: {
            color: item.color,
            borderRadius: [0, 8, 8, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: 'rgb(46, 78, 78)',
            fontSize: 10,
            fontWeight: 700,
            formatter: item.display
          }
        })),
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(214, 235, 232, 0.42)',
          borderRadius: [0, 8, 8, 0]
        }
      }
    ]
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
.chart {
  width: 100%;
  height: 176px;
}
</style>
