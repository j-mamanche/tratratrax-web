import { registrar } from '../_runtime/mount.js';
import { cargarAbout, urlMedia } from '../_runtime/datos.js';
import { crearStack, precargar } from '../_runtime/stack.js';
import { elemento } from '../_runtime/dom.js';
import './about.css';

// El About: un solo renglón de texto y un gesto que se sostiene con la mano.
// El ensayo es **no verbal** — el third space se demuestra, no se explica.
//
//   REPOSO                        MANO EN UN NOMBRE (escritorio)
//   ┌────────────────────────┐    ┌────────────────────────┐
//   │                        │    │              ✝◉✝       │
//   │ SONIC HUSTLERS… TRATRA…│    │ SONIC HUSTLERS… TRA✝◉✝│  ← la bisagra
//   │                        │    │                        │
//   │     gris y nada más    │    │  gris          ✝◉✝     │  ← el campo
//   │                        │    │                        │
//   └────────────────────────┘    └────────────────────────┘
//                                 └── la mitad derecha ────┘
//
// **No hay tercera banda.** El About usa el stack sin visor: banda y contenido,
// nada más. La grieta —el emblema aplastado de borde a borde— existió y se
// quitó: deformar el material era una idea sobre el third space, y la página
// funciona mejor sin ella. `about.css` esconde el visor que `crearStack` crea
// igual.
//
// El campo **es toda la ventana**, pero el azar no cae en toda la ventana: la
// zona la recorta el CSS —la mitad derecha en pantalla ancha, la mitad de abajo
// en teléfono—, así que la línea de texto casi nunca se ve invadida y el
// emblema tiene un sitio propio en la composición. El JS solo sortea dos
// números de 0 a 1.
//
// Lo que hay que entender antes de tocar nada:
//
//   - **En reposo no pasa nada.** El gris del chrome y la línea de texto: ni una
//     imagen, ni un loop, ni un destello, tampoco en teléfono. Quien no
//     mueva la mano no ve nunca nada. No hay destello de ocio como en el home, y
//     eso es a propósito: allá el destello avisa que hay un lanzamiento debajo,
//     aquí no hay nada que avisar.
//   - **La aparición no se mueve.** Sale donde le tocó y ahí se queda: mientras
//     la mano siga puesta no salta a otro sitio, y cuando la mano se va todavía
//     dura `VIDA` más, quieta, para que se alcance con el ratón. Sostener no
//     produce una ráfaga; produce una imagen que espera.
//   - **Hay un solo emblema por DJ y nunca se va del DOM**, solo se apaga
//     (`about.css`, la regla de `[data-apagado]`). Un
//     GIF que se quita y se vuelve a poner reinicia su animación y el santo
//     saldría siempre en el mismo cuadro; dejándolo puesto, el loop sigue
//     corriendo por debajo y cada aparición lo agarra donde vaya.
//   - **El azar es puro dentro de la zona.** Lo único que se decidió es en qué
//     mitad de la pantalla pasa esto; adentro no hay retícula, no hay zona
//     segura y no hay memoria de posición. Puede salir medio cortado por el
//     borde —el `overflow: hidden` del marco lo corta gratis—, puede quedar en
//     una esquina ridícula, dos pueden caer encima. Todos son resultados
//     legales: es el pop-up de los noventa, el kitsch entrando por el
//     comportamiento. Lo que sí es fijo es que **el sitio se sortea al aparecer,
//     nunca mientras se ve**.
//   - **El santo es el link**, no el nombre. El nombre solo invoca; clic en el
//     emblema lleva al Instagram de ese DJ. Un link que hay que cazar.
//
// Opciones que acepta el placeholder de Cargo:
//   <div data-ttx="about"></div>
//   <div data-ttx="about" data-vida="2000"></div>   ← ms que dura la cola

/**
 * **La cola**: lo que la aparición se queda después de que la mano se fue.
 * Antes era lo que vivía desde que nació, y era otra cosa — el reloj corría
 * contra el gesto y una mano quieta veía saltar el santo. Ahora el reloj
 * arranca cuando el gesto termina: mientras haya mano no hay reloj.
 *
 * Segundo y medio es lo que alcanza para soltar el nombre y llegar al emblema
 * con el ratón —que es cómo se caza el link— sin que la imagen se instale.
 * Se calibra con `data-vida` en el placeholder, igual que `data-minimo` en el
 * home.
 */
