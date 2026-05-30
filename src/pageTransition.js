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
const RETURN_PROGRESS_MARKER = 'sinoCraftReturnTransition'
const DIRECT_RETURN_MARKER = 'sinoCraftDirectReturn'
const RETURN_PAGE_LABEL = '\u8fd4\u56de\u4e13\u9898\u5bfc\u822a'
const DIRECT_RETURN_MAX_AGE = 30 * 60 * 1000

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

function getReturnTopicIdFromUrl(url) {
  const prefix = '#topic-'
  if (!url.hash.startsWith(prefix)) return ''
  if (!url.pathname.endsWith('/index.html') && !url.pathname.endsWith('/')) return ''

  const topicId = decodeURIComponent(url.hash.slice(prefix.length))
  return TOPIC_PAGE_IDS.has(topicId) ? topicId : ''
}

function takeStoredTopicId(key) {
  try {
    const storedTopicId = window.sessionStorage.getItem(key)
    window.sessionStorage.removeItem(key)
    return TOPIC_PAGE_IDS.has(storedTopicId) ? storedTopicId : ''
  } catch {
    return ''
  }
}

function getTopicProgressEntryId() {
  return takeStoredTopicId(TOPIC_PROGRESS_MARKER) || getTopicIdFromUrl(new URL(window.location.href))
}

function getReturnProgressEntryId() {
  return takeStoredTopicId(RETURN_PROGRESS_MARKER)
}

function setDirectReturnMarker(topicId, targetUrl) {
  try {
    window.sessionStorage.setItem(
      DIRECT_RETURN_MARKER,
      JSON.stringify({
        topicId,
        href: targetUrl.href,
        createdAt: Date.now(),
      }),
    )
  } catch {
    // The normal href fallback still works if sessionStorage is unavailable.
  }
}

function clearDirectReturnMarker() {
  try {
    window.sessionStorage.removeItem(DIRECT_RETURN_MARKER)
  } catch {
    // Ignore storage cleanup failures.
  }
}

function getDirectReturnMarker() {
  try {
    const rawMarker = window.sessionStorage.getItem(DIRECT_RETURN_MARKER)
    if (!rawMarker) return null
    return JSON.parse(rawMarker)
  } catch {
    return null
  }
}

