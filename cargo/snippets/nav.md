# Qué se pega en Cargo para el nav `[id="L3482832595"]`

Cinco pegadas: HTML de la página, CSS de la página, y **tres** bloques de script
en el HTML global (el lema que se hackea, el blanco/negro del nav y la bandera).
Los scripts van globales porque Cargo navega por AJAX y el nav se vuelve a
pintar en cada cambio de página — si viven en la página, se mueren en la primera
navegación. La bandera además tapa la página entera, que tampoco es del nav.

El nav móvil es otra página de Cargo, `[id="N1901077103"]`: los mismos scripts la
manejan, y lo que hay que hacer allá está en la sección 6.

Antes de pegar en vivo: `cargo/snippets/nav-preview.html` es el mismo nav en un
archivo suelto. Se abre con doble clic y sirve para calibrar tiempos sin tocar
el sitio. Arriba a la izquierda tiene un panel —que no existe en Cargo— para
cambiarle el fondo a la página de abajo y accionar el interruptor, y ver al nav
decidir en vivo. El nav de ahí lleva `style="z-index: 399"` escrito a mano —eso
sí no se pega en Cargo, lo escribe Cargo solo— para que el preview mienta igual
que el sitio y la trampa del apilamiento se vea antes y no después.

---

## 1. HTML de la página (nav)

Reemplaza el `<column-set>` entero:

```html
<column-set gutter="1"><column-unit slot="0"><div class="nav-lema">2026 © <span class="glitch" data-glitch>TODOS LOS IZQUIERDOS PÚBLICOS</span></div></column-unit><column-unit slot="1"><div class="nav-logo"><media-item class="zoomable" hash="Y3055296379683564288776637724874" limit-by="width" scale="15%"></media-item></div></column-unit><column-unit slot="2"><div class="nav-links"><span class="nav-menu">MENU</span><a href="about" rel="history" data-label="ABOUT">ABOUT</a><a href="catalog" rel="history" data-label="CATALOG">CATALOG</a><a href="merca" rel="history" data-label="MERCA">MERCA</a><a href="blog" rel="history" data-label="BLOG">BLOG</a></div></column-unit></column-set>
```

Seis cosas que no son cosméticas:

- **El lema ya no lleva `style="color: ..."` inline.** Un color inline le gana a
  todo, incluido el script que decide si el nav va blanco o negro. El color sale
  ahora del CSS (`--nav-ink`). Si lo vuelves a poner a mano, el lema se queda
  blanco para siempre.
- **`ABOUT CATALOG MERCA BLOG` ahora son links de verdad.** En lo que estaba
  pegado era un `<span>` de texto plano: se veía como menú pero no navegaba, y
  sin `<a>` no hay página activa que marcar. Los slugs reales del sitio son
  `about` · `catalog` · `merca` · `blog`, **sin `-2`**: los que llevaban sufijo
  (`merca-2`, `blog-2`) son de páginas que se renombraron después y hoy dan 404.
  El de MERCA ya está corregido en Cargo; **el de BLOG no** — en el sitio en
  vivo, hoy, BLOG lleva a `/blog-2` y no carga nada. Hay que cambiarlo allá.
- **No hay espacios ni `&nbsp;` entre los `<a>`.** La separación la pone el
  `gap` del CSS, que se mide exacto. Si dejas un salto de línea entre los links,
  vuelve a colarse un espacio de texto encima del `gap`.
- **`data-label` repite la etiqueta.** El CSS lo usa para reservar desde siempre
  el ancho de los dos pesos —negrilla e itálica regular—, así el menú no se
  corre cuando cambias de página.
- **`MENU` va primero y es un `<span>`, no un `<a>`.** Es texto inerte: rotula la
  lista, no lleva a ninguna parte. Un link a un menú que ya está desplegado sería
  un link a nada.
- **El `__` de `MENU__` no se escribe.** Lo imprime el CSS, igual que en los
  widgets. Escribirlo en el HTML lo dejaría dentro del texto seleccionable y del
  lector de pantalla.

El `<span data-glitch>` es lo único que rota. El `2026 ©` se queda quieto.

**El nav no usa el sistema de juntas del resto del sitio.** Es la única
excepción y está decidida: solo `MENU` lleva junta, y los cuatro links van
separados por un espacio normal, sin `__` entre ellos y sin alternancia de peso.

```
MENU__ ABOUT CATALOG MERCA BLOG
     └junta┘    └── espacios normales ──┘
```

**Los cuatro links van en negrilla y el activo en itálica regular** — al revés
de lo que uno esperaría, y a propósito: lo que pesa es a dónde se puede ir, no
dónde se está. En el home no va ninguno en itálica, porque el home no está en la
lista. `MENU__` y el lema no cambian: siguen en regular.

---

## 2. CSS de la página

```css
/* ============================================================
   CARGO — NAV  [id="L3482832595"]
   Todo scopeado al id: el nav viejo (B3241791059) dejó dos reglas
   sin prefijo que se escaparon a todo el sitio. No repetir eso.
   ============================================================ */

[id="L3482832595"].page {
	min-height: var(--viewport-height);
}

/* — EL NAV, ENCIMA DE TODO —
   La bandera de la sección 7 se cuelga del <body> con z-index 9998 y el nav
   tiene que quedar por encima: en las cuatro capturas del sello la barra de
   abajo sigue visible y legible sobre la bandera.

   **El `!important` es la regla, no la excepción evitable.** Cargo le escribe
   `z-index: 399` **en el atributo style** a toda página fijada, y un estilo en
   línea le gana a cualquier regla de la hoja por específica que sea. Sin
   `!important` esta declaración no llega nunca: el nav se queda en 399 y la
   bandera lo tapa entero, en escritorio y en móvil. Es lo que pasaba y se
   verificó en el sitio en vivo — el nav se veía bien hasta que la bandera
   entraba, y entonces desaparecía completo.

   `position` ya no se toca. Cargo deja la página en `fixed` desde `.page.fixed`
   —dos clases, que pesan más que este selector de atributo—, así que el
   `position: relative` que había acá nunca se aplicó: era una declaración
   muerta que además hacía creer que el apilamiento estaba resuelto. */

[id="L3482832595"].page {
	z-index: 9999 !important;
}

[id="L3482832595"] .page-content {
	align-items: flex-end;
	padding: 1rem;
}

[id="L3482832595"] .page-layout {
	align-items: flex-end;
}

/* — TODO AL PISO —
   El column-set estira las tres columnas a la misma altura; dentro de cada
   una el contenido se va abajo. Sin esto, el lema y el menú quedan colgando
   del techo mientras el logo manda la altura. */

[id="L3482832595"] column-set {
	display: flex;
	align-items: stretch;
}

[id="L3482832595"] column-set > column-unit {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
}

[id="L3482832595"] column-set > column-unit > * {
	width: 100%;
}

/* — BLANCO O NEGRO —
   El script de la sección 4 escribe data-nav="white" | "black" en el nav, y
   también en cada pieza cuando la página parte el fondo en dos. Acá viven los
   dos juegos de color y nada más: ningún otro sitio pinta el nav. */

[id="L3482832595"],
[id="L3482832595"] [data-nav="white"] {
	--nav-ink: rgba(255, 255, 255, 0.85);  /* lema */
	--nav-ink-strong: rgb(255, 255, 255);  /* menú */
	--nav-logo-filter: none;               /* el logo ya viene blanco */
}

[id="L3482832595"][data-nav="black"],
[id="L3482832595"] [data-nav="black"] {
	--nav-ink: rgba(0, 0, 0, 0.85);
	--nav-ink-strong: rgb(0, 0, 0);
	--nav-logo-filter: invert(1);
}

/* — LA BANDERA MANDA —
   Mientras hay bandera puesta, el script de la sección 7 le escribe al nav
   `data-bandera="black"` o `"white"` con la tinta de esa bandera. Gana sobre
   lo medido —y tiene que ganar también sobre lo que el medidor le escribió a
   cada pieza, que es un selector de dos partes: por eso este es de tres.

   Y sin transición: la bandera corta seco y la tinta tiene que cortar con ella.
   Un color que tarda 220 ms en llegar dejaría el nav ilegible justo en el
   arranque de cada destello — y en el del toque en teléfono, que dura menos de
   medio segundo, sería casi todo el destello. */

[id="L3482832595"][data-bandera="black"],
[id="L3482832595"][data-bandera="black"] [data-nav] {
	--nav-ink: rgba(0, 0, 0, 0.85);
	--nav-ink-strong: rgb(0, 0, 0);
	--nav-logo-filter: invert(1);
}

[id="L3482832595"][data-bandera="white"],
[id="L3482832595"][data-bandera="white"] [data-nav] {
	--nav-ink: rgba(255, 255, 255, 0.85);
	--nav-ink-strong: rgb(255, 255, 255);
	--nav-logo-filter: none;
}

[id="L3482832595"][data-bandera] :is(.nav-lema, .nav-menu, .nav-links a),
[id="L3482832595"][data-bandera] media-item::part(media) {
	transition: none;
}

[id="L3482832595"] .nav-lema {
	text-align: left;
	color: var(--nav-ink);
	transition: color 220ms ease;
}

[id="L3482832595"] .nav-logo {
	text-align: center;
	line-height: 0; /* mata el descender del inline y lo apoya de verdad */
}

/* El logo es un PNG blanco: para el modo negro se invierte. Si algún día el
   archivo cambia a negro, hay que intercambiar los dos valores del filtro. */
[id="L3482832595"] media-item::part(media) {
	filter: var(--nav-logo-filter);
	transition: filter 220ms ease;
}

/* — MENÚ DERECHO — */

[id="L3482832595"] .nav-links {
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	/* Un espacio normal de esta fuente mide ~0.28em, y eso es exactamente lo que
	   va entre los links: `MENU__ ABOUT CATALOG MERCA BLOG` se lee como una
	   frase, no como cuatro botones. Antes era 0.03em —casi tocándose— y venía
	   de cuando el menú era un bloque de texto sin rótulo. */
	gap: 0.28em;
	line-height: 1;
	white-space: nowrap;
}

/* El rótulo de la lista. Texto inerte, mismo color que los links y en regular:
   no es un destino y no compite con la negrilla de los que sí lo son. */
[id="L3482832595"] .nav-menu {
	display: inline-block;
	color: var(--nav-ink-strong);
	font-weight: 400;
	transition: color 220ms ease;
}

/* La junta, la misma del resto del sitio: `__` pegado con -0.13em de tracking
   —o salen dos guiones picados— y el margen que le devuelve al último guión lo
   que el tracking le quitó. El espacio que sigue lo pone el `gap` de arriba, que
   mide casi lo mismo que la junta de los widgets (0.28em contra 0.3em).

   **Es la única junta del nav.** Entre los links no va ninguna. */
[id="L3482832595"] .nav-menu::after {
	content: "__";
	display: inline-block;
	letter-spacing: -0.13em;
	margin-right: 0.15em;
}

/* **Las páginas a las que se puede ir van en negrilla; la que se está viendo,
   no.** Es al revés de lo que uno haría, y es la idea: lo que pesa es lo que
   queda por hacer. La activa se retira —regular y en itálica— porque ya no es
   un destino, es dónde uno está. */
[id="L3482832595"] .nav-links a {
	display: inline-block;
	color: var(--nav-ink-strong);
	text-decoration: none;
	border-bottom: 0;
	font-weight: 700;
	transition: color 220ms ease;
}

/* Página activa: **itálica regular**, nunca subrayado. Cargo pone .active solo;
   .is-active es el respaldo que pone el script si Cargo no marcó nada. En el
   home no se marca ninguna: el home no está en la lista. */
[id="L3482832595"] .nav-links a.active,
[id="L3482832595"] .nav-links a.is-active {
	font-style: italic;
	font-weight: 400;
	text-decoration: none;
}

/* Reserva de ancho, para que marcar la página activa no empuje a los otros
   links. **Son dos y no una**: cada link puede estar en negrilla o en itálica
   regular, y las dos miden distinto —la negrilla más, casi siempre—, así que
   cada uno reserva las dos y se queda con la mayor. Con una sola reserva, la
   itálica, el menú se corría al navegar justo en la dirección contraria a la
   que se corría antes de reservar nada.

   Las dos son bloques invisibles de altura cero: no se ven, no se seleccionan,
   no se leen, y lo único que hacen es no dejar que la caja se encoja. */
[id="L3482832595"] .nav-links a::before,
[id="L3482832595"] .nav-links a::after {
	content: attr(data-label);
	display: block;
	height: 0;
	overflow: hidden;
	visibility: hidden;
	pointer-events: none;
}

[id="L3482832595"] .nav-links a::before {
	font-style: normal;
	font-weight: 700;
}

[id="L3482832595"] .nav-links a::after {
	font-style: italic;
	font-weight: 400;
}

/* — LEMA QUE SE HACKEA — */

[id="L3482832595"] [data-glitch] {
	display: inline-block;
	white-space: nowrap;
}

/* En reposo el cursor no está. Aparece fijo mientras teclea, parpadea tres
   veces al terminar y se apaga: el `both` deja el último cuadro (opacidad 0)
   puesto, así que no hace falta un timer en JS para esconderlo. */
[id="L3482832595"] .glitch-caret::after {
	content: "▌";
	opacity: 0;
}

[id="L3482832595"] [data-glitch].is-typing .glitch-caret::after {
	opacity: 1;
}

[id="L3482832595"] [data-glitch].is-resting .glitch-caret::after {
	animation: ttx-caret 0.5s steps(1) 3 both;
}

@keyframes ttx-caret {
	0%, 49% { opacity: 1; }
	50%, 100% { opacity: 0; }
}
```