const VIDA = 1500;

registrar('about', async (host) => {
  const about = await cargarAbout();

  const djs = (about?.djs ?? []).map(normalizar).filter(Boolean);
  if (!djs.length) throw new Error('about.json no trae ningún DJ con emblema');

  // El stack de siempre, con banda y **sin visor**: `crearStack` lo crea igual
  // —es el mismo runtime de las otras páginas— y `about.css` lo esconde. Las
  // filas las reasigna ahí mismo: aire, la línea de texto, y el campo cruzando
  // todo.
  //
  // `ancla: false` porque el About no es página índice y su banda no está donde
  // el resto del sitio la espera: publicar `--ttx-ancla` desde aquí desalinearía
  // la gaveta de la merca en la navegación siguiente. Ver el ancla en
  // `stack.js`.
  const { banda, contenido: campo } = crearStack(host, { banda: true, ancla: false });
  campo.classList.add('ttx-about-campo');

  const menos = matchMedia('(prefers-reduced-motion: reduce)');
  const vida = Number(host.dataset.vida) || VIDA;
  // Los tres emblemas se cuelgan del campo apagados y **se quedan ahí**. Ya no
  // es solo una precarga: es lo que mantiene el GIF corriendo por debajo para
  // que ninguna aparición empiece en el primer cuadro. La precarga sigue para
  // el otro archivo, el que hoy no está puesto.
  precargar(djs.map((dj) => (menos.matches ? dj.emblema : dj.quieto)));

  const estados = djs.map((dj) => crearEstado(dj, { campo, vida, menos }));
  banda.append(crearTexto(about, estados));

  const soltarDisparos = disparos(host, estados);
  // La preferencia se puede cambiar con la página abierta: ahí hay que
  // cambiarle el archivo al emblema, que ya no se vuelve a crear nunca.
  const soltarMenos = escuchar(menos, () => {
    for (const est of estados) est.revisarMovimiento();
  });

  return {
    destruir() {
      soltarDisparos();
      soltarMenos();
      for (const est of estados) est.soltar();
    },
  };
});

/** `MediaQueryList` viejo no tiene `addEventListener`, solo `addListener`. */
function escuchar(mq, fn) {
  if (mq.addEventListener) {
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }
  mq.addListener(fn);
  return () => mq.removeListener(fn);
}

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
 * El único texto de la página, en **un solo renglón** de punta a punta:
 *
 *   SONIC HUSTLERS SINCE 2020        TRATRATRAX IS A LABEL RUN BY DJ LOMALINDA…
 *   └──────── el lema ───────┘       └──────────────── el sello ─────────────┘
 *
 * Dos bloques y el hueco entre ellos, que no es un espacio escrito sino lo que
 * sobra de la barra: el CSS los empuja a los dos bordes.
 *
 * **Adentro de un bloque los grupos van pegados, sin espacio**, y lo único que
 * los separa es que el peso alterna: fuerte, liviano, fuerte, liviano. Los
 * espacios que sí existen son los de adentro de un grupo —`SONIC HUSTLERS` son
 * dos palabras— porque ahí son parte del texto. Por eso el copy llega marcado
 * con asteriscos:
 *
 *   *SONIC HUSTLERS*SINCE*2020*
 *   ─────fuerte──── liviano fuerte
 *
 * Cada asterisco es una junta y **no se imprime**; no es un espacio, es el
 * punto donde cambia el peso.
 *
 * **Los tres nombres siguen la misma alternancia**, y por eso se pegan al final
 * del segundo bloque en vez de ir en una lista aparte: `DJ LOMALINDA` fuerte,
 * `NYKSAN` liviano, `VERRACO` fuerte. La cuenta no se reinicia — sigue desde el
 * último campo de la frase, que es lo que hace que los nombres se lean como más
 * campos de la misma línea y no como una enumeración pegada al final.
 *
 * Nada de comas ni de "and". La línea se **compone** desde `about.json` para
 * que los nombres y sus disparadores tengan una sola fuente — agregar un cuarto
 * DJ es agregarlo al JSON, no editar una frase en un sitio y una lista en otro.
 *
 * Cada nombre es un `<button>` de verdad —el teclado sale gratis, como el
 * título del home—, no un `<span>` con eventos.
 */
