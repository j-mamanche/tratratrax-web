// El stack de tres bandas: visor · banda · contenido.
//
// Casi todas las pantallas del sitio son la misma maquetación con otro
// `--ttx-visor-h` y otro `--ttx-visor-fx`. La regla que la hace funcionar:
// **el visor y la banda nunca tienen contenido propio, siempre son proyección
// del ítem activo.** Un solo estado manda sobre los dos.
//
// El visor tiene dos modos, y los dos son la misma carátula de cabeza con un
// filtro de color fuerte:
//
//   - En pantalla ancha, el reflejo del carril entero (ver `espejo.js`).
//   - En teléfono, donde el carril va en vertical, la carátula del ítem
//     activo sola, puesta en `--ttx-visor-img`. Cambia en seco, sin cruce:
//     un fundido ahí es justo lo que había que quitar.
//
// La banda del contenedor es opcional. El catálogo no la usa: ahí cada ítem
// lleva su propia etiqueta, porque tiene que quedar alineada con su columna
// y viajar con ella al hacer scroll. Como todas comparten `--ttx-banda-h`,
// la fila de etiquetas se lee igual: una sola franja continua.

/**
 * Arma el esqueleto dentro de `host` y devuelve sus piezas.
 * @param {HTMLElement} host  el `[data-ttx]` que puso Cargo
 * @param {{ banda?: boolean }} opciones
 */
export function crearStack(host, { banda = false } = {}) {
  host.classList.add('ttx', 'ttx-stack');

  const visor = document.createElement('div');
  visor.className = 'ttx-visor';
  visor.setAttribute('aria-hidden', 'true'); // decorativo: el dato real está abajo

  // El respaldo de teléfono. En pantalla ancha el CSS lo esconde y manda el
  // espejo; aquí siempre existe, para no tener que montar y desmontar DOM
  // cuando la ventana cruza el breakpoint.
  const fondo = document.createElement('div');
  fondo.className = 'ttx-visor-fondo';
  visor.append(fondo);

  const franja = document.createElement('div');
  franja.className = 'ttx-banda';

  const contenido = document.createElement('div');
  contenido.className = 'ttx-contenido';

  host.replaceChildren(visor, ...(banda ? [franja] : []), contenido);
  return { visor, banda: banda ? franja : null, contenido };
}

/**
 * Proyecta un ítem en el visor y en la banda.
 *
 * Escribe y ya: sin `startViewTransition`. Esa API fotografía la página
 * entera, así que difuminaba de paso la barra de etiquetas en cada cambio de
 * disco. En pantalla ancha el visor ni siquiera lee `--ttx-visor-img` — lo
 * que se ve ahí es el espejo del carril, que no necesita que nadie lo cruce.
 *
 * @param {HTMLElement} host
 * @param {{ img?: string, [campo: string]: string }} datos
 *   `img` va al visor; el resto se escribe en los `[data-proyecta="campo"]`.
 */
export function proyectar(host, datos) {
  if (host.dataset.proyectado === datos.img) return;
  host.dataset.proyectado = datos.img ?? '';

  if (datos.img) host.style.setProperty('--ttx-visor-img', `url("${datos.img}")`);
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === 'img') continue;
    for (const el of host.querySelectorAll(`[data-proyecta="${campo}"]`)) {
      el.textContent = valor;
    }
  }
}

/**
 * Precarga las carátulas del visor. Sin esto las celdas del espejo aparecen
 * en blanco y se van llenando mientras uno hace scroll.
 */
export function precargar(urls) {
  for (const url of urls) {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}
