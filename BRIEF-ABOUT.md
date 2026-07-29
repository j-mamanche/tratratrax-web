# About — brief y plan

Resultado de cinco rondas de preguntas, 2026-07-29. Mismo formato que
`BRIEF-HOME.md`: lo que está en "Cerrado" no se vuelve a discutir sin decirlo.

**Estado: implementado.** El widget vive en `src/widgets/about/`, se ve en
`/preview/about` y lo que se pega en Cargo está en
[cargo/snippets/about.md](cargo/snippets/about.md). Los emblemas son material de
relleno; falta el del sello.

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

Un solo bloque de texto en toda la página:

> **Sonic hustlers since 2020**
> Run by DJ Lomalinda, Nyksan and Verraco.

Nada más. Las citas de Bhabha **no se transcriben**; el third space se
demuestra, no se explica. Que `SONIC HUSTLERS` también pase por el lema del nav
es un eco buscado, no un choque.

### 3.2 El stack se invierte: el intersticio va abajo

```
REPOSO                          MANO EN UN NOMBRE (pasada rápida)
┌──────────────────────────┐    ┌──────────────────────────┐
│                          │    │   ✝◉✝        ✝◉✝         │
│                          │    │                          │
│      negro absoluto      │    │  negro    ✝◉✝            │  ← campo
│                          │    │                          │
├──────────────────────────┤    ├──────────────────────────┤
│ Sonic hustlers since 2020│    │ Sonic hustlers since 2020│
│ Run by LOMALINDA, NYKSAN │    │ Run by LOMALINDA, NYKSAN │  ← bisagra
│ and VERRACO.             │    │ and VERRACO.             │
├──────────────────────────┤    ├──────────────────────────┤
│                          │    │▓▓░░██▒▒░███▒▒░░▓▓█▒▒░░▓▓█│  ← la grieta
└──────────────────────────┘    └──────────────────────────┘
      barra de Cargo                  barra de Cargo
```

Es el mismo `crearStack(host, { banda: true })` de `stack.js`, con las filas
reasignadas. `tokens.css` ya pone `grid-row` a mano en las tres —precisamente
para poder moverlas— así que invertir es reasignar, no reescribir.

### 3.3 La mecánica

- **Reposo:** negro absoluto y la línea de texto. Ni una imagen, ni un loop, ni
  luz en la grieta. **Sin destello de ocio**, ni en teléfono. Quien no mueva la
  mano no ve nunca nada.
- **Hover sobre un nombre:** aparece el emblema de *ese* DJ en una **posición
  aleatoria** del campo.
- **Azar puro, con derecho a cortarse.** Sin retícula, sin zona segura, sin
  memoria de posición. Puede salir medio cortado por el borde, puede quedar en
  una esquina ridícula, dos pueden caer encima. Todos son resultados legales.
  Es el pop-up de los noventa: el kitsch entrando por el comportamiento.
- **Tamaño fijo.** El azar hace una sola cosa y por eso se lee.
- **Cada aparición vive su segundo** y se apaga sola, contando desde que nació,
  sin mirar a las otras. Pasada rápida → los tres a la vez en tres sitios,
  apagándose en el orden en que salieron. Pasada lenta → uno cada vez. **El
  ritmo de la mano es lo que compone**; la página no elige nada. No hay estado
  "abierto", no hay uno-a-la-vez, no hay cola ni piso de 100 ms — al contrario
  que el home (`home.js:229-231`), aquí sumarse *es* el gesto.
- **Mano quieta = se recicla.** Si el disparador sigue activo cuando el emblema
  muere, nace otro del mismo DJ en posición nueva. Sostener produce una ráfaga
  saltando por la pantalla, no una imagen congelada.
- **El santo es el link.** El nombre solo invoca; el que enlaza es el emblema:
  clic en el Divino Niño lleva al Instagram de Nyksan. Un link que hay que
  cazar, vivo un segundo, donde le da la gana.

### 3.4 La grieta: el aplastado

La grieta muestra **el mismo emblema comprimido a la fuerza en su altura, de
borde a borde**. Toda la información está ahí y la forma se perdió: queda una
barra de color irrepetible de esa imagen. `object-fit: fill` y ya.

Es la lectura literal del third space — *el hueco deforma lo que pasa por él*.

Con varios emblemas vivos la grieta muestra **el más reciente**; cuando muere,
cae al siguiente que siga vivo; sin ninguno, se apaga a negro. Cambia por corte
seco, como todo en la casa. Así la grieta sigue siendo **proyección de lo
activo** y no contenido propio (`stack.js:1-19`).

