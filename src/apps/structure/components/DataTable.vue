<template>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>建筑名称</th>
          <th>地区</th>
          <th>朝代</th>
          <th>类型</th>
          <th>屋顶</th>
          <th>高度</th>
          <th>面宽</th>
          <th>进深</th>
          <th>面积</th>
          <th>层数</th>
          <th>结构</th>
          <th>斗拱</th>
          <th>走兽</th>
          <th>来源</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in rows" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.province }} · {{ item.city }}</td>
          <td>{{ item.dynasty }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.roofForm }}</td>
          <td><DataValue :value="item.height" unit="m" /></td>
          <td><DataValue :value="item.width" unit="m" /></td>
          <td><DataValue :value="item.depth" unit="m" /></td>
          <td><DataValue :value="item.area" unit="m²" /></td>
          <td><DataValue :value="item.floors" unit="层" /></td>
          <td><DataValue :value="item.structureSystem" /></td>
          <td><DataValue :value="item.hasDougong ? item.dougongType : '无'" /></td>
          <td><DataValue :value="item.beastCount" /></td>
          <td>
            <a v-if="item.source" :href="firstSource(item.source)" target="_blank" rel="noreferrer">查看</a>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { h } from 'vue';

defineProps({
  rows: {
    type: Array,
    required: true
  }
});

const isEstimated = (value) => String(value ?? '').includes('估');
const firstSource = (source) => String(source).split(';')[0].trim();

const DataValue = (props) => {
  const value = props.value ?? '-';
  const needsUnit = props.unit && value !== '-' && !String(value).includes(props.unit);
  const text = `${value}${needsUnit ? props.unit : ''}`;

  return h(
    'span',
    {
      class: isEstimated(value) ? 'estimated-value' : ''
    },
    [
      text,
      isEstimated(value)
        ? h(
            'em',
            {
              class: 'estimate-badge'
            },
            '估'
          )
        : null
    ]
  );
};
</script>

<style scoped>
.table-wrap {
  width: 100%;
  overflow: auto;
}

table {
  width: 100%;
  min-width: 1480px;
  border-collapse: collapse;
  color: var(--ink-700);
  font-size: 13px;
}

th,
td {
  padding: 12px 10px;
  border-bottom: 1px solid rgba(98, 138, 138, 0.16);
  text-align: left;
  white-space: nowrap;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--teal-900);
  background: rgba(214, 235, 232, 0.94);
  font-weight: 900;
}

td:first-child {
  color: var(--teal-900);
  font-weight: 900;
}

a {
  color: var(--teal-700);
  font-weight: 900;
  text-decoration: none;
}

tbody tr:hover {
  background: rgba(221, 240, 238, 0.46);
}

.estimated-value {
  color: #c9433b;
  font-weight: 900;
}

.estimate-badge {
  display: inline-grid;
  width: 18px;
  height: 18px;
  margin-left: 6px;
  place-items: center;
  border-radius: 999px;
  color: white;
  background: #c9433b;
  font-size: 11px;
  font-style: normal;
  font-weight: 900;
}
</style>
