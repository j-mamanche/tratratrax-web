# About — brief y plan

Resultado de cinco rondas de preguntas, 2026-07-29. Mismo formato que
`BRIEF-HOME.md`: lo que está en "Cerrado" no se vuelve a discutir sin decirlo.

**Estado: implementado, con el material del sello.** El widget vive en
`src/widgets/about/`, se ve en `/preview/about` y lo que se pega en Cargo está en
[cargo/snippets/about.md](cargo/snippets/about.md). Los tres emblemas son los de
verdad desde el 2026-07-30.

**Revisado el 2026-07-30** con el sello delante: el copy de la línea, la barra de
un renglón, el papel gris, la línea arriba, la zona donde caen los emblemas, la
aparición que se queda quieta y **la grieta, que se quitó**. Lo que decía este
documento antes sobre el fondo negro, los dos renglones, el reciclaje y el
aplastado **ya no aplica** — está reescrito donde tocaba, no anotado.

**Revisado otra vez el 2026-08-19**, con siete capturas del sello delante.
Cuatro cosas cambiaron y están reescritas abajo, no anotadas:

1. **Vuelve una grieta, y es otra.** No la banda aplastada del pie: el hueco
   dentro del nombre del sello, `TRA · TRA · TRAX` abierto a lo ancho. La mano
   lo cierra y ahí entra el resto de la línea. Ver §3.4.
2. **La alternancia arranca en liviano** y **se reinicia en cada enunciado**.
   Los tres nombres dejan de ir intercalados: son un solo grupo separado por
   `/`. Ver §3.2 bis.
3. **Entre grupos sí va algo**: la junta, `__` y un espacio pequeño. Es la regla
   nueva del sitio entero (`format.js:grupos`), no una decisión de esta página.
4. **La zona vuelve a ser toda la ventana**, ahora con zona segura: ningún
   emblema sale cortado por el borde. Ver §3.2 ter.

---

## 1. Contexto — por qué esta página

El About es el único hueco declarado del sitio. `CLAUDE.md:47`: *"El blog es
contenido placeholder. About no existe todavía."* El nav ya enlaza a `about`
(`cargo/snippets/nav.md:24`) y no lleva a ninguna parte.

`BRIEF-HOME.md:301` lo dejó cerrado como decisión, no como pendiente: **"El
About se sale del home. Son dos páginas."** El home es fechado, específico y
**mudo sobre el sello**; el About es lo atemporal.

Y hoy el sitio **no dice nada sobre TraTraTrax en ninguna parte**. El nav nuevo
es `2026 © [lema rotatorio]` + logo + `ABOUT CATALOG MERCA BLOG` y nada más
(`cargo/snippets/nav.md:24`). La línea de los fundadores y sus Instagram existían
en el nav **del sitio viejo** (`cargo/snapshots/2026-07-27/page-nav.html:14-17`,
que es snapshot histórico, no diseño vigente). El About es el único sitio posible
para ese dato.

El ensayo del *third space* existe solo como slides de Figma en `refs/`. Remata
en **"TRA TRA TRAX ES ESE TERCER ESPACIO MUSICAL"** y define la grieta que el
home ya usa: *"el espacio pequeño, la grieta o hueco que queda entre dos cosas
que están juntas pero no perfectamente fusionadas"*.

**Resultado buscado:** una página que diga qué es el sello sin explicarlo, con un
solo renglón de texto y un gesto que se sostiene con la mano.

---

## 2. Investigación — de dónde sale el material

### Los tres, con nombre y carácter distinto

De la portada de Crack Magazine (*TraTraTrax — Keep It Moving*):

| Nombre | Real | Ciudad | Carácter documentado |
|---|---|---|---|
| **DJ Lomalinda** | Daniel Uribe | Medellín | *Digger* de vinilo, oído para sound design. Habla *"in long, elegant strides"*. |
| **Nyksan** | Nicolás Sánchez | Bogotá → Londres | *"Aesthetic fantasist"*: manos en oración, rosarios, **el Divino Niño**. Puso el nombre del sello. |
| **Verraco** | JP López | Medellín | Ingenioso, bromista, teórico sin solemnidad. Cita al nadaísta Gonzalo Arango. |

Instagram: `djlomalinda`, `nyksan_`, `verraco__`.

### El eje kitsch↔vanguardia no hay que inventarlo

- **El pirateo como origen.** Bajaban reggaetón de `blinblineo.net` de niños y
  vendían CD-R quemados en el recreo: *"the first exercises of curating,
  compiling and extracting."*
