# Home — brief

Resultado de tres rondas de preguntas, 2026-07-28. Este documento es el
acuerdo; lo que está en "Cerrado" no se vuelve a discutir sin decirlo.

---

## 1. Qué es el home

**El lanzamiento, y nada más.**

En la primera ronda el home iba a cargar también la utilidad del About. Se
descartó a mitad de camino, y bien: son dos cosas con temporalidades
opuestas. El About es atemporal —el ensayo del *third space*— y vive en su
propia página. El home es específico, tiene fecha, y cambia cada vez que sale
algo.

Consecuencia directa: **el home es mudo sobre el sello.** Ni el lema, ni
"Sonic hustlers since 2020", ni el manifiesto en lista. Quien quiera saber qué
es TraTraTrax entra a `ABOUT` desde el menú. Lo único que el home tiene que
lograr sin palabras es que se entienda que esto no es un sitio normal — y eso
lo hace la composición, no el copy.

La legibilidad no es la vara. El sello insistió en que la expresión estilística
puede tomar más protagonismo que la lógica o la claridad. Está tomado como
permiso explícito, no como descuido: donde haya que elegir, gana la expresión.

---

## 2. La mecánica

**En reposo el home es una cenefa**: el video ocupando solo la banda del título,
de borde a borde, sobre negro. No hay composición, no hay carátula, no hay dos
piezas turnándose nada. Hay una grieta de video con el nombre del disco encima.
Tomar el título con la mano **abre** esa grieta en las dos cajas del
lanzamiento; soltarlo la cierra.

Eso es lo bonito del hallazgo, y por eso es el reposo: **el canal de información
es la bisagra entre las otras dos bandas**, no un rótulo pasivo — y la
composición existe solo mientras alguien la sostiene.

```
REPOSO                    MANO ENCIMA A             MANO ENCIMA B
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│                  │      │ ░░░ carátula ░░░ │      │ ▓▓▓▓ video ▓▓▓▓▓ │
│      negro       │      ├──────────────────┤      ├──────────────────┤
▓▓ KILLING MARIPOSAS… ▓▓  │ KILLING MARIPOS… │      │ KILLING MARIPOS… │
│      negro       │      ├──────────────────┤      ├──────────────────┤
│                  │      │ ▓▓▓▓ video ▓▓▓▓▓ │      │ ░░░ carátula ░░░ │
└──────────────────┘      └──────────────────┘      └──────────────────┘
   barra de Cargo            barra de Cargo            barra de Cargo
                              (no se toca)
```

1. **Reposo** — la cenefa. Lo único encendido en toda la pantalla es la franja
   del título. Lo que se reproduce *es* la grieta: el video no es contenido, es
   el intersticio, y el intersticio es lo que el home enseña de entrada.
2. **La mano entra al título** — la grieta se abre: carátula arriba, video
   abajo.
3. **La mano se va** — corte seco, y vuelve la cenefa.
4. **La pasada siguiente abre la contraria** — video arriba, carátula abajo. Y
   así, alternando.

> **Corregido el 2026-07-28**, con el widget ya montado. En la primera versión
> el video tomaba el marco entero y la carátula seguía en su sitio, recortada
> contra él. Ahora se apaga todo lo demás: si la franja es la bisagra, mientras
> uno la tiene en la mano no debería quedar nada más encendido. Es más radical
> y dice mejor lo mismo.

> **Invertido el 2026-07-29.** Hasta aquí la cenefa era la excepción —lo que
> pasaba mientras había una mano encima— y la composición era el reposo. Se dio
> vuelta: **la cenefa es el reposo y la composición es la excepción**. El
> hallazgo era la grieta, así que la grieta es lo que el home es cuando nadie lo
> toca; la composición pasa a ser lo que uno *saca* de ella. Se conservan las
> tres imágenes, el corte seco y la alternancia — es la misma máquina con el
> reposo movido de sitio.

**El cambio de una composición a la otra ocurre al cerrar**, con la cenefa ya en
pantalla: nadie lo ve. Es lo que hace que no se sienta un botón — uno no aprieta
nada, uno pasa, y la próxima vez que pase el sitio quedó de otra manera.
Volteando al abrir se vería el cambio y sería un carrusel.

