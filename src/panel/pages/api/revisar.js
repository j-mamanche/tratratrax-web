/**
 * Revisión del borrador sin escribir nada.
 *
 * La barra la usa mientras se edita para distinguir cambios pendientes de
 * conflictos que impedirían publicarlos. Comparte la misma regla que Guardar:
 * un cambio aislado de Blog no queda bloqueado por datos históricos ajenos.
 */

import { cargarTodo, listarMedia, revisar, ARCHIVOS } from '../../../lib/datos.mjs';
import { atender, config, json, leerCuerpo } from '../../lib/api.js';

export const prerender = false;

export const POST = ({ request }) =>
  atender(async () => {
    const cuerpo = await leerCuerpo(request);
    const cambios = Array.isArray(cuerpo.cambios) ? cuerpo.cambios : [];
    for (const cambio of cambios) {
      if (!ARCHIVOS[cambio.archivo]) return json({ error: `archivo desconocido "${cambio.archivo}"` }, 400);
    }

    const cfg = config();
    const actual = await cargarTodo(cfg);
    const propuesto = {
      releases: actual.releases.valor,
      artists: actual.artists.valor,
      home: actual.home.valor,
      blog: actual.blog.valor,
    };
    for (const cambio of cambios) {
      if (cambio.archivo in propuesto) propuesto[cambio.archivo] = cambio.valor;
    }

    const soloBlog = cambios.length === 1 && cambios[0].archivo === 'blog';
    const paraRevisar = soloBlog
      ? { releases: [], artists: [], home: null, blog: propuesto.blog }
      : propuesto;
    // La lista completa de media solo hace falta si se tocó un release. Así
    // una tecla en Blog o Home no dispara un árbol entero de GitHub.
    const media = cambios.some((cambio) => cambio.archivo === 'releases')
      ? await listarMedia(cfg)
      : null;
    const { errores, avisos } = revisar(paraRevisar, media);
    return json({ ok: errores.length === 0, errores, avisos });
  });
