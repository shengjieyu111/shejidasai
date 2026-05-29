<template>
  <div ref="stageRef" class="topic-sculpture-stage"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import chinaMapData from '../apps/spatial/assets/china.json'

const props = defineProps({
  scene: { type: String, required: true },
  accent: { type: String, default: '#628a8a' },
  active: { type: Boolean, default: false },
})

const stageRef = ref(null)

let scene
let camera
let renderer
let sculpture
let halo
let frameId = 0
let resizeObserver
let disposed = false
let randomSource = Math.random

const clock = new THREE.Clock()
const pointerTarget = new THREE.Vector2(0, 0)
const pointerCurrent = new THREE.Vector2(0, 0)
const rotationTarget = new THREE.Vector3()
const rotationCurrent = new THREE.Vector3()
const colorCache = new Map()

let isDragging = false
let lastPointerX = 0
let lastPointerY = 0

const sceneSeeds = {
  spatial: 14823,
  history: 29174,
  structure: 50321,
  materials: 71093,
  protection: 88411,
}

const pointTargets = {
  spatial: 110000,
  history: 46000,
  structure: 52000,
  materials: 68000,
  protection: 90000,
}

let buildVersion = 0

function getColor(hex) {
  if (!colorCache.has(hex)) colorCache.set(hex, new THREE.Color(hex))
  return colorCache.get(hex)
}

function createRandom(seed) {
  let value = seed >>> 0
  return () => {
    value += 0x6d2b79f5
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function random() {
  return randomSource()
}

function makePalette() {
  return {
    base: props.accent,
    light: '#f7efe0',
    dark: '#173d39',
    warm: '#c79b55',
    river: '#9fe0ea',
    glass: '#d6fbff',
    alert: '#f0b56b',
    ink: '#304b43',
  }
}

function toneColor(tone, palette, glow = 0.12) {
  if (tone === 'light') return getColor(palette.light).clone()
  if (tone === 'dark') return getColor(palette.dark).clone()
  if (tone === 'warm') return getColor(palette.warm).clone()
  if (tone === 'river') return getColor(palette.river).clone()
  if (tone === 'glass') return getColor(palette.glass).clone()
  if (tone === 'alert') return getColor(palette.alert).clone()
  if (tone === 'ink') return getColor(palette.ink).clone()
  return getColor(palette.base).clone().lerp(getColor(palette.light), glow)
}

function createParticleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.96)')
  gradient.addColorStop(0.78, 'rgba(255,255,255,0.34)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

function createMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: texture },
      uMouse: { value: pointerCurrent },
      uInteraction: { value: 0 },
      uPointSize: { value: 4.2 },
    },
    vertexShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uInteraction;
      uniform float uPointSize;
      attribute vec3 aColor;
      attribute vec3 aNormal;
      attribute float aSeed;
      attribute float aSize;
      attribute float aGlow;
      varying vec3 vColor;
      varying float vLight;
      varying float vGlow;
      varying float vInteraction;

      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      vec3 tinyNoise(vec3 p) {
        return vec3(hash(p.x + p.y), hash(p.y + p.z), hash(p.z + p.x)) - 0.5;
      }

      void main() {
        vec3 normal = normalize(aNormal);
        vec3 pos = position;
        float breath = sin(uTime * 1.42 + aSeed * 6.2831) * 0.5 + 0.5;
        pos += normal * (0.006 + aGlow * 0.012) * breath;
        pos += tinyNoise(position * 18.0 + uTime * 0.36) * 0.0035;

        vec4 clip = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        vec2 screenPos = clip.xy / max(clip.w, 0.0001);
        float pointerDist = distance(screenPos, uMouse);
        float pointerInfluence = smoothstep(0.34, 0.0, pointerDist) * uInteraction;

        vec3 lightDir = normalize(vec3(-0.38, 0.82, 0.44));
        vLight = 0.58 + max(dot(normalize(normalMatrix * normal), lightDir), 0.0) * 1.05;
        vColor = aColor;
        vGlow = aGlow + breath * 0.16;
        vInteraction = pointerInfluence;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        float sizePulse = 1.0 + breath * 0.1 + pointerInfluence * 0.44;
        gl_PointSize = uPointSize * aSize * sizePulse * (3.25 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      varying float vLight;
      varying float vGlow;
      varying float vInteraction;

      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        float alpha = texColor.a * (0.86 + vGlow * 0.24 + vInteraction * 0.16);
        vec3 color = vColor * vLight;
        color += vec3(0.92, 0.72, 0.38) * vGlow * 0.14;
        color += vec3(1.0, 0.93, 0.76) * vInteraction * 0.22;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  })
}

