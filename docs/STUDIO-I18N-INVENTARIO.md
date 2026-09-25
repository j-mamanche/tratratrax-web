# Inventario de textos visibles · TraTraTrax Studio

Ámbito: interfaz en `src/panel`. Títulos, artistas, créditos, artículos, enlaces y otros valores de `data/*.json` son contenido editorial: se muestran tal como están en ambos idiomas. `Home`, `Blog` y `Highlight` son nombres de secciones o componentes; la etiqueta de interfaz `Grieta` se muestra como `Ticker` en inglés.

## Claves estables (`lib/idioma.js`)

| Clave | Español | English | Lugar | Propósito |
|---|---|---|---|---|
| `catalogo` | Catálogo | Catalog | Marco.astro, pages/catalogo.astro, pages/vista.astro | Navegación o acción |
| `home` | Home | Home | Marco.astro, lib/borrador.js, pages/api/guardar.js, pages/api/revisar.js, pages/home.astro, pages/vista.astro | Navegación o acción |
| `blog` | Blog | Blog | Marco.astro, lib/borrador.js, pages/api/guardar.js, pages/api/revisar.js, pages/blog.astro, pages/vista.astro | Navegación o acción |
| `guardar` | Guardar cambios | Save changes | Marco.astro, lib/barra.js | Estado, validación o aviso |
| `salir` | Salir | Sign out | Marco.astro, lib/barra.js, lib/borrador.js, pages/blog.astro, pages/catalogo.astro, pages/home.astro | Navegación o acción |
| `nuevo` | Nuevo lanzamiento | New release | pages/catalogo.astro | Campo, sección o acción |
| `importarBandcamp` | Importar de Bandcamp | Import from Bandcamp | pages/catalogo.astro | Campo, sección o acción |
| `importar` | Importar | Import | pages/catalogo.astro | Campo, sección o acción |
| `todos` | Todos | All | pages/vista.astro | Campo, sección o acción |
| `bloqueados` | No publicables | Blocked | lib/idioma.js | Estado, validación o aviso |
| `pendientes` | Pendientes | Needs info | lib/barra.js | Estado, validación o aviso |
| `listos` | Listos | Ready | lib/idioma.js | Campo, sección o acción |
| `vista` | Vista previa | Preview | Marco.astro, pages/blog.astro | Navegación o acción |
| `fijo` | Fijo | Fixed | pages/home.astro | Campo, sección o acción |
| `aleatorio` | Aleatorio | Random | pages/home.astro | Campo, sección o acción |
| `fijoPie` | Muestra un lanzamiento. | Shows one release. | pages/home.astro | Campo, sección o acción |
| `autoPie` | Elige entre los marcados. | Picks from selected releases. | pages/home.astro | Campo, sección o acción |
| `seleccionarTodo` | Seleccionar todo | Select all | pages/home.astro | Campo, sección o acción |
| `quitarTodo` | Quitar todo | Clear all | pages/home.astro | Campo, sección o acción |
| `borrar` | Borrar | Delete | pages/catalogo.astro | Campo, sección o acción |
| `buscar` | Buscar… | Search… | pages/catalogo.astro | Ayuda, entrada o accesibilidad |
| `ayudaCatalogo` | Arrastra para cambiar el orden. Gris: pendiente. Rojo: bloquea la publicación. | Drag to reorder. Gray: needs info. Red: blocks publishing. | pages/catalogo.astro | Ayuda, entrada o accesibilidad |
| `guardarCorto` | Guardar | Save | Marco.astro, lib/barra.js, pages/api/guardar.js, pages/api/revisar.js, pages/home.astro | Estado, validación o aviso |
| `secciones` | Secciones | Sections | Marco.astro | Navegación o acción |
| `opciones` | Opciones | Options | Marco.astro | Navegación o acción |
| `publicacion` | Publicación | Publishing | Marco.astro | Campo, sección o acción |
| `guardado` | Guardado | Saved | Marco.astro, lib/barra.js, pages/catalogo.astro | Estado, validación o aviso |
| `volver` | Volver a la lista | Back to list | Marco.astro, pages/api/entrar.js, pages/entrar.astro | Campo, sección o acción |
| `vistaCuadricula` | Ver catálogo en cuadrícula | View catalog as grid | pages/catalogo.astro | Navegación o acción |
| `anadirLanzamiento` | Añadir un lanzamiento | Add a release | pages/catalogo.astro | Campo, sección o acción |
| `elegirPortada` | Cómo se elige la portada | How the cover is chosen | pages/home.astro | Campo, sección o acción |
| `ayudaCatalogoLabel` | Ayuda del catálogo | Catalog help | pages/catalogo.astro | Ayuda, entrada o accesibilidad |
| `seleccionarLanzamiento` | Selecciona o crea un lanzamiento. | Select or create a release. | pages/catalogo.astro | Campo, sección o acción |
| `entrar` | Entrar | Sign in | pages/entrar.astro, pages/index.astro | Navegación o acción |
| `contrasena` | Contraseña | Password | pages/entrar.astro | Ayuda, entrada o accesibilidad |
| `intro` | Edita y publica el contenido del sitio. | Edit and publish the site content. | pages/entrar.astro | Campo, sección o acción |
| `mala` | Contraseña incorrecta. | Incorrect password. | pages/entrar.astro | Campo, sección o acción |
| `vacia` | Escribe la contraseña. | Enter your password. | pages/entrar.astro | Campo, sección o acción |
| `frenado` | Demasiados intentos. Espera unos minutos. | Too many attempts. Wait a few minutes. | pages/entrar.astro | Campo, sección o acción |
| `rota` | Falta configuración del panel. | The Studio is not configured. | pages/entrar.astro | Campo, sección o acción |
| `errorEntrar` | No se pudo entrar. | Could not sign in. | pages/entrar.astro | Estado, validación o aviso |
| `faltan` | Faltan: | Missing: | pages/entrar.astro | Campo, sección o acción |
| `revisa` | Revisa | Check | pages/api/guardar.js, pages/api/revisar.js, pages/entrar.astro | Campo, sección o acción |
| `errorRepo` | No se pudo leer el repositorio: | Could not read the repository: | pages/blog.astro, pages/catalogo.astro, pages/home.astro | Estado, validación o aviso |
| `sinBorrador` | sin borrador · datos publicados | no draft · published data | pages/vista.astro | Estado, validación o aviso |
| `bandcampUrl` | URL de álbum de Bandcamp | Bandcamp album URL | pages/catalogo.astro | Ayuda, entrada o accesibilidad |

