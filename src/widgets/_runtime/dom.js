// Lo mínimo para escribir DOM sin plantillas ni framework.

/**
 * Crea un elemento con atributos e hijos.
 *
 * Los `null`, `undefined`, `false` y `''` se ignoran, para poder escribir
 * `cond && elemento(…)` dentro de la lista de hijos sin romper nada. Los
 * atributos con esos mismos valores tampoco se escriben: `{ id: falso }` no
 * deja un `id="false"` en el HTML.
 */
export function elemento(tag, props = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    el.setAttribute(k, v);
  }
  el.append(...hijos.filter((h) => h !== null && h !== undefined && h !== false && h !== ''));
  return el;
}
