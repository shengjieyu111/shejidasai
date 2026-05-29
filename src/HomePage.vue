<template>
  <main class="portal-shell">
    <section class="hero-screen">
      <div ref="canvasHost" class="model-stage"></div>

      <section class="hero-copy">
        <p class="eyebrow">中国古建筑数字可视化系统</p>
        <h1>华构工韵</h1>
        <p>
          以空间分布、历史演化、形制结构、材料工艺与保护风险为线索，
          构建古建筑专题数据的统一入口。
        </p>
        <div class="hero-actions">
          <a class="primary-link" :href="activeProject.entry">进入当前专题</a>
          <button class="plain-btn" type="button" @click="scrollToTopics">下滑浏览专题</button>
          <span class="load-state">{{ loadState }}</span>
        </div>
      </section>

      <button class="scroll-cue" type="button" @click="scrollToTopics">
        <span>向下</span>
      </button>
    </section>

    <section ref="topicsSection" class="topic-screen">
      <div class="topic-rail-head">
        <div>
          <p class="eyebrow">专题大屏</p>
          <h2>{{ activeProject.name }}</h2>
        </div>
        <div class="rail-actions">
          <button type="button" @click="scrollToProject(activeIndex - 1)">上一屏</button>
          <button type="button" @click="scrollToProject(activeIndex + 1)">下一屏</button>
        </div>
      </div>

      <div ref="topicScroller" class="topic-scroller" @scroll="onTopicScroll" @wheel="onTopicWheel">
        <article
          v-for="(project, index) in projects"
          :key="project.id"
          class="topic-slide"
          :class="{ active: index === activeIndex }"
        >
          <div class="slide-copy">
            <span class="slide-order">{{ project.order }}</span>
            <p class="eyebrow">{{ project.kicker }}</p>
            <h3>{{ project.name }}</h3>
            <p>{{ project.description }}</p>
            <a :href="project.entry">进入页面</a>
          </div>

          <div class="slide-visual" :style="{ '--accent': project.color }">
            <div class="orb"></div>
            <div class="screen-lines">
              <span v-for="line in 9" :key="line"></span>
            </div>
            <strong>{{ project.shortName }}</strong>
          </div>
        </article>
      </div>

      <div class="topic-dots" aria-label="专题切换">
        <button
          v-for="(project, index) in projects"
          :key="`dot-${project.id}`"
          type="button"
          :class="{ active: index === activeIndex }"
          @click="scrollToProject(index)"
        >
          <span>{{ project.shortName }}</span>
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import modelUrl from './modelToUsed.glb?url'

const projects = [
  {
    id: 'spatial',
    order: '01',
    shortName: '空间',
    name: '空间分布大屏',
    kicker: 'Spatial Distribution',
    description: '展示古建筑保护单位在全国与省域尺度上的分布密度、区域差异和空间聚集关系。',
    entry: './spatial.html',
    color: '#4f8aa0',
  },
  {
    id: 'history',
    order: '02',
    shortName: '历史',
    name: '历史演化图谱',
    kicker: 'History Timeline',
    description: '从朝代脉络、建筑样本和修缮信息观察古建筑遗产的形成、延续与演变。',
    entry: './history.html',
    color: '#c35d4f',
  },
  {
    id: 'structure',
    order: '03',
    shortName: '结构',
    name: '形制结构分析',
    kicker: 'Structure Dashboard',
    description: '围绕建筑类型、构造层级、地域特征和样本表格进行结构形制专题分析。',
    entry: './structure.html',
    color: '#8b6f3d',
  },
  {
    id: 'materials',
    order: '04',
    shortName: '材料',
    name: '材料工艺大屏',
    kicker: 'Materials Craft',
    description: '梳理木、砖、石、瓦等材料及其传统工艺流程、来源关系和构造表达。',
    entry: './materials.html',
    color: '#4f8d70',
  },
  {
    id: 'protection',
    order: '05',
    shortName: '保护',
    name: '保护风险看板',
    kicker: 'Protection Risk',
    description: '聚焦病害识别、风险预警、数字化进度和修缮投入，服务保护状态研判。',
    entry: './protection.html',
    color: '#b34c68',
  },
]

const canvasHost = ref(null)
const topicScroller = ref(null)
const topicsSection = ref(null)
const activeIndex = ref(0)
const loadState = ref('模型加载中')
const activeProject = computed(() => projects[activeIndex.value] || projects[0])

let scene
let camera
let renderer
let controls
let particleSystem
let frameId = 0
let disposed = false
let clock
let isPointerOverStage = false

