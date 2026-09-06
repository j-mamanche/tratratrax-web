/**
 * El buscador de artistas: una barra y, debajo, los nombres como fichas.
 *
 * Antes era un `<input list>` con su `<datalist>`, y el desplegable que pinta
 * el sistema operativo con eso no se puede tocar: tipografía de formulario de
 * 1998, una columna larguísima, y treinta y cuatro nombres en fila india para
 * elegir uno. El sello tiene pocos artistas y los conoce a todos — ver los
 * nombres repartidos es más rápido que leer una lista.
 *
 * Por eso al tocar la barra, antes de escribir nada, salen todos. Escribir
 * filtra, y lo que no reconoce se puede crear desde el mismo sitio: crear un
 * artista es escribir su nombre, no abrir otra pantalla.
 */

import { el } from './piezas.js';

const normal = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

/**
 * @param todos     los artistas del borrador (`{ slug, display, aliases }`)
 * @param puestos   los slugs que este release ya tiene, para no ofrecerlos
 * @param alElegir  recibe el slug de uno que ya existe
 * @param alCrear   recibe el nombre escrito de uno que no existe
 */
export function buscadorDeArtistas({ todos, puestos, alElegir, alCrear }) {
  const tomados = new Set(puestos);
  const libres = todos
    .filter((a) => !tomados.has(a.slug))
    .sort((a, b) => a.display.localeCompare(b.display, 'es'));

  const listaId = `artistas-${Math.random().toString(36).slice(2)}`;
  const lista = el('div', { clase: 'busca-fichas', id: listaId, role: 'listbox', 'aria-label': 'Artistas disponibles' });
  const crear = el('button', {
    type: 'button',
    clase: 'busca-crear',
    onmousedown: (e) => e.preventDefault(),
    onclick: () => nacer(),
  });
  const panel = el('div', { clase: 'busca-panel', hidden: true }, lista, crear);

  const barra = el('input', {
    type: 'text',
    clase: 'busca-barra',
    placeholder: 'Buscar o crear artista…',
    autocomplete: 'off',
    spellcheck: 'false',
    role: 'combobox',
    'aria-expanded': 'false',
    'aria-controls': listaId,
    'aria-autocomplete': 'list',
    onfocus: () => abrir(),
    oninput: () => pintar(),
    onkeydown: (e) => teclas(e),
    // Cerrar en el `blur` a secas se come el clic en una ficha: el `blur`
    // llega antes. Las fichas cancelan su `mousedown`, así que el foco no se
    // va, pero el clic de fuera sí tiene que cerrar.
    onblur: () => setTimeout(cerrar, 0),
  });

  let marcado = -1;

  const caja = el('div', { clase: 'busca' }, barra, panel);

  function visibles() {
    const q = normal(barra.value);
    if (!q) return libres;
    return libres.filter(
      (a) => normal(a.display).includes(q) || (a.aliases ?? []).some((x) => normal(x).includes(q)),
    );
  }

  function pintar() {
    const encontrados = visibles();
    const escrito = barra.value.trim();
    marcado = -1;

    lista.replaceChildren(
      ...encontrados.map((a, i) =>
        el('button', {
          type: 'button',
          clase: 'chip chip-toca',
          'data-i': i,
          id: `${listaId}-${i}`,
          role: 'option',
          'aria-selected': 'false',
          // Sin esto el `blur` de la barra cierra el panel antes del clic.
          onmousedown: (e) => e.preventDefault(),
          onclick: () => { limpiar(); alElegir(a.slug); },
        }, a.display),
      ),
    );

    // Solo si lo escrito no es ya el nombre de alguien: ofrecer «crear Nick
    // León» debajo de la ficha de Nick León es ofrecer un duplicado.
    const existe = todos.some(
      (a) => normal(a.display) === normal(escrito) || (a.aliases ?? []).some((x) => normal(x) === normal(escrito)),
    );
    crear.hidden = !escrito || existe;
    crear.replaceChildren(el('span', { clase: 'busca-mas' }, '+'), `Crear ${escrito}`);

    lista.hidden = encontrados.length === 0;
    panel.hidden = false;
    barra.setAttribute('aria-expanded', 'true');
  }

  function abrir() { pintar(); }

  function cerrar() {
    panel.hidden = true;
    barra.setAttribute('aria-expanded', 'false');
    barra.removeAttribute('aria-activedescendant');
  }

  function limpiar() {
    barra.value = '';
    cerrar();
  }

  function nacer() {
    const nombre = barra.value.trim();
    if (!nombre) return;
    limpiar();
    alCrear(nombre);
  }

  function mover(paso) {
    const fichas = [...lista.querySelectorAll('.chip-toca')];
    if (!fichas.length) return;
    fichas[marcado]?.classList.remove('marcada');
    fichas[marcado]?.setAttribute('aria-selected', 'false');
    marcado = (marcado + paso + fichas.length) % fichas.length;
    fichas[marcado].classList.add('marcada');
    fichas[marcado].setAttribute('aria-selected', 'true');
    barra.setAttribute('aria-activedescendant', fichas[marcado].id);
    fichas[marcado].scrollIntoView({ block: 'nearest' });
  }

  function teclas(e) {
    if (e.key === 'Escape') return cerrar();
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); return mover(1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); return mover(-1); }
    if (e.key !== 'Enter') return;

    e.preventDefault();
    const fichas = [...lista.querySelectorAll('.chip-toca')];
    // Enter sin nada marcado toma la única coincidencia si la hay; si hay
    // varias, escribir más es más rápido que elegir a ciegas.
    const elegida = marcado >= 0 ? fichas[marcado] : fichas.length === 1 ? fichas[0] : null;
    if (elegida) return elegida.click();
    nacer();
  }

  return caja;
}