- **El procedimiento gráfico del sello.** Cada release lleva la carátula
  superpuesta sobre un **layout de CD**, en honor a ese *pirateo*.
- `TraTraTrax` es el *tra-tra-tra* del reggaetón de los noventa. La frase de la
  casa es *"perreando y llorando"*.
- **Vanguardia real:** nadaísmo, Bhabha, IDM, sound design. Y ya en el sitio: el
  filtro de dos tonos, el corte seco, el cursor-machete de `global.css:22-27`.

---

## 3. El diseño

### 3.1 El ensayo es no verbal

*"Quiero que ese texto sea lo único sobre lo que se arme la interacción, pero es
más importante un ensayo no verbal, no un manifiesto ni nada demasiado
extenso."*

Un solo renglón de texto en toda la página:

> **SONIC HUSTLERS**SINCE**2020**      **TRATRATRAX**IS A LABEL RUN BY**DJ
> LOMALINDA**NYKSAN**VERRACO**

(los grupos van pegados y lo que los separa es el peso; ver 3.2 bis)

Nada más. Las citas de Bhabha **no se transcriben**; el third space se
demuestra, no se explica. Que `SONIC HUSTLERS` también pase por el lema del nav
es un eco buscado, no un choque.

### 3.2 El stack se queda en dos: banda y campo

```
ESCRITORIO                            TELÉFONO
┌────────────────────────────────┐    ┌──────────────────┐
│ ✝◉✝                            │    │TRA   TRA   TRAX  │  ← la grieta,
│TRA   TRA   TRAX   A RECORD LA… │    │A RECORD LABEL R… │    su renglón
│                       ✝◉✝      │    │                  │
│  gris                          │    │   ✝◉✝     ✝◉✝    │
│         ✝◉✝                    │    │        gris      │
│                          ✝◉✝   │    │  ✝◉✝             │
└────────────────────────────────┘    └──────────────────┘
      barra de Cargo                    barra de Cargo
└─── la zona: toda la ventana ──┘   └── la zona: igual ──┘
```

**No hay tercera banda.** El About usa `crearStack(host, { banda: true })` y
esconde el visor: banda y contenido, nada más. `tokens.css` ya pone `grid-row` a
mano en las tres —precisamente para poder moverlas—, así que esto es reasignar,
no reescribir.

**La línea va arriba, no a media pantalla.** La fila de encima mide
`--ttx-about-aire` —`clamp(48px, 12vh, 132px)`— y todo lo que sobra queda
debajo, vacío. La página es una hoja de chrome con una sola línea alta.

**El campo es toda la ventana, y la zona también.** `.ttx-contenido` cruza las
tres filas (`grid-row: 1 / -1`) y se queda en la columna 1 (`grid-column: 1`,
que no es opcional — ver §5.2), así que las coordenadas se cuentan contra la
pantalla entera. Las cuatro variables de la zona siguen ahí para poder acotarla
desde el placeholder, pero por defecto no recortan nada. El reparto de capas lo
hace el `z-index`: campo `0`, banda `1`.

La bisagra es **una barra de un solo renglón, del grosor de la del home**
(`--ttx-banda-h: 1.9rem`). El intersticio es la misma barra de chrome en las
tres páginas: si aquí fuera un párrafo de tres líneas dejaría de reconocerse
como la línea que atraviesa el sitio y pasaría a ser el encabezado de esta
pantalla. En teléfono la línea no cabe y envuelve — el renglón único es una
regla de pantalla ancha, no del texto.

### 3.2 bis La línea

El copy se escribe con **asteriscos en las juntas**, y así se guarda:

```
*A record label run by*          *Sonic hustlers*since 2020*
```

y se lee así:

```
A RECORD LABEL RUN BY__ DJ LOMALINDA / NYKSAN / VERRACO
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      liviano                       fuerte

SONIC HUSTLERS__ SINCE 2020
╌╌╌╌╌╌╌╌╌╌╌╌╌╌   ━━━━━━━━━━
    liviano        fuerte
```

Cuatro reglas, y ninguna es negociable porque son *la* forma en que escribe la
casa — y ya no son solo de esta página: viven en `format.js:grupos` y valen
igual en el home y en los créditos del catálogo.

1. **Entre grupos va la junta**: `__` y un espacio pequeño. El asterisco marca
   dónde termina un grupo y **no se imprime**; lo que se imprime es el `__`, y
   lo pone el CSS. El último grupo del enunciado no la lleva.
