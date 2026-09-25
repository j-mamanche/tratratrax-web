# Merca en Cargo — estado comprobado el 24-09-2026

La vitrina pública es `/merca` (`Z4026822794`), una página overlay. Su `gallery-grid` usa `thumbnail-index="tag:merch"`. El tag `merch` incluye la ficha en la selección; los tags de stock son `in-stock`, `few-units` y `out-of-stock`. El [inventario y respaldo](../respaldo-2026-09-24/mapa-antes-despues.md) separa el borrador del sitio publicado.

## Operación de una ficha

1. En el editor de Cargo, abrir **Pages** desde el botón de menú de la esquina superior derecha y elegir la ficha por nombre. Hay dos páginas tituladas `TEE CLÁSICA TRA`: identificar siempre por ID, slug y contenido antes de editar.
2. Crear una ficha con **Pages → ··· → New Page** solo cuando el equipo haya entregado el texto, las imágenes, los enlaces de compra y el estado. Editar contenido e imágenes en la página de Cargo; no hacerlo desde Studio. Conservar títulos, descripciones y precios existentes hasta recibir aprobación editorial.
3. En **Pages**, clic derecho sobre la ficha → **Settings…**. El campo visible dice **Tags (separate by comma)**. Mantener `merch`; cuando el equipo confirme el inventario, dejar exactamente **uno** de `in-stock`, `few-units` u `out-of-stock`, separados por coma. Revisar que no haya dos tags de stock. Los cinco productos del borrador tienen `merch` y un tag de stock cada uno, pero solo cuatro aparecen en la versión pública.
4. Revisar la miniatura en el mismo panel **Settings… → Thumbnail** y el contenido e imágenes en la ficha. Guardar los cambios siguiendo el flujo de Cargo. Antes de publicar, comparar el borrador completo con el sitio público: hay una Tee adicional (`X0596556527`) y `Blog copy` (`Y3826516247`) en el editor.
5. Después de publicar, abrir `/merca` por URL directa y por el nav. Comprobar que la tarjeta correcta aparece una vez, que su punto usa el tag de stock, que la ficha abre y cierra, que conserva URL/ID, y que el rótulo y el control de compra muestran el estado editorial aprobado. Hacer esta comprobación por **cada** producto.

## Integración observada

El script global `tags-de-pagina.html` está en el HTML global publicado y copia tags a clases `tag-*` del `div.page`; se comprobó en las cuatro fichas públicas. El CSS de `/merca` usa esas clases para el punto de la grilla. Solo la ficha `H0731431535` tiene CSS local de rótulo basado en el tag. Las otras tres fichas públicas tienen textos y controles de compra propios, que no se sincronizan automáticamente con el tag. El botón de compra de `O1289033983` sigue visible aunque la tarjeta tenga `out-of-stock`.

Las discordancias son pendientes editoriales, no correcciones implícitas: `H0993208634` lleva `few-units` y dice “Sold out”; `O1289033983` lleva `out-of-stock` y muestra “Buy €35”, con encabezado visible de beach towel y descripción de camiseta. El editor muestra una Tee adicional `X0596556527` con `merch,few-units` que no está en la grilla pública. Confirmar con el equipo qué datos son correctos antes de tocar tag, rótulo, botón o contenido.

## Organización

El editor no tenía Set/carpeta para productos. Se creó **Productos de Merca** (`W2894131921`) vacío en el borrador. No se movieron fichas ni se publicó, porque el editor y la versión pública no coinciden y la comprobación pública exigida por tanda publicaría también páginas adicionales. La prueba de movimiento y la preservación de rutas quedan pendientes de un borrador aislado o una decisión editorial sobre esas páginas.
