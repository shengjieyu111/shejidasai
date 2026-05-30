import { defineComponent, h, onBeforeMount, onUnmounted } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './HomePage.vue'
import spatialStyles from './apps/spatial/style.css?inline'
import historyStyles from './apps/history/style.css?inline'
import structureStyles from './apps/structure/assets/styles/base.css?inline'
import materialsStyles from './apps/materials/styles.css?inline'
import protectionStyles from './apps/protection/style.css?inline'

function createStyledRoute(name, loadComponent, styles) {
  let resolvedComponent = null

  return () => {
    if (!resolvedComponent) {
      resolvedComponent = loadComponent().then((module) => {
        const PageComponent = module.default

        return defineComponent({
          name,
          setup() {
            let styleElement = null

            onBeforeMount(() => {
              styleElement = document.createElement('style')
              styleElement.dataset.routeStyle = name
              styleElement.textContent = styles
              document.head.appendChild(styleElement)
            })

            onUnmounted(() => {
              styleElement?.remove()
              styleElement = null
            })

            return () => h(PageComponent)
          },
        })
      })
    }

    return resolvedComponent
  }
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      keepAlive: true,
      isHome: true,
    },
  },
  {
    path: '/spatial',
    name: 'spatial',
    component: createStyledRoute('SpatialRoute', () => import('./apps/spatial/App.vue'), spatialStyles),
    meta: {
      topicId: 'spatial',
      label: '空间分布',
    },
  },
  {
    path: '/history',
    name: 'history',
    component: createStyledRoute('HistoryRoute', () => import('./apps/history/App.vue'), historyStyles),
    meta: {
      topicId: 'history',
      label: '历史演化',
    },
  },
  {
    path: '/structure',
    name: 'structure',
    component: createStyledRoute('StructureRoute', () => import('./apps/structure/App.vue'), structureStyles),
    meta: {
      topicId: 'structure',
      label: '形制结构',
    },
  },
  {
    path: '/materials',
    name: 'materials',
    component: createStyledRoute('MaterialsRoute', () => import('./apps/materials/App.vue'), materialsStyles),
    meta: {
      topicId: 'materials',
      label: '材料工艺',
    },
  },
  {
    path: '/protection',
    name: 'protection',
    component: createStyledRoute('ProtectionRoute', () => import('./apps/protection/App.vue'), protectionStyles),
    meta: {
      topicId: 'protection',
      label: '保护风险',
    },
  },
  {
    path: '/topic-:topicId',
    redirect: (to) => ({
      name: 'home',
      hash: `#topic-${to.params.topicId}`,
    }),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'home' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.name === 'home') return false
    return { top: 0, left: 0 }
  },
})

export default router