---

## 3. Script del lema — HTML global de Cargo

Va al final del HTML global, junto a los otros scripts. Es autónomo: no depende
de `ttx.js` ni de los widgets, ni del script de la sección 4.

```html
<!-- SCRIPT LEMA GLITCH + PÁGINA ACTIVA (navs L3482832595 · N1901077103) -->

<script>
(function () {
  var PHRASES = [
    "TODOS LOS IZQUIERDOS PÚBLICOS",
    "MUÉVALO",
    "IMPUREZA SÓNICA",
    "SONIC HUSTLERS",
    "DEL SUR"
  ];

  // Residuo que arrastra el cursor. Sin letras acentuadas: se leen como
  // error de encoding.
  var NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|<>_-=+*#%$@[]{}·";

  var HOLD_MIN  = 3200;  // ms quieto antes de cambiar (mínimo)
  var HOLD_MAX  = 6500;  // ms quieto antes de cambiar (máximo)
  var DEL_MS    = 30;    // ms por letra borrada — borra más rápido de lo que escribe
  var DEL_JIT   = 14;    // variación del borrado, ±
  var TYPE_MS   = 58;    // ms por letra escrita
  var TYPE_JIT  = 42;    // variación del tecleo, ± — es lo que lo hace humano
  var PAUSE_MIN = 180;   // ms en blanco entre borrar y escribir
  var PAUSE_MAX = 420;
  var TRAIL     = 1;     // letras de ruido que arrastra el cursor al escribir
  var GHOST     = 0.05;  // probabilidad de que una letra ya escrita parpadee (0 lo apaga)

  var AWAY_MS   = 1000;  // cada cuánto mira si el nodo volvió al documento
  var AWAY_MAX  = 30;    // cuántas veces mira antes de rendirse (30s)
  var WATCH_MS  = 3000;  // ronda de reparación

  // En Cargo el nav de escritorio y el de móvil son dos páginas distintas, cada
  // una con su id. Acá van todas las instancias; el lema se anima solo en las
  // que tengan un [data-glitch], esta lista es para marcar la página activa.
  var NAV_IDS = ["L3482832595", "N1901077103"];
  var NAV_SEL = '[id="' + NAV_IDS.join('"], [id="') + '"]';

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Los controladores viven acá y NO en un data-attribute. Un atributo
  // sobrevive a los clones: si Cargo cachea el nav ya inicializado, la copia
  // vuelve marcada como "lista" y nadie la vuelve a arrancar. Un WeakMap no
  // se copia con el nodo, así que un clon se reinicializa solo.
  var seen = new WeakMap();

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function pickOther(list, current) {
    var value;
    do {
      value = list[Math.floor(Math.random() * list.length)];
    } while (list.length > 1 && value === current);
    return value;
  }

  function noiseRun(count) {
    var text = "";
    for (var i = 0; i < count; i++) {
      text += NOISE.charAt(Math.floor(Math.random() * NOISE.length));
    }
    return text;
  }

  // Las últimas `trail` letras todavía son ruido; el resto ya cuajó, salvo
  // un parpadeo ocasional que deja el residuo.
  function withTrail(text, count, trail) {
    var solid = Math.max(0, count - trail);
    var head = text.slice(0, solid);

    if (GHOST > 0 && solid > 1 && Math.random() < GHOST) {
      var i = Math.floor(Math.random() * solid);
      head = head.slice(0, i) + noiseRun(1) + head.slice(i + 1);
    }

    return head + noiseRun(count - solid);
  }

  function build(el) {
    var seed = (el.textContent || "").trim();

    var ctl = {
      out: null,
      phrase: PHRASES.indexOf(seed) >= 0 ? seed : PHRASES[0],
      idle: true,      // false solo mientras corre la animación
      stopped: false,  // se rindió: el nodo estuvo fuera del documento demasiado
      dead: false,     // otro controlador tomó su lugar
      away: 0
    };

    el.textContent = "";
    el.classList.remove("is-typing");
    el.classList.add("is-resting"); // parpadea al cargar y se apaga

    // En móvil el lema comparte fila con el menú. El texto vive dentro de una
    // pista que se puede correr sin mover el prefijo `2026 ©` ni partir la
    // línea. En escritorio la pista queda siempre en translateX(0).
    ctl.track = document.createElement("span");
    ctl.track.className = "glitch-track";

    ctl.out = document.createElement("span");
    ctl.out.className = "glitch-text";
    ctl.out.textContent = ctl.phrase;

    var caret = document.createElement("span");
    caret.className = "glitch-caret";
    caret.setAttribute("aria-hidden", "true");

    ctl.track.appendChild(ctl.out);
    ctl.track.appendChild(caret);
    el.appendChild(ctl.track);

    // Solo el nav móvil desplaza el lema. Se llama después de cada letra:
    // cuando la frase pasa el ancho disponible, el cursor sigue entrando por
    // la derecha en vez de empujar el menú a otra línea.
    function followCaret() {
      var mobile = el.closest('[id="N1901077103"]');
      if (!mobile || !document.contains(mobile) || reduce) {
        ctl.track.style.transform = "";
        return;
      }

      var overflow = Math.ceil(ctl.track.scrollWidth - el.clientWidth);
      ctl.track.style.transform = overflow > 0
        ? "translateX(" + (-overflow) + "px)"
        : "";
    }

    // Un solo timer por lema: espera, borrado y tecleo se turnan.
    function later(fn, ms) {
      setTimeout(function () {
        if (!ctl.dead) fn();
      }, ms);
    }

    // ÚNICO punto donde el ciclo puede detenerse, y siempre con la frase
    // completa en pantalla. Nunca en mitad de una animación: por eso el lema
    // ya no puede quedar vacío para siempre.
    function gate() {
      if (document.contains(el)) {
        ctl.away = 0;
        change();
        return;
      }

      // Cargo mueve y reemplaza el nav al navegar; estar fuera del documento
      // un instante es normal, no motivo para morirse.
      ctl.away += 1;
      if (ctl.away > AWAY_MAX) {
        ctl.stopped = true; // si el nodo reaparece, scan() lo revive
        return;
      }
      later(gate, AWAY_MS);
    }

    function hold() {
      later(gate, rnd(HOLD_MIN, HOLD_MAX));
    }

    function change() {
      var next = pickOther(PHRASES, ctl.phrase);
      run(next, function () {
        ctl.phrase = next;
        hold();
      });
    }

    // Sin comprobaciones de nodo adentro: una vez que arranca, termina. Dura
    // ~2s y siempre aterriza en la frase entera, esté donde esté el nodo.
    function run(to, done) {
      var from = ctl.phrase;

      if (reduce) {
        ctl.out.textContent = to;
        done();
        return;
      }

      ctl.idle = false;
      ctl.track.style.transform = "";
      el.classList.remove("is-resting");
      el.classList.add("is-typing");

      var erased = from.length;
      var typed = 0;

      // Borrar es limpio: se come la frase letra por letra, sin ruido.
      function erase() {
        erased -= 1;

        if (erased <= 0) {
          ctl.out.textContent = "";
          later(type, rnd(PAUSE_MIN, PAUSE_MAX));
          return;
        }

        ctl.out.textContent = from.slice(0, erased);
        followCaret();
        later(erase, rnd(DEL_MS - DEL_JIT, DEL_MS + DEL_JIT));
      }

      function type() {
        typed += 1;

        if (typed > to.length) {
          settle(TRAIL - 1);
          return;
        }

        ctl.out.textContent = withTrail(to, typed, TRAIL);
        followCaret();
        later(type, rnd(TYPE_MS - TYPE_JIT, TYPE_MS + TYPE_JIT));
      }

      // Deja que el residuo se apague solo en vez de cortarlo de golpe.
      function settle(trail) {
        if (trail <= 0) {
          ctl.out.textContent = to;
          followCaret();
          el.classList.remove("is-typing");
          el.classList.add("is-resting"); // dispara los parpadeos finales
          ctl.idle = true;
          done();
          return;
        }

        ctl.out.textContent = withTrail(to, to.length, trail);
        followCaret();
        later(function () { settle(trail - 1); }, rnd(TYPE_MS - TYPE_JIT, TYPE_MS + TYPE_JIT));
      }

      erase();
    }

    // La red de seguridad: si el lema quedó vacío o a medias por algo que no
    // controlamos, vuelve a la frase completa; si el ciclo se había rendido,
    // arranca de nuevo.
    ctl.resume = function () {
      if (ctl.idle && ctl.out.textContent !== ctl.phrase) {
        ctl.out.textContent = ctl.phrase;
        followCaret();
      }
      if (ctl.stopped) {
        ctl.stopped = false;
        ctl.away = 0;
        hold();
      }
    };

    hold();
    return ctl;
  }

  function initGlitch(el) {
    var ctl = seen.get(el);

    // Mismo nodo, controlador vivo y con sus <span> puestos: solo repara.
    if (ctl && !ctl.dead && el.contains(ctl.out)) {
      ctl.resume();
      return;
    }

    // Nodo clonado por Cargo, o vaciado por debajo: al controlador viejo se
    // le retira el turno para que no queden dos escribiendo.
    if (ctl) ctl.dead = true;

    seen.set(el, build(el));
  }

  // Respaldo por si Cargo no marca .active en los links del nav.
  function markActive(root) {
    var here = location.pathname.replace(/^\/|\/$/g, "");
    var links = root.querySelectorAll(".nav-links a[href]");

    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href").replace(/^\/|\/$/g, "");
      links[i].classList.toggle("is-active", href !== "" && href === here);
    }
  }

  function scan() {
    var lemas = document.querySelectorAll("[data-glitch]");
    for (var i = 0; i < lemas.length; i++) initGlitch(lemas[i]);

    var navs = document.querySelectorAll(NAV_SEL);
    for (var j = 0; j < navs.length; j++) markActive(navs[j]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scan);
  } else {
    scan();
  }
  window.addEventListener("load", scan);
  window.addEventListener("hashchange", scan);
  window.addEventListener("popstate", scan);
  window.addEventListener("pageshow", scan); // volver con el botón atrás

  // Cargo navega por AJAX: sin observer, el nav vuelve sin lema animado.
  var pending = null;
  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var node = records[i].target;
      if (node.nodeType !== 1) node = node.parentElement;
      // Ignora las mutaciones que provoca el propio lema, si no el observer
      // se dispara con cada letra.
      if (node && node.closest && node.closest("[data-glitch]")) continue;

      clearTimeout(pending);
      pending = setTimeout(scan, 120);
      return;
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Ronda de reparación: cueste lo que cueste, un lema vacío o dormido se
  // arregla solo en menos de 3s. Es una pasada de querySelectorAll, nada más.
  setInterval(scan, WATCH_MS);
})();
</script>
```

