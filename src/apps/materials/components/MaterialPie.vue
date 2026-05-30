<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const data = [
  
   { name: '裂缝', value: 29 },
  { name: '腐蚀', value: 21 },
  { name: '风化', value: 18 },
  { name: '空鼓', value: 14 },
  { name: '褪色', value: 11 },
  { name: '污染', value: 7 }
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
