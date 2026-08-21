import { registrar } from '../_runtime/mount.js';
import { cargar, cargarHome, urlMedia } from '../_runtime/datos.js';
import { crearStack } from '../_runtime/stack.js';
import { elemento } from '../_runtime/dom.js';
import { maquina } from '../_runtime/escribir.js';
import { cover, nombresArtistas, grupos, partir } from '../_runtime/format.js';
import './home.css';

// El home: el lanzamiento, y nada más. En reposo no hay composición: hay una
// **cenefa** —el video ocupando solo la franja del título, de borde a borde,
// sobre negro— y el nombre del disco encima. Tomar la franja con la mano es lo
// que abre esa grieta en las dos cajas del lanzamiento.
//
//   REPOSO            la cenefa: el video vive dentro de la franja del título
//   MANO ENCIMA A     la grieta se abre — arte arriba, video abajo
//   MANO ENCIMA B     la grieta se abre al revés — video arriba, arte abajo
//
// La composición **es el gesto**: existe mientras alguien la sostiene y se
// vuelve a cerrar al soltarla. Y cada pasada abre la contraria de la anterior,
// porque el cambio de A a B ocurre al cerrar, con la cenefa ya en pantalla:
// nadie ve el cambio, uno vuelve a pasar y encontró la otra. Corte seco en las
// tres transiciones.
//
// Hay una sola **capa** debajo de todo, cubre el host entero y nunca para. Lo
// único que cambia entre los tres estados es el rectángulo por el que se ve, y
// como los tres recortes son un rectángulo simple, los tres son un `clip-path:
// inset()` que vive en el CSS.
//
// **Esa capa es un video, o es el arte quieto.** Un lanzamiento puede no tener
// pieza audiovisual, y eso no es un home degradado: es la otra forma que tiene
// este home. La grieta se abre igual, la composición se turna igual y el filtro
// se sortea igual —lo que se ve por el hueco es una imagen en vez de un video, y
// ya—. Antes esto era un `data-respaldo` que pintaba el arte de lado a lado, sin
// grieta y con el filtro sorteado una sola vez por carga: había que recargar la
// página para ver otro filtrado. Ese era el bug, y salía de tratarlo como una
// caída y no como un estado.
//
// Todo el estado del widget son tres atributos en el host:
//
//   data-home="a|b"                    cuál composición abre la próxima pasada
//   data-abierto                       mientras la composición está abierta
//   data-fx="ninguno|arriba|abajo|ambos"  qué módulo lleva el gooey esta vez
//
// No hay animación que cancelar, no hay posición que recalcular, no hay video
// que resincronizar.
//
// **El lanzamiento es un release del catálogo** (`datos.js:cargarHome`), no un
// objeto suelto: el título, los artistas y los dos links salen de
// `releases.json` y lo único que dice `home.json` es cuál. Un lanzamiento por
// anunciar es un release con `visible: false` y su bloque `home` lleno.
//
// Opciones que acepta el placeholder de Cargo:
//   <div data-ttx="home"></div>
//   <div data-ttx="home" data-sin-video></div>  ← fuerza la versión sin pieza audiovisual
//   <div data-ttx="home" data-minimo="140"></div>  ← ms mínimos entre cambios
//   <div data-ttx="home" data-letra="30"></div>    ← ms por letra de `BUY__ LISTEN`
//   <div data-ttx="home" data-catalogo="/catalog"></div>  ← a dónde lleva el título

/**
 * Lo mínimo que dura un estado antes de que pueda entrar el siguiente.
 *
 * **No es un retardo.** Entrar al título cambia la pantalla en el acto; lo que
 * se controla es lo de después: pasar el ratón por encima muy rápido abría y
 * cerraba la composición en el mismo fotograma y se leía como un parpadeo. Con
 * 100 ms de piso cada estado alcanza a existir, y la pasada se ve como una
 * decisión y no como un glitch.
 *
 * Nada se descarta por el camino: lo que llega antes de tiempo espera su turno.
 * Se calibra con `data-minimo` en el placeholder.
 */
