import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LocatorInput from '../../../src/components/common/LocatorInput.vue'
import deMessages from '../../../src/i18n/locales/de.json'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: { de: deMessages, en: deMessages },
})

function makeWrapper(modelValue: string) {
  return mount(LocatorInput, {
    props: {
      modelValue,
      label: 'Locator',
      id: 'loc',
    },
    global: { plugins: [i18n] },
  })
}

describe('LocatorInput a11y', () => {
  it('does not set aria-invalid for an empty value', () => {
    const w = makeWrapper('')
    const input = w.get('input')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(input.attributes('aria-describedby')).toBeUndefined()
    expect(w.find('#loc-error').exists()).toBe(false)
  })

  it('does not set aria-invalid for a valid 6-char locator', () => {
    const w = makeWrapper('JN47AO')
    const input = w.get('input')
    expect(input.attributes('aria-invalid')).toBeUndefined()
    expect(w.find('#loc-error').exists()).toBe(false)
  })

  it('sets aria-invalid and links a describedby error message for an invalid value', () => {
    const w = makeWrapper('XX')
    const input = w.get('input')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('loc-error')
    const error = w.get('#loc-error')
    expect(error.text()).toContain('Maidenhead')
  })
})
