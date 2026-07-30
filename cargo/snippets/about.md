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
cero, la mitad de abajo de la página —que en teléfono es justamente donde caen
los emblemas— se mete debajo de esa barra.

**El nav no se toca.** No hay copy que mover: la línea de los fundadores y sus
Instagram existían en el nav del sitio viejo, no en el diseño vigente.

---

## Qué hace

El About es **una barra de texto arriba y nada más**. No tiene visor: es la
única página del sitio donde el stack se queda en dos bandas.

```
ESCRITORIO                        TELÉFONO
┌────────────────────────────┐    ┌──────────────────┐
│                  ✝◉✝       │    │SONIC HUSTLERS…   │  ← la línea
│SONIC HUSTLERS…  TRATRAT…   │    │TRATRATRAX IS A…  │    envuelve
│                            │    │                  │
│  gris          ✝◉✝         │    │      gris        │
│                            │    ├─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│                    ✝◉✝     │    │   ✝◉✝     ✝◉✝    │  ← la zona:
└────────────────────────────┘    │        ✝◉✝       │    la mitad
      barra de Cargo              └──────────────────┘    de abajo
└─── la zona: la mitad derecha ──┘      barra de Cargo
```

**En reposo es gris y nada más.** El gris del chrome —el mismo de la franja de
etiquetas del catálogo—, la línea de texto y ni una imagen, ni un loop, ni un
destello. **No hay destello de ocio**, tampoco en teléfono — al contrario que el
home, donde el destello avisa que hay un lanzamiento debajo. Quien no mueva la
mano no ve nunca nada, y eso es el diseño: cargar la página y dejarla quieta un
minuto tiene que dar gris y quietud.

1. **La mano entra a un nombre** — aparece el emblema de *ese* DJ en una
   **posición aleatoria dentro de la zona**: la mitad derecha en escritorio, la
   mitad de abajo en teléfono.
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

**La zona se decidió; el azar de adentro no.** Lo único que está resuelto es en
qué mitad de la pantalla pasa esto: la derecha en escritorio —la línea de texto
arranca por la izquierda y así cada cosa tiene su lado—, la de abajo en
teléfono, donde la línea ocupa el ancho entero y no hay derecha que dejarle.

Adentro no hay retícula, ni zona segura, ni memoria de posición. Un emblema
puede salir medio cortado contra el borde, puede quedar en una esquina ridícula,
dos pueden caer encima. **Todos son resultados legales** — es el pop-up de los
noventa, el kitsch entrando por el comportamiento. Si alguien reporta "salió
cortado", no es un bug.

**No hay grieta.** Existió: el emblema aplastado de borde a borde en una franja
al pie, la lectura literal del *third space*. Se quitó el 2026-07-30 — en
pantalla eran dos cosas cromáticas peleándose una página que tiene una sola. El
gesto ya demuestra lo que la grieta ilustraba.

**El fondo no cambia nunca.** El mismo gris en los tres estados: la página no se
tiñe ni se ilumina. En un sitio que es blanco y negro en todas las demás pantallas, estas
apariciones son lo único cromático — y eso es lo que impide que se lean como
contenido.

En **teléfono se mantiene el dedo**, como el título del home: se sostiene sobre
un nombre y el emblema está ahí, quieto; se suelta y corre la cola. Ahí la línea
envuelve a dos o tres renglones —no cabe en un teléfono, y cortarla contra el
borde escondería los nombres, que son los disparadores— y la zona se acuesta: en
vez de la mitad derecha, la mitad de abajo.

Con **teclado** el emblema no se apaga mientras el nombre esté enfocado: el foco
cuenta como mano. Del nombre se tabula al emblema y Enter navega. Con
`prefers-reduced-motion: reduce` se sirve el PNG en vez del GIF — un GIF animado
no se puede pausar por CSS.

Se ve corriendo, sin depender de Cargo, en **`/preview/about`**.

---

## Los datos

`data/about.json`:

```json
{
  "lema": "*Sonic hustlers*since*2020*",
  "sello": "*TraTraTrax*is a label run by*",
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
| `lema` | el bloque de la izquierda de la barra |
| `sello` | el bloque de la derecha, hasta antes de los nombres |
| `nombre` | el disparador **y** el texto de la línea. Una sola fuente |
| `instagram` | a dónde lleva el emblema |
| `emblema` | el GIF |
| `quieto` | el cuadro fijo. Es lo que se sirve con `prefers-reduced-motion`, y **no es opcional** |

**El asterisco es una junta, y no se imprime nunca.** No es un espacio: es el
punto donde cambia el peso.

```
*SONIC HUSTLERS*SINCE*2020*   →   SONIC HUSTLERSSINCE2020
                                  ━━━━━━━━━━━━━━╌╌╌╌╌━━━━
                                     fuerte     liviano fuerte
```

Tres reglas:

1. **Entre grupos no va nada** — ni coma, ni "and", ni punto, ni espacio.
2. **Los espacios que se ven son los de adentro de un grupo.** `SONIC HUSTLERS`
   son dos palabras y llevan su espacio.
3. **El peso alterna empezando por el fuerte**, y es lo único que separa. Todo
   el renglón va en la misma tinta negra: nada de un gris para lo secundario.

Escribir la frase sin asteriscos también funciona: queda un grupo fuerte y ya.

**La línea se compone desde el array**: los tres nombres se pegan al final del
segundo bloque, en el orden de `djs`, y **siguen la alternancia desde donde la
dejó la frase** — `DJ LOMALINDA` fuerte, `NYKSAN` liviano, `VERRACO` fuerte. No
están escritos en ninguna frase: agregar o quitar un DJ es tocar el JSON y nada
más, aunque hay que mirar cómo queda la alternancia.

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
| `--ttx-about-x0` · `x1` | **la zona**, de izquierda a derecha | `50%` · `100%` (teléfono: `0%` · `100%`) |
| `--ttx-about-y0` · `y1` | **la zona**, de arriba abajo | `0%` · `100%` (teléfono: `50%` · `100%`) |
| `--ttx-about-junta` | junta entre grupos de la línea | `0.03em` |
| `--ttx-about-banda-fondo` | fondo de la barra del texto | `transparent` |
| `--ttx-papel` | el papel de la página | `var(--ttx-gris)` = `#e5e5e5` |
| `--ttx-about-emblema-w` | ancho del emblema, **fijo** | `clamp(116px, 24vmin, 240px)` |
| `--ttx-about-texto-fs` | tamaño del texto | `--ttx-chrome` |
| `--ttx-about-texto-lh` | interlínea | `1.2` |
| `--ttx-inset` | sangría del texto | `1.4rem` |
| `data-vida` (atributo) | ms que el emblema se queda **después** de la mano | `1500` |

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

**`--ttx-about-junta` es casi cero y tiene que serlo.** Los grupos van pegados y
lo único que los separa es que el peso alterna, igual que la franja del home.
Abrirla convierte la línea en una frase con espacios y se pierde el gesto: los
espacios que se ven son los de adentro de un grupo, no juntas.

**Las cuatro variables de la zona son un rectángulo en porcentaje de la
ventana**, y se miden contra el *centro* del emblema — por eso el `100%` deja la
mitad afuera, que es a propósito. Moverlas es la única forma de cambiar dónde
aparecen los santos; el widget no sabe nada de eso.

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
  distingue de `TRATRATRAX` o de `2020`: es un campo fuerte más de la línea. El
  peso separa campos, no anuncia que algo se pueda tocar. Un link que hay que
  cazar no se señala — el link es el emblema.
- **No hay uno-a-la-vez ni cola.** Al contrario que el home, aquí sumarse *es* el
  gesto: dos emblemas encima son un resultado legal.
- **No publica `--ttx-ancla`.** El About no es página índice y su banda está mucho
  más abajo; si publicara, la gaveta de la merca aterrizaría contra una línea que
  ya no existe en la página siguiente. Lo que quede escrito es lo del catálogo o
  el home, que es exactamente lo que la gaveta quiere.
