<template>
  <main class="portal-shell">
    <section class="hero-screen">
      <div ref="canvasHost" class="model-stage"></div>

      <section class="hero-copy">
        <p class="eyebrow">中国古建筑数字可视化系统</p>
        <span class="brand-latin">SinoCraft Vis</span>
        <h1>华构工韵</h1>
        <p class="hero-tagline">与你一起，看见中国古建筑的千年回响</p>
        <div class="hero-narrative">
          <p v-for="paragraph in heroIntro" :key="paragraph">{{ paragraph }}</p>
        </div>
        <div class="hero-actions">
          <button class="plain-btn" type="button" @click="scrollToTopics">下滑浏览专题</button>
          <span class="load-state">{{ loadState }}</span>
        </div>
      </section>

      <button class="scroll-cue" type="button" aria-label="向下滑动浏览专题" @click="scrollToTopics">
        <span class="scroll-arrow" aria-hidden="true"></span>
        <span class="scroll-arrow" aria-hidden="true"></span>
      </button>
    </section>

    <section ref="topicsSection" class="topic-screen">
      <div ref="topicScroller" class="topic-scroller" @scroll="onTopicScroll" @wheel="onTopicWheel">
        <article
          v-for="(project, index) in projects"
          :key="project.id"
          class="topic-slide"
          :class="{ active: index === activeIndex }"
        >
          <div class="slide-copy">
            <p class="slide-title-note">{{ project.sectionTitle }}</p>
            <p class="slide-lead">{{ project.description }}</p>
            <div class="slide-story">
              <p v-for="paragraph in project.story" :key="paragraph">{{ paragraph }}</p>
            </div>
            <a :href="project.entry">进入页面</a>
          </div>

          <div class="slide-visual" :class="`scene-${project.id}`" :style="{ '--accent': project.color }">
            <TopicParticleSculpture :scene="project.id" :accent="project.color" :active="index === activeIndex" />
            <div class="particle-rings" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </article>
      </div>

      <div class="topic-dots" aria-label="专题切换">
        <button
          v-for="(project, index) in projects"
          :key="`dot-${project.id}`"
          type="button"
          :class="{ active: index === activeIndex }"
          :aria-label="project.name"
          @click="scrollToProject(index)"
        ></button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import TopicParticleSculpture from './components/TopicParticleSculpture.vue'
import modelUrl from './modelToUsed.glb?url'

const heroIntro = [
  '中国古建筑从来不只是古老的房屋。它们站在山河之间，穿过朝代、风雨与人间烟火，把一代代人的审美、技艺和生活方式留到了今天。',
  '华构工韵 SinoCraft Vis 想做的，是陪你重新靠近它们。不是隔着资料去阅读，也不是停留在遥远的欣赏，而是通过数据、图像与交互，让那些沉默已久的建筑，再一次被看见、被理解、被珍惜。',
]

