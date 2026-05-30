<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const nodes = [
    { name: '现场勘察', x: 100, y: 110 },
  { name: '病害检测', x: 250, y: 60 },
  { name: '样品取证', x: 250, y: 160 },
  { name: '方案匹配', x: 400, y: 110 },
  { name: '小样试验', x: 550, y: 60 },
  { name: '修复施工', x: 550, y: 160 },
  { name: '性能复检', x: 700, y: 60 },
  { name: '监测回访', x: 700, y: 160 }
]

const links = [
  ['现场勘察', '病害检测'],
  ['现场勘察', '样品取证'],
  ['病害检测', '方案匹配'],
  ['样品取证', '方案匹配'],
  ['方案匹配', '小样试验'],
  ['方案匹配', '修复施工'],
  ['小样试验', '性能复检'],
  ['修复施工', '监测回访']
].map(([source, target]) => ({ source, target }))

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' }
  },
  animationDurationUpdate: 1200,
  series: [
    {
      type: 'graph',
      layout: 'none',
      coordinateSystem: null,
      roam: false,
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [4, 10],
      label: {
        show: true,
        color: '#3E5E5D',
        fontWeight: 700,
        fontSize: 12
      },
      data: nodes.map(item => ({
        ...item,
        symbol: 'roundRect',
        symbolSize: [100, 42],
        itemStyle: {
          color: '#F7FCFB',
          borderColor: '#7CB7A8',
          borderWidth: 2,
          shadowBlur: 16,
          shadowColor: 'rgba(124,183,168,0.18)'
        }
      })),
      lineStyle: {
        color: '#628A8A',
        width: 2,
        curveness: 0.12,
        opacity: 0.7
      },
      emphasis: { focus: 'adjacency' },
      links
    }
  ]
}))
</script>