### 3.5 El color y el material

- Los emblemas entran **tal cual son**: el rosado, el celeste y el dorado de una
  estampa. **No** pasan por el filtro de dos tonos → `--ttx-visor-fx: none`.
- **El fondo no cambia nunca.** Negro en los tres estados. La página no se tiñe
  ni se ilumina. En un sitio que es blanco y negro en todas las demás pantallas,
  estas apariciones son lo único cromático — y eso impide que se confundan con
  contenido.
- **GIF de verdad**, con su tramado y sus 256 colores. El kitsch se mete en el
  pixel por la puerta del formato, no por decoración: es una consecuencia
  técnica, no un efecto.
- **Emblemas de relleno para arrancar**, marcados `"relleno": true` igual que
  `media/killing-mariposas.mp4` hoy (`home.md:152-153`). Se reemplazan cuando
  llegue el material del sello. Esto desbloquea el desarrollo hoy.

### 3.6 Teléfono y teclado

- **Teléfono: mantener el dedo**, como el título del home. Se sostiene sobre un
  nombre y el emblema está ahí, reciclándose; se suelta y vuelve el negro. Mismo
  reparto por `pointerType` de `home.js:339-382`.
- **Teclado: el emblema no muere mientras el nombre esté enfocado**, y no se
  recicla. Un link que vive un segundo y salta de sitio es inalcanzable con Tab;
  el teclado no es una mano y no puede "pasar". Filtrado por `:focus-visible`,
  como el home.
- **`prefers-reduced-motion: reduce`:** la aparición se queda —es un corte y la
  pide el usuario— pero **no hay reciclaje**, que es movimiento que nadie pidió.
  Y como un GIF animado no se puede pausar por CSS, ahí se sirve el cuadro fijo
  (`emblema.png`) en vez del GIF.

---

## 4. Cerrado — no volver a abrir

- El ensayo es **no verbal**. Sin manifiesto, sin citas transcritas.
- El copy es una sola línea: `Sonic hustlers since 2020 / Run by DJ Lomalinda,
  Nyksan and Verraco.`
- **El intersticio va abajo** y el visor baja con él.
- Un **emblema kitsch** por DJ, no un retrato. En GIF, a su color, tamaño fijo.
- **Azar puro** de posición, con derecho a cortarse. Sin retícula.
- **Cada aparición vive su propio segundo.** Se solapan si la mano es rápida.
- **Reposo: negro absoluto.** Sin destello de ocio, sin loop, sin luz.
- **El santo es el link**, no el nombre.
- El fondo no cambia de color nunca.

---

## 5. Implementación

### 5.1 Los datos — `data/about.json`

Ya contemplado en `PLAN.md:209`. La línea se **compone** desde el array para que
los nombres y sus disparadores tengan una sola fuente:

```json
{
  "lema": "Sonic hustlers since 2020",
  "djs": [
    { "nombre": "DJ Lomalinda", "instagram": "https://www.instagram.com/djlomalinda/",
      "emblema": "media/about/lomalinda.gif", "quieto": "media/about/lomalinda.png",
      "relleno": true },
    { "nombre": "Nyksan",  "instagram": "https://www.instagram.com/nyksan_/",  "…": "…" },
    { "nombre": "Verraco", "instagram": "https://www.instagram.com/verraco__/", "…": "…" }
  ]
}
```

El widget arma `Run by A, B and C.` desde el orden del array. Los GIF van en
`media/about/`, **nunca en `public/`** (`CLAUDE.md:25-28`);
`tools/build-widgets.mjs` ya copia `media/` a `public/`.

Esquema en `tools/validate.mjs`, que ya maneja archivos de datos opcionales
condicionalmente: exigir los tres DJs con `nombre`, `instagram`, `emblema` y
`quieto`, y avisar mientras algún `relleno` siga en `true`. El `quieto` quedó
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
| El stack de tres bandas | `crearStack(host, { banda: true, ancla: false })` — `stack.js` |
| El reparto ratón / tacto / teclado | el patrón de `home.js:339-382` |
| Texto oculto para lector de pantalla | `.ttx-oculto` — `catalogo.css:224-231` |
| El apagado de la grieta | `[data-ttx]:not([style*='--ttx-visor-img'])` — `tokens.css:201-203` |
| La precarga de los emblemas | `precargar()` — `stack.js` |
| Tokens, neutralización de Cargo, `reduced-motion` | `tokens.css` |
| Copia de `media/` y bundle IIFE | `tools/build-widgets.mjs` |