const MINIMO = 100;

/**
 * El respiro del teléfono. Cinco segundos de franja, un destello de composición
 * y otra vez la franja. En pantalla ancha no corre: ahí está la mano.
 */
const OCIO = 5000;
const DESTELLO = 1000;

/**
 * **La velocidad de `BUY__ LISTEN`.** Los links no aparecen: se escriben, con
 * el mismo gesto del lema del nav —letra por letra, el cursor arrastrando su
 * residuo— pero corriendo. El nav teclea a 58ms porque allá el lema es lo que
 * hay que leer; aquí la escritura es lo que le da cuerpo a una aparición que en
 * seco se leía como un parpadeo, y tiene que caber dentro del gesto de pasar la
 * mano. A 30ms los nueve caracteres entran en un cuarto de segundo.
 *
 * Se calibra con `data-letra` en el placeholder.
 */
const LETRA = 30;

/** Dónde vive el catálogo en Cargo. Se pisa con `data-catalogo`. */
const CATALOGO = '/catalog';

registrar('home', async (host) => {
  const datos = await cargar();
  // El destacado manda; si no hay, el release visible más reciente.
  const destacado = await cargarHome();
  const pieza = destacado ? piezaDestacada(destacado, datos) : piezaReciente(datos);

  if (!pieza) {
    host.replaceChildren(elemento('p', { class: 'ttx-error' }, 'No hay nada que anunciar.'));
    return;
  }

  // El stack de siempre, con banda: el visor es la caja de arriba, la banda es
  // la franja del lanzamiento y el contenido es la caja de abajo. Los alias los
  // pone el CSS para poder leer las reglas como se lee el dibujo.
  const { banda, visor: arriba, contenido: abajo } = crearStack(host, { banda: true });
  arriba.classList.add('ttx-home-caja', 'ttx-home-arriba');
  abajo.classList.add('ttx-home-caja', 'ttx-home-abajo');

  host.style.setProperty('--ttx-home-arte', `url("${pieza.arte}")`);
  host.dataset.home = 'a';

  // La capa: el video si lo hay, el arte quieto si no. Va antes del marco
  // porque es el papel sobre el que se compone todo lo demás, y el marco va
  // encima con el fondo transparente. Las dos llevan la misma clase: el
  // recorte, la capa y el filtro son los mismos, y ninguna regla del CSS tiene
  // que preguntar cuál de las dos está puesta.
  // `data-sin-video` en el placeholder fuerza la versión sin pieza
  // audiovisual, para poder verla sin tener que quitarle el video al release.
  const forzado = host.hasAttribute('data-sin-video');
  const video = pieza.video && !forzado ? crearVideo(pieza.video) : null;
  if (!video) host.dataset.sinVideo = '';
  host.prepend(video ?? crearLienzo());

  const { links } = crearFranja(banda, pieza, {
    catalogo: host.dataset.catalogo || CATALOGO,
  });

  const letras = maquina(links, {
    paso: Number(host.dataset.letra) || LETRA,
    jitter: (Number(host.dataset.letra) || LETRA) / 2,
    borrado: Number(host.dataset.letra) || LETRA,
    jitterBorrado: (Number(host.dataset.letra) || LETRA) / 2,
  });

  const est = estado(host, Number(host.dataset.minimo) || MINIMO, sorteoFx(), letras);

  const soltarMedidas = medir(host, arriba, banda);
  const soltarDisparos = disparos(banda, est);
  const soltarNavegacion = navegacion(banda.querySelector('.ttx-home-titulo'));
  const soltarOcio = ocio(host, est);
  const soltarMovimiento = video ? movimiento(video) : () => {};

  return {
    destruir() {
      soltarMedidas();
      soltarDisparos();
      soltarNavegacion();
      soltarOcio();
      soltarMovimiento();
      letras.soltar();
      est.soltar();
    },
  };
});

