import { TranslationService } from './types'
import {
  yandex as yandexSupportedLocales,
  deeplTo as deeplSupportedToLocales,
  deeplFrom as deeplSupportedFromLocales,
  supertextFrom as supertextSupportedFromLocales,
  supertextTo as supertextSupportedToLocales,
} from './supported-locales'

export function getSupportedToLocale(
  locale: string,
  translationService: TranslationService,
): string {
  const localeLower = locale.toLowerCase()
  const indexOfDash = localeLower.indexOf('-')
  const localeStart =
    indexOfDash > 0 ? localeLower.substring(0, indexOfDash) : localeLower

  switch (translationService) {
    case TranslationService.yandex: {
      return localeStart
    }
    case TranslationService.deepl:
    case TranslationService.deeplFree: {
      switch (localeLower) {
        case 'en':
          return 'EN-US'
        case 'en-eu':
          return 'EN-GB'
        case 'en-ie':
          return 'EN-GB'
        case 'pt':
          return 'PT-PT'
        default:
          break
      }

      if (
        deeplSupportedToLocales
          .map((deeplLocale) => deeplLocale.toLowerCase())
          .includes(localeStart)
      ) {
        return localeStart.toUpperCase()
      }

      return locale.toUpperCase()
    }
    case TranslationService.supertext: {
      if (supertextSupportedToLocales.includes(locale)) {
        return locale
      }

      if (supertextSupportedToLocales.includes(localeStart)) {
        return localeStart
      }

      switch (localeStart) {
        case 'en':
          return 'en-US'
        case 'de':
          return 'de-DE'
        case 'fr':
          return 'fr-FR'
        case 'it':
          return 'it-IT'
        case 'pt':
          return 'pt-PT'
        case 'sr':
          return 'sr-Latn'
        case 'zh':
          return 'zh-Hans'
        default:
          break
      }
    }
  }

  return locale
}

// A project locale the provider cannot translate into makes the provider reject
// the whole request. DeepL answers HTTP 400 for an unknown target_lang, and
// because the caller throws on the first non-200 a single unsupported locale
// aborts the entire run, including the locales that would have succeeded.
// Callers use this to skip those locales instead.
//
// Only DeepL is checked. The other providers either accept anything or resolve
// their own fallbacks, and claiming a locale is unsupported would wrongly skip
// it. getSupportedToLocale still returns an uppercased locale as a last resort,
// which is what this catches.
export function isSupportedToLocale(
  locale: string,
  translationService: TranslationService,
): boolean {
  if (
    translationService !== TranslationService.deepl &&
    translationService !== TranslationService.deeplFree
  ) {
    return true
  }

  const resolved = getSupportedToLocale(locale, translationService)

  return deeplSupportedToLocales
    .map((deeplLocale) => deeplLocale.toLowerCase())
    .includes(resolved.toLowerCase())
}

export function getSupportedFromLocale(
  locale: string,
  translationService: TranslationService,
): string {
  const localeLower = locale.toLowerCase()
  const indexOfDash = localeLower.indexOf('-')
  const localeStart =
    indexOfDash > 0 ? localeLower.substring(0, indexOfDash) : localeLower

  switch (translationService) {
    case TranslationService.yandex: {
      if (yandexSupportedLocales.includes(localeStart)) {
        return localeStart
      }

      return ''
    }
    case TranslationService.deepl:
    case TranslationService.deeplFree: {
      if (
        deeplSupportedFromLocales
          .map((deeplLocale) => deeplLocale.toLowerCase())
          .includes(localeStart)
      ) {
        return localeStart.toUpperCase()
      }

      return ''
    }
    case TranslationService.supertext: {
      if (
        supertextSupportedFromLocales
          .map((supertextLocale) => supertextLocale.toLowerCase())
          .includes(localeStart)
      ) {
        return localeStart
      }

      return ''
    }
  }

  return locale
}

export const deeplTo = [
  'AF',
  'AN',
  'AR',
  'AS',
  'AY',
  'AZ',
  'BA',
  'BE',
  'BG',
  'BN',
  'BR',
  'BS',
  'CA',
  'CS',
  'CY',
  'DA',
  'DE',
  'DE-CH',
  'DE-DE',
  'EL',
  'EN-GB',
  'EN-US',
  'EO',
  'ES',
  'ES-419',
  'ET',
  'EU',
  'FA',
  'FI',
  'FR',
  'FR-CA',
  'FR-FR',
  'GA',
  'GL',
  'GN',
  'GU',
  'HA',
  'HE',
  'HI',
  'HR',
  'HT',
  'HU',
  'HY',
  'ID',
  'IG',
  'IS',
  'IT',
  'JA',
  'JV',
  'KA',
  'KK',
  'KO',
  'KY',
  'LA',
  'LB',
  'LN',
  'LT',
  'LV',
  'MG',
  'MI',
  'MK',
  'ML',
  'MN',
  'MR',
  'MS',
  'MT',
  'MY',
  'NB',
  'NE',
  'NL',
  'OC',
  'OM',
  'PA',
  'PL',
  'PS',
  'PT-BR',
  'PT-PT',
  'QU',
  'RO',
  'RU',
  'SA',
  'SK',
  'SL',
  'SQ',
  'SR',
  'ST',
  'SU',
  'SV',
  'SW',
  'TA',
  'TE',
  'TG',
  'TH',
  'TK',
  'TL',
  'TN',
  'TR',
  'TS',
  'TT',
  'UK',
  'UR',
  'UZ',
  'VI',
  'WO',
  'XH',
  'YI',
  'ZH',
  'ZH-HANS',
  'ZH-HANT',
  'ZU',
]

