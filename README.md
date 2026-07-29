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

---

## El widget del home

Se ve en **`/preview/home`**. Es el lanzamiento y nada más. En reposo no hay
composición: hay una **cenefa** —el video ocupando solo la franja del título, de
borde a borde, sobre negro— con el nombre del disco encima. Tomar el título con
la mano abre esa grieta en las dos cajas del lanzamiento: la carátula y el
video, una arriba y otro abajo. Al soltar se vuelve a cerrar, y la pasada
siguiente abre la composición contraria.

Sale de `data/home.json`, con respaldo automático al release más reciente si no
hay destacado. Qué se pega en Cargo y cómo se calibra:
**[cargo/snippets/home.md](cargo/snippets/home.md)**.

## El widget del about

Se ve en **`/preview/about`**. Es el mismo stack, **invertido**: el intersticio
va abajo. En reposo es negro absoluto con un solo renglón de texto —*Sonic
hustlers since 2020 / Run by DJ Lomalinda, Nyksan and Verraco.*— y nada más: sin
imagen, sin loop, sin destello. Pasar la mano por un nombre invoca el emblema
kitsch de ese DJ en una posición **aleatoria**, que vive un segundo y se apaga
sola; la grieta de abajo lo muestra aplastado de borde a borde. **El santo es el
link:** el que lleva al Instagram es el emblema, no el nombre.

Sale de `data/about.json`. El ensayo del *third space* es no verbal a propósito:
no hay manifiesto ni citas. El acuerdo está en **[BRIEF-ABOUT.md](BRIEF-ABOUT.md)**
y lo que se pega en Cargo en **[cargo/snippets/about.md](cargo/snippets/about.md)**.

> Los tres emblemas de hoy son **relleno** —estampas generadas, marcadas
> `RELLENO` en la imagen— para poder calibrar sin esperar al sello. Se
> reemplazan sobreescribiendo los seis archivos de `media/about/`.

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

Se ve, con el home corriendo detrás, en **`/preview/merca`** (`?ver=item`
abre la ficha, `?stock=out-of-stock` la pone agotada).

Es la única pantalla que **no** es un widget: la vitrina y las fichas son
páginas de Cargo, con su `gallery-grid` y sus `column-set`, para que el
equipo las edite sin pasar por el repo. Lo que ponemos nosotros es el CSS
—uno solo, global, que se aplica por llevar la banda y no por id de página—
y el ancla.

El ancla es lo que la ata al resto del sitio: la gaveta no flota a una altura
propia, **cuelga de la barra de la mitad**. El widget del stack mide su banda
y publica `--ttx-ancla`; el CSS de Cargo la lee. Mover el visor mueve la
merca con él.

Qué se pega y por qué: **[cargo/snippets/merca.md](cargo/snippets/merca.md)**.

```
src/widgets/
├── index.js            Entrada del bundle
├── tokens.css          Variables y el stack. Todo scopeado a [data-ttx]
├── _runtime/
│   ├── mount.js        Loader + MutationObserver (Cargo navega por AJAX)
│   ├── datos.js        Un solo fetch de data/*.json por página
│   ├── stack.js        Visor · banda · contenido, y la proyección
│   ├── hscroll.js      Arrastre, rueda y flechas. El resto es nativo
│   ├── format.js       Rol__ Valor, fechas, URLs de carátula
│   └── dom.js          `elemento()`, lo único que hace falta sin framework
├── catalogo/           El carril y el acordeón
├── home/               El lanzamiento y su intercambio
└── about/              El stack invertido y las apariciones
```

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

Se guardan como objetos y se renderizan como `Mastering__ Beau Thomas…`. El
formato bonito es de **salida**, no de almacenamiento — así nadie tiene que
parsear texto libre para cambiar un dato.

Los releases viejos escribieron los créditos como texto corrido. En esos casos
todo queda en `note` y se pueden ir pasando a `credits` con calma. El tablero de
`npm run dev` lista cuáles faltan.

---

## Mapa del repo

```
data/        La fuente de verdad. Es lo único que el equipo necesita entender.
media/       El material propio: el video del home, los emblemas del about y
             las carátulas que no vienen de Bandcamp. Se versiona; `public/`
             es generado y se borra
             entera en cada compilación, así que ahí no puede vivir.
src/widgets/ Lo que corre DENTRO de Cargo: JS sin framework, CSS scopeado.
src/pages/   El taller: tablero, previews y (pronto) el panel de edición.
tools/       Importador de Bandcamp y validador.
cargo/       Espejo versionado de lo que vive dentro de Cargo.
```

`cargo/` no es decoración: Cargo no tiene historial propio, así que este es el
único backup de su HTML y CSS. Cada vez que se toque algo allá, se actualiza acá.

---

## Publicar

Push a `main` → GitHub Actions compila y publica en GitHub Pages. Cargo carga el
bundle desde ahí, así que **publicar contenido nuevo no requiere entrar a Cargo**.
Solo se toca Cargo cuando nace una página nueva.