// ── De dónde sale la pieza ──────────────────────────────────────────────

/**
 * El release destacado, con su bloque `home`.
 *
 * La franja se compone del propio release —`Killing Mariposas__ Luca Durán`—
 * salvo que el sello haya escrito `home.texto`, que la reemplaza entera y se
 * escribe con la sintaxis de juntas (`*`), igual que el About:
 *
 *   "No pare, sigue sigue 4*Various Artists"
 *
 * **Sin fecha ni número de catálogo.** Estaban, y las capturas del sello los
 * quitaron: la franja son dos grupos, el disco y quién.
 */
function piezaDestacada(r, { indiceArtistas }) {
  const propios = partir(r.home?.texto);
  const textos = propios.length ? propios : [r.album, nombresArtistas(r.artists, indiceArtistas)];

  return {
    id: r.id,
    grupos: textos.filter(Boolean),
    arte: urlMedia(r.home.arte),
    video: r.home.video?.mp4
      ? { mp4: urlMedia(r.home.video.mp4), poster: urlMedia(r.home.video.poster) }
      : null,
    compra: r.purchaseUrl || '',
    escucha: r.listenUrl || '',
    // Un anuncio (`visible: false`) todavía no está en el catálogo: el título
    // no puede llevar a una página donde no aparece.
    enlazable: r.visible !== false,
  };
}

/**
 * Cuando `home.json` no dice nada: el release visible más reciente, con el
 * mismo orden que manda en el catálogo. Nunca un home roto ni uno que muestre
 * lo de hace ocho meses.
 *
 * No trae video —el bloque `home` de un release es lo que lo trae, y este no lo
 * tiene— así que sale la versión sin pieza audiovisual. **Que es un home
 * entero**: la misma cenefa, la misma grieta y el mismo sorteo de filtro, con
 * el arte quieto en la capa. Ver `crearLienzo`.
 */
function piezaReciente({ releases, indiceArtistas }) {
  const r = releases
    .filter((x) => x.visible !== false)
    .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || b.date.localeCompare(a.date))[0];

  if (!r) return null;

  return {
    id: r.id,
    grupos: [r.album, nombresArtistas(r.artists, indiceArtistas)].filter(Boolean),
    arte: r.home?.arte ? urlMedia(r.home.arte) : cover(r.bcImageId, 10),
    video: null,
    compra: r.purchaseUrl || '',
    escucha: r.listenUrl || '',
    enlazable: true,
  };
}

// ── DOM ─────────────────────────────────────────────────────────────────

function crearVideo({ mp4, poster }) {
  const v = elemento('video', {
    class: 'ttx-home-video',
    src: mp4,
    poster: poster || false,
    'aria-hidden': 'true',
    tabindex: '-1',
    disablepictureinpicture: '',
  });

  // Como propiedades, no solo como atributos: Safari mira la propiedad para
  // decidir si deja arrancar el video solo, y con el atributo puesto por
  // `setAttribute` a veces llega tarde. El archivo va sin pista de audio de
  // todos modos — pesa menos y no hay nada que un navegador pueda bloquear.
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = 'auto';
  v.controls = false;
  return v;
}

/**
 * La capa cuando el lanzamiento no tiene pieza audiovisual: el mismo arte,
 * quieto, en el mismo sitio donde iría el video.
 *
 * Lleva la clase del video a propósito, y no una suya con las reglas copiadas.
 * Todo lo que el CSS sabe hacerle a esa capa —el recorte de los tres estados,
 * el z-index, el gooey cuando le toca— tiene que valer igual aquí, y la única
 * forma de que no se desincronicen es que sea literalmente el mismo selector.
 * Lo suyo propio es una línea: de dónde saca la imagen.
 *
 * Va `cover` como el video, no `100% auto` como los módulos. Es la misma
 * decisión de allá: la capa nunca es una ventana propia — cubre el host entero
 * y lo único que cambia es el rectángulo por el que se ve.
 */
