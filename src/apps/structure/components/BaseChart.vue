<template>
  <div ref="chartRef" class="base-chart" />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';
import { BarChart, PieChart, RadarChart, TreeChart } from 'echarts/charts';
import { GridComponent, LegendComponent, RadarComponent, TooltipComponent } from 'echarts/components';
import { init, use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

use([
  BarChart,
  PieChart,
  RadarChart,
  TreeChart,
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
  CanvasRenderer
]);

const props = defineProps({
  option: {
    type: Object,
    required: true
  }
});

const chartRef = ref(null);
let chart;
let resizeObserver;

const renderChart = () => {
  if (!chart || !props.option) return;
  chart.resize();
  chart.setOption(toRaw(props.option), true);
};

onMounted(async () => {
  await nextTick();
  chart = init(chartRef.value);
  renderChart();
  requestAnimationFrame(() => renderChart());

  resizeObserver = new ResizeObserver(() => {
    renderChart();
  });
  resizeObserver.observe(chartRef.value);
});

watch(
  () => props.option,
  () => renderChart(),
  { deep: true }
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  chart?.dispose();
});
</script>

<style scoped>
.base-chart {
  width: 100%;
  height: 100%;
  min-height: 240px;
}
</style>
