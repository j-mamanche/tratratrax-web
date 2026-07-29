# Qué se pega en Cargo para el home

Una sola línea en la página de inicio. El loader global —el `<script>` del
`ttx.js`— ya está puesto para el catálogo; si no, está en
[catalogo.md](catalogo.md) y se pega una sola vez en la vida del sitio.

```html
<div data-ttx="home"></div>
```

Con el recorte que ya usa el catálogo, que es lo que se va a querer:

```html
<div data-ttx="home" style="--ttx-margen: 6px; --ttx-nav-h: 18px"></div>
```

`--ttx-nav-h` no es decorativo: es el hueco que se le reserva a la barra de
Cargo, y donde termina la caja de abajo. Si queda en cero, la carátula —o el
video, según el estado— se mete debajo de la barra.

---

## Qué hace

**En reposo el home es una cenefa.** El video ocupa únicamente la franja del
título, de borde a borde, y todo lo demás está en negro: una grieta de video con
el nombre del disco encima. No se ve la carátula, no se ve una composición. El
canal de información no se ilumina porque sea importante, sino porque es la
bisagra — y es lo primero y lo último que se ve.

1. **Reposo** — la cenefa. El video vive dentro de la franja del título.
2. **La mano entra al título** — la grieta se abre en las dos cajas del
   lanzamiento: **carátula arriba, video abajo**.
3. **La mano se va** — corte seco, y vuelve la cenefa.
4. **La pasada siguiente abre la contraria**: video arriba, carátula abajo. Y
   así, alternando.

La composición **es el gesto**: existe mientras alguien la sostiene. El cambio
de una a otra ocurre al cerrar, con la cenefa ya en pantalla, así que nadie lo
ve: uno pasa otra vez y encontró la otra. En teléfono el toque hace de mano —se
mantiene el dedo, se abre; se suelta, se cierra—; con teclado, el foco.

**Corte seco en las tres transiciones.** Sin fundido, sin deslizamiento, sin
easing: el corte dura cero y no hay variable para ablandarlo.

**La mano no espera:** entrar al título cambia la pantalla en el mismo
fotograma. Lo que se controla es lo de después — un estado dura **como mínimo
100 ms** antes de que pueda entrar el siguiente, para que una pasada rápida no
se lea como un parpadeo. No se pierde ningún cambio: el que llega antes de
tiempo espera su turno. Se calibra con `data-minimo` en el placeholder.

**En teléfono el home respira:** cinco segundos de franja, **un destello de un
segundo** con la composición abierta, y otra vez la franja. Como al cerrar
voltea, un destello enseña una composición y el siguiente la otra. Es un
destello y no un turno: un segundo alcanza para ver que hay un lanzamiento
debajo y es demasiado poco para instalarse — la composición sigue siendo lo que
uno saca con la mano.

Con el home invertido esto no es un adorno: en teléfono no hay hover, y sin el
destello quien no sepa que el título se puede mantener pulsado no vería nunca la
carátula. **Cualquier toque lo apaga en el acto y reinicia la cuenta**, que
vuelve a empezar cuando el usuario suelte. En pantalla ancha no corre, y con
`prefers-reduced-motion: reduce` tampoco: ahí el teléfono se queda en la cenefa,
con el `poster` del video dentro de la franja.

Se ve corriendo, sin depender de Cargo, en **`/preview/home`**.

---

## Los datos

`data/home.json`:

```json
{
  "destacado": {
    "titulo": "Killing Mariposas",
    "artista": "Kelman Durán",
    "fecha": "091826",
    "caratula": "media/killing-mariposas.jpg",
    "video": {
      "mp4": "media/killing-mariposas.mp4",
      "poster": "media/killing-mariposas-poster.jpg"
    },
    "release": "killing-mariposas"
  }
}
```

| Campo | |
|---|---|
| `titulo`, `artista`, `caratula` | obligatorios si hay destacado |
| `video.mp4` | obligatorio: sin video no hay intercambio |
| `video.poster` | lo que se ve con `prefers-reduced-motion` |
| `fecha` | el tercer campo de la franja, **tal como se escribe**: `091826` sale `091826`. No se parsea ni se reformatea |
| `catalogo` | opcional, y solo se usa si no hay `fecha`. Un lanzamiento por salir puede no tener número todavía |
| `release` | opcional, el `id` en `releases.json`. Hoy no se usa: solo sirve para enlazarlo el día que la pieza ya exista en el catálogo |

La franja dice **`KILLING MARIPOSAS KELMAN DURÁN 091826`**: el disco, quién y
cuándo. Centrada, en blanco sobre negro, en versalitas sostenidas y con los tres
campos **pegados, sin un carácter de por medio**. Lo que los diferencia es el
peso, alternando negrita y no negrita — el mismo gesto del menú del nav
(`ABOUT CATALOG MERCA BLOG`).

En el JSON los datos van como se escriben (`Killing Mariposas`): las versalitas
las pone el CSS, no el contenido.

El destacado es **curado**, y puede ser una pieza que todavía no existe en el
catálogo —sin Bandcamp y sin número confirmado—. Eso es justo para lo que está:
el home tiene fecha, el catálogo no.

**Si `destacado` falta o está vacío**, el home cae al release visible más
reciente de `releases.json` y arma la carátula con su `bcImageId`. Ese respaldo
no tiene video, así que degrada: la carátula se queda con el marco entero, sin
intercambio, y el título deja de ser interruptor y pasa a ser texto. Un home
pobre, pero nunca uno roto ni uno que muestre lo de hace ocho meses.

