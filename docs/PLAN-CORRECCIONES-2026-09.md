# Correcciones del sitio y TraTraTrax Studio

Fecha: 24 de septiembre de 2026. Actualizado tras la auditoría del sitio publicado. Documento de ejecución por prompts.

## Cómo usar este plan

P0 ya produjo un diagnóstico público reproducible y P1 quedó implementado y verificado en el repo; sus límites y medidas están abajo. Después seguir el orden de dependencias de la tabla. Cada prompt pide un cambio acotado, evidencia y archivos concretos. Pegar **un prompt por sesión o tarea** y entregar al siguiente la nota de cierre del anterior. Los cambios en Cargo requieren comprobar de nuevo la versión publicada antes de editar: `cargo/snapshots/2026-07-27/` es histórico y `cargo/snippets/` contiene instrucciones que podrían no estar aplicadas. No dar por publicado lo que solo existe en el repo. Conservar la fuente de verdad en `data/*.json` para los widgets que ya la usan, el CSS de widgets bajo `[data-ttx]`, y las reglas de `CLAUDE.md`. **La merca actual es la excepción operativa: vitrina y fichas se editan directamente en Cargo; este plan no presupone una migración a Studio.** Las fichas de merca siguen en construcción: no corregir títulos, descripciones, precios ni estados de stock por inferencia del diagnóstico.

| Orden | Paquete | Depende de | Entrega principal |
|---|---|---|---|
| P0 | Inventario y reproducción | — | Diagnóstico público realizado; editor de Cargo pendiente de comprobar |
| P1 | Espaciado compartido | P0 | Implementado y verificado en repo; pendiente aplicar en Cargo y volver a medir |
| P2 | Nav móvil y cursor | P0, P1 | Logo izquierdo y cubrir solo huecos reales del cursor |
| P3 | Grieta y espacios del blog | P0, P1 | Marquee adaptable y sin salto |
| P4 | Dos propuestas de blog móvil | P1, P3 | Comparación visual y elección documentada |
| P5 | Blog móvil final | P4 | Scroll independiente y nav despejada |
| P6 | Links de fundadores | P0 | URLs verificadas, textos intactos |
| P7 | Studio: textos y vista previa | P0 | ES/EN coherente y sello «borrador» |
| P8 | Studio: edición y nav móvil | P7 | Artículos y acciones legibles |
| P9 | Studio: pendientes y conflictos | P7, P8 | Cambios específicos con salto al objeto |
| P10 | Orden de Cargo | P0, P2–P6 | Estructura verificable e inventario mantenible, sin alterar fichas en construcción |
| P11 | Manuales integrados | P5, P8–P10 | Un manual por idioma: sitio, Studio y edición de merca en Cargo |

P2 y P6 se pueden hacer juntos. P7 puede avanzar en paralelo con P1–P6. P10 debe empezar con un mapa de dependencias y ejecutar movimientos solo después de probar las rutas afectadas. P11 se hace sobre el funcionamiento final.

## P0 — Inventario y reproducción

```text
Revisa el repo TraTraTrax y el sitio Cargo publicado, sin cambiar aún código ni contenido. Lee CLAUDE.md. Identifica URL y estado publicado de home, about, catalog, blog, la página de merch y las dos páginas de nav; registra el nombre real de la ruta de merch en el inventario. Compara con cargo/snippets/ y cargo/snapshots/2026-07-27/, indicando qué es histórico, qué está publicado y qué no se pudo comprobar. Reproduce en desktop ancho/ultraancho y móvil: salto vertical de la grieta PRENSA al abrir el enlace del highlight, hueco a la derecha del ticker, offsets de headline/grieta/archivo, scroll del blog, solapamiento con nav, cursor en nav y catálogo, padding lateral y nav móvil. Mide viewport, alto de nav, gutters y capturas antes de proponer números. Inspecciona estructura de Cargo para carpeta de merch, tags, links y referencias. Entrega una tabla por hallazgo con URL, tamaño, evidencia, causa probable, archivo o lugar de Cargo y riesgo; marca lo no verificable. No inventes estado en vivo ni cambies textos editoriales.
```

**Salida necesaria:** registro breve de medidas, capturas y lista de páginas y enlaces. Si no hay acceso a Cargo, avanzar con diagnóstico local y dejar señaladas las comprobaciones pendientes; no afirmar que la copia local equivale al sitio publicado.

### Resultado de P0 para ejecutar los demás paquetes