function particleMaterial(options = {}) {
  const material = new THREE.MeshBasicMaterial()
  material.userData = {
    tone: options.tone,
    glow: options.glow ?? 0.12,
    size: options.size ?? 1,
    density: options.density ?? 1,
  }
  return material
}

function addMesh(group, geometry, options = {}) {
  const mesh = new THREE.Mesh(geometry, particleMaterial(options))
  mesh.position.set(options.x ?? 0, options.y ?? 0, options.z ?? 0)
  mesh.rotation.set(options.rx ?? 0, options.ry ?? 0, options.rz ?? 0)
  mesh.scale.set(options.sx ?? 1, options.sy ?? 1, options.sz ?? 1)
  group.add(mesh)
  return mesh
}

function addBox(group, x, y, z, w, h, d, options = {}) {
  return addMesh(group, new THREE.BoxGeometry(w, h, d, 4, 4, 4), { ...options, x, y, z })
}

function addCylinder(group, x, y, z, radius, height, axis = 'y', options = {}) {
  const rotation = {
    x: [0, 0, Math.PI / 2],
    y: [0, 0, 0],
    z: [Math.PI / 2, 0, 0],
  }[axis]
  return addMesh(group, new THREE.CylinderGeometry(radius, radius, height, 48, 6, false), {
    ...options,
    x,
    y,
    z,
    rx: rotation[0],
    ry: rotation[1],
    rz: rotation[2],
  })
}

function addSphere(group, x, y, z, radius, options = {}) {
  return addMesh(group, new THREE.SphereGeometry(radius, 32, 18), { ...options, x, y, z })
}

function addTube(group, points, radius, options = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)))
  return addMesh(group, new THREE.TubeGeometry(curve, Math.max(12, points.length * 16), radius, 12, false), options)
}

function addDisc(group, x, y, z, radius, axis = 'z', options = {}) {
  const rotation = {
    x: [0, 0, Math.PI / 2],
    y: [0, 0, 0],
    z: [Math.PI / 2, 0, 0],
  }[axis]
  return addMesh(group, new THREE.CylinderGeometry(radius, radius, 0.035, 56, 1, false), {
    ...options,
    x,
    y,
    z,
    rx: rotation[0],
    ry: rotation[1],
    rz: rotation[2],
  })
}

function createRoofGeometry(width, height, depth) {
  const w = width / 2
  const h = height / 2
  const d = depth / 2
  const vertices = new Float32Array([
    -w, -h, -d,
    w, -h, -d,
    0, h, -d,
    -w, -h, d,
    w, -h, d,
    0, h, d,
  ])
  const indices = [
    0, 1, 2,
    3, 5, 4,
    0, 3, 4,
    0, 4, 1,
    1, 4, 5,
    1, 5, 2,
    2, 5, 3,
    2, 3, 0,
  ]
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function addRoof(group, x, y, z, width, height, depth, options = {}) {
  return addMesh(group, createRoofGeometry(width, height, depth), { ...options, x, y, z })
}

function addHemisphere(group, x, y, z, radius, heightScale, options = {}) {
  const geometry = new THREE.SphereGeometry(radius, 56, 24, 0, Math.PI * 2, 0, Math.PI / 2)
  return addMesh(group, geometry, {
    ...options,
    x,
    y,
    z,
    sx: 1,
    sy: heightScale,
    sz: 1,
  })
}

function collectSurfaceTriangles(root) {
  const triangles = []
  let totalArea = 0
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const na = new THREE.Vector3()
  const nb = new THREE.Vector3()
  const nc = new THREE.Vector3()
  const ab = new THREE.Vector3()
  const ac = new THREE.Vector3()

  root.updateMatrixWorld(true)
  root.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return

    const geometry = child.geometry
    const positionAttr = geometry.attributes.position
    const normalAttr = geometry.attributes.normal
    const indexAttr = geometry.index
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(child.matrixWorld)
    const meta = child.material?.userData || {}

    const readVertex = (target, normalTarget, vertexIndex) => {
      target.fromBufferAttribute(positionAttr, vertexIndex).applyMatrix4(child.matrixWorld)
      if (normalAttr) normalTarget.fromBufferAttribute(normalAttr, vertexIndex).applyMatrix3(normalMatrix).normalize()
      else normalTarget.set(0, 1, 0)
    }

    const addTriangle = (ia, ib, ic) => {
      readVertex(a, na, ia)
      readVertex(b, nb, ib)
      readVertex(c, nc, ic)

      ab.subVectors(b, a)
      ac.subVectors(c, a)
      const area = ab.cross(ac).length() * 0.5
      if (area <= 0.000001) return

      const weightedArea = area * (meta.density ?? 1)
      triangles.push({
        a: a.clone(),
        b: b.clone(),
        c: c.clone(),
        na: na.clone(),
        nb: nb.clone(),
        nc: nc.clone(),
        area: weightedArea,
        tone: meta.tone,
        glow: meta.glow ?? 0.12,
        size: meta.size ?? 1,
      })
      totalArea += weightedArea
    }

    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i += 3) addTriangle(indexAttr.getX(i), indexAttr.getX(i + 1), indexAttr.getX(i + 2))
    } else {
      for (let i = 0; i < positionAttr.count; i += 3) addTriangle(i, i + 1, i + 2)
    }
  })

  return { triangles, totalArea }
}