2. **Los espacios que sí se ven son los de adentro de un grupo.** `SONIC
   HUSTLERS` son dos palabras y llevan su espacio. Ahí el espacio es parte del
   texto, no una separación de campos.
3. **El peso alterna, empezando por el liviano**, y **se reinicia en cada
   enunciado**. Los dos enunciados de la página arrancan en peso normal.
4. **Entre enunciados va el aire**, un espacio ancho y sin `__`. Son dos
   separaciones distintas y confundirlas es lo que hacía que cada pantalla
   inventara la suya.

**Los tres nombres son un solo grupo**, separados por `/`, en el peso fuerte que
les toca por cerrar su enunciado. Hasta agosto iban intercalados en la
alternancia —un nombre fuerte, otro liviano—; las capturas lo corrigieron: se
leen como una lista, no como más campos de la frase. Cada uno sigue siendo un
`<button>`, así que el teclado sale gratis.

Que un nombre no se distinga del resto de su grupo es a propósito: el nombre no
anuncia que se pueda tocar, y el link ni siquiera es él sino el santo que
invoca.

Y **una sola tinta**: todo el renglón en negro. Un segundo tono metería un
tercer nivel de información en una línea que solo tiene dos, y la haría parecer
una frase con partes secundarias — que es exactamente lo que no es.

**Lo que se ve en reposo y lo que entra con la grieta.** En reposo solo están
las sílabas y `A RECORD LABEL RUN BY__ …`, empujado contra el borde derecho por
el hueco. El lema, las tres redes del sello y el correo de bookings **entran al
cerrarse la grieta** — ver §3.4.

### 3.2 ter La zona

**Toda la ventana, con zona segura.** El azar era sobre la ventana entera, se
recortó a la mitad derecha en julio —la línea arranca por la izquierda, así que
el emblema se quedaba con la derecha— y en agosto el sello reportó las dos
consecuencias: los santos salían siempre del mismo lado y encima cortados por el
borde en teléfono.

Se corrigieron las dos. Y había una tercera, que nadie había mirado: **el campo
mismo medía un tercio de la pantalla**. El grid del marco le abría una segunda
columna al campo porque se cruzaba con la banda, así que la "mitad derecha" era
la mitad derecha de un tercio. Un `grid-column: 1` lo resolvió.

Adentro de la zona **no cambió nada más**: sin retícula, sin memoria de posición,
y dos emblemas pueden caer encima. Lo único que se le quitó al azar es el
derecho a cortarse contra el borde.

La zona segura no está escrita en ningún número. El emblema se ancla con un
`translate` de su propio porcentaje —con `0` se apoya en el borde izquierdo, con
`1` en el derecho, con `0.5` queda centrado—, así que el recorte usa el **tamaño
real de cada imagen**: hay una cuadrada, una alta y una apaisada, y un `calc()`
con un número escrito a mano las habría recortado a las tres con la medida de la
más grande.

En el JS esto no se nota: `crearEstado` sortea dos números de 0 a 1 y el CSS hace
el resto. El widget nunca ha sabido de anchos de pantalla y esto no lo obliga a
aprender.

### 3.3 La mecánica

- **Reposo:** el gris del chrome y la línea de texto. Ni una imagen, ni un loop,
  ni un destello. **Sin destello de ocio**, ni en teléfono. Quien no mueva
  la mano no ve nunca nada.
- **Hover sobre la grieta:** se cierra y entra el resto de la línea. Ver §3.4.
- **Hover sobre un nombre:** aparece el emblema de *ese* DJ en una **posición
  aleatoria de toda la ventana**.
- **Azar puro, pero sin cortarse.** Adentro de la zona no hay retícula ni memoria
  de posición: puede quedar en una esquina ridícula y dos pueden caer encima.
  Esos siguen siendo resultados legales — es el pop-up de los noventa, el kitsch
  entrando por el comportamiento. Lo que sí se le quitó es el corte contra el
  borde, que el sello reportó como problema: hay zona segura, y sale del anclaje
  del emblema, no de un número escrito.
- **Tamaño fijo.** El azar hace una sola cosa y por eso se lee.
- **La posición se sortea al aparecer y no se toca más.** Con la mano puesta el
  emblema no salta, no se recicla y no se apaga: no hay reloj mientras haya
  gesto. Sostener no produce una ráfaga; produce una imagen que espera.
