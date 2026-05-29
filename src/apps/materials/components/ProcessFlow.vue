<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const nodes = [
  { name: '勘察设计', x: 100, y: 110 },
  { name: '选材备料', x: 250, y: 60 },
  { name: '木作加工', x: 250, y: 160 },
  { name: '榫卯制作', x: 400, y: 110 },
  { name: '构件拼装', x: 550, y: 60 },
  { name: '雕刻装饰', x: 550, y: 160 },
  { name: '彩绘髹饰', x: 700, y: 60 },
  { name: '修缮保护', x: 700, y: 160 }
]

const links = [
  ['勘察设计', '选材备料'],
  ['勘察设计', '木作加工'],
  ['选材备料', '榫卯制作'],
  ['木作加工', '榫卯制作'],
  ['榫卯制作', '构件拼装'],
  ['榫卯制作', '雕刻装饰'],
  ['构件拼装', '彩绘髹饰'],
  ['雕刻装饰', '修缮保护']
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
