import './merca.css';
import { registrar } from '../_runtime/mount.js';
import { urlMedia } from '../_runtime/datos.js';

const STOCK = {
  'in-stock': 'IN STOCK',
  'few-units': 'FEW UNITS',
  'out-of-stock': 'SOLD OUT',
};

const nodo = (tag, clase, texto) => {
  const el = document.createElement(tag);
  if (clase) el.className = clase;
  if (texto != null) el.textContent = texto;
  return el;
};

/** Vitrina y ficha en una sola página Cargo. Solo se activa en el placeholder de prueba. */
registrar('merca-lab', async (host) => {
  const script = document.querySelector('script[data-ttx-datos], script[src*="ttx.js"]');
  const base = script?.dataset.ttxDatos
    ? new URL(script.dataset.ttxDatos, location.href)
    : new URL('data/', new URL('.', script?.src || location.href));
  const respuesta = await fetch(new URL('merch.json', base));
  if (!respuesta.ok) throw new Error(`merch.json: ${respuesta.status}`);
  const datos = await respuesta.json();
  const mostrarBorradores = host.hasAttribute('data-ttx-borradores');
  const items = datos.filter((p) => mostrarBorradores || p.visible === true)
    .sort((a, b) => a.order - b.order);

  const app = nodo('div', 'ttx-merca');
  const banda = nodo('header', 'ttx-merca-banda');
  const nombre = nodo('b', '', 'MERCA');
  const volverBoton = nodo('button', 'ttx-merca-volver', '← VOLVER A MERCA');
  volverBoton.type = 'button';
  volverBoton.hidden = true;
  volverBoton.addEventListener('click', (event) => { event.stopPropagation(); vitrina(); });
  const cierre = nodo('a', 'ttx-merca-cerrar', 'CIÉRRAME');
  cierre.href = '#';
  cierre.setAttribute('rel', 'close-overlay');
  banda.append(nombre, volverBoton, cierre);
  const cuerpo = nodo('div', 'ttx-merca-cuerpo');
  app.append(banda, cuerpo);
  host.replaceChildren(app);

  let pararGalerias = () => {};
  const modo = (id) => {
    const p = items.find((x) => x.id === id);
    if (!p) return vitrina();
    pararGalerias();
    app.classList.add('is-detail');
    nombre.hidden = true;
    volverBoton.hidden = false;
    cuerpo.replaceChildren();
    const detalle = nodo('article', 'ttx-merca-detalle');
    const texto = nodo('div', 'ttx-merca-texto');
    const estado = nodo('p', `ttx-merca-estado ttx-merca-${p.stock}`, STOCK[p.stock] || '');
    const titulo = nodo('h1', '', p.title || 'Sin título');
    if (p.subtitle) titulo.append(nodo('strong', '', `__${p.subtitle}`));
    const descripcion = nodo('p', 'ttx-merca-descripcion', p.description || '');
    const especificaciones = nodo('ul', 'ttx-merca-datos');
    for (const linea of p.details || []) if (linea.trim()) especificaciones.append(nodo('li', '', linea));
    texto.append(estado, titulo, descripcion, especificaciones);
    const compra = p.stock === 'out-of-stock'
      ? nodo('span', 'ttx-merca-compra ttx-merca-agotado', 'SOLD OUT')
      : p.buyUrl ? nodo('a', 'ttx-merca-compra', `${p.price ? `${p.price}__` : ''}BUY`)
        : nodo('span', 'ttx-merca-compra ttx-merca-sinlink', 'COMPRA PENDIENTE');
    if (compra.tagName === 'A') {
      compra.href = p.buyUrl;
      compra.target = '_blank';
      compra.rel = 'noopener noreferrer';
    }
    texto.append(compra);
    const imagenes = (p.images?.length ? p.images : [p.thumbnail]).filter(Boolean);
    const galerias = [crearGaleria(imagenes, p.title, 0, 2400)];
    if (imagenes.length > 1) galerias.push(crearGaleria(imagenes, p.title, 1, 2600));
    else galerias.push({ el: nodo('div', 'ttx-merca-imagenes ttx-merca-imagenes-vacia'), parar() {} });
    pararGalerias = () => galerias.forEach((g) => g.parar());
    detalle.append(texto, ...galerias.map((g) => g.el));
    cuerpo.append(detalle);
    cuerpo.scrollTop = 0;
  };

  function vitrina() {
    pararGalerias();
    app.classList.remove('is-detail');
    nombre.hidden = false;
    volverBoton.hidden = true;
    cuerpo.replaceChildren();
    if (!items.length) {
      cuerpo.append(nodo('p', 'ttx-merca-vacia', mostrarBorradores
        ? 'Todavía no hay productos en Studio.'
        : 'Todavía no hay productos publicados.'));
      return;
    }
    const grid = nodo('div', 'ttx-merca-grid');
    for (const p of items) {
      const card = nodo('button', `ttx-merca-tarjeta ttx-merca-${p.stock}`);
      card.type = 'button';
      if (p.visible === false) card.dataset.borrador = '';
      const imagen = nodo('span', 'ttx-merca-miniatura');
      const img = nodo('img');
      const src = p.thumbnail || p.images?.[0];
      if (src) img.src = urlMedia(src);
      img.alt = '';
      img.loading = 'lazy';
      imagen.append(img);
      const caption = nodo('span', 'ttx-merca-caption');
      caption.append(nodo('span', '', [p.title, p.subtitle].filter(Boolean).join(' ')), nodo('span', 'ttx-merca-punto'));
      card.append(imagen, caption);
      card.addEventListener('click', (event) => { event.stopPropagation(); modo(p.id); });
      grid.append(card);
    }
    cuerpo.append(grid);
  }

  const inicial = host.dataset.mercaItem || new URL(location.href).searchParams.get('ttx-product');
  if (inicial && items.some((p) => p.id === inicial)) modo(inicial);
  else vitrina();
  return { destruir() { pararGalerias(); } };
});

function crearGaleria(imagenes, titulo, inicial, intervalo) {
  const el = nodo('div', 'ttx-merca-imagenes');
  const fotos = imagenes.map((src, i) => {
    const img = nodo('img', 'ttx-merca-foto');
    img.src = urlMedia(src);
    img.alt = `${titulo || 'Producto'} · imagen ${i + 1}`;
    img.loading = i === inicial ? 'eager' : 'lazy';
    img.decoding = 'async';
    return img;
  });
  let indice = fotos.length ? inicial % fotos.length : 0;
  const mostrar = () => fotos.forEach((img, i) => { img.hidden = i !== indice; });
  el.append(...fotos);
  mostrar();
  let timer = null;
  if (fotos.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    timer = setInterval(() => { indice = (indice + 1) % fotos.length; mostrar(); }, intervalo);
  }
  return { el, parar: () => { if (timer) clearInterval(timer); } };
}
