/** Diff del borrador. Las listas de entidades se comparan por identidad, no por índice. */
const identidad = (x) => x?.id ?? x?.slug;
const objeto = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

export function normalizar(x) {
  if (Array.isArray(x)) {
    const elementos = x.map(normalizar);
    return x.every((v) => objeto(v) && identidad(v) != null)
      ? elementos.sort((a, b) => String(identidad(a)).localeCompare(String(identidad(b))))
      : elementos;
  }
  if (!objeto(x)) return x === '' || x === undefined ? null : x;
  return Object.fromEntries(Object.keys(x).sort().filter((k) => x[k] != null && x[k] !== '').map((k) => [k, normalizar(x[k])]));
}

export const equivalente = (a, b) => JSON.stringify(normalizar(a)) === JSON.stringify(normalizar(b));

const campos = {
  album: 'título', catalog: 'nº catálogo', date: 'fecha', artists: 'artistas',
  bcImageId: 'carátula', purchaseUrl: 'link de compra', listenUrl: 'link para escuchar',
  credits: 'créditos', note: 'nota', 'home.arte': 'arte de portada',
  'home.video.mp4': 'video', 'home.video.poster': 'póster', 'home.texto': 'texto de la grieta',
  title: 'título', text: 'extracto', url: 'enlace', display: 'nombre', aliases: 'alias',
  'highlight.article': 'artículo', 'highlight.image': 'imagen', 'highlight.imageAlt': 'texto alternativo',
  'ticker.label': 'etiqueta', 'ticker.text': 'texto', 'ticker.url': 'enlace',
  modo: 'modo', release: 'lanzamiento', azar: 'selección aleatoria',
  subtitle: 'nombre destacado', description: 'descripción', details: 'características',
  price: 'precio', buyUrl: 'enlace de compra', stock: 'stock', thumbnail: 'miniatura', images: 'fotos',
};
const etiqueta = (ruta) => campos[ruta] ?? ruta;
const titulo = (x, tipo) => x?.[tipo === 'releases' ? 'album' : tipo === 'artists' ? 'display' : 'title'] || identidad(x) || 'sin título';

function hojas(a, b, prefijo = '') {
  if (equivalente(a, b)) return [];
  if (objeto(a) && objeto(b)) {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => hojas(a[k], b[k], prefijo ? `${prefijo}.${k}` : k));
  }
  return [prefijo];
}

function registrar(lista, tipo, id, nombre, accion, campo = '', extra = '') {
  lista.push({ tipo, id, nombre, accion, campo, extra });
}

function entidades(lista, tipo, antes = [], despues = []) {
  const viejos = new Map(antes.map((x) => [identidad(x), x]));
  const nuevos = new Map(despues.map((x) => [identidad(x), x]));
  for (const [id, viejo] of viejos) if (!nuevos.has(id)) registrar(lista, tipo, id, titulo(viejo, tipo), 'eliminado');
  for (const [id, nuevo] of nuevos) {
    if (!viejos.has(id)) { registrar(lista, tipo, id, titulo(nuevo, tipo), 'creado'); continue; }
    for (const campo of hojas(viejos.get(id), nuevo)) {
      if (campo === 'id' || campo === 'slug') continue;
      registrar(lista, tipo, id, titulo(nuevo, tipo), campo === 'order' ? 'reordenado' : campo === 'visible' ? (nuevo.visible === false ? 'ocultado' : 'mostrado') : 'editado', campo);
    }
  }
}

export function cambiosDelBorrador(estado) {
  const base = (archivo) => {
    try { return JSON.parse(estado.base?.[archivo] ?? 'null'); } catch { return null; }
  };
  const lista = [];
  entidades(lista, 'releases', base('releases') ?? [], estado.releases ?? []);
  entidades(lista, 'artists', base('artists') ?? [], estado.artists ?? []);
  entidades(lista, 'merch', base('merch') ?? [], estado.merch ?? []);
  const viejoBlog = base('blog') ?? {};
  const blog = estado.blog ?? {};
  entidades(lista, 'blog', viejoBlog.items ?? [], blog.items ?? []);
  for (const seccion of ['highlight', 'ticker']) {
    for (const campo of hojas(viejoBlog[seccion] ?? {}, blog[seccion] ?? {}, seccion))
      registrar(lista, 'blog', '', seccion === 'ticker' ? 'Grieta' : 'Highlight', 'editado', campo);
  }
  for (const clave of new Set([...Object.keys(viejoBlog), ...Object.keys(blog)])) {
    if (['items', 'highlight', 'ticker'].includes(clave)) continue;
    for (const campo of hojas(viejoBlog[clave], blog[clave], clave))
      registrar(lista, 'blog', '', 'Blog', 'editado', campo);
  }
  for (const campo of hojas(base('home') ?? {}, estado.home ?? {}))
    registrar(lista, 'home', '', 'Home', 'editado', campo);
  for (const campo of hojas(base('about') ?? {}, estado.about ?? {}))
    registrar(lista, 'about', '', 'About', 'editado', campo);
  return lista;
}

