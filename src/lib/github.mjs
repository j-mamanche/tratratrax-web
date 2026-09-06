/**
 * Escribir en el repo desde el servidor del panel.
 *
 * El panel no tiene base de datos: la base de datos es `data/*.json` en
 * `main`, igual que hoy. Guardar es hacer un commit por la Contents API de
 * GitHub, y publicar es lo que ya pasa solo — Actions corre, valida, compila y
 * empuja a Pages, y Cargo ve el dato nuevo en el siguiente fetch.
 *
 * Eso tiene una consecuencia que vale la pena tener presente: **entre guardar
 * y ver el cambio en el sitio pasa lo que tarde Actions**, un minuto largo. El
 * panel no miente sobre eso; la previsualización se hace contra el borrador
 * local, no contra Pages.
 *
 * El token **solo** vive aquí, en el servidor. Un PAT fine-grained con
 * `contents: write` sobre este repo y nada más. Nunca viaja al navegador, ni
 * siquiera dentro de la cookie de sesión.
 */

const API_POR_DEFECTO = 'https://api.github.com';

/** El sha no coincide: alguien más guardó entre que abrimos y guardamos. */
export class Choque extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'Choque';
  }
}

/** Falta configuración de entorno; se distingue de un fallo de la API. */
export class SinConfigurar extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'SinConfigurar';
  }
}

/**
 * Lee la configuración del entorno. En Astro esto es
 * `import.meta.env`, que en el build de servidor incluye las variables de
 * Netlify; en Node suelto es `process.env`.
 */
export function configDesde(env = {}) {
  const token = env.GITHUB_TOKEN || env.PANEL_GITHUB_TOKEN;
  const repo = env.GITHUB_REPO || 'j-mamanche/tratratrax-web';
  const rama = env.GITHUB_BRANCH || 'main';
  // Solo se cambia para probar el panel entero contra una API de mentira, sin
  // tocar el repo de verdad. En Netlify no se pone y queda la de siempre.
  const api = (env.GITHUB_API || API_POR_DEFECTO).replace(/\/$/, '');

  if (!token) {
    throw new SinConfigurar(
      'falta GITHUB_TOKEN — un PAT fine-grained con `contents: write` sobre este repo',
    );
  }
  if (!/^[^/]+\/[^/]+$/.test(repo)) {
    throw new SinConfigurar(`GITHUB_REPO "${repo}" no tiene la forma dueño/repo`);
  }

  return { token, repo, rama, api };
}

async function pedir(cfg, ruta, opciones = {}) {
  let res;
  try {
    res = await fetch(`${cfg.api ?? API_POR_DEFECTO}/repos/${cfg.repo}${ruta}`, {
      ...opciones,
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'tratratrax-panel',
        ...(opciones.body ? { 'Content-Type': 'application/json' } : null),
        ...opciones.headers,
      },
    });
  } catch (error) {
    // No incluimos el token, pero sí el host, que permite distinguir una API
    // local configurada por accidente de un problema de red real.
    throw new Error(`No se pudo conectar a GitHub (${cfg.api}): ${error.message}`);
  }

  if (res.ok) return res.json();

  const cuerpo = await res.text();
  const mensaje = (() => {
    try {
      return JSON.parse(cuerpo).message ?? cuerpo;
    } catch {
      return cuerpo;
    }
  })();

  // 409 es el choque de sha declarado; 422 es el que manda la API cuando el
  // sha es viejo pero el archivo sigue existiendo. Los dos son la misma
  // historia para el que está guardando: alguien te ganó.
  if (res.status === 409 || (res.status === 422 && /sha/i.test(mensaje))) {
    throw new Choque(mensaje);
  }

  throw new Error(`GitHub ${res.status}: ${mensaje}`);
}

/**
 * Lee un archivo del repo. Devuelve `null` si no existe —un `merch.json` que
 * todavía no se creó no es un error— y siempre trae el `sha`, que es lo que
 * después detecta el choque.
 */
export async function leer(cfg, ruta) {
  let datos;
  try {
    datos = await pedir(cfg, `/contents/${encodeURI(ruta)}?ref=${encodeURIComponent(cfg.rama)}`);
  } catch (e) {
    if (/GitHub 404/.test(e.message)) return null;
    throw e;
  }

  // Un archivo grande viene sin `content`; ninguno de los nuestros lo es, pero
  // si algún día lo fuera, mejor un error claro que un JSON.parse('').
  if (datos.content == null) {
    throw new Error(`"${ruta}" llegó sin contenido (¿pasa de 1 MB?)`);
  }

  const texto = new TextDecoder().decode(
    Uint8Array.from(atob(datos.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)),
  );

  return { sha: datos.sha, texto };
}

/** Lo mismo, ya parseado. `sha` viaja aparte porque el JSON no lo lleva. */
export async function leerJson(cfg, ruta) {
  const archivo = await leer(cfg, ruta);
  if (!archivo) return null;
  try {
    return { sha: archivo.sha, valor: JSON.parse(archivo.texto) };
  } catch (e) {
    throw new Error(`"${ruta}" no es JSON válido en la rama ${cfg.rama} — ${e.message}`);
  }
}

const aBase64 = (bytes) => {
  let s = '';
  // De a pedazos: `String.fromCharCode(...bytes)` con un mp4 entero revienta
  // la pila de argumentos.
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
};

/**
 * Escribe un archivo y devuelve el sha nuevo.
 *
 * `sha` es obligatorio para sobrescribir y **se omite para crear**. Mandar uno
 * viejo lanza `Choque`, que es exactamente lo que queremos: dos pestañas
 * abiertas sobre el mismo release no se pisan en silencio.
 */
export async function escribir(cfg, { ruta, contenido, sha, mensaje }) {
  const bytes =
    typeof contenido === 'string' ? new TextEncoder().encode(contenido) : contenido;

  const datos = await pedir(cfg, `/contents/${encodeURI(ruta)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: mensaje,
      content: aBase64(bytes),
      branch: cfg.rama,
      ...(sha ? { sha } : null),
    }),
  });

  return datos.content.sha;
}

/** Escribe JSON con el formato del repo: dos espacios y salto final. */
export function serializar(valor) {
  return JSON.stringify(valor, null, 2) + '\n';
}
