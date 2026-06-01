import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { useReducedMotion } from '../../../src/composables/useReducedMotion'

type Listener = (e: { matches: boolean }) => void

function installMatchMediaMock(initialMatches: boolean) {
  const listeners: Listener[] = []
  const mql = {
    matches: initialMatches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_: string, l: Listener) => listeners.push(l),
    removeEventListener: (_: string, l: Listener) => {
      const i = listeners.indexOf(l)
      if (i >= 0) listeners.splice(i, 1)
    },
    dispatchEvent: () => true,
    addListener: () => {},
    removeListener: () => {},
  }
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia
  return {
    fire: (matches: boolean) => {
      mql.matches = matches
      for (const l of listeners) l({ matches })
    },
  }
}

describe('useReducedMotion', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('reflects the initial matchMedia value after mount', async () => {
    installMatchMediaMock(true)
    let exposed: ReturnType<typeof useReducedMotion> | undefined
    const Probe = defineComponent({
      setup() {
        exposed = useReducedMotion()
        return () => h('div')
      },
    })
    mount(Probe)
    // onMounted runs synchronously in Vue Test Utils after mount()
    expect(exposed?.value).toBe(true)
  })

  it('updates when the media query changes', async () => {
    const mq = installMatchMediaMock(false)
    let exposed: ReturnType<typeof useReducedMotion> | undefined
    const Probe = defineComponent({
      setup() {
        exposed = useReducedMotion()
        return () => h('div')
      },
    })
    mount(Probe)
    expect(exposed?.value).toBe(false)
    mq.fire(true)
    expect(exposed?.value).toBe(true)
  })
})
