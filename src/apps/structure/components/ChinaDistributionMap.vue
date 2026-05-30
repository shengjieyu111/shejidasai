<template>
  <div class="china-map-shell">
    <div
      class="map-canvas"
      @wheel.prevent="handleWheel"
      @pointerdown.prevent="startDrag"
      @pointermove="handleDrag"
      @pointerup="stopDrag"
      @pointerleave="stopDrag"
    >
      <div class="map-controls" @pointerdown.stop>
        <button type="button" title="放大" @click="zoomIn">+</button>
        <button type="button" title="缩小" @click="zoomOut">-</button>
        <button type="button" title="重置" @click="resetView">↺</button>
      </div>

      <svg :viewBox="`0 0 ${viewWidth} ${viewHeight}`" role="img" aria-label="中国古建筑空间分布图">
        <defs>
          <filter id="pointGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect class="map-bg" :width="viewWidth" :height="viewHeight" rx="8" />

        <g :transform="mapTransform">
          <path
            v-for="feature in featurePaths"
            :key="feature.key"
            :d="feature.path"
            :class="feature.isLine ? 'province-line' : 'province-path'"
          >
            <title>{{ feature.name }}</title>
          </path>

          <g
            v-for="point in samplePoints"
            :key="point.source.id"
            class="sample-point"
            :transform="`translate(${point.x} ${point.y})`"
            @mouseenter="activeSample = point.source"
            @mouseleave="activeSample = null"
          >
            <circle class="sample-pulse" :r="point.radius * 1.9" />
            <circle class="sample-dot" :r="point.radius" />
            <text x="9" y="-7">{{ point.source.province }}</text>
            <title>
              {{ point.source.name }} / {{ point.source.province }}{{ point.source.city }} / 高度 {{ formatMeasure(point.source.height, 'm') }}
            </title>
          </g>
        </g>
      </svg>

      <div v-if="activeSample" class="sample-tooltip">
        <strong>{{ activeSample.name }}</strong>
        <span>{{ activeSample.province }} · {{ activeSample.city }}</span>
        <span>{{ activeSample.type }} / {{ activeSample.roofForm }}</span>
        <span :class="{ estimated: isEstimated(activeSample.height) }">高度 {{ formatMeasure(activeSample.height, 'm') }}</span>
      </div>

      <div class="map-watermark" aria-hidden="true">
        <span>审图号：GS (2024) 0650 号</span>
        <span>地图来源：国家地理信息公共服务平台「天地图」发布的官方 GeoJSON 数据</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import chinaGeoJson from '../assets/maps/china.json';

const props = defineProps({
  samples: {
    type: Array,
    required: true
  }
});

