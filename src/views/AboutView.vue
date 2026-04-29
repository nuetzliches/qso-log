<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { version } from '../../package.json'

const isDev = import.meta.env.DEV
const { t } = useI18n()
</script>

<template>
  <div class="max-w-2xl space-y-8">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
      {{ t('about.title') }}
    </h1>

    <!-- Die App -->
    <section class="space-y-3">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('about.appHeading') }}</h2>
      <p class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        QSOlog v{{ version }}
        <span v-if="isDev" class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">dev</span>
      </p>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.appDescription') }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('about.openSource') }}
        <a
          href="https://github.com/nuetzliches/qso-log"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-primary-600 hover:underline dark:text-primary-400"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.341-3.369-1.341-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
          GitHub
        </a>
      </p>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('about.licenseText') }}
        <a
          href="https://opensource.org/licenses/MIT"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 hover:underline dark:text-primary-400"
        >MIT License</a>.
      </p>
    </section>

    <!-- Impressum -->
    <section class="space-y-2 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('about.legalHeading') }}</h2>
      <p class="text-xs text-gray-400 dark:text-gray-500">{{ t('about.legalBasis') }}</p>
      <address class="not-italic text-sm text-gray-600 dark:text-gray-400">
        nützliche.IT – Philipp Draese<br />
        Ringstr. 1<br />
        79541 Lörrach-Brombach
      </address>
    </section>

    <!-- Datenschutz -->
    <section class="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('about.privacyHeading') }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.privacyLocal') }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.privacyLookup') }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.privacyPropagation') }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('about.privacyGitHub') }}
        <a
          href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
          target="_blank"
          rel="noopener noreferrer"
          class="text-primary-600 hover:underline dark:text-primary-400"
        >GitHub Privacy Statement</a>
      </p>
    </section>

    <!-- Haftungsausschluss -->
    <section class="space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('about.disclaimerHeading') }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.disclaimerContent') }}</p>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.disclaimerLinks') }}</p>
    </section>

    <!-- KI-Hinweis -->
    <section class="space-y-2 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ t('about.aiHeading') }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ t('about.aiText') }}</p>
    </section>
  </div>
</template>
