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
 * El CSS se inyecta desde aquí, no se pega aparte en Cargo: dos líneas que
 * hay que mantener sincronizadas a mano son dos líneas que se desincronizan.
 * Se arrastra el `?v=` del script para que el CSS quede pinneado igual.
 */
function inyectarCss() {
  if (!script?.src || document.querySelector('link[data-ttx-css]')) return;
  const url = new URL(script.src);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL(`ttx.css${url.search}`, url).href;
  link.dataset.ttxCss = '';
  document.head.append(link);
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
