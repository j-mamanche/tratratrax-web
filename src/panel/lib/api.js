/**
 * Lo que comparten las rutas de servidor: la configuración y la forma de
 * contestar. Nada de sesión — de eso se encarga `middleware.js`, y por eso una
 * ruta nueva no puede nacer abierta por olvido.
 */

import { configDesde, SinConfigurar } from '../../lib/github.mjs';
import { Choque } from '../../lib/datos.mjs';
import { entorno } from './entorno.js';

export const json = (valor, estado = 200) =>
  new Response(JSON.stringify(valor), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const config = () => configDesde(entorno());

/**
 * Envuelve el cuerpo de una ruta para que los tres fallos que de verdad pasan
 * lleguen al navegador como lo que son, y no como un 500 mudo:
 *
 *   409  alguien más guardó primero        → hay que recargar y rehacer
 *   422  lo que se iba a guardar está mal  → la lista de errores, campo a campo
 *   503  falta configurar el panel         → no es culpa del que está editando
 */
export async function atender(cuerpo) {
  try {
    return await cuerpo();
  } catch (e) {
    if (e instanceof Choque) {
      return json(
        {
          error:
            'Hay una versión más reciente. Recarga antes de guardar.',
          choque: true,
        },
        409,
      );
    }
    if (e instanceof SinConfigurar) {
      return json({ error: `el panel no está configurado: ${e.message}` }, 503);
    }
    console.error('[panel]', e);
    return json({ error: e.message ?? 'falló algo del lado del servidor' }, 500);
  }
}

/** Cuerpo JSON con un tope, para que un POST enorme no se lea entero. */
export async function leerCuerpo(request, topeBytes = 8 * 1024 * 1024) {
  const largo = Number(request.headers.get('content-length') ?? 0);
  if (largo > topeBytes) {
    throw new Error(`el cuerpo pesa ${(largo / 1e6).toFixed(1)} MB y el tope son ${(topeBytes / 1e6).toFixed(0)} MB`);
  }
  return request.json();
}