function crearLienzo() {
  return elemento('div', {
    class: 'ttx-home-video ttx-home-lienzo',
    'aria-hidden': 'true',
  });
}

/**
 * La franja. Dos líneas, la misma línea:
 *
 *   reposo   NO PARE, SIGUE SIGUE 4__ VARIOUS ARTISTS
 *   abierta  NO PARE, SIGUE SIGUE 4__ VARIOUS ARTISTS__ BUY__ LISTEN
 *
 * Los cuatro son grupos del mismo enunciado, así que van por el helper de
 * siempre (`format.js:grupos`): la junta los separa y el peso alterna
 * arrancando en liviano. Se marcan **los cuatro a la vez**, aunque en reposo
 * solo se vean dos: si los links entraran con su propia numeración, `BUY`
 * arrancaría otra vez en liviano y la alternancia se partiría en la mitad de
 * la línea. Que la junta del último grupo visible no se imprima en reposo lo
 * resuelve el CSS, que es quien sabe cuáles se están viendo.
 *
 * **Dos zonas de clic dentro de la misma franja**, y por eso los links son
 * hermanos del título y no van adentro: un `<a>` dentro de otro `<a>` no es
 * HTML válido y el navegador lo desarma como puede.
 *
 * El título es link al release en el catálogo **y** sigue siendo el
 * interruptor de la composición. La regla: la mano abre, el clic navega.
 * Un anuncio que todavía no está en el catálogo no lleva a ninguna parte, y
 * ahí vuelve a ser lo que era: un botón.
 *
 * **Los dos links viven en una caja suya.** No es maquetación —el CSS no le
 * pide nada— sino de dónde agarra la máquina de escribir: lo que se teclea es
 * todo lo que hay ahí adentro, de corrido, y así el `BUY` y el `LISTEN` son una
 * sola escritura y no dos que empiezan juntas. De paso, si la línea envuelve,
 * envuelven los dos: `LISTEN` no se queda solo en el renglón de abajo.
 */
function crearFranja(banda, pieza, { catalogo }) {
  const links = [
    pieza.compra && ['Buy', pieza.compra],
    pieza.escucha && ['Listen', pieza.escucha],
  ].filter(Boolean);

  const marcas = grupos([...pieza.grupos, ...links.map(([texto]) => texto)]);
  const delTitulo = marcas.slice(0, pieza.grupos.length);
  const deLosLinks = marcas.slice(pieza.grupos.length);

  const href = pieza.enlazable ? `${catalogo}#${pieza.id}` : '';
  const titulo = elemento(
    href ? 'a' : 'button',
    {
      class: 'ttx-home-titulo',
      href: href || false,
      type: href ? false : 'button',
    },
    ...delTitulo.map((g, i) =>
      elemento(
        'span',
        {
          class: [
            CAMPOS[i] ?? 'ttx-grupo',
            g.clase,
            // Su junta existe solo porque detrás vienen los links, que en
            // reposo no están. El CSS la enciende y la apaga con ellos.
            i === delTitulo.length - 1 && deLosLinks.length && 'ttx-home-junta-links',
          ]
            .filter(Boolean)
            .join(' '),
        },
        g.texto,
      ),
    ),
    // Qué hace esto, para quien no lo ve.
    elemento(
      'span',
      { class: 'ttx-oculto' },
      href ? ' — see it in the catalog' : ' — open the composition',
    ),
  );

  const caja = elemento(
    'span',
    { class: 'ttx-home-links' },
    ...deLosLinks.map((g, i) =>
      elemento(
        'a',
        {
          class: `ttx-home-link ${g.clase}`,
          href: links[i][1],
          target: '_blank',
          rel: 'noopener',
        },
        g.texto,
        elemento('span', { class: 'ttx-oculto' }, ` — ${pieza.grupos[0]}`),
      ),
    ),
  );

  banda.append(titulo, caja);

  return { titulo, links: caja };
}