const MODEL_POINT_TARGET = 125000
const MODEL_VIEW_SIZE = 4.8
const PARTICLE_BASE_SIZE = 4.1
const pointerTarget = new THREE.Vector2(10, 10)
const pointerCurrent = new THREE.Vector2(10, 10)
let interactionTarget = 0
let interactionCurrent = 0

function scrollToTopics() {
  topicsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToProject(index) {
  const nextIndex = Math.max(0, Math.min(projects.length - 1, index))
  activeIndex.value = nextIndex
  const scroller = topicScroller.value
  if (!scroller) {
    scrollToTopics()
    return
  }

  scrollToTopics()
  scroller.scrollTo({
    left: scroller.clientWidth * nextIndex,
    behavior: 'smooth',
  })
}

function onTopicScroll() {
  const scroller = topicScroller.value
  if (!scroller) return
  activeIndex.value = Math.round(scroller.scrollLeft / scroller.clientWidth)
}

function onTopicWheel(event) {
  if (!topicScroller.value || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
  event.preventDefault()
  topicScroller.value.scrollBy({ left: event.deltaY, behavior: 'smooth' })
}

async function init() {
  if (disposed || !canvasHost.value) return

  clock = new THREE.Clock()
  initThree()
  loadModel()
  animate()
}

function initThree() {
  scene = new THREE.Scene()
  scene.background = null
  scene.fog = new THREE.FogExp2(0xe4f2ef, 0.004)

  camera = new THREE.PerspectiveCamera(45, canvasHost.value.clientWidth / canvasHost.value.clientHeight, 0.1, 100)
  camera.position.set(0.1, 0.95, 5.4)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.setSize(canvasHost.value.clientWidth, canvasHost.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  canvasHost.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.055
  controls.enablePan = false
  controls.minDistance = 3.2
  controls.maxDistance = 7.2
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.45

  renderer.domElement.addEventListener('pointermove', onPointerMove)
  renderer.domElement.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('resize', onResize)
}

function createParticleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.56, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.82, 'rgba(255,255,255,0.28)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

function loadModel() {
  const loader = new GLTFLoader()
  loadState.value = '模型文件读取中'

  loader.load(
    modelUrl,
    (gltf) => {
      if (disposed) return
      const triangles = collectModelTriangles(gltf.scene)

      if (triangles.items.length === 0) {
        loadState.value = '模型暂无可用面片'
        return
      }

      const sampled = sampleModelSurface(triangles.items, triangles.totalArea, MODEL_POINT_TARGET)
      createParticleSystem(sampled.positions, sampled.normals)
      loadState.value = '模型已就绪'
    },
    (xhr) => {
      if (xhr.total > 0) {
        loadState.value = `模型加载 ${Math.round((xhr.loaded / xhr.total) * 100)}%`
      }
    },
    () => {
      loadState.value = '模型加载失败'
    },
  )
}

function collectModelTriangles(root) {
  const items = []
  let totalArea = 0

  root.updateMatrixWorld(true)
  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return

    const geometry = child.geometry
    const positionAttr = geometry.attributes.position
    const normalAttr = geometry.attributes.normal
    const indexAttr = geometry.index
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld)

    const a = new THREE.Vector3()
    const b = new THREE.Vector3()
    const c = new THREE.Vector3()
    const na = new THREE.Vector3()
    const nb = new THREE.Vector3()
    const nc = new THREE.Vector3()
    const ab = new THREE.Vector3()
    const ac = new THREE.Vector3()

    const readVertex = (target, normalTarget, vertexIndex) => {
      target.fromBufferAttribute(positionAttr, vertexIndex).applyMatrix4(child.matrixWorld)
      if (normalAttr) {
        normalTarget.fromBufferAttribute(normalAttr, vertexIndex).applyMatrix3(normalMatrix).normalize()
      } else {
        normalTarget.set(0, 1, 0)
      }
    }

    const addTriangle = (ia, ib, ic) => {
      readVertex(a, na, ia)
      readVertex(b, nb, ib)
      readVertex(c, nc, ic)

      ab.subVectors(b, a)
      ac.subVectors(c, a)
      const area = ab.cross(ac).length() * 0.5
      if (area <= 0.000001) return

      items.push({
        a: a.clone(),
        b: b.clone(),
        c: c.clone(),
        na: na.clone(),
        nb: nb.clone(),
        nc: nc.clone(),
        area,
      })
      totalArea += area
    }

    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i += 3) {
        addTriangle(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2))
      }
    } else {
      for (let i = 0; i < positionAttr.count; i += 3) {
        addTriangle(i, i + 1, i + 2)
      }
    }
  })

  return { items, totalArea }
}

