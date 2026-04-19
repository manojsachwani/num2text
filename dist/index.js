// src/core/errors.ts
var ConversionError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ConversionError";
  }
};

// src/core/registry.ts
var registry = /* @__PURE__ */ new Map();
function registerLanguage(code, converter) {
  const normalizedCode = code.toLowerCase();
  if (registry.has(normalizedCode)) {
    throw new ConversionError(`language "${normalizedCode}" is already registered`);
  }
  registry.set(normalizedCode, converter);
}
function hasLanguage(code) {
  return registry.has(code.toLowerCase());
}
function getLanguage(code) {
  const normalizedCode = code.toLowerCase();
  const converter = registry.get(normalizedCode);
  if (!converter) {
    throw new ConversionError(`converter for language "${normalizedCode}" not found`);
  }
  return converter;
}
function getSupportedLanguages() {
  return [...registry.keys()].sort();
}

// src/core/utils.ts
var NUMERIC_INPUT_RE = /^-?\d+(?:[.,]\d+)?$/;
function normalizeInput(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ConversionError("input must be a finite number");
    }
    value = value.toString();
  }
  const trimmed = value.trim();
  if (!NUMERIC_INPUT_RE.test(trimmed)) {
    throw new ConversionError("input must be a numeric string or number");
  }
  const isNegative = trimmed.startsWith("-");
  const unsigned = isNegative ? trimmed.slice(1) : trimmed;
  const [rawIntegerPart, rawFractionalPart] = unsigned.split(/[.,]/);
  const integerPart = stripLeadingZeros(rawIntegerPart) || "0";
  const fractionalPart = rawFractionalPart ? rawFractionalPart.replace(/^0+/, "") || "0" : void 0;
  const isZero = integerPart === "0" && (!fractionalPart || /^0+$/.test(fractionalPart));
  return {
    isNegative,
    integerPart,
    fractionalPart,
    isZero
  };
}
function splitEvery3(value) {
  return value.match(/\d{1,3}(?=(\d{3})*$)/g) ?? ["0"];
}
function applyTextCase(value, textCase = "titleCase", locale) {
  if (textCase === "lowerCase") {
    return locale ? value.toLocaleLowerCase(locale) : value.toLowerCase();
  }
  if (textCase === "upperCase") {
    return locale ? value.toLocaleUpperCase(locale) : value.toUpperCase();
  }
  return value;
}
function stripLeadingZeros(value) {
  return value.replace(/^0+/, "");
}

// src/core/convert.ts
function convert(value, options = {}) {
  const languageCode = (options.language ?? "en-us").toLowerCase();
  const converter = getLanguage(languageCode);
  const normalized = normalizeInput(value);
  if (normalized.isZero) {
    return applyTextCase(converter.convertInteger("0", { separator: "" }), options.case, converter.caseLocale);
  }
  const separator = options.separator ?? converter.defaultSeparator;
  const integerText = converter.convertInteger(normalized.integerPart, { separator });
  let output = integerText;
  if (normalized.fractionalPart !== void 0) {
    const fractionalText = converter.convertInteger(normalized.fractionalPart, { separator });
    output = `${integerText} ${converter.decimalWord} ${fractionalText}`;
  }
  if (normalized.isNegative) {
    output = `${converter.negativeWord} ${output}`;
  }
  const result = applyTextCase(output, options.case, converter.caseLocale);
  if (!result.trim()) {
    throw new ConversionError("conversion produced an empty result");
  }
  return result;
}

