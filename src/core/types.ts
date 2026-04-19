export type TextCase = 'titleCase' | 'lowerCase' | 'upperCase'

export interface ConvertOptions {
  language?: string
  separator?: string
  case?: TextCase
}

export interface ConvertContext {
  separator: string
}

export interface LanguageConverter {
  code: string
  defaultSeparator: string
  decimalWord: string
  negativeWord: string
  caseLocale?: string
  convertInteger: (value: string, context: ConvertContext) => string
}
