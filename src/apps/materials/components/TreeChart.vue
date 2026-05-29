<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const treeData = {
  name: '建筑构件',
  children: [
    {
      name: '屋顶',
      children: [{ name: '屋脊' }, { name: '瓦件' }, { name: '琉璃饰件' }]
    },
    {
      name: '梁架',
      children: [{ name: '梁' }, { name: '枋' }, { name: '檩' }]
    },
    {
      name: '围护',
      children: [{ name: '门窗' }, { name: '墙体' }, { name: '柱础' }]
    },
    {
      name: '装饰',
      children: [{ name: '匾额' }, { name: '雕饰' }, { name: '彩绘' }]
    }
  ]
}

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
      type: 'tree',
      data: [treeData],
      left: '20%',
      right: '20%',
      top: '1%',
      bottom: '0%',
      symbol: 'emptyCircle',
      symbolSize: 8,
      orient: 'LR',
      roam: false,
      expandAndCollapse: false,
      initialTreeDepth: 2,
      lineStyle: { color: '#7CB7A8', width: 1.5, curveness: 0.45 },
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 11,
        color: '#3E5E5D',
        fontWeight: 700
      },
      leaves: {
        label: {
          position: 'right',
          align: 'left',
          fontSize: 7,
          color: '#628A8A',
          fontWeight: 500
        }
      },
      itemStyle: {
        color: '#628A8A',
        borderColor: '#D6EBE8',
        borderWidth: 1.1
      }
    }
  ]
}))
</script>