Auditoría pública del 24-09-2026, en Chrome a 1440×900, 2560×1440 y 390×844 (móvil emulado). Revalidar antes de publicar porque Cargo y el bundle pueden cambiar.

| Página | Ruta pública comprobada | ID / función |
|---|---|---|
| Landing | `/` o `/landing` | `H3597552387`, portada configurada en Cargo, widget `canas` |
| Home | `/home` | `O1466699627`, widget `home`; destino del logo del nav |
| About | `/about` | `J2539233791`, widget `about` |
| Catalog | `/catalog` | `F3336995256`, widget `catalogo` |
| Blog | `/blog` | `Q1000282418`, widget `blog` |
| **Merca** | **`/merca`** | `Z4026822794`, overlay de Cargo sobre Landing; esta es la ruta real de merch |
| Nav escritorio / móvil | `/nav-(desktop)` / `/nav-(mobile)` | `L3482832595` / `N1901077103`, páginas fijadas |

`/merch` responde HTTP 200 con carcasa vacía, sin página activa: es el slug de un **tag**, no la ruta de la vitrina. Los slugs `home-1`, `merca-2` y `blog-2` del snapshot del 27-07 dan *Page not found*. El estado público muestra cuatro fichas con tag `merch` y el grid `thumbnail-index="tag:merch"`; no revela con certeza la jerarquía de carpetas del editor. **Comprobar la carpeta en Cargo autenticado antes de P10.** Los títulos y rótulos de stock discordantes de algunas fichas se registran como contenido en construcción y se remiten a revisión editorial; no son datos suficientes para decidir un stock real ni para reescribir fichas.

| Medida inicial | 1440×900 | 2560×1440 | 390×844 |
|---|---:|---:|---:|
| Nav visible, incluido margen inferior | 42,5 px | 73,5 px | 50,8 px |
| Padding lateral de `.page-content` del blog | 6,48 px | 10,37 px | 4,26 px |
| Padding lateral del nav | 12,96 px | 20,74 px | 8,52 px |
| Headline / PRENSA / archivo, coordenada y | 18,6 / 92,4 / 110,2 px | 29,8 / 147,8 / 176,4 px | 14,9 / 165,4 / 181 px |

Al hover del titular, la fila del highlight crece de 57,5 a 58 px a 1440 y de 92,1 a 93 px a 2560: `Math.ceil` en `blog.js` fija la altura de la imagen y altera la fila `auto`; el clic abre un enlace externo en otra pestaña. El ticker tiene solo dos copias; a 1440×700 suman 1168 px frente a una ventana de 1368 px, y a 2560×1440 suman 2402,8 frente a 2411,5 px. A 390×844 el blog mide 1014 px y permite 170 px de scroll; el nav fijo ocupa y=793,2–835,5 y tapa parte del último artículo. El cursor machete **ya aparece** al hover en links del nav y del highlight; el carril del catálogo usa `grab` y sus links `pointer`. El recurso de cursor computado en vivo lleva hash `Z3149376184713067437113458768074`, distinto del recurso antiguo mencionado en P2. Los placeholders publicados usan `--ttx-nav-h:60px` en home/about/catalog y `80px` en blog; **en el momento de P0** los snippets aún indicaban 18/60 px. Estas fueron referencias iniciales, no nuevos valores CSS aprobados.

No se pudo comprobar en el editor de Cargo la carpeta de merch, ni el inventario físico, ni Safari/iPhone real. La prueba móvil de P0 fue emulada; P5 y P11 requieren dispositivo real antes de cerrar instrucciones dependientes de iOS.

## P1 — Sistema de espaciado compartido

```text
Con las medidas P0, revisa el padding horizontal del nav y de las páginas diseñadas por nosotros en desktop y móvil. Hoy `.page-content`, nav y widget aportan capas distintas de padding; mide el borde visual final de cada zona antes de sustituir reglas. Revisa src/widgets/tokens.css, blog/blog.css, catalogo/catalogo.css, about/about.css, home/home.css, los placeholders y el CSS de nav en cargo/snippets/nav.md (desktop L3482832595, móvil N1901077103). Define tokens o variables solo donde haya una relación compartida comprobada; conserva los ajustes propios de cada widget y evita alterar páginas de Cargo ajenas. Alinea los bordes que deban coincidir, sin asumir que todo el sitio requiere el mismo gutter. Actualiza snippets de Cargo que quedaron desfasados respecto a los placeholders publicados, especialmente `--ttx-nav-h` (home/about/catalog 60px; blog 80px), después de medir el resultado final. Verifica 320/375/390 px, tablet, desktop y pantalla ultraancha; entrega antes/después y lista de reglas sustituidas.
```