const CAMPOS = ['ttx-album', 'ttx-artistas'];

// ── Estado ──────────────────────────────────────────────────────────────

/**
 * El ciclo del filtro. Cuatro estados —ninguno, arriba, abajo, ambos— y cada
 * apertura saca uno **al azar, sin repetir el anterior**. Es azar de verdad y
 * no una rueda: una rueda se aprende en dos pasadas y deja de ser un hallazgo.
 * Lo único que se le prohíbe es repetirse seguido, que es cuando parecería que
 * el sitio no hizo nada.
 */
const ESTADOS_FX = ['ninguno', 'arriba', 'abajo', 'ambos'];

function sorteoFx() {
  let anterior = null;
  return () => {
    const opciones = ESTADOS_FX.filter((e) => e !== anterior);
    anterior = opciones[Math.floor(Math.random() * opciones.length)];
    return anterior;
  };
}

/**
 * El estado, y el ritmo mínimo al que puede cambiar la pantalla.
 *
 * Lo lógico pasa **en el acto** —si hay una mano puesta, en qué orden ocurrió
 * cada cosa— y lo que se ve pasa lo antes posible, que casi siempre es también
 * en el acto. Lo único que se impone es un piso entre un cambio y el
 * siguiente: si el anterior acaba de escribirse, este espera a que se cumplan
 * los `minimo` ms y entonces sale.
 *
 * Separar las dos cosas es lo que permite frenar sin perder nada. Una pasada
 * rápida por la franja deja dos escrituras en la cola y salen las dos, en
 * orden y espaciadas. Es lo contrario de un debounce, que era la tentación
 * obvia: un debounce se come justamente las pasadas rápidas, que son las que
 * más se sienten.
 */
function estado(host, minimo, sorteo, letras) {
  // Con la preferencia puesta no se teclea nada: los links salen y entran de
  // una. Abrir la composición sí sigue —es un corte y lo pidió la mano—, pero
  // una animación de escritura es justo lo que esa preferencia viene a apagar.
  const menos = matchMedia('(prefers-reduced-motion: reduce)');
  const cola = [];
  let timer = null;
  let mano = false;
  // El instante más temprano en que se puede volver a escribir. Arranca en el
  // pasado: el primer cambio de una racha nunca espera.
  let libre = -Infinity;

  function correr() {
    timer = null;
    if (!cola.length) return;

    const falta = cola[0].cuando - performance.now();
    if (falta > 0) {
      timer = setTimeout(correr, falta);
      return;
    }

    cola.shift().fn();
    correr();
  }

  function agendar(fn) {
    // Cada escritura reserva su turno al encolarse, no al salir: así una
    // ráfaga queda repartida de una vez y en orden, sin recalcular nada.
    const cuando = Math.max(performance.now(), libre);
    libre = cuando + minimo;
    cola.push({ fn, cuando });
    if (!timer) correr();
  }

  const voltear = () => {
    host.dataset.home = host.dataset.home === 'a' ? 'b' : 'a';
  };

  /**
   * Abrir es sortear. El filtro se decide **al abrir** y no al cerrar, al
   * revés que la composición: la composición se voltea a escondidas para que
   * uno se encuentre la otra, y el filtro tiene que estar puesto en el mismo
   * fotograma en que aparece lo que filtra. Y una vez sorteado no se mueve
   * mientras la mano siga puesta — es la misma disciplina del About.
   */
  const abrir = (ya) => {
    host.dataset.fx = sorteo();
    host.dataset.abierto = '';
    letras.abrir(ya || menos.matches);
  };

  /**
   * Cerrar y voltear son **el mismo gesto**, y en este orden. La composición
   * cambia en el fotograma en que la cenefa vuelve a tapar todo, así que el
   * cambio no se ve: uno suelta, queda la grieta, y la próxima vez que pase
   * encuentra la otra. Volteando al abrir se vería el cambio y sería un
   * carrusel; volteando al cerrar es que el sitio quedó de otra manera.
   *
   * El filtro se borra al cerrar: en reposo no hay composición que filtrar, y
   * dejarlo escrito haría que el `data-fx` de la pasada anterior tiñera la
   * cenefa.
   */
  const cerrar = (ya) => {
    delete host.dataset.abierto;
    delete host.dataset.fx;
    letras.cerrar(ya || menos.matches);
    voltear();
  };

  const abierto = () => 'abierto' in host.dataset;

  return {
    /** Si hay una mano puesta ahora mismo — no si está abierto: el ocio también abre. */
    get mano() {
      return mano;
    },
    get abierto() {
      return abierto();
    },
    /**
     * `ya` es el teclado: a quien tabula no se le puede hacer esperar a que
     * salga la palabra letra por letra —el siguiente Tab tiene que encontrar
     * el link puesto— y un lector de pantalla leería `BU` a mitad de escritura.
     */
    entrar(ya = false) {
      if (mano) return;
      mano = true;
      agendar(() => abrir(ya));
    },
    salir(ya = false) {
      if (!mano) return;
      mano = false;
      agendar(() => cerrar(ya));
    },
    // Las dos del destello de ocio. Hacen lo mismo que entrar y salir —cerrar
    // también voltea— pero sin tocar `mano`: nadie puso la mano, y si el
    // destello se hiciera pasar por una, el `pointerdown` de después se
    // encontraría con que ya hay mano puesta y no abriría nada.
    abrirSinMano() {
      agendar(() => abrir(false));
    },
    cerrarSinMano() {
      agendar(() => cerrar(false));
    },
    soltar() {
      clearTimeout(timer);
      cola.length = 0;
    },
  };
}

