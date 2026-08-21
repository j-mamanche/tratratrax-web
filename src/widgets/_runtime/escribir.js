// La máquina de escribir.
//
// Lo que en el nav de Cargo le pasa al lema —las letras que se escriben una a
// una, con el cursor arrastrando un residuo de ruido— aquí le pasa a lo que
// entra en una grieta: los dos links del home y la línea que se abre en el
// About. **Es el mismo gesto y por eso son los mismos números**; lo que cambia
// es que allá se anima un texto plano y aquí, marcado.
//
// Esa es toda la dificultad. `BUY__ LISTEN` no es una cadena: son dos `<a>`,
// una junta que imprime el CSS y un texto oculto para el lector de pantalla.
// Escribirlo con `textContent` lo aplanaría —adiós links, adiós juntas— así que
// lo que se escribe **son los nodos de texto que ya están puestos**, cada uno
// recortado por donde vaya el cursor. El marcado no se toca nunca.
//
//   raíz ─┬─ <a>Buy</a>          ← nodo de texto, 3 letras
//         │   └ <span class="ttx-oculto">  ← se salta: no es texto que se vea
//         └─ <a>Listen</a>       ← nodo de texto, 6 letras
//                                  y el cursor va por las nueve de corrido
//
// **Lo que todavía no empezó a escribirse no ocupa lugar.** Su elemento lleva
// `data-ttx-vacio` y `tokens.css` lo saca del flujo: sin eso, un `<a>` vacío
// seguiría midiendo su `gap` y su junta, y la línea nacería con todos los
// huecos hechos y las letras cayendo dentro. Lo que se quiere es lo contrario:
// que las letras **empujen** lo que ya está escrito, como en el nav.
//
// El borrado es al revés y más rápido, como allá. La diferencia es que aquí
// puede tener prisa: en el About el hueco se cierra en `--ttx-dur` y el texto
// tiene que haberse ido para entonces, o se vería recortado contra el borde
// mientras se encoge. Eso es `techoBorrado`.

/** El residuo que arrastra el cursor. Sin acentos: se leen como error de encoding. */
const RUIDO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>_-=+*#%$@[]{}·';

/**
 * Los números del nav (`cargo/snippets/nav.md`, sección 3). Están repetidos
 * aquí y no importados porque aquel script es autónomo y vive pegado en Cargo:
 * si algún día se calibra allá, esto es lo que hay que mover.
 */
export const NAV = { paso: 58, jitter: 42, borrado: 30, jitterBorrado: 14, cola: 1 };

/**
 * Lo más rápido que puede ir un tic. Por debajo de esto un `setTimeout` ya no
 * cumple —el navegador redondea y encima está el trabajo de repintar— así que
 * pedir menos no acelera nada, solo hace que las cuentas mientan.
 */
const PISO = 8;

const ruido = (n) => {
  let t = '';
  for (let i = 0; i < n; i++) t += RUIDO[Math.floor(Math.random() * RUIDO.length)];
  return t;
};

/**
 * Una máquina por grieta.
 *
 * @param {HTMLElement} raiz  lo que se escribe. Su marcado no se modifica.
 * @param {object} opciones
 *   `paso`/`jitter`          ms por letra escrita, ± la variación. La variación
 *                            es la que hace que suene a mano y no a máquina.
 *                            **Nunca es mayor que el paso**, igual que en el
 *                            borrado: con un paso corto —el About teclea a 10ms
 *                            y el jitter del nav es de 42— la mitad de los tics
 *                            pediría un tiempo negativo, el `PISO` los subiría
 *                            a todos al mismo número y la variación terminaría
 *                            haciendo lo contrario de lo que está para hacer:
 *                            frenar de a ratos, en vez de sonar irregular.
 *   `borrado`/`jitterBorrado` lo mismo, borrando.
 *   `cola`                   letras de ruido que arrastra el cursor al escribir.
 *                            Borrar es siempre limpio, como en el nav.
 *   `techoBorrado`           ms máximos que puede durar el borrado entero. Si
 *                            hay más letras de las que caben a `borrado` por
 *                            letra, se acelera hasta caber. Es lo que lo deja
 *                            terminar junto con el hueco que se cierra.
 *   `espera`                 ms antes de la primera letra. Para las grietas que
 *                            primero se abren y después se llenan: la letra no
 *                            puede salir mientras todavía no hay sitio donde
 *                            ponerla.
 * @returns {{ abrir: (ya?: boolean) => void, cerrar: (ya?: boolean) => void,
 *             soltar: () => void }}
 */