const viewWidth = 1000;
const viewHeight = 640;
const margin = 28;
const defaultZoom = 0.82;
const defaultOffset = { x: 86, y: 48 };
const zoom = ref(defaultZoom);
const offset = reactive({ ...defaultOffset });
const activeSample = ref(null);
const dragState = reactive({
  active: false,
  x: 0,
  y: 0
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const numericValue = (value) => {
  if (typeof value === 'number') return value;
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const isEstimated = (value) => String(value ?? '').includes('估');
const formatMeasure = (value, unit) => {
  if (value === undefined || value === null || value === '') return '-';
  const text = String(value);
  return text.includes(unit) ? text : `${text}${unit}`;
};

const collectCoordinates = (geometry, list = []) => {
  if (!geometry) return list;

  const visit = (coords) => {
    if (!Array.isArray(coords)) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lng, lat] = coords;
      if (lng >= 70 && lng <= 140 && lat >= 15 && lat <= 56) {
        list.push([lng, lat]);
      }
      return;
    }
    coords.forEach(visit);
  };

  if (geometry.type === 'GeometryCollection') {
    geometry.geometries?.forEach((item) => collectCoordinates(item, list));
  } else {
    visit(geometry.coordinates);
  }

  return list;
};

const allCoordinates = chinaGeoJson.features.flatMap((feature) => collectCoordinates(feature.geometry, []));
const bounds = allCoordinates.reduce(
  (result, [lng, lat]) => ({
    minLng: Math.min(result.minLng, lng),
    maxLng: Math.max(result.maxLng, lng),
    minLat: Math.min(result.minLat, lat),
    maxLat: Math.max(result.maxLat, lat)
  }),
  {
    minLng: Infinity,
    maxLng: -Infinity,
    minLat: Infinity,
    maxLat: -Infinity
  }
);

const scale = Math.min(
  (viewWidth - margin * 2) / (bounds.maxLng - bounds.minLng),
  (viewHeight - margin * 2) / (bounds.maxLat - bounds.minLat)
);
const mapWidth = (bounds.maxLng - bounds.minLng) * scale;
const mapHeight = (bounds.maxLat - bounds.minLat) * scale;
const mapOffsetX = (viewWidth - mapWidth) / 2;
const mapOffsetY = (viewHeight - mapHeight) / 2;

const project = ([lng, lat]) => [
  mapOffsetX + (lng - bounds.minLng) * scale,
  mapOffsetY + (bounds.maxLat - lat) * scale
];

const ringToPath = (ring, close = true) =>
  ring
    .map((coordinate, index) => {
      const [x, y] = project(coordinate);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ') + (close ? ' Z' : '');

const geometryToPath = (geometry) => {
  if (!geometry) return { path: '', isLine: false };
  if (geometry.type === 'Polygon') {
    return {
      path: geometry.coordinates.map((ring) => ringToPath(ring)).join(' '),
      isLine: false
    };
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      path: geometry.coordinates.flatMap((polygon) => polygon.map((ring) => ringToPath(ring))).join(' '),
      isLine: false
    };
  }
  if (geometry.type === 'LineString') {
    return {
      path: ringToPath(geometry.coordinates, false),
      isLine: true
    };
  }
  if (geometry.type === 'MultiLineString') {
    return {
      path: geometry.coordinates.map((line) => ringToPath(line, false)).join(' '),
      isLine: true
    };
  }
  return { path: '', isLine: false };
};

const featurePaths = computed(() =>
  chinaGeoJson.features
    .map((feature, index) => {
      const result = geometryToPath(feature.geometry);
      return {
        key: `${feature.properties?.code || feature.properties?.name || index}-${index}`,
        name: feature.properties?.name || feature.properties?.fullname || '区域',
        path: result.path,
        isLine: result.isLine
      };
    })
    .filter((feature) => feature.path)
);

const samplePoints = computed(() =>
  props.samples
    .filter((item) => Number.isFinite(item.lng) && Number.isFinite(item.lat))
    .map((item) => {
      const [x, y] = project([item.lng, item.lat]);
      return {
        x,
        y,
        radius: clamp(numericValue(item.height) / 10, 4.5, 9),
        source: item
      };
    })
);

const mapTransform = computed(() => `translate(${offset.x} ${offset.y}) scale(${zoom.value})`);

const viewPointFromEvent = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * viewWidth) / rect.width,
    y: ((event.clientY - rect.top) * viewHeight) / rect.height
  };
};

const applyZoom = (nextZoom, focalPoint = { x: viewWidth / 2, y: viewHeight / 2 }) => {
  const currentZoom = zoom.value;
  const limitedZoom = clamp(Number(nextZoom.toFixed(2)), 0.68, 4);
  if (limitedZoom === currentZoom) return;

  const mapX = (focalPoint.x - offset.x) / currentZoom;
  const mapY = (focalPoint.y - offset.y) / currentZoom;

  zoom.value = limitedZoom;
  offset.x = focalPoint.x - mapX * limitedZoom;
  offset.y = focalPoint.y - mapY * limitedZoom;
};

const zoomIn = () => applyZoom(zoom.value + 0.18);
const zoomOut = () => applyZoom(zoom.value - 0.18);
const resetView = () => {
  zoom.value = defaultZoom;
  offset.x = defaultOffset.x;
  offset.y = defaultOffset.y;
};

