// @ts-check
import { defineConfig } from 'astro/config';

// Pages se publica como proyecto (`/tratratrax-web`), mientras que el preview
// temporal de Netlify vive en la raíz de su propio subdominio. El mismo build
// se adapta sin obligar a Cargo a conocer ninguno de los dos hosts.
const enNetlify = process.env.DEPLOY_TARGET === 'netlify';

// GitHub Pages de proyecto: la URL publicada es
//   https://j-mamanche.github.io/tratratrax-web/
// Si algún día se pone dominio propio, `base` vuelve a '/'.
export default defineConfig({
  site: enNetlify ? undefined : 'https://j-mamanche.github.io',
  base: enNetlify ? '/' : '/tratratrax-web',
  build: {
    // Los widgets se compilan aparte (npm run build:widgets), no como isla de Astro.
    assets: '_assets',
  },
});
