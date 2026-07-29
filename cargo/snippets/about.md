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
cero, **la grieta se mete debajo de la barra** y desaparece justo lo que hay que
ver.

**El nav no se toca.** No hay copy que mover: la línea de los fundadores y sus
Instagram existían en el nav del sitio viejo, no en el diseño vigente.

---

## Qué hace

El About es el stack de siempre, **invertido**: el intersticio va abajo.

```
REPOSO                          MANO EN UN NOMBRE (pasada rápida)
┌──────────────────────────┐    ┌──────────────────────────┐
│                          │    │   ✝◉✝        ✝◉✝         │
│                          │    │                          │
│      negro absoluto      │    │  negro    ✝◉✝            │  ← el campo
│                          │    │                          │
├──────────────────────────┤    ├──────────────────────────┤
│ Sonic hustlers since 2020│    │ Sonic hustlers since 2020│
│ Run by LOMALINDA, NYKSAN │    │ Run by LOMALINDA, NYKSAN │  ← la bisagra
│ and VERRACO.             │    │ and VERRACO.             │
├──────────────────────────┤    ├──────────────────────────┤
│                          │    │▓▓░░██▒▒░███▒▒░░▓▓█▒▒░░▓▓█│  ← la grieta
└──────────────────────────┘    └──────────────────────────┘
      barra de Cargo                  barra de Cargo
```

**En reposo es negro absoluto.** La línea de texto y nada más: ni una imagen, ni
un loop, ni luz en la grieta. **No hay destello de ocio**, tampoco en teléfono —
al contrario que el home, donde el destello avisa que hay un lanzamiento debajo.
Quien no mueva la mano no ve nunca nada, y eso es el diseño: cargar la página y
dejarla quieta un minuto tiene que dar negro y quietud.

1. **La mano entra a un nombre** — aparece el emblema de *ese* DJ en una
   **posición aleatoria** del campo.
2. **Cada aparición vive un segundo** y se apaga sola, contando desde que nació,
   sin mirar a las otras. Una pasada rápida por los tres nombres deja los tres
   emblemas en pantalla a la vez, en tres sitios, apagándose en el orden en que
   salieron. Una pasada lenta deja uno cada vez. **El ritmo de la mano es lo que
   compone**; la página no elige nada.
3. **Mano quieta = se recicla.** Si la mano sigue puesta cuando el emblema se
   muere, nace otro del mismo DJ en posición nueva. Sostener produce una ráfaga
   saltando por la pantalla, no una imagen congelada.
4. **El santo es el link.** El nombre solo invoca; el que enlaza es el emblema:
   clic en el Divino Niño abre el Instagram de Nyksan. Un link que hay que cazar,
   vivo un segundo, donde le da la gana.

**Azar puro, con derecho a cortarse.** Sin retícula, sin zona segura, sin memoria
de posición. Un emblema puede salir medio cortado por el borde, puede quedar en
una esquina ridícula, dos pueden caer encima. **Todos son resultados legales** —
es el pop-up de los noventa, el kitsch entrando por el comportamiento. Si alguien
reporta "salió cortado", no es un bug.

**La grieta muestra el mismo emblema comprimido a la fuerza en su altura, de
borde a borde.** Toda la información está ahí y la forma se perdió: queda una
barra de color irrepetible de esa imagen. Es la lectura literal del *third
space* — el hueco deforma lo que pasa por él. Con varios emblemas vivos muestra
el más reciente; cuando ese muere, cae al siguiente que siga vivo; sin ninguno,
se apaga a negro. Siempre por corte seco.

**El fondo no cambia nunca.** Negro en los tres estados: la página no se tiñe ni
se ilumina. En un sitio que es blanco y negro en todas las demás pantallas, estas
apariciones son lo único cromático — y eso es lo que impide que se lean como
contenido.

En **teléfono se mantiene el dedo**, como el título del home: se sostiene sobre
un nombre y el emblema está ahí, reciclándose; se suelta y vuelve el negro.

Con **teclado** el emblema no se muere mientras el nombre esté enfocado, y no se
recicla: un link que vive un segundo y salta de sitio es inalcanzable con Tab.
Del nombre se tabula al emblema y Enter navega. Con
`prefers-reduced-motion: reduce` pasa lo mismo, y además se sirve el PNG en vez
del GIF — un GIF animado no se puede pausar por CSS.

Se ve corriendo, sin depender de Cargo, en **`/preview/about`**.

---

## Los datos

`data/about.json`:

```json
{
  "lema": "Sonic hustlers since 2020",
  "djs": [
    {
      "nombre": "DJ Lomalinda",
      "instagram": "https://www.instagram.com/djlomalinda/",
      "emblema": "media/about/lomalinda.gif",
      "quieto": "media/about/lomalinda.png",
      "relleno": true
    }
  ]
}
```

