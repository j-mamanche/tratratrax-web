// Serialización de los datos a las formas que el sello ya usa.
// Nada de esto toca el DOM: son funciones puras, fáciles de probar.

/**
 * URL de carátula en Bandcamp. Guardamos el id (`a1974794830`), no la URL,
 * porque el sufijo decide el tamaño. Los que usamos:
 *   _7  → 150px   (nada, por ahora)
 *   _16 → 700px   (el visor, que va difuminado: no necesita más)
 *   _10 → 1200px  (la carátula del carril)
 */
export function cover(bcImageId, tam = 10) {
  return `https://f4.bcbits.com/img/${bcImageId}_${tam}.jpg`;
}

/** `TRA031` → `TRA 031`. Si no hay número, no inventamos uno. */
export function numeroCatalogo(catalog) {
  if (!catalog) return '';
  const m = /^([A-Z]+)\s*(\d+)$/.exec(catalog.trim());
  return m ? `${m[1]} ${m[2]}` : catalog.trim();
}

const FECHA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC', // sin esto, un release del día 1 se muestra como del 30 anterior
});

/** `2026-04-30` → `30 de abril de 2026`. */
export function fechaLarga(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? '' : FECHA.format(d);
}

/**
 * Los créditos en la convención `Rol__ Valor` que el sello ya escribe en
 * Bandcamp. El número de catálogo vive en su propio campo del JSON, así que
 * lo anteponemos aquí — y descartamos el crédito duplicado si el importador
 * lo trajo también como rol.
 */
export function lineasCredito(release) {
  const lineas = [];
  if (release.catalog) lineas.push({ rol: 'Catalog', valor: release.catalog });

  for (const c of release.credits ?? []) {
    if (/^cat/i.test(c.role)) continue; // ya lo pusimos arriba
    lineas.push({ rol: c.role, valor: c.name });
  }
  return lineas;
}

/** Slugs → nombres visibles. Sin guiones: "Nick León", nunca "Nick-León". */
export function nombresArtistas(slugs, indice) {
  return (slugs ?? []).map((s) => indice.get(s) ?? s).join(' & ');
}
