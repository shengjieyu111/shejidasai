<template>
  <RouterLink class="portal-return-link" :to="{ name: 'home', hash: '#topic-history' }" aria-label="返回历史专题" title="返回历史专题"></RouterLink>
  <HistoryChart />
</template>

<script setup>
import HistoryChart from './components/HistoryChart.vue'
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
