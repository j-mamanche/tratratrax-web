import { registrar } from '../_runtime/mount.js';
import { cargar, cargarHome, urlMedia } from '../_runtime/datos.js';
import { crearStack } from '../_runtime/stack.js';
import { elemento } from '../_runtime/dom.js';
import { cover, numeroCatalogo, nombresArtistas } from '../_runtime/format.js';
import './home.css';

// El home: el lanzamiento, y nada más. Dos piezas del mismo release —un video
// y la carátula— que se turnan la caja de arriba y la de abajo. El interruptor
// es el título, o sea la banda del centro: el canal de información es la
// bisagra entre las otras dos bandas, no un rótulo pasivo.
//
//   REPOSO A          carátula arriba, video abajo
//   MANO ENCIMA       el video se sale de su caja y toma el marco, el aire de
//                     los lados y la franja del título. La carátula sigue en
//                     su sitio, recortada contra él
//   REPOSO B          video arriba, carátula abajo
//
// Se conmuta **saliendo, no entrando**: uno no aprieta nada, uno pasa, y al
// pasar el sitio quedó de otra manera. Corte seco en las tres transiciones.
//
// Hay un solo `<video>`, cubre el host entero y nunca para. Lo único que
// cambia entre los tres estados es el rectángulo por el que se ve, y como los
// tres recortes son un rectángulo simple, los tres son un `clip-path: inset()`
// que vive en el CSS. Todo el estado del widget son dos atributos en el host:
//
//   data-home="a|b"   qué caja tiene la carátula
//   data-invade       mientras hay una mano encima
//
// No hay animación que cancelar, no hay posición que recalcular, no hay video
// que resincronizar.
//
// Opciones que acepta el placeholder de Cargo:
//   <div data-ttx="home"></div>
//   <div data-ttx="home" data-respaldo></div>   ← fuerza el home pobre, para verlo
//   <div data-ttx="home" data-minimo="140"></div>  ← ms mínimos entre cambios

/**
 * Lo mínimo que dura un estado antes de que pueda entrar el siguiente.
 *
 * **No es un retardo.** Entrar al título cambia la pantalla en el acto; lo que
 * se controla es lo de después: pasar el ratón por encima muy rápido disparaba
 * invasión y conmutación en el mismo fotograma y se leía como un parpadeo. Con
 * 100 ms de piso cada estado alcanza a existir, y la pasada se ve como una
 * decisión y no como un glitch.
 *
 * Nada se descarta por el camino: lo que llega antes de tiempo espera su turno.
 * Se calibra con `data-minimo` en el placeholder.
 */
const MINIMO = 100;

/**
 * Cuánto tiene que estar quieto un teléfono para que las piezas se intercambien
 * solas. En pantalla ancha no corre: ahí está la mano.
 */
const OCIO = 6000;

registrar('home', async (host) => {
  // El destacado curado manda; si falta, el release visible más reciente.
  const home = host.hasAttribute('data-respaldo') ? null : await cargarHome();
  const pieza = piezaCurada(home?.destacado) ?? (await piezaRespaldo());

  if (!pieza) {
    host.replaceChildren(elemento('p', { class: 'ttx-error' }, 'No hay nada que anunciar.'));
    return;
  }

  // El stack de siempre, con banda: el visor es la caja de arriba, la banda es
  // el título y el contenido es la caja de abajo. Los alias los pone el CSS
  // para poder leer las reglas como se lee el dibujo.
  const { banda, visor: arriba, contenido: abajo } = crearStack(host, { banda: true });
  arriba.classList.add('ttx-home-caja', 'ttx-home-arriba');
  abajo.classList.add('ttx-home-caja', 'ttx-home-abajo');

  host.style.setProperty('--ttx-home-caratula', `url("${pieza.caratula}")`);
  host.dataset.home = 'a';

  const video = pieza.video ? crearVideo(pieza.video) : null;
  // El home pobre: sin video no hay intercambio y la caja de abajo se quedaría
  // vacía. El CSS le da el marco entero a la carátula.
  if (!video) host.dataset.pobre = '';
  // Antes del marco: el video es el papel sobre el que se compone todo lo
  // demás, y el marco va encima con el fondo transparente.
  if (video) host.prepend(video);

  const titulo = crearTitulo(pieza, Boolean(video));
  banda.append(titulo);

  const est = video ? estado(host, Number(host.dataset.minimo) || MINIMO) : null;

  const soltarMedidas = medir(host, arriba, banda);
  const soltarDisparos = est ? disparos(titulo, est) : () => {};
  const soltarOcio = est ? ocio(host, est) : () => {};
  const soltarMovimiento = video ? movimiento(video) : () => {};

  return {
    destruir() {
      soltarMedidas();
      soltarDisparos();
      soltarOcio();
      soltarMovimiento();
      est?.soltar();
    },
  };
});