function sampleModelSurface(triangles, totalArea, pointCount) {
  const positions = new Float32Array(pointCount * 3)
  const normals = new Float32Array(pointCount * 3)
  const cumulativeAreas = []
  let accumulatedArea = 0

  triangles.forEach((triangle) => {
    accumulatedArea += triangle.area
    cumulativeAreas.push(accumulatedArea)
  })

  const pickTriangle = (value) => {
    let low = 0
    let high = cumulativeAreas.length - 1
    while (low < high) {
      const mid = (low + high) >> 1
      if (value <= cumulativeAreas[mid]) high = mid
      else low = mid + 1
    }
    return triangles[low]
  }

  const p = new THREE.Vector3()
  const n = new THREE.Vector3()

  for (let i = 0; i < pointCount; i++) {
    const triangle = pickTriangle(Math.random() * totalArea)
    const r1 = Math.sqrt(Math.random())
    const r2 = Math.random()
    const wa = 1 - r1
    const wb = r1 * (1 - r2)
    const wc = r1 * r2

    p.set(0, 0, 0)
      .addScaledVector(triangle.a, wa)
      .addScaledVector(triangle.b, wb)
      .addScaledVector(triangle.c, wc)
    n.set(0, 0, 0)
      .addScaledVector(triangle.na, wa)
      .addScaledVector(triangle.nb, wb)
      .addScaledVector(triangle.nc, wc)
      .normalize()

    const offset = i * 3
    positions[offset] = p.x
    positions[offset + 1] = p.y
    positions[offset + 2] = p.z
    normals[offset] = n.x
    normals[offset + 1] = n.y
    normals[offset + 2] = n.z
  }

  return { positions, normals }
}

function createParticleSystem(positions, normals) {
  const pointCount = positions.length / 3
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(normals, 3))

  const randomSeeds = new Float32Array(pointCount)
  for (let i = 0; i < pointCount; i++) {
    randomSeeds[i] = Math.random()
  }
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(randomSeeds, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: createParticleTexture() },
      uMouse: { value: pointerCurrent },
      uInteraction: { value: 0 },
      uPointSize: { value: PARTICLE_BASE_SIZE },
    },
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uInteraction;
      uniform float uPointSize;
      attribute vec3 aNormal;
      attribute float aSeed;
      varying float vAgeFlow;
      varying float vInteraction;
      varying float vLight;

      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      vec3 noise3d(vec3 p) {
        return vec3(hash(p.x + p.y), hash(p.y + p.z), hash(p.z + p.x)) - 0.5;
      }

      void main() {
        vec3 pos = position;
        float breath = sin(uTime * 1.15 + aSeed * 6.2831) * 0.5 + 0.5;
        pos += aNormal * breath * 0.008;
        pos += noise3d(position * 12.0 + uTime * 0.18) * 0.004;

        vec4 baseClip = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        vec2 screenPos = baseClip.xy / max(baseClip.w, 0.0001);
        float pointerDist = distance(screenPos, uMouse);
        float pointerInfluence = smoothstep(0.36, 0.0, pointerDist) * uInteraction;

        vec3 lightDir = normalize(vec3(-0.32, 0.9, 0.46));
        vLight = 0.74 + max(dot(normalize(normalMatrix * aNormal), lightDir), 0.0) * 1.05;
        vAgeFlow = sin(position.y * 3.2 + uTime * 0.9 + aSeed * 6.2831) * 0.5 + 0.5;
        vInteraction = pointerInfluence;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float sizePulse = 1.0 + breath * 0.16 + pointerInfluence * 0.42;
        gl_PointSize = uPointSize * sizePulse * (3.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying float vAgeFlow;
      varying float vInteraction;
      varying float vLight;

      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        float alpha = texColor.a * 0.98;
        alpha *= 1.0 + vInteraction * 0.18;
        vec3 shadowColor = vec3(0.015, 0.12, 0.105);
        vec3 jadeColor = vec3(0.04, 0.30, 0.25);
        vec3 bronzeColor = vec3(0.34, 0.25, 0.12);
        vec3 goldColor = vec3(0.72, 0.50, 0.18);

        vec3 baseColor = mix(shadowColor, jadeColor, vLight);
        baseColor = mix(baseColor, bronzeColor, 0.14);
        baseColor = mix(baseColor, goldColor, vAgeFlow * 0.22);
        baseColor += goldColor * vInteraction * 0.22;

        gl_FragColor = vec4(baseColor * 1.08, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  })

  particleSystem = new THREE.Points(geometry, material)

  geometry.computeBoundingBox()
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  geometry.boundingBox.getCenter(center)
  geometry.boundingBox.getSize(size)

  const maxSize = Math.max(size.x, size.y, size.z) || 1
  const scale = MODEL_VIEW_SIZE / maxSize
  particleSystem.position.copy(center).multiplyScalar(-scale)
  particleSystem.position.x += 2.15
  particleSystem.position.y += 0.05
  particleSystem.scale.setScalar(scale)

  scene.add(particleSystem)
}

