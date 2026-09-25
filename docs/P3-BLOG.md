# P3 — Ticker y highlight del blog

Medido el 24-09-2026 en Chrome headless. P0 corresponde a la página pública de
Cargo; las columnas «preview» corresponden a `/preview/blog` local, con el
espaciado P1. El preview usa otra escala de `rem` y otro contenedor que Cargo:
sus coordenadas absolutas no sustituyen una medición después de publicar.

| Entorno | Estado | Headline y | PRENSA y | Archivo y | Copias del ticker |
|---|---|---:|---:|---:|---:|
| Cargo P0, 1440×900 | reposo | 18,6 | 92,4 | 110,2 | 2 |
| Cargo P0, 2560×1440 | reposo | 29,8 | 147,8 | 176,4 | 2 |
| Preview, 390×844 | antes: reposo / foco | 10 / 10 | 227 / 377,19 | 251,66 / 401,84 | 2 |
| Preview, 390×844 | después: reposo / foco / clic | 10 / 10 / 10 | 227 / 227 / 227 | 251,66 / 251,66 / 251,66 | 2 |
| Preview, 1440×900 | antes: reposo / hover | 10 / 10 | 175,73 / 202 | 204,70 / 230,97 | 2 |
| Preview, 1440×900 | después: reposo / hover / foco / clic | 10 en todos | 175,73 en todos | 204,70 en todos | 3 |
| Preview, 2560×1440 | antes: reposo / hover | 10 / 10 | 127,36 / 128 | 156,33 / 156,97 | 2 |
| Preview, 2560×1440 | después: reposo / hover / foco / clic | 10 en todos | 127,36 en todos | 156,33 en todos | 3 |
| Preview, 3200×1200 | antes: reposo / hover | 10 / 10 | 127,36 / 128 | 156,33 / 156,97 | 2 |
| Preview, 3200×1200 | después: reposo / hover / foco / clic | 10 en todos | 127,36 en todos | 156,33 en todos | 4 |
| Preview, 1440×900 con zoom de layout 125 % | antes: reposo / hover / foco | 12,5 en todos | 252,13 / 453,75 / 453,75 | 288,36 / 489,98 / 489,98 | 2 |
| Preview, 1440×900 con zoom de layout 125 % | después: reposo / hover / foco | 12,5 en todos | 252,13 en todos | 288,36 en todos | 3 |

P0 midió un crecimiento de fila de 0,5 px a 1440 y de 0,9 px a 2560 al
abrir el highlight; no registró por separado las coordenadas y posteriores.

La diferencia grande al hacer hover a 1440 px en el preview venía además del
rótulo decorativo `READ`: al aparecer añadía una línea al título. Se conserva
el fondo verde y la imagen del highlight y se oculta ese rótulo solo allí; el
archivo sigue mostrándolo. La imagen ocupa la altura fraccionaria real de la
fila, sin `Math.ceil` ni una escritura de altura en `ResizeObserver`. Con una
imagen SVG de prueba de 600×900, a 1440 px se mostró dentro de la segunda
columna a x=525,28, y=10, alto=140,73 px, y el ticker permaneció en y=175,73.
La imagen editorial externa no cargó en el preview automatizado, así que la
prueba de su geometría usó el SVG de prueba.

En P0 la distancia entre el final del highlight y PRENSA era de unos 16,3 px
a 1440 y 25,9 px a 2560. Sigue la escala tipográfica del sitio y corresponde
al margen existente del ticker. La composición comparable de escritorio deja
un espacio grande *después* de PRENSA antes del archivo como gesto editorial.
En móvil P0 registró 15,6 px entre las coordenadas superiores de PRENSA y el
archivo; la composición comparable los mantiene próximos. No se aumentaron
márgenes: el desplazamiento observado dependía de la altura de la fila y del
rótulo que refluía, no de una separación insuficiente.

## Cobertura funcional

- En el preview a 3200 px, la ventana del ticker midió 3065,59 px y cada
  repetición 1257,34 px: cuatro copias cubren la ventana incluso al final del
  ciclo. A 2560 px se crean tres; a 390 px, dos. La animación recorre exactamente
  una repetición y la duración depende de su ancho y escala tipográfica, no
  del número de copias.
- Solo la primera repetición conserva enlace y lectura accesibles. Las demás
  llevan `aria-hidden="true"` y sus enlaces `tabindex="-1"`.
- `ResizeObserver` actualizó el número de copias al pasar de 3200 a 390 px;
  un zoom de layout a 125 % recalculó ancho y duración. Una mutación de texto
  y `href` regeneró las copias; sustituir el host como en AJAX desmontó la
  instancia anterior y montó una nueva.
- Con `prefers-reduced-motion: reduce` hubo una sola copia, sin animación y con
  texto envuelto dentro de la ventana.
- El clic real del highlight abrió una pestaña externa y mantuvo `scrollY=0`,
  PRENSA y=175,73 y archivo y=204,70 a 1440 px.
- `npm run build` terminó con 0 errores y 43 avisos editoriales preexistentes;
  `git diff --check` pasó.

La calibración del placeholder y la reserva de nav no cambiaron, por eso el
snippet de Cargo no necesita ajustes de P3. Falta comprobar el bundle publicado
en Cargo tras el despliegue, tanto por URL directa como por navegación AJAX.
