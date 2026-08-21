#!/usr/bin/env node
/**
 * Importa releases desde Bandcamp.
 *
 *   npm run import -- https://tratratrax.bandcamp.com/album/pyrexia
 *   npm run import -- https://tratratrax.bandcamp.com/music     # toda la discografía
 *   npm run import -- <url> --append                            # los mete en data/releases.json
 *
 * Lo que sabe leer una página de Bandcamp vive en `src/lib/bandcamp.mjs`, que
 * es lo mismo que usa el botón «importar» del panel. Aquí queda lo que es
 * propio de la línea de comandos: los argumentos, el disco y lo que se
 * imprime en pantalla.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { importarAlbum, listarDiscografia, esDiscografia } from '../src/lib/bandcamp.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const url = args.find((a) => !a.startsWith('--'));

if (!url) {
  console.error('Uso: npm run import -- <url de Bandcamp> [--append]');
  process.exit(1);
}

let artistas = [];
try {
  artistas = JSON.parse(readFileSync(join(root, 'data', 'artists.json'), 'utf8'));
} catch {
  /* sin artists.json todavía: seguimos con slugs crudos */
}

const faltantes = new Map();

try {
  let releases;

  if (esDiscografia(url)) {
    const urls = await listarDiscografia(url);
    console.error(`Encontrados ${urls.length} lanzamientos.\n`);
    releases = [];
    for (const [i, u] of urls.entries()) {
      process.stderr.write(`  [${String(i + 1).padStart(2)}/${urls.length}] ${u.replace(/^https:\/\//, '')}`);
      try {
        const { release } = await importarAlbum(u, { artistas, faltantes });
        releases.push(release);
        console.error(`  ✓ ${release.catalog || '—'} ${release.date || '(sin fecha)'}`);
      } catch (e) {
        console.error(`  ✗ ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 500)); // no martillar a Bandcamp
    }
    releases.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } else {
    const { release, blurb } = await importarAlbum(url, { artistas, faltantes });
    releases = [release];
    if (blurb) console.error(`\nTexto editorial de Bandcamp (no lo usamos, aquí por si acaso):\n${blurb}\n`);
  }

  releases.forEach((r, i) => (r.order = i + 1));

  if (faltantes.size) {
    console.error('\nArtistas que no están en data/artists.json — agrégalos:');
    for (const [slug, display] of faltantes) {
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
