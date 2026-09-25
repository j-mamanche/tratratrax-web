# P2 — nav móvil y cursor de enlaces

Fecha: 24-09-2026 (hora de Bogotá). Publicado en Cargo a las 20:39; tamaños corregidos y publicados a las 20:58.

## Estado aplicado

- `N1901077103`: `column-set` de una fila; `slot="0"` contiene el único logo enlazado a `home` con `rel="history"`, `slot="1"` contiene About, Catalog, Blog y Merca. Cargo reconstruye un `slot="2"` vacío; el CSS lo oculta.
- CSS de la página móvil: logo a la izquierda, menú a la derecha, separación mínima `.5rem`, los mismos colores de highlight, tinta automática y prioridad de tinta de bandera. `scale="70%"` da 79,8 × 34,0 px a 390 px; desde 500 px de viewport el logo se limita a 100 px.
- Nav desktop: el logo enlazado a Home pasó de `scale="15%"` a `20%` y se limita a 125 px en ultraancho. El preview tenía un ancho fijo erróneo de 17,1 px; ahora usa el porcentaje de la columna como Cargo.
- HTML global: `scan()` solo consulta `[id="L3482832595"] [data-glitch]`. `markActive()` conserva los dos IDs y el `MutationObserver`, por lo que la marca activa sigue tras AJAX. Se quitó la rama de desplazamiento del lema móvil, ya sin uso.
- CSS global: se conservaron las reglas previas y se añadieron **solo** los dos selectores de cursor de abajo.

## Inventario del cursor antes de editar

| Lugar | Estado publicado inicial | Decisión |
|---|---|---|
| Nav desktop/móvil y highlight Blog | `a:hover` computaba machete `Z314…` | Conservar. |
| Enlaces de About, compras de Catalog, ticker/archivo de Blog y texto de Merca | Anchors cubiertos por `a:hover` | Conservar. |
| Título enlazado de Home | `pointer` del selector `[data-ttx='home'] :is(a,button).ttx-home-titulo`, más específico que `a:hover` | Añadir selector específico para ese `a[href]` al hover fino. |
| Logo enlazado del nav y cuatro `media-item[href]` de Merca | `figure` del shadow DOM usa `--image-link-cursor`, inicialmente `pointer`; el host queda `auto` | Cambiar la variable del host solo en hover fino. |
| Carril de Catalog | `grab`, `grabbing` durante arrastre; links `pointer` en reposo y machete al hover por `a:hover` | Conservar gesto y semántica de controles. |
| Etiqueta y carátula de Catalog | Botón/atajo de apertura con `pointer` | Conservar. |

## Recurso y reglas exactas

Los hashes `Z3149376184713067437113458768074` (publicado) e `I2846370861133166636658288179402` (snapshot) descargaron 755 bytes de `image/png` con `Referer: https://tratratrax.cargo.site/`. Son binariamente idénticos: 36×38 px, transparencia, dibujo efectivo de 19×19 px desde x=17 y SHA-256 `d69af007f99c46bd3d65a61620f520497cf8f2fa0bd553c542bc42f49272cdec`. La petición directa sin `Referer` devolvió 403. El hotspot `16 0` es válido y contiguo al borde superior izquierdo del dibujo. Se usa el hash publicado; el fallback nuevo es `pointer`. La regla previa `a:hover` usa `auto` como fallback y sigue vigente.

```css
@media (hover: hover) and (pointer: fine) {
  [data-ttx="home"] a.ttx-home-titulo[href]:not([aria-disabled="true"]):not([disabled]):hover {
    cursor: url("https://freight.cargo.site/t/original/i/Z3149376184713067437113458768074/pointer-machete_5.png") 16 0, pointer;
  }

  media-item.linked[href]:not([aria-disabled="true"]):not([disabled]):hover {
    --image-link-cursor: url("https://freight.cargo.site/t/original/i/Z3149376184713067437113458768074/pointer-machete_5.png") 16 0, pointer;
  }
}
```

El primer selector gana por especificidad al `cursor:pointer` del widget Home. El segundo atraviesa el shadow DOM mediante la variable que consume `figure`. No se modifica `:focus-visible`; el título de Home conservó un outline computado de `1px solid` al tabular. No hay selectores de texto editable ni reglas sobre controles deshabilitados.

## Verificación

En el publicado, a 390×844 el logo pasó de 45,6 a 79,8 px de ancho y los links conservaron x=191,01…358,81, sin segundo logo ni `data-glitch` móvil. A 1728 px desktop pasó de 82,9 a 110,7 px; a 2560 px el límite de 125 px mantiene el solapamiento preexistente con la franja inferior del catálogo en ~8 px. A 768 px el logo móvil queda en 100 px. El logo navegó a `/home`; Catalog y Blog navegaron por `rel="history"`, con marca activa tras el observador. El lema desktop siguió animado. Se probaron 320/375/390/768 px; no apareció desborde horizontal. En fondo oscuro el logo es blanco; en Blog claro `filter:invert(1)` y tinta negra. La bandera se verificó también en el publicado con el logo ampliado y tintas blanca y negra.

En desktop se hizo clic en About → Catalog → Blog → Merca desde los links del nav, sin perder el nav ni el glitch. Merca abrió su overlay sobre Blog. El hover computado del nav y del highlight Blog siguió usando el machete publicado. El título Home y el `figure` enlazado de Merca computaron el machete nuevo con fallback `pointer`. En Catalog se verificó `grab`, scroll horizontal con rueda (0→1713 px) y arrastre con mouse (1713→1913 px), con retorno a `grab` al soltar. Esas interacciones se automatizaron en Chrome; una prueba con trackpad físico sigue pendiente.

## Capturas

- [Home móvil](p2-evidence/mobile-home.png)
- [Catalog móvil](p2-evidence/mobile-catalog.png)
- [Blog móvil](p2-evidence/mobile-blog-published.png)
- [Bandera móvil publicada](p2-evidence/mobile-bandera-published.png)
- [Home escritorio](p2-evidence/desktop-home.png)
- [Catalog escritorio](p2-evidence/desktop-catalog.png)
- [Blog escritorio](p2-evidence/desktop-blog.png)
