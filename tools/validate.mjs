#!/usr/bin/env node
/**
 * Valida data/*.json antes de construir.
 *
 * ERROR   = rompe el render o produce un link muerto. Detiene el build.
 * AVISO   = probable problema de contenido. No detiene nada, pero alguien
 *           debería mirarlo.
 *
 * Correr:  npm run validate
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// La regla de qué release puede salir sorteado en el home vive con el widget
// que la usa (`format.js`), no copiada aquí: si se escriben dos veces, un día
// el validador aprueba un home que el sitio no va a poder pintar.
import { cumpleHome } from '../src/widgets/_runtime/format.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

function load(name) {
  const path = join(root, 'data', name);
  if (!existsSync(path)) {
    err(name, 'no existe');
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    err(name, `JSON inválido — ${e.message}`);
    return null;
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const BC_IMAGE = /^a\d+$/;

const isRealDate = (s) => {
  if (!ISO_DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

const isHttpUrl = (s) => {
  try {
    return ['http:', 'https:'].includes(new URL(s).protocol);
  } catch {
    return false;
  }
};

/** Ruta a un archivo del sitio (`media/…`), o una URL absoluta. */
function revisarMedia(at, campo, ruta) {
  if (!ruta) return;
  if (isHttpUrl(ruta)) return;
  if (ruta.startsWith('/')) {
    err(at, `${campo} "${ruta}" es absoluta — se espera una ruta del repo, como "media/tra032.mp4"`);
    return;
  }
  if (!existsSync(join(root, ruta))) {
    err(at, `${campo} apunta a "${ruta}", que no existe en el repo`);
  }
}

// ─── artists.json ────────────────────────────────────────────────────────────

const artists = load('artists.json') ?? [];
const artistSlugs = new Set();

for (const [i, a] of artists.entries()) {
  const at = `artists[${i}]`;
  if (!a.slug) err(at, 'falta `slug`');
  else if (!SLUG.test(a.slug)) err(at, `slug "${a.slug}" debe ser minúsculas y guiones`);
  else if (artistSlugs.has(a.slug)) err(at, `slug duplicado "${a.slug}"`);
  else artistSlugs.add(a.slug);

  if (!a.display) err(at, `falta \`display\` para "${a.slug}"`);
}

// ─── releases.json ───────────────────────────────────────────────────────────

const releases = load('releases.json') ?? [];
const ids = new Set();
const catalogs = new Map();
const usedArtists = new Set();
const today = new Date().toISOString().slice(0, 10);

