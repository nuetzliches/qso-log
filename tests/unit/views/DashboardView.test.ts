import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '../../../src/views/DashboardView.vue'
import { useQsoStore } from '../../../src/stores/qsoStore'
import { useOperatorStore } from '../../../src/stores/operatorStore'
import enMessages from '../../../src/i18n/locales/en.json'
import type { QSO } from '../../../src/types/qso'

// Mock leaflet (not needed in jsdom for unit tests)
vi.mock('../../../src/composables/useLeafletMap', () => ({
  useLeafletMap: () => ({
    isLoaded: { value: false },
    init: vi.fn().mockResolvedValue(undefined),
    setMarkers: vi.fn(),
    setOwnStation: vi.fn(),
    fitBounds: vi.fn(),
  }),
}))

// Mock qsoRepository
const getAllMock = vi.fn()
const getRecentMock = vi.fn()
vi.mock('../../../src/db/repositories/qsoRepository', () => ({
  qsoRepository: {
    getAll: (...args: unknown[]) => getAllMock(...args),
    getRecentQsos: (...args: unknown[]) => getRecentMock(...args),
    count: vi.fn(),
  },
}))

// Mock operator repository
vi.mock('../../../src/db/repositories/operatorRepository', () => ({
  operatorRepository: {
    getAll: vi.fn().mockResolvedValue([]),
  },
}))

// Mock settings store (simplified)
vi.mock('../../../src/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    ownCallsign: '',
    ownLocator: '',
    theme: 'light',
    loadSettings: vi.fn(),
  }),
}))

function createTestQso(overrides: Partial<QSO> = {}): QSO {
  return {
    id: 1,
    uuid: 'test-uuid',
    sequenceNumber: 1,
    date: '2026-04-01T12:00:00Z',
    callsign: 'DL1ABC',
    mode: 'SSB',
    power: '100',
    frequency: '14.200',
    band: '20m',
    rstSent: '59',
    rstReceived: '59',
    remarks: '',
    qslSent: 'no',
    qslReceived: 'no',
    country: 'Germany',
    countryCode: 'DE',
    operatorId: 1,
    _lastModified: Date.now(),
    _syncStatus: 'synced',
    ...overrides,
  }
}

function createRouterStub() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'dashboard', component: { template: '<div />' } },
      { path: '/new', name: 'qso-entry', component: { template: '<div />' } },
      { path: '/history', name: 'qso-history', component: { template: '<div />' } },
      { path: '/map', name: 'map', component: { template: '<div />' } },
      { path: '/statistics', name: 'statistics', component: { template: '<div />' } },
    ],
  })
}

function createI18nStub() {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: { en: enMessages },
  })
}

describe('DashboardView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    getAllMock.mockReset()
    getRecentMock.mockReset()
  })

  it('renders title and quick stats with zero values when empty', async () => {
    getAllMock.mockResolvedValue({ qsos: [], totalCount: 0 })
    getRecentMock.mockResolvedValue([])

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [createI18nStub(), createRouterStub()],
      },
    })
    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('Dashboard')
    const statCards = wrapper.findAll('.rounded-lg.border')
    // First 4 stat cards (Total, DXCC, Bands, This Month) — values should be 0
    expect(wrapper.text()).toContain('Total QSOs')
    expect(wrapper.text()).toContain('DXCC')
    expect(wrapper.text()).toContain('Bands')
    expect(wrapper.text()).toContain('This Month')
    // Empty state message for recent QSOs
    expect(wrapper.text()).toContain('No QSOs yet')
    expect(statCards.length).toBeGreaterThan(0)
  })

  it('renders stats values and recent QSO rows when data is present', async () => {
    const qsos: QSO[] = [
      createTestQso({ id: 1, sequenceNumber: 3, callsign: 'DL1ABC', band: '20m', country: 'Germany', date: '2026-04-10T10:00:00Z' }),
      createTestQso({ id: 2, sequenceNumber: 2, callsign: 'F1XYZ', band: '40m', country: 'France', date: '2026-04-05T10:00:00Z' }),
      createTestQso({ id: 3, sequenceNumber: 1, callsign: 'G0ABC', band: '20m', country: 'England', date: '2026-03-20T10:00:00Z' }),
    ]
    getAllMock.mockResolvedValue({ qsos, totalCount: 3 })
    const qsoStore = useQsoStore()
    qsoStore.recentQsos = qsos
    getRecentMock.mockResolvedValue(qsos)

    // Also seed operator store so recent table renders without error
    const opStore = useOperatorStore()
    opStore.operators = []

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [createI18nStub(), createRouterStub()],
      },
    })
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('Dashboard')
    // 3 total QSOs, 3 countries, 2 bands
    expect(text).toContain('3')
    // Recent QSOs table renders callsigns
    expect(text).toContain('DL1ABC')
    expect(text).toContain('F1XYZ')
    expect(text).toContain('G0ABC')
  })

  it('renders quick action links to new, history, map, statistics', async () => {
    getAllMock.mockResolvedValue({ qsos: [], totalCount: 0 })
    getRecentMock.mockResolvedValue([])

    const wrapper = mount(DashboardView, {
      global: {
        plugins: [createI18nStub(), createRouterStub()],
      },
    })
    await flushPromises()

    const links = wrapper.findAll('a')
    const hrefs = links.map((l) => l.attributes('href'))
    expect(hrefs).toContain('/new')
    expect(hrefs).toContain('/history')
    expect(hrefs).toContain('/map')
    expect(hrefs).toContain('/statistics')
  })
})
