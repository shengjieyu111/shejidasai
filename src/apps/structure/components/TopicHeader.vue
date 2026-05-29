<template>
  <header class="topic-header">
    <div class="title-block">
      <p>中国古建筑形制结构数据可视化专题页</p>
      <h1>中国古建筑形制结构数据可视化</h1>
      <span>基于建筑类型、屋顶形式、尺度特征与结构规制的静态展示</span>
    </div>

    <form class="filter-bar" @submit.prevent>
      <label>
        <span>朝代</span>
        <select :value="modelValue.dynasty" @change="update('dynasty', $event.target.value)">
          <option v-for="item in options.dynasties" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label>
        <span>地区</span>
        <select :value="modelValue.region" @change="update('region', $event.target.value)">
          <option v-for="item in options.regions" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label>
        <span>建筑类型</span>
        <select :value="modelValue.type" @change="update('type', $event.target.value)">
          <option v-for="item in options.types" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <label>
        <span>屋顶形式</span>
        <select :value="modelValue.roof" @change="update('roof', $event.target.value)">
          <option v-for="item in options.roofs" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>

      <button type="button" @click="$emit('reset')">重置</button>
    </form>
  </header>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'reset']);

const update = (key, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  });
};
</script>

<style scoped>
.topic-header {
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(520px, 0.92fr);
  gap: 24px;
  align-items: end;
  padding: 24px 28px;
  border: 1px solid rgba(98, 138, 138, 0.24);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(214, 235, 232, 0.98), rgba(221, 240, 238, 0.88)),
    var(--mint-200);
  box-shadow: var(--shadow);
}

.title-block {
  min-width: 0;
}

.title-block p {
  margin: 0 0 8px;
  color: var(--teal-700);
  font-size: 15px;
  font-weight: 800;
}

.title-block h1 {
  margin: 0;
  color: var(--ink-900);
  font-size: 34px;
  font-weight: 900;
  line-height: 1.16;
}

.title-block span {
  display: block;
  margin-top: 10px;
  color: var(--ink-700);
  font-size: 14px;
  font-weight: 700;
}

.filter-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  gap: 10px;
  align-items: end;
}

label {
  display: grid;
  gap: 7px;
  min-width: 0;
}

label span {
  color: var(--teal-700);
  font-size: 12px;
  font-weight: 800;
}

select,
button {
  width: 100%;
  height: 38px;
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 8px;
  color: var(--ink-900);
  background: rgba(255, 255, 255, 0.62);
  font-size: 13px;
  font-weight: 700;
}

select {
  padding: 0 10px;
}

button {
  min-width: 76px;
  padding: 0 14px;
  color: white;
  cursor: pointer;
  background: var(--teal-700);
}

button:hover {
  background: var(--teal-900);
}
</style>
