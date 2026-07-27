// Compila los widgets que corren DENTRO de Cargo.
//
// Salida en `public/`, que Astro copia tal cual a `dist/`:
//   public/ttx.js    ← el bundle, **con el CSS adentro**
//   public/ttx.css   ← el mismo CSS suelto, solo para los que tengan cacheada
//                      una versión vieja del bundle que todavía lo pide
//   public/data/*.json ← los datos, servidos desde el mismo origen
//
// **Por qué el CSS va adentro del JS.** Estaban separados y el loader
// inyectaba un `<link>`. GitHub Pages los cachea diez minutos cada uno, por
// su cuenta: el navegador puede revalidar uno y no el otro y quedarse con el
// JS de una versión y el CSS de otra. Pasó en vivo — el JS viejo ponía
// `.ttx-stack` y el CSS nuevo solo conocía `.ttx-marco`, y la página quedaba
// sin maquetar. Un solo archivo no se puede desincronizar consigo mismo.
//
// `public/` es generado: no se versiona. La fuente es `src/widgets/` y `data/`.

import { build, context } from 'esbuild';
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
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

/**
 * Dos pasadas, porque el CSS tiene que existir antes de poder meterlo en el
 * JS. La primera escribe `ttx.css` —que se queda ahí para los navegadores con
 * un bundle viejo cacheado— y la segunda reescribe `ttx.js` con ese CSS
 * dentro, en `__TTX_CSS__`.
 */
async function compilar() {
  const { outputFiles } = await build({ ...opciones, write: false, logLevel: 'silent' });
  const css = outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';

  await build({
    ...opciones,
    define: { __TTX_CSS__: JSON.stringify(css) },
    // Ya va adentro: sin esto esbuild emitiría el `.css` una segunda vez y
    // volveríamos a tener dos archivos que mantener en fase.
    loader: { '.css': 'empty' },
  });

  await writeFile(join(salida, 'ttx.css'), css);
}

if (observar) {
  const ctx = await context({ ...opciones, define: { __TTX_CSS__: '""' } });
  await ctx.watch();
  console.log('[ttx] observando src/widgets/ …');
} else {
  await compilar();
  console.log('[ttx] widgets compilados en public/');
}