**Criterio:** bordes que comparten eje visual alineados en cada breakpoint, diferencias intencionales documentadas y sin overflow horizontal accidental. No usar el alto del nav de una sola pantalla como constante global.

### Resultado de P1 — implementado en repo, pendiente en Cargo

Medición del sitio publicado y de las reglas nuevas inyectadas en el mismo DOM el 24-09-2026. El borde compartido es `1rem` en desktop y `.75rem` en móvil; Cargo cambia de nav entre 819 y 820 px. La suma medida es `.page-content` + widget: Home/About/Blog reciben media unidad de cada uno, mientras Catalog recibe la unidad completa del widget. El resultado no exige un gutter común para los elementos internos. La tabla completa de bordes izquierdos y derechos, capas y reglas está en [P1-ESPACIADO.md](P1-ESPACIADO.md).

| Viewport | Nav | Home/About antes → después | Catalog antes → después | Blog antes → después |
|---|---:|---:|---:|---:|
| 320 × 844 | 6,99 px | 9,48 → 6,97 | 6,00 → 6,98 | 9,30 → 6,97 |
| 375 × 844 | 8,19 px | 10,09 → 8,19 | 6,00 → 8,19 | 10,91 → 8,19 |
| 390 × 844 | 8,52 px | 10,25 → 8,50 | 6,00 → 8,52 | 11,34 → 8,50 |
| 768 × 1024 | 13,29–13,35 px | 12,64–12,67 → 13,28 | 6,00 → 13,28 | 17,80 → 13,34 |
| 1440 × 900 | 12,96 px | 12,47 → 12,94 | 6,00 → 12,95 | 14,56 → 12,94 |
| 2560 × 1440 | 20,74 px | 16,36 → 20,72 | 6,00 → 20,73 | 23,31 → 20,72 |

Reglas sustituidas: `--ttx-margen:6px` de Home/About por medio `--ttx-eje-nav`, el de Catalog por el eje completo, y `padding:.625rem` de Blog por el mismo padding vertical y medio eje horizontal. Se retiró el `--ttx-nav-h:60px` del CSS del Blog para dejar su reserva en el placeholder. `--ttx-eje-nav` solo se define en esas cuatro páginas (`1rem` desde 820 px, `.75rem` hasta 819 px); se conservaron el `--ttx-inset` del catálogo y los gaps propios del Blog. El CSS del nav quedó scopeado a sus dos IDs, sin alterar el padding efectivo. Los snippets y previews ahora consignan `--ttx-nav-h:60px` para Home/About/Catalog y `80px` para Blog; no se creó una altura global.

En el preview de Catalog, el reflejo filtrado inflaba `document.scrollWidth` en tablet y desktop. `contain:paint` en su `.ttx-marco` acotó la pintura sin quitar el scroll horizontal interno del carril. En el DOM publicado con reglas inyectadas, `scrollWidth` no superó `innerWidth` en los seis tamaños; los cuatro previews locales tampoco tuvieron overflow tras el ajuste. `npm run build` pasó con 0 errores y 43 avisos editoriales preexistentes; `git diff --check` pasó. **Pendiente:** publicar el bundle y aplicar los snippets en Cargo, comprobar que coinciden con la versión activa y repetir la medición allí. Las cifras «después» todavía no son el estado público.

## P2 — Nav móvil y cursor de enlaces

```text
Usa P0 y P1. En el nav móvil de Cargo [id="N1901077103"], sustituye el texto dinámico de la izquierda por el logo TraTraTrax, manteniendo navegación al home, legibilidad de tinta sobre fondos y bandera, y distribución de los enlaces. El logo actual del centro puede requerir recolocación: evita duplicarlo visualmente. El script global que manipula data-glitch debe dejar de buscar o alterar ese texto en móvil sin romper desktop ni la navegación AJAX. Actualiza cargo/snippets/nav.md y nav-preview.html, y aplica a Cargo si hay acceso autorizado.

Audita el cursor efectivo antes de añadir reglas: el machete ya se aplica al hover de los links del nav y del highlight, mientras el catálogo usa `grab` en el carril y `pointer` en links. Conserva `grab` para el gesto de arrastre y cambia solo los enlaces o medios enlazados donde se compruebe una inconsistencia. Compara el recurso publicado con hash `Z3149376184713067437113458768074` con el recurso antiguo del snippet (hash `I2846370861133166636658288179402`), verifica carga, hotspot `16 0`, tamaño efectivo y fallback antes de elegir uno. Revisa especificidad de Cargo, widgets, links de `media-item` y estados hover/focus; aplica a dispositivos con hover fino, sin ocultar foco de teclado ni imponer cursor a controles deshabilitados. No uses reglas indiscriminadas que conviertan texto editable en enlace. Prueba escritorio con mouse y trackpad en todas las páginas con links y navegación AJAX. Entrega el inventario de huecos reales, reglas exactas y capturas o video corto.
```

