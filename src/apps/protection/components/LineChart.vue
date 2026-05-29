<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { evolutionLineData, functionDetailsByName } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    color: ['rgb(98, 138, 138)', 'rgb(125, 170, 166)', 'rgb(86, 121, 121)', 'rgb(173, 212, 205)'],
    tooltip: { trigger: 'axis' },
    legend: { data: ['三维扫描率', '三维建模率', '全景采集率'], textStyle: { color: 'rgb(46, 78, 78)', fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: evolutionLineData.periods,
      axisLabel: { color: 'rgb(46, 78, 78)' },
      axisLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.4)' } }
    },
    yAxis: {
      type: 'value',
      name: '覆盖率（%）',
      nameTextStyle: { color: 'rgb(46, 78, 78)' },
      axisLabel: { color: 'rgb(46, 78, 78)' },
      splitLine: { lineStyle: { color: 'rgba(98, 138, 138, 0.16)' } }
    },
    series: [
      { name: '三维扫描率', type: 'line', data: evolutionLineData.scan, smooth: true, symbolSize: 7, lineStyle: { width: 2.5 } },
      { name: '三维建模率', type: 'line', data: evolutionLineData.model, smooth: true, symbolSize: 7, lineStyle: { width: 2.5 } },
      { name: '全景采集率', type: 'line', data: evolutionLineData.panorama, smooth: true, symbolSize: 7, lineStyle: { width: 2.5 } }
    ],
    grid: { containLabel: true, left: 12, right: 12, top: 28, bottom: 20 }
  })

  chart.on('click', (params) => {
    const detail = functionDetailsByName[params.seriesName]
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
