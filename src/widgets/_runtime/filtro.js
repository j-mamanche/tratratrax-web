// Los filtros SVG del sitio, en un solo `<svg>` de definiciones.
//
// Son dos y son parientes: los dos aplastan una imagen a dos tonos. Lo que
// cambia es qué se hace después con ese aplastamiento.
//
//   #ttx-visor-fx   la estampa del visor del catálogo. Se queda con el umbral
//                   y nada más: lo que se ve ahí *es* la estampa.
//   #ttx-gooey      el merge del home. El mismo umbral, pero devuelto sobre la
//                   imagen original —el `source mix`—, así que lo que se ve es
//                   el arte con las formas fundidas encima, no un sello.
//
// Nada de esto existe como filtro de CSS: `blur()` sí, pero no hay ni
// `posterize` ni umbral. En SVG sí, y se referencia igual —`filter: url(#…)`—
// así que el punto de calibración sigue siendo una sola variable.

const NS = 'http://www.w3.org/2000/svg';

// ── El visor del catálogo ─────────────────────────────────────────────
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
const VISOR = `
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

// ── El gooey merge del home ───────────────────────────────────────────
//
// Viene de Figma: es el efecto de la librería de shaders que el sello usó
// sobre las carátulas —«Gooey blob-merge effect using multi-pass Gaussian blur
// and threshold to merge nearby shapes into organic blobs»—. **El shader se
// leyó, no se adivinó** (MCP de Figma, `get_shader_effect`), así que lo de
// abajo no es un parecido: es su misma cuenta, escrita con las primitivas que
// hay en SVG.
//
//   1. desenfoque gaussiano de dos pasadas;
//   2. de ahí sale un **campo**, que es la luminancia de lo desenfocado;
//   3. el campo se corta por un umbral con un `smoothstep`, no con un escalón:
//      lo que sale es cuánto de blob hay en cada píxel, entre 0 y 1;
//   4. dentro del blob va el frente —mezclado con la imagen desenfocada según
//      `sourceMix`— y fuera va el fondo.
//
// Los parámetros llevan el nombre que tienen allá, para poder comparar sin
// traducir. Los valores son los del archivo del sello.
export const GOOEY = {
  spread: 0, // 0–50 en Figma
  threshold: 5, // -50–50 (%)
  edgeSoftness: 0.8, // 0–10
  sourceMix: 83, // 0–100 (%): cuánto de la imagen se ve dentro del blob
  frente: '#ffffff',
  fondo: '#000000',
  invertir: true,
};

// Tres cuentas que el shader hace adentro y que aquí hay que repetir, porque
// los números de los deslizadores no son los números del filtro.

/**
 * El desenfoque. En el shader son dos pasadas gaussianas con `sigma =
 * (spread + 4) / 3`, y las dos avanzan de dos en dos píxeles —trabaja a media
 * resolución—, así que en píxeles de pantalla la sigma vale el doble.
 *
 * De ahí que `spread: 0` **no** sea "sin desenfoque": son ~2,7 px. Es el piso
 * del efecto, no su ausencia.
 */
const desenfoque = ({ spread }) => (2 * (spread + 4)) / 3;

/**
 * Dónde corta el umbral, en luminancia. El deslizador va de -50 a 50 y no es
 * lineal: en 0 corta a la mitad, hacia arriba se cierra rápido —cuadrático— y
 * hacia abajo se abre más despacio. Con `threshold: 5` el corte queda en 0,451,
 * no en 0,5: la diferencia es visible y es justo la clase de número que no se
 * saca a ojo.
 */
function corte({ threshold }) {
  const n = Math.min(Math.max(threshold / 100, -1), 1);
  return n >= 0 ? (1 - n) * (1 - n) * 0.5 : 0.5 - n - (n * n) / 2;
}

/**
 * El ancho del degradado del borde, en unidades de campo. En el shader es los
 * píxeles del deslizador **divididos por el spread**: el borde se mide
 * relativo a lo desenfocado que esté todo, no en absoluto.
 */
const suavidad = ({ edgeSoftness, spread }) => edgeSoftness / Math.max(spread + 4, 1);

/**
 * El `smoothstep` del shader, muestreado en una tabla.
 *
 * `feComponentTransfer type="table"` interpola linealmente entre los valores
 * que se le den, así que con treinta y tres muestras la curva queda
 * indistinguible de la de allá. Un `discrete` —que fue el primer intento— no
 * sirve: da un escalón, y entonces `edgeSoftness` no significa nada.
 */
const PASOS = 32;

function tabla(p) {
  const c = corte(p);
  const s = suavidad(p);
  const lo = c - s;
  const hi = c + s;

  return Array.from({ length: PASOS + 1 }, (_, i) => {
    const x = i / PASOS;
    let t;
    if (hi <= lo) t = x < c ? 0 : 1;
    else {
      const u = Math.min(Math.max((x - lo) / (hi - lo), 0), 1);
      t = u * u * (3 - 2 * u);
    }
    return +(p.invertir ? 1 - t : t).toFixed(4);
  }).join(' ');
}

function gooey(p) {
  const b = desenfoque(p).toFixed(2);
  const mezcla = Math.min(Math.max(p.sourceMix / 100, 0), 1);

  // La región va justa, sin desbordar: el shader muestrea con `clamp-to-edge`
  // y aquí el equivalente es `edgeMode="duplicate"` más no dejar que el
  // desenfoque se coma los bordes. Un navegador que ignore `edgeMode` deja una
  // orla suave en el borde del módulo; ninguno de los dos casos rompe nada.
  return `