## P3 — Grieta y aire del blog

```text
Corrige el widget del blog en src/widgets/blog/blog.js y blog.css usando las medidas de P0 y el espaciado P1. El ticker PRENSA debe cubrir hasta el borde derecho en pantallas muy anchas. Hoy ticker() crea dos copias y @keyframes desplaza -50%; calcula automáticamente cuántas copias hacen falta según el ancho medido del texto y de la ventana, y responde a ResizeObserver, cambios de datos y navegación AJAX. Conserva una sola copia accesible para lectura y enlaces; las copias visuales deben quedar fuera del orden de tabulación y de lectores de pantalla. Evita huecos al reiniciar la animación, saltos de velocidad perceptual y trabajo innecesario. Respeta prefers-reduced-motion.

El desplazamiento ya quedó acotado: al hover se muestra la imagen, `ResizeObserver` escribe `Math.ceil(alto de copia)` y esa altura entera aumenta la fila automática 0,5–0,9 px; el enlace externo no desplaza por sí mismo la página. Corrige la interacción entre altura medida de copia, imagen y grid para que abrir y cerrar el highlight no mueva PRENSA ni el archivo. Verifica antes/después con hover, foco, clic del enlace, ticker activo, zoom y ultraancho; mide y registra la coordenada y, no solo una captura. Evalúa la separación headline→grieta en desktop y grieta→archivo en móvil a partir de las coordenadas P0 y de composiciones comparables, sin asumir que el salto subpíxel exige aumentar márgenes. Actualiza el snippet de Cargo solo si cambia su calibración.
```

## P4 — Comparar dos variantes móviles del blog

```text
Prepara dos variantes visuales del blog móvil con los mismos datos reales y el mismo tamaño de viewport; no publiques todavía una elección. Variante A, preferida por Silvi: archivo de lecturas inferior en dos columnas con el mismo tamaño de letra para ambas, diferenciado del bloque superior; el archivo tiene scroll propio y highlight y grieta permanecen independientes. Variante B: subir moderadamente el tamaño de letra de toda la página, archivo inferior en una columna; el archivo tiene scroll propio y highlight y grieta permanecen independientes. En ambas, conserva orden de lectura, enlaces tocables, textos sin truncar y acceso a todas las lecturas. Presenta capturas o previews comparables a 320, 375 y 390 px, con altura corta y larga; registra alto disponible y comportamiento de scroll y de la nav. Recomienda A salvo que las pruebas demuestren problemas de legibilidad o alcance. Espera la elección visual de la persona responsable antes de fijar una variante.
```

**Decisión pendiente:** A (preferida) o B. El prompt P5 acepta la elección como entrada.

## P5 — Blog móvil final y despeje de nav

```text
Implementa la variante [A/B ELEGIDA] del P4 en src/widgets/blog/blog.css y, solo si hace falta, blog.js. Mantén highlight y grieta como áreas independientes del scroll del archivo inferior; el gesto en el archivo desplaza todas las lecturas sin arrastrar las dos áreas superiores. En A, dos columnas con idéntica escala tipográfica; en B, una columna y escala global ajustada. Revisa altura con 100dvh/viewport real y navegación iOS/Android, teclado y orientación. Añade padding inferior suficiente dentro del área desplazable, medido con el alto real de la nav y safe-area-inset-bottom, para que ningún artículo ni columna quede bajo la barra. Revisa que no aparezca scroll atrapado ni contenido inaccesible cuando highlight o ticker ocupen más alto. Prueba las rutas directas y por navegación AJAX, y deja evidencia de primer y último artículo a 320/375/390 px.
```

## P6 — Enlaces de fundadores, sin tocar textos