// src/languages/de.ts
var thousands = ["", "tausend", "Million", "Milliarde", "Billion", "Billiarde", "Trillion"];
var thousandsPlural = ["", "tausend", "Millionen", "Milliarden", "Billionen", "Billiarden", "Trillionen"];
var ones = [
  "",
  "ein",
  "zwei",
  "drei",
  "vier",
  "f\xFCnf",
  "sechs",
  "sieben",
  "acht",
  "neun",
  "zehn",
  "elf",
  "zw\xF6lf",
  "dreizehn",
  "vierzehn",
  "f\xFCnfzehn",
  "sechzehn",
  "siebzehn",
  "achtzehn",
  "neunzehn"
];
var tens = ["", "", "zwanzig", "drei\xDFig", "vierzig", "f\xFCnfzig", "sechzig", "siebzig", "achtzig", "neunzig"];
var deConverter = {
  code: "de",
  defaultSeparator: "",
  decimalWord: "Komma",
  negativeWord: "minus",
  convertInteger(value) {
    if (value === "0") return "null";
    const chunks = splitEvery3(value);
    const output = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const groupIndex = chunks.length - 1 - i;
      const chunkWord = convertChunk(chunk);
      if (!chunkWord) continue;
      if (thousands[groupIndex]) {
        if (groupIndex === 1) {
          output.push((chunkWord === "eins" ? "ein" : chunkWord) + thousands[groupIndex]);
          continue;
        }
        if (chunkWord === "eins") {
          output.push("eine", thousands[groupIndex]);
        } else {
          output.push(chunkWord, thousandsPlural[groupIndex]);
        }
        continue;
      }
      output.push(chunkWord);
    }
    return output.join(" ").replace(/\s+/g, " ").trim();
  }
};
function convertChunk(chunk) {
  const padded = chunk.padStart(3, "0");
  const h = Number(padded[0]);
  const t = Number(padded[1]);
  const u = Number(padded[2]);
  let word = "";
  if (h > 0) {
    word += `${ones[h]}hundert`;
  }
  if (t === 1) {
    word += ones[t * 10 + u];
    if (word.endsWith("ein")) word += "s";
    return word;
  }
  if (u > 0) {
    word += ones[u];
  }
  if (t > 1) {
    if (u > 0) word += "und";
    word += tens[t];
  }
  if (word.endsWith("ein")) word += "s";
  return word;
}

// src/languages/en-in.ts
var groups = ["", "Thousand", "Lakh", "Crore"];
var ones2 = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen"
];
var tens2 = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
var enInConverter = {
  code: "en-in",
  defaultSeparator: ",",
  decimalWord: "Point",
  negativeWord: "Minus",
  convertInteger(value, context) {
    if (value === "0") return "Zero";
    const parts = value.match(/.{1,}(?=(..){2}(...)$)|.{1,2}(?=(..){0,1}(...)$)|.{1,3}$/g) ?? [value];
    const output = [];
    for (let i = 0; i < parts.length; i += 1) {
      const chunk = parts[i];
      const groupIndex = parts.length - 1 - i;
      const words = chunkToWords(chunk);
      if (!words.length) continue;
      output.push(words.join(" "));
      if (groups[groupIndex]) output.push(groups[groupIndex]);
    }
    if (context.separator === "") {
      return output.join(" ").replace(/\s+/g, " ").trim();
    }
    return output.join(" ").replace(/\s+(Thousand|Lakh|Crore)\s+/g, ` $1${context.separator} `).replace(/\s+/g, " ").trim();
  }
};
function chunkToWords(chunk) {
  const padded = chunk.padStart(3, "0");
  const h = Number(padded[0]);
  const t = Number(padded[1]);
  const u = Number(padded[2]);
  const out = [];
  if (h > 0) {
    out.push(ones2[h], "Hundred");
  }
  if (t === 1) {
    out.push(ones2[t * 10 + u]);
    return out;
  }
  if (t > 1) out.push(tens2[t]);
  if (u > 0) out.push(ones2[u]);
  return out;
}

// src/languages/common.ts
function convertWesternInteger(value, context, config) {
  if (value === "0") return config.zero;
  const chunks = splitEvery3(value);
  const words = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const groupIndex = chunks.length - 1 - i;
    const chunkWords = convertChunk2(chunk, config.ones, config.tens, config.hundredWord, config.andWord);
    if (!chunkWords.length) continue;
    if (config.skipOneBeforeGroupIndex === groupIndex && chunkWords.length === 1 && chunkWords[0] === config.ones[1]) {
      words.push(config.groups[groupIndex]);
      continue;
    }
    words.push(chunkWords.join(" "));
    if (config.groups[groupIndex]) {
      words.push(config.groups[groupIndex]);
    }
  }
  let output = words.join(" ");
  if (config.oneForSpecialHundred) {
    for (const rule of config.oneForSpecialHundred) {
      output = output.replace(new RegExp(rule.match, "g"), rule.replacement);
    }
  }
  return normalizeSeparator(output, context.separator);
}
function convertChunk2(value, ones6, tens7, hundredWord, andWord) {
  const padded = value.padStart(3, "0");
  const h = Number(padded[0]);
  const t = Number(padded[1]);
  const u = Number(padded[2]);
  const result = [];
  if (h > 0) {
    if (ones6[h]) result.push(ones6[h]);
    result.push(hundredWord);
    if (andWord && (t > 0 || u > 0)) {
      result.push(andWord);
    }
  }
  if (t === 1) {
    result.push(ones6[t * 10 + u]);
    return result;
  }
  if (t > 1 && tens7[t]) {
    result.push(tens7[t]);
  }
  if (u > 0 && ones6[u]) {
    result.push(ones6[u]);
  }
  return result;
}
function normalizeSeparator(input, separator) {
  if (separator === "") {
    return input.replace(/,/g, "").replace(/\s+/g, " ").trim();
  }
  return input.replace(/\s+(Thousand|Million|Billion|Trillion|Quadrillion|Quintillion|Lakh|Crore)$/g, " $1").replace(/\s+(Thousand|Million|Billion|Trillion|Quadrillion|Quintillion|Lakh|Crore)\s+/g, ` $1${separator} `).replace(/\s+/g, " ").trim();
}

