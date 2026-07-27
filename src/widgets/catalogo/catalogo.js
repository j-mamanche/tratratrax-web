import { registrar } from '../_runtime/mount.js';
import { cargar } from '../_runtime/datos.js';
import { crearStack, proyectar, precargar } from '../_runtime/stack.js';
import { espejo } from '../_runtime/espejo.js';
import { hscroll } from '../_runtime/hscroll.js';
import { cover, numeroCatalogo, lineasCredito, nombresArtistas } from '../_runtime/format.js';
import './catalogo.css';

// El catálogo: visor arriba, carril de carátulas abajo, y una etiqueta por
// ítem que al hacer clic abre el release empujando a los demás.
//
// Opciones que acepta el placeholder de Cargo:
//   <div data-ttx="catalogo" data-artista="ehua-flore" data-limite="10"></div>

let contador = 0;

registrar('catalogo', async (host) => {
  const { releases, indiceArtistas } = await cargar();

  const filtro = host.dataset.artista;
  const limite = Number(host.dataset.limite) || Infinity;

  const lista = releases
    .filter((r) => r.visible !== false)
    .filter((r) => !filtro || r.artists.includes(filtro))
    // `order` lo controla el panel; la fecha desempata si dos quedan iguales.
    .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || b.date.localeCompare(a.date))
    .slice(0, limite);

  if (!lista.length) {
    host.replaceChildren(elemento('p', { class: 'ttx-error' }, 'No hay releases que mostrar.'));
    return;
  }

  const { visor, contenido: carril } = crearStack(host);
  carril.classList.add('ttx-carril');
  carril.tabIndex = 0;
  carril.setAttribute('role', 'list');
  carril.setAttribute('aria-label', 'Catálogo de TraTraTrax');

  const id = ++contador;
  carril.append(...lista.map((r, i) => crearItem(r, indiceArtistas, `${id}-${i}`)));

  // Sin esto las celdas del espejo salen en blanco y se van llenando
  // mientras uno hace scroll.
  const visores = lista.map((r) => cover(r.bcImageId, 16));
  precargar(visores);

  const reflejo = espejo(visor, carril, visores);
  const soltarScroll = hscroll(carril);
  const soltarMedidas = medirItems(host, carril);
  const soltarCentro = seguirCentro(host, carril);

  // La carátula abre el release igual que la etiqueta. El estado y los
  // atributos ARIA siguen viviendo en la etiqueta, que es el `<button>`:
  // esto es un blanco más grande para el puntero, no un segundo control.
  //
  // Abrir **no mueve el carril**. Llevaba el release al comienzo, y con el
  // acordeón animándose debajo se sentía como un tirón: uno hace clic en un
  // sitio y la pantalla se va a otro. El release se abre donde está.
  carril.addEventListener('click', (e) => {
    const disparador = e.target.closest?.('.ttx-etiqueta, .ttx-cover');
    if (disparador && carril.contains(disparador)) {
      alternar(host, carril, disparador.closest('.ttx-item'));
    }
  });

  // Proyección inicial: el primero, antes de que nadie haga scroll.
  proyectarItem(host, carril.firstElementChild);

  return {
    destruir() {
      reflejo.destruir();
      soltarScroll();
      soltarMedidas();
      soltarCentro();
    },
  };
});

// ── DOM de un release ───────────────────────────────────────────────────

function crearItem(r, indiceArtistas, sufijo) {
  const idPanel = `ttx-panel-${sufijo}`;
  const artistas = nombresArtistas(r.artists, indiceArtistas);
  const numero = numeroCatalogo(r.catalog);

  // La etiqueta es un `<button>` de verdad: así el catálogo se recorre y se
  // abre con teclado sin escribir una sola línea de JS de accesibilidad.
  const etiqueta = elemento(
    'button',
    { class: 'ttx-etiqueta', type: 'button', 'aria-expanded': 'false', 'aria-controls': idPanel },
    // Sin separadores en el contenido: los `·` y las rayas son ::after del CSS,
    // igual que en el sitio viejo.
    numero && elemento('span', { class: 'ttx-cat' }, numero),
    elemento('span', { class: 'ttx-album' }, r.album),
    artistas && elemento('span', { class: 'ttx-artistas' }, artistas),
  );

  // La columna interior tiene ancho propio: si no, el texto se reacomodaría
  // línea por línea mientras la gaveta se abre.
  const panel = elemento(
    'div',
    { class: 'ttx-panel', id: idPanel, 'data-scroll-y': '', inert: '' },
    // `.ttx-panel-caja` no es un div de más. Es la que se aplasta cuando el
    // acordeón vertical cierra: tiene que poder medir cero, y `.ttx-panel-col`
    // no puede porque lleva el padding —una caja con padding nunca mide menos
    // que su padding—. Sin ella el panel cerrado dejaba asomando su primera
    // línea debajo de cada carátula.
    elemento(
      'div',
      { class: 'ttx-panel-caja' },
      elemento(
        'div',
        { class: 'ttx-panel-col' },
        elemento('h3', { class: 'ttx-titulo-panel' }, 'Credits'),
        creditos(r),
        r.note && elemento('p', { class: 'ttx-nota' }, r.note),
        enlaces(r),
      ),
    ),
  );

  const img = elemento('img', {
    class: 'ttx-cover',
    src: cover(r.bcImageId, 10),
    alt: `Carátula de ${r.album}`,
    loading: 'lazy',
    decoding: 'async',
    draggable: 'false',
  });

  const item = elemento(
    'article',
    { class: 'ttx-item', role: 'listitem', 'data-id': r.id },
    etiqueta,
    elemento('div', { class: 'ttx-cuerpo' }, panel, img),
  );

  // Lo que el visor necesita saber del ítem, sin volver a buscar el release.
  item.dataset.visor = cover(r.bcImageId, 16);
  return item;
}

