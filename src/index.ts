import { convert } from './core/convert'
import { hasLanguage, registerLanguage as registerLanguageInRegistry, getSupportedLanguages } from './core/registry'
import { LanguageConverter } from './core/types'
import { ConversionError } from './core/errors'

import { deConverter } from './languages/de'
import { enInConverter } from './languages/en-in'
import { enUsConverter } from './languages/en-us'
import { frConverter } from './languages/fr'
import { idConverter } from './languages/id'
import { trConverter } from './languages/tr'

const builtIns: LanguageConverter[] = [enUsConverter, enInConverter, deConverter, trConverter, idConverter, frConverter]

for (const converter of builtIns) {
  if (!hasLanguage(converter.code)) {
    registerLanguageInRegistry(converter.code, converter)
  }
}

export { convert, getSupportedLanguages, ConversionError }
export type { ConvertOptions, LanguageConverter, TextCase } from './core/types'

export function registerLanguage(code: string, converter: LanguageConverter): void {
  registerLanguageInRegistry(code, converter)
}
