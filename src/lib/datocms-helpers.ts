import { PathType } from './types'
import { markdownRegexesArray, htmlRegex } from './regexes'

export const pathTypeIsObject = [
  PathType.structured_text,
  PathType.structured_text_block,
  PathType.structured_text_inline_item,
  PathType.structured_text_code,
  PathType.color,
  PathType.media,
  PathType.seo,
  PathType.meta,
]

export function isStructuredTextText(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    ((Object.keys(value).length === 2 &&
      'children' in value &&
      'type' in value) ||
      (Object.keys(value).length === 3 &&
        'children' in value &&
        'type' in value &&
        'level' in value) ||
      (Object.keys(value).length === 3 &&
        'children' in value &&
        'type' in value &&
        'style' in value) ||
      (Object.keys(value).length === 4 &&
        'children' in value &&
        'type' in value &&
        'style' in value &&
        'level' in value))
  )
}

export function isStructuredTextCode(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    value.type === 'code' &&
    'children' in value
  )
}

export function isStructuredTextBlock(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    value.type === 'block' &&
    'children' in value &&
    'blockModelId' in value
  )
}

export function isStructuredTextInlineItem(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    value.type === 'inlineItem' &&
    'children' in value &&
    'item' in value &&
    'itemTypeId' in value
  )
}

export function isImage(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    'upload_id' in value &&
    'focal_point' in value &&
    'alt' in value
  )
}

export function isColor(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    Object.keys(value).length === 4 &&
    'alpha' in value &&
    'blue' in value &&
    'green' in value &&
    'red' in value
  )
}

// IMPORTANT: the three predicates below decide whether a value is data rather
// than prose, and anything they claim is skipped during translation without a
// warning. They used to be written as the loosest possible coercion check,
// which made them swallow ordinary sentences. Keep them strict.

// A number field holds an actual number. A string counts only when it is
// nothing but a number: `Number(value)` accepted anything it could coerce,
// so a span reading "2 " was classified as a number and left untranslated.
export function isNumberValue(value: any): boolean {
  if (typeof value === 'number') {
    return Number.isFinite(value)
  }
  if (typeof value !== 'string') {
    return false
  }
  // Deliberately not trimmed: surrounding whitespace means the value came from
  // prose, such as the "2 " that precedes a bold unit in a sentence.
  return /^[+-]?(\d+\.?\d*|\.\d+)$/.test(value)
}

// `Date.parse()` accepts far more than dates: its legacy fallback parser picks
// numbers out of arbitrary prose, so "Stand 172" parsed as the year 172 and
// "Am Bahnhof 3-4" as a date. Both were then treated as dates and dropped.
// DatoCMS stores date and date-time fields as ISO-8601, so require that shape.
const isoDateRegex =
  /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

export function isDateValue(value: any): boolean {
  if (value instanceof Date) {
    return true
  }
  if (typeof value !== 'string') {
    return false
  }
  const trimmed = value.trim()
  return isoDateRegex.test(trimmed) && !isNaN(Date.parse(trimmed))
}

// A JSON field holds an object or an array. Bare `JSON.parse()` also succeeds
// on quoted strings and numbers, so a quoted sentence such as
// "Aquaculture in Global Change" counted as JSON and was never translated.
export function isJsonObjectString(value: any): boolean {
  if (typeof value !== 'string') {
    return false
  }
  try {
    const parsed = JSON.parse(value)
    return typeof parsed === 'object' && parsed !== null
  } catch (e) {
    return false
  }
}

export function isSeo(value: any): boolean {
  return (
    Boolean(value) &&
    !Array.isArray(value) &&
    Object.keys(value).length === 4 &&
    'description' in value &&
    'image' in value &&
    'title' in value &&
    'twitter_card' in value
  )
}

export function getValueType(
  key: string,
  value: any,
  currentType: PathType,
  excludedKeys?: string,
): PathType {
  if (excludedKeys) {
    const excludedKeysArray = excludedKeys.split(',').map((key) => key.trim())

    if (excludedKeysArray.includes(key)) {
      return PathType.exclude
    }
  }

  if (
    key === 'itemTypeId' ||
    key === 'itemId' ||
    key === 'upload_id' ||
    key === 'id' ||
    key === 'blockModelId' ||
    key === 'key'
  ) {
    return PathType.id
  }

  if (key === 'slug' || key === 'url') {
    return PathType.slug
  }

  if (key === 'meta') {
    return PathType.meta
  }

  if (typeof value === 'boolean') {
    return PathType.boolean
  }

  if (pathTypeIsObject.indexOf(currentType) === -1 && isNumberValue(value)) {
    return PathType.number
  }

  if (pathTypeIsObject.indexOf(currentType) === -1 && isDateValue(value)) {
    return PathType.date
  }

  if (isJsonObjectString(value)) {
    return PathType.json
  }

  // IMPORTANT: these regexes carry the global flag and are shared module-level
  // objects, so RegExp.test() resumes from the lastIndex left behind by the
  // previous value it was called with. Without resetting, whether a value is
  // seen as markdown depends on which values happened to be classified before
  // it, which made misclassification come and go between runs. Reset first.
  if (
    markdownRegexesArray.some((regex) => {
      regex.lastIndex = 0
      return regex.test(value)
    })
  ) {
    return PathType.markdown
  }

  if (htmlRegex.test(value)) {
    return PathType.html
  }

  if (
    currentType === PathType.text &&
    Array.isArray(value) &&
    typeof value[0] === 'object' &&
    isStructuredTextText(value[0])
  ) {
    return PathType.structured_text
  }

  if (
    currentType === PathType.text &&
    typeof value === 'object' &&
    isStructuredTextBlock(value)
  ) {
    return PathType.structured_text_block
  }

  if (
    currentType === PathType.text &&
    typeof value === 'object' &&
    isStructuredTextInlineItem(value)
  ) {
    return PathType.structured_text_inline_item
  }

  if (
    currentType === PathType.text &&
    typeof value === 'object' &&
    isStructuredTextCode(value)
  ) {
    return PathType.structured_text_code
  }

  if (
    currentType === PathType.text &&
    typeof value === 'object' &&
    isColor(value)
  ) {
    return PathType.color
  }

  if (
    currentType === PathType.text &&
    typeof value === 'object' &&
    isImage(value)
  ) {
    return PathType.media
  }

  if (
    currentType === PathType.text &&
    typeof value === 'object' &&
    isSeo(value)
  ) {
    return PathType.seo
  }

  return currentType
}
