<template>
  <div class="modal-overlay" v-if="visible" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <div class="image-container">
        <img 
          :src="currentImage" 
          :alt="currentAlt"
          class="blueprint-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  buildingType: {
    type: String,
    default: 'palace'
  }
})

defineEmits(['close'])

const currentImage = computed(() => {
  if (props.buildingType === 'pavilion') {
    return '/1.png'
  }
  return '/ea780ff7-df74-4548-a88e-828a1e55acc1.png'
})

const currentAlt = computed(() => {
  if (props.buildingType === 'pavilion') {
    return '河南文昌阁概念分解蓝图'
  }
  return '故宫太和殿概念分解蓝图'
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  position: relative;
  background: #fff;
  border-radius: 12px;
  max-width: 95vw;
  max-height: 95vh;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.close-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.image-container {
  width: 100%;
  height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  padding: 10px;
}

.blueprint-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}
</style>
