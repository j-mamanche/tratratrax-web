# Qué se pega en Cargo para el nav `[id="L3482832595"]`

Cuatro pegadas: HTML de la página, CSS de la página, y **dos** bloques de script
en el HTML global (el lema que se hackea y el blanco/negro del nav). Los scripts
van globales porque Cargo navega por AJAX y el nav se vuelve a pintar en cada
cambio de página — si viven en la página, se mueren en la primera navegación.

El nav móvil es otra página de Cargo, `[id="N1901077103"]`: los mismos dos
scripts la manejan, y lo que hay que hacer allá está en la sección 6.

Antes de pegar en vivo: `cargo/snippets/nav-preview.html` es el mismo nav en un
archivo suelto. Se abre con doble clic y sirve para calibrar tiempos sin tocar
el sitio. Arriba a la izquierda tiene un panel —que no existe en Cargo— para
cambiarle el fondo a la página de abajo y accionar el interruptor, y ver al nav
decidir en vivo.

---

## 1. HTML de la página (nav)

Reemplaza el `<column-set>` entero:

```html
<column-set gutter="1"><column-unit slot="0"><div class="nav-lema">2026 © <span class="glitch" data-glitch>TODOS LOS IZQUIERDOS PÚBLICOS</span></div></column-unit><column-unit slot="1"><div class="nav-logo"><media-item class="zoomable" hash="Y3055296379683564288776637724874" limit-by="width" scale="15%"></media-item></div></column-unit><column-unit slot="2"><div class="nav-links"><a href="about" rel="history" data-label="ABOUT">ABOUT</a><a href="catalog" rel="history" data-label="CATALOG">CATALOG</a><a href="merca-2" rel="history" data-label="MERCA">MERCA</a><a href="blog-2" rel="history" data-label="BLOG">BLOG</a></div></column-unit></column-set>
```

Cuatro cosas que no son cosméticas:

- **El lema ya no lleva `style="color: ..."` inline.** Un color inline le gana a
  todo, incluido el script que decide si el nav va blanco o negro. El color sale
  ahora del CSS (`--nav-ink`). Si lo vuelves a poner a mano, el lema se queda
  blanco para siempre.
- **`ABOUT CATALOG MERCA BLOG` ahora son links de verdad.** En lo que estaba
  pegado era un `<span>` de texto plano: se veía como menú pero no navegaba, y
  sin `<a>` no hay página activa que marcar. Los slugs son los reales del sitio
  (`about` · `catalog` · `merca-2` · `blog-2`).
- **No hay espacios ni `&nbsp;` entre los `<a>`.** La separación la pone el
  `gap` del CSS, que se mide exacto. Si dejas un salto de línea entre los links,
  vuelve a colarse un espacio de texto encima del `gap`.
- **`data-label` repite la etiqueta.** El CSS lo usa para reservar el ancho de la
  negrilla desde siempre, así el menú no se corre cuando cambias de página.

El `<span data-glitch>` es lo único que rota. El `2026 ©` se queda quieto.

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
	/* Un espacio normal de esta fuente mide ~0.28em; esto es el 10% de eso.
	   Las palabras quedan casi tocándose — es a propósito. */
	gap: 0.03em;
	line-height: 1;
	white-space: nowrap;
}

[id="L3482832595"] .nav-links a {
	display: inline-block;
	color: var(--nav-ink-strong);
	text-decoration: none;
	border-bottom: 0;
	font-weight: 400;
	transition: color 220ms ease;
}

/* Página activa: negrilla, nunca subrayado. Cargo pone .active solo;
   .is-active es el respaldo que pone el script si Cargo no marcó nada. */
[id="L3482832595"] .nav-links a.active,
[id="L3482832595"] .nav-links a.is-active {
	font-weight: 700;
	text-decoration: none;
}

/* La negrilla come el aire a su alrededor y con un gap tan chico se nota:
   el link que sigue al activo necesita un pelo más de espacio para que la
   separación se lea pareja. Va en el de después, no en el activo, para que
   cuando el activo sea el último (BLOG) no se despegue del borde derecho. */
