# Qué se pega en Cargo para el About

Una sola línea en la página `about`. El loader global —el `<script>` del
`ttx.js`— ya está puesto para el catálogo; si no, está en
[catalogo.md](catalogo.md) y se pega una sola vez en la vida del sitio.

```html
<div data-ttx="about"></div>
```

Con el recorte que ya usan el home y el catálogo, que es lo que se va a querer:

```html
<div data-ttx="about" style="--ttx-margen: 6px; --ttx-nav-h: 18px"></div>
```

`--ttx-nav-h` es el hueco que se le reserva a la barra de Cargo. Si queda en
cero, el pie de la página se mete debajo de esa barra — y ahora que los emblemas
caen por toda la ventana, ahí es donde se pierden.

**El nav no se toca.** No hay copy que mover: la línea de los fundadores y sus
Instagram existían en el nav del sitio viejo, no en el diseño vigente.

---

## Qué hace

El About es **una barra de texto arriba y nada más**. No tiene visor: es la
única página del sitio donde el stack se queda en dos bandas. Y tiene dos
gestos, no uno: **la grieta** y **los nombres**.

```
REPOSO                                    LA MANO EN LA GRIETA
┌────────────────────────────────────┐    ┌────────────────────────────────────┐
│                                    │    │                                    │
│TRA    TRA    TRAX   A RECORD LABEL…│    │TRA TRA TRAX A RECORD LABEL… SONIC… │
│  └─ la grieta ─┘                   │    │        INSTAGRAM YOUTUBE BANDCAMP… │
│                                    │    │                                    │
│          gris y nada más           │    │          gris y nada más           │
│                                    │    │                                    │
└────────────────────────────────────┘    └────────────────────────────────────┘
          barra de Cargo                            barra de Cargo

LA MANO EN UN NOMBRE — el campo es toda la ventana, con zona segura
┌────────────────────────────────────┐
│ ✝◉✝                                │
│TRA    TRA    TRAX   A RECORD LABEL…│
│                        ✝◉✝         │
│     ✝◉✝                            │
│                              ✝◉✝   │
└────────────────────────────────────┘
```

**En reposo es gris y nada más.** El gris del chrome —el mismo de la franja de
etiquetas del catálogo—, la línea de texto y ni una imagen, ni un loop, ni un
destello. **No hay destello de ocio**, tampoco en teléfono — al contrario que el
home, donde el destello avisa que hay un lanzamiento debajo. Quien no mueva la
mano no ve nunca nada, y eso es el diseño: cargar la página y dejarla quieta un
minuto tiene que dar gris y quietud.

### La grieta

**La grieta es el hueco dentro del nombre del sello.** No es una banda ni una
imagen: son las tres sílabas de `TRA · TRA · TRAX` abiertas a lo ancho de la
pantalla, y el aire que queda entre ellas.

1. **La mano entra a la barra** —a las sílabas, al hueco, al lema, a los
   nombres, a donde sea de ese renglón— y la grieta **se cierra**: las tres
   sílabas se juntan hacia la izquierda.
2. **En el espacio que sueltan se escribe el resto de la línea**: el lema
   (`SONIC HUSTLERS__ SINCE 2020`), las tres redes del sello y el correo de
   bookings. Letra por letra y con el mismo cursor del lema del nav — es la
   misma máquina y los mismos tiempos. Todo en el mismo renglón, en la misma
   tinta y en el mismo cuerpo: no aparece un panel, se termina de escribir una
   frase, literalmente.
3. **Al salir, la línea se queda abierta segundo y medio más** y después vuelve
   a abrirse la grieta. Es el mismo reloj de los emblemas y la misma regla:
   mientras haya mano no hay reloj, y volver antes de que se cumpla cancela la
   cola. Segundo y medio es lo que toma salirse de la grieta y llegar a
   `INSTAGRAM`, que es un link de verdad.
4. **En teléfono se traba.** Un toque la abre y **se queda abierta** hasta que
   se toque en otra parte — es la excepción a la regla de "soltar el dedo suelta
   el gesto", y la razón es que ahí adentro hay cuatro links a los que habría
   que atinarles en segundo y medio.

Lo único que se anima en toda la página es el ancho de lo que entra. **Las
sílabas se cierran porque eso se abre**, no porque haya una animación del
hueco: el `flex` reparte en cada cuadro lo que sobra de la barra. Por eso no hay
nada que se pueda desincronizar, ni un ancho escrito a mano que se quede corto
en una ventana distinta.