function sampleSurface(triangles, totalArea, pointCount, palette) {
  const positions = new Float32Array(pointCount * 3)
  const colors = new Float32Array(pointCount * 3)
  const normals = new Float32Array(pointCount * 3)
  const seeds = new Float32Array(pointCount)
  const sizes = new Float32Array(pointCount)
  const glows = new Float32Array(pointCount)
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

  const point = new THREE.Vector3()
  const normal = new THREE.Vector3()

  for (let i = 0; i < pointCount; i++) {
    const triangle = pickTriangle(random() * totalArea)
    const r1 = Math.sqrt(random())
    const r2 = random()
    const wa = 1 - r1
    const wb = r1 * (1 - r2)
    const wc = r1 * r2
    const color = toneColor(triangle.tone, palette, triangle.glow)

    point.set(0, 0, 0).addScaledVector(triangle.a, wa).addScaledVector(triangle.b, wb).addScaledVector(triangle.c, wc)
    normal.set(0, 0, 0).addScaledVector(triangle.na, wa).addScaledVector(triangle.nb, wb).addScaledVector(triangle.nc, wc).normalize()

    const offset = i * 3
    positions[offset] = point.x
    positions[offset + 1] = point.y
    positions[offset + 2] = point.z
    colors[offset] = color.r
    colors[offset + 1] = color.g
    colors[offset + 2] = color.b
    normals[offset] = normal.x
    normals[offset + 1] = normal.y
    normals[offset + 2] = normal.z
    seeds[i] = random()
    sizes[i] = triangle.size
    glows[i] = triangle.glow
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aGlow', new THREE.BufferAttribute(glows, 1))
  return geometry
}

function decodeMapCoordinate(encodedCoordinate, encodeOffset) {
  const result = []
  let previousX = encodeOffset[0]
  let previousY = encodeOffset[1]
  for (let i = 0; i < encodedCoordinate.length; i += 2) {
    let x = encodedCoordinate.charCodeAt(i) - 64
    let y = encodedCoordinate.charCodeAt(i + 1) - 64
    x = (x >> 1) ^ -(x & 1)
    y = (y >> 1) ^ -(y & 1)
    x += previousX
    y += previousY
    previousX = x
    previousY = y
    result.push([x / 1024, y / 1024])
  }
  return result
}

function getMapRings() {
  const rings = []
  chinaMapData.features.forEach((feature) => {
    const geometry = feature.geometry
    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach((coordinate, index) => rings.push(decodeMapCoordinate(coordinate, geometry.encodeOffsets[index])))
    } else {
      geometry.coordinates.forEach((polygon, polygonIndex) => {
        polygon.forEach((coordinate, ringIndex) => rings.push(decodeMapCoordinate(coordinate, geometry.encodeOffsets[polygonIndex][ringIndex])))
      })
    }
  })
  return rings.filter((ring) => ring.length > 3)
}

function boundsOf(points) {
  return points.reduce(
    (bounds, point) => ({
      minX: Math.min(bounds.minX, point[0]),
      maxX: Math.max(bounds.maxX, point[0]),
      minY: Math.min(bounds.minY, point[1]),
      maxY: Math.max(bounds.maxY, point[1]),
    }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
  )
}

function ringArea(ring) {
  let area = 0
  for (let i = 0; i < ring.length; i++) {
    const point = ring[i]
    const next = ring[(i + 1) % ring.length]
    area += point[0] * next[1] - next[0] * point[1]
  }
  return Math.abs(area) / 2
}

function isPointInRing(x, y, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const point = ring[i]
    const previousPoint = ring[j]
    const intersects =
      point[1] > y !== previousPoint[1] > y &&
      x < ((previousPoint[0] - point[0]) * (y - point[1])) / (previousPoint[1] - point[1]) + point[0]
    if (intersects) inside = !inside
  }
  return inside
}

