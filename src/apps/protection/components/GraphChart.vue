<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { relationshipGraphData, networkDetailsByName } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    color: ['rgb(98, 138, 138)', 'rgb(147, 188, 184)', 'rgb(86, 121, 121)', 'rgb(173, 212, 205)'],
    tooltip: { formatter: (params) => params.data.name },
    legend: {
      data: relationshipGraphData.categories.map((item) => item.name),
      orient: 'vertical',
      left: 'left',
      textStyle: { color: 'rgb(46, 78, 78)', fontSize: 11 }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      force: { repulsion: 260, edgeLength: 90, gravity: 0.08 },
      data: relationshipGraphData.nodes,
      links: relationshipGraphData.links,
      categories: relationshipGraphData.categories,
      label: { show: true, position: 'right', fontSize: 11, color: 'rgb(46, 78, 78)' },
      edgeSymbol: ['none', 'arrow'],
      lineStyle: { color: 'rgba(98, 138, 138, 0.45)', curveness: 0.24, width: 1.4 },
      itemStyle: { borderColor: 'rgba(221, 240, 238, 0.95)', borderWidth: 1.2 },
      emphasis: { focus: 'adjacency', lineStyle: { width: 2 } }
    }]
  })

  chart.on('click', (params) => {
    const nodeName = params?.data?.name
    const detail = networkDetailsByName[nodeName]
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
.chart { width: 100%; height: 400px; }
</style>
