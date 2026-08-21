/**
 * Leer un release de Bandcamp.
 *
 * Esto vivía entero dentro de `tools/bandcamp-import.mjs`. Se sacó aquí porque
 * ahora tiene dos bocas: la línea de comandos de siempre y el botón
 * «importar» del panel. La lógica es la misma y tiene que seguir siéndolo — si
 * se duplicara, un día el CLI entendería un crédito que el panel no.
 *
 * **Solo servidor.** Bandcamp no manda cabeceras CORS, así que esto no corre
 * en el navegador ni con buena voluntad: el panel lo llama desde una ruta de
 * Astro, que sí es Node.
 *
 * Bandcamp no necesita API ni token: la página del álbum ya trae todo en el
 * HTML. Y el sello ya escribe sus créditos allá con la convención `Rol__
 * Valor` (incluido `Catalog__ TRA031`), así que se importan estructurados.
 *
 * Lo único que Bandcamp no sabe es `listenUrl` (el linktree). Eso va a mano.
 */

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

async function fetchHtml(target) {
  const res = await fetch(target, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${target}`);
  return res.text();
}

const ENTITIES = {
  quot: '"', apos: "'", amp: '&', lt: '<', gt: '>', nbsp: ' ', '#39': "'", '#039': "'", '#34': '"',
};

const decode = (s = '') =>
  s
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
      if (ENTITIES[code]) return ENTITIES[code];
      if (code[0] === '#') {
        const n = code[1] === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isNaN(n) ? m : String.fromCodePoint(n);
      }
      return m;
    })
    // Bandcamp arrastra espacios de ancho cero pegados en el texto viejo.
    .replace(/[​-‏⁠﻿]/g, '')
    .trim();

const meta = (html, key) => {
  const m = html.match(new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="([^"]*)"`, 'i'));
  return m ? decode(m[1]) : '';
};

const attrJson = (html, attr) => {
  const m = html.match(new RegExp(`${attr}="([^"]*)"`));
  if (!m) return null;
  try {
    return JSON.parse(decode(m[1]));
  } catch {
    return null;
  }
};