[id="L3482832595"] .nav-links a.active + a,
[id="L3482832595"] .nav-links a.is-active + a {
	margin-left: 0.05em;
}

/* Reserva el ancho de la negrilla siempre, para que marcar la página activa
   no empuje los otros links. Invisible y de altura cero. */
[id="L3482832595"] .nav-links a::after {
	content: attr(data-label);
	display: block;
	height: 0;
	overflow: hidden;
	visibility: hidden;
	font-weight: 700;
	pointer-events: none;
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

    ctl.out = document.createElement("span");
    ctl.out.className = "glitch-text";
    ctl.out.textContent = ctl.phrase;

    var caret = document.createElement("span");
    caret.className = "glitch-caret";
    caret.setAttribute("aria-hidden", "true");

    el.appendChild(ctl.out);
    el.appendChild(caret);

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
        later(erase, rnd(DEL_MS - DEL_JIT, DEL_MS + DEL_JIT));
      }

      function type() {
        typed += 1;

        if (typed > to.length) {
          settle(TRAIL - 1);
          return;
        }

        ctl.out.textContent = withTrail(to, typed, TRAIL);
        later(type, rnd(TYPE_MS - TYPE_JIT, TYPE_MS + TYPE_JIT));
      }

      // Deja que el residuo se apague solo en vez de cortarlo de golpe.
      function settle(trail) {
        if (trail <= 0) {
          ctl.out.textContent = to;
          el.classList.remove("is-typing");
          el.classList.add("is-resting"); // dispara los parpadeos finales
          ctl.idle = true;
          done();
          return;
        }

        ctl.out.textContent = withTrail(to, to.length, trail);
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
su propio CSS. Los dos scripts ya la contemplan: cada uno tiene arriba la lista
de instancias, y es lo único que hay que tocar para añadir una más.

```js
var NAV_IDS = ["L3482832595", "N1901077103"];   // escritorio, móvil
```

Está en los dos scripts (secciones 3 y 4) y tiene que decir lo mismo en ambos.
Con eso, cada instancia se mide y se pinta por su cuenta: la que esté escondida
no tiene caja que medir, se salta sola y se queda con el color que traía hasta
que reaparezca. Y ninguna se mide a sí misma ni a la otra, que en móvil están
las dos en el documento, una encima de la otra.

**El HTML del móvil usa las mismas clases**: `.nav-lema`, `.nav-logo`,
`.nav-links` y el `<span data-glitch>`. Si allá se llaman distinto, hay que
agregar esas clases a `PARTS` en el script de la sección 4 — es lo que se mide.

**El CSS va en el CSS de esa página**, con su id. Basta con el bloque de color;
la maquetación del móvil es la que ya tenga:

```css
[id="N1901077103"],
[id="N1901077103"] [data-nav="white"] {
	--nav-ink: rgba(255, 255, 255, 0.85);
	--nav-ink-strong: rgb(255, 255, 255);
	--nav-logo-filter: none;
}

[id="N1901077103"][data-nav="black"],
[id="N1901077103"] [data-nav="black"] {
	--nav-ink: rgba(0, 0, 0, 0.85);
	--nav-ink-strong: rgb(0, 0, 0);
	--nav-logo-filter: invert(1);
}

[id="N1901077103"] .nav-lema { color: var(--nav-ink); transition: color 220ms ease; }
[id="N1901077103"] .nav-links a { color: var(--nav-ink-strong); transition: color 220ms ease; }

[id="N1901077103"] media-item::part(media) {
	filter: var(--nav-logo-filter);
	transition: filter 220ms ease;
}
```

**El interruptor no se duplica.** `--nav-mode` lo pone la página de contenido,
no el nav, así que el mismo valor manda sobre las dos instancias.

Dos cosas menores del móvil:

- Si las dos instancias tienen `data-glitch`, los dos lemas teclean a la vez,
  cada uno con su ciclo y su frase. No se ve —solo una está en pantalla— y no
  cuesta nada, pero si molesta, se le quita el `data-glitch` al que no se use.
- `markActive` (la página activa en negrilla) también recorre las dos.

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
