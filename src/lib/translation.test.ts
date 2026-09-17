import { getStructuredTextTranslation, getTranslation } from './translation'
import { TranslationFormat, TranslationService } from './types'

const tranlationOptions = {
  fromLocale: 'nl',
  toLocale: 'en',
  format: TranslationFormat.plain,
  translationService: TranslationService.mock,
  apiKey: '',
  openAIOptions: {
    model: 'text-davinci-003',
    temperature: 0,
    maxCompletionTokens: 100,
    topP: 0,
    prompt:
      "Translate the following from the locale '{{fromLocale}}' to the locale '{{toLocale}}': {{value}}",
  },
}

const translatedText = 'Translated test'

const fetchMock = jest.fn()
const setFetchReturnValue = (value: unknown) => {
  fetchMock.mockReset()
  fetchMock.mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve(value),
      status: 200,
    }),
  )
}
global.fetch = fetchMock

describe('getTranslation', () => {
  it('should return translation', async () => {
    const translation = await getTranslation('test', tranlationOptions)
    expect(translation).toStrictEqual(translatedText)
  })

  it('should return translation with yandex response', async () => {
    setFetchReturnValue({ text: [translatedText] })
    expect.assertions(1)

    const translation = await getTranslation('test', {
      ...tranlationOptions,
      translationService: TranslationService.yandex,
    })
    expect(translation).toStrictEqual(translatedText)
  })

  it('should return translation with deepl response', async () => {
    setFetchReturnValue({ translations: [{ text: translatedText }] })

    const translation = await getTranslation('test', {
      ...tranlationOptions,
      translationService: TranslationService.deepl,
    })
    expect(translation).toStrictEqual(translatedText)
  })

  it('should return translation with deepl free response', async () => {
    setFetchReturnValue({ translations: [{ text: translatedText }] })

    const translation = await getTranslation('test', {
      ...tranlationOptions,
      translationService: TranslationService.deeplFree,
    })
    expect(translation).toStrictEqual(translatedText)
  })

  it('should return translation with openAI response', async () => {
    setFetchReturnValue({
      choices: [{ message: { content: translatedText } }],
    })

    const translation = await getTranslation('test', {
      ...tranlationOptions,
      translationService: TranslationService.openAI,
    })
    expect(translation).toStrictEqual(translatedText)
  })

  it('should return translation with yandex response', async () => {
    setFetchReturnValue({ text: [translatedText] })
    await expect(() =>
      getTranslation('test', {
        ...tranlationOptions,
        translationService: 'test' as TranslationService,
      }),
    ).rejects.toThrow('No translation service added in the settings')
  })
})

describe('getStructuredTextTranslation translates every span', () => {
  // A span is prose no matter what it contains. These shapes all used to be
  // classified as something other than text and were then dropped in silence,
  // which surfaced as a paragraph left in the source language.
  const paragraph = (text: string) => ({
    type: 'paragraph',
    children: [{ text }],
  })

  it.each([
    ['soft line break', 'First line.\nSecond line.\n'],
    ['trailing number', 'Pavilion of Denmark - Kupola Hall, Stand 172.'],
    ['year in a title', 'Aquaculture Europe 2026'],
    ['quoted sentence', '"Aquaculture in Global Change"'],
  ])('translates a span holding a %s', async (_name, text) => {
    const result = await getStructuredTextTranslation(
      [paragraph(text)],
      tranlationOptions,
    )
    expect(result[0].children[0].text).toStrictEqual(`Translated ${text}`)
  })

  it('translates every span of a paragraph split by marks', async () => {
    const value = [
      {
        type: 'paragraph',
        children: [
          { text: 'This edition will take place from ' },
          { text: '28 September to 1 October 2026', marks: ['strong'] },
          { text: ' in Ljubljana, Slovenia.' },
        ],
      },
    ]

    const result = await getStructuredTextTranslation(value, tranlationOptions)

    expect(result[0].children.map((child: any) => child.text)).toStrictEqual([
      'Translated This edition will take place from ',
      'Translated 28 September to 1 October 2026',
      'Translated  in Ljubljana, Slovenia.',
    ])
  })

  it('still honours excluded keys', async () => {
    const result = await getStructuredTextTranslation([paragraph('Test')], {
      ...tranlationOptions,
      excludedKeys: 'text',
    })
    expect(result[0].children[0].text).toStrictEqual('Test')
  })
})