export const slugify = (s = '') =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/** "April 30, 2026" o "30 April 2026" → "2026-04-30" */
function parseDate(text = '') {
  const pad = (n) => String(n).padStart(2, '0');
  let m = text.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (m && MONTHS[m[1].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(m[2])}`;
  m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(m[1])}`;
  return '';
}

/** Contenido de <div class="tralbumData <clase>">…</div> como texto con saltos. */
function block(html, cls) {
  const m = html.match(new RegExp(`<div class="tralbumData ${cls}"[^>]*>([\\s\\S]*?)</div>`));
  if (!m) return '';
  return decode(m[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''))
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parte una línea de crédito en {role, name}.
 * El separador canónico es `__`, pero los releases de 2020-2021 usan uno solo
 * (`Cat. number_ TRA004`). Para el caso de un guion bajo exigimos que la parte
 * izquierda parezca una etiqueta y no una frase, para no partir texto libre.
 */
export function splitCredit(line) {
  const build = (i, len) => {
    const role = line.slice(0, i).trim();
    const name = line.slice(i + len).trim();
    return role && name ? { role, name } : null;
  };

  const dbl = line.indexOf('__');
  if (dbl > 0) return build(dbl, 2);

  const one = line.indexOf('_');
  if (one > 0 && one <= 25 && !/[.!?],?\s+\S+\s+\S+/.test(line.slice(0, one))) return build(one, 1);

  return null;
}

/**
 * Bandcamp escribe el nombre distinto al sitio; `aliases` cubre la diferencia.
 * `conocidos` es `data/artists.json` — se pasa como argumento y no se lee de
 * disco, porque en el panel viene de GitHub y no hay disco.
 */
function matchArtist(conocidos, name) {
  const s = slugify(name);
  return (
    conocidos.find(
      (a) => a.slug === s || slugify(a.display) === s || (a.aliases ?? []).some((x) => slugify(x) === s),
    )?.slug ?? null
  );
}

/**
 * El nombre de Bandcamp puede traer varios artistas: "Ehua & Flore", "A, B".
 * Los que no aparezcan en `artists.json` se devuelven aparte en `faltantes`,
 * porque un slug inventado en `releases.json` es un error del validador y no
 * algo que deba escribirse en silencio.
 */
export function resolverArtistas(conocidos, name, faltantes = new Map()) {
  if (!name) return [];

  const entero = matchArtist(conocidos, name);
  if (entero) return [entero];

  // Probar partiendo por separadores comunes: "Ehua & Flore", "TSVI, DJ Babatr".
  const partes = name.split(/\s*(?:,|&|\band\b|\bx\b)\s*/i).map((s) => s.trim()).filter(Boolean);
  if (partes.length > 1) {
    const aciertos = partes.map((p) => matchArtist(conocidos, p));
    if (aciertos.every(Boolean)) return aciertos;
  }

  faltantes.set(slugify(name), name);
  return [slugify(name)];
}

/**
 * Un álbum → un objeto con la forma de `releases.json`.
 *
 * `order` sale en 0 y `visible` en true: el que llame decide dónde va en la
 * lista, porque eso depende de lo que ya haya.
 */
export async function importarAlbum(albumUrl, { artistas = [], faltantes = new Map() } = {}) {
  const html = await fetchHtml(albumUrl);

  // "Pyrexia, by Ehua & Flore"
  const ogTitle = meta(html, 'og:title');
  const corte = ogTitle.lastIndexOf(', by ');
  const album = corte > -1 ? ogTitle.slice(0, corte) : ogTitle;
  const artistName = corte > -1 ? ogTitle.slice(corte + 5) : meta(html, 'og:site_name');

  const artMatch = meta(html, 'og:image').match(/\/a(\d+)_/);

  // El bloque de créditos trae la fecha, los `Rol__ Valor` y el texto libre.
  const lineas = block(html, 'tralbum-credits').split('\n').map((l) => l.trim());

  let date = '';
  let catalog = '';
  const credits = [];
  const noteLines = [];

  for (const line of lineas) {
    if (!line) {
      if (noteLines.length) noteLines.push('');
      continue;
    }
    if (!date && /^released\b/i.test(line)) {
      date = parseDate(line);
      continue;
    }
    const par = splitCredit(line);
    if (par) {
      // El número de catálogo lo escriben de cuatro formas distintas según la
      // época: Catalog__, Catalogue No.__, Cat. number_, Cataloge #__.
      if (/^cat(a(l(og(ue)?|oge))?)?\.?\s*(no\.?|number|#)?$/i.test(par.role)) catalog = par.name;
      else credits.push(par);
      continue;
    }
    noteLines.push(line);
  }

  const release = {
    id: slugify(album),
    catalog,
    album,
    artists: resolverArtistas(artistas, artistName, faltantes),
    date,
    bcImageId: artMatch ? `a${artMatch[1]}` : '',
    purchaseUrl: (meta(html, 'og:url') || albumUrl).split('?')[0],
    listenUrl: '', // ← el linktree, a mano
    credits,
    note: noteLines.join('\n').trim(),
    order: 0,
    visible: true,
  };

  return { release, blurb: block(html, 'tralbum-about') };
}

/** Todas las URLs de álbum de una discografía. */
export async function listarDiscografia(bandUrl) {
  const base = new URL(bandUrl).origin;
  const html = await fetchHtml(`${base}/music`);
  const urls = new Set();

  // Lo que el grid renderiza directo en el HTML…
  for (const m of html.matchAll(/<a href="(\/(?:album|track)\/[^"?]+)/g)) {
    urls.add(new URL(m[1], base).href);
  }
  // …y lo que deja para cargar por JS.
  for (const item of attrJson(html, 'data-client-items') ?? []) {
    if (item.page_url) urls.add(new URL(item.page_url.split('?')[0], base).href);
  }

  return [...urls];
}

/** ¿La URL apunta a la discografía entera o a un solo álbum? */
export const esDiscografia = (url) => /^\/(music)?\/?$/.test(new URL(url).pathname);