```text
Comprueba los tres enlaces de fundadores en la versión publicada de About y en cualquier mención enlazada del nav. Deben ser Verraco → https://www.instagram.com/verraco__/, DJ Lomalinda → https://www.instagram.com/djlomalinda/, Nyksan → https://www.instagram.com/nyksan_/. data/about.json y el snapshot cargo/snapshots/2026-07-27/page-nav.html ya contienen esas URLs: primero determina si falta aplicar algo en vivo. Modifica solo atributos de enlace donde haya diferencia; no alteres texto, orden, puntuación, grafía ni contenido editorial. Comprueba destino real de cada link y documenta si no hubo cambios porque ya estaba correcto.
```

## P7 — Studio: idioma, helpers y sello de preview

```text
Audita todos los textos visibles del TraTraTrax Studio en español e inglés: src/panel/lib/idioma.js, Marco.astro, páginas, lib/barra.js, mensajes de validación/API, placeholders, tooltips y aria-labels. Construye un inventario con texto, lugar, idioma disponible y propósito; sustituye ayudas/placeholder hiper específicos por instrucciones genéricas y claras, conservando ejemplos solo cuando sean útiles y correctos. Completa las traducciones y verifica que cambiar de idioma actualiza también contenido creado por JS y menús móviles, avisos y estados, sin mezcla accidental de ES/EN. Mantén claves estables y no cambies datos editoriales.

En src/panel/pages/vista.astro deja el sello de la previsualización exactamente «borrador» para todos los estados con borrador; elimina «igual al repo» y sufijos similares del sello. Si no hay borrador, usa una indicación clara coherente con el idioma sin fingir un borrador. Comprueba la vista de home, catálogo, blog y about. Entrega lista de textos corregidos y un recorrido ES/EN.
```

## P8 — Studio: editor de artículos y cabecera móvil

```text
En src/panel/pages/blog.astro, reorganiza cada artículo abierto: primera línea con título editable ocupando el espacio disponible; controles Visible/Oculto, mover arriba/abajo y eliminar alineados a la derecha con space-between respecto al título; segunda línea para el enlace. Mantén el extracto debajo, los estados de foco y los controles accesibles. Revisa los estilos absolutos actuales de .blog-articulo[open] y .blog-article-top para evitar superposición y saltos en móvil. Prueba títulos largos, URLs largas, 320 px y desktop, y el orden por teclado.

En src/panel/Marco.astro y estilo.css, revisa la navegación superior móvil para que se reconozcan las mismas acciones y el estado activo de desktop, con jerarquía, nombres, iconos y feedback coherentes dentro del espacio móvil. Conserva las acciones Vista previa, Guardar, idioma y Salir y la navegación de secciones; comprueba menús abiertos, guardado con cambios pendientes y estados deshabilitados. No dupliques lógica de publicación.
```

## P9 — Pendientes y conflictos específicos

```text
En Studio, sustituye la lista genérica de cambios pendientes de src/panel/lib/barra.js («el blog», «el catálogo», etc.) por un diff legible de objetos y campos realmente modificados respecto a la base del borrador. Cada entrada debe nombrar el artículo/release/elemento concreto y acción (creado, editado, ocultado, reordenado, eliminado cuando corresponda), y al pulsarla abrir el editor en ese objeto y campo si existe. Para cambios de nivel de sección como highlight o grieta, ir directamente a su bloque. Para objetos eliminados, ir a la sección y mostrar contexto útil; no enlazar a un objeto inexistente.

Haz el mismo mapeo para inconsistencias de validación: usa identificadores estables y rutas concretas; hoy barra.js puede saltar a un release y a /blog genérico. Atiende mensajes de blog items[n], ticker, highlight, home y artistas. Conserva navegación y borrador entre páginas, teclado y móvil. Evita falsos cambios por orden del JSON o formatos equivalentes. Prueba múltiples cambios simultáneos, guardar, revertir, conflicto remoto, item eliminado y link directo. Documenta los tipos que no admiten salto a campo y su fallback explícito.
```

## P10 — Organización de Cargo