function buildChinaMapGroup() {
  const group = new THREE.Group()
  const rings = getMapRings()
    .map((ring) => ({ ring, bounds: boundsOf(ring), area: ringArea(ring) }))
    .sort((a, b) => b.area - a.area)
  const allPoints = rings.flatMap((item) => item.ring)
  const bounds = boundsOf(allPoints)
  const project = (lon, lat, z = 0) => ({
    x: ((lon - bounds.minX) / (bounds.maxX - bounds.minX) - 0.5) * 4.55,
    y: ((lat - bounds.minY) / (bounds.maxY - bounds.minY) - 0.5) * 3.38,
    z,
  })
  rings.slice(0, 80).forEach((item) => {
    if (item.area < 0.16) return
    const step = Math.max(1, Math.ceil(item.ring.length / 240))
    const shapePoints = item.ring
      .filter((_, index) => index % step === 0)
      .map(([lon, lat]) => {
        const p = project(lon, lat)
        return new THREE.Vector2(p.x, p.y)
      })
    if (shapePoints.length < 3) return

    try {
      const shape = new THREE.Shape(shapePoints)
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.22,
        bevelEnabled: false,
        curveSegments: 1,
      })
      geometry.translate(0, 0, -0.11)
      addMesh(group, geometry, {
        tone: undefined,
        glow: item.area > 40 ? 0.16 : 0.2,
        size: item.area > 40 ? 0.88 : 0.74,
        density: item.area > 40 ? 1 : 0.7,
      })
    } catch {
      // A few tiny islands can have self-crossing paths in the map data; skipping them keeps the sculpture stable.
    }
  })

  rings.forEach((item) => {
    if (item.area < 0.16) return
    const step = Math.max(1, Math.ceil(item.ring.length / (item.area > 30 ? 260 : 120)))
    const boundary = item.ring
      .filter((_, index) => index % step === 0)
      .map(([lon, lat]) => {
        const p = project(lon, lat, 0.15)
        return [p.x, p.y, p.z]
      })
    if (boundary.length < 3) return
    boundary.push(boundary[0])
    addTube(group, boundary, item.area > 30 ? 0.0065 : 0.0045, {
      tone: item.area > 30 ? undefined : 'dark',
      glow: item.area > 30 ? 0.34 : 0.18,
      size: item.area > 30 ? 0.62 : 0.48,
      density: item.area > 30 ? 6 : 4.4,
    })
  })

  return { group, rotation: [0, 0, 0], viewSize: 3.62, haloRadius: 1.78 }
}

function buildScrollGroup() {
  const group = new THREE.Group()
  addBox(group, 0, 0, 0, 3.92, 1.46, 0.08, { tone: 'light', glow: 0.24, size: 0.84, density: 1.2 })
  addBox(group, 0.05, -0.04, -0.08, 3.56, 1.18, 0.05, { tone: 'warm', glow: 0.08, size: 0.62, density: 0.45 })
  addCylinder(group, -2.1, 0, 0.02, 0.34, 1.82, 'y', { tone: 'warm', glow: 0.2, size: 0.9, density: 1.5 })
  addCylinder(group, 2.1, 0, 0.02, 0.34, 1.82, 'y', { tone: 'warm', glow: 0.2, size: 0.9, density: 1.5 })
  ;[-1, 1].forEach((side) => {
    ;[-0.95, 0.95].forEach((y) => {
      addCylinder(group, side * 2.1, y, 0.03, 0.16, 0.3, 'x', { tone: 'warm', glow: 0.34, size: 0.9, density: 2 })
      addSphere(group, side * 2.24, y, 0.03, 0.085, { tone: 'light', glow: 0.32, size: 0.86, density: 3 })
    })
  })

  const eraLine = []
  for (let i = 0; i < 10; i++) eraLine.push([-1.45 + i * 0.32, -0.02 + Math.sin(i * 0.9) * 0.13, 0.14])
  addTube(group, eraLine, 0.014, { tone: 'ink', glow: 0.2, size: 0.68, density: 7 })
  eraLine.forEach((point, index) => addSphere(group, point[0], point[1], point[2] + 0.02, 0.04 + (index % 3) * 0.006, { tone: index % 2 ? 'warm' : 'light', glow: 0.46, size: 0.98, density: 7 }))

  for (let row = 0; row < 8; row++) {
    const y = 0.44 - row * 0.115
    const start = -1.36 + (row % 2) * 0.1
    const end = 1.28 - (row % 3) * 0.18
    const points = []
    for (let i = 0; i < 8; i++) {
      const t = i / 7
      points.push([start + (end - start) * t, y + Math.sin(t * Math.PI * 2 + row) * 0.015, 0.15])
    }
    addTube(group, points, 0.006, { tone: row % 3 === 0 ? 'ink' : 'dark', glow: 0.17, size: 0.56, density: 9 })
  }

  addDisc(group, 0.96, -0.45, 0.18, 0.23, 'z', { tone: 'alert', glow: 0.54, size: 0.86, density: 5 })
  addTube(group, [[0.84, -0.51, 0.22], [1.08, -0.39, 0.22]], 0.005, { tone: 'light', glow: 0.36, size: 0.5, density: 8 })
  addTube(group, [[0.86, -0.39, 0.22], [1.06, -0.52, 0.22]], 0.005, { tone: 'light', glow: 0.28, size: 0.5, density: 8 })

  return { group, rotation: [0.2, -0.38, 0.03], viewSize: 4.35, haloRadius: 1.92 }
}