/**
 * Los disparos. Es el mismo gesto en las tres entradas —entrar, mantener,
 * salir— y en las tres se abre al entrar y se cierra al salir:
 *
 *   ratón     pointerenter → abre      pointerleave              → cierra
 *   tacto     pointerdown  → abre      pointerup / cancel        → cierra
 *   teclado   focusin      → abre      focusout fuera de la banda → cierra
 *
 * Van sobre **la franja entera**, no sobre el título: la franja es la bisagra,
 * y desde que los links viven ahí tiene que serlo de verdad — con los disparos
 * en el título, mover el ratón del título a `BUY` disparaba `pointerleave`, la
 * franja se cerraba y el link desaparecía justo antes del clic. Por lo mismo
 * el foco se mira con `focusout` y su `relatedTarget`: tabular del título a
 * `BUY` es seguir dentro de la franja, no salirse.
 *
 * El ratón y el tacto van separados por `pointerType` a propósito. Un toque
 * dispara también `pointerenter` y `pointerleave`, así que atender los cinco
 * eventos sin distinguir haría dos aperturas por toque. El `mano` del estado
 * es el segundo cinturón: salir dos veces seguidas no cierra dos veces.
 *
 * En tacto, el cierre se escucha en la ventana y no en la franja: el dedo se
 * levanta donde quiera —deslizando hacia afuera, sobre la barra de Cargo— y
 * el home no puede quedarse abierto para siempre por eso.
 */
function disparos(banda, est) {
  const ac = new AbortController();
  const { signal } = ac;

  const raton = (e) => e.pointerType === 'mouse';

  banda.addEventListener('pointerenter', (e) => raton(e) && est.entrar(), { signal });
  banda.addEventListener('pointerleave', (e) => raton(e) && est.salir(), { signal });
  banda.addEventListener('pointerdown', (e) => !raton(e) && est.entrar(), { signal });

  for (const tipo of ['pointerup', 'pointercancel']) {
    window.addEventListener(tipo, (e) => !raton(e) && est.salir(), { signal });
  }

  // Solo el foco de teclado. Un clic del ratón también da foco, y ahí el
  // `pointerleave` ya se encarga.
  banda.addEventListener('focusin', (e) => tecla(e.target) && est.entrar(true), { signal });
  banda.addEventListener(
    'focusout',
    (e) => {
      if (!banda.contains(e.relatedTarget)) est.salir(true);
    },
    { signal },
  );

  return () => ac.abort();
}

