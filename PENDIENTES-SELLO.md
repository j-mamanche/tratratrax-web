# Lo que falta del sello (etapa 0)

Esta es la lista de insumos que el código no puede inventar. Cada punto dice
**qué se pide**, **en qué formato** y **qué etapa se queda a medias sin eso**.
Se responde encima de este archivo o por mensaje; lo que llegue se convierte en
`data/*.json` y en archivos dentro de `media/`.

Actualizado: 2026-08-19, con las siete capturas del sello a la vista.

---

## 1. ~~Los tres links de las redes~~ — **resuelto**

Llegaron y ya están en `data/about.json`. Se leen en la línea del About cuando
se cierra la grieta, y son las del **sello** —las de los DJs siguen siendo el
destino de cada emblema:

| | URL |
|---|---|
| Instagram | https://www.instagram.com/tratratrax |
| YouTube | https://www.youtube.com/@tratratrax |
| Bandcamp | https://tratratrax.bandcamp.com/ |

El correo de bookings salió de las capturas y quedó escrito tal cual:
`Bookings: carin@outer-agency.com`. **Falta confirmar que es el que va
publicado.**

**Y una grafía que confirmar:** el plan escribió `NYSAN` y el repo tiene
`Nyksan`, que es lo que coincide con el Instagram `@nyksan_`. Quedó `Nyksan`. Si
la captura dice otra cosa, es un campo en `data/about.json`.

---

## 2. Los archivos de las cuatro banderas — bloquea la **etapa 5** (nav)

Las cuatro **ya están diseñadas** y se ven en las capturas. Lo que falta son los
archivos. Van a `media/banderas/` y se publican por Pages como el resto del
material — ver `media/banderas/LEEME.md` para los nombres y el formato exactos.

| # | Qué es | Nombre del archivo |
|---|---|---|
| 1 | estrellas sobre amarillo | `estrellas.png` |
| 2 | `SUR` sobre verde, con franjas roja y negra | `sur.png` |
| 3 | `TRATRRRRRATRAX` sobre el diagonal amarillo/gris con estrella | `diagonal.png` |
| 4 | `DE COLOMBIA / FROM COLOMBIA / DE COLOMBIA`, azul-rojo-azul | `de-colombia.png` |

Sirve vectorial (SVG o PDF) o mapa de bits a resolución de pantalla completa.
La bandera va **a sangre y tapa todo menos el nav**, así que se estira a la
ventana entera: si es mapa de bits, el lado largo no debería bajar de 2560 px.

---

## 3. Acceso al archivo de Figma — bloquea la **etapa 3a** (el gooey merge)

El filtro del home se va a replicar con un filtro SVG, y los parámetros
—`luma`, `spread`, `thresh`, `edge softness`, `fg/bg`, `invert`, `source mix`—
están en el archivo de Figma donde se diseñó. Con acceso se leen por MCP y se
comparan contra la implementación en vez de adivinarlos a ojo.

Basta con el link del archivo, con permiso de lectura.
https://www.figma.com/design/zEWKcUmHPOL3oGipLntLMN/tratra-_-web?node-id=76-2&p=f&t=UKmwdQJ8pDHI5vI8-0
---

## 4. Numeración del catálogo — bloquea el **panel (etapa 6)** y ensucia el validador

El validador lo viene avisando desde julio. Son tres preguntas, y el panel de la
etapa 6 va a mostrar las tres en la cara, así que conviene cerrarlas antes.

### 4.1 `TRA028` está en dos releases

| Número | Fecha | Release | Artista |
|---|---|---|---|
| TRA028 | 2025-06-27 | A Tropical Entropy | Nick León |
| TRA028 | 2025-10-15 | A Tropical Entropy remixed | Nick León |

Viene así del HTML de Cargo. ¿Las remezclas comparten el número del álbum a
propósito, o a una de las dos le falta el suyo?

Sí, sí lo comparten

### 4.2 El hueco TRA018–TRA024

Hay siete números sin usar (TRA018 a TRA024) y **siete releases sin número**
entre 2024-03 y 2024-11. Encajan uno a uno por fecha:

| Propuesto | Fecha | Release | Artista |
|---|---|---|---|
| TRA018 | 2024-03-29 | Cilicio | Maoupa Mazzocchetti |
| TRA019 | 2024-06-05 | Split 1 | TSVI · DJ Babatr |
| TRA020 | 2024-07-05 | Mecha | Doctor Jeep |
| TRA021 | 2024-07-26 | Bikini | Nick León · Erika de Casier |
| TRA022 | 2024-08-22 | Split 2 | Aquarian · Hodge |
| TRA023 | 2024-10-18 | Desde los oídos de un sapo | Lechuga Zafiro |
| TRA024 | 2024-11-15 | no pare, sigue sigue 3 | Various Artists |

**Es una hipótesis, no un dato.** No se escribe en `releases.json` sin que el
sello lo confirme. (Ojo: `Ruido y Flor`, del 2024-05-07, cae en medio de ese
rango pero lleva número de otra serie —ver 4.4—, así que no ocupa lugar.)

### 4.3 Otros tres sin número

No entran en el hueco de arriba y hoy salen sin nada en la etiqueta:

| Fecha | Release | Artista |
|---|---|---|
| 2025-11-28 | no pare, sigue sigue 4 | Various Artists |
| 2026-06-12 | Mzansi Bass compilation | Various Artists |

¿Las compilaciones llevan número de catálogo o van sin él a propósito?

### 4.4 Un número mal escrito

`Ruido y Flor` (Ezmeralda, 2024-05-07) tiene `"catalog": "AMBIE—TÓN001"`, con
una raya donde debería ir una `N`. Se importó así del HTML de Cargo. ¿Es
`AMBIENTÓN001`?

---

## 5. Lo que ya no está pendiente

- ~~Textos del About~~ — llegaron en las capturas. Falta solo el punto 1.
- ~~Diseño de las banderas~~ — llegaron las cuatro. Falta solo el punto 2.
- ~~Emblemas de los DJs~~ — llegaron y están en `media/about/`, con su GIF y su
  cuadro fijo. Ya no llevan la marca `relleno` y el validador no los avisa.