// ── De dónde sale la pieza ──────────────────────────────────────────────

/**
 * El destacado de `data/home.json`. Puede ser un lanzamiento que todavía no
 * existe en el catálogo —sin Bandcamp y sin número confirmado—, que es
 * justamente para lo que está: el home tiene fecha y el catálogo no.
 *
 * A medias no sirve: sin título o sin carátula no hay nada que componer, y es
 * mejor caer al respaldo que pintar media pantalla en negro. El validador
 * exige lo mismo antes de que esto llegue a publicarse.
 */
function piezaCurada(d) {
  if (!d?.titulo || !d?.caratula) return null;

  return {
    titulo: d.titulo,
    artista: d.artista ?? '',
    // El tercer campo de la franja. Es la fecha tal como se escribe —`091826`,
    // sin barras ni formato— porque lo que anuncia el home es cuándo sale, no
    // qué número lleva: un lanzamiento por salir puede no tener número
    // todavía. Si algún día lo tiene y no hay fecha, cae al número.
    sello: d.fecha || d.catalogo || '',
    caratula: urlMedia(d.caratula),
    video: d.video?.mp4
      ? { mp4: urlMedia(d.video.mp4), poster: urlMedia(d.video.poster) }
      : null,
  };
}

/**
 * El respaldo: el release visible más reciente, con el mismo orden que manda
 * en el catálogo. **No tiene video**, así que el home degrada — carátula
 * arriba, sin intercambio, y el título deja de ser interruptor y pasa a ser
 * texto. Un home pobre, pero nunca uno roto ni uno que muestre lo de hace
 * ocho meses.
 */