const projects = [
  {
    id: 'spatial',
    order: '01',
    shortName: '空间',
    name: '空间分布大屏',
    kicker: 'Spatial Distribution',
    sectionTitle: '我们从一张地图开始，重新点亮古建筑的位置',
    description: '从一张中国地图开始。',
    story: [
      '当古建筑被重新放回山河之间，你会看到，它们像星点一样在大地上亮起。有的靠近古城，有的隐入群山，有的沿着河流生长，有的留在村落深处。',
      '这些点位并不只是坐标。它们是文明停留过的地方，是时间在大地上留下的印记。',
      '在空间分布大屏里，我们希望先陪你了解一个最朴素的问题：这些古建筑在哪里？而当你看见它们的位置，也会慢慢看见它们独特的文化和历史。',
    ],
    entry: './spatial.html',
    color: '#4f8aa0',
  },
  {
    id: 'history',
    order: '02',
    shortName: '历史',
    name: '历史演化图谱',
    kicker: 'History Timeline',
    sectionTitle: '我们沿着时间，寻找建筑风格留下的年轮',
    description: '走过地图后，我们再把时间轻轻展开。',
    story: [
      '你会发现，古建筑并不是停在某个朝代里的旧物。唐的开阔，宋的清雅，元的交融，明清的沉稳，都曾在建筑身上留下痕迹。它们像年轮一样，一层层写进屋檐、院落与空间的气韵之中。',
      '历史演化图谱，是一条可以慢慢阅读的时间长河。你要看到的不只是“它属于哪个时代”，而是它怎样从历史深处走来，又怎样带着一个时代的气质，留在今天。',
      '当时间被看见，古建筑也就不再遥远。',
    ],
    entry: './history.html',
    color: '#c35d4f',
  },
  {
    id: 'structure',
    order: '03',
    shortName: '结构',
    name: '形制结构分析',
    kicker: 'Structure Dashboard',
    sectionTitle: '走近建筑，读懂它沉默的秩序',
    description: '如果再靠近一些，你会发现，古建筑的美并不只在外表。',
    story: [
      '它的端正、舒展、克制与庄重，背后都有属于东方营造的分寸。那些不轻易显露的秩序，藏在梁柱之间，也藏在空间的呼吸里。',
      '形制结构分析大屏，不是把建筑拆成冰冷的构件，而是陪你慢慢读懂它为什么这样存在。为什么它看起来庄重，为什么它显得舒展，为什么千年之后，仍然有一种安静而稳定的力量。',
      '我们希望你在这里看到的，不只是建筑的形，更是形背后的精神。',
    ],
    entry: './structure.html',
    color: '#8b6f3d',
  },
  {
    id: 'materials',
    order: '04',
    shortName: '材料',
    name: '材料工艺大屏',
    kicker: 'Materials Craft',
    sectionTitle: '我们把目光落到木石砖瓦，听见匠作的回声',
    description: '再靠近一些，建筑开始拥有温度。',
    story: [
      '木材有纹理，砖瓦有烧痕，石料有重量，彩绘有余韵。那些被时间留下来的痕迹，像是匠人与材料之间的低声对话。',
      '材料工艺大屏，想带你看见一座建筑如何从木石砖瓦开始，慢慢拥有自己的生命。它是被建造出来的，也是被选择、打磨、连接与守护出来的。',
      '在这里，数据不再只是数字。它像一束光，照进梁架深处，让匠心变得可以被看见，也可以被记住。',
    ],
    entry: './materials.html',
    color: '#4f8d70',
  },
  {
    id: 'protection',
    order: '05',
    shortName: '保护',
    name: '保护风险看板',
    kicker: 'Protection Risk',
    sectionTitle: '我们把故事收束到今天，回应古建筑的未来',
    description: '故事最后，我们回到今天。',
    story: [
      '这些古建筑穿越千年而来，却仍然承受着风雨、老化、病害与环境变化。它们曾经见证过去，也正在把问题交给现在的人。',
      '看见它们，是开始。理解它们之后，更重要的是守护它们。',
      '保护风险看板，是华构工韵面向未来的一束光。它让古建筑当下的状态被看见，也让保护不再只是情感上的惋惜，而成为更清晰、更主动的行动。',
    ],
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
        float breath = sin(uTime * 1.45 + aSeed * 6.2831) * 0.5 + 0.5;
        pos += aNormal * breath * 0.008;
        pos += noise3d(position * 12.0 + uTime * 0.32) * 0.004;

        vec4 baseClip = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        vec2 screenPos = baseClip.xy / max(baseClip.w, 0.0001);
        float pointerDist = distance(screenPos, uMouse);
        float pointerInfluence = smoothstep(0.36, 0.0, pointerDist) * uInteraction;

        vec3 lightDir = normalize(vec3(-0.32, 0.9, 0.46));
        vLight = 0.74 + max(dot(normalize(normalMatrix * aNormal), lightDir), 0.0) * 1.05;
        vAgeFlow = sin(position.y * 3.2 + uTime * 1.35 + aSeed * 6.2831) * 0.5 + 0.5;
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

    particleSystem.material.uniforms.uTime.value = elapsedTime * 1.45
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

.plain-btn {
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
  width: min(760px, 58vw);
  margin-left: 32px;
  padding-top: min(16vh, 128px);
}

.eyebrow {
  margin: 0 0 14px;
  color: #6f6a58;
  font-size: 15px;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 6px 0 0;
  color: #254746;
  font-size: clamp(60px, 7.5vw, 124px);
  line-height: 0.92;
  font-weight: 950;
  letter-spacing: 0;
}

.brand-latin {
  display: block;
  color: #4f8c87;
  font-size: clamp(18px, 2.2vw, 32px);
  line-height: 1;
  font-weight: 950;
}

.hero-tagline {
  margin: 16px 0 0;
  color: #355f5f;
  font-size: clamp(21px, 2.1vw, 32px);
  line-height: 1.35;
  font-weight: 900;
}

.hero-narrative {
  width: min(610px, 100%);
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.hero-narrative p {
  margin: 0;
  color: #557b79;
  font-size: clamp(15px, 1.25vw, 19px);
  line-height: 1.68;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 36px;
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
  width: 52px;
  height: 78px;
  display: grid;
  place-content: center;
  gap: 2px;
  border: 1px solid rgba(79, 140, 135, 0.3);
  border-radius: 999px;
  color: #355f5f;
  background: rgba(255, 255, 255, 0.48);
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.scroll-cue:hover {
  transform: translateY(2px);
  border-color: rgba(53, 95, 95, 0.42);
  background: rgba(255, 255, 255, 0.66);
}

.scroll-arrow {
  width: 14px;
  height: 14px;
  border-right: 2px solid #355f5f;
  border-bottom: 2px solid #355f5f;
  transform: rotate(45deg);
  opacity: 0.42;
  animation: scrollArrowPulse 1.45s ease-in-out infinite;
}

.scroll-arrow:nth-child(2) {
  animation-delay: 0.18s;
}

@keyframes scrollArrowPulse {
  0% {
    opacity: 0.18;
    transform: translateY(-5px) rotate(45deg);
  }

  48% {
    opacity: 0.86;
  }

  100% {
    opacity: 0.18;
    transform: translateY(7px) rotate(45deg);
  }
}

.topic-screen {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 26px 28px 22px;
  background:
    linear-gradient(135deg, rgba(237, 246, 243, 0.96), rgba(228, 237, 231, 0.96)),
    radial-gradient(circle at 80% 12%, rgba(79, 140, 135, 0.18), transparent 34%);
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
  opacity: 0.42;
  filter: saturate(0.78);
  transform: scale(0.972);
  transform-origin: center;
  transition:
    opacity 520ms ease,
    filter 520ms ease,
    transform 620ms cubic-bezier(0.2, 0.78, 0.22, 1);
}

.topic-slide.active {
  opacity: 1;
  filter: saturate(1);
  transform: scale(1);
}

.slide-copy {
  align-self: center;
  max-width: 680px;
  min-width: 0;
}

.topic-slide.active .slide-copy {
  animation: topicCopyIn 620ms cubic-bezier(0.2, 0.78, 0.22, 1) both;
}

.slide-title-note {
  margin: 0;
  color: #355f5f;
  font-size: clamp(18px, 1.75vw, 26px);
  line-height: 1.36;
  font-weight: 900;
}

.slide-lead {
  margin: 12px 0 0;
  color: #557b79;
  font-size: clamp(16px, 1.35vw, 20px);
  line-height: 1.62;
  font-weight: 800;
}

.slide-story {
  max-height: clamp(154px, 26vh, 246px);
  margin-top: 12px;
  padding-right: 10px;
  overflow: auto;
  display: grid;
  gap: 8px;
}

.slide-story::-webkit-scrollbar {
  width: 4px;
}

.slide-story::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(79, 140, 135, 0.28);
}

.slide-story p {
  margin: 0;
  color: #557b79;
  font-size: clamp(14px, 1.08vw, 17px);
  line-height: 1.62;
}

.slide-copy a {
  display: inline-flex;
  align-items: center;
  height: 42px;
  margin-top: 18px;
  padding: 0 20px;
  border-radius: 6px;
  color: #fff;
  background: #355f5f;
  font-weight: 900;
  text-decoration: none;
  transition:
    background 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.slide-copy a:hover {
  transform: translateY(-1px);
  background: #254746;
  box-shadow: 0 10px 24px rgba(37, 71, 70, 0.18);
}

.slide-visual {
  position: relative;
  min-height: 420px;
  align-self: stretch;
  overflow: hidden;
  border-radius: 10px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.54) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.54) 1px, transparent 1px),
    radial-gradient(circle at 58% 46%, color-mix(in srgb, var(--accent), transparent 70%), transparent 34%),
    linear-gradient(135deg, color-mix(in srgb, var(--accent), #ffffff 82%), rgba(255, 255, 255, 0.62));
  background-size: 38px 38px, 38px 38px, auto, auto;
  box-shadow: inset 0 0 0 1px rgba(79, 140, 135, 0.16);
}

.topic-slide.active .slide-visual {
  animation: topicVisualIn 720ms cubic-bezier(0.2, 0.78, 0.22, 1) both;
}

.slide-visual::before {
  content: "";
  position: absolute;
  inset: 26px;
  border: 1px solid color-mix(in srgb, var(--accent), transparent 58%);
  border-radius: 10px;
  pointer-events: none;
}

.slide-visual::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.78), transparent 32%, transparent 68%, rgba(255, 255, 255, 0.24)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent 52%, rgba(37, 71, 70, 0.08));
}