function animate() {
  frameId = requestAnimationFrame(animate)

  const elapsedTime = clock.getElapsedTime()
  if (particleSystem) {
    const autoRotateBlend = isPointerOverStage ? 0.35 : 1
    particleSystem.rotation.y += 0.0012 * autoRotateBlend
    pointerCurrent.lerp(pointerTarget, 0.12)
    interactionCurrent += (interactionTarget - interactionCurrent) * 0.1

    particleSystem.material.uniforms.uTime.value = elapsedTime
    particleSystem.material.uniforms.uInteraction.value = interactionCurrent
    particleSystem.material.uniforms.uPointSize.value = PARTICLE_BASE_SIZE + interactionCurrent * 0.55
  }

  controls?.update()
  renderer?.render(scene, camera)
}

function onPointerMove(event) {
  if (!renderer?.domElement) return

  const rect = renderer.domElement.getBoundingClientRect()
  pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointerTarget.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  interactionTarget = 1
  isPointerOverStage = true
  if (controls) controls.autoRotateSpeed = 0.18
}

function onPointerLeave() {
  pointerTarget.set(10, 10)
  interactionTarget = 0
  isPointerOverStage = false
  if (controls) controls.autoRotateSpeed = 0.45
}

function onResize() {
  if (!canvasHost.value || !camera || !renderer) return

  camera.aspect = canvasHost.value.clientWidth / canvasHost.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasHost.value.clientWidth, canvasHost.value.clientHeight)
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frameId)
  window.removeEventListener('resize', onResize)
  renderer?.domElement?.removeEventListener('pointermove', onPointerMove)
  renderer?.domElement?.removeEventListener('pointerleave', onPointerLeave)
  controls?.dispose()
  particleSystem?.geometry?.dispose()
  particleSystem?.material?.uniforms?.uTexture?.value?.dispose()
  particleSystem?.material?.dispose()
  renderer?.dispose()
  renderer?.domElement?.remove()
})
</script>

<style scoped>
.portal-shell {
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  color: #254746;
  background: #edf6f3;
}

.hero-screen,
.topic-screen {
  position: relative;
  min-height: 100vh;
  scroll-snap-align: start;
  overflow: hidden;
}

.hero-screen {
  background:
    radial-gradient(circle at 72% 44%, rgba(79, 140, 135, 0.18), transparent 35%),
    linear-gradient(135deg, #f3faf8 0%, #dceee9 56%, #eadfcb 100%);
}

.model-stage {
  position: absolute;
  inset: 0;
  z-index: 0;
}

:deep(.model-stage canvas) {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

:deep(.model-stage canvas:active) {
  cursor: grabbing;
}

.model-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(243, 250, 248, 0.98) 0%, rgba(243, 250, 248, 0.64) 28%, rgba(243, 250, 248, 0) 48%),
    linear-gradient(180deg, rgba(37, 71, 70, 0.06), transparent);
}

.plain-btn,
.rail-actions button {
  border: 1px solid rgba(79, 140, 135, 0.32);
  border-radius: 6px;
  color: #355f5f;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-weight: 800;
}

.hero-copy {
  position: relative;
  z-index: 1;
  width: min(680px, 58vw);
  margin-left: 32px;
  padding-top: min(24vh, 190px);
}

.eyebrow {
  margin: 0 0 14px;
  color: #6f6a58;
  font-size: 15px;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: #254746;
  font-size: clamp(66px, 8.5vw, 138px);
  line-height: 0.92;
  font-weight: 950;
  letter-spacing: 0;
}