function creditos(r) {
  const lineas = lineasCredito(r);
  if (!lineas.length) return null;

  // `Rol__ Valor` es como el sello ya escribe en Bandcamp. Se guarda
  // estructurado y se serializa aquí, no al revés.
  //
  // Los guiones bajos van en su propio `<span>` porque necesitan tracking
  // negativo para leerse como una línea continua, y ese tracking no puede
  // tocar la palabra del rol. La primera línea es la fecha y se separa del
  // bloque de roles, como en el sitio viejo.
  return elemento(
    'ul',
    { class: 'ttx-creditos' },
    ...lineas.map(({ rol, valor, suelta }) =>
      elemento(
        'li',
        suelta ? { class: 'ttx-credito-fecha' } : {},
        elemento(
          'span',
          { class: 'ttx-rol' },
          rol,
          elemento('span', { class: 'ttx-guion' }, '__'),
        ),
        ` ${valor}`,
      ),
    ),
  );
}

function enlaces(r) {
  const links = [
    r.purchaseUrl && ['Purchase', r.purchaseUrl],
    r.listenUrl && ['Listen', r.listenUrl],
  ].filter(Boolean);
  if (!links.length) return null;

  return elemento(
    'p',
    { class: 'ttx-enlaces' },
    ...links.map(([texto, href]) =>
      elemento(
        'a',
        { href, target: '_blank', rel: 'noopener', class: 'ttx-enlace' },
        texto,
        elemento('span', { class: 'ttx-oculto' }, ` — ${r.album}`),
      ),
    ),
  );
}

// ── Estado ──────────────────────────────────────────────────────────────

function alternar(host, carril, item) {
  if (!item) return;
  const abrir = !item.hasAttribute('data-abierto');

  for (const otro of carril.children) cerrar(otro);

  if (!abrir) {
    delete host.dataset.releaseAbierto;
    return;
  }

  item.setAttribute('data-abierto', '');
  item.querySelector('.ttx-etiqueta').setAttribute('aria-expanded', 'true');
  item.querySelector('.ttx-panel').removeAttribute('inert');
  // Gancho para el CSS de la página: cuál release está abierto. El nombre
  // no es `data-abierto` a propósito: el ítem ya usa ese, y tenerlo también
  // en el host hace que `[data-abierto] .ttx-panel` matchee **todos** los
  // paneles, no el del abierto. Es una trampa fácil de pisar.
  host.dataset.releaseAbierto = item.dataset.id;
}

function cerrar(item) {
  item.removeAttribute('data-abierto');
  item.querySelector('.ttx-etiqueta')?.setAttribute('aria-expanded', 'false');
  item.querySelector('.ttx-panel')?.setAttribute('inert', '');
}

function proyectarItem(host, item) {
  if (item) proyectar(host, { img: item.dataset.visor });
}

/**
 * Manda lo que cruza el centro del carril. Un `IntersectionObserver` con el
 * carril como root y los cuatro lados recortados al 49% deja un cuadrito de
 * 2% en el centro: lo que lo toca, es lo que se proyecta. Sin escuchar
 * `scroll`.
 *
 * El recorte va por los cuatro lados, no solo por los horizontales, para que
 * sirva igual con el carril acostado y parado: en cualquiera de los dos el
 * ítem ocupa todo el eje contrario, así que siempre toca el cuadrito.
 */
function seguirCentro(host, carril) {
  const io = new IntersectionObserver(
    (entradas) => {
      const dentro = entradas.filter((e) => e.isIntersecting).pop();
      if (dentro) proyectarItem(host, dentro.target);
    },
    { root: carril, rootMargin: '-49%', threshold: 0 },
  );

  for (const item of carril.children) io.observe(item);
  return () => io.disconnect();
}

/**
 * Un ítem cerrado es cuadrado, como su carátula. El acordeón necesita anchos
 * en números para poder transicionar, así que se mide el alto de la fila y se
 * publica como `--ttx-cuerpo-h`; el CSS deriva de ahí `--ttx-w-item`.
 *
 * No es circular: el alto sale de la fila del grid y no depende del ancho.
 */
function medirItems(host, carril) {
  const cuerpo = carril.querySelector('.ttx-cuerpo');
  if (!cuerpo) return () => {};

  const ro = new ResizeObserver(([entrada]) => {
    const alto = entrada.contentRect.height;
    if (alto > 0) host.style.setProperty('--ttx-cuerpo-h', `${Math.round(alto)}px`);
  });
  ro.observe(cuerpo);
  return () => ro.disconnect();
}

// ── Utilidad ────────────────────────────────────────────────────────────

/** Los `null` y `false` se ignoran, para poder escribir `cond && elemento(…)`. */
function elemento(tag, props = {}, ...hijos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) el.setAttribute(k, v);
  el.append(...hijos.filter((h) => h !== null && h !== undefined && h !== false && h !== ''));
  return el;
}