**La que escucha la mano es la barra entera, no las sílabas.** Es una caja que
no se mueve, y tiene que serlo: cuando la zona sensible eran las sílabas, al
abrirse se corrían hacia la izquierda, se salían de debajo del cursor quieto y
la línea se cerraba sola — y al volver a su sitio se abría otra vez, en un ciclo
que pasaba sin que nadie moviera nada. Por lo mismo, irse hacia los nombres de
los DJs o hacia los links ya no la cierra: son parte de la barra.

Que la grieta siga siendo un `<button>` de verdad es lo que hace que con teclado
se llegue a las tres redes y al correo: Tab la abre y el siguiente Tab entra. Con
teclado la línea **no se teclea**: sale entera de una, o el Tab siguiente llegaría
antes que el link que va a buscar.

**La grieta vieja no vuelve.** Existió otra: el emblema aplastado de borde a
borde en una franja al pie, la lectura literal del *third space*. Se quitó el
2026-07-30 — en pantalla eran dos cosas cromáticas peleándose una página que
tiene una sola. La de ahora es otra cosa y vive dentro del texto: el hueco no
deforma lo que pasa por él, **el hueco es donde cabe lo que no estaba dicho**.

### Los nombres

1. **La mano entra a un nombre** — aparece el emblema de *ese* DJ en una
   **posición aleatoria de toda la ventana**.
2. **Y ahí se queda quieto.** Mientras la mano siga puesta no hay reloj: no
   salta, no se recicla, no se apaga. Sostener no produce una ráfaga; produce
   una imagen que espera.
3. **Al irse la mano dura segundo y medio más**, en el mismo sitio. Es el tiempo
   de soltar el nombre y llegar al santo con el ratón. Volver antes de que se
   cumpla lo deja donde estaba: no hay forma de hacerlo brincar.
   Cada DJ cuenta lo suyo aparte, así que una pasada rápida por los tres nombres
   deja los tres emblemas en pantalla a la vez, en tres sitios, apagándose en el
   orden en que se soltaron. **El ritmo de la mano es lo que compone**; la
   página no elige nada.
4. **El santo es el link.** El nombre solo invoca; el que enlaza es el emblema:
   clic en el Divino Niño abre el Instagram de Nyksan. Un link que hay que
   cazar, donde le da la gana.

**El GIF no se reinicia nunca.** Los tres emblemas están puestos desde que carga
la página —apagados— y encenderlos es quitarles una opacidad, nunca volver a
meterlos. Un GIF que sale y vuelve arranca de cero, y el santo aparecería
siempre en el mismo cuadro; así, el loop corre por debajo y cada aparición lo
agarra donde vaya. Si alguna vez se cambia esto por `display: none`, la
animación se para y vuelve el problema.

**El campo es toda la ventana, y ahora con zona segura.** Hasta agosto de 2026
el azar estaba acotado a la mitad derecha —y encima el campo mismo medía un
tercio de la pantalla, por un reparto de columnas del grid que nadie había
mirado—, así que los santos salían siempre del mismo lado y cortados por el
borde. El sello lo reportó y se corrigieron las dos cosas: el campo es la
ventana entera y **ningún emblema sale medio comido por el borde**.

Adentro no hay retícula ni memoria de posición. Un emblema puede quedar en una
esquina ridícula y dos pueden caer encima: **esos siguen siendo resultados
legales** — es el pop-up de los noventa, el kitsch entrando por el
comportamiento. Lo único que se le quitó al azar es el corte contra el borde.

La zona segura no está escrita en ningún número: el emblema se ancla con un
`translate` de su propio porcentaje, así que con `0` se apoya en el borde
izquierdo, con `1` en el derecho y con `0.5` queda centrado. Eso hace que el
recorte use el **tamaño real de cada imagen** —una es cuadrada, otra alta y otra
apaisada— sin que el JS mida nada.

**El fondo no cambia nunca.** El mismo gris en los tres estados: la página no se
tiñe ni se ilumina. En un sitio que es blanco y negro en todas las demás pantallas, estas
apariciones son lo único cromático — y eso es lo que impide que se lean como
contenido.

En **teléfono se mantiene el dedo** sobre un nombre, como el título del home: el
emblema está ahí, quieto; se suelta y corre la cola. La grieta es la excepción y
se traba, como dice arriba.

Ahí la línea envuelve a dos o tres renglones —no cabe en un teléfono, y cortarla
contra el borde escondería los nombres, que son los disparadores— y **la grieta
se queda con su propio renglón**, entero y de borde a borde. Envuelta, el `flex`
ya no puede cerrar el hueco solo, porque lo que sobra en el primer renglón no
sabe nada de lo que entró en el segundo: ahí, y solo ahí, el hueco se anima a
mano. Lo mismo pasa en cualquier ventana por debajo de ~1090px, que es donde la
línea abierta deja de caber.

