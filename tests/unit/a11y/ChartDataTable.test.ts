import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ChartDataTable from '../../../src/components/common/ChartDataTable.vue'

function makeI18n() {
  return createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: { a11y: { showDataTable: 'Show data table' } },
    },
  })
}

describe('ChartDataTable', () => {
  it('renders caption, scoped column headers and a row for every label', () => {
    const wrapper = mount(ChartDataTable, {
      global: { plugins: [makeI18n()] },
      props: {
        caption: 'QSOs per band',
        labelHeader: 'Band',
        labels: ['80m', '40m', '20m'],
        datasets: [{ label: 'Count', data: [3, 5, 7] }],
      },
    })

    const caption = wrapper.find('caption')
    expect(caption.text()).toBe('QSOs per band')

    const colHeaders = wrapper.findAll('thead th')
    expect(colHeaders).toHaveLength(2)
    expect(colHeaders[0].attributes('scope')).toBe('col')
    expect(colHeaders[0].text()).toBe('Band')
    expect(colHeaders[1].attributes('scope')).toBe('col')
    expect(colHeaders[1].text()).toBe('Count')

    const rowHeaders = wrapper.findAll('tbody th')
    expect(rowHeaders).toHaveLength(3)
    expect(rowHeaders[0].attributes('scope')).toBe('row')
    expect(rowHeaders.map(h => h.text())).toEqual(['80m', '40m', '20m'])

    const cells = wrapper.findAll('tbody td')
    expect(cells.map(c => c.text())).toEqual(['3', '5', '7'])
  })

  it('exposes the table via a <details>/<summary> toggle', () => {
    const wrapper = mount(ChartDataTable, {
      global: { plugins: [makeI18n()] },
      props: {
        caption: 'Test',
        labelHeader: 'X',
        labels: ['a'],
        datasets: [{ label: 'Y', data: [1] }],
      },
    })

    expect(wrapper.find('details').exists()).toBe(true)
    expect(wrapper.find('summary').text()).toBe('Show data table')
  })
})
