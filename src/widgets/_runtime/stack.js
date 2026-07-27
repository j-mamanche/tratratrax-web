// El stack de tres bandas: visor · banda · contenido.
//
// Casi todas las pantallas del sitio son la misma maquetación con otro
// `--ttx-visor-h` y otro `--ttx-visor-fx`. La regla que la hace funcionar:
// **el visor y la banda nunca tienen contenido propio, siempre son proyección
// del ítem activo.** Un solo estado manda sobre los dos.
//
// La banda del contenedor es opcional. El catálogo no la usa: ahí cada ítem
// lleva su propia etiqueta, porque tiene que quedar alineada con su columna
// y viajar con ella al hacer scroll. Como todas comparten `--ttx-banda-h`,
// la fila de etiquetas se lee igual: una sola franja continua.

let n = 0;

/**
 * Arma el esqueleto dentro de `host` y devuelve sus piezas.
 * @param {HTMLElement} host  el `[data-ttx]` que puso Cargo
 * @param {{ banda?: boolean }} opciones
 */
export function crearStack(host, { banda = false } = {}) {
  const id = ++n;
  host.classList.add('ttx', 'ttx-stack');

  const visor = document.createElement('div');
  visor.className = 'ttx-visor';
  visor.setAttribute('aria-hidden', 'true'); // decorativo: el dato real está abajo

  // Dos capas de la misma imagen. La de arriba va invertida y en
  // `mix-blend-mode: luminosity`: toma la luminancia invertida de arriba y el
  // matiz de abajo. Invertido de luminosidad, no de color.
  for (const cual of ['base', 'inv']) {
    const capa = document.createElement('div');
    capa.className = `ttx-visor-capa ttx-visor-${cual}`;
    // Nombre único por instancia, o dos widgets en la misma página chocan.
    capa.style.viewTransitionName = `ttx-visor-${cual}-${id}`;
    visor.append(capa);
  }

  const franja = document.createElement('div');
  franja.className = 'ttx-banda';

  const contenido = document.createElement('div');
  contenido.className = 'ttx-contenido';

  host.replaceChildren(visor, ...(banda ? [franja] : []), contenido);
  return { visor, banda: banda ? franja : null, contenido };
}

let enCurso = false;

/**
 * Proyecta un ítem en el visor y en la banda.
 *
 * `background-image` no transiciona, así que el cruce se hace con
 * `startViewTransition`. Si ya hay una corriendo — scroll rápido — se cambia
 * en seco: mejor un corte que una cola de transiciones atascadas.
 *
 * @param {HTMLElement} host
 * @param {{ img?: string, [campo: string]: string }} datos
 *   `img` va al visor; el resto se escribe en los `[data-proyecta="campo"]`.
 */
export function proyectar(host, datos) {
  if (host.dataset.proyectado === datos.img) return;
  host.dataset.proyectado = datos.img ?? '';

  const escribir = () => {
    if (datos.img) host.style.setProperty('--ttx-visor-img', `url("${datos.img}")`);
    for (const [campo, valor] of Object.entries(datos)) {
      if (campo === 'img') continue;
      for (const el of host.querySelectorAll(`[data-proyecta="${campo}"]`)) {
        el.textContent = valor;
      }
    }
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (enCurso || reduce || !document.startViewTransition) {
    escribir();
    return;
  }

  enCurso = true;
  const vt = document.startViewTransition(escribir);
  vt.finished.finally(() => {
    enCurso = false;
  });
}

/**
 * Precarga las carátulas del visor. Sin esto el primer cruce parpadea,
 * porque la imagen empieza a bajar justo cuando debería estar cruzando.
 */
export function precargar(urls) {
  for (const url of urls) {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}
