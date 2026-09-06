/**
 * De dónde salen las variables del panel.
 *
 * En `astro dev` las carga Vite desde `.env` y viven en `import.meta.env`; en
 * la función de Netlify las pone la plataforma y viven en `process.env`. Ni
 * una ni la otra sirven solas, así que se miran las dos, con la lista de
 * nombres escrita a mano —nada de spread ciego— para que se vea de un vistazo
 * qué configura este panel.
 */

const CLAVES = ['PANEL_PASSWORD', 'PANEL_SECRET', 'GITHUB_TOKEN', 'GITHUB_REPO', 'GITHUB_BRANCH', 'GITHUB_API'];

export function entorno() {
  const proceso = typeof process !== 'undefined' ? process.env ?? {} : {};
  const salida = {};
  for (const clave of CLAVES) {
    salida[clave] = proceso[clave] || import.meta.env[clave] || '';
  }
  return salida;
}

/** Lo que falta por configurar, para poder decirlo en vez de fallar raro. */
export function faltaConfigurar(env = entorno()) {
  const opcionales = new Set(['GITHUB_BRANCH', 'GITHUB_REPO', 'GITHUB_API']);
  return CLAVES.filter((c) => !env[c] && !opcionales.has(c));
}
