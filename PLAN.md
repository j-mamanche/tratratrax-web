# TraTraTrax 2026 — Plan de arquitectura

Fecha: 2026-07-27
Estado: plan aprobado para arrancar. Repo aún sin inicializar.

---

## 0. Decisiones cerradas

| Tema | Decisión |
|---|---|
| Host del sitio | **Cargo.site se queda.** No migramos. |
| Stack del repo | **Astro** como workbench y build; los widgets que corren dentro de Cargo son JS sin framework. |
| Fuente de verdad | **JSON versionado en git.** El HTML se genera, nunca se edita a mano. |
| Player de audio | **No hay.** Solo información + un link externo a Bandcamp por release. |
| Merca | **Vitrina.** Enlaza afuera. Sin checkout propio por ahora. |
| Tipografía | La de Cargo. No es tema. |
| Idiomas | Decisión editorial (mezcla ES/EN deliberada), no hay selector ni i18n técnico. **En revisión desde 2026-08-21: ver `PLAN-IDIOMAS.md`, que propone lo contrario y todavía no está decidido.** |
| Diseño / código | Silvi diseña, tú programas. |
| Landing de caña de azúcar | Fase 2. No entra en este plan. |

---

## 1. El problema real: el scroll horizontal

Hoy el catálogo se hace metiendo el contenido en columnas de Cargo, aplicándoles el efecto **marquee**, y luego neutralizando el movimiento para que solo se mueva con el dedo. De ahí salen los tres síntomas:

1. **Es finicky.** El marquee está peleando contra el gesto del usuario; nunca va a sentirse natural porque no está hecho para eso.
2. **Sincronía.** Cargo no renderiza todos los stacks a la vez cuando son muchos, así que el contenido aparece y desaparece de forma impredecible.
3. **No es editable sin miedo.** Cualquiera que toque las columnas rompe el efecto.

**Todo esto desaparece si el catálogo deja de ser markup de Cargo y pasa a ser un solo `<div>` que nosotros llenamos.**

La técnica correcta, sin marquee y sin columnas:

```css
.ttx-catalogo {
  display: flex;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.ttx-catalogo > * { scroll-snap-align: start; flex: 0 0 auto; }
```

Eso ya te da, gratis y nativo: gesto de dedo en móvil con inercia real, trackpad horizontal de dos dedos en Mac, y scrollbar oculta. Encima le montamos en JS solo tres cosas que el navegador no da:

- **Drag con mouse** (pointer events) para desktop con ratón.
- **Rueda vertical → desplazamiento horizontal**, para quien usa mouse de rueda.
- **Flechas del teclado**, que además arregla accesibilidad.

Y el problema de sincronía se resuelve solo: como nosotros generamos el DOM desde el JSON, están todos los releases siempre, y las carátulas cargan con `loading="lazy"`.

**El acordeón de las refs** (la banda que se abre y empuja a las demás) se hace con una transición de `flex-basis` sobre el elemento activo. Un solo estado: `data-open="tra031"` en el contenedor. Nada de altura calculada en JS.

---

## 2. Arquitectura: la línea entre Cargo y el repo

La regla es una sola: **Cargo pone el cascarón, nosotros ponemos el contenido.**

```
┌─ CARGO ────────────────────────────────────────────┐
│  · dominio, hosting, fuentes                       │
│  · el chrome del sitio (barra inferior, menú)      │
│  · una línea en el HTML global:                    │
│      <script src="…/ttx.js" defer></script>        │
│  · en cada página, UN placeholder:                 │
│      <div data-ttx="catalogo"></div>               │
└────────────────────────────────────────────────────┘
                        ↑ lee
┌─ ESTE REPO (GitHub Pages) ─────────────────────────┐
│  · ttx.js  + ttx.css   ← los widgets               │
│  · data/*.json         ← el contenido              │
│  · /panel              ← la herramienta del equipo │
│  · /preview            ← galería de widgets        │
└────────────────────────────────────────────────────┘
```

**La consecuencia importante:** si los datos también se sirven desde aquí, publicar un release nuevo **no requiere entrar a Cargo nunca**. El equipo edita en el panel → se guarda el JSON en git → el sitio ya lo muestra. Cargo solo se toca cuando nace una *página* nueva, que pasa una o dos veces al año.

Esto es lo que hoy no existe y es el 80% del valor de todo el proyecto.

### Hosting y caché

GitHub Pages para todo, desplegado por GitHub Actions en cada push a `main`. Un solo origen, sin sorpresas de caché.

> jsDelivr, que era el plan anterior, cachea 12h el contenido de una rama. Sirve para el bundle de código pinneado a un tag, pero es una trampa para los datos: publicas un release y no aparece hasta mañana. Por eso Pages.

Los widgets se pinnean por versión en el HTML global (`ttx.js?v=3`) para que un bug nuestro nunca tumbe el sitio en vivo; los datos van siempre frescos.

### El loader

