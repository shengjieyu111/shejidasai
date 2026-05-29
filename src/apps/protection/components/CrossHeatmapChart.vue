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

const levels = ['国保', '省保', '市保', '县保']
const diseases = ['开裂', '漏水', '风化', '腐朽', '人为破坏']

const heatmapValues = [
  [0, 0, 28], [1, 0, 36], [2, 0, 48], [3, 0, 72],
  [0, 1, 22], [1, 1, 31], [2, 1, 45], [3, 1, 69],
  [0, 2, 39], [1, 2, 48], [2, 2, 57], [3, 2, 61],
  [0, 3, 18], [1, 3, 24], [2, 3, 37], [3, 3, 56],
  [0, 4, 12], [1, 4, 18], [2, 4, 29], [3, 4, 42]
]

const detailMap = Object.fromEntries(
  heatmapValues.map(([x, y, value]) => {
    const level = levels[x]
    const disease = diseases[y]
    return [
      `${level}-${disease}`,
      {
        title: `${level} × ${disease}热区`,
        subtitle: `交叉热度值 ${value}`,
        summary: `${level}层级中的${disease}在当前交叉统计中呈现较高热度，说明这类问题并不是零散个案，而是在该层级中出现聚集。`,
        tags: ['交叉分析', level, disease],
        facts: [
          { label: '保护层级', value: level },
          { label: '病害类型', value: disease },
          { label: '热度值', value: String(value) }
        ],
        highlights: [
          '热度越高，说明这一类对象越适合进入优先巡检和治理名单。',
          '交叉热力图强调的是结构性分布，而不是单点案例。'
        ]
      }
    ]
  })
)

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    animationDuration: 500,
    grid: {
      left: 52,
      right: 10,
      top: 8,
      bottom: 10,
      containLabel: true
    },
    tooltip: {
      formatter: (params) => {
        const [x, y, value] = params.data
        return `${levels[x]} × ${diseases[y]}<br/>交叉热度 ${value}`
      }
    },
    xAxis: {
      type: 'category',
      data: levels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: 'rgb(46, 78, 78)', fontSize: 9 }
    },
    yAxis: {
      type: 'category',
      data: diseases,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: 'rgb(46, 78, 78)',
        fontSize: 8,
        lineHeight: 10
      }
    },
    visualMap: {
      min: 10,
      max: 75,
      show: false,
      inRange: {
        color: ['#E7F3F0', '#8FB9B0', '#C9515D']
      }
    },
    series: [
      {
        type: 'heatmap',
        data: heatmapValues,
        label: {
          show: true,
          color: 'rgb(46, 78, 78)',
          fontSize: 8,
          formatter: ({ data }) => data[2]
        },
        itemStyle: {
          borderRadius: 6,
          borderColor: 'rgba(221, 240, 238, 0.92)',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: 'rgba(46, 78, 78, 0.18)'
          }
        }
      }
    ]
  })

  chart.on('click', (params) => {
    const [x, y] = params.data
    const detail = detailMap[`${levels[x]}-${diseases[y]}`]
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
  height: 104px;
}
</style>