## Textos creados desde JavaScript (`lib/textos.js`)

| Español | English | Lugar | Propósito |
|---|---|---|---|
| Sin título | Untitled | pages/catalogo.astro, pages/home.astro | Estado, validación o aviso |
| sin número | no catalog number | pages/catalogo.astro | Estado, validación o aviso |
| oculto | hidden | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| No se puede guardar. Falta: | Cannot save. Missing: | pages/catalogo.astro | Estado, validación o aviso |
| Pendiente: | Needs attention: | pages/catalogo.astro | Estado, validación o aviso |
| el título | title | pages/catalogo.astro | Campo, sección o acción |
| los artistas | artists | lib/artistas.js, lib/barra.js, pages/catalogo.astro | Campo, sección o acción |
| un artista que ya no existe | an artist who no longer exists | pages/catalogo.astro | Estado, validación o aviso |
| la fecha | date | pages/catalogo.astro | Campo, sección o acción |
| la carátula | cover image | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| el link para comprar | purchase link | pages/catalogo.astro | Campo, sección o acción |
| los créditos | credits | pages/catalogo.astro | Campo, sección o acción |
| Lanzamiento | Release | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| El número de catálogo es opcional. | The catalog number is optional. | pages/catalogo.astro | Campo, sección o acción |
| La fecha aparece en los créditos. | The date appears in the credits. | pages/catalogo.astro | Campo, sección o acción |
| Oculto: se guarda, pero no aparece en el sitio. | Hidden releases are saved but do not appear on the site. | pages/catalogo.astro | Estado, validación o aviso |
| Título | Title | pages/blog.astro, pages/catalogo.astro | Campo, sección o acción |
| Nº catálogo | Catalog no. | pages/catalogo.astro | Campo, sección o acción |
| Fecha | Date | pages/catalogo.astro | Campo, sección o acción |
| Visible en el sitio | Visible on the site | pages/catalogo.astro | Campo, sección o acción |
| Artistas | Artists | lib/artistas.js, pages/api/guardar.js, pages/catalogo.astro | Campo, sección o acción |
| Busca para filtrar. Escribe un nombre nuevo para crearlo. | Search to filter, or enter a new name to create an artist. | pages/catalogo.astro | Campo, sección o acción |
| Edita un nombre desde su ficha. | Edit a name from its release. | pages/catalogo.astro | Campo, sección o acción |
| Corregir el nombre | Edit name | pages/catalogo.astro | Campo, sección o acción |
| Quitar | Remove | pages/catalogo.astro | Campo, sección o acción |
| ¿Cómo se escribe? | How should the name be written? | pages/catalogo.astro | Campo, sección o acción |
| Carátula y links | Cover and links | pages/catalogo.astro | Campo, sección o acción |
| La carátula se importa de Bandcamp. También puedes pegar su código. | The cover is imported from Bandcamp. You can also enter its image ID. | pages/catalogo.astro | Campo, sección o acción |
| Añade los enlaces de compra y escucha. | Add purchase and listening links. | pages/catalogo.astro | Campo, sección o acción |
| Código de la carátula | Cover image ID | pages/catalogo.astro | Campo, sección o acción |
| Link para comprar | Purchase link | pages/catalogo.astro | Campo, sección o acción |
| Link para escuchar | Listening link | pages/catalogo.astro | Campo, sección o acción |
| Créditos | Credits | pages/catalogo.astro | Campo, sección o acción |
| Un crédito por línea: <code>Mastering__ Beau Thomas</code>. | One credit per line, for example <code>Mastering__ Beau Thomas</code>. | pages/catalogo.astro | Campo, sección o acción |
| Material de portada | Cover media | pages/catalogo.astro | Campo, sección o acción |
| Arte propio reemplaza la carátula. | Custom artwork replaces the cover image. | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Video y póster son opcionales. | Video and poster are optional. | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| En la grieta, <code>*</code> separa ambos grupos. | In the ticker, <code>*</code> separates the two groups. | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Texto de la grieta | Ticker text | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Video | Video | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Arte de portada | Cover artwork | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| arte propio | custom artwork | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| la carátula de Bandcamp | Bandcamp cover image | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| este lanzamiento | this release | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Este lanzamiento | This release | pages/catalogo.astro | Campo, sección o acción |
| Deshacer | Undo | pages/catalogo.astro | Campo, sección o acción |
| Leyendo Bandcamp… | Reading Bandcamp… | pages/catalogo.astro | Estado, validación o aviso |
| Hay una versión más reciente. Tu copia local sigue disponible. | A newer version is available. Your local copy is still available. | pages/catalogo.astro | Campo, sección o acción |
| Recuperar mi copia | Restore my copy | pages/catalogo.astro | Campo, sección o acción |
| Descartar mi copia | Discard my copy | pages/catalogo.astro | Campo, sección o acción |
| Otro lanzamiento | Another release | pages/home.astro | Campo, sección o acción |
| Elegir lanzamiento… | Choose a release… | pages/home.astro | Campo, sección o acción |
| Sin carátula: añade arte abajo. | No cover image: add artwork below. | pages/home.astro | Estado, validación o aviso |
| No hay lanzamientos con imagen | No releases with images | pages/home.astro | Estado, validación o aviso |
| No hay lanzamientos disponibles | No releases available | pages/home.astro | Estado, validación o aviso |
| Sin lanzamiento seleccionado | No release selected | pages/home.astro | Estado, validación o aviso |
| Escoger otro lanzamiento | Choose another release | pages/home.astro | Campo, sección o acción |
| Editar selección | Edit selection | pages/home.astro | Campo, sección o acción |
| Elegir lanzamiento | Choose a release | pages/home.astro | Campo, sección o acción |
| En el aleatorio | In random mode | pages/home.astro | Campo, sección o acción |
| Selecciona el lanzamiento que verá el sitio. | Select the release to show on the site. | pages/home.astro | Campo, sección o acción |
| Usa su carátula o añade arte propio abajo. | Use its cover image or add custom artwork below. | pages/home.astro | Campo, sección o acción |
| Selecciona los lanzamientos que pueden aparecer. | Select the releases that may appear. | pages/home.astro | Campo, sección o acción |
| Solo aparecen lanzamientos visibles con imagen. | Only visible releases with images can appear. | pages/home.astro | Campo, sección o acción |
| Selecciona un lanzamiento arriba. | Select a release above. | pages/home.astro | Campo, sección o acción |
| Abrir su ficha → | Open its release → | pages/home.astro | Campo, sección o acción |
| Editar → | Edit → | pages/home.astro | Campo, sección o acción |
| Sacar del video | Extract from video | lib/poster.js | Campo, sección o acción |
| Póster del video | Video poster | lib/poster.js | Campo, sección o acción |
| Preparando fotogramas… | Preparing video frames… | lib/poster.js | Estado, validación o aviso |
| Subiendo póster… | Uploading poster… | lib/poster.js | Estado, validación o aviso |
| Subir… | Upload… | lib/subidor.js, pages/blog.astro | Campo, sección o acción |
| listo | ready | lib/fotogramas.js, lib/subidor.js | Campo, sección o acción |
| reemplazado | replaced | lib/subidor.js | Campo, sección o acción |
| Sin cambios. | No changes. | lib/subidor.js | Estado, validación o aviso |
| Artículos | Articles | pages/blog.astro | Campo, sección o acción |
| Grieta | Ticker | pages/blog.astro | Nombre de módulo del blog |
| Añadir artículo | Add article | pages/blog.astro | Campo, sección o acción |
| Vista previa de imagen | Image preview | pages/blog.astro | Navegación o acción |
| Imagen del highlight | Highlight image | pages/blog.astro | Campo, sección o acción |
| Una URL directa de imagen o un archivo propio. | Enter a direct image URL or upload a file. | pages/blog.astro | Ayuda, entrada o accesibilidad |
| Artículo | Article | pages/blog.astro | Campo, sección o acción |
| Etiqueta | Label | lib/piezas.js, pages/blog.astro | Campo, sección o acción |
| Link ↗ | Link ↗ | pages/blog.astro | Campo, sección o acción |
| Texto | Text | lib/barra.js, pages/blog.astro, pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Sin contenido | No content | pages/blog.astro | Estado, validación o aviso |
| Sin artículo seleccionado | No article selected | pages/blog.astro | Estado, validación o aviso |
| Artículo sin título | Untitled article | pages/blog.astro | Estado, validación o aviso |
| Subir artículo | Move article up | pages/blog.astro | Campo, sección o acción |
| Bajar artículo | Move article down | pages/blog.astro | Campo, sección o acción |
| Título del artículo | Article title | pages/blog.astro | Campo, sección o acción |
| Link externo | External link | pages/blog.astro | Campo, sección o acción |
| Visible | Visible | pages/blog.astro, pages/catalogo.astro | Campo, sección o acción |
| Oculto | Hidden | pages/blog.astro, pages/catalogo.astro | Campo, sección o acción |
| Eliminar artículo | Delete article | pages/blog.astro | Campo, sección o acción |
| Escribe el texto o extracto… | Write text or an excerpt… | pages/blog.astro | Campo, sección o acción |
| Contraseña incorrecta. | Incorrect password. | pages/entrar.astro | Campo, sección o acción |
| Escribe la contraseña. | Enter your password. | pages/entrar.astro | Campo, sección o acción |
| Demasiados intentos. Espera unos minutos. | Too many attempts. Wait a few minutes. | pages/entrar.astro | Campo, sección o acción |
| Falta configuración del panel. | The Studio is not configured. | pages/entrar.astro | Campo, sección o acción |
| No se pudo entrar. | Could not sign in. | pages/entrar.astro | Estado, validación o aviso |
| sesión vencida | session expired | lib/barra.js, lib/borrador.js, lib/material.js, middleware.js, pages/entrar.astro | Campo, sección o acción |
| no se pudo subir | could not upload | lib/material.js | Estado, validación o aviso |
| fallo de conexión | connection error | lib/barra.js | Campo, sección o acción |
| Guardado. El sitio se actualizará en breve. | Saved. The site will update shortly. | lib/barra.js | Estado, validación o aviso |
| Corrige los campos marcados. | Correct the highlighted fields. | pages/api/guardar.js | Campo, sección o acción |
| Hay una versión más reciente. Recarga antes de guardar. | A newer version is available. Reload before saving. | lib/api.js | Estado, validación o aviso |
| No hay cambios pendientes. | No pending changes. | lib/barra.js | Estado, validación o aviso |
| Guardando… | Saving… | lib/barra.js | Campo, sección o acción |
| guardando… | saving… | lib/barra.js | Campo, sección o acción |
| Guardado | Saved | Marco.astro, lib/barra.js, pages/catalogo.astro | Estado, validación o aviso |
| guardado | saved | lib/barra.js, lib/borrador.js, middleware.js, pages/catalogo.astro | Estado, validación o aviso |
| Guardar cambios | Save changes | Marco.astro, lib/barra.js | Estado, validación o aviso |
| Ver catálogo en lista | View catalog as list | pages/catalogo.astro | Campo, sección o acción |
| Ver catálogo en cuadrícula | View catalog as grid | pages/catalogo.astro | Campo, sección o acción |
| Ver lista | View list | pages/catalogo.astro | Campo, sección o acción |
| Ver cuadrícula | View grid | pages/catalogo.astro | Campo, sección o acción |
| Buscar o crear artista… | Search or create an artist… | lib/artistas.js | Ayuda, entrada o accesibilidad |
| Artistas disponibles | Available artists | lib/artistas.js | Campo, sección o acción |
| Poner el cuadro de | Use frame at | lib/poster.js | Campo, sección o acción |
| ID de imagen de Bandcamp | Bandcamp image ID | pages/catalogo.astro | Campo, sección o acción |
| URL de compra | Purchase URL | pages/catalogo.astro | Ayuda, entrada o accesibilidad |
| URL para escuchar | Listening URL | pages/catalogo.astro | Ayuda, entrada o accesibilidad |
| La fecha se añade desde el campo Fecha. | Add the date in the Date field. | pages/catalogo.astro | Campo, sección o acción |
| Texto para la grieta | Ticker text | pages/catalogo.astro, pages/home.astro | Campo, sección o acción |
| Rol__ Nombre | Role__ Name | pages/catalogo.astro | Campo, sección o acción |
| No se pudo leer el repo: | Could not read the repository: | lib/idioma.js | Estado, validación o aviso |
| URL o ruta de imagen | Image URL or path | pages/blog.astro | Ayuda, entrada o accesibilidad |
| URL de destino | Destination URL | pages/blog.astro | Ayuda, entrada o accesibilidad |
| no se pudo leer la duración del video | could not read the video duration | lib/fotogramas.js | Estado, validación o aviso |
| el navegador no pudo leer el video | the browser could not read the video | lib/fotogramas.js | Estado, validación o aviso |
| este video no se puede leer desde aquí; sube el póster a mano | this video cannot be read here; upload the poster manually | lib/fotogramas.js | Estado, validación o aviso |
| no se pudo abrir el video | could not open the video | lib/fotogramas.js | Estado, validación o aviso |