Un detalle que decide si esto funciona: **Cargo navega por AJAX**. Si el loader solo escucha `DOMContentLoaded`, los widgets aparecen en la primera carga y nunca más. Necesita un `MutationObserver` que monte y desmonte al vuelo. Es el bug clásico de este enfoque y hay que resolverlo el primer día, no el último.

### CSS

Todo el CSS de widget va scopeado bajo `[data-ttx]`, nunca global. El CSS de Cargo es agresivo y pisa estilos; y al revés, un widget nuestro no puede romper una página donde el equipo lo pegue.

---

## 3. Modelo de datos

Se conserva lo que ya habíamos cerrado, con dos adiciones.

```jsonc
// data/artists.json
[{ "slug": "ehua", "display": "Ehua" }]

// data/releases.json
[{
  "catalog": "TRA031",
  "album": "Pyrexia",
  "artists": ["ehua", "flore"],
  "date": "2026-04-30",
  "bcImageId": "a750972864",
  "bandcampUrl": "https://tratratrax.bandcamp.com/album/pyrexia",
  "credits": [
    { "role": "Catalog", "name": "TRA031" },
    { "role": "Mastering", "name": "Beau Thomas at Ten Eight Seven" }
  ],
  "note": "All NRG programmed by Ehua, Flore, dBridge, Martyn between London, Lyon, Phuket, and Washington D.C.",
  "order": 31,
  "visible": true
}]
```

Recordatorios de las decisiones ya tomadas: `slug` y `display` son campos distintos (los guiones de `Anthony-Naples` son estética, van en `display`); no hay páginas por artista, el artista solo es filtro; no hay estados comerciales (upcoming/preorder/sold out).

**Adición 1 — el texto editorial sale del panel del release.** Como quedamos: se muestran créditos, nota y link. El párrafo largo de las refs no va. Si más adelante lo quieres, el campo `blurb` ya cabe en el esquema sin migrar nada.

**Adición 2 — campos de control.** `order` y `visible` existen para que el panel pueda reordenar y despublicar sin borrar. Es lo que pediste de "controlar variables por pantalla".

```jsonc
// data/merch.json
[{
  "slug": "beach-towel-ananay",
  "title": "Beach Towel",
  "subtitle": "\"Añañay\"",
  "image": "…",
  "url": "https://…",          // el link externo
  "stock": "in",                // "in" | "few" | "out"  ← el semáforo
  "order": 1,
  "visible": true
}]
```

El semáforo hoy vive en dos sitios que se desincronizan: los tags de Cargo pintan el punto en la grilla, pero dentro de cada producto el estado está escrito a mano otra vez. **Con un solo campo `stock` en el JSON, los dos se pintan del mismo dato.** Ese bug se muere aquí.

### El formato `Rol__ Valor`

Se conserva como formato de **salida**, no de almacenamiento. En el JSON los créditos son objetos; el renderer los serializa a `Mastering__ Beau Thomas…` para que la pantalla se vea idéntica a hoy. Así el formato bonito sobrevive sin que nadie tenga que parsear texto libre.

---

## 4. La herramienta (`/panel`)

Esto es lo que pediste con más énfasis, así que lo especifico completo.

Es una página estática del mismo repo. Se abre en el navegador, sin instalar nada.

**Qué hace:**

1. **Lee el JSON actual** del repo y lo muestra como listas ordenables por sección: Releases · Merca · Blog · Bandas del home.
2. **Formularios por tipo.** Un release nuevo es un formulario, no un pedazo de HTML.
3. **Valida antes de dejar guardar:** número de catálogo duplicado, fecha inválida, artista que no existe en `artists.json`, carátula que no resuelve, link roto. Esto es el "control sobre la información" — hoy no hay nada que impida meter basura.
4. **Preview en vivo.** El widget real, con los datos que estás editando, al lado del formulario. Ves el resultado antes de publicar.
5. **Controles de estado por pantalla:** el semáforo de stock, el orden, visible/oculto, cuál banda del home es la activa. Toggles, no código.
6. **Publica.** Fase 1: descarga el JSON y tú haces commit. Fase 2: el panel commitea solo contra la API de GitHub con un token de permisos mínimos, y el equipo nunca ve git.
7. **Genera instrucciones cuando sí hace falta tocar Cargo.** Para el caso raro de página nueva: el snippet exacto a pegar y los pasos, generados, no recordados de memoria.

**Por qué versionado sale gratis:** como todo es JSON en git, cada cambio es un commit con autor y fecha. Se puede ver qué cambió, quién, y revertir. Eso hoy no existe: hoy alguien edita el HTML dentro de Cargo y lo anterior se perdió.

---

## 5. Importar desde Bandcamp

**Sí se puede, y no es difícil.** Cada página de álbum de Bandcamp trae los datos ya estructurados en el propio HTML: un atributo `data-tralbum` con JSON (título, artista, tracks, fecha, id de carátula) y un bloque `application/ld+json`. No hace falta API ni scraping frágil de selectores CSS.