---

## 4. Script del blanco/negro — HTML global de Cargo

Va debajo del anterior, en el mismo HTML global. Son independientes: si borras
uno, el otro sigue funcionando.

Mide el fondo que hay **detrás** de cada pieza del nav y le pone al nav
`data-nav="white"` o `data-nav="black"`; el CSS de la sección 2 hace el resto.
Si la página prefiere mandar en vez de que se mida, hay un interruptor
(sección 5) y el interruptor siempre gana.

```html
<!-- SCRIPT NAV BLANCO/NEGRO (navs L3482832595 · N1901077103) -->

<script>
(function () {
  // Todas las instancias del nav: escritorio, móvil, y la que venga. Cada una
  // es una página distinta en Cargo, con su propio id. Se miden todas y cada
  // una decide su color por separado — la que esté escondida no mide nada.
  var NAV_IDS = ["L3482832595", "N1901077103"];
  var NAV_SEL = '[id="' + NAV_IDS.join('"], [id="') + '"]';

  // Las tres piezas del nav. Cada una mide el fondo que le toca: si la página
  // parte el fondo en dos, el lema puede ir blanco y el menú negro.
  var PARTS = ".nav-lema, .nav-logo, .nav-links";
  var SPLIT = true;       // false = un solo color para todo el nav (el promedio)

  var DEFAULT = "white";  // lo que se pinta cuando no hay nada medible
  var MARGIN  = 1.15;     // cambiar de color cuesta: el otro tiene que contrastar
                          // un 15% mejor. Es la histéresis — sin ella, un fondo
                          // justo en la frontera hace parpadear el nav al hacer
                          // scroll.

  var POLL_MS   = 1000;   // ronda de seguridad, por si algo cambió sin avisar
  var SCROLL_PX = 4;      // scroll mínimo para volver a medir

  // Elementos que pintan contenido propio: si el nav cae encima de uno no hay
  // color que leer — una foto no tiene background-color.
  var OPAQUE = { IMG: 1, VIDEO: 1, CANVAS: 1, PICTURE: 1, IFRAME: 1, "MEDIA-ITEM": 1 };

  // ── color ──────────────────────────────────────────────────────────────

  function parseColor(value) {
    var m = /rgba?\(([^)]+)\)/.exec(value || "");
    if (!m) return null;

    var t = m[1].split(/[,\s\/]+/).filter(Boolean);
    if (t.length < 3) return null;

    // Los navegadores serializan `rgb(0, 0, 0)` / `rgba(0, 0, 0, 0.5)`, pero
    // la sintaxis moderna admite porcentajes y hay que escalarlos.
    function num(token, full) {
      var n = parseFloat(token);
      if (n !== n) return null;
      return token.indexOf("%") >= 0 ? (n / 100) * full : n;
    }

    var c = {
      r: num(t[0], 255),
      g: num(t[1], 255),
      b: num(t[2], 255),
      a: t.length > 3 ? num(t[3], 1) : 1
    };

    if (c.r === null || c.g === null || c.b === null || c.a === null) return null;
    return c;
  }

  // `top` pintado sobre `bottom`, alfa incluido.
  function over(top, bottom) {
    var a = top.a + bottom.a * (1 - top.a);
    if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };

    return {
      r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
      g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
      b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
      a: a
    };
  }

  // Luminancia relativa (WCAG): 0 negro, 1 blanco. No es el promedio de RGB —
  // el verde pesa el triple que el rojo, que es como ve el ojo.
  function luminance(c) {
    function ch(v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
  }

  // ── medir el fondo ─────────────────────────────────────────────────────

  // Todo lo que hay debajo de (x, y), de arriba hacia abajo, ignorando los nav.
  // Devuelve null si topa con una foto: ahí no hay color, hay imagen.
  function colorAt(x, y) {
    var stack = document.elementsFromPoint(x, y);
    if (!stack) return null;

    var acc = { r: 0, g: 0, b: 0, a: 0 };

    for (var i = 0; i < stack.length; i++) {
      var el = stack[i];
      // Ningún nav se mide a sí mismo ni al otro: en móvil las dos instancias
      // están en el documento, una encima de la otra.
      if (el.closest && el.closest(NAV_SEL)) continue;

      var cs = getComputedStyle(el);

      if (OPAQUE[el.tagName] || cs.backgroundImage !== "none") {
        // Capa no medible. Si lo acumulado ya tapa casi todo, da igual lo que
        // haya debajo; si no, nos rendimos y manda el interruptor de la página.
        if (acc.a >= 0.99) break;
        return null;
      }

      var c = parseColor(cs.backgroundColor);
      if (!c) return null;
      if (c.a > 0) acc = over(acc, c);
      if (acc.a >= 0.99) break;
    }

    // Lo que quede sin cubrir es el lienzo del navegador: blanco.
    if (acc.a < 0.99) acc = over(acc, { r: 255, g: 255, b: 255, a: 1 });
    return acc;
  }

  // Tres catas por pieza: izquierda, centro y derecha de su caja.
  function pointsFor(el) {
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return [];

    var y = clamp(r.top + r.height / 2, 1, window.innerHeight - 2);
    var out = [];

    for (var i = 1; i <= 3; i++) {
      out.push([clamp(r.left + (r.width * i) / 4, 1, window.innerWidth - 2), y]);
    }
    return out;
  }

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  // Promedio de luminancia de una pieza, o null si ninguna cata sirvió.
  function measure(points) {
    var sum = 0;
    var n = 0;

    for (var i = 0; i < points.length; i++) {
      var c = colorAt(points[i][0], points[i][1]);
      if (!c) continue;
      sum += luminance(c);
      n += 1;
    }

    return n ? sum / n : null;
  }

  // ── el interruptor por página ──────────────────────────────────────────

  function normalize(value) {
    value = String(value || "").trim().toLowerCase();
    if (value === "blanco") return "white";
    if (value === "negro") return "black";
    if (value === "white" || value === "black") return value;
    return ""; // "auto", vacío o cualquier otra cosa: que mida
  }

  function switchOn(el) {
    if (!el || el.nodeType !== 1) return "";

    var marked = el.querySelector ? el.querySelector("[data-nav-mode]") : null;
    var attr = normalize(marked && marked.getAttribute("data-nav-mode"));
    if (attr) return attr;

    // Las custom properties heredan, así que basta leerla en un descendiente:
    // sirve puesta en .page, en .page-content o en body.
    return normalize(getComputedStyle(el).getPropertyValue("--nav-mode"));
  }

  // Lo que manda la página que está debajo, si es que manda algo.
  function forcedMode(points) {
    for (var i = 0; i < points.length; i++) {
      var stack = document.elementsFromPoint(points[i][0], points[i][1]) || [];
      for (var j = 0; j < stack.length; j++) {
        if (stack[j].closest && stack[j].closest(NAV_SEL)) continue;
        var hit = switchOn(stack[j]);
        if (hit) return hit;
        break; // solo la capa de arriba; lo demás ya lo hereda
      }
    }

    // Respaldo: la página puede ser más corta que el nav y la cata caer en el
    // body. Se pregunta a las páginas del documento, de la última a la primera.
    var pages = document.querySelectorAll(".page");
    for (var k = pages.length - 1; k >= 0; k--) {
      if (pages[k].closest(NAV_SEL)) continue; // las páginas del nav no cuentan
      var page = switchOn(pages[k]);
      if (page) return page;
    }

    return normalize(getComputedStyle(document.body).getPropertyValue("--nav-mode"));
  }

  // ── aplicar ────────────────────────────────────────────────────────────

  // Gana la tinta que más contraste contra ese fondo (fórmula de contraste de
  // la WCAG). Ojo: el punto de empate no es el gris del medio sino uno bastante
  // oscuro, ~#767676 — sobre un gris medio la letra negra se lee mejor que la
  // blanca, aunque el instinto diga lo contrario.
  //
  // El estado anterior sale del propio atributo: cuando Cargo reemplaza el nav
  // el clon llega sin él y la histéresis arranca limpia, que es lo correcto.
  function decide(lum, prev) {
    if (lum === null) return prev || DEFAULT;

    var black = (lum + 0.05) / 0.05;  // contraste de la tinta negra
    var white = 1.05 / (lum + 0.05);  // contraste de la tinta blanca
    var best = black > white ? "black" : "white";

    if (!prev || prev === best) return best;

    var gain = best === "black" ? black / white : white / black;
    return gain > MARGIN ? best : prev;
  }

  function set(el, mode) {
    if (el.getAttribute("data-nav") !== mode) el.setAttribute("data-nav", mode);
  }

  function update() {
    if (!document.elementsFromPoint) return;

    var navs = document.querySelectorAll(NAV_SEL);
    for (var i = 0; i < navs.length; i++) updateNav(navs[i]);
  }

  // Un nav escondido (el de escritorio en móvil, o al revés) no tiene caja: se
  // sale sin tocar nada y se queda con el color que traía hasta que reaparezca.
  function updateNav(nav) {
    var parts = nav.querySelectorAll(PARTS);
    var boxes = [];
    var all = [];
    var i;

    for (i = 0; i < parts.length; i++) {
      var points = pointsFor(parts[i]);
      if (!points.length) continue;
      boxes.push({ el: parts[i], points: points });
      all = all.concat(points);
    }

    // Sin piezas visibles (nav a medio montar): se mide la franja de abajo.
    if (!all.length) {
      var r = nav.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      var y = clamp(r.bottom - 24, 1, window.innerHeight - 2);
      all = [
        [clamp(r.left + r.width * 0.15, 1, window.innerWidth - 2), y],
        [clamp(r.left + r.width * 0.5, 1, window.innerWidth - 2), y],
        [clamp(r.left + r.width * 0.85, 1, window.innerWidth - 2), y]
      ];
    }

    var forced = forcedMode(all);

    if (forced) {
      set(nav, forced);
      for (i = 0; i < boxes.length; i++) boxes[i].el.removeAttribute("data-nav");
      return;
    }

    set(nav, decide(measure(all), nav.getAttribute("data-nav")));

    for (i = 0; i < boxes.length; i++) {
      if (!SPLIT) {
        boxes[i].el.removeAttribute("data-nav");
        continue;
      }
      var el = boxes[i].el;
      set(el, decide(measure(boxes[i].points), el.getAttribute("data-nav")));
    }
  }

  // ── cuándo medir ───────────────────────────────────────────────────────

  var queued = false;

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      update();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  window.addEventListener("pageshow", schedule);
  window.addEventListener("hashchange", schedule);
  window.addEventListener("popstate", schedule);

  var lastY = -1;
  window.addEventListener("scroll", function () {
    var y = window.pageYOffset;
    if (Math.abs(y - lastY) < SCROLL_PX) return;
    lastY = y;
    schedule();
  }, { passive: true });

  // Cargo repinta el nav y la página en cada navegación AJAX: sin observer, el
  // nav se queda con el color de la página anterior.
  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var node = records[i].target;
      if (node.nodeType !== 1) node = node.parentElement;

      // El lema reescribe su texto cada pocos ms y cambia de clase al teclear:
      // nada de eso mueve el fondo. (`data-nav`, lo que escribe este script, no
      // está en el attributeFilter de abajo, así que no se muerde la cola.)
      if (!node) continue;
      if (node.closest && node.closest("[data-glitch]")) continue;

      schedule();
      return;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "data-nav-mode"]
  });

  setInterval(schedule, POLL_MS);
})();
</script>
```