async function piezaRespaldo() {
  const { releases, indiceArtistas } = await cargar();

  const r = releases
    .filter((x) => x.visible !== false)
    .sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || b.date.localeCompare(a.date))[0];

  if (!r) return null;

  return {
    titulo: r.album,
    artista: nombresArtistas(r.artists, indiceArtistas),
    // Un release que ya salió sí tiene número, y es lo que lo identifica.
    sello: numeroCatalogo(r.catalog),
    caratula: cover(r.bcImageId, 10),
    video: null,
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
 * El título es el interruptor, así que es un `<button>` de verdad: el teclado
 * y el lector de pantalla salen gratis y con el `aria-*` correcto.
 *
 * Sin video no hay nada que conmutar y vuelve a ser lo que parece — texto.
 *
 * `KILLING MARIPOSAS KELMAN DURÁN 091826`: el álbum primero, después quién y al
 * final cuándo. Van pegados y sin un carácter de por medio —lo que los separa
 * es el peso, alternando como el menú del nav—, y las versalitas las pone el
 * CSS: el dato se guarda como se escribe, `Killing Mariposas`.
 */
function crearTitulo(pieza, interruptor) {
  return elemento(
    interruptor ? 'button' : 'span',
    { class: 'ttx-home-titulo', type: interruptor ? 'button' : false },
    elemento('span', { class: 'ttx-album' }, pieza.titulo),
    pieza.artista && elemento('span', { class: 'ttx-artistas' }, pieza.artista),
    pieza.sello && elemento('span', { class: 'ttx-cat' }, pieza.sello),
    interruptor &&
      elemento('span', { class: 'ttx-oculto' }, ' — swap the cover and the video'),
  );
}

// ── Estado ──────────────────────────────────────────────────────────────

/**
 * El estado, y el ritmo mínimo al que puede cambiar la pantalla.
 *
 * Lo lógico pasa **en el acto** —quién está invadiendo, en qué orden ocurrió
 * cada cosa— y lo que se ve pasa lo antes posible, que casi siempre es también
 * en el acto. Lo único que se impone es un piso entre un cambio y el
 * siguiente: si el anterior acaba de escribirse, este espera a que se cumplan
 * los `minimo` ms y entonces sale.
 *
 * Separar las dos cosas es lo que permite frenar sin perder nada. Una pasada
 * rápida por el título deja dos escrituras en la cola y salen las dos, en
 * orden y espaciadas. Es lo contrario de un debounce, que era la tentación
 * obvia: un debounce se come justamente las pasadas rápidas, que son las que
 * más se sienten.
 */
function estado(host, minimo) {
  const cola = [];
  let timer = null;
  let invadiendo = false;
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

  return {
    get invadiendo() {
      return invadiendo;
    },
    entrar() {
      if (invadiendo) return;
      invadiendo = true;
      agendar(() => {
        host.dataset.invade = '';
      });
    },
    salir() {
      if (!invadiendo) return;
      invadiendo = false;
      agendar(() => {
        delete host.dataset.invade;
        voltear();
      });
    },
    /** Enter y espacio, y el latido de ocio. */
    conmutar() {
      agendar(voltear);
    },
    soltar() {
      clearTimeout(timer);
      cola.length = 0;
    },
  };
}

/**
 * Los disparos. Es el mismo gesto en las tres entradas —entrar, mantener,
 * salir— y en las tres se conmuta al salir:
 *
 *   ratón     pointerenter → invade      pointerleave            → conmuta
 *   tacto     pointerdown  → invade      pointerup / cancel      → conmuta
 *   teclado   focus        → invade      blur                    → conmuta
 *
 * Van separados por `pointerType` a propósito. Un toque dispara también
 * `pointerenter` y `pointerleave`, así que atender los cinco eventos sin
 * distinguir haría dos conmutaciones por toque y el sitio quedaría igual que
 * antes. El `invadiendo` del estado es el segundo cinturón: salir dos veces
 * seguidas no conmuta dos veces.
 */
function disparos(titulo, est) {
  const ac = new AbortController();
  const { signal } = ac;
  const on = (tipo, fn) => titulo.addEventListener(tipo, fn, { signal });

  const entrar = () => est.entrar();
  const salir = () => est.salir();
  const conmutar = () => est.conmutar();

  const raton = (e) => e.pointerType === 'mouse';

  on('pointerenter', (e) => raton(e) && entrar());
  on('pointerleave', (e) => raton(e) && salir());

  on('pointerdown', (e) => {
    if (raton(e)) return;
    // Con la captura, soltar el dedo fuera del título sigue avisando aquí; sin
    // ella un deslizamiento hacia afuera dejaba el home invadido para siempre.
    try {
      titulo.setPointerCapture(e.pointerId);
    } catch {
      /* el navegador no la da: `pointercancel` sigue cubriendo el caso */
    }
    entrar();
  });
  on('pointerup', (e) => !raton(e) && salir());
  on('pointercancel', (e) => !raton(e) && salir());

  // Solo el foco de teclado. Un clic del ratón también da foco, y ahí el
  // `pointerleave` ya se encarga: sin este filtro, salir del título conmutaba
  // y volver a hacer clic en otro sitio conmutaba otra vez.
  on('focus', () => tecla(titulo) && entrar());
  on('blur', () => salir());

  // Enter y espacio conmutan en el sitio. El foco no se ha ido, así que sigue
  // invadido: es la misma pasada, repetida.
  on('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); // el espacio, si no, hace scroll de la página
    conmutar();
  });

  return () => ac.abort();
}

/**
 * El gesto de ocio: en teléfono, si nadie toca durante seis segundos, las dos
 * piezas se intercambian solas, y siguen turnándose mientras el sitio siga
 * quieto. Al primer toque se para y no vuelve hasta seis segundos después de
 * que la mano se retire.
 *
 * Es la única cosa del home que se mueve sin que nadie la mueva, y va solo
 * donde no hay mano: en pantalla ancha el intercambio ya tiene quien lo
 * dispare, y ahí sí sería un parpadeo gratis. El corte de teléfono es el mismo
 * de siempre —seco, sin apagón, sin grieta—: es un intercambio, no una
 * invasión sin dedo.
 *
 * No corre con `prefers-reduced-motion: reduce`. El intercambio a mano sigue
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

  const armar = () => {
    parar();
    // Con el dedo encima no hay ocio que medir: lo vuelve a armar el
    // `pointerup`, que llega siempre.
    if (!movil.matches || menos.matches || est.invadiendo) return;
    timer = setTimeout(latir, OCIO);
  };

  const latir = () => {
    est.conmutar();
    armar();
  };

  // Cualquier cosa que haga el usuario reinicia la cuenta. Van sobre el host y
  // no sobre el título: tocar el sitio es actividad, apunte a donde apunte.
  // `pointerenter` está en la lista aunque en teléfono casi no exista: una
  // ventana angosta de escritorio también cae en el breakpoint, y ahí sí hay
  // mano — que el puntero esté encima es lo contrario de estar en ocio.
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
 *   - La fila del título es `auto` y `--ttx-banda-h` es solo un mínimo.
 *     Calcular con el mínimo funcionaría hasta el día que el título dé dos
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