function isHomeUrl(url) {
  return url.origin === window.location.origin && (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/'))
}

function canReturnWithHistory(topicId) {
  if (window.history.length <= 1) return false

  const marker = getDirectReturnMarker()
  if (!marker || marker.topicId !== topicId || marker.href !== window.location.href) return false
  if (Date.now() - marker.createdAt > DIRECT_RETURN_MAX_AGE) return false

  if (!document.referrer) return true

  try {
    return isHomeUrl(new URL(document.referrer))
  } catch {
    return true
  }
}

function markCurrentHomeTopic(topicId) {
  try {
    const currentUrl = new URL(window.location.href)
    if (!isHomeUrl(currentUrl)) return

    currentUrl.hash = `topic-${encodeURIComponent(topicId)}`
    window.history.replaceState(window.history.state, '', currentUrl.href)
  } catch {
    // Restoring by history still falls back to the existing scroll state.
  }
}

export function setupPageTransitions() {
  if (typeof window === 'undefined' || window.__sinoCraftPageTransitions) return
  window.__sinoCraftPageTransitions = true

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const overlay = document.createElement('div')
  overlay.className = 'page-transition'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.innerHTML = '<span class="page-transition__veil"></span><span class="page-transition__grid"></span><span class="page-transition__spark"></span><span class="page-transition__loader"><span class="page-transition__loader-kicker">正在加载专题</span><strong class="page-transition__loader-title">专题页面</strong><span class="page-transition__loader-track"><span class="page-transition__progress-bar"></span></span><span class="page-transition__loader-circle"><span class="page-transition__loader-circle-core"></span></span><span class="page-transition__loader-percent">0%</span></span>'
  document.body.appendChild(overlay)
  document.documentElement.classList.add('page-transition-root')

  const loader = overlay.querySelector('.page-transition__loader')
  const loaderKicker = overlay.querySelector('.page-transition__loader-kicker')
  const progressBar = overlay.querySelector('.page-transition__progress-bar')
  const loaderCircleCore = overlay.querySelector('.page-transition__loader-circle-core')
  const loaderTitle = overlay.querySelector('.page-transition__loader-title')
  const loaderPercent = overlay.querySelector('.page-transition__loader-percent')
  let progressTimer = 0
  let lastPercentTextUpdate = 0

  const setProgressMode = (mode) => {
    document.body.classList.toggle('page-progress-return', mode === 'return')
    document.body.classList.toggle('page-progress-topic', mode === 'topic')
  }

  const clearProgressMode = () => {
    document.body.classList.remove('page-progress-return')
    document.body.classList.remove('page-progress-topic')
  }

  const setTopicTitle = (topicId) => {
    if (!loaderTitle) return
    loaderTitle.textContent = TOPIC_PAGE_LABELS[topicId] || '专题页面'
  }

  const setReturnTitle = () => {
    if (loaderKicker) loaderKicker.textContent = '正在返回'
    if (loaderTitle) loaderTitle.textContent = RETURN_PAGE_LABEL
  }

  const setProgress = (value, forceText = false) => {
    if (!progressBar) return
    const nextValue = Math.max(0, Math.min(1, value))
    progressBar.style.transform = `scaleX(${nextValue})`
    loader?.style.setProperty('--progress-angle', `${nextValue * 360}deg`)

    const now = performance.now()
    if ((loaderPercent || loaderCircleCore) && (forceText || now - lastPercentTextUpdate >= 96)) {
      const percentText = `${Math.round(nextValue * 100)}%`
      if (loaderPercent) loaderPercent.textContent = percentText
      if (loaderCircleCore) loaderCircleCore.textContent = percentText
      lastPercentTextUpdate = now
    }
  }

  const stopProgressTimer = () => {
    window.clearInterval(progressTimer)
    progressTimer = 0
  }

  const startTopicProgress = (topicId) => {
    stopProgressTimer()
    setProgressMode('topic')
    if (loaderKicker) loaderKicker.textContent = '正在加载专题'
    setTopicTitle(topicId)
    document.body.classList.add('page-has-topic-progress')
    setProgress(0.06, true)

    const startedAt = performance.now()
    progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const t = Math.min(1, elapsed / TRANSITION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(0.06 + eased * 0.8)

      if (t >= 1) stopProgressTimer()
    }, 16)
  }

  const startReturnProgress = () => {
    stopProgressTimer()
    setProgressMode('return')
    setReturnTitle()
    document.body.classList.add('page-has-topic-progress')
    setProgress(0.08, true)

    const startedAt = performance.now()
    progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const t = Math.min(1, elapsed / TRANSITION_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(0.08 + eased * 0.9)

      if (t >= 1) stopProgressTimer()
    }, 16)
  }

  const finishTopicProgress = (topicId) => {
    stopProgressTimer()
    setProgressMode('topic')
    if (loaderKicker) loaderKicker.textContent = '正在加载专题'
    setTopicTitle(topicId)
    document.body.classList.add('page-has-topic-progress')
    setProgress(0.86, true)

    window.requestAnimationFrame(() => {
      setProgress(1, true)
      window.setTimeout(() => {
        document.body.classList.remove('page-has-topic-progress')
        clearProgressMode()
        setProgress(0, true)
      }, 520)
    })
  }

  const finishReturnProgress = () => {
    stopProgressTimer()
    setProgressMode('return')
    setReturnTitle()
    document.body.classList.add('page-has-topic-progress')
    setProgress(0.98, true)

    window.requestAnimationFrame(() => {
      setProgress(1, true)
      window.setTimeout(() => {
        document.body.classList.remove('page-has-topic-progress')
        clearProgressMode()
        setProgress(0, true)
      }, 520)
    })
  }

  const enteringTopicId = !prefersReducedMotion ? getTopicProgressEntryId() : ''
  const returningTopicId = !prefersReducedMotion && !enteringTopicId ? getReturnProgressEntryId() : ''
  const completeProgressOnEnter = Boolean(enteringTopicId || returningTopicId)
  let keepEntryProgressOnPageshow = completeProgressOnEnter

  if (!prefersReducedMotion) {
    if (enteringTopicId) finishTopicProgress(enteringTopicId)
    if (returningTopicId) finishReturnProgress()
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
    const returnTopicId = topicId ? '' : getReturnTopicIdFromUrl(nextUrl)
    const shouldUseHistoryBack = returnTopicId ? canReturnWithHistory(returnTopicId) : false
    if (topicId) {
      try {
        window.sessionStorage.setItem(TOPIC_PROGRESS_MARKER, topicId)
      } catch {
        // Progress still works for the current page even if sessionStorage is unavailable.
      }
      markCurrentHomeTopic(topicId)
      setDirectReturnMarker(topicId, nextUrl)
      startTopicProgress(topicId)
    } else if (returnTopicId) {
      if (shouldUseHistoryBack) {
        clearDirectReturnMarker()
      } else {
        try {
          window.sessionStorage.setItem(RETURN_PROGRESS_MARKER, returnTopicId)
        } catch {
          // Progress still works for the current page even if sessionStorage is unavailable.
        }
      }
      startReturnProgress()
    }

    document.body.classList.add('page-is-leaving')
    window.setTimeout(() => {
      if (shouldUseHistoryBack) {
        window.history.back()
        return
      }

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
    clearProgressMode()
    setProgress(0, true)
  })
}