**Corte seco en las tres transiciones.** Sin fundido, sin deslizamiento, sin
easing. Cero milisegundos. Es lo único que no se puede leer como efectismo.

Y **la mano no espera**: entrar al título cambia la pantalla en el mismo
fotograma. Lo que se controla es lo de después — **un estado dura como mínimo
100 ms antes de que pueda entrar el siguiente**. Pasar el ratón muy rápido
abría y cerraba la composición casi a la vez y se leía como un parpadeo; con ese
piso cada estado alcanza a existir y la pasada se ve como una decisión, no como
un glitch.

No es un retardo y no se pierde nada por el camino: lo que llega antes de
tiempo espera su turno, en orden. Una pasada rápida deja dos cambios en cola y
salen los dos, espaciados.

**En pantalla ancha, lo único que se mueve solo es el video**, en loop y sin
sonido, dentro de la cenefa. Ese es el "respira despacio" de la ronda 1: no hay
deriva y no hay parpadeos, el sitio está quieto salvo por el loop — y ahora
además está quieto en su estado más callado.

**En teléfono no.** Ahí el home respira: cada cinco segundos de quietud, un
destello de un segundo con la composición abierta. Se para en cuanto alguien
toca. Ver §4.

---

## 3. Por qué es un solo video y un `clip-path`

La tentación es tener el video en dos o tres sitios y sincronizarlos. No hace
falta, y salir de esa trampa es lo que hace que todo esto sea diez líneas:

**Hay un solo `<video>`, cubre el host entero, y nunca para.** Lo único que
cambia entre los tres estados es el rectángulo por el que se ve. Como los tres
recortes son un rectángulo simple, los tres son un `clip-path: inset()`.

```
host  (position: relative; background: negro)   ← el papel, siempre
 ├─ .ttx-home-video   abs, inset: 0, z: 0   ← clip-path según el estado
 └─ .ttx-marco        rel,           z: 1   ← fondo transparente
     ├─ .ttx-home-caja  arriba
     ├─ .ttx-banda      el título, encima de todo
     └─ .ttx-home-caja  abajo
```

- El fondo negro lo pone el **host**, así que se ve por el aire de los lados,
  por la franja y por donde el video no llegue.
- Las dos cajas van **encima** del video. La que tiene la carátula la pinta
  como `background-image` y tapa lo que haya debajo; la otra es transparente y
  deja pasar el video. **En reposo las dos quedan transparentes** —no hay
  carátula en ninguna— y por debajo solo hay negro y la cenefa.
- La banda es transparente: en reposo se ve el video, porque la banda *es* la
  cenefa; con la composición abierta se ve el negro del host. **El título se
  queda encima y aguanta** — a veces se leerá bien y a veces se perderá contra
  la imagen, y eso está decidido así. Que se pierda en reposo, que es el estado
  normal, es la apuesta de este home.

Los tres recortes, en variables que ya existen en `tokens.css`:

```css
/* Reposo — el video ocupa solo la franja del título, de borde a borde.
   Es el valor por defecto en el host: los otros dos ganan por especificidad. */
inset(calc(var(--ttx-margen) + var(--ttx-visor-h))
      0
      calc(100% - var(--ttx-margen) - var(--ttx-visor-h) - var(--ttx-home-banda-h))
      0)

/* Abierto A — el video ocupa la caja de abajo */
inset(calc(var(--ttx-margen) + var(--ttx-visor-h) + var(--ttx-home-banda-h))
      var(--ttx-margen)
      calc(var(--ttx-margen) + var(--ttx-nav-h))
      var(--ttx-margen))

/* Abierto B — el video ocupa la caja de arriba */
inset(var(--ttx-margen)
      var(--ttx-margen)
      calc(100% - var(--ttx-margen) - var(--ttx-visor-h))
      var(--ttx-margen))
```

`--ttx-home-banda-h` la publica un `ResizeObserver` sobre la franja, igual que
`--ttx-cuerpo-h` en el catálogo. La fila del grid es `auto` y `--ttx-banda-h`
es solo un mínimo: calcular con el mínimo funcionaría hasta el día que el
título dé dos líneas. Medir cuesta cuatro líneas y no vuelve a fallar.

