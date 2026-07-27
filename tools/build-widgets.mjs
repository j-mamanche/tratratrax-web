// Compila los widgets que corren DENTRO de Cargo.
//
// Salida en `public/`, que Astro copia tal cual a `dist/`:
//   public/ttx.js    ← el bundle
//   public/ttx.css   ← el CSS, que el loader inyecta solo
//   public/data/*.json ← los datos, servidos desde el mismo origen
//
// `public/` es generado: no se versiona. La fuente es `src/widgets/` y `data/`.

import { build, context } from 'esbuild';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const salida = join(raiz, 'public');
const observar = process.argv.includes('--watch');

const opciones = {
  entryPoints: [join(raiz, 'src/widgets/index.js')],
  outfile: join(salida, 'ttx.js'),
  bundle: true,
  // IIFE, no ESM: `document.currentScript` es null dentro de un
  // `<script type="module">`, y de ahí sale la URL de los datos y del CSS.
  format: 'iife',
  target: ['es2022', 'safari16'],
  minify: !observar,
  sourcemap: observar ? 'inline' : false,
  legalComments: 'none',
  logLevel: 'info',
};

async function copiarDatos() {
  const origen = join(raiz, 'data');
  const destino = join(salida, 'data');
  await mkdir(destino, { recursive: true });

  for (const f of await readdir(origen)) {
    if (f.endsWith('.json')) await cp(join(origen, f), join(destino, f));
  }
}

await rm(salida, { recursive: true, force: true });
await mkdir(salida, { recursive: true });
await copiarDatos();

if (observar) {
  const ctx = await context(opciones);
  await ctx.watch();
  console.log('[ttx] observando src/widgets/ …');
} else {
  await build(opciones);
  console.log('[ttx] widgets compilados en public/');
}
