/** Lee Bandcamp y devuelve fichas para el borrador de Studio. No guarda datos. */
import { importarMerch, listarMerch, validarUrlMerch } from '../../../lib/bandcamp-merch.mjs';
import { atender, json, leerCuerpo } from '../../lib/api.js';

export const prerender = false;

export const POST = ({ request }) => atender(async () => {
  const { url, itemId, listado } = await leerCuerpo(request);
  let u;
  try { u = validarUrlMerch(url); }
  catch (e) { return json({ error: e.message }, 400); }
  if (u.pathname.replace(/\/$/, '') === '/merch') {
    return json({ ok: true, listado: await listarMerch(u.href) });
  }
  return json({ ok: true, producto: await importarMerch(u.href, { itemId, listado }) });
});
