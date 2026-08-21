# Las banderas del nav

Las cuatro del sello, tal como llegaron el 2026-08-19. Se publican por GitHub
Pages con el resto del material y las usa el **script de la bandera** del nav
(sección 7 de [cargo/snippets/nav.md](../../cargo/snippets/nav.md)): pasar la
mano por el logo tapa la página con una al azar, y fuera del home, con el
usuario quieto, cada 20–40 s una se asoma sola un instante.

| Archivo | Qué es | Tinta del nav |
|---|---|---|
| `estrellas.svg` | tres estrellas sobre amarillo | negro |
| `sur.svg` | `SUR` sobre verde claro, con franjas roja y negra | negro |
| `diagonal.svg` | `TRATRRRRRATRAX` sobre el diagonal amarillo/gris con estrella | negro |
| `de-colombia.svg` | `DE COLOMBIA / FROM COLOMBIA / DE COLOMBIA`, azul-rojo-azul | blanco |

**SVG de `1440×1024`**, así que escalan a cualquier pantalla sin pesar nada. Van
**a sangre** (`object-fit: cover`): en una ventana muy apaisada o muy alta se
recortan por el lado largo, a propósito — una bandera con franjas blancas a los
lados no es una bandera.

**La tinta no se mide, va escrita.** El script del blanco/negro del nav mide con
`elementsFromPoint` y la bandera es `pointer-events: none` —tiene que serlo, o se
comería los clics de la página—, así que no la puede ver. Los cuatro valores de
la tabla se midieron una vez sobre la franja donde cae el nav, en tres anchos de
ventana, y se dejaron escritos en el array `BANDERAS` del script.

**Para cambiar el set:** se sobreescriben los archivos y se toca ese array. Si
entra una bandera nueva, hay que decidirle la tinta — si el pie es claro, negro;
si es oscuro o muy saturado, blanco.