<filter id="ttx-gooey" x="0" y="0" width="100%" height="100%"
        color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="${b}" edgeMode="duplicate" result="borroso"/>

  <!-- El campo: la luminancia de lo desenfocado, guardada en el alfa. -->
  <feColorMatrix in="borroso" type="luminanceToAlpha" result="campo"/>
  <feComponentTransfer in="campo" result="mascara">
    <feFuncA type="table" tableValues="${tabla(p)}"/>
  </feComponentTransfer>

  <!-- Lo que va dentro del blob: el frente con la imagen desenfocada encima,
       en la proporción del source mix. -->
  <feFlood flood-color="${p.frente}" result="frente"/>
  <feComposite in="frente" in2="borroso" operator="arithmetic"
               k1="0" k2="${(1 - mezcla).toFixed(3)}" k3="${mezcla.toFixed(3)}" k4="0" result="relleno"/>
  <feComposite in="relleno" in2="mascara" operator="in" result="blob"/>

  <!-- Y fuera, el fondo. -->
  <feFlood flood-color="${p.fondo}" result="fondo"/>
  <feComposite in="blob" in2="fondo" operator="over"/>
</filter>`;
}

/**
 * Los parámetros del gooey, con lo que diga la URL encima.
 *
 * Es para calibrar contra la referencia de Figma sin recompilar:
 * `/preview/home?ttx-threshold=20&ttx-spread=12`. El prefijo `ttx-` está para
 * que una URL de Cargo con sus propios parámetros no toque nada.
 *
 * No hay validación de rango a propósito: es una perilla de taller y pasarse
 * es parte de buscar el número. El que gane se escribe en `GOOEY`.
 */
function parametros() {
  const q = new URLSearchParams(location.search);
  const p = { ...GOOEY };

  for (const clave of Object.keys(GOOEY)) {
    const v = q.get(`ttx-${clave.toLowerCase()}`);
    if (v === null) continue;
    if (clave === 'invertir') p[clave] = v !== '0' && v !== 'false';
    else if (clave === 'frente' || clave === 'fondo') p[clave] = v;
    else p[clave] = Number(v);
  }
  return p;
}

/**
 * Uno solo para todo el documento: los filtros no dependen de la instancia.
 *
 * Idempotente, y tiene que serlo: Cargo navega por AJAX y esto se llama en
 * cada montaje de cada widget.
 */
export function inyectarFiltros() {
  if (document.getElementById('ttx-filtros')) return;

  const svg = document.createElementNS(NS, 'svg');
  svg.id = 'ttx-filtros';
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  // Fuera del flujo y sin tamaño: es una definición, no algo que se vea.
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = VISOR + gooey(parametros());
  document.body.append(svg);
}