for (const [i, r] of releases.entries()) {
  const at = `releases[${i}] "${r.album ?? '¿?'}"`;

  if (!r.id) err(at, 'falta `id`');
  else if (!SLUG.test(r.id)) err(at, `id "${r.id}" debe ser minúsculas y guiones`);
  else if (ids.has(r.id)) err(at, `id duplicado "${r.id}"`);
  else ids.add(r.id);

  if (!r.album) err(at, 'falta `album`');

  // catalog vacío es válido: las compilaciones no llevan número.
  if (r.catalog) {
    if (catalogs.has(r.catalog)) {
      warn(at, `número de catálogo "${r.catalog}" repetido — también lo usa "${catalogs.get(r.catalog)}". ¿Es a propósito?`);
    } else {
      catalogs.set(r.catalog, r.album);
    }
  }

  if (!Array.isArray(r.artists) || r.artists.length === 0) {
    err(at, 'necesita al menos un artista');
  } else {
    for (const slug of r.artists) {
      if (!artistSlugs.has(slug)) err(at, `artista "${slug}" no existe en artists.json`);
      usedArtists.add(slug);
    }
  }

  if (!isRealDate(r.date)) err(at, `fecha inválida "${r.date}" — se espera AAAA-MM-DD`);
  // Una fecha futura en algo que ya está publicado casi siempre es un dedazo.
  // En un anuncio —`visible: false`— es justo lo que se está diciendo.
  else if (r.date > today && r.visible !== false) warn(at, `fecha en el futuro (${r.date})`);

  // La carátula de Bandcamp es obligatoria para lo que se ve en el catálogo.
  // Un lanzamiento por anunciar —`visible: false`, con su bloque `home`— puede
  // no estar todavía en Bandcamp: ahí lo que se ve es `home.arte`, y el día
  // que se haga visible este mismo error lo reclama.
  if (r.bcImageId || r.visible !== false) {
    if (!BC_IMAGE.test(r.bcImageId ?? '')) {
      err(at, `bcImageId inválido "${r.bcImageId}" — se espera algo como a750972864`);
    }
  } else if (!r.home?.arte) {
    err(at, 'sin `bcImageId` y sin `home.arte` — no hay ninguna imagen que mostrar');
  }

  if (!r.purchaseUrl) warn(at, 'sin `purchaseUrl` (link de compra en Bandcamp)');
  else if (!isHttpUrl(r.purchaseUrl)) err(at, `purchaseUrl no es una URL válida: "${r.purchaseUrl}"`);

  if (!r.listenUrl) warn(at, 'sin `listenUrl` (linktree para escuchar)');
  else if (!isHttpUrl(r.listenUrl)) err(at, `listenUrl no es una URL válida: "${r.listenUrl}"`);

  // Un crédito es una junta `Rol__ Valor` o una línea suelta (`texto`), que
  // es como cierra el bloque: «All NRG programmed by…», la nota con asterisco.
  for (const [j, c] of (r.credits ?? []).entries()) {
    if (c?.role && c?.name) continue;
    if (typeof c?.texto === 'string' && c.texto.trim()) continue;
    err(`${at} credits[${j}]`, 'o `role` y `name`, o una línea suelta en `texto`');
  }

  // El material del home vive con su release. Es opcional en dos sentidos: casi
  // ningún release sale en el home, y el que sale ya tiene imagen —la carátula
  // de Bandcamp—. `arte` está para reemplazarla, no para habilitar la portada.
  if (r.home) {
    revisarMedia(`${at} home`, '`arte`', r.home.arte);

    if (r.home.video) {
      if (!r.home.video.mp4) err(`${at} home`, 'hay `video` pero sin `mp4`');
      revisarMedia(`${at} home`, '`video.mp4`', r.home.video.mp4);
      revisarMedia(`${at} home`, '`video.poster`', r.home.video.poster);
      if (!r.home.video.poster) {
        warn(`${at} home`, 'sin `video.poster` — es lo que se ve con prefers-reduced-motion');
      }
    }

    if (r.home.relleno) warn(`${at} home`, 'marcado como `relleno`: el material del home es de prueba');
  }

  if (typeof r.order !== 'number') err(at, 'falta `order` (número)');
  if (typeof r.visible !== 'boolean') err(at, 'falta `visible` (true/false)');
}

// El orden manual debería ir de más nuevo a más viejo. Si no, casi siempre
// significa que una fecha está mal escrita.
const sorted = [...releases].filter((r) => isRealDate(r.date)).sort((a, b) => a.order - b.order);
for (let i = 1; i < sorted.length; i++) {
  if (sorted[i].date > sorted[i - 1].date) {
    warn(
      `releases "${sorted[i].album}"`,
      `está después de "${sorted[i - 1].album}" en el orden, pero su fecha es más nueva (${sorted[i].date} > ${sorted[i - 1].date}). ¿Fecha equivocada?`
    );
  }
}

for (const a of artists) {
  if (!usedArtists.has(a.slug)) warn(`artists "${a.display}"`, 'aparece en el filtro pero no tiene ningún release');
}

// ─── home.json ───────────────────────────────────────────────────────────────
//
// `home.json` ya no guarda contenido: guarda **la política**. El destacado es
// un release del catálogo y su material vive en el bloque `home` de ese
// release, que es lo que se validó arriba.
//
//   { "modo": "fijo", "release": "killing-mariposas" }
//   { "modo": "auto" }
//
// Los dos modos tienen respaldo —el release visible más reciente—, así que
// aquí casi nada es error: lo que se persigue es el silencio. Un `fijo` que
// apunta a un release borrado no rompe el home, pero deja al sello creyendo
// que publicó algo que nadie está viendo.

const MODOS = ['fijo', 'auto'];