**La inversión del stack**, en `about.css`, todo bajo `[data-ttx="about"]`:

```css
.ttx-marco   { grid-template-rows: minmax(0,1fr) auto var(--ttx-visor-h); }
.ttx-contenido { grid-row: 1; }   /* el campo de apariciones */
.ttx-banda     { grid-row: 2; }   /* la bisagra: la línea de texto */
.ttx-visor     { grid-row: 3; }   /* la grieta */
```

El orden del **DOM** no cambia —lo pone `crearStack`— y eso es lo que hace que
del nombre se tabule al emblema: la banda va antes del campo.

Host: `--ttx-papel: #000`, `--ttx-tinta: #fff`, `--ttx-visor-fx: none`,
`--ttx-visor-h: clamp(18px, 3.5vh, 40px)` (la grieta es lo más chico de la
pantalla). Todo calibrable **desde el placeholder de Cargo**, no editando el
widget (`CLAUDE.md:66-68`).

**Dos detalles de z-order y recorte que resuelven requisitos opuestos:**

- `.ttx-marco` ya trae `overflow: hidden` (`tokens.css:136`) → el emblema se
  corta contra el marco **gratis**. Eso es el "derecho a cortarse".
- El emblema se posiciona `absolute` en el campo con `overflow: visible`, así
  puede pisar la línea de nombres — pero se pinta **detrás de la banda**
  (`z-index` menor). Si se pintara encima, taparía su propio disparador y el
  nombre quedaría inalcanzable. Visualmente choca; funcionalmente no estorba.

La posición se escribe como **el centro, en porcentaje del campo** (dos
variables, `left`/`top` y un `translate(-50%,-50%)`). Que sea el centro es lo que
le da el derecho a cortarse; que sea porcentaje evita medir el campo en cada
aparición y de paso el emblema no se descoloca si la ventana cambia de tamaño
mientras vive.

**Marcado:** cada nombre es un `<button>` de verdad (el teclado sale gratis, como
el título del home). Cada emblema es un `<a target="_blank" rel="noopener">` con
el GIF dentro y un `.ttx-oculto` que diga *"Nyksan on Instagram"*.

**El ciclo de vida**, sin cola y sin estado global: cada aparición agenda su
propia muerte a `VIDA` ms; al morir, si su disparador sigue activo, siembra la
siguiente en posición nueva. `VIDA` calibrable por `data-vida`, igual que
`data-minimo` en el home.

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
invertido la banda queda mucho más abajo — y el `<html>` **sobrevive a la
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
mecánica de una pasada, reciclaje con la mano quieta, tres apariciones a la vez y
su orden de apagado, el relevo y el apagado de la grieta, el tacto, que el santo
encima del nombre no le quita el clic al nombre, el orden de tabulación
nombre → emblema, el link y su nombre accesible, las dos variantes de
`prefers-reduced-motion` (PNG y sin reciclaje) y que no se publique
`--ttx-ancla`.

Lo que **hay que mirar con la mano y en un teléfono de verdad**:

1. `npm run validate` — falla si falta un DJ o un emblema; avisa mientras haya
   `relleno: true`.
2. `npm run build` y abrir `/preview/about`.
3. **Escritorio:** pasar la mano por los tres nombres despacio (uno cada vez) y
   rápido (los tres a la vez, en tres sitios, apagándose en orden). Dejar la mano
   quieta encima de uno → ráfaga reciclándose. Confirmar que la posición nunca se
   repite y que algún emblema sale cortado por el borde.
4. **La grieta:** que muestre el más reciente, aplastado de borde a borde, y que
   caiga al siguiente vivo al morir. Que se apague a negro sin ninguno.
5. **El link:** clic en un santo abre el Instagram correcto en pestaña nueva.
6. **Teclado:** Tab hasta un nombre → el emblema sale y **no** se va; Tab otra
   vez lo alcanza; Enter navega. Nada de esto necesita ratón.
7. **Teléfono** (dispositivo real, no solo modo responsive): mantener el dedo →
   ráfaga; soltar → negro. Confirmar que no hay destello de ocio.
8. **`prefers-reduced-motion: reduce`** en devtools: la aparición sigue, no hay
   reciclaje, y se sirve el PNG en vez del GIF.
9. **Reposo:** cargar la página y no tocar nada durante un minuto. Tiene que
   quedarse absolutamente negra y quieta.
10. **El ancla:** navegar del About a merca y abrir una gaveta; que no se
    desalinee.
