/**
 * Cambiar una contraseña por una cookie de sesión.
 *
 * Es un `POST` de formulario y no un `fetch`, a propósito: así funciona con el
 * gestor de contraseñas del navegador y sin una línea de JS. Lo que sale de
 * aquí es siempre un 303 a alguna parte — el error viaja en la URL, no en el
 * cuerpo, porque la página que lo pinta es la misma de siempre.
 */

import {
  cabecera,
  firmar,
  iguales,
  ipDe,
  frenado,
  anotarFallo,
  limpiarFallos,
  pisoDeTiempo,
} from '../../../lib/sesion.mjs';
import { entorno } from '../../lib/entorno.js';

export const prerender = false;

const irA = (destino, cookie) =>
  new Response(null, {
    status: 303,
    headers: { Location: destino, ...(cookie ? { 'Set-Cookie': cookie } : null) },
  });

/** Solo rutas internas: `?volver=https://otro-sitio` sería un redirect abierto. */
const destinoSeguro = (crudo) => (/^\/(?!\/)/.test(crudo ?? '') ? crudo : '/');

export async function POST({ request, clientAddress }) {
  const arranque = Date.now();
  const env = entorno();
  const formulario = await request.formData();
  const volver = destinoSeguro(formulario.get('volver'));
  const clave = formulario.get('clave');

  const fallar = async (motivo) => {
    await pisoDeTiempo(arranque);
    return irA(`/entrar?error=${motivo}&volver=${encodeURIComponent(volver)}`);
  };

  if (!env.PANEL_PASSWORD || !env.PANEL_SECRET) return fallar('rota');
  if (!clave) return fallar('vacia');

  const ip = ipDe(request, clientAddress);
  if (frenado(ip)) return fallar('frenado');

  if (!(await iguales(String(clave), env.PANEL_PASSWORD))) {
    anotarFallo(ip);
    return fallar('mala');
  }

  limpiarFallos(ip);
  await pisoDeTiempo(arranque);
  return irA(volver, cabecera(await firmar(env.PANEL_SECRET, { desde: Date.now() })));
}

// Llegar aquí por GET es casi siempre un marcador viejo.
export const GET = () => irA('/entrar');