- **La cola: segundo y medio quieto** después de que la mano se va. Es el tiempo
  de soltar el nombre y llegar al emblema con el ratón, que es cómo se caza el
  link. Volver antes de que se cumpla cancela la cola **sin resortear**: no hay
  forma de hacer brincar al santo.
- Cada DJ cuenta su cola aparte, sin mirar a los otros. Pasada rápida → los tres
  a la vez en tres sitios, apagándose en el orden en que se soltaron. **El ritmo
  de la mano es lo que compone**; la página no elige nada. No hay estado
  "abierto", no hay uno-a-la-vez, no hay cola de eventos ni piso de 100 ms — al
  contrario que el home (`home.js:229-231`), aquí sumarse *es* el gesto.
- **El GIF no se reinicia nunca.** Hay un solo emblema por DJ, puesto desde que
  carga la página, y encender es quitarle una opacidad: nunca un `append`. Un
  GIF que sale y vuelve al DOM arranca de cero y el santo aparecería siempre en
  el mismo cuadro; dejándolo puesto, el loop corre por debajo y cada aparición
  lo agarra donde vaya. Por eso se apaga con `opacity` y no con `display: none`
  ni `visibility: hidden`, que sí paran la animación.
- **El santo es el link.** El nombre solo invoca; el que enlaza es el emblema:
  clic en el Divino Niño lleva al Instagram de Nyksan. Un link que hay que
  cazar, donde le da la gana.

### 3.4 La grieta: volvió, y es otra

**La grieta es el hueco dentro del nombre del sello.** `TRA · TRA · TRAX`
separado a lo ancho de la pantalla, y el aire entre las sílabas es lo que
responde a la mano.

```
REPOSO   TRA      TRA      TRAX                 A RECORD LABEL RUN BY__ DJ LOMALINDA / NYKSAN / VERRACO

MANO     TRA TRA TRAX  A RECORD LABEL RUN BY__ DJ …  SONIC HUSTLERS__ SINCE 2020  INSTAGRAM  YOUTUBE  BANDCAMP  BOOKINGS: CARIN@OUTER-AGENCY.COM
```

- **Pasar la mano la cierra**: las tres sílabas se juntan hacia la izquierda.
- **En el espacio que sueltan entra el resto de la línea.** No aparece un panel
  ni se abre un menú: se termina de escribir una frase, en el mismo renglón, la
  misma tinta y el mismo cuerpo.
- **Al salir, la línea se queda abierta 1,5 s** y después la grieta se vuelve a
  abrir. Mismo reloj y misma regla que los emblemas: mientras haya mano no hay
  reloj, y volver antes de que se cumpla cancela la cola.
- **En teléfono se traba**: un toque la abre y se queda abierta hasta que se
  toque en otra parte. Es la excepción a la regla de "soltar el dedo suelta el
  gesto", y la razón es que ahí adentro hay cuatro links de verdad.

**Lo único que se anima es el ancho de lo que entra.** Las sílabas se cierran
porque eso se abre: el `flex` reparte en cada cuadro lo que sobra de la barra. No
hay una animación del hueco que pueda quedar desincronizada, ni un ancho escrito
a mano que se quede corto en otra ventana. La única excepción es cuando la línea
envuelve —por debajo de ~1090px—, porque ahí lo que sobra en el primer renglón ya
no sabe nada de lo que entró en el segundo.

**La grieta vieja no vuelve.** Aquella era el mismo emblema comprimido a la
fuerza en su altura, de borde a borde en una franja al pie: la lectura literal
del third space, *el hueco deforma lo que pasa por él*. Se quitó el 2026-07-30
porque en pantalla eran dos cosas cromáticas peleándose una página que tiene una
sola.

Esta es otra lectura y no compite con nada: **el hueco no deforma lo que pasa por
él, el hueco es donde cabe lo que no estaba dicho**. Y de paso resuelve algo que
la página tenía a medias — el sello tenía tres redes y un correo que no estaban
en ninguna parte, y meterlos en la línea de reposo la habría vuelto un pie de
página.

El visor se sigue escondiendo por CSS (`display: none`): `crearStack` es el
runtime de las cuatro páginas y no se toca por una decisión de esta.

### 3.5 El color y el material

- Los emblemas entran **tal cual son**: el rosado, el celeste y el dorado de una
  estampa. **No** pasan por ningún filtro — el de dos tonos es del catálogo,
  donde su trabajo es que 35 carátulas no compitan; aquí borraría el dato.
