import { ConversionError } from './errors'
import { getLanguage } from './registry'
import { ConvertOptions } from './types'
import { applyTextCase, normalizeInput } from './utils'

export function convert(value: string | number, options: ConvertOptions = {}): string {
  const languageCode = (options.language ?? 'en-us').toLowerCase()
  const converter = getLanguage(languageCode)
  const normalized = normalizeInput(value)

  if (normalized.isZero) {
    return applyTextCase(converter.convertInteger('0', { separator: '' }), options.case, converter.caseLocale)
  }

  const separator = options.separator ?? converter.defaultSeparator
  const integerText = converter.convertInteger(normalized.integerPart, { separator })

  let output = integerText

  if (normalized.fractionalPart !== undefined) {
    const fractionalText = converter.convertInteger(normalized.fractionalPart, { separator })
    output = `${integerText} ${converter.decimalWord} ${fractionalText}`
  }

  if (normalized.isNegative) {
    output = `${converter.negativeWord} ${output}`
  }

  const result = applyTextCase(output, options.case, converter.caseLocale)
  if (!result.trim()) {
    throw new ConversionError('conversion produced an empty result')
  }

  return result
}