.scene-history .particle-rings {
  transform: rotate(-8deg);
}

.scene-structure .particle-rings,
.scene-materials .particle-rings,
.scene-protection .particle-rings {
  opacity: 0.72;
}

.scene-spatial .particle-rings {
  opacity: 0.36;
  transform: perspective(700px) rotateX(58deg) rotateZ(-10deg);
}

.particle-rings {
  position: absolute;
  inset: 54px 48px;
  z-index: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  transition:
    opacity 420ms ease,
    transform 620ms cubic-bezier(0.2, 0.78, 0.22, 1);
}

.particle-rings span {
  position: absolute;
  --ring-rotate: -12deg;
  width: min(72%, 460px);
  aspect-ratio: 1 / 0.58;
  border: 1px solid color-mix(in srgb, var(--accent), transparent 46%);
  border-radius: 50%;
  transform: rotate(var(--ring-rotate)) scale(1);
  opacity: 0.52;
}

.particle-rings span:nth-child(2) {
  --ring-rotate: 19deg;
  width: min(58%, 350px);
  transform: rotate(var(--ring-rotate)) scale(1);
  opacity: 0.36;
}

.particle-rings span:nth-child(3) {
  --ring-rotate: 45deg;
  width: min(44%, 270px);
  transform: rotate(var(--ring-rotate)) scale(1);
  opacity: 0.28;
}

