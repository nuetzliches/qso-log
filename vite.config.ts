import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon-192x192.png', 'icons/icon-512x512.png'],
      manifest: {
        name: 'funk-log',
        short_name: 'funk-log',
        description: 'Offline-first logbook for amateur radio operators',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        categories: ['productivity', 'utilities'],
        shortcuts: [
          {
            name: 'New QSO',
            short_name: 'New QSO',
            url: '/',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'QSO History',
            short_name: 'History',
            url: '/history',
            icons: [{ src: 'icons/icon-192x192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