function crearTexto(about, estados) {
  const lema = partir(about.lema);
  const sello = partir(about.sello);

  // La alternancia del segundo bloque no se reinicia en los nombres: sigue
  // contando desde donde la dejó la frase.
  for (const [i, est] of estados.entries()) est.vestir(liviano(sello.length + i));

  return elemento(
    'p',
    { class: 'ttx-about-texto' },
    lema.length > 0 && elemento('span', { class: 'ttx-about-bloque' }, ...lema.map(crearCampo)),
    elemento(
      'span',
      { class: 'ttx-about-bloque' },
      ...sello.map(crearCampo),
      ...estados.map((est) => est.boton),
    ),
  );
}

/**
 * El asterisco es **la junta**, y así llega el copy escrito:
 *
 *   "*Sonic hustlers*since*2020*"  →  ["Sonic hustlers", "since", "2020"]
 *
 * No se imprime nunca; solo dice dónde termina un grupo y empieza el otro. Los
 * grupos alternan peso empezando por el fuerte, que es lo único que los separa:
 * entre uno y otro no va ni un espacio.
 *
 * Se guarda así en `data/about.json`, con los asteriscos, porque es la única
 * forma de que el sello escriba la línea entera —texto y ritmo— en un solo
 * sitio. Una frase sin asteriscos es un grupo fuerte y ya: no se rompe nada.
 */
