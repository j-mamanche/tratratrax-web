import { registrar } from '../_runtime/mount.js';
import { cargarAbout, urlMedia } from '../_runtime/datos.js';
import { crearStack, precargar } from '../_runtime/stack.js';
import { elemento } from '../_runtime/dom.js';
import './about.css';

// El About: un solo renglón de texto y un gesto que se sostiene con la mano.
// El ensayo es **no verbal** — el third space se demuestra, no se explica.
//
//   REPOSO                          MANO EN UN NOMBRE (pasada rápida)
//   ┌──────────────────────────┐    ┌──────────────────────────┐
//   │                          │    │   ✝◉✝        ✝◉✝         │
//   │      negro absoluto      │    │  negro    ✝◉✝            │  ← el campo
//   ├──────────────────────────┤    ├──────────────────────────┤
//   │ Sonic hustlers since 2020│    │ Sonic hustlers since 2020│
//   │ Run by LOMALINDA, NYKSAN │    │ Run by LOMALINDA, NYKSAN │  ← la bisagra
//   │ and VERRACO.             │    │ and VERRACO.             │
//   ├──────────────────────────┤    ├──────────────────────────┤
//   │                          │    │▓▓░░██▒▒░███▒▒░░▓▓█▒▒░░▓▓█│  ← la grieta
//   └──────────────────────────┘    └──────────────────────────┘
//
// Es el stack de siempre con las filas al revés: **el intersticio va abajo** y
// el visor baja con él. La inversión es CSS (`about.css`), no código.
//
// Lo que hay que entender antes de tocar nada:
//
//   - **En reposo no pasa nada.** Negro absoluto: ni una imagen, ni un loop, ni
//     luz en la grieta, tampoco en teléfono. Quien no mueva la mano no ve nunca
//     nada. No hay destello de ocio como en el home, y eso es a propósito: allá
//     el destello avisa que hay un lanzamiento debajo, aquí no hay nada que
//     avisar.
//   - **Cada aparición vive su segundo** y se apaga sola, contando desde que
//     nació, sin mirar a las otras. Pasada rápida → los tres a la vez en tres
//     sitios, apagándose en el orden en que salieron. **El ritmo de la mano es
//     lo que compone.** No hay cola ni piso de milisegundos como en el home
//     (`home.js:229-231`): allá sumarse era un parpadeo, aquí sumarse *es* el
//     gesto.
//   - **El azar es puro.** Sin retícula, sin zona segura, sin memoria de
//     posición. Puede salir medio cortado por el borde —el `overflow: hidden`
//     del marco lo corta gratis—, puede quedar en una esquina ridícula, dos
//     pueden caer encima. Todos son resultados legales: es el pop-up de los
//     noventa, el kitsch entrando por el comportamiento.
//   - **El santo es el link**, no el nombre. El nombre solo invoca; clic en el
//     emblema lleva al Instagram de ese DJ. Un link que hay que cazar.
//
// Opciones que acepta el placeholder de Cargo:
//   <div data-ttx="about"></div>
//   <div data-ttx="about" data-vida="1400"></div>   ← ms que vive una aparición

/**
 * Lo que dura una aparición, contado desde que nació. Se calibra con
 * `data-vida` en el placeholder, igual que `data-minimo` en el home.
 *
 * Un segundo es lo que hace que sea un gesto y no un estado: alcanza para
 * verlo y para alcanzarlo con el ratón, y no alcanza para instalarse. Subirlo
 * mucho convierte la página en una composición fija; bajarlo mucho convierte
 * el link en algo imposible de cazar.
 */
const VIDA = 1000;

registrar('about', async (host) => {
  const about = await cargarAbout();

  const djs = (about?.djs ?? []).map(normalizar).filter(Boolean);
  if (!djs.length) throw new Error('about.json no trae ningún DJ con emblema');

  // El stack de siempre, con banda. Las filas las reasigna `about.css`: el
  // campo arriba, la línea de texto en la mitad y la grieta abajo.
  //
  // `ancla: false` porque el About no es página índice y su banda está mucho
  // más abajo: publicar `--ttx-ancla` desde aquí desalinearía la gaveta de la
  // merca en la navegación siguiente. Ver el bloque del ancla en `stack.js`.
  const { banda, contenido: campo } = crearStack(host, { banda: true, ancla: false });
  campo.classList.add('ttx-about-campo');

  const menos = matchMedia('(prefers-reduced-motion: reduce)');
  const vida = Number(host.dataset.vida) || VIDA;
  const grieta = crearGrieta(host);

  // Sin esto la primera pasada por un nombre no muestra nada: el GIF llegaría
  // cuando la aparición ya se murió. Es una precarga, no un destello — no
  // pinta nada en pantalla.
  precargar(djs.map((dj) => (menos.matches ? dj.quieto : dj.emblema)));

  const estados = djs.map((dj) => crearEstado(dj, { campo, grieta, vida, menos }));
  banda.append(crearTexto(about.lema, estados));

  const soltarDisparos = disparos(host, estados);

  return {
    destruir() {
      soltarDisparos();
      for (const est of estados) est.soltar();
      grieta.apagar();
    },
  };
});