---

## 5. El interruptor por página

Por defecto el nav mide y decide solo. Cuando una página quiera mandar —porque
el fondo es una foto, porque el automático se equivoca, o simplemente porque
así se ve mejor— se le pone el interruptor. **El interruptor siempre gana.**

Dos formas, la que sea más cómoda. En el **CSS de la página**:

```css
/* Nav siempre blanco en esta página, mida lo que mida */
[id="E1964764012"].page { --nav-mode: white; }
```

O en el **HTML de la página**, sin tocar CSS — un elemento vacío en cualquier
parte de la página:

```html
<span data-nav-mode="black" hidden></span>
```

| Valor | Qué hace |
|---|---|
| `white` o `blanco` | nav blanco fijo — para páginas de fondo oscuro |
| `black` o `negro` | nav negro fijo — para páginas de fondo claro |
| `auto`, o no poner nada | vuelve a medir el fondo (lo de siempre) |

Puesto en `body` desde el CSS global, es el valor por defecto de todo el sitio.
Una página que lo quiera automático de nuevo pone `--nav-mode: auto`.

### Lo que el automático no puede ver

Mide `background-color` de las capas que hay bajo el nav, no píxeles. O sea:

- **Fotos, videos y degradados no se miden.** Si el nav cae sobre una carátula
  o un `background-image`, se queda con el último color que sí pudo medir. Esas
  páginas son exactamente el caso del interruptor.
- **Los `::before` / `::after` tampoco.** Los fades del catálogo, por ejemplo,
  son pseudo-elementos: invisibles para la medición.
- **Una capa con `pointer-events: none` no existe** para el test de posición, y
  la medición pasa de largo a la capa de abajo.
- **`opacity` en una capa entera no se tiene en cuenta**, solo el alfa del
  color de fondo.

### Calibrar el blanco/negro

