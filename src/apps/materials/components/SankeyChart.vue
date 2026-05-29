<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    triggerOn: 'mousemove',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' }
  },
  series: [
    {
      type: 'sankey',
      left: 10,
      top: 20,
      right: 60,
      bottom: 20,
      nodeGap: 20,
      nodeWidth: 15,
      emphasis: { focus: 'adjacency' },
      data: [
        { name: '木', itemStyle: { color: '#B88B5A' } },
        { name: '砖', itemStyle: { color: '#C1977B' } },
        { name: '石', itemStyle: { color: '#8A9A9A' } },
        { name: '琉璃', itemStyle: { color: '#7CB7A8' } },
        { name: '榫卯' },
        { name: '木雕' },
        { name: '砖雕' },
        { name: '石雕' },
        { name: '彩绘' },
        { name: '屋面装饰' }
      ],
      links: [
        { source: '木', target: '榫卯', value: 95 },
        { source: '木', target: '木雕', value: 76 },
        { source: '木', target: '彩绘', value: 62 },
        { source: '砖', target: '砖雕', value: 52 },
        { source: '石', target: '石雕', value: 47 },
        { source: '琉璃', target: '屋面装饰', value: 31 }
      ],
      lineStyle: { color: 'source', curveness: 0.55, opacity: 0.35 },
      label: { color: '#3E5E5D', fontSize: 11, fontWeight: 700 }
    }
  ]
}))
</script>
