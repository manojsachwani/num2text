type TextCase = 'titleCase' | 'lowerCase' | 'upperCase';
interface ConvertOptions {
    language?: string;
    separator?: string;
    case?: TextCase;
}
interface ConvertContext {
    separator: string;
}
interface LanguageConverter {
    code: string;
    defaultSeparator: string;
    decimalWord: string;
    negativeWord: string;
    caseLocale?: string;
    convertInteger: (value: string, context: ConvertContext) => string;
}

declare function convert(value: string | number, options?: ConvertOptions): string;

declare function getSupportedLanguages(): string[];

declare class ConversionError extends Error {
    constructor(message: string);
}

declare function registerLanguage(code: string, converter: LanguageConverter): void;

export { ConversionError, type ConvertOptions, type LanguageConverter, type TextCase, convert, getSupportedLanguages, registerLanguage };
