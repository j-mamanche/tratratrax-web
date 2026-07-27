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
  else if (r.date > today) warn(at, `fecha en el futuro (${r.date})`);

  if (!BC_IMAGE.test(r.bcImageId ?? '')) {
    err(at, `bcImageId inválido "${r.bcImageId}" — se espera algo como a750972864`);
  }

  if (!r.purchaseUrl) warn(at, 'sin `purchaseUrl` (link de compra en Bandcamp)');
  else if (!isHttpUrl(r.purchaseUrl)) err(at, `purchaseUrl no es una URL válida: "${r.purchaseUrl}"`);

  if (!r.listenUrl) warn(at, 'sin `listenUrl` (linktree para escuchar)');
  else if (!isHttpUrl(r.listenUrl)) err(at, `listenUrl no es una URL válida: "${r.listenUrl}"`);

  for (const [j, c] of (r.credits ?? []).entries()) {
    if (!c.role || !c.name) err(`${at} credits[${j}]`, 'necesita `role` y `name`');
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