function buildPalaceGroup() {
  const group = new THREE.Group()
  addRoof(group, 0, 0.82, 0, 4.35, 0.9, 0.92, { tone: 'warm', glow: 0.28, size: 0.86, density: 1.2 })
  addRoof(group, 0, 0.22, 0.03, 3.34, 0.54, 0.76, { tone: 'warm', glow: 0.18, size: 0.78, density: 1.1 })
  addBox(group, 0, -0.38, 0, 2.56, 0.88, 0.46, { tone: 'light', glow: 0.16, size: 0.78, density: 0.8 })
  addBox(group, 0, -0.16, 0.27, 2.32, 0.22, 0.08, { tone: 'warm', glow: 0.18, size: 0.72, density: 1.8 })
  ;[-1.02, -0.6, -0.2, 0.2, 0.6, 1.02].forEach((x) => {
    addCylinder(group, x, -0.72, 0.18, 0.063, 1.08, 'y', { tone: 'warm', glow: 0.24, size: 0.78, density: 2.4 })
    addBox(group, x, -0.14, 0.2, 0.2, 0.1, 0.12, { tone: 'warm', glow: 0.25, size: 0.66, density: 2.6 })
  })
  addBox(group, 0, -1.22, 0.04, 3.3, 0.18, 0.76, { tone: 'dark', glow: 0.1, size: 0.74, density: 1 })
  addBox(group, 0, -1.44, 0.03, 3.75, 0.18, 0.88, { tone: 'dark', glow: 0.08, size: 0.72, density: 0.9 })
  addBox(group, 0, -0.46, 0.28, 0.44, 0.52, 0.08, { tone: 'dark', glow: 0.12, size: 0.7, density: 2.2 })

  ;[-0.74, 0.74].forEach((x) => {
    addBox(group, x, -0.34, 0.29, 0.42, 0.32, 0.06, { tone: 'dark', glow: 0.16, size: 0.66, density: 2 })
    addTube(group, [[x - 0.2, -0.34, 0.34], [x + 0.2, -0.34, 0.34]], 0.006, { tone: 'light', glow: 0.28, size: 0.48, density: 9 })
    addTube(group, [[x, -0.5, 0.34], [x, -0.18, 0.34]], 0.006, { tone: 'light', glow: 0.28, size: 0.48, density: 9 })
  })

  for (let i = 0; i < 13; i++) {
    const x = -1.88 + i * 0.315
    const y1 = 0.37 - Math.abs(x) * 0.22
    addTube(group, [[x, y1, 0.49], [x * 0.18, 0.98, 0.49]], 0.006, { tone: 'light', glow: 0.36, size: 0.5, density: 8 })
  }
  for (let x = -1.42; x <= 1.42; x += 0.36) addBox(group, x, 0.08, 0.27, 0.12, 0.14, 0.1, { tone: 'warm', glow: 0.18, size: 0.62, density: 2.2 })

  return { group, rotation: [0.18, -0.46, 0], viewSize: 4.4, haloRadius: 1.88 }
}

