import { registrar } from '../_runtime/mount.js';
import { cargar } from '../_runtime/datos.js';
import { crearStack, proyectar, precargar } from '../_runtime/stack.js';
import { espejo } from '../_runtime/espejo.js';
import { hscroll } from '../_runtime/hscroll.js';
import {
  cover,
  numeroCatalogo,
  lineasCredito,
  nombresArtistas,
  grupos,
} from '../_runtime/format.js';
import { elemento } from '../_runtime/dom.js';
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

  const { visor, contenido: carril, anclar } = crearStack(host);
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
  const soltarHash = seguirHash(host, carril);

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

  // Aquí la banda son las etiquetas de los ítems, que no existían cuando se
  // armó el stack. Ya están: se vuelve a medir para que las gavetas que se
  // abran encima del catálogo aterricen en la misma línea.
  anclar();

  return {
    destruir() {
      reflejo.destruir();
      soltarScroll();
      soltarMedidas();
      soltarCentro();
      soltarHash();
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
  // Es **la misma regla** de la línea del About y de la franja del home, vista
  // de otra manera: el rol es un grupo con junta y el valor es el grupo que
  // cierra. Por eso pasa por el mismo helper — así el espacio después del `__`
  // es un solo número en todo el sitio y no uno por pantalla. Lo que no aplica
  // aquí es la alternancia de peso (`peso: false`): en el panel lo que separa
  // el rol del valor es la junta y la columna, y engordar los valores metería
  // un segundo nivel de información que no existe.
  //
  // La primera línea es la fecha y se separa del bloque de roles, como en el
  // sitio viejo.
  return elemento(
    'ul',
    { class: 'ttx-creditos' },
    ...lineas.map(({ rol, valor, suelta, texto, libre, pegada }) => {
      // Una línea suelta no tiene rótulo, así que tampoco tiene junta: pasarla
      // por `grupos` le colgaría un `____` de un valor que no rotula nada.
      if (libre) {
        return elemento('li', { class: `ttx-credito-libre${pegada ? ' ttx-pegada' : ''}` }, texto);
      }

      const [grupoRol, grupoValor] = grupos([rol, valor], { peso: false });
      return elemento(
        'li',
        suelta ? { class: 'ttx-credito-fecha' } : {},
        elemento('span', { class: `ttx-rol ${grupoRol.clase}` }, grupoRol.texto),
        grupoValor?.texto ?? '',
      );
    }),
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
 * Llegar desde afuera con un release en el bolsillo. La franja del home enlaza
 * `/catalog#killing-mariposas`, y esto es lo que hace que ese link signifique
 * algo: al montar —y cada vez que el hash cambie sin recargar— se abre ese
 * release y el carril se va hasta él.
 *
 * Es el único sitio donde abrir **sí mueve el carril**. Al hacer clic no se
 * mueve, a propósito: uno ya está mirando el ítem. Aquí uno viene de otra
 * página y el ítem puede estar a treinta discos de distancia.
 *
 * Un hash que no corresponde a ningún ítem no hace nada: puede ser de otra
 * cosa de la página, o un release que dejó de estar visible.
 */
function seguirHash(host, carril) {
  const ac = new AbortController();

  const abrir = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;

    const item = [...carril.children].find((el) => el.dataset.id === id);
    if (!item || item.hasAttribute('data-abierto')) return;

    alternar(host, carril, item);
    cuandoMida(host, () => llevar(carril, item));
  };

  window.addEventListener('hashchange', abrir, { signal: ac.signal });
  abrir();
  return () => ac.abort();
}

/**
 * Espera a que un ítem tenga ancho, y entonces hace lo suyo.
 *
 * Al montar, un ítem todavía no mide lo que va a medir: su ancho sale de
 * `--ttx-cuerpo-h`, que la publica el ResizeObserver de `medirItems` cuando el
 * grid ya midió, y hasta entonces vale el respaldo del CSS. Desplazarse contra
 * esa geometría deja el release a media pantalla de donde debía, y por unos
 * cientos de píxeles que además dependen de cuántos ítems vengan antes.
 *
 * Contar fotogramas a mano no sirve —cuántos hagan falta depende de la
 * máquina— y mirar si el ítem se quedó quieto tampoco: entre dos medidas
 * iguales cabe perfectamente el fotograma en que todavía no había medido
 * nadie. Lo que sí es un hecho es la variable: existe o no existe. Se espera a
 * que exista, y un fotograma más para que el navegador la haya usado.
 *
 * El tope de intentos es para que esto no se quede corriendo en una pestaña de
 * fondo, donde los fotogramas no llegan.
 */
function cuandoMida(host, fn, intentos = 60) {
  const paso = () => {
    if (host.style.getPropertyValue('--ttx-cuerpo-h')) return requestAnimationFrame(fn);
    if (intentos-- <= 0) return fn();
    requestAnimationFrame(paso);
  };

  requestAnimationFrame(paso);
}

/**
 * Lleva el carril hasta un ítem, esté acostado o parado. No se pregunta cuál
 * de los dos es: se mide la distancia en los dos ejes y se desplaza, y el eje
 * que no tiene desborde ignora lo suyo.
 *
 * Con `scrollIntoView` no: ese sube por todos los ancestros y terminaría
 * moviendo también la página de Cargo que hay alrededor.
 */
function llevar(carril, item) {
  const caja = item.getBoundingClientRect();
  const marco = carril.getBoundingClientRect();
  carril.scrollBy({ left: caja.left - marco.left, top: caja.top - marco.top });
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
