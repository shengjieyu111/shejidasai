<template>
  <div ref="chartRef" class="chart-box"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  option: { type: Object, required: true },
  theme: { type: [String, Object], default: null },
  autoresize: { type: Boolean, default: true }
})

const chartRef = ref(null)
let chart = null
let resizeObserver = null

const renderChart = () => {
  if (!chartRef.value) return
  if (!chart) {
    chart = echarts.init(chartRef.value, props.theme)
  }
  chart.setOption(props.option, true)
}

onMounted(() => {
  renderChart()
  if (props.autoresize) {
    resizeObserver = new ResizeObserver(() => chart?.resize())
    resizeObserver.observe(chartRef.value)
    window.addEventListener('resize', resizeHandler)
  }
})

const resizeHandler = () => chart?.resize()

watch(() => props.option, () => {
  renderChart()
}, { deep: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>
