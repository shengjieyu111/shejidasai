<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

const categories = ['彩绘', '木雕', '砖雕', '石雕', '匾额']
const values = [142, 126, 83, 64, 39]

const option = computed(() => ({
  grid: { left: 30, right: 26, top: 5, bottom: 5, containLabel: true },
  xAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(98,138,138,0.14)' } },
    axisLabel: { color: '#628A8A' },
    axisLine: { show: false },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'category',
    data: categories,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#3E5E5D', fontWeight: 700, fontSize: 11 }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' }
  },
  series: [
    {
      type: 'bar',
      data: values,
      barWidth: 16,
      showBackground: true,
      backgroundStyle: { color: 'rgba(98,138,138,0.08)', borderRadius: 10 },
      itemStyle: {
        borderRadius: [0, 10, 10, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#628A8A' },
          { offset: 0.6, color: '#7CB7A8' },
          { offset: 1, color: '#D6EBE8' }
        ])
      },
      label: {
        show: true,
        position: 'right',
        color: '#3E5E5D',
        fontWeight: 700,
        fontSize: 11
      }
    }
  ]
}))
</script>