function buildMortiseGroup() {
  const group = new THREE.Group()

  const beamOptions = { tone: 'warm', glow: 0.2, size: 0.78, density: 1.08 }
  const capOptions = { tone: 'dark', glow: 0.08, size: 0.54, density: 1.6 }
  const grooveOptions = { tone: 'dark', glow: 0.1, size: 0.42, density: 2.4 }

  ;[-0.34, 0.34].forEach((z) => {
    addBox(group, 0, 0, z, 3.1, 0.34, 0.34, beamOptions)
    addBox(group, -1.58, 0, z, 0.16, 0.36, 0.36, capOptions)
    addBox(group, 1.58, 0, z, 0.16, 0.36, 0.36, capOptions)
    addBox(group, -0.42, 0.19, z, 0.42, 0.035, 0.22, grooveOptions)
    addBox(group, 0.42, -0.19, z, 0.42, 0.035, 0.22, grooveOptions)
  })

  ;[-0.34, 0.34].forEach((x) => {
    addBox(group, x, 0, 0, 0.34, 3.1, 0.34, { ...beamOptions, glow: 0.18 })
    addBox(group, x, -1.58, 0, 0.36, 0.16, 0.36, capOptions)
    addBox(group, x, 1.58, 0, 0.36, 0.16, 0.36, capOptions)
    addBox(group, x, -0.42, 0.19, 0.22, 0.42, 0.035, grooveOptions)
    addBox(group, x, 0.42, -0.19, 0.22, 0.42, 0.035, grooveOptions)
  })

  ;[-0.34, 0.34].forEach((y) => {
    addBox(group, 0, y, 0, 0.34, 0.34, 3.1, { ...beamOptions, glow: 0.22 })
    addBox(group, 0, y, -1.58, 0.36, 0.36, 0.16, capOptions)
    addBox(group, 0, y, 1.58, 0.36, 0.36, 0.16, capOptions)
    addBox(group, 0.19, y, -0.42, 0.035, 0.22, 0.42, grooveOptions)
    addBox(group, -0.19, y, 0.42, 0.035, 0.22, 0.42, grooveOptions)
  })

  addBox(group, 0, 0, 0, 0.66, 0.66, 0.66, { tone: 'light', glow: 0.16, size: 0.58, density: 0.62 })

  ;[
    [[-1.36, 0.18, 0.52], [1.36, 0.18, 0.52]],
    [[-1.36, -0.18, -0.52], [1.36, -0.18, -0.52]],
    [[0.52, -1.36, 0.18], [0.52, 1.36, 0.18]],
    [[-0.52, -1.36, -0.18], [-0.52, 1.36, -0.18]],
    [[0.18, 0.52, -1.36], [0.18, 0.52, 1.36]],
    [[-0.18, -0.52, -1.36], [-0.18, -0.52, 1.36]],
  ].forEach((points, index) => {
    addTube(group, points, 0.0045, {
      tone: index % 2 ? 'ink' : 'light',
      glow: 0.22,
      size: 0.34,
      density: 8,
    })
  })

  ;[
    [-0.82, 0.36, 0.36],
    [0.82, -0.36, -0.36],
    [0.36, -0.82, 0.36],
    [-0.36, 0.82, -0.36],
    [0.36, 0.36, -0.82],
    [-0.36, -0.36, 0.82],
  ].forEach(([x, y, z]) => {
    addBox(group, x, y, z, 0.26, 0.045, 0.26, { tone: 'light', glow: 0.3, size: 0.38, density: 4 })
  })

  return { group, rotation: [0.58, -0.56, 0.18], viewSize: 3.35, haloRadius: 1.52 }
}