if (existsSync(join(root, 'data', 'home.json'))) {
  const home = load('home.json') ?? {};
  const modo = home.modo ?? (home.release ? 'fijo' : 'auto');

  if (home.destacado) {
    err(
      'home.json',
      'todavía tiene `destacado` — el material del home se mudó al bloque `home` del release, y aquí solo va `modo` + `release`',
    );
  }

  if (!MODOS.includes(modo)) {
    err('home.json', `modo "${home.modo}" desconocido — se espera ${MODOS.join(' | ')}`);
  } else if (modo === 'fijo') {
    const r = releases.find((x) => x.id === home.release);
    if (!home.release) {
      err('home.json', 'modo `fijo` sin `release` — falta decir cuál');
    } else if (!r) {
      err('home.json', `\`release\` "${home.release}" no existe en releases.json`);
    } else if (!r.home?.arte && !r.bcImageId) {
      err(`home.json "${r.album}"`, 'el destacado no tiene ninguna imagen —ni `home.arte` ni carátula de Bandcamp— y el home caería al respaldo');
    } else if (!r.home?.video?.mp4) {
      warn(`home.json "${r.album}"`, 'sin `home.video` — el home se queda quieto, sin cenefa ni intercambio');
    }
  } else {
    const candidatos = releases.filter(cumpleHome);
    if (!candidatos.length) {
      warn(
        'home.json',
        'modo `auto` y ningún release cumple (arte, texto y visible) — el home usa el respaldo automático',
      );
    }
  }

  // `azar` acota el sorteo a una lista escrita a mano. Un id que ya no existe
  // es un error —quedó apuntando al vacío—; uno que existe pero no cumple es un
  // aviso, porque el sitio lo salta sin romperse.
  if (home.azar != null) {
    if (!Array.isArray(home.azar)) {
      err('home.json', '`azar` tiene que ser una lista de ids');
    } else {
      for (const id of home.azar) {
        const r = releases.find((x) => x.id === id);
        if (!r) err('home.json', `\`azar\` nombra "${id}", que no existe en releases.json`);
        else if (!cumpleHome(r)) warn('home.json', `"${r.album}" está en \`azar\` pero no cumple — el sorteo lo salta`);
      }
    }
  }
}

// ─── blog.json ───────────────────────────────────────────────────────────────

if (existsSync(join(root, 'data', 'blog.json'))) {
  const blog = load('blog.json') ?? {};
  const idsBlog = new Set();
  if (!Array.isArray(blog.items)) err('blog.json', '`items` debe ser una lista');
  else for (const [i, item] of blog.items.entries()) {
    const at = `blog items[${i}] "${item?.title ?? '¿?'}"`;
    if (!SLUG.test(item?.id ?? '')) err(at, 'id inválido');
    else if (idsBlog.has(item.id)) err(at, `id duplicado "${item.id}"`);
    else idsBlog.add(item.id);
    if (!item?.title) err(at, 'falta `title`');
    if (item?.url && !isHttpUrl(item.url)) err(at, 'url no es válida');
    if (typeof item?.order !== 'number') err(at, 'falta `order`');
    if (typeof item?.visible !== 'boolean') err(at, 'falta `visible`');
  }
  if (blog.highlight?.article && !idsBlog.has(blog.highlight.article)) err('blog highlight', 'el artículo seleccionado no existe');
  if (blog.highlight?.image && !isHttpUrl(blog.highlight.image) && !blog.highlight.image.startsWith('media/')) err('blog highlight', 'image debe ser una URL o ruta media/');
  if (blog.ticker?.url && !isHttpUrl(blog.ticker.url)) err('blog ticker', 'url no es válida');
}

// ─── about.json ──────────────────────────────────────────────────────────────
//
// El About no tiene respaldo, y esa es la diferencia con el home. Allá, si el
// destacado falla, queda el release más reciente; aquí el único texto de la
// página y los tres disparadores salen de este archivo. Un DJ a medias no es un
// About pobre: es un nombre en la línea que no responde a la mano, o un santo
// que no lleva a ninguna parte. Así que aquí casi todo es ERROR.