export function maquina(raiz, opciones = {}) {
  const { paso, jitter, borrado, jitterBorrado, cola, techoBorrado, espera } = {
    ...NAV,
    techoBorrado: 0,
    espera: 0,
    ...opciones,
  };

  const { piezas, cajas, total } = recolectar(raiz);

  // Si el borrado entero no cabe en su techo, cada letra se va más rápido —y si
  // ni así cabe, se van de a varias por tic. Lo segundo hace falta porque un
  // `setTimeout` no baja de unos milisegundos por vuelta: con ochenta letras y
  // medio segundo de techo, la cuenta pide seis milisegundos por letra, el
  // navegador da ocho, y el borrado terminaba después de que el hueco ya se
  // había cerrado. Se veía como letras sueltas quedándose. Son los únicos dos
  // números que se calculan; el resto son los del nav, tal cual.
  const msBorrado = Math.max(
    PISO,
    techoBorrado && total ? Math.min(borrado, techoBorrado / total) : borrado,
  );
  const saltoBorrado =
    techoBorrado && total
      ? Math.max(1, Math.ceil(total / Math.max(1, Math.floor(techoBorrado / msBorrado))))
      : 1;

  let n = 0; // letras a la vista
  let meta = 0; // a dónde va
  let timer = null;

  const pintar = () => {
    for (const p of piezas) {
      const corte = Math.min(Math.max(n - p.inicio, 0), p.texto.length);

      // A media palabra, las últimas `cola` letras todavía son ruido: es el
      // cursor, que va por delante de lo que cuajó.
      const enVuelo = corte > 0 && corte < p.texto.length && meta > n;
      const solido = enVuelo ? Math.max(0, corte - cola) : corte;
      p.nodo.data = p.texto.slice(0, solido) + (enVuelo ? ruido(corte - solido) : '');
    }

    // Lo que todavía no empezó sale del flujo, y **no solo el elemento que
    // lleva las letras: también el que lo contiene**. Un `<span>` de bloque
    // vacío pero puesto sigue siendo un ítem de su `flex` y sigue cobrando su
    // `gap`, así que la línea nacería con un aire fantasma a la izquierda que se
    // cierra de golpe al llegar la primera letra. Por eso `cajas` guarda toda la
    // cadena de ancestros y no solo el padre del nodo.
    for (const [el, inicio] of cajas) el.toggleAttribute('data-ttx-vacio', n <= inicio);
  };

  const parar = () => {
    clearTimeout(timer);
    timer = null;
  };

  const correr = () => {
    if (n === meta) {
      parar();
      return;
    }
    const subiendo = meta > n;
    const ms =
      (subiendo && n === 0 ? espera : 0) +
      (subiendo
        ? paso + (Math.random() * 2 - 1) * Math.min(jitter, paso)
        : msBorrado + (Math.random() * 2 - 1) * Math.min(jitterBorrado, msBorrado));

    timer = setTimeout(() => {
      n = subiendo ? n + 1 : Math.max(meta, n - saltoBorrado);
      pintar();
      correr();
    }, Math.max(PISO, ms));
  };

  /**
   * `ya` escribe o borra de un golpe, sin animación. Es para el teclado —a
   * quien tabula no se le puede hacer esperar a que salga la palabra, y un
   * lector de pantalla leería `BU`— y para `prefers-reduced-motion`.
   */
  const ir = (destino, ya) => {
    meta = destino;
    parar();
    if (ya) {
      n = destino;
      pintar();
      return;
    }
    correr();
  };

  pintar();

  return {
    abrir: (ya = false) => ir(total, ya),
    cerrar: (ya = false) => ir(0, ya),
    soltar: parar,
  };
}

/**
 * Los nodos de texto de `raiz` en el orden en que se leen, cada uno con la
 * posición del cursor a la que le toca empezar; y, aparte, todos los elementos
 * de por medio con la misma cuenta — la primera letra que aparece dentro de
 * ellos, esté a la profundidad que esté.
 *
 * Se salta lo que solo existe para el lector de pantalla (`.ttx-oculto`): eso
 * no se ve, así que no se escribe — y escribirlo sería peor, porque el lector
 * lo leería a pedazos mientras corre la animación.
 *
 * El texto se copia **una vez, al montar**. De ahí en adelante lo que hay en el
 * nodo es un recorte de esta copia y nadie más lo toca.
 */
function recolectar(raiz) {
  const piezas = [];
  const cajas = new Map();
  let total = 0;

  const paso = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    acceptNode(nodo) {
      if (!nodo.data.trim()) return NodeFilter.FILTER_REJECT;
      return nodo.parentElement?.closest('.ttx-oculto')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  while (paso.nextNode()) {
    const nodo = paso.currentNode;
    piezas.push({ nodo, texto: nodo.data, inicio: total });

    // La cadena de ancestros hasta la raíz, sin incluirla: la raíz es la caja
    // que sostiene el sitio y no se puede esconder a sí misma. El primero que
    // la reclama es el que manda —un elemento empieza donde empiece su primera
    // letra— y por eso solo se escribe si no estaba.
    for (let el = nodo.parentElement; el && el !== raiz; el = el.parentElement) {
      if (!cajas.has(el)) cajas.set(el, total);
    }

    total += nodo.data.length;
  }

  return { piezas, cajas, total };
}
