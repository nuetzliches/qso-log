import { computed } from 'vue'
import { useSettingsStore } from '../../../stores/settingsStore'

export function useChartTheme() {
  const settings = useSettingsStore()

  const isDark = computed(() => {
    if (settings.theme === 'dark') return true
    if (settings.theme === 'light') return false
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const colors = computed(() =>
    isDark.value
      ? { text: '#d1d5db', grid: 'rgba(75, 85, 99, 0.3)', bg: '#111827' }
      : { text: '#374151', grid: 'rgba(209, 213, 219, 0.5)', bg: '#ffffff' },
  )

  return { isDark, colors }
}

// Chart color palette — distinct, colorblind-friendly
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#a855f7', // purple
  '#e11d48', // rose
  '#0ea5e9', // sky
  '#64748b', // slate
  '#d946ef', // fuchsia
]