/**
 * El clic del título, que es lo único del home que se va de la página.
 *
 * Con ratón y con teclado no hay nada que decidir: el link navega. **En tacto
 * sí**, porque ahí el mismo dedo hace las dos cosas — mantener para ver la
 * composición y tocar para ir al release—, y no se sabe cuál de las dos era
 * hasta que el dedo se levanta. Se decide entonces: un toque corto y quieto
 * navega; uno que se sostuvo o que se movió era para mirar, y el clic se
 * cancela.
 *
 * Se mira el gesto entero y no solo el tiempo: arrastrar el dedo por la
 * franja para leerla también es mirar, aunque dure poco.
 */
const TOQUE_MS = 350;
const TOQUE_PX = 10;

function navegacion(titulo) {
  const ac = new AbortController();
  const { signal } = ac;
  let toque = null;

  titulo.addEventListener(
    'pointerdown',
    (e) => {
      toque = e.pointerType === 'mouse' ? null : { t: performance.now(), x: e.clientX, y: e.clientY };
    },
    { signal },
  );

  titulo.addEventListener(
    'click',
    (e) => {
      const t = toque;
      toque = null;
      if (!t) return; // ratón o teclado: el link hace lo suyo

      const lejos = Math.hypot(e.clientX - t.x, e.clientY - t.y) > TOQUE_PX;
      if (performance.now() - t.t > TOQUE_MS || lejos) e.preventDefault();
    },
    { signal },
  );

  return () => ac.abort();
}

/**
 * El respiro del teléfono. Cinco segundos de franja, **un destello de un
 * segundo** con la composición abierta, y otra vez la franja. Al cerrarse
 * voltea, como siempre, así que un destello enseña una composición y el
 * siguiente la otra. Sigue respirando mientras el sitio esté quieto.
 *
 * **Es un destello, no un turno**, y ahí está la diferencia con el intercambio
 * que había antes: un segundo alcanza para ver que hay un lanzamiento debajo y
 * es demasiado poco para instalarse. La composición sigue siendo lo que uno
 * saca con la mano; esto solo avisa que está ahí.
 *
 * **Con el home invertido esto dejó de ser un adorno.** En reposo no se ve el
 * arte, y en teléfono no hay hover: sin el destello, quien no sepa que la
 * franja se puede mantener pulsada no vería nunca el lanzamiento, solo una
 * grieta de video. Es la única cosa del home que se mueve sin que nadie la
 * mueva, y va solo donde no hay mano — en pantalla ancha la composición ya
 * tiene quien la abra, y ahí sí sería un parpadeo gratis.
 *
 * **Cualquier cosa que haga el usuario lo apaga y reinicia la cuenta**: si el
 * destello está en pantalla se cierra en el acto, y los cinco segundos empiezan
 * otra vez desde la franja cuando el usuario suelte.
 *
 * No corre con `prefers-reduced-motion: reduce`. Abrir a mano sigue
 * funcionando ahí porque es un corte y lo pide el usuario; este no lo pide
 * nadie, y movimiento que uno no provocó es justamente lo que esa preferencia
 * viene a apagar.
 */
