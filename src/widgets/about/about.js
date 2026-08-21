import { registrar } from '../_runtime/mount.js';
import { cargarAbout, urlMedia } from '../_runtime/datos.js';
import { crearStack, precargar } from '../_runtime/stack.js';
import { elemento } from '../_runtime/dom.js';
import { maquina, NAV } from '../_runtime/escribir.js';
import { partir, grupos } from '../_runtime/format.js';
import './about.css';

// El About: un solo renglón de texto y dos gestos que se sostienen con la mano.
// El ensayo es **no verbal** — el third space se demuestra, no se explica.
//
//   REPOSO
//   ┌──────────────────────────────────────────────────────────────────┐
//   │ TRA      TRA      TRAX          A RECORD LABEL RUN BY__ DJ LOMA… │
//   │        └ la grieta ┘                                             │
//   │                        gris y nada más                           │
//   └──────────────────────────────────────────────────────────────────┘
//
//   LA MANO EN LA GRIETA
//   ┌──────────────────────────────────────────────────────────────────┐
//   │ TRA TRA TRAX  A RECORD LABEL RUN BY__ DJ LOMA…  SONIC HUSTLERS__ │
//   │ SINCE 2020  INSTAGRAM  YOUTUBE  BANDCAMP  BOOKINGS: CARIN@…      │
//   └──────────────────────────────────────────────────────────────────┘
//
// **La grieta es el hueco dentro del nombre del sello.** No es una banda, no es
// un emblema deformado y no es una cuarta fila: son las tres sílabas de
// `TRA · TRA · TRAX` abiertas a lo ancho de la pantalla, y el aire que queda
// entre ellas es lo que se cierra con la mano. Lo que **escucha** la mano es
// otra cosa —la banda entera, que no se mueve; ver `disparos`— y esa distinción
// es lo único no obvio de este widget. Pasar por ahí **cierra la grieta**
// —las sílabas se juntan hacia la izquierda— y en el espacio que sueltan entra
// el resto de la línea: el lema, las tres redes y la línea de bookings.
//
// Esa es la lectura del third space que sí funciona en pantalla: el hueco no
// deforma lo que pasa por él, **el hueco es donde cabe lo que no estaba
// dicho**. La versión anterior —el emblema aplastado de borde a borde— se
// quitó en julio y no vuelve; esta es otra cosa y vive dentro del texto.
//
// **No hay tercera banda.** El About usa el stack sin visor: banda y contenido,
// nada más. `about.css` esconde el visor que `crearStack` crea igual.
//
// El campo de las apariciones **es toda la ventana**, y ahora con **zona
// segura**: el azar sigue siendo puro, pero ningún emblema sale medio comido
// por el borde. El JS solo sortea dos números de 0 a 1; el recorte lo hace el
// CSS con el tamaño real del emblema. (Antes la zona era la mitad derecha y el
// corte contra el borde se defendía como intencional. El sello lo reportó como
// problema en las capturas del 19 de agosto de 2026: siempre a la derecha, y
// cortados en teléfono. Se corrigieron las dos cosas.)
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
//   - **La grieta cuenta el mismo reloj**, con su propio número (`LINGER`):
//     mientras haya mano no hay reloj, y volver antes de que se cumpla cancela
//     la cola. Es la misma disciplina, no una copia — las dos salen de
//     `crearGesto`.
//   - **Hay un solo emblema por DJ y nunca se va del DOM**, solo se apaga
//     (`about.css`, la regla de `[data-apagado]`). Un
//     GIF que se quita y se vuelve a poner reinicia su animación y el santo
//     saldría siempre en el mismo cuadro; dejándolo puesto, el loop sigue
//     corriendo por debajo y cada aparición lo agarra donde vaya.
//   - **El azar es puro dentro de la zona.** No hay retícula y no hay memoria de
//     posición: puede quedar en una esquina ridícula y dos pueden caer encima.
//     Lo único que se le quitó es el derecho a cortarse contra el borde. Lo que
//     sí es fijo es que **el sitio se sortea al aparecer, nunca mientras se
//     ve**.
//   - **El santo es el link**, no el nombre. El nombre solo invoca; clic en el
//     emblema lleva al Instagram de ese DJ. Un link que hay que cazar.
//
// Opciones que acepta el placeholder de Cargo:
//   <div data-ttx="about"></div>
//   <div data-ttx="about" data-vida="2000"></div>     ← ms de cola del emblema
//   <div data-ttx="about" data-grieta="2500"></div>   ← ms de cola de la grieta
//   <div data-ttx="about" data-letra="40"></div>      ← ms por letra de la entrada

