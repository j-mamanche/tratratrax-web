/**
 * El botón «traer de Bandcamp».
 *
 * Corre en el servidor y no en el navegador porque Bandcamp no manda
 * cabeceras CORS — es la misma razón por la que `tools/bandcamp-import.mjs`
 * es un script de Node y no un `fetch` desde una página.
 *
 * **No commitea nada.** Devuelve el release ya con la forma de
 * `releases.json` y lo mete en el borrador del panel; guardarlo es un paso
 * aparte, con su revisión y su confirmación. Un importador que escribiera
 * directo sería un importador que nadie se atreve a apretar.
 */

import { importarAlbum, listarDiscografia, esDiscografia } from '../../../lib/bandcamp.mjs';
import { cargarTodo } from '../../../lib/datos.mjs';
import { atender, config, json, leerCuerpo } from '../../lib/api.js';

export const prerender = false;

// La discografía entera son 35 páginas con medio segundo de espera entre
// cada una: no cabe en el tiempo de una función. Ese caso sigue siendo del
// CLI, que puede tardar lo que quiera, y aquí se dice así.
const TOPE_LISTA = 6;

export const POST = ({ request }) =>
  atender(async () => {
    const cfg = config();
    const { url } = await leerCuerpo(request);

    let destino;
    try {
      destino = new URL(url);
    } catch {
      return json({ error: 'eso no es una URL' }, 400);
    }
    if (!/(^|\.)bandcamp\.com$/.test(destino.hostname)) {
      return json({ error: 'solo se importa de bandcamp.com' }, 400);
    }

    const { artists, releases } = await cargarTodo(cfg);
    const existentes = new Set(releases.valor.map((r) => r.id));
    const faltantes = new Map();

    if (esDiscografia(destino.href)) {
      const urls = (await listarDiscografia(destino.href)).filter(Boolean);
      const nuevas = urls.filter((u) => !existentes.has(u.split('/').pop()));
      if (nuevas.length > TOPE_LISTA) {
        return json(
          {
            error:
              `hay ${nuevas.length} lanzamientos por traer y por aquí solo caben ${TOPE_LISTA} de una. ` +
              'La discografía entera se importa desde el repo: `npm run import -- <url> --append`.',
            urls: nuevas,
          },
          413,
        );
      }
      const traidos = [];
      for (const u of nuevas) {
        const { release } = await importarAlbum(u, { artistas: artists.valor, faltantes });
        traidos.push(release);
      }
      return json({ ok: true, releases: traidos, faltantes: [...faltantes] });
    }

    const { release, blurb } = await importarAlbum(destino.href, {
      artistas: artists.valor,
      faltantes,
    });

    return json({
      ok: true,
      releases: [release],
      // El texto editorial de Bandcamp no se guarda, pero verlo al lado ayuda
      // a escribir la nota — que es donde el sello sí pone algo suyo.
      blurb,
      yaEsta: existentes.has(release.id),
      faltantes: [...faltantes],
    });
  });
