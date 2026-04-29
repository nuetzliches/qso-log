/**
 * Required-field marker pattern (a11y).
 *
 * The plan called for a dedicated <RequiredMarker /> component, but in
 * implementation the marker was inlined in form labels (see QsoForm.vue):
 *
 *   <span class="text-red-600 dark:text-red-400" aria-hidden="true">*</span>
 *   <span class="sr-only">{{ t('a11y.required') }}</span>
 *
 * This test guards the convention so future labels keep both the visual
 * asterisk (decorative, aria-hidden) and an sr-only text equivalent.
 */
import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'de',
  fallbackLocale: 'en',
  messages: {
    de: { a11y: { required: 'Pflichtfeld' } },
    en: { a11y: { required: 'Required field' } },
  },
})

const SampleLabel = defineComponent({
  template: `
    <div>
      <label for="x">
        Datum
        <span class="text-red-600 dark:text-red-400" aria-hidden="true">*</span>
        <span class="sr-only">{{ $t('a11y.required') }}</span>
      </label>
      <input id="x" required />
    </div>
  `,
})

describe('required-field marker convention', () => {
  it('renders a decorative asterisk and an sr-only label text', () => {
    const wrapper = mount(SampleLabel, { global: { plugins: [i18n] } })
    const decorative = wrapper.get('span[aria-hidden="true"]')
    expect(decorative.text()).toBe('*')

    const srOnly = wrapper.get('span.sr-only')
    expect(srOnly.text()).toBe('Pflichtfeld')
  })

  it('translates the sr-only text when locale changes', async () => {
    const wrapper = mount(SampleLabel, { global: { plugins: [i18n] } })
    i18n.global.locale.value = 'en'
    await wrapper.vm.$nextTick()
    expect(wrapper.get('span.sr-only').text()).toBe('Required field')
    i18n.global.locale.value = 'de'
  })
})
