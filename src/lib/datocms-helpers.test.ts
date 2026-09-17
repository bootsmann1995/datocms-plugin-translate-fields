import {
  structuredTextBlockSlate,
  structuredTextCodeSlate,
  structuredTextInlineItemSlate,
  structuredTextSlate,
} from '../mocks/structured-text-mock'
import { metaArray } from '../mocks/helper-mocks'
import { getValueType } from './datocms-helpers'
import { PathType } from './types'

describe('getValueType', () => {
  it('should return excluded when key is included in excluded key', () => {
    expect(getValueType('test', 'text', PathType.text, 'test')).toBe(
      PathType.exclude,
    )
  })
  it('should return excluded when key is included in comma separated list', () => {
    expect(getValueType('test', 'text', PathType.text, 'test, test2')).toBe(
      PathType.exclude,
    )
  })
  it('should return id when key is itemTypeId', () => {
    expect(getValueType('itemTypeId', 'text', PathType.text)).toBe(PathType.id)
  })
  it('should return id when key is itemId', () => {
    expect(getValueType('itemId', 'text', PathType.text)).toBe(PathType.id)
  })
  it('should return id when key is upload_id', () => {
    expect(getValueType('upload_id', 'text', PathType.text)).toBe(PathType.id)
  })
  it('should return id when key is id', () => {
    expect(getValueType('id', 'text', PathType.text)).toBe(PathType.id)
  })
  it('should return id when key is blockModelId', () => {
    expect(getValueType('blockModelId', 'text', PathType.text)).toBe(
      PathType.id,
    )
  })
  it('should return id when key is key', () => {
    expect(getValueType('key', 'text', PathType.text)).toBe(PathType.id)
  })
  it('should return slug when key is slug', () => {
    expect(getValueType('slug', 'text', PathType.text)).toBe(PathType.slug)
  })
  it('should return slug when key is url', () => {
    expect(getValueType('url', 'text', PathType.text)).toBe(PathType.slug)
  })
  it('should return meta when key is meta', () => {
    expect(getValueType('meta', metaArray, PathType.meta)).toBe(PathType.meta)
  })
  it('should return meta when current key is meta', () => {
    expect(getValueType('value', '_blank', PathType.meta)).toBe(PathType.meta)
  })
  it('should return boolean when value is boolean', () => {
    expect(getValueType('boolean', true, PathType.text)).toBe(PathType.boolean)
  })
  it('should return markdown when value is markdown', () => {
    expect(getValueType('markdown', '## markdown', PathType.text)).toBe(
      PathType.markdown,
    )
  })
  it('should return html when value is html', () => {
    expect(getValueType('html', '<p>html</p>', PathType.text)).toBe(
      PathType.html,
    )
  })
  it('should return structured_text when value is a structured text slate', () => {
    expect(
      getValueType('structured_text', structuredTextSlate, PathType.text),
    ).toBe(PathType.structured_text)
  })
  it('should return structured_text_block when value is a block inside a structured text slate', () => {
    expect(
      getValueType(
        'structured_text_block',
        structuredTextBlockSlate,
        PathType.text,
      ),
    ).toBe(PathType.structured_text_block)
  })
  it('should return structured_text_inline_item when value is an inline item inside a structured text slate', () => {
    expect(
      getValueType(
        'structured_text_inline_item',
        structuredTextInlineItemSlate,
        PathType.text,
      ),
    ).toBe(PathType.structured_text_inline_item)
  })
  it('should return structured_text_code when value is a code block inside a structured text slate', () => {
    expect(
      getValueType(
        'structured_text_code',
        structuredTextCodeSlate,
        PathType.text,
      ),
    ).toBe(PathType.structured_text_code)
  })
  it('should return color when value is a color', () => {
    expect(
      getValueType(
        'color',
        { red: 0, green: 0, blue: 0, alpha: 0 },
        PathType.text,
      ),
    ).toBe(PathType.color)
  })
  it('should return media when value is a media', () => {
    expect(
      getValueType(
        'media',
        { upload_id: '1', focal_point: '1', alt: '' },
        PathType.text,
      ),
    ).toBe(PathType.media)
  })
  it('should return seo when value is a seo', () => {
    expect(
      getValueType(
        'seo',
        {
          title: 'title',
          description: 'description',
          image: '1',
          twitter_card: 'summary',
        },
        PathType.text,
      ),
    ).toBe(PathType.seo)
  })
  it('should return number when value is a number', () => {
    expect(getValueType('number', 1, PathType.text)).toBe(PathType.number)
  })
  it('should return date when value is a date', () => {
    expect(getValueType('date', '2021-01-01', PathType.text)).toBe(
      PathType.date,
    )
  })
  it('should return json when value is json string', () => {
    expect(getValueType('json string', '["test","test"]', PathType.text)).toBe(
      PathType.json,
    )
  })
  it('should return text when value is string', () => {
    expect(getValueType('text', 'text', PathType.text)).toBe(PathType.text)
  })
})

// Anything classified as data is skipped during translation without a warning,
// so a loose guess here shows up as prose that stays in the source language.
// Every string below is real editorial copy that used to be misclassified.
describe('getValueType does not mistake prose for data', () => {
  it.each([
    [
      'Come visit us: Pavilion of Denmark - Kupola Hall, Stand 172.',
      'trailing number parsed as a year',
    ],
    ['Aquaculture Europe 2026', 'year in a title'],
    ['Am Bahnhof 3-4', 'street number parsed as a date'],
    [
      'The R&D team has been busy verifying data from the initial trials',
      'prose with an ampersand',
    ],
    ['2 kg of feed per fish', 'leading number'],
    ['Feed sizes range from 3 to 12 mm', 'numbers mid-sentence'],
  ])('keeps %j translatable (%s)', (value) => {
    expect(getValueType('text', value, PathType.text)).toBe(PathType.text)
  })

  it('does not treat a quoted sentence as json', () => {
    expect(
      getValueType('text', '"Aquaculture in Global Change"', PathType.text),
    ).toBe(PathType.text)
  })

  it('does not treat a bare number-like string with text as a number', () => {
    expect(getValueType('text', '2 ', PathType.text)).toBe(PathType.text)
  })

  it('still detects a real iso date', () => {
    expect(getValueType('date', '2026-09-28T10:00:00Z', PathType.text)).toBe(
      PathType.date,
    )
  })

  it('still detects a real number string', () => {
    expect(getValueType('number', '42', PathType.text)).toBe(PathType.number)
    expect(getValueType('number', '-3.5', PathType.text)).toBe(PathType.number)
  })

  it('still detects a real json object', () => {
    expect(getValueType('json', '{"a":1}', PathType.text)).toBe(PathType.json)
  })
})