function buildProtectionGroup() {
  const group = new THREE.Group()
  const sphereCenterY = -0.46
  const sphereRadius = 1.58

  addSphere(group, 0, sphereCenterY, 0, sphereRadius, {
    tone: 'glass',
    glow: 0.38,
    size: 0.42,
    density: 0.48,
  })

  addMesh(group, new THREE.TorusGeometry(sphereRadius, 0.011, 10, 180), {
    tone: 'glass',
    glow: 0.78,
    size: 0.62,
    density: 3.6,
    x: 0,
    y: sphereCenterY,
    z: 0,
    rx: Math.PI / 2,
  })

  addMesh(group, new THREE.TorusGeometry(sphereRadius, 0.008, 8, 160), {
    tone: 'glass',
    glow: 0.6,
    size: 0.48,
    density: 2.8,
    x: 0,
    y: sphereCenterY,
    z: 0,
  })
  addMesh(group, new THREE.TorusGeometry(sphereRadius, 0.008, 8, 160), {
    tone: 'glass',
    glow: 0.54,
    size: 0.46,
    density: 2.6,
    x: 0,
    y: sphereCenterY,
    z: 0,
    ry: Math.PI / 2,
  })

  ;[-0.86, -0.48, 0.48, 0.86].forEach((offset, index) => {
    const latitudeRadius = Math.sqrt(Math.max(sphereRadius * sphereRadius - offset * offset, 0.1))
    addMesh(group, new THREE.TorusGeometry(latitudeRadius, 0.0058, 8, 132), {
      tone: 'glass',
      glow: 0.48 - Math.abs(index - 1.5) * 0.05,
      size: 0.38,
      density: 2.4,
      x: 0,
      y: sphereCenterY + offset,
      z: 0,
      rx: Math.PI / 2,
    })
  })

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    const meridian = []
    for (let j = 0; j <= 56; j++) {
      const theta = (j / 56) * Math.PI * 2
      meridian.push([Math.cos(angle) * Math.sin(theta) * sphereRadius, sphereCenterY + Math.cos(theta) * sphereRadius, Math.sin(angle) * Math.sin(theta) * sphereRadius])
    }
    addTube(group, meridian, i % 2 === 0 ? 0.0054 : 0.0044, {
      tone: 'glass',
      glow: i % 2 === 0 ? 0.42 : 0.3,
      size: i % 2 === 0 ? 0.36 : 0.3,
      density: 4.2,
    })
  }

  addSphere(group, 0, sphereCenterY + sphereRadius + 0.04, 0, 0.055, {
    tone: 'glass',
    glow: 0.78,
    size: 0.72,
    density: 8,
  })

  addRoof(group, 0, -0.12, 0.02, 1.72, 0.38, 0.42, { tone: 'warm', glow: 0.24, size: 0.64, density: 1.25 })
  addRoof(group, 0, -0.36, 0.06, 1.34, 0.26, 0.34, { tone: 'warm', glow: 0.18, size: 0.56, density: 1.12 })
  addBox(group, 0, -0.58, 0.02, 1.12, 0.4, 0.24, { tone: 'light', glow: 0.14, size: 0.54, density: 0.92 })
  addBox(group, 0, -0.48, 0.22, 0.98, 0.09, 0.06, { tone: 'warm', glow: 0.2, size: 0.46, density: 2 })
  addBox(group, 0, -0.88, 0.04, 1.44, 0.11, 0.36, { tone: 'dark', glow: 0.09, size: 0.5, density: 0.9 })
  addBox(group, 0, -1.04, 0.04, 1.68, 0.1, 0.4, { tone: 'dark', glow: 0.08, size: 0.46, density: 0.82 })

  ;[-0.46, -0.23, 0, 0.23, 0.46].forEach((x) => {
    addCylinder(group, x, -0.64, 0.22, 0.027, 0.42, 'y', { tone: 'warm', glow: 0.23, size: 0.48, density: 2.4 })
    addBox(group, x, -0.41, 0.23, 0.1, 0.052, 0.08, { tone: 'warm', glow: 0.2, size: 0.4, density: 2.3 })
  })

  addBox(group, 0, -0.67, 0.25, 0.22, 0.25, 0.045, { tone: 'dark', glow: 0.12, size: 0.42, density: 2.1 })
  ;[-0.31, 0.31].forEach((x) => {
    addBox(group, x, -0.62, 0.26, 0.2, 0.15, 0.04, { tone: 'dark', glow: 0.13, size: 0.4, density: 2 })
    addTube(group, [[x - 0.095, -0.62, 0.29], [x + 0.095, -0.62, 0.29]], 0.0035, { tone: 'light', glow: 0.24, size: 0.3, density: 8 })
    addTube(group, [[x, -0.7, 0.29], [x, -0.54, 0.29]], 0.0035, { tone: 'light', glow: 0.22, size: 0.3, density: 8 })
  })

  addTube(group, [[-0.9, -0.28, 0.3], [0, 0.08, 0.32], [0.9, -0.28, 0.3]], 0.005, {
    tone: 'light',
    glow: 0.34,
    size: 0.38,
    density: 8,
  })

  addMesh(group, new THREE.TorusGeometry(1.2, 0.006, 8, 150), {
    tone: 'glass',
    glow: 0.32,
    size: 0.34,
    density: 1.5,
    x: 0,
    y: -0.94,
    z: 0,
    rx: Math.PI / 2,
  })

  return { group, rotation: [0.16, -0.32, 0], viewSize: 3.28, haloRadius: 1.52 }
}

async function createSculptureGeometry(sceneName) {
  const previous = randomSource
  randomSource = createRandom(sceneSeeds[sceneName] || 1987)

  try {
    const builders = {
      spatial: buildChinaMapGroup,
      history: buildScrollGroup,
      structure: buildPalaceGroup,
      materials: buildMortiseGroup,
      protection: buildProtectionGroup,
    }
    const data = await (builders[sceneName] || buildProtectionGroup)()
    const { triangles, totalArea } = collectSurfaceTriangles(data.group)
    const geometry = sampleSurface(triangles, totalArea, pointTargets[sceneName] || 48000, makePalette())
    return { ...data, geometry }
  } finally {
    randomSource = previous
  }
}

function disposeObject(object) {
  object?.geometry?.dispose()
  object?.material?.uniforms?.uTexture?.value?.dispose()
  object?.material?.map?.dispose()
  object?.material?.dispose()
}

