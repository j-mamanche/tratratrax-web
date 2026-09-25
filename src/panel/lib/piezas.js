/**
 * Las ayudas de DOM del panel. No es un framework y no debe crecer hasta
 * parecerlo: el panel tiene dos pantallas y ninguna cambia de forma mientras
 * se usa.
 */

import { ui, idioma, traducirError } from './idioma.js';
import { UI_EN } from './textos.js';

export function el(etiqueta, props = {}, ...hijos) {
  const nodo = document.createElement(etiqueta);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === 'clase') nodo.className = v;
    else if (k === 'html') nodo.innerHTML = ui(v);
    else if (k.startsWith('on')) nodo.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in nodo && k !== 'list') nodo[k] = ['title', 'placeholder', 'alt'].includes(k) ? ui(v) : v;
    else nodo.setAttribute(k, v === true ? '' : k === 'aria-label' ? ui(v) : v);
  }
  const contenido = hijos.flat().filter((h) => h != null && h !== false);
  nodo.append(...contenido.map((h) => typeof h === 'string' ? ui(h) : h));
  if (contenido.length === 1 && typeof contenido[0] === 'string' && UI_EN[contenido[0]]) {
    nodo.dataset.uiEs = contenido[0];
    nodo.dataset.uiEn = UI_EN[contenido[0]];
  }
  return nodo;
}

/** Etiqueta arriba, campo abajo — el ritmo de todo el panel. */
export const campo = (etiqueta, control, pie) =>
  el(
    'label',
    { clase: 'campo' },
    el('span', {}, etiqueta),
    control,
    pie ? el('small', { clase: 'pie' }, pie) : null,
  );

export const vaciar = (nodo) => {
  while (nodo.firstChild) nodo.firstChild.remove();
  return nodo;
};

/** Lee un JSON que el servidor dejó pintado en la página. */
export const leerIsla = (id) => JSON.parse(document.getElementById(id).textContent);

/**
 * Un bloque del formulario, con su nombre y su `?`.
 *
 * La ayuda va plegada y cerrada, y esa es toda la regla: lo que hay que leer
 * una vez no puede estar ocupando sitio las otras cien. El panel de antes
 * explicaba cada campo debajo del campo, y el resultado era que no se leía
 * ninguna explicación y tampoco se veía el formulario.
 */
export function bloque(nombre, ayuda, ...hijos) {
  const texto = ayuda ? el('div', { clase: 'ayuda-texto', hidden: true }, ...[].concat(ayuda)) : null;

  const boton = ayuda
    ? el('button', {
        type: 'button',
        clase: 'ayuda',
        'aria-expanded': 'false',
        'aria-label': idioma() === 'en' ? `Help for ${ui(nombre)}` : `Qué es ${nombre}`,
        onclick: (e) => {
          texto.hidden = !texto.hidden;
          e.currentTarget.setAttribute('aria-expanded', String(!texto.hidden));
        },
      }, '?')
    : null;

  return el(
    'section',
    { clase: 'tarjeta' },
    el('header', { clase: 'tarjeta-cabeza' }, el('h2', {}, nombre), boton),
    texto,
    ...hijos,
  );
}

/** Pinta un parte de estado —bien, ojo, mal— o lo esconde si no hay nada que decir. */
export function parte(nodo, { tono, texto, lista = [] } = {}) {
  nodo.className = `parte ${tono ?? ''}`.trim();
  nodo.hidden = !texto && !lista.length;
  vaciar(nodo);
  const localizado = (valor, tag) => {
    const par = typeof valor === 'object' ? valor : { es: valor, en: traducirError(valor) };
    const item = el(tag, {}, idioma() === 'en' ? par.en : par.es);
    item.dataset.uiEs = par.es;
    item.dataset.uiEn = par.en;
    return item;
  };
  if (texto) nodo.append(localizado(texto, 'strong'));
  if (lista.length) nodo.append(el('ul', {}, lista.map((t) => localizado(t, 'li'))));
}

/** Los nombres de archivo y los identificadores internos salen de aquí. */
export const slugificar = (s = '') =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Un slug que no choque con los que ya hay. */
export function slugLibre(texto, tomados) {
  const raiz = slugificar(texto) || 'sin-nombre';
  if (!tomados.has(raiz)) return raiz;
  let n = 2;
  while (tomados.has(`${raiz}-${n}`)) n++;
  return `${raiz}-${n}`;
}
