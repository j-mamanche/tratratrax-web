// El loader. En Cargo esto es la única línea que hay que pegar en el HTML
// global; en cada página va solo un `<div data-ttx="catalogo">`.

const fabricas = new Map();
const montados = new Set();

/** @param {string} nombre @param {(host: HTMLElement) => Promise<{destruir?: () => void}|void>} fabrica */
export function registrar(nombre, fabrica) {
  fabricas.set(nombre, fabrica);
}

// La etiqueta del script, resuelta al evaluar el módulo — después ya no existe.
const script =
  document.currentScript ?? document.querySelector('script[src*="ttx.js"]');

/**
 * El CSS viaja **dentro** de este archivo: `__TTX_CSS__` lo reemplaza el
 * build por el CSS entero.
 *
 * Antes era un `<link>` a `ttx.css` con el mismo `?v=` del script. Parecía
 * equivalente y no lo es: son dos recursos con cachés independientes de diez
 * minutos, y el navegador puede revalidar uno y no el otro. En vivo quedó
 * corriendo el JS de una versión con el CSS de otra, y la página se
 * desmaquetó. Un solo archivo no se puede desincronizar consigo mismo.
 */
function inyectarCss() {
  if (!__TTX_CSS__ || document.querySelector('style[data-ttx-css]')) return;
  const style = document.createElement('style');
  style.dataset.ttxCss = '';
  style.textContent = __TTX_CSS__;
  document.head.append(style);
}

async function montar(host) {
  const nombre = host.dataset.ttx;
  const fabrica = fabricas.get(nombre);
  if (!fabrica) {
    console.warn(`[ttx] no hay widget registrado con el nombre "${nombre}"`);
    return;
  }

  // Marcar antes de esperar: si no, dos mutaciones seguidas montan dos veces.
  montados.add(host);
  host.dataset.ttxEstado = 'montando';

  try {
    const inst = (await fabrica(host)) ?? {};
    host.__ttx = inst;
    host.dataset.ttxEstado = 'listo';
    // Pudieron sacarlo del DOM mientras cargaban los datos.
    if (!host.isConnected) desmontar(host);
  } catch (err) {
    console.error(`[ttx] "${nombre}" no pudo montar:`, err);
    host.dataset.ttxEstado = 'error';
    host.replaceChildren(mensajeDeError());
  }
}

function desmontar(host) {
  montados.delete(host);
  try {
    host.__ttx?.destruir?.();
  } catch (err) {
    console.error('[ttx] fallo al desmontar:', err);
  }
  delete host.__ttx;
  delete host.dataset.ttxEstado;
}

function mensajeDeError() {
  const p = document.createElement('p');
  p.className = 'ttx-error';
  p.textContent = 'No se pudo cargar el catálogo.';
  return p;
}

let pendiente = false;

function revisar() {
  pendiente = false;
  for (const host of document.querySelectorAll('[data-ttx]')) {
    if (!montados.has(host)) montar(host);
  }
  for (const host of montados) {
    if (!host.isConnected) desmontar(host);
  }
}

function agendar() {
  if (pendiente) return;
  pendiente = true;
  requestAnimationFrame(revisar);
}

/**
 * Cargo navega por AJAX: reemplaza el contenido sin recargar la página y sin
 * disparar `DOMContentLoaded` otra vez. Con solo ese evento los widgets
 * aparecen en la primera carga y nunca más — es el bug clásico de este
 * enfoque, así que el observer no es opcional.
 */
export function iniciar() {
  inyectarCss();
  new MutationObserver(agendar).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revisar, { once: true });
  } else {
    revisar();
  }
}
