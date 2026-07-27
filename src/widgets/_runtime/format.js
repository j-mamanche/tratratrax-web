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

// El sitio está en inglés — así están escritos los créditos en Bandcamp y
// así se leían en el sitio viejo: `Released__ February 20, 2026`.
const FECHA = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC', // sin esto, un release del día 1 se muestra como del 30 anterior
});

/** `2026-02-20` → `February 20, 2026`. */
export function fechaLarga(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? '' : FECHA.format(d);
}

/**
 * Los créditos en la convención `Rol__ Valor` que el sello ya escribe en
 * Bandcamp.
 *
 * La fecha es la primera línea y tiene la misma forma que las demás
 * —`Released__ February 20, 2026`— porque así estaba en el sitio viejo: no
 * es una frase aparte, es un crédito más. El que la pinta la separa del
 * resto con aire, no con otro formato.
 *
 * El número de catálogo **no** entra: ya se lee en la etiqueta del ítem, y
 * repetirlo aquí era una línea de ruido.
 */
export function lineasCredito(release) {
  const lineas = [];
  // `suelta` le dice al que la pinta que esta línea va separada del resto.
  if (release.date) {
    lineas.push({ rol: 'Released', valor: fechaLarga(release.date), suelta: true });
  }

  for (const c of release.credits ?? []) {
    if (/^cat/i.test(c.role)) continue; // el número de catálogo va en la etiqueta
    lineas.push({ rol: c.role, valor: c.name });
  }
  return lineas;
}

/** Slugs → nombres visibles. Sin guiones: "Nick León", nunca "Nick-León". */
export function nombresArtistas(slugs, indice) {
  return (slugs ?? []).map((s) => indice.get(s) ?? s).join(' & ');
}
