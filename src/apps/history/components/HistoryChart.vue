<template>
  <div class="big-screen-container">
    <header class="header">
      <div class="header-title-block">
        <div class="title">古建筑历史年代可视化大屏</div>
        <div class="header-stats">
          <span class="stat-pill">{{ currentStats.label }}</span>
          <span class="stat-pill">统计建筑 {{ currentStats.total }} 处</span>
          <span class="stat-pill">覆盖省份 {{ currentStats.provinceCount }} 个</span>
          <span class="stat-pill">代表案例 {{ currentStats.caseCount }} 个</span>
        </div>
      </div>

      <div class="dynasty-tabs">
        <div
          v-for="item in dynasties"
          :key="item"
          class="tab"
          :class="{ active: currentDynasty === item }"
          @click="changeDynasty(item)"
        >
          {{ item }}
        </div>
        <div
          class="tab"
          :class="{ active: currentDynasty === '全部' }"
          @click="changeDynasty('全部')"
        >
          全部
        </div>
      </div>
    </header>

    <main class="main-content">
      <section class="left-panel">
        <div class="chart-card">
          <div class="card-title-row">
            <h3 class="card-title">建筑风格演变趋势</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('line', '建筑风格演变趋势')">⤢</button>
          </div>
          <div ref="lineChartDom" class="chart"></div>
        </div>

        <div class="chart-card">
          <div class="card-title-row">
            <h3 class="card-title">建筑类型占比</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('typePie', '建筑类型占比')">⤢</button>
          </div>
          <div ref="typePieChartDom" class="chart"></div>
        </div>

        <div class="chart-card">
          <div class="card-title-row">
            <h3 class="card-title">建筑保存状态</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('statusGauge', '建筑保存状态')">⤢</button>
          </div>
          <div ref="statusGaugeChartDom" class="chart"></div>
        </div>
      </section>

      <section class="center-panel">
        <div class="map-card">
          <div class="card-title-row">
            <h3 class="card-title center-title">中国古建筑空间分布图</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('map', '中国古建筑空间分布图')">⤢</button>
          </div>
          <div class="map-wrapper">
            <div class="map-chart-wrap">
              <div ref="mapChartDom" class="map-chart"></div>
            </div>
            <div class="dynasty-rank-wrap">
              <button class="chart-expand-btn rank-expand-btn" type="button" title="放大图表" @click="openChartPreview('dynastyRank', '省份建筑排行')">⤢</button>
              <div ref="dynastyRankChartDom" class="dynasty-rank-chart"></div>
            </div>
          </div>
          <div class="map-timeline">
            <button
              class="timeline-play"
              type="button"
              :title="timelinePlaying ? '暂停播放' : '开始播放'"
              @click="toggleTimelinePlay"
            >
              {{ timelinePlaying ? 'Ⅱ' : '▶' }}
            </button>
            <div class="timeline-track">
              <button
                v-for="(item, index) in dynasties"
                :key="`timeline-${item}`"
                class="timeline-node"
                :class="{ active: currentDynasty === item }"
                type="button"
                @click="selectTimelineDynasty(item)"
              >
                <span class="timeline-dot"></span>
                <span class="timeline-label">{{ item }}</span>
              </button>
              <div
                class="timeline-progress"
                :style="{ width: `${timelineProgress}%` }"
              ></div>
            </div>
          </div>
          <div
            class="detail-resizer"
            title="拖动调整照片区高度"
            @pointerdown="startResizeDetail"
          ></div>
          <div class="province-detail" :style="{ flexBasis: `${detailHeight}px` }">
            <div class="detail-title">
              {{ provinceDetailTitle }}
            </div>
            <div class="building-list">
              <article
                v-for="building in selectedProvinceBuildings"
                :key="`${building.dynasty}-${building.name}`"
                class="building-card"
                @click="openBuildingModal(building)"
              >
                <img
                  class="building-photo"
                  :src="building.image"
                  :alt="building.name"
                  @error="handleImageError"
                >
                <div class="building-info">
                  <div class="building-name">{{ building.name }}</div>
                  <div class="building-meta">{{ building.dynasty }} · {{ building.year }}年 · {{ building.city }}</div>
                </div>
              </article>
              <div v-if="selectedProvinceBuildings.length === 0" class="empty-detail">
                当前朝代暂无该省代表建筑记录
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="right-panel">
        <div class="chart-card">
          <div class="card-title-row">
            <h3 class="card-title">历代修缮需求估算</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('radar', '历代修缮需求估算')">⤢</button>
          </div>
          <div ref="radarChartDom" class="chart"></div>
        </div>

        <div class="chart-card">
          <div class="card-title-row">
            <h3 class="card-title">朝代-建筑类型热力图</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('typeHeatmap', '朝代-建筑类型热力图')">⤢</button>
          </div>
          <div ref="typeHeatmapChartDom" class="chart"></div>
        </div>

        <div class="chart-card">
          <div class="card-title-row">
            <h3 class="card-title">TOP省份数量趋势</h3>
            <button class="chart-expand-btn" type="button" title="放大图表" @click="openChartPreview('rankChange', 'TOP省份数量趋势')">⤢</button>
          </div>
          <div ref="rankChangeChartDom" class="chart"></div>
        </div>
      </section>
    </main>

    <div
      v-if="chartPreviewVisible"
      class="chart-preview-mask"
      @click.self="closeChartPreview"
    >
      <section class="chart-preview-modal">
        <header class="chart-preview-header">
          <h3 class="chart-preview-title">{{ chartPreviewTitle }}</h3>
          <button class="chart-preview-close" type="button" @click="closeChartPreview">×</button>
        </header>
        <div ref="chartPreviewDom" class="chart-preview-body"></div>
      </section>
    </div>

    <div
      v-if="selectedBuilding"
      class="modal-mask"
      @click.self="closeBuildingModal"
    >
      <section class="building-modal">
        <button class="modal-close" type="button" @click="closeBuildingModal">×</button>
        <img
          class="modal-photo"
          :src="selectedBuilding.image"
          :alt="selectedBuilding.name"
          @error="handleImageError"
        >
        <div class="modal-content">
          <h2 class="modal-title">{{ selectedBuilding.name }}</h2>
          
          <div class="modal-info-grid">
            <div class="info-item">
              <label class="info-label">时间：</label>
              <span class="info-value">{{ selectedBuilding.year }}年</span>
            </div>
            <div class="info-item">
              <label class="info-label">朝代：</label>
              <span class="info-value">{{ selectedBuilding.dynasty }}</span>
            </div>
            <div class="info-item">
              <label class="info-label">城市：</label>
              <span class="info-value">{{ selectedBuilding.city }}</span>
            </div>
          </div>

          <div class="modal-section">
            <h3 class="section-title">详情介绍</h3>
            <p class="modal-desc">{{ selectedBuilding.intro }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import chinaMapText from '../assets/中国_省.geojson?raw'

const chinaMap = JSON.parse(chinaMapText)
const buildingImages = {
  '蓟城桥梁.png': new URL('../assets/buildings/蓟城桥梁.png', import.meta.url).href,
  '居庸关云台.png': new URL('../assets/buildings/居庸关云台.png', import.meta.url).href,
  '积水潭石桥.jpg': new URL('../assets/buildings/积水潭石桥.jpg', import.meta.url).href,
  '故宫.jpg': new URL('../assets/buildings/故宫.jpg', import.meta.url).href,
  '天坛.jpg': new URL('../assets/buildings/天坛.jpg', import.meta.url).href,
  '颐和园.jpg': new URL('../assets/buildings/颐和园.jpg', import.meta.url).href,
  '雍和宫.png': new URL('../assets/buildings/雍和宫.png', import.meta.url).href,
  '晋祠圣母殿.jpg': new URL('../assets/buildings/晋祠圣母殿.jpg', import.meta.url).href,
  '乔家大院.jpg': new URL('../assets/buildings/乔家大院.jpg', import.meta.url).href,
  '常家庄园.jpg': new URL('../assets/buildings/常家庄园.jpg', import.meta.url).href,
  '晋祠鱼沼飞梁.png': new URL('../assets/buildings/晋祠鱼沼飞梁.png', import.meta.url).href,
  '西安城墙.png': new URL('../assets/buildings/西安城墙.png', import.meta.url).href,
  '西安钟楼.jpg': new URL('../assets/buildings/西安钟楼.jpg', import.meta.url).href,
  '高家大院.jpg': new URL('../assets/buildings/高家大院.jpg', import.meta.url).href,
  '沧浪亭.jpg': new URL('../assets/buildings/沧浪亭.jpg', import.meta.url).href,
  '南京明城墙.jpg': new URL('../assets/buildings/南京明城墙.jpg', import.meta.url).href,
  '拙政园.jpg': new URL('../assets/buildings/拙政园.jpg', import.meta.url).href,
  '留园.jpg': new URL('../assets/buildings/留园.jpg', import.meta.url).href,
  '个园.jpg': new URL('../assets/buildings/个园.jpg', import.meta.url).href,
  '飞来峰造像.jpg': new URL('../assets/buildings/飞来峰造像.jpg', import.meta.url).href,
  '天一阁.jpg': new URL('../assets/buildings/天一阁.jpg', import.meta.url).href,
  '鲁迅故里台门.jpg': new URL('../assets/buildings/鲁迅故里台门.jpg', import.meta.url).href,
  '赵州桥.jpg': new URL('../assets/buildings/赵州桥.jpg', import.meta.url).href,
  '承德避暑山庄.jpg': new URL('../assets/buildings/承德避暑山庄.jpg', import.meta.url).href,
}

function buildingImage(fileName) {
  return buildingImages[fileName] || fallbackPhoto
}

const radarChartDom = ref(null)
const mapChartDom = ref(null)
const lineChartDom = ref(null)
const dynastyRankChartDom = ref(null)
const typePieChartDom = ref(null)
const typeHeatmapChartDom = ref(null)
const rankChangeChartDom = ref(null)
const statusGaugeChartDom = ref(null)
const chartPreviewDom = ref(null)

let radarChart = null
let mapChart = null
let lineChart = null
let dynastyRankChart = null
let typePieChart = null
let typeHeatmapChart = null
let rankChangeChart = null
let statusGaugeChart = null
let chartPreviewInstance = null

const dynasties = ['唐', '宋', '元', '明', '清']
const currentDynasty = ref('唐')
const selectedProvince = ref(null)
const selectedBuilding = ref(null)
const chartPreviewVisible = ref(false)
const chartPreviewTitle = ref('')
const chartPreviewKey = ref('')
const detailHeight = ref(280)
const timelinePlaying = ref(true)
let resizingDetail = false
let timelineTimer = null

const timelineProgress = computed(() => {
  const index = dynasties.indexOf(currentDynasty.value)
  if (index < 0) return 0
  return dynasties.length === 1 ? 100 : (index / (dynasties.length - 1)) * 100
})

const adcodeNameMap = {
  110000: '北京',
  120000: '天津',
  130000: '河北',
  140000: '山西',
  150000: '内蒙古',
  210000: '辽宁',
  220000: '吉林',
  230000: '黑龙江',
  310000: '上海',
  320000: '江苏',
  330000: '浙江',
  340000: '安徽',
  350000: '福建',
  360000: '江西',
  370000: '山东',
  410000: '河南',
  420000: '湖北',
  430000: '湖南',
  440000: '广东',
  450000: '广西',
  460000: '海南',
  500000: '重庆',
  510000: '四川',
  520000: '贵州',
  530000: '云南',
  540000: '西藏',
  610000: '陕西',
  620000: '甘肃',
  630000: '青海',
  640000: '宁夏',
  650000: '新疆',
  710000: '台湾',
  810000: '香港',
  820000: '澳门',
}

const statCategories = [
  { key: 'palace', label: '皇宫' },
  { key: 'office', label: '官府' },
  { key: 'residence', label: '民居' },
  { key: 'bridge', label: '桥梁' },
]

const buildingTypes = statCategories.map((item) => item.label)
const provinceOrder = Object.values(adcodeNameMap)

function normalizeProvinceName(name = '') {
  return name
    .replace(/特别行政区$/, '')
    .replace(/壮族自治区$/, '')
    .replace(/回族自治区$/, '')
    .replace(/维吾尔自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/[省市]$/, '')
}

const provinceDynastyRawData = {
  北京: {
    唐: { palace: 0, office: 0, residence: 0, bridge: 10, source: '方志' },
    宋: { palace: 0, office: 20, residence: 50, bridge: 30, source: '方志' },
    元: { palace: 1, office: 100, residence: 200, bridge: 50, source: '方志、考古' },
    明: { palace: 1, office: 300, residence: 500, bridge: 100, source: '国保、方志' },
    清: { palace: 1, office: 500, residence: 1000, bridge: 150, source: '国保、方志' },
  },
  山西: {
    唐: { palace: 0, office: 10, residence: 3, bridge: 50, source: '国保、考古' },
    宋: { palace: 0, office: 50, residence: 44, bridge: 100, source: '国保' },
    元: { palace: 0, office: 100, residence: 351, bridge: 150, source: '国保' },
    明: { palace: 0, office: 500, residence: 5000, bridge: 300, source: '三普、方志' },
    清: { palace: 0, office: 800, residence: 10000, bridge: 500, source: '三普、方志' },
  },
  陕西: {
    唐: { palace: 2, office: 500, residence: 1000, bridge: 100, source: '考古、方志' },
    宋: { palace: 0, office: 50, residence: 200, bridge: 80, source: '方志' },
    元: { palace: 0, office: 80, residence: 300, bridge: 100, source: '方志' },
    明: { palace: 0, office: 200, residence: 800, bridge: 200, source: '三普' },
    清: { palace: 0, office: 300, residence: 1500, bridge: 300, source: '三普' },
  },
  河南: {
    唐: { palace: 1, office: 400, residence: 800, bridge: 90, source: '考古、方志' },
    宋: { palace: 1, office: 300, residence: 600, bridge: 120, source: '考古、方志' },
    元: { palace: 0, office: 70, residence: 250, bridge: 90, source: '方志' },
    明: { palace: 0, office: 180, residence: 700, bridge: 220, source: '三普' },
    清: { palace: 0, office: 250, residence: 1400, bridge: 350, source: '三普' },
  },
  河北: {
    唐: { palace: 0, office: 8, residence: 30, bridge: 12, source: '方志' },
    宋: { palace: 0, office: 60, residence: 180, bridge: 80, source: '方志、遗存' },
    元: { palace: 0, office: 50, residence: 150, bridge: 90, source: '国保、方志' },
    明: { palace: 0, office: 150, residence: 800, bridge: 150, source: '三普、方志' },
    清: { palace: 1, office: 300, residence: 2200, bridge: 260, source: '国保、三普' },
  },
  浙江: {
    唐: { palace: 0, office: 30, residence: 100, bridge: 44, source: '方志' },
    宋: { palace: 0, office: 150, residence: 500, bridge: 86, source: '方志' },
    元: { palace: 0, office: 80, residence: 300, bridge: 70, source: '方志' },
    明: { palace: 0, office: 250, residence: 2000, bridge: 382, source: '三普、方志' },
    清: { palace: 0, office: 400, residence: 4000, bridge: 551, source: '三普、方志' },
  },
  江苏: {
    唐: { palace: 0, office: 20, residence: 80, bridge: 18, source: '方志' },
    宋: { palace: 1, office: 120, residence: 400, bridge: 43, source: '方志' },
    元: { palace: 0, office: 70, residence: 250, bridge: 60, source: '方志' },
    明: { palace: 1, office: 300, residence: 2500, bridge: 300, source: '三普、国保' },
    清: { palace: 0, office: 500, residence: 4500, bridge: 450, source: '三普、国保' },
  },
  福建: {
    唐: { palace: 0, office: 20, residence: 50, bridge: 29, source: '方志' },
    宋: { palace: 0, office: 90, residence: 300, bridge: 159, source: '方志' },
    元: { palace: 0, office: 60, residence: 200, bridge: 32, source: '方志' },
    明: { palace: 0, office: 180, residence: 1500, bridge: 100, source: '三普、方志' },
    清: { palace: 0, office: 250, residence: 3000, bridge: 120, source: '三普、方志' },
  },
  安徽: {
    唐: { palace: 0, office: 15, residence: 40, bridge: 20, source: '方志' },
    宋: { palace: 0, office: 60, residence: 150, bridge: 50, source: '方志' },
    元: { palace: 0, office: 40, residence: 100, bridge: 40, source: '方志' },
    明: { palace: 1, office: 200, residence: 1000, bridge: 200, source: '三普、国保' },
    清: { palace: 0, office: 350, residence: 3000, bridge: 300, source: '三普、国保' },
  },
  湖南: {
    唐: { palace: 0, office: 10, residence: 20, bridge: 2, source: '方志' },
    宋: { palace: 0, office: 40, residence: 80, bridge: 6, source: '方志' },
    元: { palace: 0, office: 30, residence: 50, bridge: 5, source: '方志' },
    明: { palace: 0, office: 100, residence: 400, bridge: 52, source: '三普' },
    清: { palace: 0, office: 180, residence: 800, bridge: 208, source: '三普' },
  },
}

const supplementalProvinceTotals = {
  天津: [8, 42, 88, 320, 760],
  内蒙古: [28, 64, 160, 420, 900],
  辽宁: [18, 72, 180, 520, 1050],
  吉林: [8, 32, 80, 220, 560],
  黑龙江: [4, 18, 48, 180, 520],
  上海: [4, 26, 70, 260, 680],
  江西: [42, 150, 210, 950, 2100],
  山东: [95, 260, 320, 1300, 2600],
  湖北: [38, 130, 170, 760, 1600],
  广东: [35, 150, 220, 980, 2300],
  广西: [22, 86, 130, 520, 1250],
  海南: [6, 24, 48, 160, 420],
  重庆: [24, 95, 140, 620, 1400],
  四川: [70, 220, 300, 1250, 2800],
  贵州: [12, 60, 90, 520, 1500],
  云南: [18, 80, 130, 720, 1850],
  西藏: [16, 48, 90, 240, 620],
  甘肃: [85, 140, 180, 560, 1150],
  青海: [10, 28, 64, 180, 460],
  宁夏: [12, 36, 78, 220, 520],
  新疆: [45, 90, 150, 360, 820],
  台湾: [4, 20, 42, 180, 620],
  香港: [0, 4, 10, 38, 120],
  澳门: [0, 3, 8, 32, 95],
}

function splitEstimatedTotal(total, dynastyIndex, province) {
  const palace = ['北京', '陕西', '河南', '河北', '四川', '山东', '西藏'].includes(province) && total > 80
    ? Math.max(1, Math.round(total * 0.004))
    : 0
  const bridgeRatio = [0.18, 0.2, 0.18, 0.16, 0.14][dynastyIndex]
  const officeRatio = [0.22, 0.2, 0.18, 0.16, 0.15][dynastyIndex]
  const bridge = Math.max(1, Math.round(total * bridgeRatio))
  const office = Math.max(1, Math.round(total * officeRatio))
  const residence = Math.max(0, total - palace - office - bridge)
  return { palace, office, residence, bridge }
}

provinceOrder.forEach((province) => {
  if (provinceDynastyRawData[province]) return

  const totals = supplementalProvinceTotals[province] || [6, 24, 54, 180, 460]
  provinceDynastyRawData[province] = Object.fromEntries(
    dynasties.map((dynasty, index) => [
      dynasty,
      {
        ...splitEstimatedTotal(totals[index], index, province),
        source: '区域古建筑存量估算',
      },
    ]),
  )
})

function getRowTotal(row) {
  return row.palace + row.office + row.residence + row.bridge
}

const provinceDynastyData = Object.fromEntries(
  dynasties.map((dynasty) => [
    dynasty,
    provinceOrder.map((province) => ({
      name: province,
      value: getRowTotal(provinceDynastyRawData[province][dynasty]),
    })),
  ]),
)

function getTypeTotalsByDynasty(dynasty) {
  const totals = new Map(statCategories.map((item) => [item.label, 0]))
  provinceOrder.forEach((province) => {
    const row = provinceDynastyRawData[province][dynasty]
    statCategories.forEach((item) => {
      totals.set(item.label, totals.get(item.label) + row[item.key])
    })
  })
  return Array.from(totals, ([name, value]) => ({ name, value }))
}

function getCurrentTypeTotals() {
  if (currentDynasty.value !== '全部') {
    return getTypeTotalsByDynasty(currentDynasty.value)
  }

  const totals = new Map(statCategories.map((item) => [item.label, 0]))
  dynasties.forEach((dynasty) => {
    getTypeTotalsByDynasty(dynasty).forEach((item) => {
      totals.set(item.name, totals.get(item.name) + item.value)
    })
  })
  return Array.from(totals, ([name, value]) => ({ name, value }))
}

const heatmapMaxValue = Math.max(
  ...dynasties.flatMap((dynasty) => getTypeTotalsByDynasty(dynasty).map((item) => item.value)),
)

const fallbackPhoto =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
      <rect width="320" height="180" fill="#cfe6e3"/>
      <path d="M42 120h236v18H42zM78 101h164v19H78zM104 78h112v23H104z" fill="#628a8a"/>
      <path d="M52 102l108-50 108 50H52z" fill="#8fb9b5"/>
      <text x="160" y="158" text-anchor="middle" fill="#314f4f" font-size="18" font-family="Arial">古建筑图片</text>
    </svg>
  `)

const provinceBuildingDetails = {
  北京: {
    唐: [
      { name: '蓟城桥梁', dynasty: '唐', year: 700, city: '北京', image: buildingImage('蓟城桥梁.png') },
    ],
    元: [
      { name: '居庸关云台', dynasty: '元', year: 1342, city: '北京昌平', image: buildingImage('居庸关云台.png') },
      { name: '积水潭石桥', dynasty: '元', year: 1285, city: '北京', image: buildingImage('积水潭石桥.jpg') },
    ],
    明: [
      { name: '故宫', dynasty: '明', year: 1420, city: '北京东城', image: buildingImage('故宫.jpg') },
      { name: '天坛', dynasty: '明', year: 1420, city: '北京东城', image: buildingImage('天坛.jpg') },
    ],
    清: [
      { name: '颐和园', dynasty: '清', year: 1750, city: '北京海淀', image: buildingImage('颐和园.jpg') },
      { name: '雍和宫', dynasty: '清', year: 1694, city: '北京东城', image: buildingImage('雍和宫.png') },
    ],
  },
  山西: {
    唐: [
    ],
    宋: [
      { name: '晋祠圣母殿', dynasty: '宋', year: 1032, city: '山西太原', image: buildingImage('晋祠圣母殿.jpg') },
    ],
    清: [
      { name: '乔家大院', dynasty: '清', year: 1756, city: '山西祁县', image: buildingImage('乔家大院.jpg') },
      { name: '常家庄园', dynasty: '清', year: 1760, city: '山西榆次', image: buildingImage('常家庄园.jpg') },
      { name: '晋祠鱼沼飞梁', dynasty: '清', year: 1735, city: '山西太原', image: buildingImage('晋祠鱼沼飞梁.png') },
    ],
  },
  陕西: {
    唐: [
    ],
    明: [
      { name: '西安城墙', dynasty: '明', year: 1370, city: '陕西西安', image: buildingImage('西安城墙.png') },
      { name: '西安钟楼', dynasty: '明', year: 1384, city: '陕西西安', image: buildingImage('西安钟楼.jpg') },
    ],
    元: [
    ],
    清: [
      { name: '高家大院', dynasty: '清', year: 1770, city: '陕西西安', image: buildingImage('高家大院.jpg') },
    ],
  },
  河南: {
    唐: [
    ],
    宋: [
    ],
  },
  江苏: {
    唐: [
    ],
    宋: [
      { name: '沧浪亭', dynasty: '宋', year: 1044, city: '江苏苏州', image: buildingImage('沧浪亭.jpg') },
    ],
    明: [
      { name: '南京明城墙', dynasty: '明', year: 1366, city: '江苏南京', image: buildingImage('南京明城墙.jpg') },
      { name: '拙政园', dynasty: '明', year: 1509, city: '江苏苏州', image: buildingImage('拙政园.jpg') },
    ],
    清: [
      { name: '留园', dynasty: '清', year: 1798, city: '江苏苏州', image: buildingImage('留园.jpg') },
      { name: '个园', dynasty: '清', year: 1818, city: '江苏扬州', image: buildingImage('个园.jpg') },
    ],
  },
  浙江: {
    宋: [
    ],
    元: [
      { name: '飞来峰造像', dynasty: '元', year: 1282, city: '浙江杭州', image: buildingImage('飞来峰造像.jpg') },
    ],
    明: [
      { name: '天一阁', dynasty: '明', year: 1561, city: '浙江宁波', image: buildingImage('天一阁.jpg') },
      { name: '鲁迅故里台门', dynasty: '明', year: 1500, city: '浙江绍兴', image: buildingImage('鲁迅故里台门.jpg') },
    ],
  },
  河北: {
    元: [
      { name: '赵州桥', dynasty: '元', year: 1300, city: '河北赵县', image: buildingImage('赵州桥.jpg') },
    ],
    清: [
      { name: '承德避暑山庄', dynasty: '清', year: 1703, city: '河北承德', image: buildingImage('承德避暑山庄.jpg') },
    ],
  },
}

const buildingIntroMap = {
  蓟城桥梁: '蓟城桥梁反映了北京地区早期城市交通网络与水系组织方式，是古代桥梁营造技术的重要见证。',
  居庸关云台: '居庸关云台位于长城关隘要冲，石刻与券洞结构保存了元代交通、军事和多民族文化交流的信息。',
  积水潭石桥: '积水潭石桥连接北京城内重要水陆节点，桥体形制与周边水工系统共同体现元代都城交通布局特点。',
  故宫: '故宫始建于明永乐年间，是明清两代皇家宫城，轴线严整、院落层层递进，集中体现中国古代宫殿建筑制度。',
  天坛: '天坛是明清皇帝祭天祈谷的坛庙建筑群，以圜丘、祈年殿等空间组织表现礼制建筑的秩序与象征。',
  颐和园: '颐和园以昆明湖、万寿山为骨架，是清代皇家园林代表，融合山水格局、宫殿建筑和江南园林意趣。',
  雍和宫: '雍和宫由清代王府改为藏传佛教寺院，建筑中轴严整，殿宇层层升高，体现清代宗教与宫廷建筑的结合。',
  晋祠圣母殿: '晋祠圣母殿是宋代木构建筑代表，殿前鱼沼飞梁与殿内塑像共同构成独特的礼祀空间。',
  晋祠鱼沼飞梁: '晋祠鱼沼飞梁是中国古桥中极具辨识度的十字形桥体，桥与祠庙空间结合紧密，体现古代礼制与水工营造智慧。',
  乔家大院: '乔家大院是清代晋商民居建筑代表，院落组合严谨，反映山西民居、防御和家族礼序空间。',
  常家庄园: '常家庄园是清代晋中大院建筑的重要代表，规模宏大，兼具居住、园林和家族文化展示功能。',
  西安城墙: '西安城墙形成于明代，是保存完整的古代城防体系之一，城门、瓮城、马面等设施体现明代城市防御思想。',
  西安钟楼: '西安钟楼位于古城中轴核心，是明代城市报时与礼仪空间的标志性建筑。',
  高家大院: '高家大院是清代关中民居代表，院落布局紧凑，兼具生活、礼仪与家族记忆功能。',
  沧浪亭: '沧浪亭是苏州古典园林的重要源头之一，以水景和曲折空间见长，体现宋代文人园林气质。',
  南京明城墙: '南京明城墙是明初都城建设的核心工程，规模宏大，因地制宜地组织城防体系。',
  拙政园: '拙政园是明代江南园林代表，水面开阔、建筑疏朗，体现文人园林的借景与游赏逻辑。',
  留园: '留园是清代苏州园林名作，以空间层次、建筑小品和山石经营见长。',
  个园: '个园是清代扬州园林代表，以四季假山著称，展现江南园林中山石营造的巧思。',
  飞来峰造像: '飞来峰造像保存元代及前后佛教石刻，反映杭州地区宗教艺术与山水空间的结合。',
  天一阁: '天一阁是明代藏书楼代表，建筑与藏书制度结合紧密，是中国私家藏书文化的重要象征。',
  鲁迅故里台门: '鲁迅故里台门体现绍兴传统民居格局，承载近现代文化名人与地域建筑记忆。',
  赵州桥: '赵州桥是中国古代石拱桥代表，敞肩拱结构轻巧稳定，对后世桥梁技术影响深远。',
  承德避暑山庄: '承德避暑山庄是清代皇家园林和政治空间，融合草原、山地、江南水乡等多重景观意象。',
}

const selectedProvinceBuildings = computed(() => {
  const attachIntro = (building) => ({
    ...building,
    intro: buildingIntroMap[building.name] || `${building.name}是${building.dynasty}代具有代表性的古建筑，位于${building.city}，体现了当时的营造技术、地域风格和历史文化记忆。`,
  })

  const collectBuildings = (provinceData) => {
    if (currentDynasty.value !== '全部') {
      return provinceData[currentDynasty.value] || []
    }

    return dynasties.flatMap((dynasty) => provinceData[dynasty] || [])
  }

  // 如果没有选中省份，显示当前朝代或全部朝代的所有建筑
  if (!selectedProvince.value) {
    const provinceDataList = Object.values(provinceBuildingDetails)
    const allBuildings = []
    provinceDataList.forEach((provinceData) => {
      allBuildings.push(...collectBuildings(provinceData))
    })
    return allBuildings.map(attachIntro)
  }

  // 如果选中了省份，显示该省份在当前朝代或全部朝代的建筑
  const provinceData = provinceBuildingDetails[selectedProvince.value] || {}
  return collectBuildings(provinceData).map(attachIntro)
})

const provinceDetailTitle = computed(() => {
  const dynastyLabel = currentDynasty.value === '全部' ? '历代' : `${currentDynasty.value}代`
  return `${selectedProvince.value ? `${selectedProvince.value} · ` : ''}${dynastyLabel}代表建筑`
})

const currentStats = computed(() => {
  const data = getProvinceMapData()
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const provinceCount = data.filter((item) => item.value > 0).length
  const caseCount = selectedProvinceBuildings.value.length
  return {
    label: currentDynasty.value === '全部' ? '全部朝代' : `${currentDynasty.value}代`,
    total,
    provinceCount,
    caseCount,
  }
})

const styleTrend = {
  dougong: [92, 86, 64, 58, 45],
  brick: [35, 48, 62, 83, 88],
  garden: [28, 55, 60, 78, 95],
  paint: [42, 58, 67, 86, 91]
}

const chartPalette = ['#628a8a', '#b78f52', '#8fb9b5', '#d9b66f', '#355f5f', '#9fc7c3']

const statusDataByDynasty = {
  唐: [
    { name: '保存完好', value: 42 },
    { name: '局部损毁', value: 31 },
    { name: '修缮中', value: 17 },
    { name: '遗址状态', value: 10 },
  ],
  宋: [
    { name: '保存完好', value: 38 },
    { name: '局部损毁', value: 34 },
    { name: '修缮中', value: 18 },
    { name: '遗址状态', value: 10 },
  ],
  元: [
    { name: '保存完好', value: 34 },
    { name: '局部损毁', value: 33 },
    { name: '修缮中', value: 20 },
    { name: '遗址状态', value: 13 },
  ],
  明: [
    { name: '保存完好', value: 48 },
    { name: '局部损毁', value: 29 },
    { name: '修缮中', value: 16 },
    { name: '遗址状态', value: 7 },
  ],
  清: [
    { name: '保存完好', value: 52 },
    { name: '局部损毁', value: 26 },
    { name: '修缮中', value: 15 },
    { name: '遗址状态', value: 7 },
  ],
}

function getMergedStatusData() {
  if (currentDynasty.value !== '全部') {
    return statusDataByDynasty[currentDynasty.value]
  }

  const merged = new Map()
  Object.values(statusDataByDynasty).forEach((items) => {
    items.forEach((item) => {
      merged.set(item.name, (merged.get(item.name) || 0) + item.value)
    })
  })
  return Array.from(merged, ([name, value]) => ({ name, value: Math.round(value / dynasties.length) }))
}

function getDynastyBuildingTotal(dynasty) {
  return provinceDynastyData[dynasty].reduce((sum, item) => sum + item.value, 0)
}

function getRepairDemandCounts() {
  return dynasties.map((dynasty) => {
    const statusTotal = statusDataByDynasty[dynasty].reduce((sum, item) => sum + item.value, 0)
    const repairRatio = (statusDataByDynasty[dynasty].find((item) => item.name === '修缮中')?.value || 0) / statusTotal
    return Math.round(getDynastyBuildingTotal(dynasty) * repairRatio)
  })
}

function initRadarChart() {
  radarChart = echarts.init(radarChartDom.value)
  const repairDemandCounts = getRepairDemandCounts()

  radarChart.setOption({
    grid: { left: '14%', right: '8%', top: '14%', bottom: '16%' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(49, 79, 79, 0.9)',
      borderColor: '#628a8a',
      textStyle: { color: '#fff' },
      formatter(params) {
        const item = params[0]
        const dynasty = item.axisValue
        const total = getDynastyBuildingTotal(dynasty)
        const ratio = statusDataByDynasty[dynasty].find((status) => status.name === '修缮中')?.value || 0
        return `${dynasty}代<br/>建筑总量：${total}处<br/>修缮中占比：${ratio}%<br/>估算需求：${item.value}处`
      },
    },
    xAxis: {
      type: 'category',
      data: dynasties,
      axisLabel: { color: '#628a8a' }
    },
    yAxis: {
      type: 'value',
      name: '估算处数',
      nameTextStyle: { color: '#628a8a' },
      axisLabel: { color: '#628a8a', formatter: '{value}处' },
      splitLine: { lineStyle: { color: '#d6ebe8' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: repairDemandCounts,
        itemStyle: { color: '#b78f52' },
        lineStyle: { width: 3 },
        areaStyle: { color: 'rgba(183, 143, 82, 0.16)' },
        label: {
          show: true,
          position: 'top',
          color: '#6d5a34',
          fontSize: 13,
          fontWeight: 'bold',
          formatter: '{c}处',
        }
      }
    ]
  })
}

function initLineChart() {
  lineChart = echarts.init(lineChartDom.value)

  lineChart.setOption({
    color: chartPalette,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(49, 79, 79, 0.9)',
      borderColor: '#628a8a',
      textStyle: { color: '#fff' },
      valueFormatter: (value) => `${value}分`,
    },
    legend: {
      top: 0,
      textStyle: { color: '#628a8a' }
    },
    grid: { left: '12%', right: '8%', top: '24%', bottom: '12%' },
    xAxis: {
      type: 'category',
      data: dynasties,
      axisLabel: { color: '#628a8a' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#628a8a', formatter: '{value}分' },
      splitLine: { lineStyle: { color: '#d6ebe8' } },
    },
    series: [
      { name: '斗拱木构', type: 'line', smooth: true, symbolSize: 7, data: styleTrend.dougong },
      { name: '砖石建筑', type: 'line', smooth: true, symbolSize: 7, data: styleTrend.brick },
      { name: '园林空间', type: 'line', smooth: true, symbolSize: 7, data: styleTrend.garden },
      { name: '彩画装饰', type: 'line', smooth: true, symbolSize: 7, data: styleTrend.paint }
    ]
  })
}

function initTypePieChart() {
  typePieChart = echarts.init(typePieChartDom.value)
  updateTypePieChart()
}

function updateTypePieChart() {
  if (!typePieChart) return

  const data = getCurrentTypeTotals().filter((item) => item.value > 0)
  typePieChart.setOption({
    color: chartPalette,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(49, 79, 79, 0.9)',
      borderColor: '#628a8a',
      textStyle: { color: '#fff' },
      formatter: '{b}<br/>数量：{c}处<br/>占比：{d}%',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#628a8a', fontSize: 13 },
    },
    series: [
      {
        name: '建筑类型',
        type: 'pie',
        radius: ['28%', '68%'],
        center: ['50%', '45%'],
        roseType: 'radius',
        data,
        label: {
          color: '#314f4f',
          formatter: '{b}\n{d}%',
        },
        labelLine: { lineStyle: { color: '#8fb9b5' } },
      },
    ],
  })
}

function initTypeHeatmapChart() {
  typeHeatmapChart = echarts.init(typeHeatmapChartDom.value)

  const heatmapData = []
  dynasties.forEach((dynasty, xIndex) => {
    const typeCounts = getTypeTotalsByDynasty(dynasty)
    const typeMap = new Map(typeCounts.map((item) => [item.name, item.value]))
    buildingTypes.forEach((type, yIndex) => {
      heatmapData.push([xIndex, yIndex, typeMap.get(type) || 0])
    })
  })

  typeHeatmapChart.setOption({
    tooltip: {
      position: 'top',
      formatter(params) {
        return `${dynasties[params.value[0]]}代<br/>${buildingTypes[params.value[1]]}：${params.value[2]}处`
      },
    },
    grid: { left: '16%', right: '8%', top: '10%', bottom: '26%' },
    xAxis: {
      type: 'category',
      data: dynasties,
      axisLabel: { color: '#628a8a' },
      axisLine: { lineStyle: { color: '#9fc7c3' } },
    },
    yAxis: {
      type: 'category',
      data: buildingTypes,
      axisLabel: { color: '#628a8a' },
      axisLine: { lineStyle: { color: '#9fc7c3' } },
    },
    visualMap: {
      min: 0,
      max: Math.max(heatmapMaxValue, 1),
      show: false,
      calculable: false,
      inRange: { color: ['#eef8f6', '#9fc7c3', '#628a8a', '#355f5f'] },
    },
    graphic: [
      {
        type: 'group',
        left: 'center',
        bottom: '4%',
        children: [
          {
            type: 'rect',
            shape: {
              x: -84,
              y: 0,
              width: 168,
              height: 10,
              r: 5,
            },
            style: {
              fill: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#eef8f6' },
                { offset: 0.35, color: '#9fc7c3' },
                { offset: 0.7, color: '#628a8a' },
                { offset: 1, color: '#355f5f' },
              ]),
              stroke: 'rgba(98, 138, 138, 0.35)',
              lineWidth: 1,
            },
          },
          {
            type: 'text',
            x: -84,
            y: 22,
            style: {
              text: '0',
              fill: '#628a8a',
              font: '12px Microsoft YaHei',
              textAlign: 'center',
            },
          },
          {
            type: 'text',
            x: 84,
            y: 22,
            style: {
              text: String(heatmapMaxValue),
              fill: '#628a8a',
              font: '12px Microsoft YaHei',
              textAlign: 'center',
            },
          },
        ],
      },
    ],
    series: [
      {
        type: 'heatmap',
        data: heatmapData,
        label: { show: true, color: '#314f4f', fontSize: 13 },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(49, 79, 79, 0.25)',
          },
        },
      },
    ],
  })
}

function initRankChangeChart() {
  rankChangeChart = echarts.init(rankChangeChartDom.value)
  updateRankChangeChart()
}

function getProvinceRankingData(dynastyName = currentDynasty.value) {
  let data = []
  if (dynastyName === '全部') {
    const merged = new Map()
    Object.values(provinceDynastyData).forEach((items) => {
      items.forEach((item) => {
        merged.set(item.name, (merged.get(item.name) || 0) + item.value)
      })
    })
    data = Array.from(merged, ([name, value]) => ({ name, value }))
  } else {
    data = provinceDynastyData[dynastyName] || []
  }

  return [...data].sort((a, b) => b.value - a.value)
}

function updateRankChangeChart() {
  if (!rankChangeChart) return

  const trackedProvinces = getProvinceRankingData().slice(0, 5).map((item) => item.name)
  const dynastyValueMaps = dynasties.map((dynasty) => (
    new Map(provinceDynastyData[dynasty].map((item) => [item.name, item.value]))
  ))
  const maxValue = Math.max(
    1,
    ...trackedProvinces.flatMap((province) => (
      dynastyValueMaps.map((valueMap) => valueMap.get(province) || 0)
    )),
  )

  rankChangeChart.setOption({
    color: chartPalette,
    title: {
      text: `${currentDynasty.value === '全部' ? '全部朝代' : `${currentDynasty.value}代`}TOP5省份历代数量`,
      left: 'center',
      top: 0,
      textStyle: {
        color: '#314f4f',
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(49, 79, 79, 0.9)',
      borderColor: '#628a8a',
      textStyle: { color: '#fff' },
      formatter(params) {
        const dynasty = params[0]?.axisValue || ''
        const rows = params.map((item) => {
          const source = item.data || {}
          return `${item.marker}${item.seriesName}：${source.value}处`
        })
        return [`${dynasty}代`, ...rows].join('<br/>')
      },
    },
    legend: {
      top: 24,
      textStyle: { color: '#628a8a', fontSize: 13 },
    },
    grid: { left: '12%', right: '8%', top: '34%', bottom: '12%' },
    xAxis: {
      type: 'category',
      data: dynasties,
      axisLabel: { color: '#628a8a' },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: Math.ceil(maxValue * 1.12),
      axisLabel: { color: '#628a8a', formatter: '{value}处' },
      splitLine: { lineStyle: { color: '#d6ebe8' } },
    },
    series: trackedProvinces.map((province) => ({
      name: province,
      type: 'line',
      smooth: true,
      symbolSize: 7,
      data: dynastyValueMaps.map((valueMap) => {
        return {
          value: valueMap.get(province) || 0,
        }
      }),
      areaStyle: {
        opacity: province === trackedProvinces[0] ? 0.12 : 0,
      },
      lineStyle: {
        width: province === trackedProvinces[0] ? 3 : 2,
      },
      emphasis: {
        focus: 'series',
      },
    })),
  }, true)
  syncChartPreview()
}

function initStatusGaugeChart() {
  statusGaugeChart = echarts.init(statusGaugeChartDom.value)
  updateStatusGaugeChart()
}

function updateStatusGaugeChart() {
  if (!statusGaugeChart) return

  const data = getMergedStatusData()
  statusGaugeChart.setOption({
    color: chartPalette,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(49, 79, 79, 0.9)',
      borderColor: '#628a8a',
      textStyle: { color: '#fff' },
      formatter: '{b}<br/>占比：{c}%',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#628a8a', fontSize: 13 },
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '43%'],
        data,
        label: {
          color: '#314f4f',
          formatter: '{b}\n{c}%',
        },
      },
    ],
  })
}

function updateInsightCharts() {
  updateTypePieChart()
  updateStatusGaugeChart()
  syncChartPreview()
}

function getChartInstanceByKey(key) {
  switch (key) {
    case 'line':
      return lineChart
    case 'typePie':
      return typePieChart
    case 'statusGauge':
      return statusGaugeChart
    case 'map':
      return mapChart
    case 'dynastyRank':
      return dynastyRankChart
    case 'radar':
      return radarChart
    case 'typeHeatmap':
      return typeHeatmapChart
    case 'rankChange':
      return rankChangeChart
    default:
      return null
  }
}

function renderChartPreview() {
  if (!chartPreviewVisible.value || !chartPreviewDom.value) return

  const sourceChart = getChartInstanceByKey(chartPreviewKey.value)
  if (!sourceChart) return

  chartPreviewInstance?.dispose()
  chartPreviewInstance = echarts.init(chartPreviewDom.value)
  chartPreviewInstance.setOption(sourceChart.getOption(), true)
  chartPreviewInstance.resize()
}

function openChartPreview(key, title) {
  chartPreviewKey.value = key
  chartPreviewTitle.value = title
  chartPreviewVisible.value = true
  nextTick(() => {
    renderChartPreview()
  })
}

function closeChartPreview() {
  chartPreviewVisible.value = false
  chartPreviewTitle.value = ''
  chartPreviewKey.value = ''
  chartPreviewInstance?.dispose()
  chartPreviewInstance = null
}

function syncChartPreview() {
  if (!chartPreviewVisible.value) return
  nextTick(() => {
    renderChartPreview()
  })
}

function pauseTimelineAutoPlay() {
  timelinePlaying.value = false
  stopTimelineAutoPlay()
}

function startTimelineAutoPlay() {
  stopTimelineAutoPlay()
  timelinePlaying.value = true
  timelineTimer = window.setInterval(() => {
    const currentIndex = dynasties.indexOf(currentDynasty.value)
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % dynasties.length : 0
    applyDynastyChange(dynasties[nextIndex])
  }, 3000)
}

function stopTimelineAutoPlay() {
  if (!timelineTimer) return
  window.clearInterval(timelineTimer)
  timelineTimer = null
}

function toggleTimelinePlay() {
  if (timelinePlaying.value) {
    pauseTimelineAutoPlay()
  } else {
    startTimelineAutoPlay()
  }
}

function selectTimelineDynasty(name) {
  pauseTimelineAutoPlay()
  applyDynastyChange(name)
}

function applyDynastyChange(name) {
  currentDynasty.value = name
  selectedProvince.value = null
  renderMap()
  updateDynastyRankChart()
  updateRankChangeChart()
  updateInsightCharts()
  syncChartPreview()
}

function initMapChart() {
  mapChart = echarts.init(mapChartDom.value)
  const normalizedChinaMap = {
    ...chinaMap,
    features: chinaMap.features.filter((feature) => feature.geometry?.type !== 'MultiLineString').map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: adcodeNameMap[feature.properties.adcode] || normalizeProvinceName(feature.properties.name),
      },
    })),
  }

  echarts.registerMap('china', normalizedChinaMap)
  renderMap()
}

function renderMap() {
  const list = getProvinceMapData()
  const maxValue = Math.max(...list.map(item => item.value), 1)
  const topLabelNames = new Set(
    [...list]
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
      .map((item) => item.name),
  )
  const shouldShowMapLabel = (name, value) => {
    return value > 0 && (topLabelNames.has(name) || selectedProvince.value === name)
  }

  mapChart.setOption({
    title: {
      text: currentDynasty.value === '全部'
        ? '各省古建筑总量分布'
        : `${currentDynasty.value}代各省古建筑数量`,
      left: 'center',
      top: 6,
      textStyle: {
        color: '#314f4f',
        fontSize: 20,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter(params) {
        const value = params.value || 0
        const source = provinceDynastyRawData[params.name]?.[currentDynasty.value]?.source
        return `
          ${params.name}<br/>
          朝代：${currentDynasty.value}<br/>
          建筑数量：${value} 处${source ? `<br/>数据来源：${source}` : ''}
        `
      }
    },
    visualMap: {
      min: 0,
      max: maxValue,
      left: 16,
      bottom: 20,
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#eef8f6', '#9fc7c3', '#628a8a', '#355f5f'],
      },
      textStyle: { color: '#628a8a' },
    },
    series: [
      {
        name: '省份建筑数量',
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.18,
        data: list,
        selectedMode: 'single',
        label: {
          show: true,
          formatter(params) {
            const value = Number(params.value || 0)
            if (!shouldShowMapLabel(params.name, value)) return `{namePlain|${params.name}}`
            return `{nameTag|${params.name}}{valueTag| ${value} }`
          },
          rich: {
            namePlain: {
              color: '#315755',
              fontSize: 11,
              fontWeight: 600,
              textBorderColor: 'rgba(238, 248, 246, 0.95)',
              textBorderWidth: 2,
              padding: [1, 2, 1, 2],
            },
            nameTag: {
              color: '#5d5b55',
              fontSize: 13,
              fontWeight: 600,
              padding: [4, 8, 4, 8],
              backgroundColor: 'rgba(247, 246, 239, 0.96)',
              borderColor: '#b7b2a1',
              borderWidth: 1,
              borderRadius: [6, 0, 0, 6],
            },
            valueTag: {
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              padding: [4, 7, 4, 7],
              backgroundColor: '#f09a2d',
              borderColor: '#cb7814',
              borderWidth: 1,
              borderRadius: [0, 6, 6, 0],
            },
          },
        },
        labelLayout: {
          hideOverlap: false,
        },
        itemStyle: {
          areaColor: '#d6ebe8',
          borderColor: '#628a8a',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            formatter(params) {
              const value = Number(params.value || 0)
              return `{nameTag|${params.name}}{valueTag| ${value} }`
            },
          },
          itemStyle: { areaColor: '#f4d99c' },
        },
        select: {
          label: {
            show: true,
            formatter(params) {
              const value = Number(params.value || 0)
              return `{nameTag|${params.name}}{valueTag| ${value} }`
            },
          },
          itemStyle: {
            areaColor: '#f2c46b',
            borderColor: '#b97719',
            borderWidth: 1.5,
          },
        },
      }
    ]
  }, true)
  syncChartPreview()

  // 监听地图点击事件
  mapChart.off('click')
  mapChart.on('click', (params) => {
    if (params.componentType === 'series' && params.seriesType === 'map') {
      selectedProvince.value = params.name
      renderMap()
    }
  })
}

function initDynastyRankChart() {
  dynastyRankChart = echarts.init(dynastyRankChartDom.value)
  updateDynastyRankChart()
}

function updateDynastyRankChart() {
  if (!dynastyRankChart) return

  // 按建筑数量从大到小排序，取前10个
  const topData = getProvinceRankingData().slice(0, 10)
  const names = topData.map(item => item.name)
  const values = topData.map(item => item.value)

  const option = {
    title: {
      text: `${currentDynasty.value === '全部' ? '全部朝代' : `${currentDynasty.value}代`} · 省份建筑排行`,
      left: 'center',
      top: '2%',
      textStyle: {
        color: '#314f4f',
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: { 
      trigger: 'axis',
      backgroundColor: 'rgba(49, 79, 79, 0.9)',
      borderColor: '#628a8a',
      textStyle: { color: '#fff' },
      valueFormatter: (value) => `${value}处`,
    },
    grid: {
      left: '12%',
      right: '8%',
      top: '22%',
      bottom: '10%'
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#628a8a', fontSize: 13 },
      axisLine: { lineStyle: { color: '#9fc7c3' } },
      splitLine: { lineStyle: { color: '#d6ebe8' } }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: names,
      axisLabel: { color: '#628a8a', fontSize: 14 },
      axisLine: { lineStyle: { color: '#9fc7c3' } }
    },
    series: [
      {
        type: 'bar',
        data: values,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: '#628a8a'
        },
        label: {
          show: true,
          position: 'right',
          color: '#628a8a',
          fontSize: 13,
          fontWeight: 'bold'
        }
      }
    ]
  }

  dynastyRankChart.setOption(option)
  syncChartPreview()
}

function getProvinceMapData() {
  if (currentDynasty.value !== '全部') {
    return provinceDynastyData[currentDynasty.value]
  }

  const merged = new Map()
  Object.values(provinceDynastyData).forEach((items) => {
    items.forEach((item) => {
      merged.set(item.name, (merged.get(item.name) || 0) + item.value)
    })
  })

  return Array.from(merged, ([name, value]) => ({ name, value }))
}

function changeDynasty(name) {
  pauseTimelineAutoPlay()
  applyDynastyChange(name)
}

function handleImageError(event) {
  event.target.src = fallbackPhoto
}

function openBuildingModal(building) {
  selectedBuilding.value = building
}

function closeBuildingModal() {
  selectedBuilding.value = null
}

function startResizeDetail(event) {
  resizingDetail = true
  event.preventDefault()
  event.currentTarget.setPointerCapture?.(event.pointerId)
  document.body.style.cursor = 'ns-resize'
  document.body.style.userSelect = 'none'
  window.addEventListener('pointermove', resizeDetail)
  window.addEventListener('pointerup', stopResizeDetail)
  window.addEventListener('pointercancel', stopResizeDetail)
}

function resizeDetail(event) {
  if (!resizingDetail || !mapChartDom.value) return
  event.preventDefault()

  const mapCard = mapChartDom.value.closest('.map-card')
  if (!mapCard) return

  const cardRect = mapCard.getBoundingClientRect()
  const nextHeight = cardRect.bottom - event.clientY - 12
  detailHeight.value = Math.min(Math.max(nextHeight, 190), 440)
  
  // 延迟调用 resize，确保布局更新
  setTimeout(() => {
    mapChart?.resize()
    dynastyRankChart?.resize()
  }, 0)
}

function stopResizeDetail() {
  resizingDetail = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  window.removeEventListener('pointermove', resizeDetail)
  window.removeEventListener('pointerup', stopResizeDetail)
  window.removeEventListener('pointercancel', stopResizeDetail)
  mapChart?.resize()
  dynastyRankChart?.resize()
}

function handleResize() {
  radarChart?.resize()
  mapChart?.resize()
  lineChart?.resize()
  dynastyRankChart?.resize()
  typePieChart?.resize()
  typeHeatmapChart?.resize()
  rankChangeChart?.resize()
  statusGaugeChart?.resize()
  chartPreviewInstance?.resize()
}

onMounted(() => {
  initRadarChart()
  initLineChart()
  initTypePieChart()
  initTypeHeatmapChart()
  initRankChangeChart()
  initStatusGaugeChart()
  initMapChart()
  startTimelineAutoPlay()
  
  // 确保mapChart初始化后再初始化rankChart
  setTimeout(() => {
    initDynastyRankChart()
  }, 100)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  radarChart?.dispose()
  mapChart?.dispose()
  lineChart?.dispose()
  dynastyRankChart?.dispose()
  typePieChart?.dispose()
  typeHeatmapChart?.dispose()
  rankChangeChart?.dispose()
  statusGaugeChart?.dispose()
  chartPreviewInstance?.dispose()
  chartPreviewInstance = null
  stopTimelineAutoPlay()
  stopResizeDetail()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.big-screen-container {
  --bg-main: #e4f2ef;
  --bg-panel: rgba(232, 245, 242, 0.88);
  --bg-panel-strong: rgba(214, 234, 230, 0.95);
  --ink-main: #284948;
  --ink-sub: #557b79;
  --line-main: rgba(90, 130, 126, 0.45);
  --line-strong: rgba(64, 102, 99, 0.62);
  --accent-main: #4f8c87;
  --accent-gold: #c19a58;

  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(165deg, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0) 36%),
    repeating-linear-gradient(
      90deg,
      rgba(83, 129, 124, 0.08) 0,
      rgba(83, 129, 124, 0.08) 1px,
      transparent 1px,
      transparent 48px
    ),
    linear-gradient(180deg, #eff8f5 0%, #deefec 48%, #d5e7e4 100%);
  color: var(--ink-main);
  font-family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
  padding: 16px;
}

.big-screen-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(79, 140, 135, 0.09) 0%, rgba(79, 140, 135, 0) 22%),
    linear-gradient(0deg, rgba(193, 154, 88, 0.08) 0%, rgba(193, 154, 88, 0) 24%);
  pointer-events: none;
}

.big-screen-container > * {
  position: relative;
  z-index: 1;
}

.header {
  height: 74px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 18px 12px;
  gap: 18px;
  background:
    linear-gradient(90deg, rgba(79, 140, 135, 0.3), rgba(250, 254, 253, 0.74)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.7), rgba(226, 244, 240, 0.6));
  border: 1px solid var(--line-main);
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(36, 69, 66, 0.1);
}

.header-title-block {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 8px;
}

.title {
  font-size: 38px;
  line-height: 1;
  font-weight: 700;
  color: var(--ink-main);
  text-shadow: 0 2px 10px rgba(53, 92, 88, 0.22);
}

.header-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 3px 10px;
  color: #345f5c;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  background: rgba(245, 252, 250, 0.72);
  border: 1px solid rgba(92, 136, 132, 0.28);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.dynasty-tabs {
  flex: 0 0 auto;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px;
  background: rgba(243, 250, 248, 0.65);
  border: 1px solid rgba(95, 135, 131, 0.22);
  border-radius: 8px;
}

.tab {
  min-width: 52px;
  padding: 8px 16px;
  border: 1px solid rgba(95, 135, 131, 0.4);
  border-radius: 6px;
  cursor: pointer;
  color: var(--ink-sub);
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  background: rgba(244, 251, 249, 0.85);
  transition: background 0.2s, color 0.2s, transform 0.2s, border-color 0.2s;
}

.tab:hover {
  transform: translateY(-1px);
  border-color: rgba(84, 126, 121, 0.7);
}

.tab.active {
  background: linear-gradient(135deg, var(--accent-main), #6aa6a1);
  border-color: rgba(58, 97, 94, 0.9);
  color: #ffffff;
}

.main-content {
  display: grid;
  grid-template-columns: minmax(300px, 1.04fr) minmax(760px, 2.25fr) minmax(300px, 1.04fr);
  gap: 16px;
  height: calc(100vh - 102px);
  min-height: 0;
  padding-top: 12px;
}

.left-panel,
.right-panel,
.center-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  min-height: 0;
}

.left-panel,
.right-panel {
  overflow-y: auto;
  padding-right: 6px;
}

.left-panel .chart-card,
.right-panel .chart-card {
  flex: 1 1 0;
  min-height: 182px;
}

.left-panel::-webkit-scrollbar,
.right-panel::-webkit-scrollbar {
  width: 7px;
}

.left-panel::-webkit-scrollbar-thumb,
.right-panel::-webkit-scrollbar-thumb {
  background: rgba(86, 129, 125, 0.46);
  border: 1px solid rgba(232, 246, 243, 0.65);
  border-radius: 999px;
}

.chart-card,
.map-card {
  flex: 1;
  min-height: 0;
  background:
    linear-gradient(180deg, rgba(240, 250, 247, 0.94) 0%, var(--bg-panel-strong) 100%);
  border: 1px solid var(--line-main);
  border-radius: 8px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.52),
    0 14px 26px rgba(44, 76, 72, 0.1);
  padding: 14px 14px 12px;
}

.chart-card {
  position: relative;
  overflow: hidden;
}

.chart-card::before {
  content: "";
  position: absolute;
  left: 14px;
  right: 14px;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(79, 140, 135, 0.72), rgba(193, 154, 88, 0.54), rgba(79, 140, 135, 0));
}

.card-title {
  display: flex;
  align-items: center;
  min-height: 24px;
  margin: 0;
  color: var(--ink-main);
  font-size: 18px;
  line-height: 1.2;
  font-weight: 700;
  border-left: 3px solid var(--accent-main);
  padding-left: 8px;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.chart-expand-btn {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  color: var(--ink-main);
  font-size: 16px;
  line-height: 1;
  background: rgba(244, 251, 249, 0.95);
  border: 1px solid rgba(90, 130, 126, 0.45);
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.chart-expand-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(63, 109, 104, 0.85);
  background: rgba(233, 247, 243, 0.98);
}

.chart,
.map-chart {
  position: relative;
  width: 100%;
  height: calc(100% - 34px);
}

.map-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 2.25fr 1fr;
  gap: 12px;
}

.map-chart {
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.map-chart-wrap,
.dynasty-rank-wrap {
  position: relative;
  display: flex;
  min-height: 0;
  width: 100%;
  height: 100%;
}

.rank-expand-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.map-timeline {
  flex: 0 0 58px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 10px;
  padding: 8px 14px 6px;
  background: linear-gradient(180deg, rgba(232, 246, 243, 0.92), rgba(219, 238, 234, 0.85));
  border: 1px solid rgba(95, 136, 131, 0.4);
  border-radius: 6px;
}

.timeline-play {
  width: 30px;
  height: 30px;
  color: #3f726d;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  background: rgba(245, 252, 250, 0.95);
  border: 2px solid rgba(111, 157, 151, 0.72);
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.timeline-play:hover {
  transform: translateY(-1px);
  border-color: rgba(63, 109, 104, 0.9);
}

.timeline-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: start;
  min-height: 38px;
}

.timeline-track::before,
.timeline-progress {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 11px;
  height: 3px;
  border-radius: 999px;
}

.timeline-track::before {
  background: rgba(127, 178, 171, 0.9);
}

.timeline-progress {
  right: auto;
  background: linear-gradient(90deg, #5e9f99, #4f8c87);
  transition: width 0.25s ease;
}

.timeline-node {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 5px;
  min-width: 0;
  padding: 0;
  color: var(--ink-sub);
  font-size: 12px;
  font-weight: 700;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  background: #98c4bf;
  border: 2px solid #eff8f6;
  border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(98, 138, 138, 0.18);
}

.timeline-node.active {
  color: var(--ink-main);
}

.timeline-node.active .timeline-dot {
  width: 16px;
  height: 16px;
  margin-top: -2px;
  background: #4f8c87;
  border-color: #d8b475;
}

.timeline-label {
  line-height: 1;
}

.dynasty-rank-chart {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(230, 246, 243, 0.8), rgba(216, 237, 233, 0.6));
  border: 1px solid rgba(98, 138, 138, 0.38);
  border-radius: 6px;
  padding: 0;
}

.detail-resizer {
  flex: 0 0 18px;
  margin-top: 8px;
  cursor: ns-resize;
  position: relative;
  z-index: 2;
  touch-action: none;
  user-select: none;
}

.detail-resizer::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 7px;
  width: 96px;
  height: 4px;
  background: linear-gradient(90deg, rgba(79, 140, 135, 0.35), rgba(79, 140, 135, 0.72), rgba(79, 140, 135, 0.35));
  border-radius: 999px;
  transform: translateX(-50%);
}

.province-detail {
  flex: 0 0 280px;
  min-height: 0;
  padding-top: 12px;
  border-top: 1px solid rgba(86, 126, 122, 0.5);
}

.detail-title {
  margin-bottom: 10px;
  color: var(--ink-main);
  font-size: 18px;
  font-weight: 700;
  padding-left: 2px;
}

.building-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  height: calc(100% - 30px);
  overflow-y: auto;
  padding-right: 6px;
}

.building-card {
  display: grid;
  grid-template-columns: minmax(160px, 32%) minmax(0, 1fr);
  gap: 10px;
  min-width: 0;
  min-height: 108px;
  overflow: hidden;
  padding: 10px;
  background: linear-gradient(180deg, rgba(237, 249, 246, 0.95), rgba(220, 240, 236, 0.86));
  border: 1px solid rgba(98, 138, 138, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.building-card:hover {
  border-color: rgba(79, 140, 135, 0.85);
  box-shadow: 0 10px 18px rgba(39, 71, 68, 0.14);
  transform: translateY(-1px);
}

.building-photo {
  width: 100%;
  height: 88px;
  object-fit: cover;
  border-radius: 4px;
  background: rgba(207, 230, 227, 0.9);
}

.building-info {
  min-width: 0;
}

.building-name {
  overflow: hidden;
  color: var(--ink-main);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.building-meta {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 8px;
  color: var(--ink-sub);
  font-size: 14px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.empty-detail {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  min-height: 70px;
  color: var(--ink-sub);
  border: 1px dashed rgba(98, 138, 138, 0.6);
  border-radius: 6px;
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: rgba(24, 48, 48, 0.42);
  backdrop-filter: blur(3px);
}

.chart-preview-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(20, 40, 40, 0.5);
  backdrop-filter: blur(3px);
}

.chart-preview-modal {
  width: min(1220px, 94vw);
  height: min(760px, 86vh);
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(238, 250, 247, 0.98), rgba(221, 241, 237, 0.96));
  border: 1px solid rgba(90, 130, 126, 0.5);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(24, 48, 48, 0.35);
  overflow: hidden;
}

.chart-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(98, 138, 138, 0.35);
  background: rgba(232, 246, 243, 0.7);
}

.chart-preview-title {
  margin: 0;
  color: var(--ink-main);
  font-size: 22px;
  font-weight: 700;
}

.chart-preview-close {
  width: 34px;
  height: 34px;
  color: #ffffff;
  font-size: 24px;
  line-height: 1;
  background: rgba(49, 79, 79, 0.86);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.chart-preview-body {
  flex: 1;
  min-height: 0;
}

.building-modal {
  position: relative;
  display: grid;
  grid-template-columns: minmax(360px, 52%) minmax(280px, 1fr);
  width: min(980px, 92vw);
  max-height: 82vh;
  overflow: hidden;
  background: linear-gradient(180deg, #e9f7f4, #dff1ee);
  border: 1px solid rgba(98, 138, 138, 0.75);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(24, 48, 48, 0.35);
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 1;
  width: 34px;
  height: 34px;
  color: #ffffff;
  font-size: 24px;
  line-height: 1;
  background: rgba(49, 79, 79, 0.82);
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.modal-photo {
  width: 100%;
  height: 100%;
  min-height: 360px;
  object-fit: contain;
  background: #cfe6e3;
}

.modal-content {
  overflow-y: auto;
  padding: 34px 32px 32px;
}

.modal-title {
  margin: 0 0 28px;
  color: var(--ink-main);
  font-size: 34px;
  line-height: 1.3;
  font-weight: 700;
}

.modal-info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-bottom: 32px;
  padding-bottom: 28px;
  border-bottom: 1px solid rgba(98, 138, 138, 0.25);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  color: #628a8a;
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.info-value {
  color: #314f4f;
  font-size: 18px;
  font-weight: 600;
}

.modal-section {
  margin-top: 24px;
}

.section-title {
  margin: 0 0 14px;
  color: var(--accent-main);
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
}

.modal-desc {
  margin: 0;
  color: #2f5755;
  font-size: 16px;
  line-height: 1.85;
}

@media (max-width: 1600px) {
  .title {
    font-size: 30px;
  }

  .header-stats {
    gap: 6px;
  }

  .stat-pill {
    font-size: 12px;
    padding-inline: 8px;
  }

  .main-content {
    grid-template-columns: minmax(250px, 1fr) minmax(620px, 2.1fr) minmax(250px, 1fr);
  }

  .left-panel .chart-card,
  .right-panel .chart-card {
    min-height: 170px;
  }
}

@media (max-width: 1280px) {
  .big-screen-container {
    padding: 10px;
  }

  .header {
    height: auto;
    min-height: 64px;
    align-items: flex-start;
    flex-direction: column;
    padding: 8px 12px;
  }

  .title {
    font-size: 26px;
  }

  .dynasty-tabs {
    width: 100%;
    overflow-x: auto;
  }

  .main-content {
    grid-template-columns: 1fr;
    height: auto;
    gap: 12px;
  }

  .left-panel,
  .right-panel {
    overflow: visible;
    padding-right: 0;
  }

  .left-panel .chart-card,
  .right-panel .chart-card {
    min-height: 260px;
  }

  .map-card {
    min-height: 780px;
  }
}
</style>