function ocio(host, est) {
  const movil = matchMedia('(max-width: 46rem)');
  const menos = matchMedia('(prefers-reduced-motion: reduce)');
  const ac = new AbortController();
  const { signal } = ac;

  let timer = null;

  const parar = () => {
    clearTimeout(timer);
    timer = null;
  };

  /**
   * Vuelve a la franja y empieza a contar de cero.
   *
   * Lo llama cualquier actividad del usuario, y también los cambios de
   * `matchMedia` y de visibilidad. Por eso lo primero es apagar el destello si
   * estaba encendido: el respiro no sobrevive a que lo interrumpan —quien toca
   * el sitio manda sobre lo que el sitio hace solo—, y ese mismo cierre es el
   * que salva el caso de quedarse abierto para siempre cuando el ocio deja de
   * correr a mitad de destello. Con la mano puesta no se toca nada: la
   * composición es suya hasta que la suelte.
   */
  const armar = () => {
    parar();
    if (!est.mano && est.abierto) est.cerrarSinMano();
    if (!movil.matches || menos.matches || est.mano) return;
    timer = setTimeout(destellar, OCIO);
  };

  /**
   * El destello: abre, y al segundo vuelve a la franja — que es exactamente lo
   * que `armar` ya sabe hacer. Terminar un destello y ser interrumpido por el
   * usuario son la misma cosa vistas desde aquí.
   */
  const destellar = () => {
    est.abrirSinMano();
    timer = setTimeout(armar, DESTELLO);
  };

  // Cualquier cosa que haga el usuario reinicia la cuenta. Van sobre el host y
  // no sobre la franja: tocar el sitio es actividad, apunte a donde apunte.
  for (const tipo of ['pointerdown', 'pointerup', 'pointerenter', 'focusin', 'keydown']) {
    host.addEventListener(tipo, armar, { signal, passive: true });
  }

  // En una pestaña de fondo no hay nadie mirando, y un intervalo corriendo ahí
  // solo gasta batería.
  document.addEventListener(
    'visibilitychange',
    () => (document.hidden ? parar() : armar()),
    { signal },
  );

  movil.addEventListener('change', armar, { signal });
  menos.addEventListener('change', armar, { signal });

  armar();

  return () => {
    parar();
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

/**
 * Lo único que se mueve solo es el video, en loop y sin sonido. No hay
 * temporizador que conmute bandas por su cuenta: si nadie toca, no pasa nada.
 *
 * Con `prefers-reduced-motion: reduce` el video no arranca y se queda su
 * `poster`. El intercambio sigue funcionando — es un corte, no una animación,
 * y no hay nada que reducir.
 */
function movimiento(video) {
  const menos = matchMedia('(prefers-reduced-motion: reduce)');
  const ac = new AbortController();

  const aplicar = () => {
    if (menos.matches) video.pause();
    else video.play().catch(() => {}); // si el navegador lo bloquea, queda el poster
  };

  menos.addEventListener('change', aplicar, { signal: ac.signal });
  aplicar();

  return () => ac.abort();
}

/**
 * Publica el alto de la caja de arriba y el de la franja del título, en
 * píxeles. Los tres recortes se calculan con ellos.
 *
 * Se miden en vez de leerlos de `--ttx-visor-h` y `--ttx-banda-h` por dos
 * razones distintas y las dos rompen en silencio:
 *
 *   - La fila de la franja es `auto` y `--ttx-banda-h` es solo un mínimo.
 *     Calcular con el mínimo funcionaría hasta el día que la franja dé dos
 *     líneas.
 *   - `--ttx-visor-h` se calibra en porcentaje, y un porcentaje dentro de un
 *     `inset()` se resuelve contra la caja del video, no contra la fila del
 *     grid. Cuadran de casualidad solo si el margen es cero.
 *
 * Medir cuesta cuatro líneas y no vuelve a fallar. No hay bucle: lo que se
 * escribe no decide el alto de nadie.
 */
function medir(host, arriba, banda) {
  const ro = new ResizeObserver(() => {
    const visor = arriba.offsetHeight;
    const franja = banda.offsetHeight;
    if (visor > 0) host.style.setProperty('--ttx-home-visor-h', `${visor}px`);
    if (franja > 0) host.style.setProperty('--ttx-home-banda-h', `${franja}px`);
  });

  ro.observe(arriba);
  ro.observe(banda);
  return () => ro.disconnect();
}