Con **teclado** ni el emblema ni la grieta se apagan mientras lo suyo esté
enfocado: el foco cuenta como mano. El primer Tab abre la grieta, del nombre se
tabula al emblema y Enter navega. Con la línea cerrada, lo que hay adentro está
`inert`: no se puede tabular a un link invisible. Con
`prefers-reduced-motion: reduce` se sirve el PNG en vez del GIF — un GIF animado
no se puede pausar por CSS.

Se ve corriendo, sin depender de Cargo, en **`/preview/about`**.

---

## Los datos

`data/about.json`:

```json
{
  "silabas": ["Tra", "Tra", "Trax"],
  "sello": "*A record label run by*",
  "lema": "*Sonic hustlers*since 2020*",
  "redes": [
    { "nombre": "Instagram", "url": "https://www.instagram.com/tratratrax" }
  ],
  "bookings": {
    "texto": "Bookings: carin@outer-agency.com",
    "email": "carin@outer-agency.com"
  },
  "djs": [
    {
      "nombre": "DJ Lomalinda",
      "instagram": "https://www.instagram.com/djlomalinda/",
      "emblema": "media/about/lomalinda.gif",
      "quieto": "media/about/lomalinda.png"
    }
  ]
}
```

| Campo | |
|---|---|
| `silabas` | **la grieta**: el nombre del sello partido. Se ven siempre |
| `sello` | lo que va con los nombres, y se ve siempre |
| `lema` | el primer enunciado que **entra** al abrirse la grieta |
| `redes` | las tres del **sello**, no las de los DJs. Entran con la grieta |
| `bookings` | el correo, que cierra la línea. Entra con la grieta |
| `nombre` | el disparador **y** el texto de la línea. Una sola fuente |
| `instagram` | a dónde lleva el emblema **de ese DJ** |
| `emblema` | el GIF |
| `quieto` | el cuadro fijo. Es lo que se sirve con `prefers-reduced-motion`, y **no es opcional** |

**Ojo con los dos Instagram.** `redes` es el del sello y se lee en la línea;
`djs[].instagram` es el de cada DJ y es a donde lleva su santo. Son campos
distintos a propósito.

**`bookings` es la única línea del sitio con un signo adentro.** Los dos puntos
de `Bookings:` son parte del texto, no una junta: es un grupo solo, liviano y
sin `__`. Así llegó de las capturas del sello. El `mailto:` se arma con
`bookings.email`, no con el texto — el validador avisa si no coinciden.

**El asterisco marca dónde termina un grupo, y no se imprime nunca.** Lo que se
imprime es el `__`, y lo pone el CSS.

```
*SONIC HUSTLERS*SINCE 2020*   →   SONIC HUSTLERS__ SINCE 2020
                                  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌   ━━━━━━━━━━
                                     liviano          fuerte
```

Tres reglas:

1. **Entre grupos va la junta**: `__` y un espacio pequeño. El último grupo del
   enunciado **no la lleva** — nunca queda un `__` colgando al final.
2. **Los espacios que se ven dentro de un grupo son del texto.** `SONIC
   HUSTLERS` son dos palabras y llevan su espacio.
3. **El peso alterna empezando por el liviano**: el primer grupo va en peso
   normal y el segundo en negrita. Todo el renglón va en la misma tinta negra:
   nada de un gris para lo secundario.

Escribir la frase sin asteriscos también funciona: queda un grupo liviano y sin
junta.

La regla vive en `src/widgets/_runtime/format.js` (`grupos`) y se pinta con las
clases de `tokens.css` (`.ttx-junta`, `.ttx-fuerte`, `.ttx-suave`). Es la misma
del home y la de los créditos del catálogo — no hay una versión del About.

**La alternancia se reinicia en cada enunciado**, y por eso los dos empiezan en
liviano:

```
A RECORD LABEL RUN BY__ DJ LOMALINDA / NYKSAN / VERRACO
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SONIC HUSTLERS__ SINCE 2020
╌╌╌╌╌╌╌╌╌╌╌╌╌╌   ━━━━━━━━━━
```

Lo que separa un enunciado del otro es **el aire**, sin `__` de por medio. Las
tres redes y el correo son un enunciado cada uno —de un solo grupo—, así que
van livianos y ninguno lleva junta.

**Los tres nombres son un solo grupo**, separados por `/` y en el peso fuerte
que les toca por cerrar su enunciado. Se componen desde el array, en el orden de
`djs`: agregar o quitar un DJ es tocar el JSON y nada más. (Hasta agosto de 2026
iban repartidos en la alternancia, un nombre fuerte y otro liviano; las capturas
del sello lo corrigieron — se leen como una lista, no como más campos de la
frase.)

