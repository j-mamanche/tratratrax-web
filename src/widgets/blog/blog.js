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
  return elemento(item.url ? 'a' : 'span', item.url ? { href: item.url, target: '_blank', rel: 'noopener noreferrer' } : {},
    item.title,
    elemento('span', { class: 'ttx-blog-read', 'aria-hidden': 'true' },
      elemento('span', { class: 'ttx-blog-read-line' }, '__'),
      elemento('span', { class: 'ttx-blog-read-word' }, 'READ'))
  );
}
function tarjeta(item, highlight = false) {
  return elemento('article', { class: `ttx-blog-card${highlight ? ' ttx-blog-highlight-copy' : ''}` },
    // El highlight es una tarjeta editorial, no el título principal de la
    // página. Usa la misma jerarquía y la misma escala que el archivo para
    // que Cargo no le aplique su h1 global de 4rem.
    elemento('b', { class: 'ttx-blog-title' }, enlace(item)), item.text ? elemento('p', {}, item.text) : null);
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
    elemento('div', { class: 'ttx-blog-ticker-window' }, elemento('div', { class: 'ttx-blog-ticker-track' }, run())));
}

function activarTicker(host) {
  const ventana = host.querySelector('.ttx-blog-ticker-window');
  const pista = host.querySelector('.ttx-blog-ticker-track');
  const original = pista.firstElementChild;
  const movimientoReducido = matchMedia('(prefers-reduced-motion: reduce)');
  let pendiente = 0;
  let anchoAnterior = 0;
  let velocidadAnterior = 0;
  let datosCambiados = false;

  const medir = () => {
    pendiente = 0;
    const ancho = original.getBoundingClientRect().width;
    const ventanaAncho = ventana.getBoundingClientRect().width;
    if (!ancho || !ventanaAncho) return;
    if (datosCambiados) {
      while (pista.children.length > 1) pista.lastElementChild.remove();
      datosCambiados = false;
    }
    // Tras desplazar una repetición, las restantes todavía deben cubrir toda
    // la ventana. El padding de la repetición forma parte de esta distancia.
    const cantidad = movimientoReducido.matches ? 1 : Math.max(2, Math.ceil(ventanaAncho / ancho) + 1);
    while (pista.children.length < cantidad) {
      const copia = original.cloneNode(true);
      copia.setAttribute('aria-hidden', 'true');
      copia.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
      pista.append(copia);
    }
    while (pista.children.length > cantidad) pista.lastElementChild.remove();

    // Velocidad ligada a la escala tipográfica, no al número de copias.
    const velocidad = parseFloat(getComputedStyle(original).fontSize) * 1.2;
    if (ancho !== anchoAnterior || velocidad !== velocidadAnterior) {
      pista.style.setProperty('--ttx-blog-ticker-distance', `${ancho}px`);
      pista.style.setProperty('--ttx-blog-ticker-duration', `${ancho / velocidad}s`);
      anchoAnterior = ancho;
      velocidadAnterior = velocidad;
    }
    if (!pista.hasAttribute('data-ready')) pista.setAttribute('data-ready', '');
  };
  const agendar = () => { if (!pendiente) pendiente = requestAnimationFrame(medir); };
  const observador = new ResizeObserver(agendar);
  observador.observe(ventana);
  observador.observe(original);
  const datos = new MutationObserver(() => { datosCambiados = true; agendar(); });
  datos.observe(original, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['href', 'target', 'rel'] });
  movimientoReducido.addEventListener('change', agendar);
  agendar();
  return () => {
    observador.disconnect();
    datos.disconnect();
    movimientoReducido.removeEventListener('change', agendar);
    cancelAnimationFrame(pendiente);
  };
}
registrar('blog', async (host) => {
  const blog = await cargarBlog();
  const items = (blog.items ?? []).filter((x) => x.visible !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const highlight = items.find((x) => x.id === blog.highlight?.article) ?? items[0];
  // El archivo móvil es un único flujo en orden editorial. Los carriles de
  // escritorio se ocultan allí; el preview B solo cambia su presentación.
  const archivo = items.filter((x) => x.id !== highlight?.id);
  const lanes = [[], [], []];
  archivo.forEach((x, i) => lanes[i % 3].push(x));
  const media = blog.highlight?.image ? elemento('img', { src: urlMedia(blog.highlight.image), alt: blog.highlight.imageAlt ?? '' }) : elemento('span', { class: 'ttx-blog-highlight-empty', 'aria-hidden': 'true' });
  const copia = highlight
    ? tarjeta(highlight, true)
    : elemento('p', {}, 'Selecciona un highlight en el Studio.');
  const foto = elemento('div', { class: 'ttx-blog-highlight-image' }, media);
  const bloqueHighlight = elemento('section', { class: 'ttx-blog-highlight' }, copia, foto);
  const carriles = lanes.map((lane, i) => elemento('div', { class: `ttx-blog-lane ttx-blog-lane--${i + 1}`, tabindex: '0' }, ...lane.map((x) => tarjeta(x))));
  const historia = elemento('section', { class: 'ttx-blog-history', 'aria-label': 'Archivo del blog' }, ...carriles);
  const archivoMovil = elemento('section', { class: 'ttx-blog-history ttx-blog-history--movil', 'aria-label': 'Archivo del blog', tabindex: '0' }, ...archivo.map((x) => tarjeta(x)));

  host.replaceChildren(
    bloqueHighlight,
    ticker(blog.ticker ?? {}),
    historia,
    archivoMovil
  );

  // La carga siempre abre el archivo por su comienzo. Los carriles conservan
  // la base alineada cuando caben; si desbordan, su scroll empieza en la
  // primera tarjeta y no deja ninguna medio escondida detrás del ticker.
  carriles.forEach((carril) => { carril.scrollTop = 0; });

  const soltarTicker = activarTicker(host);
  const soltarRastro = rastroHover(host.querySelectorAll('.ttx-blog-title'));
  const soltarMedidas = medirBlogMovil(host, bloqueHighlight, host.querySelector('.ttx-blog-ticker'));

  return { destruir: () => { soltarTicker(); soltarRastro(); soltarMedidas(); } };
});

function medirBlogMovil(host, highlight, grieta) {
  const movil = matchMedia('(max-width: 700px)');
  const visor = window.visualViewport;
  const navSelector = '.chrome, [id="N1901077103"] :is(.nav-lema,.nav-logo,.nav-links), [id="L3482832595"] :is(.nav-lema,.nav-logo,.nav-links)';
  let pendiente = 0;
  const medir = () => {
    pendiente = 0;
    if (!movil.matches || !host.isConnected) return;
    const techo = visor?.offsetTop ?? 0;
    const fondo = techo + (visor?.height ?? innerHeight);
    const alto = Math.max(0, fondo - host.getBoundingClientRect().top);
    let inicioNav = fondo;
    let hayNav = false;
    for (const pieza of document.querySelectorAll(navSelector)) {
      hayNav = true;
      const caja = pieza.getBoundingClientRect();
      if (caja.width && caja.height && caja.bottom > techo && caja.top < fondo) inicioNav = Math.min(inicioNav, caja.top);
    }
    const nav = hayNav ? Math.max(0, fondo - inicioNav) : (parseFloat(getComputedStyle(host).getPropertyValue('--ttx-nav-h')) || 0);
    host.style.setProperty('--ttx-blog-visible-h', `${alto}px`);
    host.style.setProperty('--ttx-blog-nav-real-h', `${nav}px`);
    // Si las dos zonas superiores dejan menos de un área táctil utilizable,
    // la página completa recupera su scroll y no queda un archivo atrapado.
    host.classList.toggle('ttx-blog-sin-encaje',
      alto - highlight.getBoundingClientRect().height - grieta.getBoundingClientRect().height - 32 < 112);
  };
  const agendar = () => { if (!pendiente) pendiente = requestAnimationFrame(medir); };
  const observador = new ResizeObserver(agendar);
  observador.observe(highlight);
  observador.observe(grieta);
  const navObserver = new MutationObserver((cambios) => {
    if (cambios.some((c) => [...c.addedNodes, ...c.removedNodes].some((n) => n.nodeType === 1 && (n.matches?.('.chrome, [id="N1901077103"], [id="L3482832595"]') || n.querySelector?.('.chrome, [id="N1901077103"], [id="L3482832595"]'))))) agendar();
  });
  navObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', agendar);
  window.addEventListener('orientationchange', agendar);
  visor?.addEventListener('resize', agendar);
  visor?.addEventListener('scroll', agendar);
  movil.addEventListener('change', agendar);
  document.fonts?.ready.then(() => { if (host.isConnected) agendar(); });
  agendar();
  return () => {
    observador.disconnect();
    navObserver.disconnect();
    window.removeEventListener('resize', agendar);
    window.removeEventListener('orientationchange', agendar);
    visor?.removeEventListener('resize', agendar);
    visor?.removeEventListener('scroll', agendar);
    movil.removeEventListener('change', agendar);
    cancelAnimationFrame(pendiente);
  };
}