const handleWheel = (event) => {
  applyZoom(zoom.value + (event.deltaY > 0 ? -0.16 : 0.16), viewPointFromEvent(event));
};

const startDrag = (event) => {
  dragState.active = true;
  dragState.x = event.clientX;
  dragState.y = event.clientY;
  event.currentTarget.setPointerCapture?.(event.pointerId);
};

const handleDrag = (event) => {
  if (!dragState.active) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const unitX = viewWidth / rect.width;
  const unitY = viewHeight / rect.height;
  offset.x += (event.clientX - dragState.x) * unitX;
  offset.y += (event.clientY - dragState.y) * unitY;
  dragState.x = event.clientX;
  dragState.y = event.clientY;
};

const stopDrag = () => {
  dragState.active = false;
};
</script>

<style scoped>
.china-map-shell {
  height: 100%;
  min-height: 0;
  user-select: none;
  -webkit-user-select: none;
}

.map-canvas {
  position: relative;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(98, 138, 138, 0.18);
  border-radius: 8px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.64), rgba(221, 240, 238, 0.42)),
    rgba(214, 235, 232, 0.38);
}

.map-canvas:active {
  cursor: grabbing;
}

svg {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  user-select: none;
  -webkit-user-select: none;
}

.map-bg {
  fill: rgba(248, 253, 252, 0.64);
}

.province-path {
  fill: rgba(214, 235, 232, 0.88);
  stroke: rgba(49, 95, 93, 0.42);
  stroke-width: 0.9;
  vector-effect: non-scaling-stroke;
  transition:
    fill 0.18s ease,
    stroke 0.18s ease;
}

.province-path:hover {
  fill: rgba(152, 198, 188, 0.8);
  stroke: rgba(49, 95, 93, 0.76);
}

.province-line {
  fill: none;
  stroke: rgba(49, 95, 93, 0.52);
  stroke-width: 1.4;
  stroke-dasharray: 5 4;
  vector-effect: non-scaling-stroke;
}

.sample-point {
  cursor: pointer;
}

.sample-pulse {
  fill: rgba(77, 154, 136, 0.16);
  stroke: rgba(77, 154, 136, 0.36);
  stroke-width: 1;
  filter: url(#pointGlow);
  vector-effect: non-scaling-stroke;
}

.sample-dot {
  fill: var(--teal-700);
  stroke: white;
  stroke-width: 2;
  filter: url(#pointGlow);
  vector-effect: non-scaling-stroke;
}

.sample-point text {
  fill: var(--ink-900);
  paint-order: stroke;
  stroke: rgba(248, 253, 252, 0.9);
  stroke-width: 3;
  font-size: 12px;
  font-weight: 900;
  pointer-events: none;
  user-select: none;
  -webkit-user-select: none;
}

.map-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  gap: 6px;
}

.map-controls button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(98, 138, 138, 0.28);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  background: var(--teal-700);
  font-size: 17px;
  font-weight: 900;
  line-height: 1;
}

.map-controls button:hover {
  background: var(--teal-900);
}

.sample-tooltip {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 2;
  display: grid;
  gap: 4px;
  max-width: 260px;
  padding: 12px;
  border: 1px solid rgba(98, 138, 138, 0.26);
  border-radius: 8px;
  color: var(--ink-700);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12px 28px rgba(36, 86, 82, 0.1);
  font-size: 12px;
}

.sample-tooltip strong {
  color: var(--teal-900);
  font-size: 15px;
}

.sample-tooltip .estimated {
  color: #c9433b;
  font-weight: 900;
}

.map-watermark {
  position: absolute;
  right: 12px;
  bottom: 10px;
  z-index: 2;
  display: grid;
  gap: 2px;
  max-width: min(76%, 460px);
  color: rgba(49, 79, 79, 0.42);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.45;
  text-align: right;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.86);
  pointer-events: none;
}
</style>
