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
           { name: '裂缝', itemStyle: { color: '#B88B5A' } },
        { name: '腐蚀', itemStyle: { color: '#C1977B' } },
        { name: '风化', itemStyle: { color: '#8A9A9A' } },
        { name: '褪色', itemStyle: { color: '#7CB7A8' } },
        { name: '木材' },
        { name: '砖石' },
        { name: '金属' },
        { name: '彩绘层' },
        { name: '结构加固' },
        { name: '表面防护' }
      ],
      links: [
        { source: '裂缝', target: '木材', value: 84 },
        { source: '裂缝', target: '结构加固', value: 68 },
        { source: '腐蚀', target: '金属', value: 56 },
        { source: '腐蚀', target: '表面防护', value: 47 },
        { source: '风化', target: '砖石', value: 73 },
        { source: '褪色', target: '彩绘层', value: 39 }
      ],
      lineStyle: { color: 'source', curveness: 0.55, opacity: 0.35 },
      label: { color: '#3E5E5D', fontSize: 11, fontWeight: 700 }
    }
  ]
}))
</script>
