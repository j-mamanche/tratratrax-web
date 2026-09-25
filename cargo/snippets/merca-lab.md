# Merca Lab — montaje aislado para probar en Cargo

Esta alternativa **no sustituye** `/merca` ni las fichas actuales. Crear una página nueva de prueba en Cargo, por ejemplo `merca-lab`, sin enlazarla al nav y sin ponerle el tag `merch`. Mantenerla en borrador mientras se revisa. Si se publica para una prueba privada, quien conozca la URL puede abrirla.

En **Edit HTML → Page** de esa página, pegar únicamente:

```html
<div data-ttx="merca-lab"></div>
```

El CSS del contenido y el JavaScript del widget viajan en `ttx.js`, que ya carga el HTML global del sitio. Para la geometría del overlay, pegar también [`merca-lab.css`](merca-lab.css) en el CSS global del sitio de prueba. Sus reglas solo alcanzan la página que contiene este placeholder. Para ver el piloto en Cargo hará falta que el HTML global apunte a una versión del bundle que incluya `merca-lab`; cambiar esa versión afecta el bundle compartido y se debe probar antes en un sitio de prueba. El widget no modifica las otras páginas si no tienen ese placeholder.

La página debe ser overlay si se quiere probar el mismo gesto de apertura/cierre de la vitrina actual. El enlace «CIÉRRAME» usa `rel="close-overlay"` de Cargo. **No reemplazar** el `gallery-grid`, su `thumbnail-index-metadata`, el CSS global de `/merca` ni sus páginas de producto.

Los productos se editan en **Studio → Merca Lab**. `data/merch.json` contiene 18 fichas importadas de Bandcamp, todas ocultas. Solo aparecen en una página de Cargo los productos marcados «Mostrar en la vitrina piloto»; la vista previa de Studio muestra también los borradores. El stock de tarjeta y ficha sale del mismo campo, y el control de compra solo enlaza afuera cuando el producto disponible tiene una URL válida.

Cada tarjeta abre su ficha dentro del mismo overlay, sin navegar a una URL de Cargo. «Volver a merca» ocupa la banda superior de la ficha. La vista previa local todavía admite `?ttx-product=<id>` para inspeccionar una ficha directa.

Pendientes para decidir antes de sustituir la tienda: comprobar el diseño y la navegación en Cargo real (incluida navegación AJAX y móvil), la convivencia con el nav y el ancla, el uso de imágenes y miniaturas, la migración editorial de cada ficha, y el tratamiento de URLs antiguas. Este piloto no crea ni redirige las páginas individuales existentes.
