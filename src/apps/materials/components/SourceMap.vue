<template>
  <BaseChart :option="option" />
</template>

<script setup>
import { computed } from 'vue'
import * as echarts from 'echarts'
import BaseChart from './BaseChart.vue'
import chinaJson from '../china.json'

// 注册真实的中国地图
echarts.registerMap('china', chinaJson)

const MAP_WATERMARK_TEXT = '审图号：GS (2024) 0650 号\n地图来源：国家地理信息公共服务平台「天地图」发布的官方 GeoJSON 数据'

const createMapWatermark = () => ({
  type: 'text',
  right: 12,
  bottom: 10,
  silent: true,
  z: 100,
  style: {
    text: MAP_WATERMARK_TEXT,
    fill: 'rgba(62, 94, 93, 0.42)',
    fontSize: 10,
    fontWeight: 500,
    lineHeight: 15,
    align: 'right',
    textAlign: 'right',
    textShadowColor: 'rgba(255, 255, 255, 0.82)',
    textShadowBlur: 2
  }
})

const geoCoordMap = {
  黑龙江: [125, 46],
  吉林: [124, 43],
  辽宁: [122, 41],
  内蒙古: [111, 40],
  新疆: [85, 41],
  青海: [95, 36],
  甘肃: [100, 37],
  宁夏: [105.5, 38],
  陕西: [108, 35],
  山西: [112, 37],
  河北: [115, 38],
  北京: [116.4, 39.9],
  天津: [117.3, 39.1],
  山东: [118, 36],
  河南: [113.5, 34],
  江苏: [119.5, 32],
  安徽: [117, 32],
  浙江: [120, 29],
  福建: [118, 26],
  台湾: [121, 23.5],
  海南: [110, 19],
  广东: [113.5, 23],
  广西: [108, 24],
  云南: [102, 24.5],
  贵州: [106.5, 27],
  湖南: [112, 27],
  湖北: [112.5, 31],
  江西: [115.5, 27],
  四川: [103, 30.5],
  重庆: [107, 30],
  西藏: [89, 31.5],
  故宫: [116.4, 39.9]
}

const flowData = [
  { name: '四川', value: 30, type: '楠木' },
  { name: '云南', value: 22, type: '杉木' },
  { name: '福建', value: 18, type: '石雕' },
  { name: '河北', value: 26, type: '砖石' },
  { name: '山西', value: 15, type: '琉璃' },
  { name: '山东', value: 20, type: '石材' },
  { name: '江苏', value: 16, type: '木材' },
  { name: '浙江', value: 14, type: '木雕' },
  { name: '安徽', value: 12, type: '砖雕' },
  { name: '河南', value: 17, type: '石材' }
]

const convertLineData = (data) => data.map(item => ({
  fromName: item.name,
  toName: '故宫',
  coords: [geoCoordMap[item.name], geoCoordMap['故宫']],
  value: item.value,
  material: item.type
}))

const convertScatterData = (data) => data.map(item => ({
  name: item.name,
  value: [...geoCoordMap[item.name], item.value],
  material: item.type
}))

const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: 'rgba(98,138,138,0.28)',
    textStyle: { color: '#3E5E5D' },
    formatter(params) {
      if (params.seriesType === 'lines') {
        return `${params.data.fromName} → ${params.data.toName}<br/>来源：${params.data.material}<br/>热度：${params.data.value}`
      }
      if (Array.isArray(params.value)) {
        return `${params.name}<br/>来源强度：${params.value[2]}`
      }
      return `${params.name}`
    }
  },
  geo: {
    map: 'china',
    roam: false,
    zoom: 1.3,
    layoutCenter: ['45%', '50%'],
    layoutSize: '100%',
    itemStyle: {
      areaColor: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: '#F2F9F7' },
          { offset: 1, color: '#DDEAE8' }
        ]
      },
      borderColor: '#A0C5C0',
      borderWidth: 0.8,
      shadowColor: 'rgba(98,138,138,0.12)',
      shadowBlur: 15,
      shadowOffsetX: 1,
      shadowOffsetY: 1
    },
    emphasis: {
      itemStyle: {
        areaColor: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#E3F0EE' },
            { offset: 1, color: '#C9E2DE' }
          ]
        },
        borderColor: '#5A8280',
        borderWidth: 1.5,
        shadowColor: 'rgba(98,138,138,0.2)',
        shadowBlur: 10
      },
      label: { color: '#263D3C', fontWeight: 700 }
    },
    label: {
      show: true,
      color: 'rgba(62,94,93,0.5)',
      fontSize: 8,
      fontWeight: 500
    }
  },
  graphic: [
    {
      type: 'text',
      left: 20,
      top: 16,
      style: {
        text: '材料来源示意图',
        fill: '#3E5E5D',
        fontSize: 10,
        fontWeight: 700
      }
    },
    {
      type: 'text',
      left: 20,
      top: 32,
      style: {
        text: '以故宫为核心汇聚点',
        fill: 'rgba(62,94,93,0.7)',
        fontSize: 11
      }
    },
    createMapWatermark()
  ],
  series: [
    {
      name: '来源飞线',
      type: 'lines',
      zlevel: 2,
      coordinateSystem: 'geo',
      effect: {
        show: true,
        period: 5,
        trailLength: 0.45,
        symbol: 'arrow',
        symbolSize: 7,
        color: '#4A7B78'
      },
      lineStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#628A8A' },
            { offset: 0.5, color: '#7CB7A8' },
            { offset: 1, color: '#9CBFB9' }
          ]
        },
        width: 2,
        opacity: 0.7,
        curveness: 0.3
      },
      data: convertLineData(flowData)
    },
    {
      name: '来源散点',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 3,
      rippleEffect: { 
        brushType: 'stroke', 
        scale: 3.5,
        period: 4.5
      },
      symbolSize: val => Math.max(val[2] / 3, 8),
      itemStyle: {
        color: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.5,
          colorStops: [
            { offset: 0, color: '#ffffff' },
            { offset: 0.3, color: '#7CB7A8' },
            { offset: 1, color: '#4A7B78' }
          ]
        },
        shadowBlur: 20,
        shadowColor: 'rgba(98,138,138,0.4)',
        shadowOffsetX: 2,
        shadowOffsetY: 2
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{b}',
        color: '#3E5E5D',
        fontWeight: 600,
        fontSize: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: [1, 3],
        borderRadius: 3
      },
      data: convertScatterData(flowData)
    },
    {
      name: '核心建筑',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      symbol: 'circle',
      symbolSize: 45,
      rippleEffect: { 
        brushType: 'fill', 
        scale: 3.5,
        period: 3.5
      },
      itemStyle: {
        color: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.5,
          colorStops: [
            { offset: 0, color: '#FFFFFF' },
            { offset: 0.4, color: '#D4B48C' },
            { offset: 1, color: '#B88B5A' }
          ]
        },
        shadowBlur: 25,
        shadowColor: 'rgba(184,139,90,0.5)',
        shadowOffsetX: 0,
        shadowOffsetY: 0
      },
      label: {
        show: true,
        formatter: '故宫',
        color: '#5A3E2A',
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: [2, 4],
        borderRadius: 4
      },
      data: [{ name: '故宫', value: [...geoCoordMap['故宫'], 100] }]
    }
  ]
}))
</script>
