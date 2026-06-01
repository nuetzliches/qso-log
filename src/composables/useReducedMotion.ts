import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Reactive flag for the user's `prefers-reduced-motion` setting.
 * Allows JS-driven animations (e.g. Leaflet pan/zoom) to be disabled
 * in addition to the CSS-level fallback (WCAG 2.3.3).
 */
export function useReducedMotion() {
  const prefers = ref(false)
  let mq: MediaQueryList | null = null
  const update = () => {
    prefers.value = !!mq?.matches
  }
  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    update()
    mq.addEventListener('change', update)
  })
  onBeforeUnmount(() => {
    mq?.removeEventListener('change', update)
  })
  return prefers
}
