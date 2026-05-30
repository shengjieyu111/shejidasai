<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

const years = ['检测建档', '材料试验', '现场修复', '养护固化', '复检回访']
const values = [64, 82, 118, 76, 58]

const option = computed(() => ({
  grid: { left: 30, right: 24, top: 25, bottom: 8, containLabel: true },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' }
  },
  xAxis: {
    type: 'category',
    data: years,
    axisLabel: { color: '#3E5E5D', fontSize: 11 },
    axisLine: { lineStyle: { color: 'rgba(98,138,138,0.25)' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(98,138,138,0.12)' } },
    axisLabel: { color: '#628A8A', fontSize: 9 },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: values,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 3, color: '#628A8A' },
      itemStyle: { color: '#7CB7A8', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(124,183,168,0.50)' },
          { offset: 1, color: 'rgba(214,235,232,0.10)' }
        ])
      },
      label: { show: true, color: '#3E5E5D', fontSize: 11 }
    }
  ]
}))
</script>