| Constante | Qué hace | Valor |
|---|---|---|
| `SPLIT` | `true` = cada pieza (lema · logo · menú) mide su propio fondo y pueden salir de colores distintos. `false` = un solo color para todo el nav | `true` |
| `MARGIN` | cuánto mejor tiene que contrastar el otro color para que valga la pena cambiar. Es la histéresis: en `1` el nav parpadea en la frontera; en `1.5` se queda pegado al color que traía | `1.15` |
| `DEFAULT` | color cuando no hay absolutamente nada medible y la página no dijo nada | `"white"` |
| `POLL_MS` | ronda de seguridad | `1000` |
| `SCROLL_PX` | scroll mínimo, en px, para volver a medir | `4` |

Y en el CSS, `transition: color 220ms ease` es lo que hace que el cambio se
funda en vez de saltar. En `0ms` cambia seco.

Un efecto de `MARGIN` que conviene conocer: hay una franja angosta de grises
alrededor de `#767676` donde ninguna de las dos tintas gana por suficiente, y
ahí el nav **se queda con el color que traía**. O sea que sobre `#7a7a7a` puede
verse blanco o negro según de qué página vengas. Si un gris así va a ser el
fondo de una página, mejor fijarlo con el interruptor.

Probado con el nav real dentro de un DOM de mentira: fondos negro, blanco,
`#e5e5e5`, gris medio en los dos sentidos, un velo `rgba(0,0,0,0.6)` sobre
blanco, fondo partido en dos mitades, una foto encima, el interruptor en sus dos
idiomas, y el nav reemplazado en caliente como hace Cargo al navegar.

### La otra vía, si algún día se quiere

`mix-blend-mode: difference` sobre el nav lo invierte contra **cualquier** cosa,
fotos incluidas, sin una línea de JS. Se descartó porque sobre grises medios
queda un color sucio y no se puede fijar por página — pero para una portada de
puras imágenes es una línea de CSS.

---

## 6. La instancia móvil — `[id="N1901077103"]`

El nav de móvil es **otra página** de Cargo, con su propio id, su propio HTML y
su propio CSS. Los tres scripts ya la contemplan: cada uno tiene arriba la lista
de instancias, y es lo único que hay que tocar para añadir una más.

```js
var NAV_IDS = ["L3482832595", "N1901077103"];   // escritorio, móvil
```

Está en los scripts de las secciones 3 y 4, y tiene que decir lo mismo en los
dos. El de la bandera (sección 7) lleva la misma lista escrita como selector, en
`LOGO_SEL`: ahí el logo del móvil también invoca bandera.
Con eso, cada instancia se mide y se pinta por su cuenta: la que esté escondida
no tiene caja que medir, se salta sola y se queda con el color que traía hasta
que reaparezca. Y ninguna se mide a sí misma ni a la otra, que en móvil están
las dos en el documento, una encima de la otra.

**El HTML del móvil usa las mismas clases**: `.nav-lema`, `.nav-logo`,
`.nav-links` y el `<span data-glitch>`. Si allá se llaman distinto, hay que
agregar esas clases a `PARTS` en el script de la sección 4 — es lo que se mide.

**Tres cosas cambian respecto al escritorio**, y solo tres: la maquetación (dos
filas en vez de tres columnas), el logo (es un link al home, no un zoom) y el
menú (sin `MENU__`, que no cabe). Todo lo demás —los dos juegos de tinta, la
bandera, los pesos, las reservas de ancho— es lo mismo con otro id.

### El HTML

```html
<column-set gutter="1" mobile-stack="false"><column-unit slot="0"><div class="nav-lema">2026 © <span class="glitch" data-glitch>TODOS LOS IZQUIERDOS PÚBLICOS</span></div></column-unit><column-unit slot="1"><div class="nav-logo"><media-item class="linked" disable-zoom="true" hash="Y3055296379683564288776637724874" href="home" limit-by="width" rel="history" scale="40%"></media-item></div></column-unit><column-unit slot="2"><div class="nav-links"><a data-label="ABOUT" href="about" rel="history">ABOUT</a><a data-label="CATALOG" href="catalog" rel="history">CATALOG</a><a data-label="MERCA" href="merca" rel="history">MERCA</a><a data-label="BLOG" href="blog" rel="history">BLOG</a></div></column-unit></column-set>
```

- **`mobile-stack="false"` no es opcional.** Es lo que le dice a Cargo que no
  apile las tres columnas por su cuenta; si Cargo apila, el `flex-wrap` del CSS
  no llega a mandar y las dos filas no se arman.
- **El logo es un link, no un zoom.** `class="linked"` con `href="home"` y
  `disable-zoom="true"`, y a `scale="40%"` en vez del 15% del escritorio, que va
  `zoomable`. **Sigue invocando bandera**: `LOGO_SEL` (sección 7) cuelga de
  `.nav-logo` —el div de afuera— y no del `media-item`, así que el toque muestra
  la bandera y navega al home en el mismo gesto. Es exactamente lo que describe
  `FLASH_DEDO`: se ve un instante y la página cambia debajo.
- **Sin `MENU__`.** Es lo único del sistema nuevo que no pasó al móvil, y no por
  gusto: no cabe. Está medido más abajo.
- **El `<span data-glitch>` va limpio.** Si copias el nav del inspector te traes
  `class="glitch is-resting"` y los dos `<span>` de adentro (`.glitch-text` y
  `.glitch-caret`): eso lo escribe el script de la sección 3 en cada carga, no se
  escribe a mano. Pegarlo de vuelta no rompe nada —el script vacía el nodo y lo
  vuelve a armar— pero deja basura en el editor de Cargo.

### El CSS