Todo el estado del widget son **dos atributos en el host**: `data-home="a|b"`
—cuál de las dos composiciones abre la próxima pasada— y `data-abierto` mientras
la composición está abierta. Nada más. No hay animación que cancelar, no hay posición que recalcular, no hay
video que resincronizar.

**El filtro de dos tonos no se usa aquí.** El home es el único sitio donde las
piezas se ven como son: el video limpio y la carátula limpia, en las tres
posiciones. `--ttx-visor-fx: none` en el host. El filtro se queda para el
catálogo, donde su trabajo es que 35 carátulas no compitan entre ellas.

**Tinta invertida.** El home es negro con texto blanco, al revés que el
catálogo: `--ttx-papel: #000` y `--ttx-tinta: #fff` en el host, y ya. Los
tokens ya lo permiten; no hay CSS nuevo por esto.

---

## 4. Los disparos

| entrada | abre | cierra (y voltea) |
|---|---|---|
| ratón | `pointerenter` en el título | `pointerleave` |
| tacto | `pointerdown` en el título | `pointerup` / `pointercancel` |
| teclado | `focus` en el título | `blur` |

El título es un `<button>`, así que el teclado sale gratis y con el
`aria-*` correcto. **En teléfono el toque hace de mano** — se mantiene el
dedo, la composición se abre; se suelta y vuelve la cenefa, con la otra ya
puesta para la próxima. Es el mismo gesto, no una versión aparte.

**En teléfono, además, el home respira.** Cinco segundos de franja, **un
destello de un segundo** con la composición abierta, y otra vez la franja. Como
al cerrar voltea, un destello enseña una composición y el siguiente la otra.

**Es un destello, no un turno**, y ahí está la diferencia con la primera
versión de este gesto, que repartía el tiempo en partes iguales entre la cenefa
y la composición. Un segundo alcanza para ver que hay un lanzamiento debajo y es
demasiado poco para instalarse: la composición sigue siendo lo que uno saca con
la mano, y el destello solo avisa que está ahí. Con turnos parejos el teléfono
acababa contando otra historia que el escritorio.

**Cualquier cosa que haga el usuario lo apaga en el acto y reinicia la cuenta**,
que vuelve a correr desde la franja cuando la mano se retire. Nunca hay que
esperar a que termine un destello para tener el home quieto.

**Con el home invertido esto dejó de ser un adorno.** En reposo no se ve la
carátula y en teléfono no hay hover: sin el destello, quien no sepa que el
título se puede mantener pulsado no vería nunca el lanzamiento, solo una grieta
de video. Y va solo donde no hay mano — en pantalla ancha el hover ya lo
dispara, y ahí un temporizador sería un parpadeo gratis.

No corre con `prefers-reduced-motion: reduce`. Abrir a mano sí sigue
funcionando ahí, porque es un corte y lo pide el usuario; este no lo pide nadie,
y movimiento que uno no provocó es justo lo que esa preferencia viene a apagar.
Ahí el teléfono se queda en la cenefa, con el `poster` del video dentro de la
franja.

> **Corregido el 2026-07-29.** En la ronda 3 se había descartado explícitamente
> que en teléfono el intercambio corriera por temporizador — "si nadie toca, no
> pasa nada". Se cambió de opinión con el widget ya montado: en teléfono no hay
> hover, y sin gesto de ocio el home se queda en una sola de sus dos caras para
> quien no sepa que el título se puede tocar. Con la inversión del mismo día el
> argumento se volvió más fuerte todavía: sin el gesto, en teléfono no se llega
> a ver ninguna de las dos.
>
> Y el gesto pasó de **turno a destello** el mismo 2026-07-29: primero repartía
> el tiempo por partes iguales entre la cenefa y la composición, y así el
> teléfono contaba otra historia que el escritorio. Ahora son cinco segundos de
> franja y un segundo de composición — lo justo para avisar que hay algo
> debajo.

`prefers-reduced-motion: reduce` → el video no arranca y se muestra su
`poster`. El intercambio sigue funcionando: es un corte, no una animación, y
no hay nada que reducir.

---

## 5. La barra de abajo no se toca

La barra `2026 © TODOS LOS IZQUIERDOS PÚBLICOS · TRATRATRAX · MENU` es chrome
global de Cargo y vive **fuera** del widget. Se decidió que el video **no** la
invada: toma el marco y la franja del título, y se detiene en el hueco de
`--ttx-nav-h`.

