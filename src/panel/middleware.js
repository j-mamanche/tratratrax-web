/**
 * La guardia. Todo lo que no sea la puerta pide sesión.
 *
 * Va en middleware y no en cada página porque el modo de fallar de este tipo
 * de panel es siempre el mismo: alguien añade una ruta y se le olvida el
 * `if (!sesion)`. Aquí la lista es al revés —lo abierto se enumera— así que
 * una ruta nueva nace cerrada.
 */

import { defineMiddleware } from 'astro:middleware';
import { haySesion } from '../lib/sesion.mjs';

const ABIERTAS = new Set(['/entrar', '/api/entrar', '/robots.txt']);

export const onRequest = defineMiddleware(async (contexto, siguiente) => {
  const { request, url, locals } = contexto;
  const ruta = url.pathname.replace(/\/+$/, '') || '/';

  // Lo que sirve el CDN —`ttx.js`, `data/`, `media/`, los assets del build—
  // no pasa por aquí en Netlify. Da igual: son los mismos archivos que ya
  // publica Pages, y el panel no guarda nada privado en `public/`.
  if (ABIERTAS.has(ruta)) return siguiente();

  const abierta = await haySesion(request, import.meta.env);
  locals.sesion = abierta;

  if (abierta) return siguiente();

  // Una petición de datos que se topa con la sesión vencida tiene que poder
  // distinguirse de una respuesta buena: 401 y JSON, no un HTML de login que
  // el `fetch` del navegador guardaría como si fuera el guardado.
  if (ruta.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'sesión vencida — vuelve a entrar' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const destino = new URL('/entrar', url);
  if (ruta !== '/') destino.searchParams.set('volver', url.pathname + url.search);
  return Response.redirect(destino, 303);
});
