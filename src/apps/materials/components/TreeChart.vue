<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const treeData = {
  name: '材料修复',
  children: [
    {
      name: '材料对象',
      children: [{ name: '木材' }, { name: '砖石' }, { name: '金属' }]
    },
    {
     name: '病害诊断',
      children: [{ name: '裂缝' }, { name: '腐蚀' }, { name: '风化' }]
    },
    {
      name: '修复工法',
      children: [{ name: '清洗' }, { name: '加固' }, { name: '填补' }]
    },
    {
      name: '监测指标',
      children: [{ name: '强度' }, { name: '含水率' }, { name: '色差' }]
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