En el JSON los nombres van como se escriben (`DJ Lomalinda`): las versalitas las
pone el CSS, no el contenido.

**El About no tiene respaldo**, y esa es la diferencia con el home. Allá, si el
destacado falla, queda el release más reciente; aquí el único texto de la página
y los tres disparadores salen de este archivo. Si falta o falla, la página dice
que no pudo cargar. Callar antes que pintar una pantalla vacía que parece
terminada.

`npm run validate` exige nombre, Instagram, GIF y PNG de cada DJ, y que los dos
archivos existan de verdad en el repo.

### Los emblemas

Van en **`media/about/`** del repo, versionados, y se publican en GitHub Pages
junto al resto. (En `public/media/` no pueden vivir: `public/` se borra y se
vuelve a escribir en cada compilación.)

- **Un emblema kitsch por DJ, no un retrato.** El rosado, el celeste y el dorado
  de una estampa. Entran **tal cual son**: no pasan por el filtro de dos tonos
  del catálogo, que aquí borraría justamente el dato.
- **GIF de verdad**, con su tramado y sus 256 colores. El kitsch se mete en el
  pixel por la puerta del formato, no por decoración: es una consecuencia
  técnica, no un efecto.
- **Fondo propio o transparente**: la página ya no es negra, es el gris del
  chrome, así que un GIF con fondo negro se recorta como un rectángulo. Los tres
  de hoy vienen así del Cargo viejo y funcionan; si algún día molesta, la salida
  es un GIF con transparencia.
- El **PNG** de al lado es un cuadro fijo del mismo emblema.
- **Tamaño fijo en pantalla**: lo pone `--ttx-about-emblema-w`, así que el
  archivo solo tiene que traer suficiente resolución.

**Los de hoy son los del sello** (2026-07-30), bajados del Cargo actual: la
changua de DJ Lomalinda (300×300), el carro de Nyksan (300×400) y el Junior FC
de Verraco (498×280). Se acabó el relleno.

El PNG de cada uno es el **primer fotograma de su GIF**:

```bash
ffmpeg -i media/about/lomalinda.gif -vframes 1 media/about/lomalinda.png
```

Para reemplazar cualquiera: se sobreescribe el GIF, se vuelve a sacar el PNG con
esa línea y no hay nada más que tocar.

---

## Calibrar sin tocar el código

Las variables van en el mismo `<div>`. Un `style` inline le gana a cualquier CSS,
incluido el global de Cargo.

| Variable | Qué hace | Por defecto |
|---|---|---|
| `--ttx-margen` | aire por los **cuatro** lados | `0px` |
| `--ttx-nav-h` | hueco de abajo para la barra de Cargo | `0px` |
| `--ttx-banda-h` | alto mínimo de la barra del texto | `1.9rem` |
| `--ttx-about-aire` | **lo que sube la línea**: el aire que le queda encima | `clamp(48px, 12vh, 132px)` |
| `--ttx-about-x0` · `x1` | **la zona**, de izquierda a derecha | `0%` · `100%` |
| `--ttx-about-y0` · `y1` | **la zona**, de arriba abajo | `0%` · `100%` |
| `--ttx-about-grieta-crece` | cuánto crece el bloque de las sílabas en reposo | `2` |
| `--ttx-about-hueco-crece` | cuánto crece el hueco de antes del sello | `3` |
| `--ttx-about-grieta-min` | lo que queda entre sílabas con la línea abierta | `var(--ttx-aire)` |
| `--ttx-about-grieta-tel` | el hueco entre sílabas cuando la línea envuelve | `26%` |
| `--ttx-junta` | espacio después del `__` entre grupos, **común a todo el sitio** | `0.3em` |
| `--ttx-aire` | separación entre enunciados, **común a todo el sitio** | `1.6em` |
| `--ttx-about-banda-fondo` | fondo de la barra del texto | `transparent` |
| `--ttx-papel` | el papel de la página | `var(--ttx-gris)` = `#e5e5e5` |
| `--ttx-about-emblema-w` | ancho del emblema, **fijo** | `clamp(116px, 24vmin, 240px)` |
| `--ttx-about-texto-fs` | tamaño del texto | `--ttx-chrome` |
| `--ttx-about-texto-lh` | interlínea | `1.2` |
| `--ttx-inset` | sangría del texto | `1.4rem` |
| `data-vida` (atributo) | ms que el emblema se queda **después** de la mano | `1500` |
| `data-grieta` (atributo) | ms que la línea se queda abierta **después** de la mano | `1500` |
| `data-letra` (atributo) | ms por letra de lo que se escribe, los del nav | `58` |

