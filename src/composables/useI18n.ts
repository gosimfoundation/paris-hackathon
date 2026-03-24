import { ref, provide, inject, type InjectionKey, type Ref } from 'vue'
import en from '../i18n/en'
import zh from '../i18n/zh'

type Messages = Record<string, any>
type Locale = 'en' | 'zh'

const I18N_KEY: InjectionKey<{
  locale: Ref<Locale>
  t: (key: string) => any
  toggleLocale: () => void
}> = Symbol('i18n')

const messages: Record<Locale, Messages> = { en, zh }

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj) ?? path
}

export function provideI18n() {
  const locale = ref<Locale>('en')

  function t(key: string): any {
    return getNestedValue(messages[locale.value], key)
  }

  function toggleLocale() {
    locale.value = locale.value === 'en' ? 'zh' : 'en'
  }

  provide(I18N_KEY, { locale, t, toggleLocale })
  return { locale, t, toggleLocale }
}

export function useI18n() {
  const i18n = inject(I18N_KEY)
  if (!i18n) throw new Error('useI18n() called without provideI18n()')
  return i18n
}