- **El papel es el gris del chrome, `#e5e5e5`** — el mismo de la franja de
  etiquetas del catálogo y del panel de créditos, que ya vive en
  `--ttx-gris` (`tokens.css:60`). La tinta vuelve a la de la casa: negra. El
  About deja de ser la pantalla negra que era y pasa a ser una hoja de chrome.
- **La banda no se pinta aparte.** Su fondo es transparente, que sobre este
  papel es exactamente el mismo gris — y además es lo que deja pasar una
  aparición por detrás del texto en vez de cortarla contra una barra invisible.
  Con la zona a la derecha eso ya casi no pasa, pero cuando pasa se ve bien.
- **Una sola tinta en el texto: negra.** Nada de un gris para lo secundario. La
  línea tiene dos pesos y ningún nivel más.
- **El fondo no cambia nunca.** El mismo gris en los tres estados. La página no
  se tiñe ni se ilumina. En un sitio que es blanco y negro en todas las demás
  pantallas, estas apariciones son lo único cromático — y eso impide que se
  confundan con contenido.
- **GIF de verdad**, con su tramado y sus 256 colores. El kitsch se mete en el
  pixel por la puerta del formato, no por decoración: es una consecuencia
  técnica, no un efecto.
- **Los tres emblemas son los del sello** (2026-07-30), bajados del Cargo actual
  a `media/about/`: la changua de DJ Lomalinda, el carro de Nyksan y el
  Junior FC de Verraco. Se acabó el relleno; la marca `"relleno": true` ya no
  está en `about.json`. El cuadro fijo de cada uno —el que se sirve con
  `prefers-reduced-motion`— es el **primer fotograma del GIF**, sacado con
  `ffmpeg -i x.gif -vframes 1 x.png`.

### 3.6 Teléfono y teclado

- **Teléfono: mantener el dedo**, como el título del home. Se sostiene sobre un
  nombre y el emblema está ahí, quieto; se suelta y dura la cola. Mismo reparto
  por `pointerType` de `home.js:339-382`. La línea envuelve a dos o tres
  renglones —ochenta y pico de caracteres en versalitas no caben en 390 puntos,
  y forzarlos sería tipografía de seis píxeles o la mitad de los nombres cortada
  contra el borde, y los nombres son los disparadores— y **la grieta se queda con
  su propio renglón**, entero y de borde a borde. Envuelto se parte por las
  juntas y por el aire, nunca dentro de un grupo. La zona no cambia: es toda la
  ventana aquí también.
- **Teclado: el emblema no se apaga mientras el nombre esté enfocado.** El foco
  es una fuente como la mano, y mientras esté puesta no hay reloj; al irse
  corre la misma cola. Del nombre se tabula al santo, que está después en el
  DOM. Filtrado por `:focus-visible`, como el home.
- Un emblema apagado es **`inert`**: ni clic ni Tab. Está en la página todo el
  tiempo y sin eso serían tres links invisibles repartidos por la pantalla.
- **`prefers-reduced-motion: reduce`:** como un GIF animado no se puede pausar
  por CSS, ahí se sirve el cuadro fijo (`emblema.png`) en vez del GIF. Lo demás
  no cambia: ya no hay reciclaje que quitar. Si la preferencia cambia con la
  página abierta, al emblema se le cambia el archivo — no se vuelve a crear.

---

## 4. Cerrado — no volver a abrir

- El ensayo es **no verbal**. Sin manifiesto, sin citas transcritas.
- El copy es una sola línea y se escribe con las juntas marcadas:
  `*A record label run by*` y `*Sonic hustlers*since 2020*`. Las sílabas del
  nombre van aparte, en `silabas`.
- **Entre grupos va la junta**: `__` y un espacio pequeño. Entre enunciados va el
  aire, sin `__`. Los espacios que se ven dentro de un grupo son del texto. **El
  peso alterna arrancando en liviano y se reinicia en cada enunciado.**
- **Los tres nombres son un solo grupo**, separados por `/`. No van intercalados
  en la alternancia.
- **Una sola tinta.** Negro, y ya.
- **La grieta es el hueco del nombre del sello**, no una banda. El About sigue
  siendo banda y campo; el visor se esconde.
- La barra de texto es **de un renglón, del grosor de la del home**, y va
  **arriba**, no a media pantalla.
- **El papel es el gris del chrome `#e5e5e5`**, tinta negra, y la banda no se
  pinta aparte.
- Un **emblema kitsch** por DJ, no un retrato. En GIF, a su color, tamaño fijo.
- **Azar puro dentro de la zona, que es toda la ventana**, con zona segura.
  Adentro no hay retícula ni memoria de posición; lo único que se le quitó al
  azar es el corte contra el borde.