export const deeplFrom = [
  'AF',
  'AN',
  'AR',
  'AS',
  'AY',
  'AZ',
  'BA',
  'BE',
  'BG',
  'BN',
  'BR',
  'BS',
  'CA',
  'CS',
  'CY',
  'DA',
  'DE',
  'EL',
  'EN',
  'EO',
  'ES',
  'ET',
  'EU',
  'FA',
  'FI',
  'FR',
  'GA',
  'GL',
  'GN',
  'GU',
  'HA',
  'HE',
  'HI',
  'HR',
  'HT',
  'HU',
  'HY',
  'ID',
  'IG',
  'IS',
  'IT',
  'JA',
  'JV',
  'KA',
  'KK',
  'KO',
  'KY',
  'LA',
  'LB',
  'LN',
  'LT',
  'LV',
  'MG',
  'MI',
  'MK',
  'ML',
  'MN',
  'MR',
  'MS',
  'MT',
  'MY',
  'NB',
  'NE',
  'NL',
  'OC',
  'OM',
  'PA',
  'PL',
  'PS',
  'PT',
  'QU',
  'RO',
  'RU',
  'SA',
  'SK',
  'SL',
  'SQ',
  'SR',
  'ST',
  'SU',
  'SV',
  'SW',
  'TA',
  'TE',
  'TG',
  'TH',
  'TK',
  'TL',
  'TN',
  'TR',
  'TS',
  'TT',
  'UK',
  'UR',
  'UZ',
  'VI',
  'WO',
  'XH',
  'YI',
  'ZH',
  'ZU',
]

export const yandex = [
  'af',
  'am',
  'ar',
  'az',
  'ba',
  'be',
  'bg',
  'bn',
  'bs',
  'ca',
  'ceb',
  'cs',
  'cy',
  'da',
  'de',
  'el',
  'en',
  'eo',
  'es',
  'et',
  'eu',
  'fa',
  'fi',
  'fr',
  'ga',
  'gd',
  'gl',
  'gu',
  'he',
  'hi',
  'hr',
  'ht',
  'hu',
  'hy',
  'id',
  'is',
  'it',
  'ja',
  'jv',
  'ka',
  'kk',
  'km',
  'kn',
  'ko',
  'ky',
  'la',
  'lb',
  'lo',
  'lt',
  'lv',
  'mg',
  'mhr',
  'mi',
  'mk',
  'ml',
  'mn',
  'mr',
  'mrj',
  'ms',
  'mt',
  'my',
  'ne',
  'nl',
  'no',
  'pa',
  'pap',
  'pl',
  'pt',
  'ro',
  'ru',
  'si',
  'sk',
  'sl',
  'sq',
  'sr',
  'su',
  'sv',
  'sw',
  'ta',
  'te',
  'tg',
  'th',
  'tl',
  'tr',
  'tt',
  'udm',
  'uk',
  'ur',
  'uz',
  'vi',
  'xh',
  'yi',
  'zh',
]

export const supertextFrom = [
  'bg',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fi',
  'fr',
  'gsw',
  'hr',
  'hu',
  'it',
  'ja',
  'ko',
  'nb',
  'nl',
  'pl',
  'pt',
  'rm',
  'ru',
  'sk',
  'sl',
  'sq',
  'sr',
  'sv',
  'tr',
  'zh',
]

export const supertextTo = [
  'bg',
  'cs',
  'da',
  'de-AT',
  'de-CH',
  'de-DE',
  'el',
  'en-GB',
  'en-US',
  'es',
  'fi',
  'fr-CH',
  'fr-FR',
  'gsw-u-sd-chbe',
  'gsw-u-sd-chzh',
  'hr',
  'hu',
  'it-CH',
  'it-IT',
  'ja',
  'ko',
  'nb',
  'nl',
  'pl',
  'pt-BR',
  'pt-PT',
  'rm',
  'ru',
  'sk',
  'sl',
  'sq',
  'sr-Cyrl',
  'sr-Latn',
  'sv',
  'tr',
  'zh-Hans',
  'zh-Hant',
]