## Mensajes variables y estados

| Español / patrón | English / pattern | Lugar | Propósito |
|---|---|---|---|
| N cambios pendientes; N conflictos por resolver | N changes pending; N conflicts to resolve | `lib/barra.js` | Estado y accesibilidad |
| N disponibles; N de M marcados | N available; N of M selected | `pages/home.astro` | Selección de portada |
| Material de [lanzamiento]; Carátula de [lanzamiento] | Media for [release]; Cover of [release] | `pages/home.astro` | Encabezado y texto alternativo |
| Crear [artista] | Create [artist] | `lib/artistas.js` | Acción del buscador |
| Borrar [lanzamiento]; deshacer | Delete [release]; undo | `pages/catalogo.astro` | Confirmación y aviso |
| N lanzamientos importados; N artistas creados | N releases imported; N artists created | `pages/catalogo.astro` | Resultado de importación |
| Subiendo [archivo]; listo/reemplazado: [ruta] | Uploading [file]; ready/replaced: [path] | `lib/subidor.js`, `pages/blog.astro` | Carga de medios |
| Poner cuadro de [tiempo]; póster: [tiempo] | Use frame at [time]; poster: [time] | `lib/poster.js` | Tooltip y estado |
| Errores de validación/API con archivo e índice | Traducción con prefijo de archivo e índice conservado | `lib/idioma.js`, `lib/barra.js`, `lib/piezas.js` | Validación y salto al campo |
| borrador | borrador | `pages/vista.astro` | Sello exacto con borrador |
| sin borrador · datos publicados | no draft · published data | `pages/vista.astro` | Sello sin borrador |

