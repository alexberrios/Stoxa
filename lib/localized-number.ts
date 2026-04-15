/** Locale por defecto para separadores (miles / decimales) en formularios. */
export const NUMBER_FORMAT_LOCALE = "es-ES";

export function getNumberSeparators(locale: string) {
  const fmt = new Intl.NumberFormat(locale);
  const group =
    fmt.formatToParts(1_000_000).find((p) => p.type === "group")?.value ?? ".";
  const decimal =
    fmt.formatToParts(1.1).find((p) => p.type === "decimal")?.value ?? ",";
  return { group, decimal };
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convierte lo que escribe el usuario a cadena numérica canónica (punto como decimal, sin separadores de miles).
 */
export function normalizeNumberInput(
  raw: string,
  locale: string,
  mode: "integer" | "decimal",
  maxFractionDigits: number,
): string {
  let s = raw.trim();
  if (!s) return "";

  const { group, decimal } = getNumberSeparators(locale);
  const decChar = decimal;
  const groupRe = new RegExp(escapeRegExp(group), "g");
  s = s.replace(groupRe, "");

  if (mode === "integer") {
    const decEscaped = escapeRegExp(decChar);
    const dIdx = s.search(new RegExp(decEscaped));
    if (dIdx >= 0) s = s.slice(0, dIdx);

    if (decChar === ",") {
      const dotDecimal = s.match(/^(\d+)\.(\d{1,2})$/);
      if (dotDecimal) s = dotDecimal[1] ?? "";
      else s = s.replace(/\./g, "");
    } else {
      const commaDecimal = s.match(/^(\d+),(\d{1,2})$/);
      if (commaDecimal) s = commaDecimal[1] ?? "";
      else s = s.replace(/,/g, "");
    }
    return s.replace(/\D/g, "").slice(0, 18);
  }

  // Modo decimal: teclado US (punto) / teclado ES (coma)
  if (decChar === "," && s.includes(".") && !s.includes(",")) {
    s = s.replace(/\./g, ",");
  }
  if (decChar === "." && s.includes(",") && !s.includes(".")) {
    s = s.replace(/,/g, ".");
  }

  const decEscaped = escapeRegExp(decChar);
  const decMatch = s.match(new RegExp(`${decEscaped}`));
  let intRaw: string;
  let fracRaw: string;
  if (!decMatch) {
    intRaw = s;
    fracRaw = "";
  } else {
    const idx = s.lastIndexOf(decChar);
    intRaw = s.slice(0, idx);
    fracRaw = s.slice(idx + decChar.length);
  }

  let intPart = intRaw.replace(/\D/g, "").slice(0, 18);
  let fracPart = fracRaw.replace(/\D/g, "");
  if (maxFractionDigits >= 0) {
    fracPart = fracPart.slice(0, maxFractionDigits);
  }

  if (fracPart.length > 0) {
    if (intPart === "") intPart = "0";
    return `${intPart}.${fracPart}`;
  }
  if (s.includes(decChar)) return intPart === "" ? `0.` : `${intPart}.`;
  return intPart;
}

/** Vista editable al enfocar: sin miles; separador decimal según locale. */
export function canonicalToEditable(
  canonical: string,
  locale: string,
  mode: "integer" | "decimal",
): string {
  if (!canonical || canonical === ".") return "";
  const { decimal } = getNumberSeparators(locale);
  if (mode === "integer") return canonical.replace(/\D/g, "");
  const [int, frac] = canonical.split(".");
  if (frac !== undefined) {
    return frac.length > 0 ? `${int}${decimal}${frac}` : `${int}${decimal}`;
  }
  return int;
}

export function formatNumberBlurred(
  canonical: string,
  locale: string,
  mode: "integer" | "decimal",
  maxFractionDigits: number,
): string {
  if (canonical === "" || canonical === ".") return "";
  const n = Number(canonical);
  if (!Number.isFinite(n)) return canonical;
  if (mode === "integer") {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(Math.trunc(n));
  }
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(n);
}

/** Redondea la cadena canónica a `maxFractionDigits` decimales. */
export function roundCanonicalDecimal(
  canonical: string,
  maxFractionDigits: number,
): string {
  if (canonical === "" || canonical === ".") return canonical;
  const n = Number(canonical);
  if (!Number.isFinite(n)) return canonical;
  if (maxFractionDigits <= 0) return String(Math.trunc(n));
  const rounded =
    Math.round(n * 10 ** maxFractionDigits) / 10 ** maxFractionDigits;
  return String(rounded);
}
