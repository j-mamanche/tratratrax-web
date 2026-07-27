// De dónde salen los datos y cómo se cargan una sola vez por página.

/**
 * Base de los datos: la carpeta donde vive este mismo bundle.
 * Cargo solo pega `<script src=".../ttx.js">`, así que el widget deduce el
 * resto de su propia URL y nadie tiene que configurar nada allá.
 *
 * Se puede forzar con `data-ttx-datos` en la etiqueta del script, que es lo
 * que usa la página de preview para leer los JSON locales.
 */
export function baseDatos() {
  const s =
    document.currentScript ??
    document.querySelector('script[src*="ttx.js"], script[data-ttx-datos]');

  const forzada = s?.dataset?.ttxDatos;
  if (forzada) return new URL(forzada, location.href).href.replace(/\/?$/, '/');

  const base = s?.src ? new URL('.', s.src) : new URL('.', location.href);
  return new URL('data/', base).href;
}

// `document.currentScript` solo existe mientras el script se evalúa, así que
// se resuelve al cargar el módulo, no dentro de cargar().
const BASE = baseDatos();

let promesa = null;

/**
 * Un solo fetch por página aunque haya varios widgets: todos comparten
 * la misma promesa.
 */
export function cargar() {
  if (promesa) return promesa;

  promesa = Promise.all([
    fetch(new URL('releases.json', BASE)).then(exigirOk),
    fetch(new URL('artists.json', BASE)).then(exigirOk),
  ]).then(([releases, artists]) => ({
    releases,
    artists,
    // slug → display, que es la única forma en que el catálogo usa artistas.
    indiceArtistas: new Map(artists.map((a) => [a.slug, a.display])),
  }));

  // Un fallo de red no puede dejar la página envenenada para siempre.
  promesa.catch(() => {
    promesa = null;
  });

  return promesa;
}

function exigirOk(r) {
  if (!r.ok) throw new Error(`${r.status} al pedir ${r.url}`);
  return r.json();
}
