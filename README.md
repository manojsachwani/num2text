# num2txt

`num2txt` is a standalone TypeScript-first number-to-text package with a small API and built-in multi-language support.

It is based on the ideas from the legacy `number-to-text` project:
https://github.com/Maheshkumar-Kakade/number-to-text

## Features

- Explicit API: `convert`, `registerLanguage`, `getSupportedLanguages`
- Built-in languages: `en-us`, `en-in`, `de`, `tr`, `id`, `fr`
- Supports integers, negatives, and decimals
- Dual output: ESM + CommonJS
- Jest test suite

## Installation

```bash
npm install @indefiniteloop/num2txt
```

## Quick Start

### ESM

```ts
import { convert } from "num2txt";

convert(123456);
// One Hundred And Twenty Three Thousand, Four Hundred And Fifty Six

convert("-12.50");
// Minus Twelve, Point Fifty
```

### CommonJS

```js
const { convert } = require("num2txt");

convert(1000000, { language: "en-in" });
// Ten Lakh
```

## API

### `convert(value, options?)`

- `value`: `string | number`
- `options.language?`: language code (default: `en-us`)
- `options.separator?`: separator between magnitude groups
- `options.case?`: `titleCase | lowerCase | upperCase`

Example:

```ts
convert("3.14", { language: "fr", case: "upperCase" });
// TROIS VIRGULE QUATORZE
```

### `getSupportedLanguages()`

Returns all registered language codes (built-in + custom).

### `registerLanguage(code, converter)`

Registers a custom language converter. Throws if the code is already registered.

## Adding a Language

Provide a `LanguageConverter` object with:

- `code`
- `defaultSeparator`
- `decimalWord`
- `negativeWord`
- `convertInteger(value, context): string`

```ts
import { registerLanguage, convert, type LanguageConverter } from "num2txt";

const pirate: LanguageConverter = {
  code: "pirate",
  defaultSeparator: "",
  decimalWord: "point",
  negativeWord: "minus",
  convertInteger: (value) => (value === "0" ? "zero" : `num-${value}`),
};

registerLanguage("pirate", pirate);
convert(42, { language: "pirate" });
// num-42
```

You can inspect available codes at runtime:

```ts
import { getSupportedLanguages } from "num2txt";

getSupportedLanguages();
// ['de', 'en-in', 'en-us', 'fr', 'id', 'tr', ...]
```

## Project Positioning

`num2txt` should be treated as a new module and codebase.

- New package identity (`num2txt`)
- Modern TypeScript architecture
- Explicit runtime API (no side-effect language loading)
- Jest-based testing and modern build pipeline

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Migration from legacy `number-to-text`

This package is intentionally breaking versus the legacy package:

- Package name changed to `num2txt`
- Side-effect converter loading (`require('.../converters/en-us')`) was removed
- Use direct named exports from package root
- Tooling moved to TypeScript + Jest + modern build pipeline

## License

MIT