Para verlo sin vaciar el JSON: `/preview/home?respaldo`, o
`<div data-ttx="home" data-respaldo>`.

`npm run validate` exige que **si hay destacado, esté entero**, y que la
carátula y el video existan de verdad en el repo. Un destacado a medias es peor
que ninguno.

### El archivo de video

Va en **`media/`** del repo, versionado, y se publica en GitHub Pages junto al
resto. (En `public/media/` no puede vivir: `public/` la borra y la vuelve a
escribir cada compilación.)

- Presupuesto **~5 MB**.
- **Sin pista de audio.** Está silenciado de todos modos: quita peso y elimina
  cualquier riesgo de que el navegador bloquee el arranque automático.
- El widget lo pone `muted`, `loop`, `playsinline` y `preload="auto"`.

Las rutas de `home.json` son relativas a la raíz del sitio publicado
(`media/loquesea.mp4`), no a la carpeta de datos. Una URL absoluta también vale,
si algún día el video se sirve desde otro lado.

Lo que hay hoy en `media/` es el material de **Killing Mariposas**:

| Archivo | |
|---|---|
| `killing-mariposas.mp4` | del **segundo 16 hasta el final** del video de *Lejanía* (canal de TraTraTrax): 2 min 27 s, 1024×684, sin audio, 4,99 MB |
| `killing-mariposas-poster.jpg` | el primer fotograma, o sea el segundo 16 |
| `killing-mariposas.jpg` | la carátula, 1200×1200, bajada de `freight.cargo.site` |

El corte sale de YouTube, que ya es una recompresión. **Si el sello tiene el
archivo original, vale la pena volver a cortarlo desde ahí** — el mismo tramo,
mejor imagen y sin pasar por dos codificaciones.

Mientras un destacado tenga `"relleno": true`, `npm run validate` lo avisa en
cada corrida. Es el recordatorio de que lo que se ve es material de prueba.

---

## Calibrar sin tocar el código

Las variables van en el mismo `<div>`. Un `style` inline le gana a cualquier
CSS, incluido el global de Cargo.

| Variable | Qué hace | Por defecto |
|---|---|---|
| `--ttx-margen` | aire por los **cuatro** lados | `0px` |
| `--ttx-nav-h` | hueco de abajo; **hasta ahí llega el video** | `0px` |
| `--ttx-visor-h` | alto de la caja de arriba | `34%` |
| `--ttx-banda-h` | alto mínimo de la franja del título | `1.9rem` |
| `--ttx-home-titulo-fs` | tamaño del título | `--ttx-chrome` |
| `--ttx-home-titulo-sep` | separador entre los tres campos | ninguno |
| `--ttx-home-titulo-gap` | aire entre campos | `0.03em` |
| `--ttx-home-ajuste-arriba` | cómo entra la carátula en el módulo de arriba | `cover` |
| `--ttx-home-ajuste-abajo` | cómo entra en el de abajo | `contain` |
| `--ttx-home-video-ajuste` | cómo entra el video en el host | `cover` |
| `data-minimo` (atributo) | ms mínimos que dura un estado | `100` |
| `--ttx-papel` / `--ttx-tinta` | el home va invertido | `#000` / `#fff` |

**La carátula entra distinto según en qué caja esté, y esa asimetría es la
composición:** arriba va **full bleed** —llena el módulo de borde a borde y se
recorta lo que sobre, porque es lo primero que se ve al entrar y tiene que
llegar a los bordes—; abajo va entera, cuadrada y centrada, con negro
alrededor, porque ahí ya no encabeza, acompaña. Se intercambian con `cover` y
`contain` si alguna vez se quiere al revés.

**El filtro de dos tonos no se usa aquí.** `--ttx-visor-fx: none` viene puesto.
El filtro se queda para el catálogo, donde su trabajo es que 35 carátulas no
compitan entre ellas.

**Los altos de los recortes se miden solos.** `--ttx-visor-h` se puede poner en
porcentaje, en `clamp()` o en píxeles y el video sigue cuadrando; y si el título
llega a dar dos líneas, la franja crece y el recorte crece con ella. No hay nada
que ajustar a mano cuando se cambia una de estas variables.

---

## Lo que no hace, y es a propósito

- **No dice nada sobre el sello.** Ni el lema, ni "Sonic hustlers since 2020",
  ni el manifiesto. Quien quiera saber qué es TraTraTrax entra a `ABOUT` desde
  el menú. El home es el lanzamiento y nada más.
- **No invade la barra de abajo.** `2026 © TODOS LOS IZQUIERDOS PÚBLICOS ·
  TRATRATRAX · MENU` es chrome global de Cargo y vive fuera del widget.
  Invadirla obligaba a un lienzo fijo detrás de todo el documento y a volver la
  barra transparente durante el hover — o sea, a que el home pudiera romper el
  resto del sitio.
- **El título no enlaza a ningún lado.** Hoy es solo el interruptor. Si el
  lanzamiento llega a tener pre-save o Bandcamp antes de salir, ese link
  necesita su propio sitio en la composición, y eso es diseño nuevo.
- **En pantalla ancha nada se conmuta solo.** Si nadie pasa, no pasa nada: ahí
  el único movimiento es el loop del video. El temporizador es solo de teléfono,
  donde no hay hover que dispare nada.