## Validación y API

El prefijo técnico (`releases[n]`, `artists[n]`, `home.json`, `blog items[n]`) y los nombres editoriales permanecen iguales para conservar el enlace al campo. Estos son los mensajes que la interfaz muestra; los avisos internos no mostrados no forman parte del inventario visible.

| Mensaje ES (variables entre corchetes) | English | Lugar | Propósito |
|---|---|---|---|
| falta `slug`, `display`, `id`, `album`, `order`, `visible` o `title` | missing [field] | `lib/datos.mjs`, `lib/idioma.js` | Campo obligatorio |
| slug/id debe ser minúsculas y guiones; slug/id duplicado | must use lowercase letters and hyphens; duplicate slug/ID | `lib/datos.mjs`, `lib/idioma.js` | Identificador válido y único |
| necesita al menos un artista; artista [slug] no existe en artists.json | needs at least one artist; artist [slug] does not exist in artists.json | `lib/datos.mjs`, `lib/idioma.js` | Relación con artistas |
| fecha inválida [fecha] — se espera AAAA-MM-DD | invalid date [date] — expected YYYY-MM-DD | `lib/datos.mjs`, `lib/idioma.js` | Formato de fecha |
| bcImageId inválido [id] — se espera algo como a750972864 | invalid bcImageId [id] — expected an image ID such as a750972864 | `lib/datos.mjs`, `lib/idioma.js` | Código de carátula; ejemplo útil |
| sin `bcImageId` y sin `home.arte` — no hay ninguna imagen que mostrar | no `bcImageId` or `home.arte` — there is no image to show | `lib/datos.mjs`, `lib/idioma.js` | Imagen necesaria |
| purchaseUrl/listenUrl/url no es válida | purchaseUrl/listenUrl/URL is invalid | `lib/datos.mjs`, `lib/idioma.js` | Enlace válido |
| `role` y `name` o línea suelta en `texto` | provide `role` and `name`, or a plain line in `texto` | `lib/datos.mjs`, `lib/idioma.js` | Crédito completo |
| ruta absoluta / apunta a un archivo que no está en el repo | absolute path / points to a file absent from the repository | `lib/datos.mjs`, `lib/idioma.js` | Referencia de media |
| modo `fijo` sin `release`; release no existe; `azar` inválido | fixed mode has no release; release does not exist; invalid `azar` list | `lib/datos.mjs`, `lib/idioma.js` | Configuración del home |
| blog: id inválido/duplicado, artículo inexistente, imagen o URL inválida | blog: invalid/duplicate ID, missing article, invalid image or URL | `lib/datos.mjs`, `lib/idioma.js` | Integridad del blog |
| Corrige los campos marcados; Hay una versión más reciente. Recarga antes de guardar. | Correct the highlighted fields; A newer version is available. Reload before saving. | `pages/api/guardar.js`, `lib/api.js` | Guardado rechazado |
| archivo desconocido; llegó sin contenido; límite de tamaño | unknown file; no content; size limit | `lib/api.js`, `pages/api/guardar.js`, `pages/api/subir.js` | Solicitud inválida |
| eso no es una URL; solo se importa de bandcamp.com; discografía demasiado grande | enter a valid URL; only bandcamp.com can be imported; full discography requires the repository command | `pages/api/importar.js`, `lib/idioma.js` | Importación |
| material fuera de `media/`, nombre/tipo no válido, archivo ya existente, archivo demasiado pesado | path outside `media/`, invalid name/type, existing file, oversized file | `pages/api/subir.js`, `lib/idioma.js` | Carga de archivos |

## Recorrido ES/EN

1. Abrir `/entrar` y cambiar ES/EN. Comprobar contraseña, acción y errores.
2. Abrir `/catalogo`, una ficha, `/home` y `/blog`. Cambiar idioma y revisar encabezados, ayudas, placeholders, tooltips, aria-labels y estados.
3. Revisar el menú móvil: Opciones, Vista previa, Guardar cambios, Publicación, Guardado y el selector de idioma.
4. Abrir `/vista?w=home`, `catalogo`, `blog` y `about` con borrador: el sello es exactamente `borrador`.
5. En un origen limpio, abrir las cuatro vistas sin borrador: el sello indica datos publicados en ES o EN.

Verificado en navegador con la API local simulada, sin publicar ni alterar los JSON editoriales.
