// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

/**
 * El **segundo** build del repo: el panel de edición del sello.
 *
 * El primero (`astro.config.mjs`) sigue igual — estático, a GitHub Pages, con
 * el bundle de los widgets y los datos públicos. Este otro es SSR y va a
 * Netlify, en un subdominio con contraseña, y lo único que hace es escribir
 * `data/*.json` en el repo por la API de GitHub. Publicar lo sigue haciendo
 * Actions.
 *
 * Los dos leen el mismo `src/`, y no chocan por dónde viven las páginas:
 * Astro solo mira `<srcDir>/pages`, así que `src/pages` es el sitio público y
 * `src/panel/pages` es el panel. Ninguno ve al otro.
 *
 * `publicDir` sí es compartido a propósito: es lo que `build:widgets` genera
 * —`ttx.js`, `data/`, `media/`—, y tenerlo servido también aquí es lo que hace
 * posible la previsualización en vivo, con los widgets de verdad montados
 * sobre el borrador.
 */
export default defineConfig({
  srcDir: './src/panel',
  outDir: './dist-panel',
  publicDir: './public',
  output: 'server',
  adapter: netlify(),
  build: {
    assets: '_assets',
  },
  // El panel no se indexa y no tiene URLs que compartir; sin `site` Astro no
  // intenta generar sitemap ni canónicas.
  vite: {
    build: {
      // El material de `media/` puede pesar; que no intente meterlo en línea.
      assetsInlineLimit: 0,
    },
  },
});