**`data-vida` es la variable con la que hay que tener cuidado.** No es lo que
dura la aparición: mientras la mano esté puesta no hay reloj y el emblema se
queda quieto donde salió. Es la **cola**, lo que se queda después de que la mano
se va — el tiempo de soltar el nombre y llegar al santo con el ratón, que es
cómo se caza el link. Subirla mucho convierte la página en una composición fija;
bajarla mucho vuelve el link imposible de alcanzar.

**`--ttx-about-aire` es lo único que decide dónde se para la línea.** La fila de
encima mide eso y la barra cae justo debajo; todo lo que sobra queda abajo,
vacío. En `0` la línea se pega al borde de arriba y deja de leerse como una
línea suelta para leerse como un encabezado.

**`--ttx-about-banda-fondo` es transparente a propósito.** Es lo que deja que una
aparición pase por detrás del texto en vez de cortarse contra una franja
invisible del ancho de la pantalla. Ponerlo en `var(--ttx-papel)` deja la línea
siempre legible y se paga con eso.

**La junta y el aire son del sistema, no de esta página.** Un enunciado se
separa del siguiente por grupos: cada grupo cierra con `__` y un espacio
pequeño (`--ttx-junta`), y entre enunciados va un espacio ancho y sin `__`
(`--ttx-aire`). Los dos viven en `tokens.css` y valen lo mismo en el About, en
la franja del home y en los créditos del catálogo — esa es la gracia, y por eso
calibrarlos desde el placeholder de una sola página desalinea las otras tres.
El `__` no se escribe en el copy: lo imprime el CSS sobre el grupo que toca, y
quién lo lleva lo decide `format.js:grupos`.

**Las cuatro variables de la zona son un rectángulo en porcentaje de la
ventana**, y por defecto es la ventana entera. Moverlas es la única forma de
acotar dónde aparecen los santos —por ejemplo, dejarlos abajo en una página
concreta—; el widget no sabe nada de eso. La zona segura no se toca desde aquí:
sale de cómo se ancla el emblema y vale para cualquier rectángulo que se
escriba.

**Los dos `-crece` son el reposo de la grieta, y no hay un tercero para el
estado abierto.** Son la proporción en que se reparte lo que sobra de la barra:
con `2` y `3`, el hueco de antes del sello es kilo y medio de cada hueco entre
sílabas. Abierta la línea deja de sobrar espacio y las sílabas se cierran solas
hasta `--ttx-about-grieta-min`. `--ttx-about-grieta-tel` solo se usa cuando la
línea envuelve, que es donde el reparto ya no alcanza.

**El tamaño del emblema es fijo a propósito.** El azar hace una sola cosa —la
posición— y por eso se lee. Si además cambiara el tamaño, cada aparición sería un
accidente distinto y ninguna se leería como el mismo emblema.

---

## Lo que no hace, y es a propósito

- **No hay manifiesto.** El ensayo es no verbal: el *third space* se demuestra,
  no se explica. Las citas de Bhabha **no se transcriben** — el único texto de la
  página es esa barra de un renglón. Que `SONIC HUSTLERS` también pase por el
  lema rotatorio del nav es un eco buscado, no un choque.
- **No se ilumina solo.** Sin destello de ocio, sin loop, sin luz. En teléfono
  tampoco: aquí no hay nada que avisar.
- **No hay tercera banda.** El visor se esconde; el About es banda y campo.
- **El nombre no es el link** y por eso no va subrayado, y por eso tampoco se
  distingue del resto de su grupo. El peso separa campos, no anuncia que algo se
  pueda tocar. Un link que hay que cazar no se señala — el link es el emblema.
- **Las redes y el correo tampoco se señalan.** Son links de verdad, esos sí, y
  van en la misma tinta y sin subrayado que todo lo demás. Lo que los anuncia es
  que hubo que abrir la grieta para verlos.
- **La grieta no se ilustra.** No hay una flecha, un `+` ni un cursor distinto
  diciendo que ahí hay algo. El hueco es la invitación.
- **No hay uno-a-la-vez ni cola.** Al contrario que el home, aquí sumarse *es* el
  gesto: dos emblemas encima son un resultado legal.
- **No publica `--ttx-ancla`.** El About no es página índice y su banda está mucho
  más abajo; si publicara, la gaveta de la merca aterrizaría contra una línea que
  ya no existe en la página siguiente. Lo que quede escrito es lo del catálogo o
  el home, que es exactamente lo que la gaveta quiere.
