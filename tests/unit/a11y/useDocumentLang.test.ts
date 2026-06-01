import { describe, it, expect, beforeEach } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { useDocumentLang } from '../../../src/composables/useDocumentLang'

function makeApp() {
  const i18n = createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'en',
    messages: { de: {}, en: {} },
  })

  const Probe = defineComponent({
    setup() {
      useDocumentLang()
      return () => h('div')
    },
  })

  const wrapper = mount(Probe, { global: { plugins: [i18n] } })
  return { wrapper, i18n }
}

describe('useDocumentLang', () => {
  beforeEach(() => {
    document.documentElement.lang = ''
  })

  it('initializes <html lang> from the active locale on mount', () => {
    makeApp()
    expect(document.documentElement.lang).toBe('de')
  })

  it('updates <html lang> when the locale changes', async () => {
    const { i18n } = makeApp()
    expect(document.documentElement.lang).toBe('de')
    i18n.global.locale.value = 'en'
    await nextTick()
    expect(document.documentElement.lang).toBe('en')
  })
})
