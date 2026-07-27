#!/usr/bin/env node
/**
 * Importa releases desde Bandcamp.
 *
 *   npm run import -- https://tratratrax.bandcamp.com/album/pyrexia
 *   npm run import -- https://tratratrax.bandcamp.com/music     # toda la discografía
 *   npm run import -- <url> --append                            # los mete en data/releases.json
 *
 * Bandcamp no necesita API ni token: la página del álbum ya trae todo en el
 * HTML. Y el sello ya escribe sus créditos allá en la convención `Rol__ Valor`
 * (incluido `Catalog__ TRA031`), así que se importan estructurados.
 *
 * Lo único que Bandcamp no sabe es `listenUrl` (el linktree). Eso va a mano.
 *
 * Corre en Node y no en el navegador porque Bandcamp no manda cabeceras CORS.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const url = args.find((a) => !a.startsWith('--'));

if (!url) {
  console.error('Uso: npm run import -- <url de Bandcamp> [--append]');
  process.exit(1);
}

// ─── helpers ─────────────────────────────────────────────────────────────────

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

const slugify = (s = '') =>
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
  return decode(
    m[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
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
function splitCredit(line) {
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

// ─── artistas conocidos ──────────────────────────────────────────────────────

let knownArtists = [];
try {
  knownArtists = JSON.parse(readFileSync(join(root, 'data', 'artists.json'), 'utf8'));
} catch {
  /* sin artists.json todavía: seguimos con slugs crudos */
}

const missingArtists = new Map();

/** El nombre de Bandcamp puede traer varios artistas: "Ehua & Flore", "A, B". */
/** Bandcamp escribe el nombre distinto al sitio; `aliases` cubre la diferencia. */
function matchArtist(name) {
  const s = slugify(name);
  return (
    knownArtists.find(
      (a) => a.slug === s || slugify(a.display) === s || (a.aliases ?? []).some((x) => slugify(x) === s)
    )?.slug ?? null
  );
}

function resolveArtists(name) {
  if (!name) return [];

  const whole = matchArtist(name);
  if (whole) return [whole];

  // Probar partiendo por separadores comunes: "Ehua & Flore", "TSVI, DJ Babatr".
  const parts = name.split(/\s*(?:,|&|\band\b|\bx\b)\s*/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    const hits = parts.map(matchArtist);
    if (hits.every(Boolean)) return hits;
  }

  missingArtists.set(slugify(name), name);
  return [slugify(name)];
}

// ─── un álbum ────────────────────────────────────────────────────────────────

async function importAlbum(albumUrl) {
  const html = await fetchHtml(albumUrl);

  // "Pyrexia, by Ehua & Flore"
  const ogTitle = meta(html, 'og:title');
  const split = ogTitle.lastIndexOf(', by ');
  const album = split > -1 ? ogTitle.slice(0, split) : ogTitle;
  const artistName = split > -1 ? ogTitle.slice(split + 5) : meta(html, 'og:site_name');

  const artMatch = meta(html, 'og:image').match(/\/a(\d+)_/);

  // El bloque de créditos trae la fecha, los `Rol__ Valor` y el texto libre.
  const creditsText = block(html, 'tralbum-credits');
  const lines = creditsText.split('\n').map((l) => l.trim());

  let date = '';
  let catalog = '';
  const credits = [];
  const noteLines = [];

  for (const line of lines) {
    if (!line) {
      if (noteLines.length) noteLines.push('');
      continue;
    }
    if (!date && /^released\b/i.test(line)) {
      date = parseDate(line);
      continue;
    }
    const pair = splitCredit(line);
    if (pair) {
      // El número de catálogo lo escriben de cuatro formas distintas según la
      // época: Catalog__, Catalogue No.__, Cat. number_, Cataloge #__.
      if (/^cat(a(l(og(ue)?|oge))?)?\.?\s*(no\.?|number|#)?$/i.test(pair.role)) catalog = pair.name;
      else credits.push(pair);
      continue;
    }
    noteLines.push(line);
  }

  const release = {
    id: slugify(album),
    catalog,
    album,
    artists: resolveArtists(artistName),
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

// ─── discografía ─────────────────────────────────────────────────────────────

async function listDiscography(bandUrl) {
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

// ─── main ────────────────────────────────────────────────────────────────────

const path = new URL(url).pathname;
const isDiscography = /^\/(music)?\/?$/.test(path);

try {
  let releases;

  if (isDiscography) {
    const urls = await listDiscography(url);
    console.error(`Encontrados ${urls.length} lanzamientos.\n`);
    releases = [];
    for (const [i, u] of urls.entries()) {
      process.stderr.write(`  [${String(i + 1).padStart(2)}/${urls.length}] ${u.replace(/^https:\/\//, '')}`);
      try {
        const { release } = await importAlbum(u);
        releases.push(release);
        console.error(`  ✓ ${release.catalog || '—'} ${release.date || '(sin fecha)'}`);
      } catch (e) {
        console.error(`  ✗ ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 500)); // no martillar a Bandcamp
    }
    releases.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } else {
    const { release, blurb } = await importAlbum(url);
    releases = [release];
    if (blurb) console.error(`\nTexto editorial de Bandcamp (no lo usamos, aquí por si acaso):\n${blurb}\n`);
  }

  releases.forEach((r, i) => (r.order = i + 1));

  if (missingArtists.size) {
    console.error('\nArtistas que no están en data/artists.json — agrégalos:');
    for (const [slug, display] of missingArtists) {
      console.error(`  { "slug": "${slug}", "display": "${display}" },`);
    }
  }

  emit(releases);
} catch (e) {
  console.error(`\nERROR: ${e.message}`);
  process.exit(1);
}

function emit(releases) {
  if (!flags.has('--append')) {
    console.log(JSON.stringify(releases.length === 1 ? releases[0] : releases, null, 2));
    console.error('\nRevísalo y pégalo en data/releases.json. Falta a mano: listenUrl.');
    return;
  }

  const file = join(root, 'data', 'releases.json');
  const existing = JSON.parse(readFileSync(file, 'utf8'));
  const have = new Set(existing.map((r) => r.id));

  const added = releases.filter((r) => {
    if (have.has(r.id)) {
      console.error(`  omitido  "${r.id}" ya existe`);
      return false;
    }
    return true;
  });

  const merged = [...added, ...existing]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .map((r, i) => ({ ...r, order: i + 1 }));

  writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  console.error(`\nAgregados ${added.length} a data/releases.json. Ahora corre: npm run validate`);
}
