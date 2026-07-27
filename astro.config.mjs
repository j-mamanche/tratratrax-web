// @ts-check
import { defineConfig } from 'astro/config';

// OJO: `site` y `base` hay que ajustarlos cuando exista el repo en GitHub.
// Si el repo es github.com/<usuario>/tratratrax-web, entonces:
//   site: 'https://<usuario>.github.io'
//   base: '/tratratrax-web'
// Con dominio propio, `base` se borra.
export default defineConfig({
  site: 'https://EDITAR.github.io',
  base: '/tratratrax-web',
  build: {
    // Los widgets se compilan aparte (npm run build:widgets), no como isla de Astro.
    assets: '_assets',
  },
});