| Campo | |
|---|---|
| `lema` | el primer renglón, tal como se escribe |
| `nombre` | el disparador **y** el texto de la línea. Una sola fuente |
| `instagram` | a dónde lleva el emblema |
| `emblema` | el GIF |
| `quieto` | el cuadro fijo. Es lo que se sirve con `prefers-reduced-motion`, y **no es opcional** |
| `relleno` | material de prueba. Mientras esté en `true`, `npm run validate` lo avisa en cada corrida |

**La línea se compone desde el array**: el widget arma `Run by A, B and C.` con
el orden de `djs`. Los nombres no están escritos en ninguna frase — agregar o
quitar un DJ es tocar el JSON y nada más.

En el JSON los nombres van como se escriben (`DJ Lomalinda`): las versalitas las
pone el CSS, no el contenido.

**El About no tiene respaldo**, y esa es la diferencia con el home. Allá, si el
destacado falla, queda el release más reciente; aquí el único texto de la página
y los tres disparadores salen de este archivo. Si falta o falla, la página dice
que no pudo cargar. Callar antes que pintar una pantalla negra que parece
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
- **Fondo negro**, como la página. Un GIF con transparencia también sirve.
- El **PNG** de al lado es un cuadro fijo del mismo emblema.
- **Tamaño fijo en pantalla**: lo pone `--ttx-about-emblema-w`, así que el
  archivo solo tiene que traer suficiente resolución (los de hoy son 260×326).

Lo que hay en `media/about/` hoy es **material de relleno**: tres estampas
generadas, marcadas `RELLENO` en la propia imagen y `"relleno": true` en el JSON,
para poder desarrollar y calibrar sin esperar al sello. **Se reemplazan cuando
llegue el material de verdad** — se sobreescriben los seis archivos, se quita el
`relleno` del JSON y no hay nada más que tocar.

El script que las dibujó era de un solo uso y no está en el repo: no hay nada que
regenerar, hay algo que reemplazar.

---

## Calibrar sin tocar el código

Las variables van en el mismo `<div>`. Un `style` inline le gana a cualquier CSS,
incluido el global de Cargo.

| Variable | Qué hace | Por defecto |
|---|---|---|
| `--ttx-margen` | aire por los **cuatro** lados | `0px` |
| `--ttx-nav-h` | hueco de abajo para la barra de Cargo | `0px` |
| `--ttx-visor-h` | alto de **la grieta** | `clamp(18px, 3.5vh, 40px)` |
| `--ttx-banda-h` | alto mínimo de la franja del texto | `3.2rem` |
| `--ttx-about-emblema-w` | ancho del emblema, **fijo** | `clamp(116px, 24vmin, 240px)` |
| `--ttx-about-texto-fs` | tamaño del texto | `--ttx-chrome` |
| `--ttx-about-texto-lh` | interlínea de los dos renglones | `1.5` |
| `--ttx-inset` | sangría del texto | `1.4rem` |
| `data-vida` (atributo) | ms que vive una aparición | `1000` |

**`data-vida` es la variable con la que hay que tener cuidado.** Un segundo es lo
que hace que sea un gesto y no un estado: alcanza para verlo y para alcanzarlo
con el ratón, y no alcanza para instalarse. Subirlo mucho convierte la página en
una composición fija; bajarlo mucho convierte el link en algo imposible de cazar.

**El tamaño del emblema es fijo a propósito.** El azar hace una sola cosa —la
posición— y por eso se lee. Si además cambiara el tamaño, cada aparición sería un
accidente distinto y ninguna se leería como el mismo emblema.

---

## Lo que no hace, y es a propósito

- **No hay manifiesto.** El ensayo es no verbal: el *third space* se demuestra,
  no se explica. Las citas de Bhabha **no se transcriben** — el único texto de la
  página son esos dos renglones. Que `SONIC HUSTLERS` también pase por el lema
  rotatorio del nav es un eco buscado, no un choque.
- **No se ilumina solo.** Sin destello de ocio, sin loop, sin luz en la grieta.
  En teléfono tampoco: aquí no hay nada que avisar.
- **El nombre no es el link** y por eso no va subrayado. Va en negrita, que es lo
  que el sitio ya usa para separar sin meter un signo — el menú del nav, la
  franja del home. El link es el emblema.
- **No hay uno-a-la-vez ni cola.** Al contrario que el home, aquí sumarse *es* el
  gesto: dos emblemas encima son un resultado legal.
- **No publica `--ttx-ancla`.** El About no es página índice y su banda está mucho
  más abajo; si publicara, la gaveta de la merca aterrizaría contra una línea que
  ya no existe en la página siguiente. Lo que quede escrito es lo del catálogo o
  el home, que es exactamente lo que la gaveta quiere.
