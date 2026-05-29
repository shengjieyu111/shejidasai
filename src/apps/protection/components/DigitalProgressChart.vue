<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { digitalProgressMetrics } from './architectureData.js'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

const detailMap = {
  已三维扫描: {
    title: '三维扫描覆盖',
    subtitle: '高精度采集是数字化建档的基础层',
    summary: '三维扫描最适合建立建筑本体的精确空间底图，为后续建模、病害比对和修缮复核提供基础坐标。',
    tags: ['三维扫描', '空间底图', '基础采集'],
    facts: [
      { label: '当前比例', value: '68%' },
      { label: '展示重点', value: '重点对象已完成高精度空间采集' }
    ],
    highlights: [
      '扫描进度最高，说明基础采集阶段推进最快。',
      '它最适合用比较图来看不同数字化环节的先后差异。'
    ]
  },
  已建模: {
    title: '建模完成率',
    subtitle: '从采集走向可分析模型的关键阶段',
    summary: '建模完成率决定数字成果能否真正进入方案比对、展示交互和后续分析，是数字化深度的重要指标。',
    tags: ['三维建模', '模型资产', '分析阶段'],
    facts: [
      { label: '当前比例', value: '55%' },
      { label: '展示重点', value: '可复用三维模型仍有继续补充空间' }
    ],
    highlights: [
      '建模率低于扫描率，说明数据加工仍是当前短板。',
      '这类指标很适合和扫描进度放在同一张比较图里。'
    ]
  },
  已全景采集: {
    title: '全景采集进度',
    subtitle: '面向远程查看与公众展示的轻量化成果',
    summary: '全景采集更适合展示传播、巡查复核和远程浏览，能帮助非专业观众理解建筑空间与现场状态。',
    tags: ['全景采集', '展示传播', '远程复核'],
    facts: [
      { label: '当前比例', value: '41%' },
      { label: '展示重点', value: '展示型数字成果仍需继续完善' }
    ],
    highlights: [
      '全景采集比例最低，说明面向展示的数字成果还不够充分。',
      '它更适合用清晰的对比图来表达“相对滞后”。'
    ]
  }
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    animationDuration: 500,
    grid: {
      left: 62,
      right: 26,
      top: 18,
      bottom: 14
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const item = params[0]
        return `${item.name}<br/>完成比例 ${item.value}%`
      }
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: 'rgba(46, 78, 78, 0.72)',
        fontSize: 10,
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(98, 138, 138, 0.1)'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: digitalProgressMetrics.map((item) => item.label),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: 'rgb(46, 78, 78)',
        fontSize: 11,
        fontWeight: 600
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: 14,
        data: digitalProgressMetrics.map((item, index) => ({
          value: item.value,
          itemStyle: {
            color: ['#5E9C76', '#7FB3A6', '#A7CFC6'][index],
            borderRadius: [0, 8, 8, 0]
          },
          label: {
            show: true,
            position: 'right',
            color: 'rgb(46, 78, 78)',
            fontSize: 10,
            fontWeight: 700,
            formatter: `${item.value}%`
          }
        })),
        showBackground: true,
        backgroundStyle: {
          color: 'rgba(214, 235, 232, 0.45)',
          borderRadius: [0, 8, 8, 0]
        }
      }
    ]
  })

  chart.on('click', (params) => {
    const detail = detailMap[params.name]
    if (detail) emit('select', detail)
  })

  resizeHandler = () => chart?.resize()
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
  chart?.dispose()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 128px;
}
</style>
