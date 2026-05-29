<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import { wordCloudData, glossaryDetailsByName } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null
const colors = ['rgb(98, 138, 138)', 'rgb(119, 165, 162)', 'rgb(147, 188, 184)', 'rgb(86, 121, 121)']

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { show: true },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      sizeRange: [16, 50],
      rotationRange: [-20, 20],
      gridSize: 6,
      textStyle: {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontWeight: 'bold',
        color() {
          return colors[Math.floor(Math.random() * colors.length)]
        }
      },
      emphasis: {
        textStyle: {
          shadowBlur: 12,
          shadowColor: 'rgba(98, 138, 138, 0.35)'
        }
      },
      data: wordCloudData
    }]
  })

  chart.on('click', (params) => {
    const detail = glossaryDetailsByName[params.name]
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
