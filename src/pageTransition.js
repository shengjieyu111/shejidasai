const TRANSITION_MS = 560

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

export function setupPageTransitions() {
  if (typeof window === 'undefined' || window.__sinoCraftPageTransitions) return
  window.__sinoCraftPageTransitions = true

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const overlay = document.createElement('div')
  overlay.className = 'page-transition'
  overlay.setAttribute('aria-hidden', 'true')
  overlay.innerHTML = '<span class="page-transition__veil"></span><span class="page-transition__grid"></span><span class="page-transition__spark"></span>'
  document.body.appendChild(overlay)
  document.documentElement.classList.add('page-transition-root')

  if (!prefersReducedMotion) {
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
    document.body.classList.add('page-is-leaving')
    window.setTimeout(() => {
      window.location.href = nextUrl.href
    }, TRANSITION_MS)
  })

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-is-leaving')
  })
}