```css
/* ============================================================
   CARGO — NAV MÓVIL  [id="N1901077103"]
   El mismo sistema del nav de escritorio (sección 2) con otra
   maquetación. Todo scopeado al id, como allá.
   ============================================================ */

[id="N1901077103"].page {
	min-height: var(--viewport-height);
}

/* — EL NAV, ENCIMA DE LA BANDERA —
   Lo mismo que en la sección 2 y por la misma razón. El `!important` no es
   decorativo: Cargo le escribe `z-index: 399` **en el atributo style** a toda
   página fijada, y un estilo en línea le gana a cualquier regla de la hoja.
   Sin él esta declaración no llega nunca, el nav se queda en 399 y la bandera
   (9998) lo tapa entero — medido en vivo, no deducido.

   `position` no se pone: Cargo ya deja la página en `fixed` desde `.page.fixed`,
   que pesa más que un selector de atributo. Un `position: relative` acá sería
   una declaración muerta. */

[id="N1901077103"].page {
	z-index: 9999 !important;
}

[id="N1901077103"] .page-content {
	align-items: flex-end;
	padding: 1rem;
}

[id="N1901077103"] .page-layout {
	align-items: flex-end;
}

/* — MÓVIL: DOS FILAS —
   Fila 1: el logo, de borde a borde.
   Fila 2: el lema a la izquierda, el menú a la derecha.
   Requiere mobile-stack="false" en el column-set: si Cargo apila por su
   cuenta, el flex-wrap de acá no llega a mandar. */

[id="N1901077103"] column-set {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: flex-end;
	justify-content: space-between;
	row-gap: 0.75rem;
}

[id="N1901077103"] column-set > column-unit {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	flex: 0 1 auto;
	width: auto;
	max-width: none;
}

/* Fila 1 — el logo se lleva la línea entera y la corta: lo que sigue baja. */
[id="N1901077103"] column-set > column-unit[slot="1"] {
	order: 0;
	flex: 0 0 100%;
	width: 100%;
}

/* Fila 2 — el lema es el que cede ancho; el menú no se comprime nunca. */
[id="N1901077103"] column-set > column-unit[slot="0"] {
	order: 1;
	/* `flex-basis: auto` toma el ancho de toda la frase antes de que el
	   recorte de `.nav-lema` entre a trabajar. Con base cero esta columna toma
	   únicamente el sobrante después del menú y nunca lo manda a otra fila. */
	flex: 1 1 0;
	width: 0;
	min-width: 0;
}

[id="N1901077103"] column-set > column-unit[slot="2"] {
	order: 2;
	flex: 0 0 auto;
}

/* Solo el logo necesita estirarse para que el text-align: center signifique
   algo; los otros dos se miden por su contenido. */
[id="N1901077103"] column-set > column-unit[slot="1"] > * {
	width: 100%;
}

/* — BLANCO O NEGRO —
   El script de la sección 4 escribe data-nav="white" | "black" en el nav, y
   también en cada pieza cuando la página parte el fondo en dos. Acá viven los
   dos juegos de color y nada más: ningún otro sitio pinta el nav. */

[id="N1901077103"],
[id="N1901077103"] [data-nav="white"] {
	--nav-ink: rgba(255, 255, 255, 0.85);  /* lema */
	--nav-ink-strong: rgb(255, 255, 255);  /* menú */
	--nav-logo-filter: none;               /* el logo ya viene blanco */
}

[id="N1901077103"][data-nav="black"],
[id="N1901077103"] [data-nav="black"] {
	--nav-ink: rgba(0, 0, 0, 0.85);
	--nav-ink-strong: rgb(0, 0, 0);
	--nav-logo-filter: invert(1);
}

/* — LA BANDERA MANDA —
   El mismo bloque de la sección 2, con el mismo porqué: la tinta que trae
   escrita la bandera gana sobre lo medido, y tiene que ganar también sobre lo
   que el medidor le escribió a cada pieza —un selector de dos partes—, así que
   este es de tres. Y sin transición: la bandera corta seco y la tinta tiene que
   cortar con ella. */

[id="N1901077103"][data-bandera="black"],
[id="N1901077103"][data-bandera="black"] [data-nav] {
	--nav-ink: rgba(0, 0, 0, 0.85);
	--nav-ink-strong: rgb(0, 0, 0);
	--nav-logo-filter: invert(1);
}

[id="N1901077103"][data-bandera="white"],
[id="N1901077103"][data-bandera="white"] [data-nav] {
	--nav-ink: rgba(255, 255, 255, 0.85);
	--nav-ink-strong: rgb(255, 255, 255);
	--nav-logo-filter: none;
}

/* Sin `.nav-menu` en la lista: en móvil no hay rótulo. */
[id="N1901077103"][data-bandera] :is(.nav-lema, .nav-links a),
[id="N1901077103"][data-bandera] media-item::part(media) {
	transition: none;
}

[id="N1901077103"] .nav-lema {
	display: flex;
	align-items: flex-end;
	min-width: 0;
	overflow: hidden;
	white-space: nowrap;
	text-align: left;
	color: var(--nav-ink);
	transition: color 220ms ease;
}

[id="N1901077103"] .nav-logo {
	text-align: center;
	line-height: 0; /* mata el descender del inline y lo apoya de verdad */
}

/* El logo es un PNG blanco: para el modo negro se invierte. Si algún día el
   archivo cambia a negro, hay que intercambiar los dos valores del filtro. */
[id="N1901077103"] media-item::part(media) {
	filter: var(--nav-logo-filter);
	transition: filter 220ms ease;
}

/* — MENÚ DERECHO — */

[id="N1901077103"] .nav-links {
	display: flex;
	justify-content: flex-end;
	align-items: flex-end;
	/* Un espacio normal de esta fuente mide ~0.28em, y eso es lo que va entre
	   los links, igual que en el escritorio: se leen como frase y no como cuatro
	   botones. Antes acá era 0.03em —casi tocándose—, que venía de cuando el
	   menú era un bloque de texto. */
	gap: 0.28em;
	line-height: 1;
	white-space: nowrap;
}

/* **Las páginas a las que se puede ir van en negrilla; la que se está viendo,
   no.** Es al revés de lo que uno haría, y es la idea: lo que pesa es lo que
   queda por hacer. La activa se retira —regular y en itálica— porque ya no es
   un destino, es dónde uno está. */
[id="N1901077103"] .nav-links a {
	display: inline-block;
	color: var(--nav-ink-strong);
	text-decoration: none;
	border-bottom: 0;
	font-weight: 700;
	transition: color 220ms ease;
}

/* Página activa: **itálica regular**, nunca subrayado. Cargo pone .active solo;
   .is-active es el respaldo que pone el script si Cargo no marcó nada. En el
   home no se marca ninguna: el home no está en la lista. */
[id="N1901077103"] .nav-links a.active,
[id="N1901077103"] .nav-links a.is-active {
	font-style: italic;
	font-weight: 400;
	text-decoration: none;
}

/* Reserva de ancho, para que marcar la página activa no empuje a los otros
   links. **Son dos y no una**: cada link puede estar en negrilla o en itálica
   regular, y las dos miden distinto, así que cada uno reserva las dos y se
   queda con la mayor. Bloques invisibles de altura cero: no se ven, no se
   seleccionan, no se leen. */
[id="N1901077103"] .nav-links a::before,
[id="N1901077103"] .nav-links a::after {
	content: attr(data-label);
	display: block;
	height: 0;
	overflow: hidden;
	visibility: hidden;
	pointer-events: none;
}

[id="N1901077103"] .nav-links a::before {
	font-style: normal;
	font-weight: 700;
}

[id="N1901077103"] .nav-links a::after {
	font-style: italic;
	font-weight: 400;
}

/* — LEMA QUE SE HACKEA — */

[id="N1901077103"] [data-glitch] {
	display: block;
	flex: 1 1 auto;
	min-width: 0;
	overflow: hidden;
	white-space: nowrap;
}

/* La pista es más ancha que su ventana solo cuando hace falta. El script la
   corre una letra a la vez al teclear; no hay marquee autónomo ni salto de
   línea. */
[id="N1901077103"] .glitch-track {
	display: inline-block;
	white-space: nowrap;
	will-change: transform;
}

/* En reposo el cursor no está. Aparece fijo mientras teclea, parpadea tres
   veces al terminar y se apaga: el `both` deja el último cuadro (opacidad 0)
   puesto, así que no hace falta un timer en JS para esconderlo. */
[id="N1901077103"] .glitch-caret::after {
	content: "▌";
	opacity: 0;
}

[id="N1901077103"] [data-glitch].is-typing .glitch-caret::after {
	opacity: 1;
}

[id="N1901077103"] [data-glitch].is-resting .glitch-caret::after {
	animation: ttx-caret 0.5s steps(1) 3 both;
}

/* Los mismos cuadros de la sección 2. Los `@keyframes` son globales y las dos
   definiciones son idénticas, así que sobra una — pero cada página de Cargo
   tiene que poder pararse sola, y si algún día se cambian los tiempos hay que
   cambiarlos en las dos. */
@keyframes ttx-caret {
	0%, 49% { opacity: 1; }
	50%, 100% { opacity: 0; }
}
```

### Por qué en móvil no hay `MENU__`

No cabe. Medido en el sitio en vivo, con la frase más larga del lema
(`TODOS LOS IZQUIERDOS PÚBLICOS`) y con `MENU__` más el espacio normal entre
links, la fila 2 se pasa **2 px** en los cuatro anchos que se probaron:

```
        lema  +  menú  =  total     caben
430 px   216  +  197   =   413   >   411
390 px   196  +  179   =   375   >   373
360 px   181  +  165   =   346   >   344
320 px   161  +  147   =   308   >   306
```

Los 2 px no son casualidad ni se arreglan con un teléfono más ancho: Cargo
escala la fuente del nav con el viewport, así que la proporción es la misma en
todos y siempre faltan los mismos 2 px. Sin el rótulo el menú mide 140 px a 390
y sobran 37: el espacio normal entre los cuatro links —que es lo que los hace
leerse como frase— sí entra cómodo, y es lo que quedó.

**Si el rótulo se vuelve innegociable**, la única combinación que cabe es
`MENU__` con el gap apretado de antes: el `.nav-menu` con su `::after` copiado
de la sección 2 y `gap: 0.03em` en `.nav-links` (170 px a 390, sobran 7). El
rótulo se lee y los cuatro links vuelven a ser un bloque. No hay una tercera.

Con esa medida se cayó también el parche que había acá: un `margin-left: 0.05em`
en el link que seguía al activo, que compensaba el aire que se come la negrilla
cuando el `gap` es de 0.03em. Con el espacio normal y las dos reservas de ancho
ya no hace falta.

**El interruptor no se duplica.** `--nav-mode` lo pone la página de contenido,
no el nav, así que el mismo valor manda sobre las dos instancias.

Dos cosas menores del móvil:

- Si las dos instancias tienen `data-glitch`, los dos lemas teclean a la vez,
  cada uno con su ciclo y su frase. No se ve —solo una está en pantalla— y no
  cuesta nada, pero si molesta, se le quita el `data-glitch` al que no se use.
- `markActive` (la página activa en itálica) también recorre las dos.

---

## 7. Script de la bandera — HTML global de Cargo

Va debajo de los otros dos, en el mismo HTML global. Es independiente de los
dos: si borras cualquiera, los demás siguen funcionando.

**Qué hace.** En About, pasar la mano por el logo tapa la página entera con una
de las cuatro banderas del sello, al azar, **menos el nav** — en las cuatro
capturas la barra de abajo sigue visible y legible encima de la bandera. En las
demás páginas el logo no la invoca. Y cada tanto, con el usuario quieto, una se
asoma sola un instante en cualquier página: el **respiro**.

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│                              │    │▚▚▚▚▚▚▚▚ bandera ▚▚▚▚▚▚▚▚▚▚▚▚▚│
│         el contenido         │ →  │▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚│
│                              │    │▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚▚│
│2026 ©…    [logo]   MENU__ AB…│    │2026 ©…    [logo]   MENU__ AB…│
└──────────────────────────────┘    └──────────────────────────────┘
                                     el nav se queda encima y legible
