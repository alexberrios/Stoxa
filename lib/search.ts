/**
 * Prepara un término para usarse dentro de un filtro `ilike` en PostgREST.
 *
 * - Escapa los comodines SQL `%` y `_` para que se traten como literales.
 * - Elimina retornos de carro y saltos de línea que podrían confundir al parser.
 *
 * El resultado se debe embutir entre `%...%` al construir el patrón.
 */
export function escapeIlikeValue(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

/**
 * Envuelve un valor en comillas dobles si contiene caracteres que rompen la
 * sintaxis del operador `or=(...)` de PostgREST (comas, paréntesis o comillas).
 * Dentro de las comillas dobles se escapa `\` y `"`.
 */
export function quoteOrValue(value: string): string {
  const needsQuotes = /[,()"\s]/.test(value);
  if (!needsQuotes) return value;
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Construye un patrón seguro para `name.ilike.%q%,sku.ilike.%q%` escapando
 * comodines SQL y envolviendo con comillas si hiciera falta.
 */
export function buildIlikeOrPattern(
  q: string,
  columns: readonly string[],
): string {
  const safe = escapeIlikeValue(q);
  const pattern = quoteOrValue(`%${safe}%`);
  return columns.map((c) => `${c}.ilike.${pattern}`).join(",");
}
