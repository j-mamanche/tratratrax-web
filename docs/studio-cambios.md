# Pendientes y errores de Studio

La lista de la barra compara el borrador con `base` (la copia leída del repositorio al abrir). Cada artículo se identifica por `id`, cada lanzamiento por `id` y cada artista por `slug`. El orden de las claves JSON, el orden físico de estas listas y la diferencia entre una propiedad vacía y una omitida no producen cambios falsos. El orden editorial se detecta mediante `order`.

Los enlaces usan `id` y `campo` en la URL. Al cargar otra página se conserva el borrador en `sessionStorage`; el editor abre el objeto, desplaza el campo a la vista y le da foco cuando existe. Los mensajes de validación basados en índices se convierten a `id` antes de navegar. Esto cubre artículos del blog, highlight, grieta, Home, lanzamientos y artistas.

## Fallbacks explícitos

- **Artículo o lanzamiento eliminado:** abre la sección correspondiente con el nombre del objeto eliminado y un aviso que pide revisar las referencias. No genera un enlace a un `id` ausente.
- **Artista:** no tiene ficha propia. Si un lanzamiento lo usa, abre el campo Artistas de ese lanzamiento. Si ya no hay uno, abre Catálogo con contexto visible. `slug` y `aliases` se gestionan desde ese flujo, sin un control separado.
- **Artículo o lanzamiento sin `id` válido:** abre la sección con el error y su posición actual, porque no hay una identidad segura para un link directo.
- **Orden de lanzamiento:** lleva a su fila en el carril, donde se arrastra. El orden de artículo lleva a su tarjeta y sus botones de movimiento.
- **Campos estructurados o sin control individual:** `highlight.imageAlt`, propiedades desconocidas del Blog, `home.video.poster`, `credits`, `note`, `home.azar` y propiedades futuras llevan al bloque o control contenedor más cercano. La selección aleatoria de Home se abre antes del salto.
- **About:** Studio todavía no tiene editor de About; el enlace muestra ese límite en Catálogo.

`node --test tools/test-cambios.mjs` verifica cambios simultáneos, equivalencias, destinos estables, guardar, revertir y recuperación tras un conflicto remoto. `npm run build:panel` verifica la compilación de las rutas del panel.
