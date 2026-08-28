// De dónde salen los datos y cómo se cargan una sola vez por página.

import { cumpleHome, tieneArteHome } from './format.js';

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
 * El destacado del home, ya resuelto: **un release de `releases.json`**, con su
 * bloque `home` adentro.
 *
 * `home.json` no guarda contenido, guarda la política:
 *
 *   { "modo": "fijo", "release": "killing-mariposas" }   ← siempre ese
 *   { "modo": "auto" }                                   ← uno al azar
 *
 * Es lo que hace que el home cuelgue del catálogo: el título, los artistas y
 * los links salen del release, no de una copia paralela que se desactualiza
 * sola. Lo único que vive en `home.json` es cuál.
 *
 * **Nunca rechaza.** Si el archivo no existe todavía, si la política apunta a
 * un release que se borró o si la red falla, resuelve a `null` y el home cae a
 * su respaldo —el release visible más reciente—. Un home pobre es aceptable;
 * un home roto no.
 */
export function cargarHome() {
  if (promesaHome) return promesaHome;

  promesaHome = resolverHome().catch(() => {
    promesaHome = null; // un fallo de red no envenena la página para siempre
    return null;
  });

  return promesaHome;
}

async function resolverHome() {
  const [politica, { releases }] = await Promise.all([
    // Un 404 no es un fallo: es un sitio que todavía no tiene home.json y que
    // se merece el respaldo, no una excepción.
    fetch(new URL('home.json', BASE)).then((r) => (r.ok ? r.json() : null)),
    cargar(),
  ]);

  return elegirDestacado(politica, releases);
}

/**
 * Qué release manda en el home, según la política.
 *
 * En `fijo` se exige el arte —el propio o la carátula de Bandcamp—: un
 * destacado sin ninguna imagen es media pantalla en negro, y el respaldo se ve
 * mejor. En `auto` se sortea, y si no queda ninguno también cae al respaldo.
 *
 * El sorteo tiene dos formas de acotarse. Si `home.json` trae `azar` con una
 * lista de ids, sortea solo entre esos: es el sello diciendo cuáles quiere ver
 * rotando. Si no la trae —o la trae vacía— entran todos los que cumplen, que es
 * como se comportaba antes de que existiera el campo. Un `home.json` viejo por
 * lo tanto sigue significando exactamente lo mismo.
 *
 * Sin `modo` escrito se deduce del propio archivo: si hay `release`, es fijo.
 */
function elegirDestacado(politica, releases) {
  const modo = politica?.modo ?? (politica?.release ? 'fijo' : 'auto');

  if (modo === 'fijo') {
    const r = releases.find((x) => x.id === politica?.release);
    return tieneArteHome(r) ? r : null;
  }

  const candidatos = enSorteo(politica, releases);
  if (!candidatos.length) return null;
  return candidatos[Math.floor(Math.random() * candidatos.length)];
}

/**
 * Los que entran al sorteo. La lista escrita nunca manda sobre la regla: un id
 * apuntado a mano que después perdió la carátula o se ocultó no puede colarse
 * en la portada solo porque siga escrito.
 */
export function enSorteo(politica, releases) {
  const puede = releases.filter(cumpleHome);
  const marcados = politica?.azar;
  if (!Array.isArray(marcados) || !marcados.length) return puede;
  const marca = new Set(marcados);
  const filtrados = puede.filter((r) => marca.has(r.id));
  // Si la lista quedó apuntando solo a releases que ya no cumplen, se ignora:
  // dejar la portada en el respaldo por una lista desactualizada es peor que
  // sortear entre todos, que es lo que el sello tenía antes.
  return filtrados.length ? filtrados : puede;
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