/**
 * Un DJ sirve si tiene con qué invocarlo y a dónde llevar. A medias no: un
 * emblema sin Instagram es un santo que no es link, y un nombre sin emblema es
 * un disparador que no dispara nada. Mejor que falte el nombre en la línea que
 * dejar un renglón que no responde — y el validador ya avisa antes de publicar.
 */
function normalizar(dj) {
  if (!dj?.nombre || !dj?.emblema || !dj?.instagram) return null;
  return {
    nombre: dj.nombre,
    instagram: dj.instagram,
    emblema: urlMedia(dj.emblema),
    // El cuadro fijo. Es lo que se sirve con `prefers-reduced-motion`, donde un
    // GIF animado no se puede pausar por CSS. Si no está, queda el GIF: peor
    // que respetar la preferencia es no tener nada que mostrar.
    quieto: urlMedia(dj.quieto || dj.emblema),
  };
}

// ── El texto ────────────────────────────────────────────────────────────

/**
 * El único bloque de texto de la página. Dos renglones:
 *
 *   Sonic hustlers since 2020
 *   Run by DJ Lomalinda, Nyksan and Verraco.
 *
 * La línea se **compone** desde el array de `about.json` para que los nombres y
 * sus disparadores tengan una sola fuente: agregar un cuarto DJ es agregarlo al
 * JSON, no editar una frase en un sitio y una lista en otro.
 *
 * Cada nombre es un `<button>` de verdad —el teclado sale gratis, como el
 * título del home—, no un `<span>` con eventos.
 */
function crearTexto(lema, estados) {
  const run = elemento('span', { class: 'ttx-about-run' }, 'Run by ');

  estados.forEach((est, i) => {
    if (i > 0) run.append(i === estados.length - 1 ? ' and ' : ', ');
    run.append(est.boton);
  });
  run.append('.');

  return elemento(
    'p',
    { class: 'ttx-about-texto' },
    lema && elemento('span', { class: 'ttx-about-lema' }, lema),
    run,
  );
}

// ── La grieta ───────────────────────────────────────────────────────────

/**
 * La grieta muestra **el mismo emblema comprimido a la fuerza en su altura, de
 * borde a borde**. Toda la información está ahí y la forma se perdió: queda una
 * barra de color irrepetible de esa imagen. Es la lectura literal del third
 * space — *el hueco deforma lo que pasa por él*.
 *
 * Con varios emblemas vivos muestra **el más reciente**; cuando ese muere, cae
 * al siguiente que siga vivo; sin ninguno, se apaga a negro. Así la grieta
 * sigue siendo proyección de lo activo y no contenido propio, que es la regla
 * del stack (`stack.js:1-19`).
 *
 * El apagado no es una regla nueva: al quitar `--ttx-visor-img` del `style` del
 * host, el token `[data-ttx]:not([style*='--ttx-visor-img'])` ya deja el visor
 * en cero (`tokens.css:201-203`).
 */
function crearGrieta(host) {
  const vivos = [];

  const pintar = () => {
    const ultimo = vivos[vivos.length - 1];
    if (ultimo) host.style.setProperty('--ttx-visor-img', `url("${ultimo.url}")`);
    else host.style.removeProperty('--ttx-visor-img');
  };

  return {
    nacer(el, url) {
      vivos.push({ el, url });
      pintar();
    },
    morir(el) {
      const i = vivos.findIndex((v) => v.el === el);
      if (i >= 0) vivos.splice(i, 1);
      pintar();
    },
    apagar() {
      vivos.length = 0;
      pintar();
    },
  };
}

// ── Las apariciones ─────────────────────────────────────────────────────

