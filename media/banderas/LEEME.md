# Las banderas del nav

Las cuatro del sello, tal como llegaron el 2026-08-19. Se publican por GitHub
Pages con el resto del material y las usa el **script de la bandera** del nav
(sección 7 de [cargo/snippets/nav.md](../../cargo/snippets/nav.md)): pasar la
mano por el logo tapa la página con una al azar, y fuera del home, con el
usuario quieto, cada 20–40 s una se asoma sola un instante.

## Cada bandera son dos piezas

Los archivos de esta carpeta **no traen fondo**: solo el dibujo, sobre un
cuadrado de `1000×1000`. El color lo pinta el script, con CSS, sobre la pantalla
entera. El cuadrado se planta en la mitad midiendo **el lado corto de la
ventana**: en desktop lo manda el alto y el color se va hacia los lados; en
teléfono lo manda el ancho y el color se va hacia arriba y hacia abajo.

Antes era una sola pieza —el SVG de `1440×1024` completo, a sangre con
`object-fit: cover`— y en un teléfono eso recortaba por el lado largo: de
`TRATRRRRRATRAX` se veían cinco letras. Partido en dos, el dibujo siempre cabe y
lo que se estira es únicamente el color, que es lo que se puede estirar sin que
nadie lo note.

**Cada región tiene una sola geometría, y por eso el campo no está también
dentro del SVG.** Si estuviera, el borde del cuadrado sería una costura entre dos
dibujos que tendrían que coincidir al píxel — y no coincidirían.

Los originales completos, de `1440×1024`, están en `originales/`. De ahí sale
todo lo de aquí y ahí hay que volver si el sello manda arte nueva.

| Archivo | Qué dibuja | Qué pinta el CSS | Tinta del nav |
|---|---|---|---|
| `estrellas.svg` | las tres estrellas | amarillo de pared a pared | negro |
| `sur.svg` | la palabra `SUR` | verde, con las franjas roja y negra arriba | negro |
| `diagonal.svg` | `TRATRRRRRATRAX` y la estrella | el diagonal amarillo/gris | negro |
| `de-colombia.svg` | los tres letreros | azul con la barra roja en el medio | blanco |

## Los números

El arte se escaló por la **proporción horizontal** del original (`1000/1440`),
porque el dibujo de tres de las cuatro va amarrado al ancho: la palabra que
cruza la bandera, las barras que la dividen. De ahí salen los `calc` del script:

- `0.08681 × lado` — el grosor de una franja de `sur` (eran 125 de 1440).
  Las dos franjas van pegadas al **borde de arriba de la ventana**, no al
  cuadrado: flotando a media pantalla parecerían una bandera pequeña puesta
  encima de otra cosa.
- `lado / 6` — el medio ancho de la barra roja de `de colombia`, que es el
  tercio del medio del cuadrado.
- El diagonal es el de las esquinas del cuadrado, o sea 45°. Prolongado hasta
  los bordes es exactamente la línea de 45° que pasa por el centro de la
  ventana, y eso es lo que hace un `linear-gradient(135deg, …)` con un corte
  seco al 50%. Por eso el corte y el cuadrado nunca se pelean.

**`estrellas` es la excepción**: su racimo se midió contra el lado corto
(`1000/1024`) y ocupa el 55,3% del cuadrado. Las otras tres tienen a qué
amarrarse; una estrella suelta no, y con la proporción horizontal quedaba
pequeña y perdida en el medio del amarillo.

## La tinta no se mide, va escrita

El script del blanco/negro del nav mide con `elementsFromPoint` y la bandera es
`pointer-events: none` —tiene que serlo, o se comería los clics de la página—,
así que no la puede ver. Los cuatro valores de la tabla están escritos en el
array `BANDERAS` del script.

**El nav va abajo**, así que lo que hay que mirar es el pie de la pantalla. Con
este reparto las cuatro son ahí del mismo color a cualquier ancho —amarillo,
verde, gris o azul/rojo— y por eso la tabla vale sin volver a medir. Verificado
a 1440×900, 768×1024 y 390×844.

**Para cambiar el set:** se toca el arte en `originales/`, se vuelve a sacar el
cuadrado sin fondo, y se ajusta el `fondo` y la `tinta` de esa bandera en el
array. Si entra una bandera nueva, hay que decidirle la tinta — si el pie es
claro, negro; si es oscuro o muy saturado, blanco.
