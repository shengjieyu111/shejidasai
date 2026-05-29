<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const data = [
  { name: '木', value: 38 },
  { name: '砖', value: 22 },
  { name: '石', value: 16 },
  { name: '土', value: 12 },
  { name: '琉璃', value: 8 },
  { name: '其他', value: 4 }
]

const option = computed(() => ({
  color: ['#628A8A', '#C1977B', '#8A9A9A', '#D6EBE8', '#7CB7A8', '#B88B5A'],
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' }
  },

  series: [
    {
      type: 'pie',
      radius: ['15%', '95%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 3,
        borderRadius: 10
      },
      label: {
        show: true,
        position: 'outside',
        align: 'center',
        baseline: 'middle',
        color: '#3E5E5D',
        formatter: '{b|{b}}\n{c|{d}%}',
        rich: {
          b: { fontSize: 7, fontWeight: 700, lineHeight: 8 },
          c: { fontSize: 7, color: '#628A8A', lineHeight: 8 }
        }
      },
      labelLine: {
        length: 5,
        length2: 10,
        smooth: true,
        lineStyle: { color: 'rgba(98,138,138,0.6)' }
      },
      data
    }
  ]
}))
</script>