/**
 * El estado de un DJ. No hay estado global: no hay cola, no hay uno-a-la-vez,
 * no hay nada que coordinar entre los tres. Cada uno sabe si su disparador
 * está activo y si tiene un emblema vivo, y eso es todo.
 *
 * **Las fuentes se cuentan, no se pisan.** El mismo nombre puede estar activo
 * por el ratón y por el teclado a la vez (foco puesto y el puntero encima), y
 * soltar una no puede apagar la otra. Es el `mano` del home, con nombre.
 *
 * **Persistente** es cuando la aparición no se muere sola:
 *
 *   - **teclado**, porque un link que vive un segundo y salta de sitio es
 *     inalcanzable con Tab. El teclado no es una mano y no puede "pasar".
 *   - **`prefers-reduced-motion: reduce`**, donde la aparición se queda —es un
 *     corte y la pide el usuario— pero no hay reciclaje, que es movimiento que
 *     nadie pidió.
 *
 * En los dos casos el emblema se va con el disparador, no con el reloj.
 */
function crearEstado(dj, { campo, grieta, vida, menos }) {
  const fuentes = new Set();
  let vivo = null;
  let timer = null;

  const persistente = () => fuentes.has('tecla') || menos.matches;

  const sembrar = () => {
    const el = crearEmblema(dj, menos.matches);
    campo.append(el);
    vivo = el;
    grieta.nacer(el, menos.matches ? dj.quieto : dj.emblema);
    // Cada aparición agenda su propia muerte al nacer, sin mirar a las otras.
    timer = persistente() ? null : setTimeout(cumplir, vida);
  };

  const quitar = () => {
    if (!vivo) return;
    clearTimeout(timer);
    timer = null;
    grieta.morir(vivo);
    vivo.remove();
    vivo = null;
  };

  /**
   * Se le acabó el segundo. Si el disparador sigue activo, nace otro del mismo
   * DJ en posición nueva: sostener produce una ráfaga saltando por la pantalla,
   * no una imagen congelada.
   */
  function cumplir() {
    quitar();
    if (fuentes.size) sembrar();
  }

  const boton = crearBoton(dj);

  return {
    boton,
    /** ¿Tiene el foco de teclado como fuente? Lo pregunta `disparos`. */
    conTecla: () => fuentes.has('tecla'),
    /** ¿El foco está dentro de su emblema vivo? El caso de tabular hasta el santo. */
    tieneFoco: (el) => Boolean(vivo && el && vivo.contains(el)),

    activar(fuente) {
      fuentes.add(fuente);
      // Sin emblema vivo, siembra. Con uno vivo no siembra otro: la segunda
      // fuente no es una pasada nueva, es la misma mano contada dos veces.
      if (!vivo) sembrar();
      else if (persistente() && timer) {
        // Llegó el teclado sobre una aparición que ya estaba contando: se le
        // quita el reloj y se queda a esperar a que la alcancen.
        clearTimeout(timer);
        timer = null;
      }
    },

    desactivar(fuente) {
      if (!fuentes.delete(fuente)) return;
      if (fuentes.size) return;
      // Sin reloj es persistente y se va con el disparador. Con reloj es
      // efímero y se queda a terminar su segundo: al morir ya no habrá
      // disparador activo y no sembrará otro. Eso es lo que hace que una pasada
      // rápida deje tres emblemas apagándose en el orden en que salieron.
      if (!timer) quitar();
    },

    soltar: quitar,
  };
}

/**
 * El disparador. Un `<button>`, no un `<span>`: el teclado y el lector de
 * pantalla salen gratis y con el `aria-*` correcto.
 *
 * El texto oculto es la única pista de que hay un link en camino. Para quien no
 * ve la pantalla, un emblema que aparece en una posición aleatoria es un link
 * que se materializó sin avisar; decirlo aquí es lo mínimo honesto.
 */
function crearBoton(dj) {
  return elemento(
    'button',
    { class: 'ttx-about-nombre', type: 'button' },
    dj.nombre,
    elemento('span', { class: 'ttx-oculto' }, ' — reveals the emblem that links to Instagram'),
  );
}

/**
 * Una aparición. El emblema **es** el link: `<a>` con el GIF dentro y el nombre
 * accesible en un `.ttx-oculto` (`catalogo.css:224-231`).
 *
 * La posición es el centro, en porcentaje del campo, y va en dos variables que
 * el CSS traduce a `left`/`top` con un `translate(-50%,-50%)`. Que sea el
 * centro es lo que le da el **derecho a cortarse**: un emblema en el 2% de la
 * izquierda sale con la mitad afuera y el marco lo corta. Que vaya en
 * porcentaje evita medir el campo desde el JS —una lectura de layout por
 * aparición, y por ráfaga son varias— y de paso el emblema no se descoloca si
 * la ventana cambia de tamaño mientras vive.
 *
 * `--ttx-about-x` va en el `style` del elemento, no en una clase: el azar no
 * tiene retícula y por eso no tiene clases posibles.
 */