```text
Antes de mover nada en Cargo, entra al editor y exporta o registra el árbol real de páginas y carpetas, slugs, IDs, tags, `thumbnail-index`, overlays, nav y enlaces internos/externos. P0 solo pudo comprobar la estructura pública: cuatro productos tageados `merch`, vitrina `/merca` con `gallery-grid thumbnail-index="tag:merch"` y páginas de nav fijadas; **no confirmó si existe ya una carpeta de merch en el editor**. Si falta, define una carpeta para los productos actuales y comprueba en una prueba reversible si moverlos conserva IDs, slugs, URLs y selección por tag. No crees una segunda carpeta por asumir que no existe.

Guarda un respaldo reproducible en cargo/ con fecha y un mapa antes→después. Ejecuta los movimientos en tandas pequeñas, verificando después de cada tanda grilla `/merca`, cada producto, overlay/cierre, tags `merch` y de stock, nav, links y URLs públicas. No cambies slugs, títulos, descripciones, precios ni rótulos de stock por conveniencia organizativa: las fichas están en construcción y su contenido requiere confirmación editorial. Registra las discordancias entre tags y textos como pendientes del equipo, sin inferir cuál dato es verdadero. Si Cargo cambia URLs por un movimiento, detente antes de ese movimiento y presenta impacto y ruta de preservación para decisión editorial.

Documenta la operación de merca que sí debe hacerse en Cargo: crear/editar ficha e imágenes, mantener el tag `merch` para que aparezca en la vitrina, y editar **un solo** tag de estado entre `in-stock`, `few-units` y `out-of-stock` cuando el equipo confirme el stock. Comprueba en el editor la ubicación y los pasos exactos para modificar tags; verifica luego punto de la grilla, rótulo de ficha y botón de compra, porque el script global `cargo/snippets/tags-de-pagina.html` y el CSS pueden no estar aplicados uniformemente. No prometas sincronía automática hasta comprobarla producto por producto. Actualiza snippets, índice de páginas y guía de mantenimiento con la estructura y operación verificadas.
```

## P11 — Manual integrado del sitio y Studio, por idioma

```text
Con el sitio y Studio ya estabilizados, crea **un manual integrado en español y otro en inglés**. Cada manual debe reunir texto y material audiovisual en la misma estructura, con dos partes claramente navegables: **(1) uso del sitio público** y **(2) actualización de contenidos con TraTraTrax Studio y Cargo**. No separar sitio y Studio en manuales independientes. Entrega dos versiones lingüísticas del mismo contenido, con videos o capítulos incrustados/enlazados en el apartado correspondiente, sus guiones editables y subtítulos o voz en el idioma de cada versión.

En la parte del sitio, explica qué muestra y cómo funciona cada página vigente: Landing `/`, Home `/home`, About, Catalog, Blog, Merca `/merca` y navegación desktop/móvil. Describe interacciones reales: grieta y destacado, links externos, scroll horizontal del catálogo, zonas de scroll del blog elegidas en P5, apertura/cierre del overlay de merca, navegación y comportamiento táctil. Usa las rutas publicadas, no las del snapshot antiguo, y muestra los estados finales con capturas y recorridos reproducibles.

En la parte de mantenimiento, explica la relación entre la página pública y el editor: qué se actualiza mediante Studio (por ejemplo, releases/catálogo, destacado del Home y artículos/ticker/highlight del Blog, según las pantallas realmente presentes), cómo entrar, cambiar idioma, crear/editar/ordenar/ocultar contenido, previsualizar, revisar pendientes/conflictos, guardar/publicar y verificar el resultado público. Marca explícitamente los contenidos que **no** se editan en Studio. **La vitrina y las fichas de merch se editan directamente en Cargo**: incluye una sección paso a paso, comprobada en el editor, para llegar a `/merca` y a cada producto, editar texto e imágenes solo con autorización editorial, mantener el tag `merch` y cambiar el tag de stock `in-stock` / `few-units` / `out-of-stock` según el estado confirmado por el equipo. Explica que el tag `merch` incluye la ficha en la grilla y que el tag de stock controla la señal visual solo donde esa integración esté verificada; enseña a comprobar grilla, ficha, botón y URL después de guardar. No uses `/merch` como ruta de la vitrina ni presentes las fichas en construcción como contenido final.

Basa cada paso en una versión comprobada de sitio, Studio y Cargo. Si el editor de Cargo no está disponible, deja el procedimiento de tags identificado como **pendiente de validación**, sin inventar nombres de botones ni capturas. Usa capturas y grabaciones originales, sin credenciales ni tokens. Verifica ambos manuales siguiéndolos desde cero en desktop y móvil. Entrega índice de las dos versiones, enlaces a texto y videos, duración de capítulos, fecha/versión del sitio y lista de pasos comprobados o pendientes.
```

## Auditoría de cobertura

