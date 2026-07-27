// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages de proyecto: la URL publicada es
//   https://j-mamanche.github.io/tratratrax-web/
// Si algún día se pone dominio propio, `base` vuelve a '/'.
export default defineConfig({
  site: 'https://j-mamanche.github.io',
  base: '/tratratrax-web',
  build: {
    // Los widgets se compilan aparte (npm run build:widgets), no como isla de Astro.
    assets: '_assets',
  },
});
