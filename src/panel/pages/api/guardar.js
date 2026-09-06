/**
 * Guardar es commitear.
 *
 * Llega el archivo entero —no un parche— con el `sha` que tenía cuando se
 * abrió el formulario. Si ese sha ya no es el bueno, GitHub rebota el commit y
 * el panel dice que alguien ganó, en vez de pisarlo.
 *
 * Antes de escribir se revisa el modelo **completo**, mezclando lo que llega
 * con lo que ya hay en el repo: un release nuevo puede nombrar un artista que
 * está en el otro archivo, y revisarlos por separado no vería el hueco.
 */

import { cargarTodo, guardar, listarMedia, revisar, ARCHIVOS } from '../../../lib/datos.mjs';
import { atender, config, json, leerCuerpo } from '../../lib/api.js';

export const prerender = false;

// Artistas antes que releases: un release puede estrenar un artista, y así el
// archivo que lo nombra nunca queda commiteado antes que el que lo define.
const ORDEN = ['artists', 'releases', 'home', 'about', 'blog'];

export const POST = ({ request }) =>
  atender(async () => {
    const cfg = config();
    const cuerpo = await leerCuerpo(request);
    const cambios = Array.isArray(cuerpo.cambios) ? cuerpo.cambios : [cuerpo];

    for (const c of cambios) {
      if (!ARCHIVOS[c.archivo]) return json({ error: `archivo desconocido "${c.archivo}"` }, 400);
      if (c.valor == null) return json({ error: `"${c.archivo}" llegó sin contenido` }, 400);
    }

    // El estado actual, para revisar el modelo completo y no solo el pedazo.
    const actual = await cargarTodo(cfg);
    const propuesto = {
      releases: actual.releases.valor,
      artists: actual.artists.valor,
      home: actual.home.valor,
      blog: actual.blog.valor,
    };
    for (const c of cambios) {
      if (c.archivo in propuesto) propuesto[c.archivo] = c.valor;
    }

    const media = await listarMedia(cfg);

    // Blog no referencia releases, artistas ni Home. Validar el modelo entero
    // al guardar únicamente una noticia hacía que un dato histórico inválido
    // de otro archivo devolviera 422 y bloqueara un cambio perfectamente
    // válido en el blog. Los cambios que sí cruzan esos archivos conservan la
    // revisión completa de siempre.
    const soloBlog = cambios.length === 1 && cambios[0].archivo === 'blog';
    const paraRevisar = soloBlog
      ? { releases: [], artists: [], home: null, blog: propuesto.blog }
      : propuesto;
    const { errores, avisos } = revisar(paraRevisar, media);
    if (errores.length) {
      return json({ error: 'Corrige los campos marcados.', errores, avisos }, 422);
    }

    // Si el sha que llega es viejo, el commit rebota como `Choque`. Solo se
    // omite cuando el archivo no existía: ahí no hay nada que pisar.
    const shas = {};
    const hechos = [];
    try {
      for (const clave of ORDEN) {
        const c = cambios.find((x) => x.archivo === clave);
        if (!c) continue;
        shas[clave] = await guardar(cfg, {
          archivo: clave,
          valor: c.valor,
          sha: c.sha ?? actual[clave]?.sha ?? undefined,
          mensaje: c.mensaje ?? cuerpo.mensaje ?? `Panel: ${clave}`,
        });
        hechos.push(clave);
      }
    } catch (e) {
      // Un commit de dos archivos que se cae en el segundo deja el repo a
      // medias. Es raro y se recupera guardando otra vez, pero callarlo sería
      // dejar al sello creyendo que publicó las dos cosas.
      if (hechos.length) {
        e.message = `Se guardó ${hechos.join(' y ')}. Recarga y guarda el resto.`;
      }
      throw e;
    }

    return json({ ok: true, shas, avisos, rama: cfg.rama });
  });