- **La aparición no se mueve**, y dura segundo y medio después de la mano.
- **El GIF nunca se reinicia**: el emblema no sale del DOM, solo se apaga.
- **Reposo: gris y quietud.** Sin destello de ocio, sin loop, sin luz.
- **El santo es el link**, no el nombre.
- El fondo no cambia de color nunca.

---

## 5. Implementación

### 5.1 Los datos — `data/about.json`

Ya contemplado en `PLAN.md:209`. La línea se **compone** desde el array para que
los nombres y sus disparadores tengan una sola fuente:

```json
{
  "silabas": ["Tra", "Tra", "Trax"],
  "sello": "*A record label run by*",
  "lema": "*Sonic hustlers*since 2020*",
  "redes": [
    { "nombre": "Instagram", "url": "https://www.instagram.com/tratratrax" },
    { "nombre": "YouTube",   "url": "https://www.youtube.com/@tratratrax" },
    { "nombre": "Bandcamp",  "url": "https://tratratrax.bandcamp.com/" }
  ],
  "bookings": { "texto": "Bookings: carin@outer-agency.com",
                "email": "carin@outer-agency.com" },
  "djs": [
    { "nombre": "DJ Lomalinda", "instagram": "https://www.instagram.com/djlomalinda/",
      "emblema": "media/about/lomalinda.gif", "quieto": "media/about/lomalinda.png" },
    { "nombre": "Nyksan",  "instagram": "https://www.instagram.com/nyksan_/",  "…": "…" },
    { "nombre": "Verraco", "instagram": "https://www.instagram.com/verraco__/", "…": "…" }
  ]
}
```

Las frases llevan **los asteriscos de las juntas** y el widget las parte por
ahí; los tres nombres se pegan al final del enunciado del sello como **un solo
grupo** separado por `/`, en el orden del array. Guardar la marca en el dato es
lo que permite escribir la línea entera —texto y ritmo— en un solo sitio; una
frase sin asteriscos es un grupo liviano y ya.

**`silabas` es la grieta** y no es decorativo: sin ella no hay nombre partido y
sin nombre partido no hay hueco que abrir, así que tres cuartos del texto se
quedan sin forma de aparecer. El validador lo trata como error.

**Los dos Instagram no son el mismo.** `redes` es el del sello y se lee en la
línea; `djs[].instagram` es el de cada DJ y es a donde lleva su santo.

Los GIF van en `media/about/`, **nunca en `public/`** (`CLAUDE.md:25-28`);
`tools/build-widgets.mjs` ya copia `media/` a `public/`.

Esquema en `tools/validate.mjs`, que ya maneja archivos de datos opcionales
condicionalmente: exigir los tres DJs con `nombre`, `instagram`, `emblema` y
`quieto`, exigir `silabas` y las URLs de `redes`, y avisar si falta `lema`,
`sello`, `redes` o `bookings`. Del correo revisa además que el `email` aparezca
dentro del `texto`: si no, se lee una dirección y se escribe a otra. El `quieto` quedó
como **error** y no como aviso: sin PNG no hay forma de respetar
`prefers-reduced-motion`. Que sean exactamente tres es aviso, no error — el
brief cerró tres nombres, pero la línea se compone sola y el día que sean otros
el dato manda.

### 5.2 El widget — `src/widgets/about/`

`about.js` + `about.css`, registrados como `data-ttx="about"` desde
`src/widgets/index.js` (que es donde el bundle importa cada widget; el loader de
`_runtime/mount.js` solo resuelve el nombre).

**Reusar, no reescribir:**

| Qué | De dónde |
|---|---|
| El stack (sin visor: se esconde por CSS) | `crearStack(host, { banda: true, ancla: false })` — `stack.js` |
| El reparto ratón / tacto / teclado | el patrón de `home.js:339-382` |
| Texto oculto para lector de pantalla | `.ttx-oculto` — `catalogo.css:224-231` |
| La precarga de los emblemas | `precargar()` — `stack.js` |
| Tokens, neutralización de Cargo, `reduced-motion` | `tokens.css` |
| Copia de `media/` y bundle IIFE | `tools/build-widgets.mjs` |

**El armado**, en `about.css`, todo bajo `[data-ttx="about"]`:

```css
.ttx-marco     { grid-template-rows: var(--ttx-about-aire) auto minmax(0,1fr); }
.ttx-contenido { grid-row: 1 / -1; grid-column: 1; }  /* el campo: las tres filas */
.ttx-banda     { grid-row: 2;      grid-column: 1; }  /* la línea de texto */
.ttx-visor     { display: none; }                     /* no hay tercera banda */
```

**El `grid-column` no es de adorno.** Sin él, la colocación automática ve que el
campo (filas 1 a 3) se cruza con la banda (fila 2) y le abre una **segunda
columna**: la banda se queda con dos tercios de la pantalla y el campo con el
tercio de la derecha. Eso era la mitad del problema de "los santos siempre salen
a la derecha".

Tres filas para dos cosas: el aire de arriba, la banda y lo que sobra. El campo
las cruza todas, así que se superpone a la banda y el reparto lo hace el
`z-index` (campo `0`, banda `1`).

La posición del emblema no es un porcentaje escrito por el JS sino un `calc` que
estira un número de 0 a 1 hasta la zona:

```css
left: calc(var(--ttx-about-x0) + (var(--ttx-about-x1) - var(--ttx-about-x0)) * var(--ttx-about-rx));
```

El orden del **DOM** no cambia —lo pone `crearStack`— y eso es lo que hace que
del nombre se tabule al emblema: la banda va antes del campo.

Host: `--ttx-papel: var(--ttx-gris)` (y la tinta, la de la casa),
`--ttx-banda-h: 1.9rem` (el renglón), `--ttx-about-aire: clamp(48px, 12vh,
132px)` (lo que sube la línea), `--ttx-about-junta: 0.03em` (la junta entre
grupos: casi cero, porque lo que separa es el peso),
`--ttx-about-banda-fondo: transparent` y los cuatro límites de la zona
—`--ttx-about-x0/x1/y0/y1`—, que el bloque de teléfono acuesta. Todo calibrable
**desde el placeholder de Cargo**, no editando el widget (`CLAUDE.md:66-68`).

**Tres detalles de z-order y recorte que resuelven requisitos opuestos:**

- `.ttx-marco` ya trae `overflow: hidden` (`tokens.css:136`) → el emblema se
  corta contra el marco **gratis**. Eso es el "derecho a cortarse".
- El emblema se posiciona `absolute` en el campo, que ahora llega a los cuatro
  bordes — pero se pinta **detrás de la banda** (`z-index` menor). Si se pintara
  encima, taparía su propio disparador y el nombre quedaría inalcanzable.
  Visualmente choca; funcionalmente no estorba.
- La banda va **sin fondo**. Con fondo, ese detrás sería un corte: una franja
  del ancho de la pantalla donde el emblema simplemente no está. Pintarla es la
  salida si algún día la línea tiene que ser legible siempre —
  `--ttx-about-banda-fondo: var(--ttx-papel)`— y se paga con eso.

El ancla del emblema es **su centro** (`translate(-50%,-50%)`), y por eso en el
extremo de la zona sale con la mitad afuera: ese es el derecho a cortarse. Que
todo sea porcentaje evita medir el campo en cada aparición y de paso el emblema
no se descoloca si la ventana cambia de tamaño mientras se ve. Se sortea **al
encender y solo ahí** — con el emblema visible, la función se sale antes de
tocarlo.

**Marcado:** cada nombre es un `<button>` de verdad (el teclado sale gratis, como
el título del home). Cada emblema es un `<a target="_blank" rel="noopener">` con
el GIF dentro y un `.ttx-oculto` que diga *"Nyksan on Instagram"*.

**El ciclo de vida**, sin cola y sin estado global: enciende con la primera
fuente, **no hay reloj mientras haya alguna puesta**, y al irse la última corre
la cola de `VIDA` ms —1500— quieta en el mismo sitio. `VIDA` calibrable por
`data-vida`, igual que `data-minimo` en el home. El emblema **no se crea ni se
destruye**: existe desde el montaje y se apaga con `opacity` + `inert`, que es
lo único que no le reinicia el GIF.

Las fuentes de activación se **cuentan** (ratón, tacto, teclado): el mismo nombre
puede estar activo por dos a la vez y soltar una no puede apagar la otra. Y el
teclado no se suelta con el `blur` del nombre sino mirando **dónde aterrizó el
foco** un cuadro después: tabular desde el nombre lleva justamente al emblema, y
borrarlo en el `blur` dejaría el foco sin destino.

### 5.3 Lo que va a Cargo

- `src/pages/preview/about.astro` — para verlo sin depender de Cargo, como
  `preview/home.astro`.
