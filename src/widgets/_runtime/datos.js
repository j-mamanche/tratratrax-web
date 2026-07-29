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

/**
 * La raíz del sitio publicado — de ahí cuelgan `data/` y `media/`.
 *
 * Los archivos de `data/*.json` guardan rutas relativas a esa raíz
 * (`media/tra032.mp4`), no a la carpeta de datos: son rutas del sitio, no de
 * un JSON en particular, y así siguen sirviendo si algún día un dato se muda
 * de archivo. Una URL absoluta se respeta tal cual.
 */
export function urlMedia(ruta) {
  if (!ruta) return '';
  return /^(?:https?:)?\/\//i.test(ruta) ? ruta : new URL(ruta, new URL('..', BASE)).href;
}

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

let promesaHome = null;

/**
 * `home.json` va aparte de `cargar()`: es el único que lo usa y el catálogo no
 * tiene por qué pedirlo.
 *
 * **Nunca rechaza.** Si el archivo no existe todavía o la red falla, resuelve
 * a `null` y el home cae a su respaldo. Un home pobre es aceptable; un home
 * roto no.
 */
export function cargarHome() {
  if (promesaHome) return promesaHome;

  promesaHome = fetch(new URL('home.json', BASE))
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => {
      promesaHome = null; // un fallo de red no envenena la página para siempre
      return null;
    });

  return promesaHome;
}

let promesaAbout = null;

/**
 * `about.json`: el lema y los tres DJs con su emblema y su Instagram.
 *
 * **Sí rechaza**, al contrario que `cargarHome()`. El home tiene de dónde
 * caerse —el release más reciente— y el About no: el único texto de la página
 * y los tres disparadores salen de este archivo. Sin él no hay una versión
 * pobre que valga, así que se deja fallar y el loader pinta su mensaje. Callar
 * antes que pintar una página negra que parece terminada.
 */
export function cargarAbout() {
  if (promesaAbout) return promesaAbout;

  promesaAbout = fetch(new URL('about.json', BASE)).then(exigirOk);

  // Un fallo de red no puede dejar la página envenenada para siempre.
  promesaAbout.catch(() => {
    promesaAbout = null;
  });

  return promesaAbout;
}

function exigirOk(r) {
  if (!r.ok) throw new Error(`${r.status} al pedir ${r.url}`);
  return r.json();
}
