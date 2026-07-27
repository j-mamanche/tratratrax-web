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
  const ancla = anclador(carril);

  // La carátula abre el release igual que la etiqueta. El estado y los
  // atributos ARIA siguen viviendo en la etiqueta, que es el `<button>`:
  // esto es un blanco más grande para el puntero, no un segundo control.
  carril.addEventListener('click', (e) => {
    const disparador = e.target.closest?.('.ttx-etiqueta, .ttx-cover');
    if (disparador && carril.contains(disparador)) {
      alternar(host, carril, disparador.closest('.ttx-item'), ancla);
    }
  });

  // Cualquier gesto propio del usuario le gana al anclaje: si empezó a
  // moverse solo, que el carril siga tirando de él es de lo peor que puede
  // hacer una interfaz.
  for (const ev of ['pointerdown', 'wheel', 'touchstart', 'keydown']) {
    carril.addEventListener(ev, ancla.soltar, { passive: true });
  }

  // Proyección inicial: el primero, antes de que nadie haga scroll.
  proyectarItem(host, carril.firstElementChild);

  return {
    destruir() {
      ancla.soltar();
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
    elemento(
      'div',
      { class: 'ttx-panel-col' },
      elemento('h3', { class: 'ttx-titulo-panel' }, 'Credits'),
      creditos(r),
      r.note && elemento('p', { class: 'ttx-nota' }, r.note),
      enlaces(r),
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

function alternar(host, carril, item, ancla) {
  if (!item) return;
  const abrir = !item.hasAttribute('data-abierto');

  ancla.soltar();
  for (const otro of carril.children) cerrar(otro);

  if (!abrir) {
    delete host.dataset.abierto;
    return;
  }

  item.setAttribute('data-abierto', '');
  item.querySelector('.ttx-etiqueta').setAttribute('aria-expanded', 'true');
  item.querySelector('.ttx-panel').removeAttribute('inert');
  // Gancho para el CSS de la página: cuál release está abierto.
  host.dataset.abierto = item.dataset.id;
  ancla.fijar(item);
}

/**
 * Trae el comienzo del ítem abierto al comienzo del carril, y lo **mantiene
 * ahí** mientras dura el acordeón. Acostado eso es el borde izquierdo;
 * parado es el borde de arriba, o sea que el título del release queda justo
 * debajo del visor — en la segunda banda del stack, que es donde va.
 *
 * Un `scrollTo` de una sola vez no alcanza, y ese era el bug: al abrir un
 * segundo release el primero se cierra, o sea que todo lo que está antes
 * encoge — pero encoge *animado*, durante medio segundo. La posición que se
 * calculaba en el instante del clic era la de antes de esa animación, así
 * que el carril apuntaba a un lugar que dejaba de existir y el ítem
 * terminaba corrido: la carátula pegada al borde y el panel de créditos
 * escondido fuera de pantalla.
 *
 * La corrección es no calcular una posición sino sostener una relación. Cada
 * cuadro se vuelve a medir dónde quedó el ítem y se corrige la diferencia;
 * como el layout se mueve suave, la corrección también.
 */
function anclador(carril) {
  let objetivo = null;
  let raf = 0;
  let fin = 0;

  const soltar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const paso = () => {
    const it = objetivo.getBoundingClientRect();
    const ca = carril.getBoundingClientRect();
    // Lo que le falta al ítem para tocar el comienzo del carril. Positivo:
    // está más adelante, hay que scrollear hacia allá.
    if (carril.scrollWidth > carril.clientWidth) carril.scrollLeft += it.left - ca.left;
    else carril.scrollTop += it.top - ca.top;
    raf = performance.now() < fin ? requestAnimationFrame(paso) : 0;
  };

  return {
    soltar,
    fijar(item) {
      objetivo = item;
      // El acordeón dura `--ttx-dur`; un respiro de más cubre el último
      // cuadro, donde la transición ya terminó pero el layout aún no.
      fin = performance.now() + duracion(carril) + 120;
      if (!raf) raf = requestAnimationFrame(paso);
    },
  };
}

/** `--ttx-dur` en milisegundos. Vive en el CSS, que es donde se calibra. */
function duracion(el) {
  const v = getComputedStyle(el).getPropertyValue('--ttx-dur').trim();
  const n = parseFloat(v) || 0.5;
  return /ms$/.test(v) ? n : n * 1000;
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