// src/languages/en-us.ts
var thousands2 = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion"];
var ones3 = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen"
];
var tens3 = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
var enUsConverter = {
  code: "en-us",
  defaultSeparator: ",",
  decimalWord: "Point",
  negativeWord: "Minus",
  convertInteger(value, context) {
    return convertWesternInteger(value, context, {
      groups: thousands2,
      ones: ones3,
      tens: tens3,
      zero: "Zero",
      hundredWord: "Hundred",
      andWord: "And"
    });
  }
};

// src/languages/fr.ts
var scale = ["", "Mille", "Million", "Milliard", "Billion", "Billiard", "Trillion"];
var units = [
  "",
  "Un",
  "Deux",
  "Trois",
  "Quatre",
  "Cinq",
  "Six",
  "Sept",
  "Huit",
  "Neuf",
  "Dix",
  "Onze",
  "Douze",
  "Treize",
  "Quatorze",
  "Quinze",
  "Seize",
  "Dix Sept",
  "Dix Huit",
  "Dix Neuf"
];
var tens4 = ["", "", "Vingt", "Trente", "Quarante", "Cinquante", "Soixante", "Soixante Dix", "Quatre Vingt", "Quatre Vingt Dix"];
var frConverter = {
  code: "fr",
  defaultSeparator: "",
  decimalWord: "Virgule",
  negativeWord: "Moins",
  convertInteger(value, context) {
    if (value === "0") return "Z\xE9ro";
    const chunks = splitEvery3(value);
    const words = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const groupIndex = chunks.length - 1 - i;
      const chunkText = chunkToWords2(chunk);
      if (!chunkText) continue;
      const label = scale[groupIndex];
      if (label === "Mille" && chunkText === "Un") {
        words.push("Mille");
      } else if (label === "Billion" && chunkText === "Un") {
        words.push("Mille Milliards");
      } else if (label) {
        const plural = chunkText !== "Un" && label !== "Mille" ? "s" : "";
        words.push(`${chunkText} ${label}${plural}`);
      } else {
        words.push(chunkText);
      }
    }
    const result = words.join(context.separator ? `${context.separator} ` : " ");
    return result.replace(/\s+/g, " ").trim();
  }
};
function chunkToWords2(chunk) {
  const [h, t, u] = chunk.padStart(3, "0").split("").map(Number);
  const out = [];
  const lastTwo = t * 10 + u;
  if (h > 0) {
    if (h > 1) out.push(units[h]);
    out.push("Cent");
  }
  if (lastTwo < 20) {
    if (units[lastTwo]) out.push(units[lastTwo]);
    return out.join(" ");
  }
  if (t === 7 || t === 9) {
    out.push(tens4[t - 1]);
    if (units[10 + u]) out.push(units[10 + u]);
    return out.join(" ");
  }
  if (tens4[t]) out.push(tens4[t]);
  if (u === 1 && t !== 8) out.push("Un");
  else if (units[u]) out.push(units[u]);
  return out.join(" ");
}

