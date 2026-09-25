# Mapa antes → después

Fecha de corte: 24-09-2026, Bogotá. Fuente del borrador: panel **Pages** de Cargo. Fuente pública: ocho respuestas HTML y su `window.__PRELOADED_STATE__` en `publicado/`, con SHA-256 en `publicado/manifest.json`.

| Elemento | Antes en editor | Después | Motivo |
|---|---|---|---|
| Set `Productos de Merca` | No existe | Creado vacío en el borrador, ID `W2894131921`, padre `root` | Un solo destino organizativo; ningún producto movido. |
| BEACH TOWEL `H0731431535` | `root`, `beach-towel-añañay`, `merch,few-units` | Igual | Sin movimiento. |
| TEE duplicada `X0596556527` | `root`, hash de editor `tee-clásica-tra-1`, `merch,few-units` | Igual | No aparece en grilla pública. |
| TEE `O1289033983` | `root`, `tee-clásica-tra`, `merch,out-of-stock` | Igual | Sin movimiento. |
| Scarf `H0993208634` | `root`, `perreando-y-llorando-scarf`, `merch,few-units` | Igual | Sin movimiento. |
| Cassette `T2595752217` | `root`, `memoria-special-edition-cassette`, `merch,in-stock` | Igual | Sin movimiento. |
| Vitrina `Z4026822794` | `root`, `/merca`, overlay, `thumbnail-index="tag:merch"` | Igual | Sin movimiento. |
| Nav escritorio y móvil | `root`, pinned, IDs `L3482832595` / `N1901077103` | Igual | Sin movimiento. |

El estado publicado tiene cuatro fichas en la grilla. Publicar el borrador actual podría publicar también la segunda Tee y `Blog copy`. El Set creado está solo en el borrador; la respuesta pública de `/merca` todavía contiene únicamente el Set `root`.

### Prueba reversible, sin publicar

Se arrastró solo `H0731431535` al Set `W2894131921`. `data-parent` cambió de `root` a `W2894131921` y el editor pasó de `/pid/H3597552387#beach-towel-añañay` a `/pid/W2894131921#beach-towel-añañay`: mismo ID y hash, **ruta contenedora distinta**. Se arrastró de vuelta a la raíz; tras recargar, `data-parent=root` y `/pid/H3597552387#beach-towel-añañay` quedaron restaurados. La grilla pública conservó los cuatro items, `thumbnail-index="tag:merch"` y las clases de stock. El traslado de prueba no llegó a publicarse; por eso no demuestra si la URL pública directa cambiaría.

**Impacto para decidir:** un Set cambia el contexto de navegación del overlay en la vista previa. Cargo también documenta que un overlay dentro de un Set puede abrirse al visitar páginas de ese Set. La ruta de preservación segura hoy es conservar las fichas en `root` y usar `merch` para la vitrina. Si el equipo exige agruparlas físicamente, probar primero en una copia aislada del borrador, resolver la Tee adicional y `Blog copy`, definir los enlaces antiguos y nuevos, y validar el comportamiento publicado de cada overlay antes de publicar el movimiento. No se ejecutaron más tandas ni publicación.
