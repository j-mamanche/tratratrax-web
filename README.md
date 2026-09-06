# TraTraTrax — web

Contenido, widgets y herramientas del sitio de TraTraTrax.

El sitio vive en **Cargo.site**. Este repo no lo reemplaza: le pone el contenido.
Cargo aporta el dominio, las fuentes y el cascarón; todo lo que es catálogo,
merca y datos se genera desde aquí.

La arquitectura completa y el porqué de cada decisión están en **[PLAN.md](PLAN.md)**.

---

## Empezar

```bash
npm install
npm run dev        # abre el tablero de datos en localhost:4321
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el tablero de estado de los datos |
| `npm run validate` | Revisa `data/*.json` — errores y avisos |
| `npm run build:widgets` | Compila los widgets a `public/` |
| `npm run build` | Valida, compila widgets y sitio (falla si hay errores) |
| `npm run import -- <url>` | Trae un release desde Bandcamp |
| `npm run dev:panel` | Levanta el panel de edición en localhost:4322 |
| `npm run build:panel` | Compila el panel para Netlify (no valida: ver abajo) |

---

## El widget del home

Se ve en **`/preview/home`**. Es el lanzamiento y nada más. En reposo no hay
composición: hay una **cenefa** —el video ocupando solo la franja del título, de
borde a borde, sobre negro— con el nombre del disco encima. Tomar la franja con
la mano abre esa grieta en los dos módulos del lanzamiento: el arte y el video,
uno arriba y otro abajo. Al soltar se vuelve a cerrar, y la pasada siguiente
abre la composición contraria. Cada apertura sortea además dónde cae el
**gooey**, el filtro que funde las formas del arte.

**El destacado es un release del catálogo.** `data/home.json` solo guarda la
política —`fijo` con un id, o `auto`, que sortea entre los que cumplen— y el
material vive en el bloque `home` de ese release. La franja dice el disco y
quién, ofrece `BUY` y `LISTEN` con la mano encima, y su texto lleva al release
abierto en el catálogo. Si el destacado falla, el home cae al release visible
más reciente. Qué se pega en Cargo y cómo se calibra:
**[cargo/snippets/home.md](cargo/snippets/home.md)**.

## El widget del about

Se ve en **`/preview/about`**. Es el mismo stack **sin visor**: una barra de
texto arriba y el gris del chrome debajo. En reposo son las tres sílabas de
`TRA · TRA · TRAX` abiertas a lo ancho —**la grieta**— y, contra el borde
derecho, `A RECORD LABEL RUN BY__ DJ LOMALINDA / NYKSAN / VERRACO`. Ni imagen,
ni loop, ni destello: quien no mueva la mano no ve nunca nada.

Pasar la mano por la grieta **la cierra**, y en el espacio que sueltan las
sílabas entra el resto de la línea: el lema, las tres redes del sello y el
correo de bookings. Pasarla por un nombre invoca el emblema kitsch de ese DJ en
una posición **aleatoria de toda la ventana**, que se queda quieto mientras haya
mano y dura segundo y medio más. **El santo es el link:** el que lleva al
Instagram es el emblema, no el nombre.

Sale de `data/about.json`. El ensayo del *third space* es no verbal a propósito:
no hay manifiesto ni citas. El acuerdo está en **[BRIEF-ABOUT.md](BRIEF-ABOUT.md)**
y lo que se pega en Cargo en **[cargo/snippets/about.md](cargo/snippets/about.md)**.

## El widget de catálogo

Se ve corriendo, con los datos reales y el mismo bundle que carga Cargo, en
**`/preview/catalogo`** (`npm run dev` y abrir esa ruta).

Es el stack de tres bandas: **visor** arriba (la carátula del ítem activo,
difuminada e invertida de luminosidad), la franja de **etiquetas** en la
mitad, y el **carril** de carátulas abajo. Al hacer clic en una etiqueta el
release se abre y empuja a los demás; el visor sigue a lo que cruza el centro
del carril.

Qué se pega en Cargo y cómo se calibra sin tocar código:
**[cargo/snippets/catalogo.md](cargo/snippets/catalogo.md)**.

## La merca

Es la única pantalla que **no** es un widget: la vitrina y las fichas son
páginas de Cargo, con su `gallery-grid` y sus `column-set`, para que el
equipo las edite sin pasar por el repo. Lo que ponemos nosotros es el CSS
—uno solo, global, que se aplica por llevar la banda y no por id de página—
y el ancla.

El ancla es lo que la ata al resto del sitio: la gaveta no flota a una altura
propia, **cuelga de la barra de la mitad**. El widget del stack mide su banda
y publica `--ttx-ancla`; el CSS de Cargo la lee. Mover el visor mueve la
merca con él.

Qué se pega y por qué: **[cargo/snippets/merca-estado.md](cargo/snippets/merca-estado.md)**.

> **No hay preview de la merca.** Hubo un `/preview/merca.astro` que importaba
> tres snippets que nunca se escribieron (`merca.css`, `merca-grid.html`,
> `merca-item.html`), así que la ruta daba 500 y `npm run build` fallaba ahí.
> Se borró. Cuando los snippets existan, el preview se vuelve a escribir — el
> archivo viejo no vale la pena rescatarlo, era andamio sin nada que sostener.

```
src/widgets/
├── index.js            Entrada del bundle
├── tokens.css          Variables y el stack. Todo scopeado a [data-ttx]
├── _runtime/
│   ├── mount.js        Loader + MutationObserver (Cargo navega por AJAX)
│   ├── datos.js        Un solo fetch de data/*.json por página
│   ├── stack.js        Visor · banda · contenido, y la proyección
│   ├── hscroll.js      Arrastre, rueda y flechas. El resto es nativo
│   ├── format.js       Rol__ Valor, la regla de las juntas, el home del catálogo
│   ├── filtro.js       Los filtros SVG: la estampa del visor y el gooey
│   └── dom.js          `elemento()`, lo único que hace falta sin framework
├── catalogo/           El carril y el acordeón
├── home/               El lanzamiento y su intercambio
└── about/              La grieta y las apariciones
```

## El nav y la bandera

El nav **no es un widget**: es una página de Cargo con su CSS y tres scripts en
el HTML global —el lema que se hackea, el blanco/negro automático y la bandera—.
Todo está anotado, con el porqué de cada decisión, en
**[cargo/snippets/nav.md](cargo/snippets/nav.md)**, y se puede probar sin tocar
el sitio abriendo `cargo/snippets/nav-preview.html` con doble clic.

`MENU__ ABOUT CATALOG MERCA BLOG`, con la página actual en itálica. Pasar la
mano por el logo tapa la página con una de las cuatro banderas del sello
—`media/banderas/`— menos el nav, que se queda encima y legible. Y fuera del
home, con el usuario quieto, cada 20–40 s una se asoma sola un instante.

---

## Agregar un release

Bandcamp ya tiene casi todo, así que no se escribe a mano:

```bash
npm run import -- https://tratratrax.bandcamp.com/album/pyrexia --append
npm run validate
```

De ahí sale el título, los artistas, la fecha, la carátula, los créditos y el
número de catálogo. **Lo único que hay que poner a mano es `listenUrl`**, el
linktree — Bandcamp no lo sabe.

Sin `--append` el release se imprime en pantalla en vez de guardarse, que es
útil para revisarlo antes.

Para traer una discografía entera de una vez:

```bash
npm run import -- https://tratratrax.bandcamp.com/music
```

> Ojo: la página `/music` del sello **no lista todo**. Los releases alojados en
> el Bandcamp del artista solo aparecen si están etiquetados con el sello. Seis
> del catálogo actual no salen ahí y hubo que importarlos por URL individual.

### Por qué el importador corre en Node y no en el navegador

Bandcamp no manda cabeceras CORS, así que un `fetch` desde una página web sería
bloqueado. No hace falta API ni token: los datos están en el HTML de la página.

---

## Cómo están escritos los créditos

El sello ya usa la convención `Rol__ Valor` en Bandcamp, así que el importador
los guarda estructurados:

```json
"credits": [{ "role": "Mastering", "name": "Beau Thomas at Ten Eight Seven" }]
```

Se guardan como objetos y se renderizan como `Mastering__ Beau Thomas…`.

`credits` es **una lista ordenada con dos clases de entrada**: la junta
`{ role, name }`, que se pinta con la raya del sello, y la línea suelta
`{ texto }` —«All NRG programmed by…», la nota con asterisco— que cierra el
bloque sin rotular nada. El orden del archivo es el orden en pantalla.

El panel edita eso como un solo bloque de texto, que es como el sello lo tiene
escrito cuando lo copia de un correo o de Bandcamp; `src/lib/creditos.mjs` lo
convierte en las dos direcciones y el viaje es estable.

`note`, donde antes vivía la línea suelta, ya no se escribe. El widget lo sigue
leyendo por si queda algún dato viejo sin migrar, y el panel lo pliega dentro
del bloque en cuanto alguien toca esos créditos.

---

## Mapa del repo

```
data/        La fuente de verdad. Es lo único que el equipo necesita entender.
media/       El material propio: el video del home, los emblemas del about y
             las carátulas que no vienen de Bandcamp. Se versiona; `public/`
             es generado y se borra
             entera en cada compilación, así que ahí no puede vivir.
src/widgets/ Lo que corre DENTRO de Cargo: JS sin framework, CSS scopeado.
src/pages/   El taller público: tablero de datos y previews de los widgets.
src/panel/   El panel de edición del sello (SSR, va a Netlify).
src/lib/     Lo que comparten el panel y la línea de comandos: GitHub, sesión,
             Bandcamp y el modelo de datos.
tools/       Importador de Bandcamp y validador.
cargo/       Espejo versionado de lo que vive dentro de Cargo.
```

`cargo/` no es decoración: Cargo no tiene historial propio, así que este es el
único backup de su HTML y CSS. Cada vez que se toque algo allá, se actualiza acá.

---

## El panel de edición — «TraTraTrax Studio»

De cara al sello la herramienta se llama **TraTraTrax Studio**. `panel` es el
nombre de la carpeta y de la configuración de Astro, y se queda así; lo que no
se queda es «panel» en un texto que vaya a leer alguien del sello.

Un segundo build del mismo repo, con adaptador SSR, en un subdominio con
contraseña. Sirve para que el sello publique un lanzamiento entero —arte,
video, texto, links, destacado en el home— sin tocar el repo ni Cargo.

```
admin.tratratrax.xx  (Netlify, SSR)
  └ una contraseña, cookie firmada HttpOnly + SameSite=Strict
       └ editar → POST /api/guardar
            └ Contents API de GitHub: commit a main, con el sha
                 └ Actions → Pages → Cargo ve el dato nuevo
```

Dos pantallas: **catálogo** y **home**. Y `/vista`, que monta **los widgets de
verdad** sobre el borrador que hay en la pestaña — no una maqueta: el mismo
`ttx.js` que se pega en Cargo, con el `fetch` cambiado por debajo.

Los **artistas no tienen pantalla propia**: no son algo que el sello
administre, son un campo del lanzamiento. Se crean escribiendo el nombre en la
ficha y se corrigen tocándolo. El slug y los alias de Bandcamp —que son lo que
evita que el importador duplique a alguien— se mantienen solos y no se
enseñan: quien está arreglando una tilde no tiene por qué enterarse de que
existe una llave interna.

**Guardar es uno solo**, arriba junto a Salir. Manda los archivos que hayan
cambiado, estés en la pantalla que estés — antes había un botón por pantalla y
había que acordarse de pasar por las dos si habías tocado las dos.

**No hay tablero.** Lo que el validador avisa no se pinta en ninguna lista: en
el carril, un punto gris dice «le falta información» y uno rojo «así no se
publica», y lo que hay que hacer se lee en el campo vacío. Los avisos siguen
saliendo en `npm run validate`, que es donde sirven.

Para levantarlo en local: `cp .env.example .env`, llenarlo, `npm run dev:panel`.
Ahí están explicadas las cinco variables; el token de GitHub es un PAT
fine-grained con `contents: write` y **solo** sobre este repo.

**El panel no corre el validador al compilar**, y eso es a propósito: es la
herramienta con la que se arreglan los datos que el validador rechaza, así que
su despliegue no puede depender de que estén buenos. Lo que sí hace es revisar
antes de commitear —los mismos errores, sobre el modelo completo— para que no
llegue a `main` nada que después vaya a tumbar el build de Pages.

**Lo que el panel no edita:** el About y las banderas. Son decisiones de diseño
escritas a mano, no material que rote.

---

## Publicar

Push a `main` → GitHub Actions compila y publica en GitHub Pages. Cargo carga el
bundle desde ahí, así que **publicar contenido nuevo no requiere entrar a Cargo**.
Solo se toca Cargo cuando nace una página nueva.

Son **dos destinos y un solo repo**: `astro.config.mjs` compila el sitio
público estático a Pages (lo que Actions publica), y `astro.config.panel.mjs`
compila el panel SSR a Netlify (`netlify.toml`). No se pisan porque Astro solo
mira `<srcDir>/pages`: `src/pages` es el taller público y `src/panel/pages` es
el panel.
