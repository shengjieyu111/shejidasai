<template>
  <div ref="chartRef" class="chart"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'

const emit = defineEmits(['select'])
const chartRef = ref(null)
let chart = null
let resizeHandler = null

const riskRows = [
  { name: '开裂高风险点', count: 82, severity: 92 },
  { name: '漏水高风险点', count: 63, severity: 86 },
  { name: '风化高风险点', count: 41, severity: 72 },
  { name: '腐朽高风险点', count: 28, severity: 78 }
]

const detailMap = {
  开裂高风险点: {
    title: '开裂高风险点位',
    subtitle: '结构与节点风险最高的一类预警对象',
    summary: '开裂类点位数量最多，且严重度最高，通常会被排在风险响应的第一优先级。',
    tags: ['开裂', '结构预警', '优先处置'],
    facts: [
      { label: '高风险点位', value: '82 个' },
      { label: '严重度', value: '92 / 100' }
    ],
    highlights: [
      '适合与裂缝扩展记录、位移监测一起联动阅读。',
      '这类风险对象通常最需要先行预警与快速干预。'
    ]
  },
  漏水高风险点: {
    title: '漏水高风险点位',
    subtitle: '最容易诱发连锁病害的围护问题',
    summary: '漏水会带动腐朽、彩画老化和表面污染等次生问题，因此在修缮投入中往往具有较高优先级。',
    tags: ['漏水', '围护系统', '连锁病害'],
    facts: [
      { label: '高风险点位', value: '63 个' },
      { label: '严重度', value: '86 / 100' }
    ],
    highlights: [
      '屋面巡查和漏水点位一起展示时最容易形成决策闭环。',
      '它既是风险问题，也是修缮见效最快的一类问题。'
    ]
  },
  风化高风险点: {
    title: '风化高风险点位',
    subtitle: '石质表层退化的重点监测对象',
    summary: '风化点位主要反映石质遗产和外露表面构件的长期退化趋势，适合与微环境数据一起解释。',
    tags: ['风化', '石质遗产', '环境压力'],
    facts: [
      { label: '高风险点位', value: '41 个' },
      { label: '严重度', value: '72 / 100' }
    ],
    highlights: [
      '风化扩展速度通常偏慢，但累积后果较明显。',
      '很适合用时间序列和表面采集结果做联合展示。'
    ]
  },
  腐朽高风险点: {
    title: '腐朽高风险点位',
    subtitle: '木构材料老化与潮湿叠加下的隐性风险',
    summary: '腐朽点位数量不是最多，但进入承重构件后会迅速抬升风险等级，因此更依赖材料检测和含水率判断。',
    tags: ['腐朽', '木构材料', '隐性风险'],
    facts: [
      { label: '高风险点位', value: '28 个' },
      { label: '严重度', value: '78 / 100' }
    ],
    highlights: [
      '腐朽往往和潮湿、漏水等问题共同出现。',
      '它适合与构件更换策略和局部修缮方案一起联动。'
    ]
  }
}

function buildConnectorSeries() {
  return riskRows.map((item) => ({
    type: 'line',
    name: `${item.name}-连接`,
    data: [
      [item.count, item.name],
      [item.severity, item.name]
    ],
    symbol: 'none',
    lineStyle: {
      color: 'rgba(98, 138, 138, 0.4)',
      width: 3
    },
    silent: false,
    tooltip: { show: false }
  }))
}

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption({
    animationDuration: 450,
    grid: {
      left: 86,
      right: 22,
      top: 18,
      bottom: 22
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const detail = riskRows.find((item) => item.name === params.name)
        if (!detail) return params.name
        return [
          params.name,
          `点位数量 ${detail.count}`,
          `严重度 ${detail.severity}`
        ].join('<br/>')
      }
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        color: 'rgba(46, 78, 78, 0.75)',
        fontSize: 9
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(98, 138, 138, 0.12)'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: riskRows.map((item) => item.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: 'rgb(46, 78, 78)',
        fontSize: 10,
        fontWeight: 600
      }
    },
    series: [
      ...buildConnectorSeries(),
      {
        type: 'scatter',
        name: '点位数量',
        data: riskRows.map((item) => [item.count, item.name]),
        symbolSize: 12,
        itemStyle: {
          color: '#E6C15A',
          borderColor: '#fff6d6',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'left',
          color: 'rgb(46, 78, 78)',
          fontSize: 9,
          formatter: ({ value }) => `${value[0]}`
        }
      },
      {
        type: 'scatter',
        name: '严重度',
        data: riskRows.map((item) => [item.severity, item.name]),
        symbolSize: 14,
        itemStyle: {
          color: '#C9515D',
          borderColor: '#ffd9dd',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'right',
          color: 'rgb(46, 78, 78)',
          fontSize: 9,
          formatter: ({ value }) => `${value[0]}`
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
  height: 152px;
}
</style>
