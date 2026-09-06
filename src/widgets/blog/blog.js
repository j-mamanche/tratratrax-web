import { registrar } from '../_runtime/mount.js';
import { elemento } from '../_runtime/dom.js';
import { urlMedia } from '../_runtime/datos.js';
import './blog.css';

async function cargarBlog() {
  const script = document.querySelector('script[src*="ttx.js"], script[data-ttx-datos]');
  const base = script?.dataset?.ttxDatos ? new URL(script.dataset.ttxDatos, location.href) : new URL('data/', script?.src ?? location.href);
  const res = await fetch(new URL('blog.json', base));
  if (!res.ok) throw new Error(`blog.json (${res.status})`);
  return res.json();
}
function enlace(item) {
  return elemento(item.url ? 'a' : 'span', item.url ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {}, item.title);
}
function tarjeta(item, highlight = false) {
  return elemento('article', { class: `ttx-blog-card${highlight ? ' ttx-blog-highlight-copy' : ''}` },
    elemento(highlight ? 'h1' : 'b', { class: 'ttx-blog-title' }, enlace(item)), item.text ? elemento('p', {}, item.text) : null);
}

// El color no se desvanece: al salir queda exactamente RASTRO ms y se apaga
// de golpe. El temporizador vive en el título, por eso ni el texto auxiliar ni
// el hueco de la tarjeta pueden encender la foto del highlight.
function rastroHover(elementos, rastro = 800) {
  const ac = new AbortController();
  const timers = new WeakMap();
  for (const el of elementos) {
    el.addEventListener('pointerenter', () => {
      clearTimeout(timers.get(el));
      el.classList.add('ttx-hover-rastro');
    }, { signal: ac.signal });
    el.addEventListener('pointerleave', () => {
      clearTimeout(timers.get(el));
      timers.set(el, setTimeout(() => el.classList.remove('ttx-hover-rastro'), rastro));
    }, { signal: ac.signal });
  }
  return () => {
    ac.abort();
    for (const el of elementos) {
      clearTimeout(timers.get(el));
      el.classList.remove('ttx-hover-rastro');
    }
  };
}
function ticker(t) {
  const run = () => elemento('span', { class: 'ttx-blog-ticker-run' }, elemento(t.url ? 'a' : 'span', t.url ? { href: t.url, target: '_blank', rel: 'noopener noreferrer' } : {}, t.text ?? ''));
  return elemento('section', { class: 'ttx-blog-ticker' },
    elemento('b', {}, t.label || 'LAST NEWS'),
    elemento('div', { class: 'ttx-blog-ticker-window' }, elemento('div', { class: 'ttx-blog-ticker-track' }, run(), run())));
}
registrar('blog', async (host) => {
  const blog = await cargarBlog();
  const items = (blog.items ?? []).filter((x) => x.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const highlight = items.find((x) => x.id === blog.highlight?.article) ?? items[0];
  const lanes = [[], [], []];
  items.filter((x) => x.id !== highlight?.id).forEach((x, i) => lanes[i % 3].push(x));
  const media = blog.highlight?.image ? elemento('img', { src: urlMedia(blog.highlight.image), alt: blog.highlight.imageAlt ?? '' }) : elemento('span', { class: 'ttx-blog-highlight-empty', 'aria-hidden': 'true' });
  const copia = highlight
    ? tarjeta(highlight, true)
    : elemento('p', {}, 'Selecciona un highlight en el Studio.');
  const foto = elemento('div', { class: 'ttx-blog-highlight-image' }, media);
  const bloqueHighlight = elemento('section', { class: 'ttx-blog-highlight' }, copia, foto);
  const carriles = lanes.map((lane, i) => elemento('div', { class: `ttx-blog-lane ttx-blog-lane--${i + 1}`, tabindex: '0' }, ...lane.map((x) => tarjeta(x))));

  host.replaceChildren(
    bloqueHighlight,
    ticker(blog.ticker ?? {}),
    elemento('section', { class: 'ttx-blog-history', 'aria-label': 'Archivo del blog' }, ...carriles)
  );

  // La carga siempre abre el archivo por su comienzo. Los carriles conservan
  // la base alineada cuando caben; si desbordan, su scroll empieza en la
  // primera tarjeta y no deja ninguna medio escondida detrás del ticker.
  carriles.forEach((carril) => { carril.scrollTop = 0; });

  // La imagen no participa en decidir el alto del highlight: ese alto lo
  // escribe el título y el texto. Medir la copia evita que una foto vertical
  // agrande la fila o que una apaisada se recorte al aparecer al hover.
  const medirHighlight = () => {
    const alto = Math.ceil(copia.getBoundingClientRect().height);
    foto.style.setProperty('--ttx-blog-highlight-h', `${alto}px`);
  };
  const observador = new ResizeObserver(medirHighlight);
  observador.observe(copia);
  requestAnimationFrame(medirHighlight);

  const soltarRastro = rastroHover(host.querySelectorAll('.ttx-blog-title'));

  return { destruir: () => { observador.disconnect(); soltarRastro(); } };
});