function partir(frase) {
  if (!frase) return [];
  return String(frase)
    .split('*')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Los impares van livianos: el primer grupo de cada bloque siempre es fuerte. */
const liviano = (i) => i % 2 === 1;

function crearCampo(texto, i) {
  return elemento('span', { class: peso(liviano(i)) }, texto);
}

const peso = (esLiviano) => (esLiviano ? 'ttx-about-suave' : 'ttx-about-fuerte');

// ── Las apariciones ─────────────────────────────────────────────────────

/**
 * El estado de un DJ. No hay estado global: no hay cola, no hay uno-a-la-vez,
 * no hay nada que coordinar entre los tres. Cada uno sabe si su disparador
 * está activo y si su emblema está encendido, y eso es todo.
 *
 * **Las fuentes se cuentan, no se pisan.** El mismo nombre puede estar activo
 * por el ratón y por el teclado a la vez (foco puesto y el puntero encima), y
 * soltar una no puede apagar la otra. Es el `mano` del home, con nombre.
 *
 * El ciclo entero son tres reglas:
 *
 *   1. Se enciende cuando llega la primera fuente, en un sitio sorteado **en
 *      ese instante**.
 *   2. Mientras haya una fuente puesta no hay reloj: la imagen no se mueve, no
 *      se recicla y no se apaga por su cuenta.
 *   3. Cuando se va la última fuente arranca la cola de `vida` ms, quieta en el
 *      mismo sitio. Volver antes de que se cumpla **cancela la cola y no
 *      resortea**: no hay forma de hacer que el santo brinque con la mano
 *      encima.
 *
 * El emblema no se crea ni se destruye nunca —eso lo hace `crearEmblema`, una
 * sola vez— porque quitar un GIF del DOM le reinicia la animación.
 */
function crearEstado(dj, { campo, vida, menos }) {
  const fuentes = new Set();
  const el = crearEmblema(dj, menos.matches);
  const boton = crearBoton(dj);
  campo.append(el);

  let encendido = false;
  let timer = null;

  const fuente = () => (menos.matches ? dj.quieto : dj.emblema);

  const encender = () => {
    clearTimeout(timer);
    timer = null;
    if (encendido) return;
    // El sorteo ocurre aquí y solo aquí: apagado el emblema, nadie lo ve
    // moverse. Con el emblema encendido esta función ya se salió arriba.
    //
    // Salen dos números de 0 a 1, no dos porcentajes. **La zona la pone el
    // CSS** —la derecha en pantalla ancha, abajo en teléfono— y esto es
    // solamente el azar: dónde cae dentro de la zona que le toque. Poner el
    // recorte aquí obligaría al JS a saber de anchos de pantalla, que es la
    // única cosa que este widget nunca ha tenido que saber.
    el.style.setProperty('--ttx-about-rx', Math.random().toFixed(4));
    el.style.setProperty('--ttx-about-ry', Math.random().toFixed(4));
    el.removeAttribute('data-apagado');
    el.removeAttribute('inert');
    encendido = true;
  };

  const apagar = () => {
    clearTimeout(timer);
    timer = null;
    if (!encendido) return;
    el.setAttribute('data-apagado', '');
    el.setAttribute('inert', '');
    encendido = false;
  };

  return {
    boton,

    /**
     * El peso que le toca al nombre en la alternancia de la línea. Lo decide
     * `crearTexto`, que es el único que sabe cuántos campos vinieron antes.
     */
    vestir(esLiviano) {
      boton.classList.add(peso(esLiviano));
    },

    /** ¿Tiene el foco de teclado como fuente? Lo pregunta `disparos`. */
    conTecla: () => fuentes.has('tecla'),
    /** ¿El foco está dentro de su emblema encendido? El caso de tabular hasta el santo. */
    tieneFoco: (nodo) => Boolean(encendido && nodo && el.contains(nodo)),

    activar(f) {
      fuentes.add(f);
      encender();
    },

    desactivar(f) {
      if (!fuentes.delete(f)) return;
      // Queda otra mano puesta: no empieza a contar nada.
      if (fuentes.size || !encendido) return;
      clearTimeout(timer);
      timer = setTimeout(apagar, vida);
    },

    /** Cambió `prefers-reduced-motion` con la página abierta. */
    revisarMovimiento() {
      const url = fuente();
      const img = el.querySelector('img');
      if (img && img.src !== url) img.src = url;
    },

    soltar: apagar,
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
 * El emblema, **uno por DJ y para toda la vida de la página**. Nace apagado y
 * se queda colgado del campo: encender y apagar es quitar y poner
 * `data-apagado`, nunca `append` ni `remove`.
 *
 * Esa es la regla que no se puede relajar. Un GIF que se saca del DOM y se
 * vuelve a meter arranca de cero, así que cada aparición salía en el mismo
 * primer cuadro y el santo se veía siempre igual. Dejándolo puesto —apagado,
 * pero puesto— el navegador sigue corriendo el loop por debajo y la aparición
 * lo agarra donde vaya. Por eso el CSS lo apaga con `opacity` y no con
 * `display: none` ni `visibility: hidden`, que sí pausan la animación.
 *
 * El emblema **es** el link: `<a>` con el GIF dentro y el nombre accesible en
 * un `.ttx-oculto` (`catalogo.css:224-231`). Apagado también deja de ser
 * alcanzable —ni con el ratón ni con Tab—, o habría tres links invisibles
 * repartidos por la pantalla.
 *
 * La posición es el centro, en porcentaje del campo, en dos variables que el
 * CSS traduce a `left`/`top` con un `translate(-50%,-50%)`. Que sea el centro
 * es lo que le da el **derecho a cortarse**: un emblema en el 2% de la
 * izquierda sale con la mitad afuera y el marco lo corta. Que vaya en
 * porcentaje evita medir el campo desde el JS y de paso el emblema no se
 * descoloca si la ventana cambia de tamaño mientras se ve. Las escribe
 * `crearEstado` al encender; aquí solo nace en el centro, donde nadie lo ve.
 */
function crearEmblema(dj, quieto) {
  return elemento(
    'a',
    {
      class: 'ttx-about-emblema',
      // Apagado y fuera del alcance: `inert` le quita el clic y el Tab sin
      // tocar cómo se pinta, que es justo lo que no se puede tocar aquí.
      'data-apagado': '',
      inert: '',
      href: dj.instagram,
      target: '_blank',
      rel: 'noopener',
    },
    // `alt` vacío a propósito: el nombre accesible lo pone el texto oculto de
    // al lado. Con los dos, el lector de pantalla lo diría dos veces.
    elemento('img', { src: quieto ? dj.quieto : dj.emblema, alt: '', draggable: 'false' }),
    elemento('span', { class: 'ttx-oculto' }, `${dj.nombre} on Instagram`),
  );
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