async function buildSculpture() {
  if (!scene || !props.scene) return
  const currentBuild = ++buildVersion
  disposeObject(sculpture)
  disposeObject(halo)
  scene.clear()

  const data = await createSculptureGeometry(props.scene)
  if (disposed || currentBuild !== buildVersion || !scene) {
    data.geometry.dispose()
    return
  }

  const material = createMaterial(createParticleTexture())
  sculpture = new THREE.Points(data.geometry, material)

  data.geometry.computeBoundingBox()
  const center = new THREE.Vector3()
  const size = new THREE.Vector3()
  data.geometry.boundingBox.getCenter(center)
  data.geometry.boundingBox.getSize(size)
  const maxSize = Math.max(size.x, size.y, size.z) || 1
  sculpture.position.copy(center).multiplyScalar(-1)
  sculpture.rotation.set(...data.rotation)
  rotationTarget.set(...data.rotation)
  rotationCurrent.copy(rotationTarget)
  sculpture.scale.setScalar((data.viewSize || 4.2) / maxSize)
  scene.add(sculpture)

  const ring = new THREE.TorusGeometry(data.haloRadius || 1.9, 0.005, 8, 180)
  const ringMaterial = new THREE.MeshBasicMaterial({ color: getColor(props.accent), transparent: true, opacity: 0.18 })
  halo = new THREE.Mesh(ring, ringMaterial)
  halo.rotation.set(Math.PI / 2.8, 0, 0.2)
  scene.add(halo)
}

function init() {
  if (!stageRef.value || disposed) return
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(0, 0.05, 5.2)
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  stageRef.value.appendChild(renderer.domElement)
  stageRef.value.addEventListener('pointerdown', onPointerDown)
  stageRef.value.addEventListener('pointermove', onPointerMove)
  stageRef.value.addEventListener('pointerup', onPointerUp)
  stageRef.value.addEventListener('pointercancel', onPointerUp)
  stageRef.value.addEventListener('pointerleave', onPointerLeave)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stageRef.value)
  buildSculpture()
  resize()
  animate()
}

function resize() {
  if (!stageRef.value || !camera || !renderer) return
  const { clientWidth, clientHeight } = stageRef.value
  camera.aspect = Math.max(clientWidth, 1) / Math.max(clientHeight, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(Math.max(clientWidth, 1), Math.max(clientHeight, 1))
}

function updatePointerGlow(event) {
  if (!stageRef.value) return
  const rect = stageRef.value.getBoundingClientRect()
  pointerTarget.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.24
  pointerTarget.y = -(((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 0.18)
}

function onPointerDown(event) {
  if (!stageRef.value) return
  isDragging = true
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  stageRef.value.classList.add('dragging')
  stageRef.value.setPointerCapture?.(event.pointerId)
  updatePointerGlow(event)
}

function onPointerMove(event) {
  updatePointerGlow(event)

  if (!isDragging) return
  const dx = event.clientX - lastPointerX
  const dy = event.clientY - lastPointerY
  lastPointerX = event.clientX
  lastPointerY = event.clientY

  rotationTarget.y += dx * 0.008
  rotationTarget.x = THREE.MathUtils.clamp(rotationTarget.x + dy * 0.006, -0.35, 1.25)
  rotationTarget.z += dx * 0.0012
  event.preventDefault()
}

function onPointerUp(event) {
  if (!stageRef.value) return
  isDragging = false
  stageRef.value.classList.remove('dragging')
  if (stageRef.value.hasPointerCapture?.(event.pointerId)) stageRef.value.releasePointerCapture(event.pointerId)
}

function onPointerLeave() {
  if (isDragging) return
  pointerTarget.set(0, 0)
}

function animate() {
  frameId = requestAnimationFrame(animate)
  if (!renderer || !scene || !camera) return

  const elapsed = clock.getElapsedTime()
  pointerCurrent.lerp(pointerTarget, 0.1)
  const interaction = pointerTarget.length() > 0.002 ? 1 : 0

  if (sculpture) {
    rotationCurrent.lerp(rotationTarget, 0.12)
    sculpture.rotation.set(rotationCurrent.x, rotationCurrent.y, rotationCurrent.z)
    sculpture.material.uniforms.uTime.value = elapsed * 1.5
    sculpture.material.uniforms.uMouse.value.copy(pointerCurrent)
    sculpture.material.uniforms.uInteraction.value += (interaction - sculpture.material.uniforms.uInteraction.value) * 0.08
  }

  renderer.render(scene, camera)
}

watch(
  () => [props.scene, props.accent],
  () => buildSculpture(),
)

onMounted(init)

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  stageRef.value?.removeEventListener('pointerdown', onPointerDown)
  stageRef.value?.removeEventListener('pointermove', onPointerMove)
  stageRef.value?.removeEventListener('pointerup', onPointerUp)
  stageRef.value?.removeEventListener('pointercancel', onPointerUp)
  stageRef.value?.removeEventListener('pointerleave', onPointerLeave)
  disposeObject(sculpture)
  disposeObject(halo)
  renderer?.dispose()
  renderer?.domElement?.remove()
})
</script>

<style scoped>
.topic-sculpture-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
}

.topic-sculpture-stage.dragging {
  cursor: grabbing;
}

.topic-sculpture-stage :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