```

**Cinco reglas que no son negociables:**

1. **Corte seco, en las dos direcciones.** Ni fundido de entrada ni de salida.
   Una bandera que se desvanece se lee como una transición de página; una que
   corta se lee como un destello. Lo que se calibra no es el borde sino
   **cuánto dura puesta** — la escalera `RESPIROS` para el respiro,
   `COLA_MANO` para lo que aguanta después de soltar el logo. Es la diferencia
   entre un parpadeo y una presencia, y se consigue con el reloj, nunca con la
   opacidad.
2. **El nav nunca se tapa.** La bandera va en `z-index: 9998` y el nav en
   `9999` (sección 2). Si alguien le quita el `z-index` al nav, la bandera se lo
   come — y el logo, que es lo que la invoca, deja de verse.
   **Y el `9999` del nav solo cuenta si lleva `!important`**: Cargo le escribe
   `z-index: 399` en el atributo style a las páginas fijadas, y sin `!important`
   la regla de la hoja pierde contra el estilo en línea. Escrito así se ve
   inofensivo y no lo es: es la diferencia entre el nav encima de la bandera y
   el nav debajo. `nav-preview.html` emula ese estilo en línea justamente para
   que la trampa se vea antes de pegar en Cargo.
3. **El respiro corre en todo el sitio, solo con el usuario quieto.** Cualquier
   movimiento —ratón, scroll, tecla, dedo, cambio de página— reinicia el reloj.
   Es independiente del gesto manual: limitar el hover a About no lo limita.
4. **Las cuatro imágenes se crean una vez y no se van del DOM.** Se apagan con
   `opacity`, nunca con `display` ni cambiándole el `src` a una sola. Es la
   lección de los emblemas del About: el navegador no puede tener que decidir
   nada en el instante del destello.
5. **El nav se sigue leyendo.** Cada bandera trae escrita su tinta y el script
   se la pone al nav mientras dura (`data-bandera="black"` o `"white"`, y el CSS
   de la sección 2 hace el resto). No se mide: el script del blanco/negro mide
   con `elementsFromPoint` y la bandera es `pointer-events: none`, así que no la
   puede ver. Con tres banderas claras y una azul y roja, cuatro valores escritos
   a mano salen mejor que un medidor que se equivoca.

**Con la mano encima del logo la bandera se queda puesta** mientras la mano
esté, y **aguanta `COLA_MANO` después de soltarla** antes de cortar en seco: sin
esa cola, salir del logo apagaba la bandera en el mismo cuadro en que el ratón
cruzaba el borde y se sentía como si algo se hubiera roto. `RESPIROS` arranca
con un destello aislado y, sin una sola señal de vida, acorta la espera y alarga
la puesta en cuatro pasos; la quinta bandera queda fija. Cualquier movimiento,
scroll, tecla, toque o cambio de página vuelve la escalera a cero y retira esa
presencia. `FLASH_DEDO` es el toque en teléfono — ahí muestra la bandera **y
navega al home igual**: se ve un instante y la página cambia debajo.

Con `prefers-reduced-motion: reduce` **el respiro no corre**. El del logo sí: ese
lo pidió el usuario con la mano.

```html
<!-- SCRIPT BANDERA (logo de los navs L3482832595 · N1901077103) -->

<script>
(function () {
  // Cada bandera combina un fondo a pantalla completa y un SVG cuadrado centrado.
  // Sube VER cuando cambies los SVG para invalidar la caché de Pages.
  var VER = "?v=2";
  var BASE = "https://j-mamanche.github.io/tratratrax-web/media/banderas/";
  var BANDERAS = [
    {
      archivo: "estrellas.svg", tinta: "black",
      fondo: "#ffff01"
    },
    {
      archivo: "sur.svg", tinta: "black",
      fondo: "linear-gradient(to bottom," +
             "red 0 calc(0.08681 * var(--ttx-lado))," +
             "#1f191b calc(0.08681 * var(--ttx-lado)) calc(0.17362 * var(--ttx-lado))," +
             "#b4ff9c calc(0.17362 * var(--ttx-lado)) 100%)"
    },
    {
      archivo: "diagonal.svg", tinta: "black",
      fondo: "linear-gradient(135deg,#ffff01 0 50%,#d9d9d9 50% 100%)"
    },
    {
      archivo: "de-colombia.svg", tinta: "white",
      fondo: "linear-gradient(to right," +
             "#0015ff 0 calc(50% - var(--ttx-lado) / 6)," +
             "red calc(50% - var(--ttx-lado) / 6) calc(50% + var(--ttx-lado) / 6)," +
             "#0015ff calc(50% + var(--ttx-lado) / 6) 100%)"
    }
  ];

  var NAV_SEL = '[id="L3482832595"], [id="N1901077103"]';

  var Z = 9998;
  var FLASH_DEDO = 420;
  var COLA_MANO  = 800;
  // La quietud se vuelve presencia, no ráfaga: cada aparición tarda menos y
  // dura más. La última no corta hasta que alguien vuelva a dar una señal.
  var RESPIROS = [
    { espera: [20000, 40000], duracion: 1500 },
    { espera: [14000, 22000], duracion: 2600 },
    { espera: [10000, 16000], duracion: 4200 },
    { espera: [7000, 11000],  duracion: 6500 },
    { espera: [5000, 8000],   duracion: null }
  ];

  var LOGO_SEL = '[id="L3482832595"] .nav-logo, [id="N1901077103"] .nav-logo';

  var menos = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // La capa va en body para cubrir la página sin cubrir el nav.
  var capa = document.createElement("div");
  capa.setAttribute("aria-hidden", "true");
  capa.setAttribute("data-ttx-bandera", "");
  capa.style.cssText =
    "position:fixed;inset:0;z-index:" + Z + ";opacity:0;pointer-events:none;" +
    "visibility:hidden;contain:strict";

  // Mide la capa real para evitar desfases con scrollbars e iOS.
  function medir() {
    capa.style.setProperty(
      "--ttx-lado", Math.min(capa.clientWidth, capa.clientHeight) + "px");
  }

  var capas = [];
  for (var i = 0; i < BANDERAS.length; i++) {
    var una = document.createElement("div");
    una.style.cssText =
      "position:absolute;inset:0;opacity:0;background:" + BANDERAS[i].fondo;

    var img = document.createElement("img");
    img.src = BASE + BANDERAS[i].archivo + VER;
    img.alt = "";
    img.draggable = false;
    img.style.cssText =
      "position:absolute;left:50%;top:50%;display:block;" +
      "width:var(--ttx-lado);height:var(--ttx-lado);" +
      "transform:translate(-50%,-50%);pointer-events:none;user-select:none;" +
      "-webkit-user-select:none;-webkit-user-drag:none;-webkit-touch-callout:none";

    una.appendChild(img);
    capa.appendChild(una);
    capas.push(una);
  }

  window.addEventListener("resize", medir, { passive: true });
  window.addEventListener("orientationchange", medir, { passive: true });

  var puesta = false;
  var porMano = false;
  var ultima = -1;
  var reloj = null;
  var corte = null;
  var nivel = 0;
  var permanente = false;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function tinta(valor) {
    var navs = document.querySelectorAll(NAV_SEL);
    for (var i = 0; i < navs.length; i++) {
      if (valor) navs[i].setAttribute("data-bandera", valor);
      else navs[i].removeAttribute("data-bandera");
    }
  }

  function mostrar() {
    var k;
    do {
      k = Math.floor(Math.random() * capas.length);
    } while (capas.length > 1 && k === ultima);
    ultima = k;

    for (var j = 0; j < capas.length; j++) capas[j].style.opacity = j === k ? "1" : "0";
    capa.style.visibility = "visible";
    capa.style.opacity = "1";
    tinta(BANDERAS[k].tinta);
    puesta = true;
  }

  function ocultar() {
    capa.style.opacity = "0";
    capa.style.visibility = "hidden";
    tinta(null);
    puesta = false;
  }

  function enAbout() {
    var here = location.pathname.replace(/^\/|\/$/g, "").toLowerCase();
    return here === "about";
  }

  function agendar() {
    clearTimeout(reloj);
    reloj = null;
    if (menos || document.hidden || porMano) return;
    var paso = RESPIROS[Math.min(nivel, RESPIROS.length - 1)];
    reloj = setTimeout(respirar, rnd(paso.espera[0], paso.espera[1]));
  }

  function respirar() {
    reloj = null;
    if (menos || document.hidden || porMano) return agendar();

    var paso = RESPIROS[Math.min(nivel, RESPIROS.length - 1)];
    mostrar();
    nivel += 1;
    if (paso.duracion == null) {
      permanente = true;
      return;
    }
    clearTimeout(corte);
    corte = setTimeout(function () {
      corte = null;
      if (!porMano) ocultar();
      agendar();
    }, paso.duracion);
  }

  // La bandera responde a la quietud; una señal real devuelve el ciclo a cero
  // y, si ya llegó a presencia permanente, la retira de inmediato.
  function reiniciar() {
    nivel = 0;
    permanente = false;
    if (!porMano) {
      clearTimeout(corte);
      corte = null;
      if (puesta) ocultar();
    }
    agendar();
  }

  // Delegado porque Cargo reemplaza el nav durante la navegación AJAX.

  function logoDe(nodo) {
    if (!nodo || !nodo.closest) return null;
    return nodo.closest(LOGO_SEL);
  }

  document.addEventListener("pointerover", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (!enAbout()) return;
    var logo = logoDe(e.target);
    if (!logo || logoDe(e.relatedTarget) === logo) return;
    clearTimeout(corte);
    corte = null;
    porMano = true;
    clearTimeout(reloj);
    reloj = null;
    if (!puesta) mostrar();
  }, true);

  document.addEventListener("pointerout", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    if (!enAbout()) return;
    var logo = logoDe(e.target);
    if (!logo || logoDe(e.relatedTarget) === logo) return;
    porMano = false;
    clearTimeout(corte);
    corte = setTimeout(function () {
      corte = null;
      ocultar();
      agendar();
    }, COLA_MANO);
    agendar();
  }, true);

  document.addEventListener("pointerdown", function (e) {
    if (!e.pointerType || e.pointerType === "mouse") return;
    if (!enAbout()) return;
    if (!logoDe(e.target)) return;
    mostrar();
    clearTimeout(corte);
    corte = setTimeout(function () {
      corte = null;
      ocultar();
      agendar();
    }, FLASH_DEDO);
  }, true);

  var VIVO = ["mousemove", "pointerdown", "wheel", "keydown", "touchstart", "scroll"];
  for (var v = 0; v < VIVO.length; v++) {
    window.addEventListener(VIVO[v], reiniciar, { passive: true, capture: true });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearTimeout(reloj);
      reloj = null;
      if (!porMano) {
        clearTimeout(corte);
        corte = null;
        permanente = false;
        if (puesta) ocultar();
      }
    } else {
      reiniciar();
    }
  });

  window.addEventListener("popstate", reiniciar);
  window.addEventListener("pageshow", reiniciar);
  window.addEventListener("hashchange", reiniciar);

  var donde = location.href;

  function montar() {
    if (capa.parentNode !== document.body) {
      document.body.appendChild(capa);
      medir();
    }

    if (location.href !== donde) {
      donde = location.href;
      porMano = false;
      nivel = 0;
      permanente = false;
      clearTimeout(corte);
      corte = null;
      ocultar();
      agendar();
    } else if (!reloj && !corte && !permanente && !porMano) {
      agendar();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
  window.addEventListener("load", montar);
  setInterval(montar, 3000);

  window.TTX_BANDERA = {
    mostrar: mostrar,
    ocultar: ocultar,
    respirar: respirar,
    ritmo: function (min, max) {
      RESPIROS[0].espera = [min, max == null ? min : max];
      nivel = 0;
      permanente = false;
      agendar();
    }
  };
})();
</script>
```

### Calibrar el respiro

Con `nav-preview.html` abierto, en la consola:

```js
TTX_BANDERA.ritmo(3000);          // respiro cada 3s: se ve en una sentada
TTX_BANDERA.respirar();           // uno ya
TTX_BANDERA.ritmo(20000, 40000);  // volver a lo de verdad
```

El preview trae además dos botones —**respiro ya** y **cada 3s**— y un
interruptor de *home* para ver que ahí no dispara.

**Lo que hay que mirar al calibrar:** que el primer destello se sienta —un
segundo largo puesta, lo que lo separa de un parpadeo— sin leerse como un cambio
de página; que los siguientes se vuelvan más presentes sin hacer ráfaga; que el
nav se siga leyendo encima; y que, tras unos 70–110 segundos de quietud, la
última bandera se quede puesta hasta el siguiente gesto.

### Los archivos

Las cuatro van en `media/banderas/` del repo y se publican por Pages con el
resto del material, como los emblemas del About. **Cada una son dos piezas**: un
SVG cuadrado con el dibujo y nada más, y un campo de color que pinta el script
sobre la pantalla entera.

| Archivo | Qué dibuja | Qué pinta el CSS |
|---|---|---|
| `estrellas.svg` | las tres estrellas | amarillo de pared a pared |
| `sur.svg` | la palabra `SUR` | verde, con las franjas roja y negra arriba |
| `diagonal.svg` | `TRATRRRRRATRAX` y la estrella | el diagonal amarillo/gris |
| `de-colombia.svg` | `DE COLOMBIA / FROM COLOMBIA / DE COLOMBIA` | azul con la barra roja en el medio |

El cuadrado se planta en la mitad midiendo **el lado corto de la ventana**: en
desktop lo manda el alto y el color se va hacia los lados; en teléfono lo manda
el ancho y el color se va hacia arriba y hacia abajo. Así el dibujo siempre cabe
entero y lo único que se estira es el color, que es lo que se puede estirar sin
que nadie lo note.

Antes iban **a sangre** (`object-fit: cover`) con el SVG de `1440×1024`
completo, y en un teléfono eso recortaba por el lado largo: de
`TRATRRRRRATRAX` se veían cinco letras. Los originales de `1440` siguen ahí, en
`media/banderas/originales/`.

Para cambiar el set: se toca el arte, se vuelve a sacar el cuadrado sin fondo y
se ajusta esa bandera en la lista `BANDERAS` del script — el archivo, el
`fondo` y la `tinta`. El LEEME de la carpeta trae de dónde salen los números.

---

## Limpieza en el CSS global

En el CSS global quedaron estas reglas del intento anterior. **Hay que
borrarlas**: `--menu-text` tiene dos colores pegados (`#000000RGBA(16, 16, 16,
0.71)`), no es un valor válido, y `--menu-logo-filter` compite con el
`--nav-logo-filter` de la sección 2 por el mismo `::part(media)`.

```css
/* BORRAR del CSS global */
:root{
  --menu-text: #000000RGBA(16, 16, 16, 0.71);
  --menu-logo-filter: none;
}