- `cargo/snippets/about.md` — el `<div data-ttx="about">` con sus variables de
  calibración inline y la tabla de qué mueve cada una, en el formato de
  `home.md:162-175`.
- **El nav no se toca.** No hay copy que mover: la línea de los fundadores no
  existe en el diseño vigente.

**El ancla, resuelto:** `stack.js` publica `--ttx-ancla` en el `<html>` desde el
borde inferior de la banda, y las gavetas de Cargo lo leen. Con el stack
invertido la banda no está donde el resto del sitio la espera — y el `<html>` **sobrevive a la
navegación por AJAX de Cargo**, así que un número escrito aquí es el que se
encontraría la gaveta de la merca en la página siguiente. Por eso el About se
monta con `ancla: false` (opción nueva de `crearStack`) y no publica nada: lo que
quede escrito es lo de la última página que sí manda, que es exactamente lo que
la gaveta quiere.

### 5.4 Este documento

Va al repo como `BRIEF-ABOUT.md`, junto a `BRIEF-HOME.md`. Es el acuerdo.

---

## 6. Verificación

Lo que se comprobó automáticamente, en Chrome, contra el bundle de verdad:
mecánica de una pasada, tres apariciones a la vez y su orden de apagado, el
tacto, que el santo encima del nombre no le quita el clic al nombre, el orden de
tabulación nombre → emblema, el link y su nombre accesible, las dos variantes de
`prefers-reduced-motion` y que no se publique `--ttx-ancla`.

Lo que **hay que mirar con la mano y en un teléfono de verdad**:

1. `npm run validate` — falla si falta un DJ o un emblema.
2. `npm run build` y abrir `/preview/about`.
3. **La línea:** un solo renglón, arriba y no a media pantalla, los dos bloques
   contra sus bordes, ningún asterisco impreso y ninguna coma. Estirar y encoger
   la ventana: el hueco del medio se abre y se cierra, los bloques no se mueven
   de su borde.
4. **Escritorio:** pasar la mano por los tres nombres despacio (uno cada vez) y
   rápido (los tres a la vez, en tres sitios, apagándose en orden). Dejar la mano
   quieta encima de uno **un rato largo**: el emblema no se mueve ni se apaga.
   Soltar: se queda segundo y medio y se puede alcanzar con el ratón. Confirmar
   que la posición cambia entre apariciones.
5. **La zona:** insistir hasta convencerse de que cae en los cuatro cuadrantes,
   y de que **ninguno** sale medio comido por el borde — ni el cuadrado, ni el
   alto, ni el apaisado. En teléfono, lo mismo.
6. **El GIF no se reinicia:** encender y apagar el mismo nombre varias veces
   seguidas; cada aparición tiene que agarrar la animación en otro punto, nunca
   en el primer cuadro.
7. **La línea:** la junta entre grupos y el aire entre enunciados, sin
   confundirlos, y ningún `__` colgando al final de un enunciado. `SONIC
   HUSTLERS` con su espacio; `A RECORD LABEL RUN BY` liviano y los tres nombres
   fuertes, juntos y separados por `/`; todo en negro.
8. **La grieta:** entrar y salir; cronometrar el segundo y medio; volver antes
   de que se cumpla y ver que no se cierra. Con teclado, Tab la abre y el
   siguiente Tab entra a los nombres y después a las tres redes. En teléfono,
   tocar la abre y se queda; tocar afuera la cierra.
8. **El link:** clic en un santo abre el Instagram correcto en pestaña nueva.
   Con el emblema apagado, clic en ese sitio no hace nada.
9. **Teclado:** Tab hasta un nombre → el emblema sale y **no** se va; Tab otra
   vez lo alcanza; Enter navega. Nada de esto necesita ratón.
10. **Teléfono** (dispositivo real, no solo modo responsive): mantener el dedo →
    el emblema, quieto; soltar → la cola y el gris. Confirmar que no hay
    destello de ocio y que los tres nombres se ven aunque la línea envuelva.
11. **`prefers-reduced-motion: reduce`** en devtools: se sirve el PNG en vez del
    GIF, y cambiar la preferencia con la página abierta lo cambia en el acto.
12. **Reposo:** cargar la página y no tocar nada durante un minuto. Tiene que
    quedarse en gris y quieta — los tres GIF están corriendo por debajo, pero no
    se asoma ni uno.
13. **El ancla:** navegar del About a merca y abrir una gaveta; que no se
    desalinee.