La única restricción es CORS: el navegador no puede pedirle a Bandcamp directamente, así que el importador es un script de Node, no un botón del panel:

```
npm run import -- https://tratratrax.bandcamp.com/album/pyrexia
```

Te devuelve el objeto del release casi completo — título, artistas, fecha, `bcImageId`, url — y te deja rellenar a mano solo lo que Bandcamp no sabe: número de catálogo, créditos y nota.

Eso convierte "copiar y pegar campo por campo desde Bandcamp" en un comando. Es probablemente la automatización con mejor relación esfuerzo/beneficio de todo el proyecto.

---

## 6. Estructura del repo

```
tratratrax-web/
├── README.md                 # cómo correr, cómo publicar
├── CLAUDE.md                 # contexto para mí en sesiones futuras
├── package.json
├── astro.config.mjs
│
├── data/                     # ← LA FUENTE DE VERDAD
│   ├── site.json             # chrome: menú, footer, manifiesto
│   ├── artists.json
│   ├── releases.json
│   ├── merch.json
│   ├── home.json             # las bandas: media + textos
│   ├── about.json
│   └── posts/*.md
│
├── src/
│   ├── widgets/              # lo que corre DENTRO de Cargo
│   │   ├── _runtime/
│   │   │   ├── mount.js      # loader + MutationObserver
│   │   │   ├── hscroll.js    # el scroll horizontal, reusable
│   │   │   └── format.js     # Rol__ Valor, fechas, slugs
│   │   ├── catalogo/
│   │   ├── merca/
│   │   ├── home-bandas/
│   │   └── tokens.css        # todo scopeado a [data-ttx]
│   │
│   ├── pages/                # el workbench (Astro, no va a Cargo)
│   │   ├── index.astro       # galería de widgets
│   │   ├── preview/[w].astro # widget aislado con datos reales
│   │   └── panel/            # la herramienta
│   └── lib/
│       └── schema.js         # validación compartida panel ↔ scripts
│
├── tools/
│   ├── bandcamp-import.mjs
│   └── validate.mjs          # corre en CI: JSON inválido = build roja
│
├── cargo/                    # espejo de lo que vive dentro de Cargo
│   ├── global.html           # el HTML global, versionado
│   ├── global.css
│   ├── snippets/             # generados: qué pegar en cada página
│   └── snapshots/
│       └── 2026-07-27/       # ← lo que ya tienes en cargo-snapshot/
│
└── assets/
    └── media.json            # manifiesto de imágenes y video con sus URLs
```

Dos notas sobre esto:

- **`cargo/` no es decoración.** Es el único backup posible de lo que vive dentro de Cargo, que no tiene historial propio. Cada vez que se toque algo allá, se actualiza aquí. El snapshot que ya hiciste hoy es la primera entrada.
- **`data/` y `src/` están separados a propósito.** El equipo solo necesita entender `data/`. Nunca tienen razón para abrir `src/`.

---

## 7. Fases

**Fase 0 — cimientos (primero, y rápido)**
Inicializar git, montar Astro, migrar el snapshot a `cargo/snapshots/`, escribir el esquema JSON, y convertir el catálogo actual de HTML a `releases.json`. Al terminar esta fase todavía no cambió nada en el sitio, pero ya hay fuente de verdad.

**Fase 1 — el catálogo, que es lo difícil**
El widget de catálogo completo: scroll horizontal nativo, acordeón, panel de release con créditos y link a Bandcamp. Se monta en la página de catálogo de Cargo reemplazando las columnas con marquee. Esto solo ya justifica el proyecto.

**Fase 2 — el resto de pantallas**
Merca (con el semáforo de un solo dato), las bandas del home, About.

**Fase 3 — la herramienta**
El panel con formularios, validación y preview. Primero exportando JSON, después commiteando solo.

**Fase 4 — el blog**
Está en placeholder; entra cuando haya contenido real que justifique la estructura.

El orden no es arbitrario: la Fase 1 es la que valida que todo el enfoque funciona dentro de Cargo. Si el acordeón se pelea con el CSS global de Cargo, quiero saberlo en la semana 1, no en el mes 3.

---

## 8. Lo que necesito de ti

1. **Acceso a Cargo.** Sigue pendiente. Sin poder pegar el script del loader en el HTML global, nada de esto se enciende. Es el único bloqueo duro.
2. **Los links del media** conforme los vayas subiendo — los organizo en `assets/media.json`.
3. **Confirmar que el release solo muestra créditos + link.** En la ref de Pyrexia hay un párrafo editorial largo, `CRÉDITOS`, `PURCHASE` y `LISTEN`. Entendí: fuera el párrafo, fuera `LISTEN`, queda un solo link a Bandcamp. Si es así, lo dejo así.
4. **Una decisión de disco.** El volumen externo es exFAT: git funciona pero sin permisos de archivo y sin distinguir mayúsculas, lo que muerde tarde y de formas raras. Recomiendo el repo en el disco interno y el externo solo para assets pesados.