[id="L3482832595"] .nav-links,
[id="L3482832595"] .nav-links a{
  color: var(--menu-text);
}

[id="L3482832595"] media-item::part(media){
  -webkit-filter: var(--menu-logo-filter);
  filter: var(--menu-logo-filter);
  transition: filter 200ms ease, -webkit-filter 200ms ease;
}
```

Lo único que vale la pena conservar de ahí es `[id="L3482832595"] media-item {
display: inline-block; }`, y va mejor en el CSS de la página.

---

## Calibrar el lema

Todo lo que se toca está en las constantes de arriba del script de la sección 3
(las del blanco/negro están en la sección 5):

| Constante | Qué hace | Valor |
|---|---|---|
| `PHRASES` | las frases que rotan; el orden no importa, se eligen al azar sin repetir la anterior | 5 frases |
| `HOLD_MIN` / `HOLD_MAX` | cuánto se queda quieta una frase antes del siguiente cambio | 3.2s–6.5s |
| `DEL_MS` / `DEL_JIT` | ms por letra borrada, ± la variación | `30` ± `14` |
| `TYPE_MS` / `TYPE_JIT` | ms por letra escrita, ± la variación. La variación es la que hace que suene a mano y no a máquina | `58` ± `42` |
| `PAUSE_MIN` / `PAUSE_MAX` | el respiro en blanco entre borrar y escribir | 180–420ms |
| `TRAIL` | letras de ruido que arrastra el cursor **al escribir**. Borrar es siempre limpio | `1` |
| `GHOST` | probabilidad, por letra dibujada, de que una ya escrita parpadee. `0` lo apaga | `0.05` |
| `AWAY_MS` / `AWAY_MAX` | cuánto espera a que el nodo vuelva al documento antes de rendirse | 1s × 30 |
| `WATCH_MS` | cada cuánto pasa la ronda de reparación | `3000` |

Y en el CSS: `animation: ttx-caret 0.5s steps(1) 3 both` son los parpadeos del
final — el `3` es cuántos, el `0.5s` qué tan lentos.

Una vuelta completa (borrar la frase larga, respirar, escribir la nueva) dura
entre 1s y 1.5s, más los 3–6s que se queda quieta.

Y en el CSS: `gap: 0.03em` en `.nav-links` es la separación del menú, más el
`margin-left: 0.05em` del link que sigue al activo, que compensa el aire que
se come la negrilla.

## Por qué el lema desaparecía (2026-07-28)

La primera versión se quedaba en blanco al recargar o al rato de navegar, y no
volvía nunca. Eran dos fallas que se tapaban entre sí:

- **El ciclo se moría en mitad de una fase.** Cada paso comprobaba
  `document.contains(el)` y, si el nodo no estaba, se suicidaba. Cargo mueve y
  reemplaza el nav al montar y en cada navegación AJAX; si el timer despertaba
  en esa ventana, el bucle moría dejando en pantalla lo que hubiera en ese
  instante — y entre borrar y escribir hay hasta 420ms de **cadena vacía**.
- **Nada podía revivirlo.** El flag vivía en `data-glitch-ready="1"`, un
  atributo del DOM: `scan()` veía el nodo "ya listo" y no lo tocaba. Peor, un
  atributo se copia con el nodo, así que si Cargo cachea el nav ya arrancado,
  la copia restaurada también vuelve marcada como lista.

Lo que cambió, en orden de importancia:

1. **La animación ya no se interrumpe nunca.** Arranca y termina, dure lo que
   dure y esté el nodo donde esté. Así los únicos estados largos posibles son
   *frase completa* o *animación de ~2s*: el estado vacío dejó de ser
   alcanzable como estado final.
2. **El único punto donde el ciclo puede parar es entre frases**, con el texto
   entero en pantalla. Y ahí estar fuera del documento no mata: espera hasta
   30s a que el nodo vuelva.
3. **El flag salió del DOM a un `WeakMap`.** No se copia con el nodo, así que
   un clon de Cargo se reinicializa solo.
4. **Ronda de reparación cada 3s.** Si el lema quedó vacío por cualquier causa
   que no previmos, vuelve a la frase completa en menos de 3s. Es la garantía
   de que "no vuelve nunca" ya no es un final posible.

Verificado con un DOM de mentira: cuatro ciclos de desprender/reinsertar en
fases distintas más un vaciado externo del nodo, y el lema siempre vuelve a
una frase completa; el peor atasco fue de 1.5s.

Si vuelve a pasar, esto dice en qué estado quedó:

```js
const el = document.querySelector('[data-glitch]');
console.log(JSON.stringify(el.textContent), el.className, el.isConnected);
```

Texto vacío con `is-typing` puesto es el bug viejo. Texto completo pero
invisible es CSS, no el script.

## Notas

- **`--menu-text` y `--menu-logo-filter` del CSS global se borran.** Eran el
  intento anterior de esto mismo; el reemplazo es `--nav-ink` / `--nav-logo-filter`
  de la sección 2, que sí los maneja el script. Ver «Limpieza en el CSS global».
- La frase larga y `DEL SUR` miden muy distinto: la columna izquierda encoge y
  crece al ritmo del cambio. Como está alineada a la izquierda no mueve nada
  más. Si molesta, `min-width: 15em` en `.nav-lema` lo congela al ancho de la
  frase más larga.