/**
 * **La cola del emblema**: lo que la aparición se queda después de que la mano
 * se fue. El reloj arranca cuando el gesto termina: mientras haya mano no hay
 * reloj.
 *
 * Segundo y medio es lo que alcanza para soltar el nombre y llegar al emblema
 * con el ratón —que es cómo se caza el link— sin que la imagen se instale.
 * Se calibra con `data-vida` en el placeholder, igual que `data-minimo` en el
 * home.
 */
const VIDA = 1500;

/**
 * **La cola de la grieta.** El mismo número, y a propósito: la línea abierta
 * trae tres links y un correo, y hay que poder salirse de la grieta y llegar a
 * ellos sin que se cierre en la cara. Se calibra con `data-grieta`.
 */
const LINGER = 1500;

/**
 * **Lo que tarda el hueco en hacerse**, y por lo tanto lo que espera la primera
 * letra antes de salir. Es `--ttx-dur` (0,5s) por el `0.4` con el que la entrada
 * ya retrasaba su aparición en `about.css`: primero se hace el sitio y después
 * llega el texto, nunca al revés — que se vería como una línea empujando a la
 * otra.
 *
 * Está escrito aquí porque el JS no puede leer un `calc()` de un token; si
 * `--ttx-dur` se mueve, esto se mueve.
 */
const ESPERA = 200;

/**
 * **Y lo que tarda en cerrarse**, que es el techo del borrado entero.
 *
 * Escribir puede tomarse su tiempo —es lo que hay que leer— pero borrar no: el
 * hueco se cierra en `--ttx-dur` y lo que quede escrito se vería recortándose
 * contra el borde mientras se encoge. Así que el borrado corre a los 30ms por
 * letra del nav mientras quepa, y se acelera cuando no. Con la línea entera del
 * sello no cabe ni de lejos, así que en la práctica se va de un tirón: la salida
 * es el hueco cerrándose, no un desescribirse.
 */
const CIERRE = 500;

