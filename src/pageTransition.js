const TRANSITION_MS = 560
const TOPIC_PAGE_IDS = new Set(['spatial', 'history', 'structure', 'materials', 'protection'])
const TOPIC_PAGE_LABELS = {
  spatial: '空间分布',
  history: '历史演化',
  structure: '形制结构',
  materials: '材料工艺',
  protection: '保护风险',
}
const TOPIC_PROGRESS_MARKER = 'sinoCraftTopicTransition'

function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

function isInternalPageLink(anchor) {
  if (!anchor || anchor.hasAttribute('download')) return false
  const target = anchor.getAttribute('target')
  if (target && target !== '_self') return false

  const rawHref = anchor.getAttribute('href')
  if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return false

  const url = new URL(rawHref, window.location.href)
  if (url.origin !== window.location.origin) return false
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false

  return url.pathname.endsWith('.html') || url.pathname.endsWith('/')
}

function getTopicIdFromUrl(url) {
  const from = url.searchParams.get('from')
  if (!TOPIC_PAGE_IDS.has(from) || !url.pathname.endsWith(`${from}.html`)) return ''
  return from
}

function getTopicProgressEntryId() {
  let markerTopicId = ''

  try {
    const storedTopicId = window.sessionStorage.getItem(TOPIC_PROGRESS_MARKER)
    if (TOPIC_PAGE_IDS.has(storedTopicId)) markerTopicId = storedTopicId
    window.sessionStorage.removeItem(TOPIC_PROGRESS_MARKER)
  } catch {
    markerTopicId = ''
  }

  return markerTopicId || getTopicIdFromUrl(new URL(window.location.href))
}

export function setupPageTransitions() {
  if (typeof window === 'undefined' || window.__sinoCraftPageTransitions) return
  window.__sinoCraftPageTransitions = true

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const overlay = document.createElement('div')
  overlay.className = 'page-transition'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.innerHTML = '<span class="page-transition__veil"></span><span class="page-transition__grid"></span><span class="page-transition__spark"></span><span class="page-transition__loader"><span class="page-transition__loader-kicker">正在加载专题</span><strong class="page-transition__loader-title">专题页面</strong><span class="page-transition__loader-track"><span class="page-transition__progress-bar"></span></span><span class="page-transition__loader-percent">0%</span></span>'
  document.body.appendChild(overlay)
  document.documentElement.classList.add('page-transition-root')

  const progressBar = overlay.querySelector('.page-transition__progress-bar')
  const loaderTitle = overlay.querySelector('.page-transition__loader-title')
  const loaderPercent = overlay.querySelector('.page-transition__loader-percent')
  let progressTimer = 0

  const setTopicTitle = (topicId) => {
    if (!loaderTitle) return
    loaderTitle.textContent = TOPIC_PAGE_LABELS[topicId] || '专题页面'
  }

  const setProgress = (value) => {
    if (!progressBar) return
    const nextValue = Math.max(0, Math.min(1, value))
    progressBar.style.transform = `scaleX(${nextValue})`
    if (loaderPercent) loaderPercent.textContent = `${Math.round(nextValue * 100)}%`
  }

  const stopProgressTimer = () => {
    window.clearInterval(progressTimer)
    progressTimer = 0
  }

  const startTopicProgress = (topicId) => {
    stopProgressTimer()
    setTopicTitle(topicId)
    document.body.classList.add('page-has-topic-progress')
    setProgress(0.06)

    const startedAt = performance.now()
    progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const t = Math.min(1, elapsed / TRANSITION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(0.06 + eased * 0.8)

      if (t >= 1) stopProgressTimer()
    }, 16)
  }

  const finishTopicProgress = (topicId) => {
    stopProgressTimer()
    setTopicTitle(topicId)
    document.body.classList.add('page-has-topic-progress')
    setProgress(0.86)

    window.requestAnimationFrame(() => {
      setProgress(1)
      window.setTimeout(() => {
        document.body.classList.remove('page-has-topic-progress')
        setProgress(0)
      }, 520)
    })
  }

  const enteringTopicId = !prefersReducedMotion ? getTopicProgressEntryId() : ''
  const completeTopicProgressOnEnter = Boolean(enteringTopicId)
  let keepEntryProgressOnPageshow = completeTopicProgressOnEnter

  if (!prefersReducedMotion) {
    if (completeTopicProgressOnEnter) finishTopicProgress(enteringTopicId)
    document.body.classList.add('page-is-entering')
    window.setTimeout(() => document.body.classList.remove('page-is-entering'), 720)
  }

  document.addEventListener('click', (event) => {
    if (prefersReducedMotion || isModifiedClick(event)) return

    const anchor = event.target.closest?.('a[href]')
    if (!isInternalPageLink(anchor)) return

    const nextUrl = new URL(anchor.getAttribute('href'), window.location.href)
    if (nextUrl.href === window.location.href) return

    event.preventDefault()
    const topicId = getTopicIdFromUrl(nextUrl)
    if (topicId) {
      try {
        window.sessionStorage.setItem(TOPIC_PROGRESS_MARKER, topicId)
      } catch {
        // Progress still works for the current page even if sessionStorage is unavailable.
      }
      startTopicProgress(topicId)
    }

    document.body.classList.add('page-is-leaving')
    window.setTimeout(() => {
      window.location.href = nextUrl.href
    }, TRANSITION_MS)
  })

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-is-leaving')
    if (keepEntryProgressOnPageshow) {
      keepEntryProgressOnPageshow = false
      return
    }

    stopProgressTimer()
    document.body.classList.remove('page-has-topic-progress')
    setProgress(0)
  })
}