| Comentario original | Prompt(s) | Comprobación de cierre |
|---|---|---|
| Nav móvil: quitar texto dinámico izquierdo y poner logo | P2 | Logo a la izquierda; script móvil no reescribe texto |
| Grieta PRENSA baja al abrir link del highlight en desktop | P0, P3 | Sin salto, con causa documentada |
| Blog móvil opción A: dos columnas, letra igual, scroll independiente | P4, P5 | Preview A y prueba de scroll |
| Blog móvil opción B: letra mayor, columna normal, scroll independiente | P4, P5 | Preview B y prueba de scroll |
| Blog móvil: padding inferior evita cruce con nav | P5 | Último artículo visible y tocable |
| Nav y páginas propias con padding coincidente móvil/desktop | P1 | Bordes alineados en breakpoints |
| Cursor machete en todos los hover links, nav y catálogo | P2 | Auditoría de enlaces y fallback |
| URLs Verraco, DJ Lomalinda y Nyksan, sin cambiar textos | P6 | Tres destinos comprobados, diff sin texto |
| Grieta ultraancha sin hueco y repetición automática | P3 | Sin vacío ni duplicación manual fija |
| Más aire headline/grieta desktop y grieta/contenidos móvil | P3 | Medidas y capturas comparables |
| Merch actual dentro de carpeta Cargo | P10 | Carpeta real comprobada antes de mover; árbol final y grilla funcional |
| Todo el proyecto Cargo organizado | P10 | Mapa, respaldo e índice final |
| Manual integrado del sitio y Studio, ES/EN | P11 | Dos manuales, uno por idioma, cada uno con texto y videos en sus secciones |
| Manual: qué muestra cada página pública | P11 | Landing, Home, About, Catalog, Blog, Merca y nav explicados y comprobados |
| Manual: qué se edita en Studio y qué se edita en Cargo | P10, P11 | Límite entre herramientas explícito, sin atribuir merca a Studio |
| Manual: tags de merch y stock en Cargo | P10, P11 | Pasos comprobados para `merch` y los tres tags de stock, con verificación en grilla y ficha |
| Helpers y textos Studio completos ES/EN | P7 | Recorrido sin mezcla de idiomas |
| Studio artículos: título en línea, controles derecha, link debajo | P8 | Layout 320 px y desktop |
| Studio placeholders/helpers genéricos | P7 | Inventario y sustituciones |
| Studio nav superior móvil similar a desktop | P8 | Acciones y estado activo coherentes |
| Previews: quitar «igual al repo», decir «borrador» | P7 | Sello exacto comprobado |
| Pendientes/inconsistencias específicos y clic al cambio | P9 | Entradas concretas y navegación al objeto/campo |

### Revisión final de ejecución

Al cerrar cada paquete: informar archivos y lugares de Cargo cambiados, evidencia visual o funcional, pruebas relevantes y riesgos abiertos. Ejecutar `npm run validate` si cambia `data/`; compilar widgets o Studio según el área tocada. Probar navegación AJAX y acceso por URL directa cuando el cambio afecte Cargo. No publicar capturas de Studio con datos sensibles. Repetir la tabla de cobertura al final y marcar cada fila como hecha, pendiente por decisión visual o bloqueada por acceso comprobado. **Al concluir P11, entregar a la persona responsable el checklist final de abajo con cada casilla marcada como hecha, no aplicable o pendiente, más la URL/captura que comprueba cada sincronización.** No dar por sincronizado un cambio que solo vive en el repo, en un snippet o en un borrador de Cargo.

## Checklist final de sincronización manual

Usar al final de **todo** el plan y también después de cada publicación parcial. Marcar `N/A` cuando un paquete no haya tocado ese lugar; anotar fecha, responsable y evidencia de la versión **publicada**. Antes de pegar algo en Cargo, comparar su estado actual con el cambio aprobado: los snippets contienen valores y textos antiguos.

### Versión y despliegues

- [ ] Registrar commit del repo, fecha de publicación de GitHub Pages, versión del bundle `ttx.js` que carga Cargo y despliegue de Studio que se va a revisar. Confirmar que Pages y Studio muestran los cambios de ese commit; si Studio tiene despliegue separado, verificarlo por separado.
- [ ] Si cambió `data/*.json`, ejecutar `npm run validate`, publicar y comprobar el dato nuevo en la página pública correspondiente. Si cambió un widget o CSS de widget, compilarlo y comprobar que Cargo descargó el `ttx.js` nuevo; revisar si hay que actualizar el parámetro de caché del **único** script global, sin duplicarlo. La URL publicada en P0 usaba `ttx.js?v=4`; `cargo/snippets/catalogo.md` aún mostraba `v=3`.
- [ ] Guardar una copia fechada del HTML/CSS global y de las páginas de Cargo que se tocaron, junto con el mapa de IDs, slugs, tags y enlaces antes→después. No usar `cargo/snapshots/2026-07-27/` como copia del estado actual.

