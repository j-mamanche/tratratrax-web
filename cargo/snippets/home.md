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

**Los dos módulos son el mismo arte.** El de abajo lo muestra anclado por
arriba; el de arriba, que es más corto, muestra el mismo arte a la misma escala
anclado por su borde inferior, así que se le va lo de arriba. No son dos
imágenes ni dos encuadres: es una sola, partida por la franja.

**Cada apertura sortea el gooey.** Es el efecto de Figma —el arte desenfocado,
cortado por un umbral de luminancia y devuelto dentro de las manchas que salen,
así que las formas cercanas se funden en una sola sin que la pieza deje de
reconocerse— y cae en **uno de los dos módulos, en los dos, o en ninguno**, al
azar y sin repetir el de la pasada anterior. Se sortea al abrir y no se mueve
mientras la mano siga puesta. Sin video no hay apertura: ahí se sortea una vez
por carga.

**La franja tiene dos líneas, que son la misma línea:**

```
reposo   NO PARE, SIGUE SIGUE 4__ VARIOUS ARTISTS
abierta  NO PARE, SIGUE SIGUE 4__ VARIOUS ARTISTS__ BUY__ LISTEN
```

Sin fecha y sin número de catálogo: el disco y quién, y con la mano encima los
dos links del release. `BUY` va a Bandcamp y `LISTEN` al linktree, los dos en
pestaña nueva. **El texto lleva al release en el catálogo** —`/catalog#<id>`,
que lo abre allá y lleva el carril hasta él—, así que hay dos zonas de clic en
la misma barra. La regla del gesto: **la mano abre, el clic navega**. En
teléfono, donde el mismo dedo hace las dos cosas, se decide al levantarlo: un
toque corto y quieto navega, uno sostenido o que se movió era para mirar.

Se ve corriendo, sin depender de Cargo, en **`/preview/home`**.

---

## Los datos

**El destacado es un release.** `data/home.json` no guarda contenido: guarda
cuál, y el material vive con su release en `data/releases.json`. Así no hay dos
sitios donde escribir el mismo título, y el home no puede anunciar algo que el
catálogo no conoce.

```json
{
  "modo": "fijo",
  "release": "killing-mariposas"
}
```

| `modo` | |
|---|---|
| `fijo` | manda el release que diga `release`. Es lo normal: el sello elige qué anuncia |
| `auto` | **en cada carga, uno al azar** entre los que cumplen |

Cumplir es tener las cuatro cosas con las que la pantalla no queda a medias:
`home.arte`, texto (propio o el título del disco), **los dos links**
—`purchaseUrl` y `listenUrl`, porque la franja abierta ofrece los dos— y estar
visible. El sorteo ocurre en el navegador, en cada carga: Pages sirve archivos
estáticos y no hay quién rote nada del otro lado.

Y en el release, el bloque `home` — todo opcional salvo el arte:

```json
{
  "id": "killing-mariposas",
  "album": "Killing Mariposas",
  "artists": ["luca-duran"],
  "visible": false,
  "home": {
    "arte": "media/killing-mariposas.jpg",
    "video": {
      "mp4": "media/killing-mariposas.mp4",
      "poster": "media/killing-mariposas-poster.jpg"
    },
    "texto": "No pare, sigue sigue 4*Various Artists"
  }
}
```

| Campo | |
|---|---|
| `home.arte` | obligatorio. Es lo único que la composición no puede inventar |
| `home.video.mp4` | opcional. **Sin video, la capa es el arte quieto**: la cenefa, la grieta y el sorteo del filtro siguen iguales |
| `home.video.poster` | lo que se ve con `prefers-reduced-motion` |
| `home.texto` | reemplaza la franja entera. Se escribe con la sintaxis de juntas —`*` donde va el `__`—, igual que `about.json`. Sin él, la franja se compone del álbum y sus artistas |

**Un lanzamiento por anunciar también es un release**: se crea con
`"visible": false` y su bloque `home` lleno. No sale en el catálogo hasta el
día que salga, y mientras tanto el home lo anuncia. Como todavía no está en
Bandcamp, puede ir sin `bcImageId` —lo que se ve es su `home.arte`— y su título
no enlaza a un catálogo donde no aparece.

**Si el destacado falla** —el archivo no existe, el `release` apunta a un id
borrado, o en `auto` no cumple ninguno— el home cae al release visible más
reciente y arma el arte con su `bcImageId`. Nunca un home roto ni uno que
muestre lo de hace ocho meses.