Es la decisión que mantiene el widget dentro de su caja. Invadirla obligaba a
un lienzo fijo detrás de todo el documento y a volver la barra transparente
durante el hover — o sea, a que el home pudiera romper el resto del sitio.

---

## 6. Los datos

`data/home.json`, como ya lo contemplaba `PLAN.md` §208:

```json
{
  "destacado": {
    "catalogo": "TRA 032",
    "titulo": "Pyrexia",
    "artista": "Ehua & Fiore",
    "caratula": "media/tra032-caratula.jpg",
    "video": {
      "mp4": "media/tra032.mp4",
      "poster": "media/tra032-poster.jpg"
    },
    "release": "pyrexia"
  }
}
```

**Curado, con respaldo automático.** Si hay `destacado`, ese manda — y puede
ser una pieza que todavía no existe en el catálogo, que es exactamente el caso
hoy: un lanzamiento próximo a salir, sin Bandcamp y sin número confirmado. El
campo `release` es opcional y solo sirve para enlazarlo con `releases.json` el
día que ya exista.

Si `destacado` falta o está vacío, el home cae al release visible más reciente
de `releases.json` y arma la carátula con su `bcImageId`. **Ese respaldo no
tiene video**, así que degrada: carátula arriba, sin intercambio, y el título
deja de ser interruptor y pasa a ser texto. Es un home pobre pero nunca uno
roto ni uno que muestre lo de hace ocho meses.

El validador (`npm run validate`) tiene que exigir que si hay `destacado`,
tenga `titulo`, `artista`, `caratula` y `video.mp4`. Un destacado a medias es
peor que ninguno.

**Sobre el archivo de video:** va en `public/media/` del repo, versionado y
servido por GitHub Pages. Presupuesto ~5 MB. Que vaya **sin pista de audio**
—está silenciado de todos modos— porque quita peso y elimina cualquier riesgo
de que el navegador bloquee el autoplay. `muted`, `loop`, `playsinline`,
`preload="auto"`.

---

## 7. Cerrado — no volver a abrir

- El About se sale del home. Son dos páginas.
- El home no dice nada sobre el sello.
- Corte seco. Ninguna transición animada en el intercambio.
- Sin filtro de dos tonos en el home.
- La barra de Cargo no se invade.
- **El reposo es la cenefa** (§2, invertido el 2026-07-29). La composición no es
  el estado del home: es lo que uno saca de él con la mano.
- En pantalla ancha nada se abre solo: lo único que se mueve por su cuenta es el
  loop dentro de la cenefa. En teléfono sí, un destello de un segundo cada cinco
  de quietud (§4, corregido el 2026-07-29).

---

## 8. Lo que falta para poder programarlo

1. **El video y la carátula** del lanzamiento que viene, más su título,
   artista y número de catálogo (o la confirmación de que todavía no tiene
   número).
2. **Confirmar que el título no enlaza a ningún lado.** Hoy es solo el
   interruptor. Si el lanzamiento llega a tener pre-save o Bandcamp antes de
   salir, ese link necesita su propio sitio en la composición — y eso es
   diseño nuevo, no un ajuste.
3. **Acceso a Cargo.** Sigue siendo el único bloqueo duro del proyecto: sin
   pegar el loader en el HTML global y sin poner el `<div data-ttx="home">` en
   la página, nada de esto se enciende.

Los puntos 1 y 2 no bloquean escribir el widget: se puede montar contra
material de relleno y una página de preview, y cambiar el JSON cuando llegue
lo de verdad.

---

## 9. Plan de implementación

1. `data/home.json` + su esquema en `tools/validate.mjs`, con el respaldo
   automático y el error si el destacado está a medias.
2. `src/widgets/home/home.js` + `home.css` sobre `crearStack(host, { banda: true })`
   — reusa el stack que ya existe, no monta uno nuevo.
3. La capa de video, los tres `clip-path` y el `ResizeObserver` de la franja.
4. Los disparos: ratón, tacto y teclado sobre el `<button>` del título.
5. `src/pages/preview/home.astro` para verlo sin depender de Cargo.
6. `cargo/snippets/home.md` — el `<div data-ttx="home">` con sus variables de
   calibración inline, listo para pegar.