/** Lo que separa un nombre del siguiente. No es una junta: es parte del texto. */
const BARRA = ' / ';

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
  const { texto, grieta, extra, vivo } = crearTexto(about, estados);
  banda.append(texto);

  // La máquina de escribir de la entrada. Los números son los del lema del nav
  // —es el mismo gesto y tiene que sonar igual— con una sola excepción, el
  // borrado: ver `escribir.js` y `--ttx-dur`.
  const letras = maquina(vivo, {
    paso: Number(host.dataset.letra) || NAV.paso,
    espera: ESPERA,
    techoBorrado: CIERRE,
  });

  const abrir = crearGesto({
    vida: Number(host.dataset.grieta) || LINGER,
    encender(fuente) {
      host.setAttribute('data-abierto', '');
      grieta.setAttribute('aria-expanded', 'true');
      extra.removeAttribute('inert');
      letras.abrir(fuente === 'tecla' || menos.matches);
    },
    apagar(fuente) {
      host.removeAttribute('data-abierto');
      grieta.setAttribute('aria-expanded', 'false');
      extra.setAttribute('inert', '');
      letras.cerrar(fuente === 'tecla' || menos.matches);
    },
  });

  const soltarDisparos = disparos(host, [
    // **La bisagra es la banda entera**, no el botón de las sílabas.
    //
    // Con el botón, la línea se cerraba sola y de dos maneras. Una: al abrirse,
    // las sílabas se corren hacia la izquierda —eso *es* la grieta cerrándose—
    // y el botón se salía de debajo del cursor quieto, que disparaba
    // `pointerleave`, que cerraba, que devolvía las sílabas debajo del cursor,
    // que volvía a abrir. Un ciclo, con la mano quieta. Y dos: irse hacia los
    // nombres de los DJs o hacia los links era salirse del botón, así que lo
    // que se abría no se podía tocar.
    //
    // Las dos salen del mismo error —hacer bisagra de algo que se mueve— y por
    // eso el arreglo es uno solo: la que escucha es una caja que no se mueve
    // nunca y que contiene todo lo que hay que poder alcanzar. El botón sigue
    // existiendo para el teclado y el lector de pantalla, que es para lo que
    // estaba.
    //
    // Va **trabada en tacto**: en teléfono un toque la abre y se queda abierta
    // hasta que se toque en otra parte. Es la excepción a la regla de "soltar el
    // dedo suelta el gesto", y la razón es que lo que aparece son links de
    // verdad —las tres redes y el correo—; con la cola de siempre habría que
    // atinarles en segundo y medio.
    {
      el: banda,
      foco: grieta,
      gesto: abrir,
      dentro: (n) => Boolean(n) && banda.contains(n),
      trabar: true,
    },
    ...estados.map((est) => ({ el: est.boton, gesto: est.gesto, dentro: est.tieneFoco })),
  ]);

  // La preferencia se puede cambiar con la página abierta: ahí hay que
  // cambiarle el archivo al emblema, que ya no se vuelve a crear nunca.
  const soltarMenos = escuchar(menos, () => {
    for (const est of estados) est.revisarMovimiento();
  });

  return {
    destruir() {
      soltarDisparos();
      soltarMenos();
      abrir.cerrar();
      letras.soltar();
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
 * El único texto de la página, en **un solo renglón** de punta a punta, y en
 * cuatro piezas de las que solo se ven dos en reposo:
 *
 *   TRA    TRA    TRAX  ·hueco·  A RECORD LABEL RUN BY__ DJ …  ⟨lo que entra⟩
 *   └─── la grieta ───┘          └────────── el sello ───────┘ └─ la entrada ─┘
 *
 * **La grieta no lleva medidas escritas.** Las sílabas se abren porque el
 * `flex` reparte lo que sobra de la barra entre ellas y el hueco que va antes
 * del sello (`about.css`, `--ttx-about-grieta-crece` y `--ttx-about-hueco-crece`).
 * Cuando la entrada se despliega deja de sobrar, y las sílabas se cierran
 * solas: no hay una animación del `gap`, hay una sola cosa que se anima —el
 * ancho de la entrada— y la grieta es su consecuencia. Por eso no hay nada que
 * medir desde el JS y nada que se descuadre al cambiar el ancho de la ventana.
 *
 * **La alternancia arranca en liviano y se reinicia en cada enunciado.** Así
 * están las capturas del sello:
 *
 *   A RECORD LABEL RUN BY__ DJ LOMALINDA / NYKSAN / VERRACO
 *   ░░░░░░░░░░░░░░░░░░░░░░  ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉
 *   SONIC HUSTLERS__ SINCE 2020
 *   ░░░░░░░░░░░░░░░  ▉▉▉▉▉▉▉▉▉▉
 *
 * y por eso son dos llamadas a `grupos`, no una: cada enunciado empieza su
 * propia cuenta. Lo que separa un enunciado del otro es **el aire**, sin `__`
 * de por medio — las dos separaciones son distintas y viven en `tokens.css`
 * (`--ttx-junta` y `--ttx-aire`).
 *
 * **Los tres nombres son un solo grupo**, separados por `/` y en el peso fuerte
 * que les toca por cerrar el enunciado. Antes iban repartidos en la alternancia
 * —un nombre fuerte, otro liviano— y las capturas lo corrigen: se leen como una
 * lista, no como más campos de la frase. Cada uno sigue siendo un `<button>` de
 * verdad, así que el teclado sale gratis; lo que cambió es que el peso ya no es
 * de cada nombre sino del grupo que los contiene.
 *
 * Nada de comas ni de "and". La línea se **compone** desde `about.json` para
 * que los nombres y sus disparadores tengan una sola fuente — agregar un cuarto
 * DJ es agregarlo al JSON, no editar una frase en un sitio y una lista en otro.
 */
function crearTexto(about, estados) {
  // Enunciado 1: la frase del sello y los tres nombres, que son su último
  // grupo. Van en la misma llamada porque el peso de los nombres sale de la
  // alternancia de la frase, no de una regla aparte.
  const frase = partir(about.sello);
  const sello = grupos([...frase, estados.map((est) => est.nombre).join(BARRA)]);
  const nombres = sello[sello.length - 1];

  const grieta = elemento(
    'button',
    {
      class: 'ttx-about-grieta',
      type: 'button',
      'aria-expanded': 'false',
      // Lo que hace, dicho para quien no lo puede pasar con la mano. El nombre
      // del sello ya está en las sílabas de adentro.
      'aria-label': `${(about.silabas ?? []).join('')} — opens the rest of the line`,
    },
    ...(about.silabas ?? []).map((s) => elemento('span', { class: 'ttx-about-silaba' }, s)),
  );

  // Lo que entra en la grieta, que se construye **dos veces**. Ver el eco más
  // abajo: uno se escribe y el otro le sostiene el sitio.
  const dentro = () => [
    // Enunciado 2: el lema. Cuenta propia, arranca en liviano.
    elemento('span', { class: 'ttx-about-bloque' }, ...grupos(partir(about.lema)).map(crearCampo)),
    // Enunciados 3, 4 y 5: las tres redes del sello. Una cada uno —por eso
    // ninguna lleva junta y todas van livianas—, separadas por el aire.
    ...(about.redes ?? [])
      .filter((r) => r?.nombre && r?.url)
      .map((r) => crearEnlace(r.nombre, r.url)),
    // Y el correo, que es un grupo solo: los dos puntos y el espacio son
    // parte del texto, no una junta. Es la única línea del sitio con un signo
    // adentro y así llegó de las capturas.
    about.bookings?.texto &&
      crearEnlace(about.bookings.texto, `mailto:${about.bookings.email || about.bookings.texto}`, {
        fuera: false,
      }),
  ];

  // **El eco**: la misma línea, completa, invisible y fuera del alcance. Es lo
  // que le reserva el ancho a la que se escribe.
  //
  // Sin él, el ancho de la entrada sería el del texto tecleado hasta ahora, y
  // entonces la grieta se cerraría al ritmo de la escritura —cuatro segundos de
  // sílabas arrastrándose— en vez de cerrarse de una, que es la animación que
  // ya estaba y que es la que se queda. Con el eco, lo que se anima sigue siendo
  // una sola cosa, el hueco, y el texto se escribe **dentro** de un sitio que ya
  // está hecho. Eso es lo que arregla de paso el desorden de teléfono: la línea
  // envuelta no se vuelve a repartir con cada letra, porque su reparto lo fijó
  // el eco.
  //
  // `inert` propio y no heredado: la entrada se lo quita al abrirse y el eco
  // tiene que seguir siendo intocable — son cuatro links repetidos.
  const vivo = elemento('span', { class: 'ttx-about-vivo' }, ...dentro());

  const extra = elemento(
    'span',
    // Nace cerrado y **fuera del alcance**: adentro hay cuatro links y sin el
    // `inert` se podría tabular a ellos con la línea cerrada, que es tabular al
    // vacío. Es la misma regla del emblema apagado.
    { class: 'ttx-about-entrada', inert: '' },
    elemento(
      'span',
      { class: 'ttx-about-entrada-in' },
      elemento(
        'span',
        { class: 'ttx-about-eco', 'aria-hidden': 'true', inert: '' },
        ...dentro(),
      ),
      vivo,
    ),
  );

  const texto = elemento(
    'p',
    { class: 'ttx-about-texto' },
    grieta,
    // El hueco entre la grieta y el sello. Es un elemento y no un `gap` porque
    // tiene que **crecer distinto** que el aire de entre sílabas: en reposo el
    // sello se va contra el borde derecho y este hueco es el que se lleva la
    // diferencia.
    elemento('span', { class: 'ttx-about-hueco', 'aria-hidden': 'true' }),
    elemento(
      'span',
      { class: 'ttx-about-bloque' },
      ...sello.slice(0, -1).map(crearCampo),
      crearNombres(nombres, estados),
    ),
    extra,
  );

  return { texto, grieta, extra, vivo };
}

/** Un grupo ya resuelto por `format.js:grupos`: su texto y sus dos clases. */
function crearCampo({ texto, clase }) {
  return elemento('span', { class: clase }, texto);
}

/**
 * El grupo de los nombres: un solo `<span>` con el peso del grupo y los tres
 * `<button>` adentro, separados por la barra. El peso lo hereda cada botón del
 * span que los envuelve, así que ninguno lo lleva escrito.
 */
function crearNombres({ clase }, estados) {
  const span = elemento('span', { class: clase });
  for (const [i, est] of estados.entries()) {
    if (i) span.append(BARRA);
    span.append(est.boton);
  }
  return span;
}

/**
 * Un enunciado que es un link y nada más: una red o el correo. Liviano porque
 * es el grupo 0 de su propio enunciado, y sin junta porque también es el
 * último.
 */
function crearEnlace(texto, href, { fuera = true } = {}) {
  return elemento(
    'a',
    {
      class: 'ttx-about-enlace ttx-suave',
      href,
      target: fuera && '_blank',
      rel: fuera && 'noopener',
    },
    texto,
  );
}

// ── Los gestos ──────────────────────────────────────────────────────────

/**
 * El reloj de un gesto que se sostiene con la mano. Lo usan los dos gestos de
 * la página —el emblema de un DJ y la grieta— y por eso vive aparte: la
 * disciplina es la misma y no puede haber dos versiones de ella.
 *
 * **Las fuentes se cuentan, no se pisan.** El mismo disparador puede estar
 * activo por el ratón y por el teclado a la vez (foco puesto y el puntero
 * encima), y soltar una no puede apagar la otra. Es el `mano` del home, con
 * nombre.
 *
 * Tres reglas:
 *
 *   1. Se enciende cuando llega la primera fuente.
 *   2. Mientras haya una fuente puesta **no hay reloj**: no se recicla, no se
 *      resortea y no se apaga por su cuenta.
 *   3. Cuando se va la última fuente arranca la cola de `vida` ms. Volver antes
 *      de que se cumpla **cancela la cola sin volver a encender**: `encender`
 *      no se llama dos veces seguidas, así que el emblema no brinca a otro
 *      sitio con la mano encima.
 */
function crearGesto({ vida, encender, apagar }) {
  const fuentes = new Set();
  let vivo = false;
  let timer = null;

  const parar = () => {
    clearTimeout(timer);
    timer = null;
  };

  return {
    activar(f) {
      fuentes.add(f);
      parar();
      if (vivo) return;
      vivo = true;
      // Quién lo encendió va con el aviso: es lo único que le permite a la
      // grieta escribir letra por letra con la mano y de un golpe con el
      // teclado. A quien tabula no se le puede hacer esperar cuatro segundos a
      // que salga el link que va a buscar.
      encender(f);
    },

    desactivar(f) {
      if (!fuentes.delete(f)) return;
      // Queda otra mano puesta: no empieza a contar nada.
      if (fuentes.size || !vivo) return;
      parar();
      timer = setTimeout(() => {
        timer = null;
        vivo = false;
        apagar(f);
      }, vida);
    },

    /** ¿Está activo por esta fuente? Lo pregunta `disparos` para el teclado. */
    tiene: (f) => fuentes.has(f),
    /** ¿Está encendido ahora mismo? */
    vivo: () => vivo,

    /** Cierre inmediato, sin cola: el desmontaje del widget. */
    cerrar() {
      fuentes.clear();
      parar();
      if (!vivo) return;
      vivo = false;
      // Como si lo cerrara el teclado: sin animación. Lo que viene después de
      // esto es que el widget desaparece.
      apagar('tecla');
    },
  };
}

// ── Las apariciones ─────────────────────────────────────────────────────

/**
 * El estado de un DJ. No hay estado global: no hay cola, no hay uno-a-la-vez,
 * no hay nada que coordinar entre los tres. Cada uno tiene su `crearGesto` y
 * eso es todo.
 *
 * El emblema no se crea ni se destruye nunca —eso lo hace `crearEmblema`, una
 * sola vez— porque quitar un GIF del DOM le reinicia la animación.
 */
function crearEstado(dj, { campo, vida, menos }) {
  const el = crearEmblema(dj, menos.matches);
  const boton = crearBoton(dj);
  campo.append(el);

  const gesto = crearGesto({
    vida,
    encender() {
      // El sorteo ocurre aquí y solo aquí: apagado el emblema, nadie lo ve
      // moverse. Con el emblema encendido `crearGesto` ya no vuelve a llamar.
      //
      // Salen dos números de 0 a 1, no dos porcentajes. **La zona y la zona
      // segura las pone el CSS** —toda la ventana, encogida en medio emblema
      // por cada lado— y esto es solamente el azar: dónde cae dentro de ella.
      // Poner el recorte aquí obligaría al JS a saber de anchos de pantalla y
      // del tamaño del emblema, que es lo único que este widget nunca ha
      // tenido que saber.
      el.style.setProperty('--ttx-about-rx', Math.random().toFixed(4));
      el.style.setProperty('--ttx-about-ry', Math.random().toFixed(4));
      el.removeAttribute('data-apagado');
      el.removeAttribute('inert');
    },
    apagar() {
      el.setAttribute('data-apagado', '');
      el.setAttribute('inert', '');
    },
  });

  return {
    boton,
    gesto,
    nombre: dj.nombre,

    /** ¿El foco está dentro de su emblema encendido? El caso de tabular hasta el santo. */
    tieneFoco: (nodo) => Boolean(gesto.vivo() && nodo && el.contains(nodo)),

    /** Cambió `prefers-reduced-motion` con la página abierta. */
    revisarMovimiento() {
      const url = menos.matches ? dj.quieto : dj.emblema;
      const img = el.querySelector('img');
      if (img && img.src !== url) img.src = url;
    },

    soltar: gesto.cerrar,
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
 * La posición son dos números de 0 a 1 que el CSS traduce a `left`/`top` **y a
 * un `translate` del mismo porcentaje**: con 0 el emblema se apoya en el borde
 * de arranque, con 1 en el de llegada y con 0.5 queda centrado. Ese es todo el
 * truco de la zona segura, y es lo que permite que el CSS la calcule con el
 * tamaño real del emblema —que es distinto en cada uno: hay uno cuadrado, uno
 * alto y uno apaisado— sin que el JS tenga que medir nada. Las escribe
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
 * **La pieza trabada es la excepción en tacto.** La grieta no se suelta al
 * levantar el dedo: se queda abierta hasta que se toque fuera de ella y fuera
 * de lo que abrió. Es lo que hace que en teléfono se pueda tocar `INSTAGRAM` o
 * el correo, que son links de verdad. Los emblemas no la usan: ahí el link es
 * el santo y cazarlo *es* el gesto.
 *
 * **El teclado se suelta distinto**, y es la única complicación de este widget.
 * Tabular desde el disparador lleva justamente a lo que abrió —el emblema o la
 * entrada, que están después en el DOM— así que si el `blur` lo cerrara, no
 * habría nada que alcanzar: el foco se iría al vacío en el mismo fotograma en
 * que lo va a buscar. Por eso no se mira el evento sino **dónde aterrizó el
 * foco**, un cuadro después: si sigue dentro del disparador o dentro de lo que
 * abrió, el gesto sigue activo.
 */
function disparos(host, piezas) {
  const ac = new AbortController();
  const { signal } = ac;
  const raton = (e) => e.pointerType === 'mouse';

  for (const p of piezas) {
    const on = (tipo, fn) => p.el.addEventListener(tipo, fn, { signal });

    on('pointerenter', (e) => raton(e) && p.gesto.activar('raton'));
    on('pointerleave', (e) => raton(e) && p.gesto.desactivar('raton'));

    on('pointerdown', (e) => {
      if (raton(e)) return;
      // Con la captura, soltar el dedo fuera del disparador sigue avisando
      // aquí; sin ella un deslizamiento hacia afuera dejaba el gesto corriendo
      // para siempre. La pieza trabada no la pide: no escucha el `pointerup`.
      if (!p.trabar) {
        try {
          p.el.setPointerCapture(e.pointerId);
        } catch {
          /* el navegador no la da: `pointercancel` sigue cubriendo el caso */
        }
      }
      p.gesto.activar('tacto');
    });

    if (!p.trabar) {
      on('pointerup', (e) => !raton(e) && p.gesto.desactivar('tacto'));
      on('pointercancel', (e) => !raton(e) && p.gesto.desactivar('tacto'));
    }

    // **La mano y el foco no siempre escuchan al mismo elemento.** En la grieta
    // la mano escucha la banda entera —una caja que no se mueve— pero el foco
    // solo puede estar en algo que se pueda tabular, que es el botón de las
    // sílabas. `foco` es ese, cuando son distintos.
    //
    // Solo el foco de teclado. Un clic del ratón también da foco, y ahí el
    // `pointerleave` ya se encarga: sin este filtro, hacer clic en un nombre
    // dejaría su emblema clavado en pantalla hasta que el foco se fuera.
    const focal = p.foco ?? p.el;
    focal.addEventListener('focus', () => tecla(focal) && p.gesto.activar('tecla'), { signal });
  }

  // El destrabe. Va en el documento y **en captura**, que es lo que lo hace
  // correcto: el mismo toque que abre la grieta pasa por aquí antes de llegar
  // al botón, y en ese momento el `contains` ya dice que sí — así que no se
  // cierra a sí misma.
  const trabadas = piezas.filter((p) => p.trabar);
  if (trabadas.length) {
    document.addEventListener(
      'pointerdown',
      (e) => {
        if (raton(e)) return;
        for (const p of trabadas) {
          if (p.el.contains(e.target) || p.dentro(e.target)) continue;
          p.gesto.desactivar('tacto');
        }
      },
      { signal, capture: true },
    );
  }

  const revisarFoco = () => {
    const foco = document.activeElement;
    for (const p of piezas) {
      if (!p.gesto.tiene('tecla')) continue;
      if (foco === (p.foco ?? p.el) || p.dentro(foco)) continue;
      p.gesto.desactivar('tecla');
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
