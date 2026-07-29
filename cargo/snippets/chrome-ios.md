# El color de la barra del navegador en iPhone

Lo que en iOS se pinta alrededor de la página —la franja del notch/Dynamic
Island arriba y la barra de búsqueda abajo— sale del **lienzo del documento**,
que en este sitio lo pinta el `body`:

```css
/* CSS global, línea 19 */
body { background-color: #e5e5e5; }
```

Ese gris es el que se ve arriba y abajo aunque la página sea negra. Comprobado
cambiándolo a mano: se mueven las dos barras. **Ese es el interruptor real.**

El `<meta name="theme-color">` es el otro camino y el script también lo escribe,
porque cuando Safari lo respeta manda sobre el lienzo. Pero no depende de él: si
el iPhone es viejo, si el tintado de sitios web está apagado o si es navegación
privada, el fondo del `body` sigue funcionando igual.

El problema de fondo es que **el `body` es uno solo para todo el sitio** y las
páginas tienen fondos distintos. Como además Cargo navega por AJAX, esto tiene
que ser un script que reescriba el color en cada cambio de página: va en el
**HTML global**, al lado de los otros dos (el lema y el blanco/negro del nav).

No hay que tocar el `<head>` de Cargo: si el `<meta>` no existe, el script lo
crea.

**Lo que hay que quitar del CSS global** es el `background-color: #e5e5e5` de
`body` — o dejarlo, que da igual: el script lo pisa con un estilo inline, que
gana. Dejarlo tiene la ventaja de que es lo que se ve mientras el script arranca
y lo que queda si algún día se quita el script.

---

## Cómo elige el color

Le lee el `background-color` a la página que está en pantalla —no cata píxeles—
subiendo desde `.page-content` hasta la página, componiendo los alfas. Es
directo y no se equivoca con las capas del nav.

Lo que ese color no captura: fotos, videos y degradados de fondo. Una portada de
pura imagen no tiene color que leer y cae al fondo de su contenedor. Para esas
está el interruptor de más abajo.

---

## El script

```html
<!-- SCRIPT COLOR DE LA BARRA DEL NAVEGADOR (iOS) -->

<script>
(function () {
  // Los navs son páginas de Cargo como cualquier otra, pero fijas encima del
  // contenido: nunca son ellas las que mandan el color. Misma lista que en el
  // script del blanco/negro.
  var NAV_IDS = ["L3482832595", "N1901077103"];
  var NAV_SEL = '[id="' + NAV_IDS.join('"], [id="') + '"]';

  var POLL_MS = 1000; // ronda de seguridad, por si algo cambió sin avisar

  // ── color ──────────────────────────────────────────────────────────────

  function parseColor(value) {
    var m = /rgba?\(([^)]+)\)/.exec(value || "");
    if (!m) return null;

    var t = m[1].split(/[,\s\/]+/).filter(Boolean);
    if (t.length < 3) return null;

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

  function hex(c) {
    function ch(v) {
      v = Math.round(v);
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      return (v < 16 ? "0" : "") + v.toString(16);
    }
    // Safari ignora el alfa: el color tiene que llegar opaco.
    return "#" + ch(c.r) + ch(c.g) + ch(c.b);
  }

  // El gris de siempre, capturado ANTES de que el script toque nada. Es el
  // suelo sobre el que se componen los fondos translúcidos — y leerlo una sola
  // vez es lo que evita que el script se lea a sí mismo y se quede pegado.
  var BASE = parseColor(getComputedStyle(document.body).backgroundColor);
  if (!BASE || BASE.a < 0.99) BASE = { r: 255, g: 255, b: 255, a: 1 };

  // Resuelve cualquier color de CSS ("black", "#0a0a0a", "rgb(...)") dejando
  // que el navegador haga el trabajo. null si no es un color válido.
  var probe = null;

  function resolve(value) {
    value = String(value || "").trim();
    if (!value || value === "auto") return null;
    if (value === "blanco") value = "white";
    if (value === "negro") value = "black";

    if (!probe) {
      probe = document.createElement("div");
      probe.style.display = "none";
      document.documentElement.appendChild(probe);
    }

    probe.style.backgroundColor = "";
    probe.style.backgroundColor = value;
    if (!probe.style.backgroundColor) return null; // el navegador la rechazó

    return parseColor(getComputedStyle(probe).backgroundColor);
  }

  // ── la página que está en pantalla ─────────────────────────────────────

  // Cargo deja páginas viejas en el DOM mientras transiciona, y los overlays
  // (el drawer del catálogo) son páginas también. La que manda es la última
  // que ocupa pantalla de verdad.
  function visiblePage() {
    var pages = document.querySelectorAll(".page");

    for (var i = pages.length - 1; i >= 0; i--) {
      var p = pages[i];
      if (p.closest(NAV_SEL)) continue;

      var r = p.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.bottom < 1 || r.top > window.innerHeight - 1) continue;

      return p;
    }

    return null;
  }

  // El fondo se pinta unas veces en `.page` y otras en `.page-content`. Se
  // apila desde adentro hacia afuera hasta que tape, sin llegar al body.
  function pageColor(page) {
    var el = page.querySelector(".page-content") || page;
    var acc = { r: 0, g: 0, b: 0, a: 0 };

    while (el && el !== document.body) {
      var c = parseColor(getComputedStyle(el).backgroundColor);
      if (c && c.a > 0) acc = over(acc, c);
      if (acc.a >= 0.99) return acc;
      el = el.parentElement;
    }

    // Lo que no tapó, lo tapa el gris de siempre.
    return over(acc, BASE);
  }

  // ── el interruptor por página ──────────────────────────────────────────

  function switchOn(el) {
    if (!el || el.nodeType !== 1) return null;

    var marked = el.querySelector ? el.querySelector("[data-chrome-color]") : null;
    var attr = marked && resolve(marked.getAttribute("data-chrome-color"));
    if (attr) return attr;

    // Custom property: hereda, así que basta leerla en la página.
    return resolve(getComputedStyle(el).getPropertyValue("--chrome-color"));
  }

  // ── aplicar ────────────────────────────────────────────────────────────

  var meta = document.querySelector('meta[name="theme-color"]:not([media])');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }

  var last = "";

  function apply(value) {
    if (value === last) return;
    last = value;

    // Esto es lo que de verdad pinta las barras del iPhone: el lienzo del
    // documento. Inline, para ganarle al `background-color` del CSS global.
    document.body.style.backgroundColor = value;
    document.documentElement.style.backgroundColor = value;

    meta.setAttribute("content", value);

    // Hay versiones de Safari que no se enteran de que el atributo cambió.
    // Sacar y volver a meter el nodo las obliga a releerlo. Pasa una vez por
    // cambio de color, o sea una vez por página.
    if (meta.parentNode) meta.parentNode.removeChild(meta);
    document.head.appendChild(meta);
  }

  function update() {
    if (!document.body) return;

    var page = visiblePage();
    var forced = page ? switchOn(page) : null;
    if (!forced) forced = resolve(getComputedStyle(document.body).getPropertyValue("--chrome-color"));

    apply(hex(forced || (page ? pageColor(page) : BASE)));
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
  window.addEventListener("orientationchange", schedule);
  window.addEventListener("pageshow", schedule);
  window.addEventListener("hashchange", schedule);
  window.addEventListener("popstate", schedule);

  // Cargo repinta la página entera en cada navegación AJAX.
  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      var node = rec.target;
      if (node.nodeType !== 1) node = node.parentElement;
      if (!node) continue;

      // Lo que escribe este mismo script no cuenta, o se muerde la cola.
      if (rec.attributeName === "style" &&
          (node === document.body || node === document.documentElement)) continue;

      // El lema reescribe su texto cada pocos ms: eso no mueve ningún fondo.
      if (node.closest("[data-glitch]")) continue;

      schedule();
      return;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "data-chrome-color"]
  });

  setInterval(schedule, POLL_MS);
})();
</script>
```

