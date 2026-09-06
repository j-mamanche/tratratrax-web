/**
 * La puerta del panel: una contraseña, una cookie firmada, nada más.
 *
 * El staff del sello son tres personas. No hay cuentas, no hay roles, no hay
 * recuperación de contraseña — hay una clave que se comparte y se cambia
 * poniendo otra variable de entorno. Lo que sí no se negocia:
 *
 * - **La cookie no guarda el token de GitHub.** Guarda una sesión firmada con
 *   `PANEL_SECRET`, y el token vive solo en el servidor. Si alguien roba la
 *   cookie tiene un panel abierto hasta que expire, no una llave del repo.
 * - **La comparación de la contraseña es de tiempo constante.** No porque
 *   alguien vaya a medir microsegundos contra Netlify, sino porque hacerlo
 *   bien cuesta seis líneas y hacerlo mal es de las cosas que después nadie
 *   vuelve a mirar.
 * - **HttpOnly + Secure + SameSite=Strict.** El panel no tiene nada que
 *   necesite leer la cookie desde JS, y no hay ningún flujo que llegue desde
 *   otro sitio.
 */

const VIDA = 12 * 60 * 60; // 12 h en segundos: una jornada, no una semana
export const COOKIE = 'ttx_panel';

const b64url = {
  cifrar: (bytes) =>
    btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
  descifrar: (s) => {
    const base = s.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(base + '='.repeat((4 - (base.length % 4)) % 4)), (c) =>
      c.charCodeAt(0),
    );
  },
};

const texto = new TextEncoder();

async function clave(secreto) {
  return crypto.subtle.importKey(
    'raw',
    texto.encode(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function hmac(secreto, mensaje) {
  const firma = await crypto.subtle.sign('HMAC', await clave(secreto), texto.encode(mensaje));
  return new Uint8Array(firma);
}

/**
 * Comparación de tiempo constante sin `node:crypto`: se firman los dos valores
 * con una clave de un solo uso y se comparan las firmas. Dos firmas siempre
 * miden lo mismo, así que la comparación no filtra ni el largo ni el prefijo.
 */
export async function iguales(a, b) {
  const efimera = b64url.cifrar(crypto.getRandomValues(new Uint8Array(32)));
  const [fa, fb] = await Promise.all([hmac(efimera, a ?? ''), hmac(efimera, b ?? '')]);
  let dif = 0;
  for (let i = 0; i < fa.length; i++) dif |= fa[i] ^ fb[i];
  return dif === 0;
}

/** `<carga>.<firma>`, con la expiración adentro y firmada. */
export async function firmar(secreto, datos = {}) {
  const carga = b64url.cifrar(
    texto.encode(JSON.stringify({ ...datos, exp: Math.floor(Date.now() / 1000) + VIDA })),
  );
  return `${carga}.${b64url.cifrar(await hmac(secreto, carga))}`;
}

/** Devuelve la carga si la firma es buena y no expiró; si no, `null`. */
export async function verificar(secreto, token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;

  const [carga, firma] = token.split('.');
  if (!(await iguales(firma, b64url.cifrar(await hmac(secreto, carga))))) return null;

  try {
    const datos = JSON.parse(new TextDecoder().decode(b64url.descifrar(carga)));
    return datos.exp > Math.floor(Date.now() / 1000) ? datos : null;
  } catch {
    return null;
  }
}

/** La cookie tal cual va en `Set-Cookie`. `token` vacío la borra. */
export function cabecera(token) {
  const partes = [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict',
    `Max-Age=${token ? VIDA : 0}`,
  ];
  return partes.join('; ');
}

export function cookieDe(request) {
  const crudo = request.headers.get('cookie') ?? '';
  for (const par of crudo.split(';')) {
    const [k, ...v] = par.trim().split('=');
    if (k === COOKIE) return v.join('=');
  }
  return null;
}

/** ¿Esta petición trae sesión buena? */
export async function haySesion(request, env) {
  const secreto = env?.PANEL_SECRET;
  if (!secreto) return false;
  return Boolean(await verificar(secreto, cookieDe(request)));
}

// ─── límite de intentos ──────────────────────────────────────────────────────
//
// En memoria del proceso. En una función serverless eso significa **por
// instancia**, así que no es una defensa dura: un atacante con paciencia puede
// caer en instancias frías. Sirve para lo que de verdad pasa —alguien
// probando a mano, un script tonto— y el costo es cero. La defensa real es que
// la contraseña sea larga; eso es una decisión del sello, no del código.

const intentos = new Map();
const VENTANA = 15 * 60 * 1000;
const TOPE = 8;

export function ipDe(request, clientAddress) {
  return (
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    clientAddress ??
    'desconocida'
  );
}

/** `null` si puede intentar; los segundos que faltan si ya se pasó. */
export function frenado(ip) {
  const registro = intentos.get(ip);
  if (!registro) return null;
  if (Date.now() > registro.hasta) {
    intentos.delete(ip);
    return null;
  }
  return registro.fallos >= TOPE ? Math.ceil((registro.hasta - Date.now()) / 1000) : null;
}

export function anotarFallo(ip) {
  const registro = intentos.get(ip) ?? { fallos: 0, hasta: 0 };
  registro.fallos += 1;
  registro.hasta = Date.now() + VENTANA;
  intentos.set(ip, registro);
}

export function limpiarFallos(ip) {
  intentos.delete(ip);
}

/**
 * Todas las respuestas del login tardan lo mismo, salga bien o mal. El HMAC de
 * arriba ya iguala la comparación; esto iguala el resto de la ruta.
 */
export async function pisoDeTiempo(desde, ms = 400) {
  const falta = ms - (Date.now() - desde);
  if (falta > 0) await new Promise((r) => setTimeout(r, falta));
}
