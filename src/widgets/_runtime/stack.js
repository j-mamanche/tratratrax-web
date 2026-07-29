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
 * @param {{ banda?: boolean, ancla?: boolean }} opciones
 *   `ancla: false` para las pantallas que **no** son índice: ver el bloque
 *   del ancla más abajo.
 */
export function crearStack(host, { banda = false, ancla = true } = {}) {
  host.classList.add('ttx');
  inyectarFiltro();

  // El aire de alrededor va como `padding` del host y el stack vive en un
  // marco adentro. Estaba como `margin` del host y no se veía: un margen
  // inferior se colapsa con el del padre cuando el padre no cierra su caja
  // —que es lo que hace Cargo— y desaparece. Un padding no se colapsa
  // nunca, y de paso Cargo tampoco lo pisa.
  const marco = document.createElement('div');
  marco.className = 'ttx-marco';

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

  marco.append(visor, ...(banda ? [franja] : []), contenido);
  host.replaceChildren(marco);

  const anclar = ancla
    ? medirAncla(marco, visor, banda ? franja : null, contenido)
    : () => {};
  return { marco, visor, banda: banda ? franja : null, contenido, anclar };
}

// ── El ancla ──────────────────────────────────────────────────────────
//
// La barra de la mitad no termina en el widget. Las gavetas de Cargo —merca
// hoy, lo que venga después— se abren **encima** de esta página y se acuestan
// contra ella: el borde de arriba de la gaveta cae exactamente en el borde de
// abajo de la banda. Eso es lo que hace que la barra se lea como una sola
// línea que atraviesa el sitio y no como el encabezado de cada pantalla.
//
// Para que la gaveta sepa dónde está esa línea, el stack la publica: un
// `--ttx-ancla` en el `<html>`, en píxeles. El CSS de Cargo lo lee y ya
// (`padding-top: var(--ttx-ancla, 21rem)`), sin JS al otro lado.
//
// Se mide en vez de calcularse desde `--ttx-visor-h` por lo mismo que en el
// home: el visor se calibra en porcentaje y la fila de la banda es `auto`.
// Un número copiado a mano al CSS de la gaveta —que es como estaba— se
// desincroniza el día que alguien mueva el visor, y nadie se entera hasta
// verlo.
//
// **No todas las pantallas tienen derecho a publicarlo.** `--ttx-ancla` vive
// en el `<html>`, y el `<html>` sobrevive a la navegación por AJAX de Cargo:
// lo último que se escribió es lo que se encuentra la gaveta que se abra
// después, en cualquier página. El About tiene el stack invertido —su banda
// está mucho más abajo— y no es página índice: si publicara, la gaveta de la
// merca aterrizaría contra una línea que ya no existe. Ese es el caso de
// `ancla: false`. Lo que quede escrito es lo de la última página que sí manda,
// que es exactamente lo que la gaveta quiere.
const RAIZ = 'ttx-ancla';

function medirAncla(marco, visor, franja, contenido) {
  const medir = () => {
    if (!marco.isConnected) {
      // Cargo navega por AJAX y este widget puede haberse ido sin que nadie
      // llame a `destruir`. Que el observer se recoja solo.
      ro.disconnect();
      return;
    }

    // El catálogo no tiene banda de contenedor: ahí la barra son las
    // etiquetas de los ítems, que están todas a la misma altura. Cualquiera
    // sirve, y la primera es la que existe siempre.
    const barra = franja ?? contenido.querySelector('.ttx-etiqueta');
    const caja = (barra ?? visor).getBoundingClientRect();
    if (caja.height === 0) return;

    document.documentElement.style.setProperty(RAIZ, `${Math.round(caja.bottom)}px`);
  };

  // El marco mide `--ttx-alto`, que sale del viewport: cambiar la ventana lo
  // cambia a él y vuelve a disparar. No hace falta escuchar `resize` aparte.
  const ro = new ResizeObserver(medir);
  ro.observe(marco);
  return medir;
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

// ── El filtro del visor ───────────────────────────────────────────────
//
// Una estampa en blanco y negro, sin un solo gris. Cuatro pasos:
//
//   1. un poco de blur, para que lo que quede sean formas y no grano;
//   2. a escala de grises;
//   3. el gris aplanado a dos valores — eso es `posterize` llevado al
//      límite, y en SVG es literalmente un `feComponentTransfer` de tipo
//      `discrete` con dos entradas. En inverso: lo oscuro sale blanco;
//   4. y un blur suave al final, que le quita el filo de recorte al salto
//      entre los dos tonos.
//
// Nada de esto existe como filtro de CSS: `blur()` sí, pero no hay ni
// `posterize` ni umbral. En SVG sí, y se referencia igual —
// `filter: url(#…)`— así que el punto de calibración sigue siendo una sola
// variable.
//
// Se probó también dibujar los bordes encima con un `feConvolveMatrix`,
// como en una serigrafía. Sobre dos tonos no aporta nada: el contorno ya
// *es* el salto entre blanco y negro. Se sacó, y con él lo más caro del
// filtro.
//
// Todo lo que vale la pena calibrar está en `tableValues`, y va al revés de
// lo que uno esperaría porque el umbral está invertido:
//   - dar la vuelta: `"1 0"` es el inverso, `"0 1"` el directo.
//   - dónde corta: `"1 0"` parte por la mitad; `"1 1 0"` deja más blanco y
//     `"1 0 0"` más negro.
//   - cuántos tonos: `"1 .45 0"` mete un gris medio, si algún día se quiere
//     menos brutal.
const FILTRO = `
<filter id="ttx-visor-fx" x="-8%" y="-8%" width="116%" height="116%"
        color-interpolation-filters="sRGB">
  <feGaussianBlur stdDeviation="3" result="suave"/>
  <feColorMatrix in="suave" type="saturate" values="0" result="gris"/>
  <feComponentTransfer in="gris" result="umbral">
    <feFuncR type="discrete" tableValues="1 0"/>
    <feFuncG type="discrete" tableValues="1 0"/>
    <feFuncB type="discrete" tableValues="1 0"/>
  </feComponentTransfer>
  <feGaussianBlur in="umbral" stdDeviation="2"/>
</filter>`;

const NS = 'http://www.w3.org/2000/svg';

/** Uno solo para todo el documento: el filtro no depende de la instancia. */
function inyectarFiltro() {
  if (document.getElementById('ttx-visor-fx')) return;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  // Fuera del flujo y sin tamaño: es una definición, no algo que se vea.
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = FILTRO;
  document.body.append(svg);
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
