<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { radarIndicators, radarSeriesData, schoolDetailsByName } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

const palette = ['rgb(98, 138, 138)', 'rgb(125, 170, 166)', 'rgb(148, 193, 187)', 'rgb(173, 212, 205)', 'rgb(110, 156, 152)']

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)
  const seriesData = Object.entries(radarSeriesData).map(([name, value], index) => ({
    name,
    value,
    lineStyle: { color: palette[index % palette.length], width: 2 },
    areaStyle: { color: palette[index % palette.length], opacity: 0.14 },
    itemStyle: { color: palette[index % palette.length] }
  }))

  chart.setOption({
    color: palette,
    tooltip: { trigger: 'item' },
    legend: {
      data: Object.keys(radarSeriesData),
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: { color: 'rgb(46, 78, 78)', fontSize: 10 }
    },
    radar: {
      indicator: radarIndicators.map((name) => ({ name, max: 100 })),
      shape: 'circle',
      center: ['50%', '44%'],
      radius: '56%',
      axisName: { color: 'rgb(46, 78, 78)', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.24)' } },
      splitArea: { areaStyle: { color: ['rgba(221, 240, 238, 0.18)', 'rgba(214, 235, 232, 0.3)'] } },
      axisLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.3)' } }
    },
    series: [{ type: 'radar', data: seriesData, symbol: 'circle', symbolSize: 6 }],
    backgroundColor: 'transparent'
  })

  chart.on('click', (params) => {
    const detail = schoolDetailsByName[params.name]
    if (detail) emit('select', detail)
  })
}

onMounted(() => {
  initChart()
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
