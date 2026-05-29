<template>
  <div class="annotation">
    <div class="building-figure" aria-label="典型建筑结构示意">
      <div class="roof">
        <span>{{ building.roofForm }}</span>
      </div>
      <div class="eaves" />
      <div class="body">
        <span>{{ building.columnGrid }}</span>
        <i v-for="index in 8" :key="index" />
      </div>
      <div class="base">
        <span>台基 / 月台</span>
      </div>
      <b class="callout callout-top">走兽 {{ building.beastCount }}</b>
      <b class="callout callout-right">{{ building.dougongType }}</b>
      <b class="callout callout-left">
        <DataValue :value="building.height" unit="m" />
      </b>
    </div>

    <div class="annotation-info">
      <div>
        <p class="eyebrow">典型单体</p>
        <h3>{{ building.name }}</h3>
        <p class="summary">{{ building.summary }}</p>
      </div>

      <dl>
        <div v-for="item in facts" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>
            <DataValue :value="item.value" :unit="item.unit" />
          </dd>
        </div>
      </dl>

      <div class="tags">
        <span v-for="tag in building.tags" :key="tag">{{ tag }}</span>
      </div>

      <p v-if="building.sourceNote" class="source-note">
        {{ building.sourceNote }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue';

const props = defineProps({
  building: {
    type: Object,
    required: true
  }
});

const isEstimated = (value) => String(value ?? '').includes('估');

const DataValue = (dataProps) => {
  const value = dataProps.value ?? '-';
  const needsUnit = dataProps.unit && value !== '-' && !String(value).includes(dataProps.unit);
  const text = `${value}${needsUnit ? dataProps.unit : ''}`;

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

const facts = computed(() => [
  { label: '高度', value: props.building.height, unit: 'm' },
  { label: '面宽', value: props.building.width, unit: 'm' },
  { label: '进深', value: props.building.depth, unit: 'm' },
  { label: '面积', value: props.building.area, unit: 'm²' },
  { label: '层数', value: props.building.floors, unit: '层' },
  { label: '开间数', value: props.building.bayCount, unit: '间' },
  { label: '屋顶形式', value: props.building.roofForm },
  { label: '结构体系', value: props.building.structureSystem },
  { label: '斗拱', value: props.building.hasDougong ? props.building.dougongType : '无' },
  { label: '门钉', value: `${props.building.doorNailRows} x ${props.building.doorNailColumns}` }
]);
</script>

<style scoped>
.annotation {
  display: grid;
  grid-template-columns: minmax(420px, 0.92fr) 1fr;
  gap: 22px;
  min-height: 360px;
}

.building-figure {
  position: relative;
  display: grid;
  align-content: end;
  min-height: 360px;
  padding: 28px 44px;
  border: 1px solid rgba(98, 138, 138, 0.2);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(221, 240, 238, 0.58), rgba(255, 255, 255, 0.42)),
    repeating-linear-gradient(90deg, rgba(98, 138, 138, 0.1) 0 1px, transparent 1px 36px);
}

.roof {
  position: relative;
  width: 88%;
  height: 82px;
  margin: 0 auto;
  clip-path: polygon(50% 0, 100% 72%, 86% 100%, 14% 100%, 0 72%);
  color: white;
  background: linear-gradient(180deg, var(--teal-900), var(--teal-700));
}

.roof span,
.body span,
.base span {
  position: absolute;
  left: 50%;
  top: 50%;
  max-width: 90%;
  translate: -50% -50%;
  color: inherit;
  font-size: 13px;
  font-weight: 900;
  text-align: center;
  overflow-wrap: anywhere;
}

.eaves {
  width: 100%;
  height: 16px;
  border-radius: 999px;
  background: var(--warm-500);
}

.body {
  position: relative;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  align-items: stretch;
  width: 74%;
  height: 126px;
  margin: 0 auto;
  padding: 20px 18px 0;
  border: 1px solid rgba(49, 95, 93, 0.28);
  border-top: 0;
  background: rgba(255, 255, 255, 0.58);
}

.body i {
  align-self: end;
  justify-self: center;
  width: 8px;
  height: 92px;
  border-radius: 999px 999px 0 0;
  background: var(--teal-500);
}

.base {
  position: relative;
  width: 86%;
  height: 48px;
  margin: 0 auto;
  color: var(--teal-900);
  background: linear-gradient(180deg, var(--mint-300), var(--mint-200));
  border: 1px solid rgba(49, 95, 93, 0.25);
}

.callout {
  position: absolute;
  max-width: 220px;
  padding: 6px 10px;
  border: 1px solid rgba(98, 138, 138, 0.24);
  border-radius: 999px;
  color: var(--teal-900);
  background: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-style: normal;
  overflow-wrap: anywhere;
}

.callout-top {
  top: 34px;
  right: 96px;
}

.callout-right {
  right: 24px;
  bottom: 132px;
}

.callout-left {
  left: 24px;
  bottom: 178px;
}

.annotation-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--teal-500);
  font-size: 12px;
  font-weight: 900;
}

h3 {
  margin: 0;
  color: var(--ink-900);
  font-size: 28px;
  font-weight: 900;
}

.summary {
  margin: 10px 0 0;
  color: var(--ink-700);
  font-size: 14px;
  line-height: 1.7;
}

dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

dl div {
  min-width: 0;
  padding: 10px;
  border: 1px solid rgba(98, 138, 138, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

dt {
  color: var(--ink-500);
  font-size: 12px;
  font-weight: 800;
}

dd {
  margin: 6px 0 0;
  color: var(--teal-900);
  font-size: 14px;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags span {
  padding: 6px 10px;
  border-radius: 999px;
  color: white;
  background: var(--teal-700);
  font-size: 12px;
  font-weight: 800;
}

.source-note {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid rgba(98, 138, 138, 0.18);
  border-radius: 8px;
  color: var(--ink-700);
  background: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  line-height: 1.7;
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
