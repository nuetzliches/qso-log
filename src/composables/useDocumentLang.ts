import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Synchronizes the `lang` attribute of the root `<html>` element with the
 * active i18n locale. This is required for screen readers to read the page
 * with the correct pronunciation rules (WCAG 3.1.1 / 3.1.2).
 */
export function useDocumentLang() {
  const { locale } = useI18n()
  const apply = (l: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
    }
  }
  apply(locale.value)
  watch(locale, apply)
}
