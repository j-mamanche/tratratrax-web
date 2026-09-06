/**
 * Lo que cada pantalla del panel necesita del repo, con los fallos ya
 * convertidos en algo que se puede pintar.
 *
 * Una página que revienta con un 500 porque falta una variable de entorno no
 * le dice nada a quien está tratando de publicar un disco. Aquí un fallo es un
 * campo más del resultado, y la página lo muestra igual que muestra los datos.
 */

import { configDesde } from '../../lib/github.mjs';
import { cargarTodo, revisar } from '../../lib/datos.mjs';
import { entorno } from './entorno.js';

export async function estado() {
  let cfg;
  try {
    cfg = configDesde(entorno());
  } catch (e) {
    return { ok: false, error: e.message, releases: [], artists: [], home: {}, shas: {} };
  }

  try {
    const datos = await cargarTodo(cfg);
    const modelo = {
      releases: datos.releases.valor,
      artists: datos.artists.valor,
      home: datos.home.valor,
      about: datos.about.valor,
      blog: datos.blog.valor,
      shas: {
        releases: datos.releases.sha,
        artists: datos.artists.sha,
        home: datos.home.sha,
        about: datos.about.sha,
        blog: datos.blog.sha,
      },
    };

    // Sin la lista de `media/`: pedirla en cada pantalla es una llamada más a
    // GitHub por cada recarga, y aquí solo se está informando. La revisión que
    // de verdad decide —la de `/api/guardar`— sí la pide.
    const { errores, avisos } = revisar(modelo, null);

    return { ok: true, repo: cfg.repo, rama: cfg.rama, ...modelo, errores, avisos };
  } catch (e) {
    return { ok: false, error: e.message, releases: [], artists: [], home: {}, shas: {} };
  }
}