if (existsSync(join(root, 'data', 'about.json'))) {
  const about = load('about.json') ?? {};

  // Los enunciados de la barra. Sin uno de ellos la línea sigue en pie, pero
  // pierde una parte de lo que dice: por eso aviso y no error.
  if (!about.lema) warn('about.json', 'sin `lema` — la línea abierta pierde SONIC HUSTLERS');
  if (!about.sello) warn('about.json', 'sin `sello` — la línea arranca directo en los nombres');

  // **Las sílabas son la grieta.** Sin ellas no hay nombre partido, y sin
  // nombre partido no hay hueco que abrir: la página se queda sin su gesto
  // principal y con tres cuartos del texto inalcanzables. Por eso es error.
  const silabas = about.silabas;
  if (!Array.isArray(silabas) || silabas.length < 2) {
    err('about.json', 'falta `silabas` con al menos dos partes — es la grieta, el gesto de la página');
  } else if (silabas.some((s) => typeof s !== 'string' || !s.trim())) {
    err('about.json', '`silabas` trae alguna vacía — cada una es una sílaba del nombre');
  }

  // Las tres redes del sello. No las de los DJs: esas son el destino de los
  // emblemas y van en `djs[].instagram`.
  const redes = about.redes;
  if (!Array.isArray(redes) || redes.length === 0) {
    warn('about.json', 'sin `redes` — la línea abierta se queda sin INSTAGRAM / YOUTUBE / BANDCAMP');
  } else {
    for (const [i, r] of redes.entries()) {
      const at = `about redes[${i}] "${r?.nombre ?? '¿?'}"`;
      if (!r?.nombre) err(at, 'falta `nombre` — es lo que se lee en la línea');
      if (!r?.url) err(at, 'falta `url`');
      else if (!isHttpUrl(r.url)) err(at, `url no es válida: "${r.url}"`);
    }
  }

  // El correo. Es un grupo solo —los dos puntos son parte del texto, no una
  // junta— y el `mailto:` sale del campo de al lado.
  if (!about.bookings?.texto) {
    warn('about.json', 'sin `bookings.texto` — la línea abierta cierra sin el correo');
  } else if (!about.bookings.email) {
    warn('about.json', 'sin `bookings.email` — el link se arma con el texto entero, que casi nunca es una dirección');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(about.bookings.email)) {
    err('about.json', `bookings.email no parece un correo: "${about.bookings.email}"`);
  } else if (!about.bookings.texto.includes(about.bookings.email)) {
    warn('about.json', 'el correo de `bookings.email` no aparece en `bookings.texto`: se lee uno y se escribe a otro');
  }

  const djs = about.djs;
  if (!Array.isArray(djs) || djs.length === 0) {
    err('about.json', 'falta `djs` — sin DJs no hay nada que invocar');
  } else {
    // Son tres. Si algún día son otros, esto es lo que hay que venir a cambiar
    // —y hay que venir, porque el brief cerró la línea con los tres nombres.
    if (djs.length !== 3) {
      warn('about.json', `hay ${djs.length} DJs y el brief cerró tres. ¿Es a propósito?`);
    }

    const nombres = new Set();
    for (const [i, dj] of djs.entries()) {
      const at = `about djs[${i}] "${dj.nombre ?? '¿?'}"`;

      if (!dj.nombre) err(at, 'falta `nombre` — es el disparador y el texto de la línea');
      else if (nombres.has(dj.nombre)) err(at, `nombre duplicado "${dj.nombre}"`);
      else nombres.add(dj.nombre);

      if (!dj.instagram) err(at, 'falta `instagram` — el emblema es el link, sin él no lleva a nada');
      else if (!isHttpUrl(dj.instagram)) err(at, `instagram no es una URL válida: "${dj.instagram}"`);

      if (!dj.emblema) err(at, 'falta `emblema` (el GIF)');
      else revisarMedia(at, '`emblema`', dj.emblema);

      // El cuadro fijo no es opcional: un GIF animado no se puede pausar por
      // CSS, así que sin PNG no hay forma de respetar `prefers-reduced-motion`.
      if (!dj.quieto) err(at, 'falta `quieto` (el PNG) — es lo que se sirve con prefers-reduced-motion');
      else revisarMedia(at, '`quieto`', dj.quieto);

      if (dj.relleno) warn(at, 'marcado como `relleno`: el emblema es material de prueba');
    }
  }
}

// ─── merch.json ──────────────────────────────────────────────────────────────

const STOCK = ['in', 'few', 'out'];
if (existsSync(join(root, 'data', 'merch.json'))) {
  const merch = load('merch.json') ?? [];
  const merchSlugs = new Set();
  for (const [i, m] of merch.entries()) {
    const at = `merch[${i}] "${m.title ?? '¿?'}"`;
    if (!m.slug) err(at, 'falta `slug`');
    else if (merchSlugs.has(m.slug)) err(at, `slug duplicado "${m.slug}"`);
    else merchSlugs.add(m.slug);

    if (!m.title) err(at, 'falta `title`');
    if (!STOCK.includes(m.stock)) err(at, `stock inválido "${m.stock}" — debe ser ${STOCK.join(' | ')}`);
    if (!m.url) warn(at, 'sin `url` (link externo a la tienda)');
    else if (!isHttpUrl(m.url)) err(at, `url no válida: "${m.url}"`);
    if (typeof m.order !== 'number') err(at, 'falta `order`');
    if (typeof m.visible !== 'boolean') err(at, 'falta `visible`');
  }
}

// ─── salida ──────────────────────────────────────────────────────────────────

for (const w of warnings) console.warn(`  aviso  ${w}`);
for (const e of errors) console.error(`  ERROR  ${e}`);

const n = (c, s, p) => `${c} ${c === 1 ? s : p}`;
console.log(
  `\n${releases.length} releases · ${artists.length} artistas · ` +
    `${n(errors.length, 'error', 'errores')} · ${n(warnings.length, 'aviso', 'avisos')}`
);

process.exit(errors.length > 0 ? 1 : 0);