**Un lanzamiento sin pieza audiovisual no es un home degradado**, y ese es el
cambio: es la otra forma que tiene este home. La capa de abajo —la que se ve
por la grieta— es el arte quieto en vez del video, y todo lo demás es idéntico:
la cenefa en reposo, la grieta que se abre con la mano, la composición que se
turna y el filtro que se sortea en cada pasada. Antes se trataba como una caída
—el arte pegado en los dos módulos, sin grieta, y el filtro sorteado una vez por
carga— y por eso había que **recargar la página** para ver otro filtrado.

Para verlo sin tocar el JSON: `/preview/home?sin-video`, o
`<div data-ttx="home" data-sin-video>`.

`npm run validate` revisa las dos puntas: que el `release` del `home.json`
exista y tenga arte, que en `auto` haya al menos uno que cumpla, y que el arte
y el video de cada bloque `home` estén de verdad en el repo.

### El archivo de video

Va en **`media/`** del repo, versionado, y se publica en GitHub Pages junto al
resto. (En `public/media/` no puede vivir: `public/` la borra y la vuelve a
escribir cada compilación.)

- Presupuesto **~5 MB**.
- **Sin pista de audio.** Está silenciado de todos modos: quita peso y elimina
  cualquier riesgo de que el navegador bloquee el arranque automático.
- El widget lo pone `muted`, `loop`, `playsinline` y `preload="auto"`.

Las rutas del bloque `home` son relativas a la raíz del sitio publicado
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

Mientras un bloque `home` tenga `"relleno": true`, `npm run validate` lo avisa
en cada corrida. Es el recordatorio de que lo que se ve es material de prueba.

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
| `--ttx-junta` | espacio después del `__`, **común a todo el sitio** | `0.3em` |
| `--ttx-home-ajuste` | cómo entra el arte en los módulos, **uno solo para los dos** | `100% auto` |
| `--ttx-home-video-ajuste` | cómo entra la capa —el video, o el arte quieto— en el host | `cover` |
| `--ttx-home-fx` | el gooey. `none` lo apaga en toda la pantalla | `url(#ttx-gooey)` |
| `data-minimo` (atributo) | ms mínimos que dura un estado | `100` |
| `data-letra` (atributo) | ms por letra de `BUY__ LISTEN`, que se escriben | `30` |
| `data-sin-video` (atributo) | fuerza la versión sin pieza audiovisual | — |
| `--ttx-papel` / `--ttx-tinta` | el home va invertido | `#000` / `#fff` |

**`--ttx-home-ajuste` es uno solo para los dos módulos, y tiene que serlo:**
toda la composición vive de que sean el mismo arte a la misma escala. `100%
auto` es el ancho del módulo —el mismo para los dos— y el alto que salga; lo
que los distingue es de dónde se recortan, y eso no se calibra.

**El gooey se puede apagar.** `--ttx-home-fx: none` en el placeholder deja la
composición limpia. Vale la pena tenerlo a mano: cuando el filtro le toca al
módulo donde está el video, se filtra cada fotograma, y un teléfono viejo lo
puede sentir.

Los parámetros son los mismos del efecto de Figma —`spread`, `threshold`,
`edgeSoftness`, `sourceMix`, `invert`, frente y fondo—, con sus mismos nombres
y sus mismas cuentas: el shader se leyó del archivo, no se imitó a ojo, así que
mover un deslizador allá y el número de acá significan lo mismo. Se prueban sin
recompilar en el preview —`/preview/home?ttx-threshold=20&ttx-spread=12`— y el
que gane se escribe en `GOOEY`, en `_runtime/filtro.js`.

Dos cosas que no se ven en los deslizadores y conviene saber: `spread: 0` no es
"sin desenfoque" —son unos 2,7 px, el piso del efecto— y el `threshold` no es
lineal: en 0 corta a la mitad de la luminancia, y en 5 corta en 0,451.

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
- **El título no abre un player.** Lleva al release en el catálogo y ofrece
  `BUY` y `LISTEN`, que es lo mismo que hay allá. No hay reproducción en el
  sitio, y eso está decidido.
- **Un anuncio no enlaza.** Mientras el release esté en `visible: false` no
  está en el catálogo, así que el título no lleva a ninguna parte: sigue siendo
  el interruptor y nada más.
- **En pantalla ancha nada se conmuta solo.** Si nadie pasa, no pasa nada: ahí
  el único movimiento es el loop del video. El temporizador es solo de teléfono,
  donde no hay hover que dispare nada.