.hero-copy p:not(.eyebrow) {
  width: min(610px, 100%);
  margin: 24px 0 0;
  color: #557b79;
  font-size: clamp(17px, 1.5vw, 23px);
  line-height: 1.76;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 36px;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 24px;
  border-radius: 6px;
  color: #fff;
  background: linear-gradient(135deg, #4f8c87, #355f5f);
  box-shadow: 0 14px 34px rgba(53, 95, 95, 0.24);
  font-weight: 900;
  text-decoration: none;
}

.plain-btn {
  height: 44px;
  padding: 0 18px;
}

.load-state {
  color: #6f6a58;
  font-size: 14px;
}

.scroll-cue {
  position: absolute;
  left: 32px;
  bottom: 26px;
  z-index: 1;
  width: 44px;
  height: 72px;
  border: 1px solid rgba(79, 140, 135, 0.3);
  border-radius: 999px;
  color: #355f5f;
  background: rgba(255, 255, 255, 0.48);
  cursor: pointer;
}

.scroll-cue span {
  writing-mode: vertical-rl;
  font-size: 12px;
  font-weight: 900;
}

.topic-screen {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 18px;
  padding: 26px 28px 22px;
  background:
    linear-gradient(135deg, rgba(237, 246, 243, 0.96), rgba(228, 237, 231, 0.96)),
    radial-gradient(circle at 80% 12%, rgba(79, 140, 135, 0.18), transparent 34%);
}

.topic-rail-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  min-height: 74px;
}

.topic-rail-head h2 {
  margin: 0;
  color: #254746;
  font-size: clamp(30px, 4vw, 56px);
  line-height: 1;
}

.rail-actions {
  display: flex;
  gap: 8px;
}

.rail-actions button {
  height: 36px;
  padding: 0 13px;
}

.topic-scroller {
  min-height: 0;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  border-radius: 10px;
}

.topic-scroller::-webkit-scrollbar {
  height: 0;
}

.topic-slide {
  position: relative;
  flex: 0 0 100%;
  min-width: 0;
  scroll-snap-align: start;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(360px, 1.08fr);
  gap: 28px;
  padding: clamp(26px, 4vw, 58px);
  overflow: hidden;
  border: 1px solid rgba(79, 140, 135, 0.22);
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(251, 255, 253, 0.92), rgba(236, 245, 241, 0.84)),
    linear-gradient(120deg, rgba(255, 255, 255, 0.74), rgba(255, 255, 255, 0));
}

.slide-copy {
  align-self: center;
  max-width: 680px;
}

.slide-order {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: 1px solid rgba(79, 140, 135, 0.28);
  border-radius: 50%;
  color: #6f6a58;
  font-weight: 950;
}

.slide-copy h3 {
  margin: 18px 0 0;
  color: #254746;
  font-size: clamp(42px, 6.5vw, 92px);
  line-height: 0.94;
  letter-spacing: 0;
}

.slide-copy p:not(.eyebrow) {
  margin: 24px 0 0;
  color: #557b79;
  font-size: clamp(17px, 1.7vw, 25px);
  line-height: 1.7;
}

.slide-copy a {
  display: inline-flex;
  align-items: center;
  height: 42px;
  margin-top: 30px;
  padding: 0 20px;
  border-radius: 6px;
  color: #fff;
  background: #355f5f;
  font-weight: 900;
  text-decoration: none;
}

.slide-visual {
  position: relative;
  min-height: 420px;
  align-self: stretch;
  overflow: hidden;
  border-radius: 10px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.58) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.58) 1px, transparent 1px),
    linear-gradient(135deg, color-mix(in srgb, var(--accent), #ffffff 78%), rgba(255, 255, 255, 0.58));
  background-size: 38px 38px, 38px 38px, auto;
  box-shadow: inset 0 0 0 1px rgba(79, 140, 135, 0.16);
}

.orb {
  position: absolute;
  right: -120px;
  bottom: -130px;
  width: 390px;
  height: 390px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.32;
  filter: blur(2px);
}

.screen-lines {
  position: absolute;
  inset: 46px;
  display: grid;
  grid-template-rows: repeat(9, 1fr);
  gap: 14px;
}

.screen-lines span {
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(53, 95, 95, 0.28), rgba(255, 255, 255, 0));
}

.slide-visual strong {
  position: absolute;
  left: 44px;
  bottom: 38px;
  color: rgba(37, 71, 70, 0.14);
  font-size: clamp(64px, 9vw, 150px);
  line-height: 1;
  font-weight: 950;
}

.topic-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.topic-dots button {
  height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(79, 140, 135, 0.26);
  border-radius: 999px;
  color: #557b79;
  background: rgba(255, 255, 255, 0.52);
  cursor: pointer;
  font-weight: 800;
}

.topic-dots button.active {
  color: #fff;
  background: #355f5f;
}

@media (max-width: 900px) {
  .hero-copy {
    width: auto;
    margin: 0 18px;
    padding-top: 82px;
  }

  .model-stage {
    opacity: 0.78;
  }

  .model-stage::after {
    background: linear-gradient(180deg, rgba(243, 250, 248, 0.92), rgba(243, 250, 248, 0.3));
  }

  .topic-screen {
    padding: 18px;
  }

  .topic-slide {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .slide-visual {
    min-height: 260px;
  }
}
</style>