.topic-slide.active .particle-rings span {
  animation: particleRingWake 1800ms ease-in-out infinite alternate;
}

.topic-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.topic-dots button {
  width: 34px;
  height: 10px;
  padding: 0;
  border: 1px solid rgba(79, 140, 135, 0.26);
  border-radius: 999px;
  color: #557b79;
  background: rgba(255, 255, 255, 0.52);
  cursor: pointer;
  font-weight: 800;
  transition:
    color 180ms ease,
    background 180ms ease,
    transform 180ms ease,
    border-color 180ms ease;
}

.topic-dots button:hover {
  transform: translateY(-1px);
  border-color: rgba(53, 95, 95, 0.36);
}

.topic-dots button.active {
  width: 52px;
  color: #fff;
  background: #355f5f;
  transform: translateY(-1px);
}

@keyframes topicCopyIn {
  from {
    opacity: 0;
    transform: translateX(-18px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes topicVisualIn {
  from {
    opacity: 0.28;
    filter: blur(10px) saturate(0.82);
    transform: translateX(24px) scale(0.96);
  }

  to {
    opacity: 1;
    filter: blur(0) saturate(1);
    transform: translateX(0) scale(1);
  }
}

@keyframes particleRingWake {
  from {
    opacity: 0.24;
    transform: rotate(var(--ring-rotate)) scale(0.98);
  }

  to {
    opacity: 0.58;
    transform: rotate(var(--ring-rotate)) scale(1.02);
  }
}

@media (max-width: 900px) {
  .hero-copy {
    width: auto;
    margin: 0 18px;
    padding-top: 58px;
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
    padding: 24px;
  }

  .slide-visual {
    min-height: 260px;
  }

  .slide-story {
    max-height: 176px;
  }
}
</style>
