/**
 * Subir material a `media/`.
 *
 * Llega en base64 desde el navegador, que ya comprimió las imágenes antes de
 * mandarlas (JPEG, lado largo ≤ 2000 px). El video no se puede comprimir en el
 * navegador, así que se valida y se manda tal cual.
 *
 * **El tope no es el de GitHub, es el de Netlify.** GitHub corta la Contents
 * API en 100 MB, pero una función de Netlify solo recibe 6 MB de cuerpo por
 * invocación, y en base64 eso son unos 4,4 MB de archivo. Así que el tope real
 * de esta ruta es ese, y el mensaje lo dice con todas sus letras en vez de
 * dejar que la plataforma devuelva un 413 sin explicación.
 *
 * Un mp4 de home más pesado que eso hay que meterlo por `git push` — y casi
 * siempre lo que quiere decir es que hay que volver a exportarlo, porque un
 * video de fondo de 15 MB tampoco es algo que se le deba servir a nadie.
 */

import { shaDe, subirMedia } from '../../../lib/datos.mjs';
import { atender, config, json, leerCuerpo } from '../../lib/api.js';

export const prerender = false;

const TOPE = 4.4 * 1024 * 1024;

// Lo que el sitio sabe pintar. Nada de SVG: entra script, y esto se publica.
const TIPOS = {
  jpg: 'imagen', jpeg: 'imagen', png: 'imagen', webp: 'imagen', gif: 'imagen',
  mp4: 'video', webm: 'video',
};

export const POST = ({ request }) =>
  atender(async () => {
    const cfg = config();
    const { ruta, base64, mensaje, pisar } = await leerCuerpo(request);

    if (typeof ruta !== 'string' || !ruta.startsWith('media/')) {
      return json({ error: 'el material propio va en `media/`' }, 400);
    }
    if (!/^media\/[a-z0-9][a-z0-9._/-]*$/i.test(ruta) || ruta.includes('..')) {
      return json({ error: `"${ruta}" no es un nombre de archivo que se pueda publicar` }, 400);
    }

    const extension = ruta.split('.').pop()?.toLowerCase();
    if (!TIPOS[extension]) {
      return json(
        { error: `"${extension}" no es un tipo que el sitio sepa pintar (${Object.keys(TIPOS).join(', ')})` },
        400,
      );
    }

    if (typeof base64 !== 'string' || !base64) return json({ error: 'llegó sin contenido' }, 400);

    const bytes = Math.floor((base64.length * 3) / 4);
    if (bytes > TOPE) {
      return json(
        {
          error:
            `"${ruta}" pesa ${(bytes / 1e6).toFixed(1)} MB y por aquí solo caben ${(TOPE / 1e6).toFixed(1)} MB. ` +
            (TIPOS[extension] === 'video'
              ? 'Vuelve a exportar el video más liviano, o métele `git push` desde el repo.'
              : 'Baja la resolución o guárdala en JPEG.'),
        },
        413,
      );
    }

    // Pisar un archivo que ya está exige el sha; sin él GitHub responde que ya
    // existe. Se pide explícitamente para que subir dos veces «carátula.jpg»
    // sin querer no borre la primera.
    const sha = await shaDe(cfg, ruta);
    if (sha && !pisar) {
      return json({ error: `"${ruta}" ya existe en el repo`, existe: true }, 409);
    }

    const subido = await subirMedia(cfg, {
      ruta,
      base64,
      sha: sha ?? undefined,
      mensaje: mensaje ?? `Panel: material ${ruta}`,
    });

    return json({ ok: true, ...subido });
  });