---

## El interruptor por página

Cuando el automático no sirve —fondo de foto, o simplemente porque se ve mejor
de otro color— la página manda. **Siempre gana.** En el CSS de la página:

```css
[id="L4057471394"].page { --chrome-color: #0a0a0a; }
```

O en el HTML de la página, sin tocar CSS:

```html
<span data-chrome-color="#0a0a0a" hidden></span>
```

Acepta cualquier color válido de CSS (`#0a0a0a`, `black`, `rgb(10,10,10)`, y
también `negro` / `blanco`). `auto` o nada = que lo saque de la página.

Puesto en `body` desde el CSS global es el valor por defecto del sitio.

---

## Lo que cambia de aspecto

El `body` deja de ser gris fijo: ahora es del color de la página. Eso se nota
**donde el `body` se ve**, que en este sitio es poco pero no cero:

- el margen alrededor de `.page-content` cuando la página no llega a los bordes;
- el fondo durante las transiciones AJAX entre páginas;
- el rebote del overscroll.

Es justamente el efecto que se busca, pero conviene mirarlo en las páginas de
fondo claro después de pegarlo.

---

## Si algún día no tinta las barras

En orden, de más probable a menos:

1. **La página no dice de qué color es.** Su fondo lo pone una foto o un
   `background-image`. Interruptor.
2. **`theme-color` no aplica en ese iPhone** (iOS viejo, navegación privada, o
   el tintado de sitios web apagado en Ajustes → Safari). No importa: el fondo
   del `body` sigue haciendo el trabajo.
3. **El script no está corriendo.** Se comprueba en un segundo pegando esto
   solo en el HTML global: `<script>document.body.style.background="#f00"</script>`.
   Si no se pone todo rojo, el problema es dónde está pegado, no el código.

---

## Si se quiere meter el contenido bajo el notch

Hoy Cargo deja la safe area como margen, y esa franja se pinta del color del
lienzo — que es justo lo que resuelve este script. Si algún día se quiere que el
contenido pase por debajo del notch, hace falta `viewport-fit=cover` en el meta
de viewport y `padding-top: env(safe-area-inset-top)` donde toque. Es otra
decisión de maquetación.