// src/languages/id.ts
var thousands3 = ["", "Ribu", "Juta", "Milyar", "Triliun"];
var ones4 = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
  "Dua Belas",
  "Tiga Belas",
  "Empat Belas",
  "Lima Belas",
  "Enam Belas",
  "Tujuh Belas",
  "Delapan Belas",
  "Sembilan Belas"
];
var tens5 = ["", "", "Dua Puluh", "Tiga Puluh", "Empat Puluh", "Lima Puluh", "Enam Puluh", "Tujuh Puluh", "Delapan Puluh", "Sembilan Puluh"];
var idConverter = {
  code: "id",
  defaultSeparator: "",
  decimalWord: "Koma",
  negativeWord: "Minus",
  convertInteger(value) {
    if (value === "0") return "Nol";
    const chunks = splitEvery3(value);
    const output = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const groupIndex = chunks.length - 1 - i;
      const words = chunkToWords3(chunk);
      if (!words.length) continue;
      output.push(words.join(" "));
      if (thousands3[groupIndex]) output.push(thousands3[groupIndex]);
    }
    return output.join(" ").replace(/Satu Ratus/g, "Seratus").replace(/Satu Ribu/g, "Seribu").replace(/\s+/g, " ").trim();
  }
};
function chunkToWords3(chunk) {
  const padded = chunk.padStart(3, "0");
  const h = Number(padded[0]);
  const t = Number(padded[1]);
  const u = Number(padded[2]);
  const out = [];
  if (h > 0) {
    out.push(ones4[h], "Ratus");
  }
  if (t === 1) {
    out.push(ones4[t * 10 + u]);
    return out;
  }
  if (t > 1) out.push(tens5[t]);
  if (u > 0) out.push(ones4[u]);
  return out;
}

// src/languages/tr.ts
var thousands4 = ["", "Bin", "Milyon", "Milyar", "Trilyon", "Katrilyon", "Kentilyon"];
var ones5 = [
  "",
  "Bir",
  "\u0130ki",
  "\xDC\xE7",
  "D\xF6rt",
  "Be\u015F",
  "Alt\u0131",
  "Yedi",
  "Sekiz",
  "Dokuz",
  "On",
  "On Bir",
  "On \u0130ki",
  "On \xDC\xE7",
  "On D\xF6rt",
  "On Be\u015F",
  "On Alt\u0131",
  "On Yedi",
  "On Sekiz",
  "On Dokuz"
];
var tens6 = ["", "", "Yirmi", "Otuz", "K\u0131rk", "Elli", "Altm\u0131\u015F", "Yetmi\u015F", "Seksen", "Doksan"];
var trConverter = {
  code: "tr",
  defaultSeparator: ",",
  decimalWord: "Virg\xFCl",
  negativeWord: "Eksi",
  caseLocale: "tr",
  convertInteger(value, context) {
    if (value === "0") return "S\u0131f\u0131r";
    const chunks = splitEvery3(value);
    const result = [];
    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const groupIndex = chunks.length - 1 - i;
      const words = chunkToWords4(chunk, groupIndex);
      if (!words.length && groupIndex !== 1) continue;
      if (words.length) {
        result.push(words.join(" "));
      }
      if (thousands4[groupIndex]) result.push(thousands4[groupIndex]);
    }
    if (context.separator === "") {
      return result.join(" ").replace(/\s+/g, " ").trim();
    }
    return result.join(" ").replace(/\s+(Bin|Milyon|Milyar|Trilyon|Katrilyon|Kentilyon)\s+/g, ` $1${context.separator} `).replace(/\s+/g, " ").trim();
  }
};
function chunkToWords4(chunk, groupIndex) {
  const padded = chunk.padStart(3, "0");
  const h = Number(padded[0]);
  const t = Number(padded[1]);
  const u = Number(padded[2]);
  const out = [];
  if (h > 0) {
    if (h > 1) out.push(ones5[h]);
    out.push("Y\xFCz");
  }
  if (t === 1) {
    out.push(ones5[t * 10 + u]);
    return out;
  }
  if (t > 1) out.push(tens6[t]);
  if (u > 0) {
    if (!(groupIndex === 1 && u === 1 && h === 0 && t === 0)) {
      out.push(ones5[u]);
    }
  }
  return out;
}

// src/index.ts
var builtIns = [enUsConverter, enInConverter, deConverter, trConverter, idConverter, frConverter];
for (const converter of builtIns) {
  if (!hasLanguage(converter.code)) {
    registerLanguage(converter.code, converter);
  }
}
function registerLanguage2(code, converter) {
  registerLanguage(code, converter);
}
export {
  ConversionError,
  convert,
  getSupportedLanguages,
  registerLanguage2 as registerLanguage
};
