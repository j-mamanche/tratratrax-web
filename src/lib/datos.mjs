/**
 * El modelo que el panel edita, leído y escrito contra el repo.
 *
 * Es la misma capa de `data/*.json` de siempre, vista desde el servidor: los
 * cuatro archivos con su `sha`, y una revisión antes de guardar.
 *
 * **Por qué se revisa aquí si ya existe `tools/validate.mjs`.** El validador
 * corre en Actions y es la última palabra: si algo está mal, el build falla y
 * Pages no publica. Pero eso, visto desde el panel, es lo peor que puede
 * pasar — el sello guarda, ve el commit, y el sitio se queda congelado en la
 * versión anterior sin que nadie se entere hasta que alguien mire Actions.
 *
 * Así que aquí se repite el subconjunto de **errores** que el panel puede
 * llegar a causar, sobre los campos que el panel edita. No es una segunda
 * implementación del validador: es la puerta, para que lo que se commitea ya
 * venga bueno. Los **avisos** —falta `listenUrl`, huecos de numeración, TRA028
 * repetido— no bloquean nada; se muestran, que es justamente lo que el sello
 * necesita ver.
 */

import { leer, leerJson, escribir, serializar, Choque } from './github.mjs';

export { Choque };

export const ARCHIVOS = {
  releases: 'data/releases.json',
  artists: 'data/artists.json',
  home: 'data/home.json',
  about: 'data/about.json',
  blog: 'data/blog.json',
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const BC_IMAGE = /^a\d+$/;

const fechaReal = (s) => {
  if (!ISO.test(s ?? '')) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

const esHttp = (s) => {
  try {
    return ['http:', 'https:'].includes(new URL(s).protocol);
  } catch {
    return false;
  }
};

/**
 * Los cuatro archivos con su sha. El sha es lo que después detecta que alguien
 * más guardó mientras esta pestaña estaba abierta, así que viaja al formulario
 * y vuelve con él.
 */
export async function cargarTodo(cfg) {
  const [releases, artists, home, about, blog] = await Promise.all(
    Object.values(ARCHIVOS).map((r) => leerJson(cfg, r)),
  );

  return {
    releases: releases ?? { sha: null, valor: [] },
    artists: artists ?? { sha: null, valor: [] },
    home: home ?? { sha: null, valor: { modo: 'auto' } },
    about: about ?? { sha: null, valor: null },
    blog: blog ?? { sha: null, valor: { ticker: '', items: [] } },
  };
}

/**
 * Qué hay dentro de `media/` en el repo, en una sola llamada.
 *
 * Es el equivalente del `existsSync` de `validate.mjs:revisarMedia`. Sin esto
 * el panel dejaría guardar un `home.arte` que apunta a un archivo que nadie
 * subió, y el error saldría en Actions veinte minutos después.
 */
export async function listarMedia(cfg) {
  const res = await fetch(
    `${cfg.api}/repos/${cfg.repo}/git/trees/${encodeURIComponent(cfg.rama)}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'tratratrax-panel',
      },
    },
  );
  if (!res.ok) return null; // sin lista no se revisan rutas; no es motivo para no guardar
  const datos = await res.json();
  return new Set((datos.tree ?? []).filter((n) => n.type === 'blob').map((n) => n.path));
}

function revisarMedia(errores, donde, campo, ruta, media) {
  if (!ruta) return;
  if (esHttp(ruta)) return;
  if (ruta.startsWith('/')) {
    errores.push(`${donde}: ${campo} "${ruta}" es absoluta — se espera una ruta del repo, como "media/tra032.mp4"`);
    return;
  }
  if (media && !media.has(ruta)) {
    errores.push(`${donde}: ${campo} apunta a "${ruta}", que no está en el repo`);
  }
}

/**
 * Revisa lo que el panel está a punto de commitear.
 *
 * `media` es el `Set` de `listarMedia()`, o `null` para no revisar rutas.
 * Devuelve `{ errores, avisos }`: los errores impiden guardar, los avisos se
 * pintan al lado del campo.
 */
export function revisar({ releases = [], artists = [], home = null, blog = null }, media = null) {
  const errores = [];
  const avisos = [];

  // ── artistas ──
  const slugs = new Set();
  for (const [i, a] of artists.entries()) {
    const at = `artists[${i}]`;
    if (!a.slug) errores.push(`${at}: falta \`slug\``);
    else if (!SLUG.test(a.slug)) errores.push(`${at}: slug "${a.slug}" debe ser minúsculas y guiones`);
    else if (slugs.has(a.slug)) errores.push(`${at}: slug duplicado "${a.slug}"`);
    else slugs.add(a.slug);

    if (!a.display) errores.push(`${at}: falta \`display\``);
    // La regla del proyecto: nada de guiones separando nombres en `display`.
    // Las grafías viejas de Bandcamp van en `aliases`, que es para lo que son.
    else if (/\S-\S/.test(a.display)) {
      avisos.push(`${at}: "${a.display}" lleva guion — en \`display\` se escribe "Nick León", no "Nick-León"`);
    }
  }

  // ── releases ──
  const ids = new Set();
  const catalogos = new Map();
  const hoy = new Date().toISOString().slice(0, 10);

  for (const [i, r] of releases.entries()) {
    const at = `releases[${i}] "${r.album ?? '¿?'}"`;

    if (!r.id) errores.push(`${at}: falta \`id\``);
    else if (!SLUG.test(r.id)) errores.push(`${at}: id "${r.id}" debe ser minúsculas y guiones`);
    else if (ids.has(r.id)) errores.push(`${at}: id duplicado "${r.id}"`);
    else ids.add(r.id);

    if (!r.album) errores.push(`${at}: falta \`album\``);

    if (r.catalog) {
      if (catalogos.has(r.catalog)) {
        avisos.push(`${at}: número de catálogo "${r.catalog}" repetido — también lo usa "${catalogos.get(r.catalog)}"`);
      } else catalogos.set(r.catalog, r.album);
    }

    if (!Array.isArray(r.artists) || r.artists.length === 0) {
      errores.push(`${at}: necesita al menos un artista`);
    } else {
      for (const s of r.artists) {
        if (!slugs.has(s)) errores.push(`${at}: artista "${s}" no existe en artists.json`);
      }
    }

    if (!fechaReal(r.date)) errores.push(`${at}: fecha inválida "${r.date}" — se espera AAAA-MM-DD`);
    else if (r.date > hoy && r.visible !== false) avisos.push(`${at}: fecha en el futuro (${r.date})`);

    if (r.bcImageId || r.visible !== false) {
      if (!BC_IMAGE.test(r.bcImageId ?? '')) {
        errores.push(`${at}: bcImageId inválido "${r.bcImageId}" — se espera algo como a750972864`);
      }
    } else if (!r.home?.arte) {
      errores.push(`${at}: sin \`bcImageId\` y sin \`home.arte\` — no hay ninguna imagen que mostrar`);
    }

    if (!r.purchaseUrl) avisos.push(`${at}: sin \`purchaseUrl\``);
    else if (!esHttp(r.purchaseUrl)) errores.push(`${at}: purchaseUrl no es una URL válida: "${r.purchaseUrl}"`);

    if (!r.listenUrl) avisos.push(`${at}: sin \`listenUrl\``);
    else if (!esHttp(r.listenUrl)) errores.push(`${at}: listenUrl no es una URL válida: "${r.listenUrl}"`);

    // Un crédito es una junta `Rol__ Valor` o una línea suelta. Lo que no
    // puede ser es media junta: un `__` colgando o un valor sin rótulo.
    for (const [j, c] of (r.credits ?? []).entries()) {
      if (c?.role && c?.name) continue;
      if (typeof c?.texto === 'string' && c.texto.trim()) continue;
      errores.push(`${at} credits[${j}]: o \`role\` y \`name\`, o una línea suelta en \`texto\``);
    }

    if (r.home) {
      // `arte` ya no es obligatorio: sin él la portada usa la carátula de
      // Bandcamp, que es la imagen que el release ya trae. Lo que sí se revisa
      // es que, si lo escribieron, el archivo exista.
      revisarMedia(errores, `${at} home`, '`arte`', r.home.arte, media);

      if (r.home.video) {
        if (!r.home.video.mp4) errores.push(`${at} home: hay \`video\` pero sin \`mp4\``);
        revisarMedia(errores, `${at} home`, '`video.mp4`', r.home.video.mp4, media);
        revisarMedia(errores, `${at} home`, '`video.poster`', r.home.video.poster, media);
        if (!r.home.video.poster) avisos.push(`${at} home: sin \`video.poster\``);
      }

      if (r.home.relleno) avisos.push(`${at} home: material de prueba (\`relleno\`)`);
    }

    if (typeof r.order !== 'number') errores.push(`${at}: falta \`order\` (número)`);
    if (typeof r.visible !== 'boolean') errores.push(`${at}: falta \`visible\` (true/false)`);
  }

  // ── home ──
  if (home) {
    const modo = home.modo ?? (home.release ? 'fijo' : 'auto');
    if (home.destacado) {
      errores.push('home.json: todavía tiene `destacado` — el material se mudó al bloque `home` del release');
    }
    if (!['fijo', 'auto'].includes(modo)) {
      errores.push(`home.json: modo "${home.modo}" desconocido — se espera fijo | auto`);
    } else if (modo === 'fijo') {
      const r = releases.find((x) => x.id === home.release);
      if (!home.release) errores.push('home.json: modo `fijo` sin `release` — falta decir cuál');
      else if (!r) errores.push(`home.json: \`release\` "${home.release}" no existe en releases.json`);
      else if (!r.home?.arte && !r.bcImageId) errores.push(`home.json "${r.album}": el destacado no tiene imagen —ni \`home.arte\` ni carátula de Bandcamp— y el home caería al respaldo`);
      else if (!r.home?.video?.mp4) avisos.push(`home.json "${r.album}": sin \`home.video\` — el home se queda quieto`);
    } else if (!releases.filter(cumple).length) {
      avisos.push('home.json: modo `auto` y ningún release cumple — el home usa el respaldo automático');
    }

    // `azar` acota el sorteo. Un id que no existe es un error —alguien borró el
    // release y la lista se quedó apuntándole—; uno que existe pero ya no
    // cumple es solo un aviso, porque el sitio lo salta sin romperse.
    if (home.azar != null) {
      if (!Array.isArray(home.azar)) errores.push('home.json: `azar` tiene que ser una lista de ids');
      else {
        for (const id of home.azar) {
          const r = releases.find((x) => x.id === id);
          if (!r) errores.push(`home.json: \`azar\` nombra "${id}", que no existe en releases.json`);
          else if (!cumple(r)) avisos.push(`home.json: "${r.album}" está en \`azar\` pero no cumple — el sorteo lo salta`);
        }
        if (modo === 'auto' && home.azar.length && !home.azar.some((id) => cumple(releases.find((x) => x.id === id)))) {
          avisos.push('home.json: ninguno de los marcados en `azar` cumple — el sorteo cae a todos los que puedan');
        }
      }
    }
  }

  // ── blog ──
  if (blog) {
    if (!Array.isArray(blog.items)) errores.push('blog.json: `items` debe ser una lista');
    else {
      const idsBlog = new Set();
      for (const [i, item] of blog.items.entries()) {
        const at = `blog items[${i}] "${item?.title ?? '¿?'}"`;
        if (!SLUG.test(item?.id ?? '')) errores.push(`${at}: id inválido`);
        else if (idsBlog.has(item.id)) errores.push(`${at}: id duplicado "${item.id}"`);
        else idsBlog.add(item.id);
        if (!item?.title) errores.push(`${at}: falta \`title\``);
        if (!item?.text) avisos.push(`${at}: sin texto`);
        if (item?.url && !esHttp(item.url)) errores.push(`${at}: url no es válida`);
        if (typeof item?.order !== 'number') errores.push(`${at}: falta \`order\``);
        if (typeof item?.visible !== 'boolean') errores.push(`${at}: falta \`visible\``);
      }
      const elegido = blog.highlight?.article;
      if (elegido && !idsBlog.has(elegido)) errores.push(`blog highlight: article "${elegido}" no existe`);
      if (blog.highlight?.image && !esHttp(blog.highlight.image) && !blog.highlight.image.startsWith('media/')) errores.push('blog highlight: image debe ser una URL o ruta media/');
      if (blog.ticker?.url && !esHttp(blog.ticker.url)) errores.push('blog ticker: url no es válida');
    }
  }

  return { errores, avisos };
}

/**
 * La misma regla de `format.js:cumpleHome`, repetida aquí a propósito: aquel
 * módulo es del bundle del navegador e importa CSS, y arrastrarlo al servidor
 * del panel traería medio widget detrás. Si la regla cambia, cambia en los dos
 * sitios — por eso está escrita cortita y con el nombre igual.
 */
export const cumple = (r) =>
  Boolean(
    r?.visible &&
      (r?.home?.arte || r?.bcImageId) &&
      (r?.home?.texto || (r?.album && r?.artists?.length)),
  );

/** Guarda un archivo del modelo. Lanza `Choque` si el sha ya no es el bueno. */
export async function guardar(cfg, { archivo, valor, sha, mensaje }) {
  const ruta = ARCHIVOS[archivo];
  if (!ruta) throw new Error(`archivo desconocido "${archivo}"`);
  return escribir(cfg, { ruta, contenido: serializar(valor), sha, mensaje });
}

/** Sube material a `media/`. `base64` viene del navegador ya comprimido. */
export async function subirMedia(cfg, { ruta, base64, mensaje, sha }) {
  if (!ruta.startsWith('media/')) throw new Error('el material propio va en `media/`, no en otra parte');
  if (/\.\./.test(ruta)) throw new Error(`ruta sospechosa: "${ruta}"`);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  await escribir(cfg, { ruta, contenido: bytes, sha, mensaje });
  return { ruta, bytes: bytes.length };
}

/** ¿Ya existe ese archivo en `media/`? Devuelve su sha, para poder pisarlo. */
export async function shaDe(cfg, ruta) {
  const archivo = await leer(cfg, ruta).catch(() => null);
  return archivo?.sha ?? null;
}
