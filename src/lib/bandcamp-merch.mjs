/** Lectura pública de productos de Bandcamp. Solo servidor; no escribe en Cargo. */
import { slugify } from './bandcamp.mjs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36';
const entities = { amp: '&', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', ldquo: '“', rdquo: '”' };
const decode = (s = '') => s.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, k) => {
  if (k[0] === '#') return String.fromCodePoint(k[1]?.toLowerCase() === 'x' ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10));
  return entities[k.toLowerCase()] ?? m;
});
const plain = (s = '') => decode(s.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, ''))
  .replace(/\r/g, '').split('\n').map((x) => x.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
const one = (html, re) => html.match(re)?.[1] ?? '';
const abs = (value, base) => value ? new URL(decode(value), base).href : '';
const photo = (value) => value.replace(/_(?:36|37|38)\.(jpg|png|webp)$/i, '_10.$1');

export function validarUrlMerch(value) {
  let u;
  try { u = new URL(value); } catch { throw new Error('Eso no es una URL válida.'); }
  if (u.protocol !== 'https:' || !/(^|\.)bandcamp\.com$/.test(u.hostname))
    throw new Error('Pega una URL HTTPS de Bandcamp.');
  if (!/^\/(merch(?:\/[^/]+)?|album\/[^/]+)\/?$/.test(u.pathname))
    throw new Error('La URL debe apuntar a /merch, /merch/producto o /album/disco.');
  return u;
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Bandcamp respondió ${res.status} para ${url}.`);
  const final = new URL(res.url);
  // Bandcamp puede redirigir a un dominio personalizado (p. ej. tratratrax.com).
  if (final.protocol !== 'https:' || (!/(^|\.)bandcamp\.com$/.test(final.hostname) && final.hostname !== 'tratratrax.com'))
    throw new Error('Bandcamp redirigió a un dominio inesperado.');
  return { html: await res.text(), final: final.href };
}

/** La vitrina incluye un producto destacado fuera de #merch-grid. */
export async function listarMerch(url) {
  const u = validarUrlMerch(url);
  if (u.pathname.replace(/\/$/, '') !== '/merch') throw new Error('Esta URL no es un listado de merca.');
  const { html, final } = await fetchHtml(u.href);
  const section = html.slice(html.indexOf('featured-merch'));
  const featured = one(section, /<li class='featured-item[^']*'>([\s\S]*?)<\/li>/);
  const grid = html.slice(html.indexOf('<ol id="merch-grid"'));
  const blocks = [...grid.matchAll(/<li data-item-id="(\d+)"([\s\S]*?)<\/li>/g)]
    .map((m) => ({ itemId: m[1], html: m[2] }));
  if (featured) {
    const href = one(featured, /<a href='([^']+)'/);
    const match = blocks.find((b) => one(b.html, /<a href="([^"]+)"/) === href);
    if (match) { blocks.splice(blocks.indexOf(match), 1); blocks.unshift(match); }
  }
  if (!blocks.length) throw new Error('No se encontraron productos en la página de Bandcamp.');
  return blocks.map(({ itemId, html: h }, order) => {
    const rawTitle = one(h, /<p class="title">([\s\S]*?)<\/p>/);
    const artist = plain(one(rawTitle, /<span class="artist-override">([\s\S]*?)<\/span>/));
    const withoutArtist = plain(rawTitle.replace(/<br>\s*<span class="artist-override">[\s\S]*?<\/span>/, '')).replace(/\n+/g, ' ');
    const split = withoutArtist.split(/\s+[–—]\s+/, 2);
    return ({
    itemId,
    url: abs(one(h, /<a href="([^"]+)"/), final),
    title: split[0], subtitle: split[1] || '', artist,
    price: plain(one(h, /<p class="price[^"]*">([\s\S]*?)<\/p>/)).replace(/\s+/g, ' '),
    thumbnail: abs(one(h, /<img src="(https:\/\/[^" ]+\.(?:jpg|png|webp))"/), final),
    order,
    });
  });
}

/** Un producto directo /merch/*, o el formato físico de una página /album/*. */
export async function importarMerch(url, { itemId = '', listado = null } = {}) {
  const u = validarUrlMerch(url);
  if (u.pathname.replace(/\/$/, '') === '/merch') throw new Error('Pega la URL de un producto concreto.');
  const { html, final } = await fetchHtml(u.href);
  const isAlbum = u.pathname.startsWith('/album/');
  let title, description, images, details, price, stock;
  if (isAlbum) {
    const id = itemId || one(html, /id="package-title-(\d+)"/);
    if (!id) throw new Error('Este álbum no tiene un formato físico reconocible.');
    const pos = html.indexOf(`id="package-title-${id}"`);
    if (pos < 0) throw new Error(`No se encontró el formato físico ${id} en el álbum.`);
    const pricePos = html.indexOf(`id="package-price-${id}"`, pos);
    const body = html.slice(pos, pricePos > pos ? pricePos + 4000 : pos + 12000);
    title = listado?.title || plain(one(body, /<span class="buyItemPackageTitle[^>]*">([\s\S]*?)<\/span>/));
    description = '';
    images = [...body.matchAll(/class="popupImage" href="([^"]+)"/g)].map((m) => abs(m[1], final));
    details = [...body.matchAll(/<div class="buyItemEdition[^>]*">([\s\S]*?)<\/div>/g)]
      .map((m) => plain(m[1]).replace(/\s+/g, ' ')).filter(Boolean);
    if (listado?.artist) details.unshift(listado.artist);
    price = listado?.price || plain(one(body, /<span class="base-text-color">([^<]+)<\/span>/));
    stock = /Sold Out/i.test(listado?.price || '') || /<h4 class="notable">\s*Sold Out/i.test(body) ? 'out-of-stock' : 'in-stock';
  } else {
    const body = html.slice(html.indexOf('<div id="merch-item"'), html.indexOf('<div class="more-merch-container"'));
    if (!body) throw new Error('No se encontró la ficha del producto.');
    title = plain(one(body, /<h2 class="title">([\s\S]*?)<\/h2>/));
    description = plain(one(body, /<p class="package-desc">([\s\S]*?)<\/p>/));
    images = [...body.matchAll(/class="popupImage" href="([^"]+)"/g)].map((m) => abs(m[1], final));
    details = [...body.matchAll(/<div class="buyItemEdition[^>]*">([\s\S]*?)<\/div>/g)]
      .map((m) => plain(m[1]).replace(/\s+/g, ' ')).filter(Boolean);
    price = listado?.price || plain(one(body, /<span class="base-text-color">([^<]+)<\/span>/));
    stock = /<h4 class="notable">\s*Sold Out/i.test(body) ? 'out-of-stock' : 'in-stock';
  }
  if (!title) throw new Error('Bandcamp no devolvió un título para este producto.');
  const sourceUrl = `${u.origin}${u.pathname.replace(/\/$/, '')}`;
  const sourceId = itemId || one(html, /id="package-price-(\d+)"/);
  return {
    id: slugify(title) || `merch-${itemId}`,
    title, subtitle: isAlbum ? (listado?.subtitle || '') : '', description, details, price: /Sold Out/i.test(price) ? '' : price,
    buyUrl: final, sourceUrl, sourceItemId: sourceId, stock,
    thumbnail: images[0] || photo(listado?.thumbnail || ''), images,
    order: listado?.order ?? 0, visible: false,
  };
}