function crearEmblema(dj, quieto) {
  const a = elemento(
    'a',
    {
      class: 'ttx-about-emblema',
      href: dj.instagram,
      target: '_blank',
      rel: 'noopener',
    },
    // `alt` vacío a propósito: el nombre accesible lo pone el texto oculto de
    // al lado. Con los dos, el lector de pantalla lo diría dos veces.
    elemento('img', { src: quieto ? dj.quieto : dj.emblema, alt: '', draggable: 'false' }),
    elemento('span', { class: 'ttx-oculto' }, `${dj.nombre} on Instagram`),
  );

  a.style.setProperty('--ttx-about-x', `${Math.random() * 100}%`);
  a.style.setProperty('--ttx-about-y', `${Math.random() * 100}%`);
  return a;
}

// ── Los disparos ────────────────────────────────────────────────────────

/**
 * El mismo reparto por `pointerType` del home (`home.js:339-382`):
 *
 *   ratón     pointerenter → invoca    pointerleave        → suelta
 *   tacto     pointerdown  → invoca    pointerup / cancel  → suelta
 *   teclado   focus        → invoca    el foco se va       → suelta
 *
 * Van separados a propósito: un toque dispara también `pointerenter` y
 * `pointerleave`, y atender los cinco eventos sin distinguir haría dos
 * apariciones por toque.
 *
 * **El teclado se suelta distinto**, y es la única complicación de este widget.
 * Tabular desde el nombre lleva justamente al emblema —que está después en el
 * DOM— así que si el `blur` del nombre lo borrara, no habría nada que alcanzar:
 * el foco se iría al vacío en el mismo fotograma en que lo va a buscar. Por eso
 * no se mira el evento sino **dónde aterrizó el foco**, un cuadro después: si
 * sigue dentro del nombre o dentro de su emblema, el disparador sigue activo.
 */
function disparos(host, estados) {
  const ac = new AbortController();
  const { signal } = ac;
  const raton = (e) => e.pointerType === 'mouse';

  for (const est of estados) {
    const b = est.boton;
    const on = (tipo, fn) => b.addEventListener(tipo, fn, { signal });

    on('pointerenter', (e) => raton(e) && est.activar('raton'));
    on('pointerleave', (e) => raton(e) && est.desactivar('raton'));

    on('pointerdown', (e) => {
      if (raton(e)) return;
      // Con la captura, soltar el dedo fuera del nombre sigue avisando aquí;
      // sin ella un deslizamiento hacia afuera dejaba la ráfaga corriendo para
      // siempre.
      try {
        b.setPointerCapture(e.pointerId);
      } catch {
        /* el navegador no la da: `pointercancel` sigue cubriendo el caso */
      }
      est.activar('tacto');
    });
    on('pointerup', (e) => !raton(e) && est.desactivar('tacto'));
    on('pointercancel', (e) => !raton(e) && est.desactivar('tacto'));

    // Solo el foco de teclado. Un clic del ratón también da foco, y ahí el
    // `pointerleave` ya se encarga: sin este filtro, hacer clic en un nombre
    // dejaría su emblema clavado en pantalla hasta que el foco se fuera.
    on('focus', () => tecla(b) && est.activar('tecla'));
  }

  const revisarFoco = () => {
    const foco = document.activeElement;
    for (const est of estados) {
      if (!est.conTecla()) continue;
      if (foco === est.boton || est.tieneFoco(foco)) continue;
      est.desactivar('tecla');
    }
  };

  // Un cuadro de espera: en el `focusout` el foco todavía no aterrizó y
  // `document.activeElement` es el `<body>`. `relatedTarget` diría a dónde va,
  // pero llega vacío en más navegadores de los que uno querría.
  let pendiente = 0;
  host.addEventListener(
    'focusout',
    () => {
      cancelAnimationFrame(pendiente);
      pendiente = requestAnimationFrame(revisarFoco);
    },
    { signal },
  );

  return () => {
    cancelAnimationFrame(pendiente);
    ac.abort();
  };
}

/** `:focus-visible` no existe en algún navegador viejo: ahí, tratarlo como teclado. */
function tecla(el) {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
}
