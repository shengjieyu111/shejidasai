<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'

const labels = ['燕尾榫', '抱肩榫', '粽角榫', '穿带榫', '格角榫', '龙凤榫']
const values = [88, 72, 61, 54, 43, 31]

const option = computed(() => ({
  grid: { left: 20, right: 12, top: 10, bottom: 5, containLabel: true },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' }
  },
  xAxis: {
    type: 'category',
    data: labels,
    axisLine: { lineStyle: { color: 'rgba(98,138,138,0.25)' } },
    axisTick: { show: false },
    axisLabel: { color: '#3E5E5D', interval: 0, rotate: 18, fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(98,138,138,0.12)' } },
    axisLabel: { color: '#628A8A' },
    axisLine: { show: false }
  },
  series: [
    {
      type: 'bar',
      data: values,
      barWidth: 22,
      itemStyle: {
        borderRadius: [10, 10, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#628A8A' },
          { offset: 1, color: '#D6EBE8' }
        ])
      },
      label: { show: true, position: 'top', color: '#3E5E5D', fontWeight: 700, fontSize: 11 }
    }
  ]
}))
</script>