export function textoCambio(c, ingles = false) {
  const tipo = c.tipo === 'releases' ? 'Release' : c.tipo === 'artists' ? (ingles ? 'Artist' : 'Artista') : c.tipo === 'merch' ? (ingles ? 'Product' : 'Producto') : c.tipo === 'blog' && c.id ? (ingles ? 'Article' : 'Artículo') : '';
  const nombre = tipo ? `${tipo} «${c.nombre}»` : c.nombre;
  const accion = ingles
    ? { creado: 'created', editado: 'edited', ocultado: 'hidden', mostrado: 'shown', reordenado: 'reordered', eliminado: 'deleted' }[c.accion]
    : { creado: 'creado', editado: 'editado', ocultado: 'ocultado', mostrado: 'mostrado', reordenado: 'reordenado', eliminado: 'eliminado' }[c.accion];
  return `${nombre}: ${accion}${c.campo && c.accion === 'editado' ? ` · ${etiqueta(c.campo)}` : ''}`;
}

/** Mantener la identidad aunque el orden del array cambie durante la navegación. */
export function destino(c) {
  const q = new URLSearchParams();
  if (c.tipo === 'about') return '/catalogo?contexto=About+no+tiene+editor+en+Studio';
  if (c.id && c.accion !== 'eliminado' && c.tipo !== 'artists') q.set('id', c.id);
  if (c.campo && c.accion !== 'eliminado') q.set('campo', c.campo);
  if (c.accion === 'eliminado') q.set('eliminado', c.nombre);
  if (c.tipo === 'artists') {
    const release = c.release;
    if (release && c.accion !== 'eliminado') { q.set('id', release); q.set('campo', 'artists'); }
    else { q.delete('campo'); q.set('eliminado', `artista ${c.nombre}`); }
  }
  const ruta = c.tipo === 'blog' ? '/blog' : c.tipo === 'merch' ? '/merca' : c.tipo === 'home' ? '/home' : '/catalogo';
  return `${ruta}${q.size ? `?${q}` : ''}`;
}

/** Los mensajes actuales del validador se convierten en destinos estables. */
export function destinoError(mensaje, estado) {
  let merch = /^merch\[(\d+)\]/.exec(mensaje);
  if (merch) {
    const p = estado.merch?.[Number(merch[1])];
    return p?.id ? destino({ tipo: 'merch', id: p.id, accion: 'editado' }) : '/merca';
  }
  let m = /^blog items\[(\d+)\]/.exec(mensaje);
  if (m) {
    const item = estado.blog?.items?.[Number(m[1])];
    if (!item?.id) return `/blog?contexto=${encodeURIComponent(`Artículo ${Number(m[1]) + 1} sin identificador: ${mensaje}`)}`;
    const campo = /`?(title|url|order|visible|id)`?/.exec(mensaje.split(':').slice(1).join(':'))?.[1] ?? 'title';
    return destino({ tipo: 'blog', id: item?.id, campo, accion: item ? 'editado' : 'eliminado', nombre: item?.title || 'artículo' });
  }
  m = /^blog (highlight|ticker):/.exec(mensaje);
  if (m) {
    const campo = /\b(article|image|imageAlt|label|text|url)\b/.exec(mensaje.split(':').slice(1).join(':'))?.[1] ?? '';
    return destino({ tipo: 'blog', campo: campo ? `${m[1]}.${campo}` : m[1], accion: 'editado' });
  }
  m = /^releases\[(\d+)\]/.exec(mensaje);
  if (m) {
    const r = estado.releases?.[Number(m[1])];
    if (!r?.id) return `/catalogo?contexto=${encodeURIComponent(`Lanzamiento ${Number(m[1]) + 1} sin identificador: ${mensaje}`)}`;
    const body = mensaje.split(':').slice(1).join(':');
    const campo = /\b(album|catalog|date|artists|bcImageId|purchaseUrl|listenUrl|credits|order|visible|home\.arte|home\.video\.mp4|home\.video\.poster)\b/.exec(body)?.[1]
      ?? (/\bhome\b/.test(mensaje.split(':')[0]) ? /poster/.test(body) ? 'home.video.poster' : /video|mp4/.test(body) ? 'home.video.mp4' : 'home.arte'
        : /artista|artistas/.test(body) ? 'artists' : /fecha/.test(body) ? 'date' : /imagen/.test(body) ? 'bcImageId' : 'album');
    return destino({ tipo: 'releases', id: r?.id, campo, accion: r ? 'editado' : 'eliminado', nombre: r?.album || 'lanzamiento' });
  }
  m = /^artists\[(\d+)\]/.exec(mensaje);
  if (m) {
    const a = estado.artists?.[Number(m[1])];
    const r = estado.releases?.find((x) => x.artists?.includes(a?.slug));
    return destino({ tipo: 'artists', release: r?.id, campo: 'artists', accion: r ? 'editado' : 'eliminado', nombre: a?.display || a?.slug || 'sin nombre' });
  }
  if (/^home\.json/.test(mensaje)) {
    const nombre = /^home\.json "([^"]+)"/.exec(mensaje)?.[1];
    const r = nombre && estado.releases?.find((x) => x.album === nombre);
    if (r && /imagen/.test(mensaje)) return destino({ tipo:'releases', id:r.id, campo:r.home?.arte ? 'home.arte' : 'bcImageId', accion:'editado' });
    return destino({ tipo: 'home', campo: /`azar`/.test(mensaje) ? 'azar' : /`release`|destacado|imagen/.test(mensaje) ? 'release' : 'modo', accion: 'editado' });
  }
  return null;
}
