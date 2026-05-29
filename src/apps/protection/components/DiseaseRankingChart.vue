<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

const diseaseItems = [
  { name: '开裂', severity: 92, priority: 94, impact: 88, note: '结构与节点风险最高', color: '#C9515D' },
  { name: '漏水', severity: 88, priority: 90, impact: 84, note: '最容易诱发连锁病害', color: '#E78B4D' },
  { name: '腐朽', severity: 80, priority: 83, impact: 76, note: '对木构承载影响明显', color: '#D5A65A' },
  { name: '风化', severity: 76, priority: 72, impact: 70, note: '石质与表层退化持续累积', color: '#A7CFC6' },
  { name: '人为破坏', severity: 61, priority: 68, impact: 58, note: '景区与街区干扰较突出', color: '#7AA39D' }
]

const detailMap = Object.fromEntries(
  diseaseItems.map((item) => [
    item.name,
    {
      title: `${item.name}病害`,
      subtitle: item.note,
      summary: `${item.name}在当前专题里不只看严重程度，还结合了监测优先级和影响范围，因此比单一排序更适合做处置判断。`,
      tags: ['病害排序', '监测优先级', item.name],
      facts: [
        { label: '严重程度', value: `${item.severity} / 100` },
        { label: '监测优先级', value: `${item.priority} / 100` },
        { label: '影响范围', value: `${item.impact} / 100` }
      ],
      highlights: [
        '横轴越靠右说明严重程度越高。',
        '纵轴越高说明越应该优先进入监测与处置。'
      ]
    }
  ])
)

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    animationDuration: 500,
    grid: {
      left: 20,
      right: 8,
      top: 6,
      bottom: 10
    },
    tooltip: {
      formatter: (params) => {
        const [severity, priority, impact] = params.value
        return [
          params.name,
          `严重程度 ${severity}`,
          `监测优先级 ${priority}`,
          `影响范围 ${impact}`
        ].join('<br/>')
      }
    },
    xAxis: {
      type: 'value',
      min: 50,
      max: 100,
      name: '',
      nameTextStyle: { color: 'rgba(46, 78, 78, 0.82)', fontSize: 7 },
      axisLabel: { color: 'rgba(46, 78, 78, 0.72)', fontSize: 6 },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.12)' } }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      name: '',
      nameTextStyle: { color: 'rgba(46, 78, 78, 0.82)', fontSize: 7 },
      axisLabel: { color: 'rgba(46, 78, 78, 0.72)', fontSize: 6 },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.1)' } }
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (value) => Math.max(8, value[2] * 0.18),
        data: diseaseItems.map((item) => ({
          name: item.name,
          value: [item.severity, item.priority, item.impact],
          itemStyle: {
            color: item.color,
            shadowBlur: 8,
            shadowColor: 'rgba(98, 138, 138, 0.16)'
          }
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{b}',
          color: 'rgb(46, 78, 78)',
          fontSize: 7,
          fontWeight: 600
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
  height: 96px;
}
</style>
