<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ratingPieData, preservationDetailsByName } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    color: ['#5E9C76', '#E6C15A', '#E78B4D', '#C9515D'],
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '60%'],
      center: ['50%', '48%'],
      data: ratingPieData,
      label: { show: true, formatter: '{b} {d}%', color: 'rgb(46, 78, 78)', fontSize: 10 },
      labelLine: { length: 10, length2: 8 },
      itemStyle: { borderRadius: 10, borderColor: 'rgba(221, 240, 238, 0.95)', borderWidth: 2 },
      emphasis: { scale: true, scaleSize: 8 }
    }]
  })

  chart.on('click', (params) => {
    const detail = preservationDetailsByName[params.name]
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