### Cargo global y páginas públicas

- [ ] **Settings → Edit HTML → Global:** cotejar el loader `ttx.js` y los scripts globales realmente activos (lema/página activa, tinta del nav, bandera, color de navegador y propagación de tags, según los cambios ejecutados). Revisar que no haya versiones duplicadas y que sobrevivan a navegación AJAX. Actualizar sus snippets correspondientes solo después de verificar lo publicado.
- [ ] **CSS global de Cargo:** cotejar únicamente las reglas afectadas por nav, cursores, overlay y merca. Confirmar especificidad, breakpoints y que no pisan páginas ajenas. No pegar el CSS de un widget por segunda vez si ya viaja en `ttx.js`.
- [ ] **Landing `/` (`H3597552387`):** comprobar el placeholder `canas`, la escena, entrada de nav y link del logo a `/home`; distinguirla de la página Home.
- [ ] **Home `/home` (`O1466699627`):** cotejar placeholder y variables de margen/nav con el diseño final; probar grieta, destacado y enlaces de compra/escucha cuando existan, con mouse, teclado y tacto.
- [ ] **About `/about` (`J2539233791`):** cotejar placeholder, margen/nav y enlaces de fundadores con sus destinos aprobados; verificar interacciones sin cambiar la redacción editorial.
- [ ] **Catalog `/catalog` (`F3336995256`):** cotejar placeholder, margen/nav, scroll horizontal, apertura de fichas y links externos; comprobar que el carril conserve `grab` y que los enlaces tengan el cursor acordado.
- [ ] **Blog `/blog` (`Q1000282418`):** cotejar placeholder y reserva real del nav, ticker sin hueco, highlight sin salto, offsets aprobados, scroll del archivo y primer/último enlace visible y tocable en móvil. Verificar tanto URL directa como llegada desde el nav.
- [ ] **Nav escritorio `L3482832595` y móvil `N1901077103`:** actualizar por separado HTML/CSS de ambas páginas cuando P1/P2 lo requieran; comprobar links a `/about`, `/catalog`, `/blog`, `/merca` y logo a `/home`, estado activo, tinta/bandera, cursor, foco, alturas y ocultación de la instancia que no corresponde al breakpoint. No reutilizar el snapshot con slugs `-2`.
- [ ] **Merca `/merca` (`Z4026822794`):** comprobar apertura/cierre del overlay, `gallery-grid thumbnail-index="tag:merch"`, links a fichas y ancla respecto a Landing/Home. No confundir la ruta de la vitrina `/merca` con el tag `merch` ni con `/merch`, que no mostró página activa en P0.
- [ ] **Cada ficha de merca en Cargo:** comprobar que el tag `merch` la incluya en la vitrina; cuando el equipo confirme stock, dejar exactamente uno entre `in-stock`, `few-units` y `out-of-stock`, y contrastar punto de grilla, rótulo de ficha y botón. Registrar las fichas aún en construcción como pendientes editoriales; no sincronizar texto, precio o stock por deducción.
- [ ] **Organización de Cargo:** verificar en el editor la carpeta real de merca antes/después de P10, IDs y slugs conservados, y todos los links internos o referencias que apunten a páginas movidas. Si una URL cambia, documentar destino anterior, nuevo y solución aprobada antes de cerrar la casilla.

### Studio, manuales y recorrido final

- [ ] **TraTraTrax Studio:** comprobar despliegue, idioma ES/EN, sello «borrador», preview, edición de Home/Catalog/Blog, pendientes/conflictos y guardado/publicación; confirmar en Cargo que un cambio publicado aparece en la página correcta. No presentar merca como editable desde Studio.
- [ ] **Manuales ES y EN:** actualizar en cada manual las rutas, capturas, videos y pasos del sitio y Studio de la versión final. Incluir la excepción de merca y el procedimiento de tags en Cargo **solo después de probarlo en el editor**; marcar cualquier paso no verificado como pendiente.
- [ ] Hacer un recorrido final a 320/375/390 px, tablet, desktop ancho y ultraancho; probar URL directa, navegación AJAX, regreso, hover/foco/tacto, móvil real cuando corresponda y primera/última tarjeta del blog. Anotar cada fallo abierto con página, tamaño, captura y responsable.
- [ ] Entregar este checklist completo con columnas o notas de **hecho / N/A / pendiente**, responsable, fecha y evidencia por casilla. No cerrar la implementación mientras quede una sincronización manual necesaria sin verificar.
