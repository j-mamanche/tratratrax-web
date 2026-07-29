# Contexto del proyecto

Sitio de TraTraTrax (sello de música electrónica, Bogotá). El sitio vive en
**Cargo.site** y se queda ahí — este repo le pone el contenido, no lo reemplaza.

Lee **PLAN.md** antes de proponer arquitectura. Ahí está lo decidido y el porqué.

## Reglas que no se negocian

- **`data/*.json` es la fuente de verdad.** El HTML se genera desde ahí, nunca al
  revés. Si algo hay que editar a mano en Cargo, es un síntoma, no una solución.
- **No hay player de audio.** Se descartó explícitamente. Cada release muestra
  información y dos links: `purchaseUrl` (Bandcamp) y `listenUrl` (linktree).
- **Nada de guiones para separar nombres de artista en `display`.** Se escribe
  "Nick León", no "Nick-León". En `slug` sí van, ahí son identificador técnico.
  Las grafías viejas quedan en `aliases` para que el importador las reconozca.
- **CSS de widget siempre scopeado a `[data-ttx]`.** El CSS global de Cargo es
  agresivo y pisa estilos; y al revés, un widget no puede romper la página donde
  lo peguen.
- **El loader necesita `MutationObserver`.** Cargo navega por AJAX: si solo se
  escucha `DOMContentLoaded`, los widgets aparecen en la primera carga y nunca
  más. Es el bug clásico de este enfoque.
- **No usar jsDelivr para los datos.** Cachea 12h una rama: se publicaría un
  release y aparecería al día siguiente. GitHub Pages para todo.
- **El material propio va en `media/`, nunca en `public/`.** `public/` es
  generado: `tools/build-widgets.mjs` la borra entera en cada compilación. El
  build copia `media/` adentro. Las rutas en `data/*.json` son relativas a la
  raíz del sitio (`media/tra032.mp4`), no a la carpeta de datos.

## Cómo se resolvió el scroll horizontal

El catálogo viejo metía columnas de Cargo en un `marquee-set` con la velocidad
en cero para que solo respondiera al dedo. Era frágil y Cargo no renderizaba
todos los stacks cuando eran muchos.

Ahora el catálogo es un `<div>` que llenamos nosotros, con `overflow-x: auto` y
`scroll-snap` nativos. **No volver al marquee.**

## Estado del contenido (2026-07-27)

- 35 releases importados de Bandcamp, de 2020 a 2026.
- Faltan los números TRA018–TRA024. Hay 14 releases sin número; siete de ellos,
  entre 2024-03 y 2024-11, encajan exactamente en ese hueco por fecha. **Es una
  hipótesis, no un dato** — confirmar con el sello antes de escribirlo.
- TRA028 está repetido en dos releases de Nick León (el álbum y sus remezclas).
  Viene así del HTML de Cargo. El validador lo avisa; falta que el sello decida.
- El blog es contenido placeholder.
- El About ya existe (`BRIEF-ABOUT.md`), pero sus tres emblemas son **material
  de relleno**: estampas generadas, marcadas `"relleno": true`. El validador lo
  avisa en cada corrida. Falta el material del sello.

## Los widgets

`src/widgets/` es lo que corre dentro de Cargo: JS sin framework, bundle IIFE
(no ESM — `document.currentScript` es `null` en un módulo, y de ahí sale la URL
de los datos y del CSS). `npm run build:widgets` los compila a `public/`, que es
**generado y no se versiona**.

El stack de tres bandas —visor · banda · contenido— vive en `_runtime/stack.js`
y `tokens.css`. Antes de maquetar una pantalla nueva, partir de ahí: home,
catálogo y merca son la misma maquetación con otro `--ttx-visor-h` y otro
`--ttx-visor-fx`.

La banda no termina en el widget: el stack publica `--ttx-ancla` en el
`<html>` con el borde de abajo de esa barra, y las gavetas de Cargo —la
merca— se acuestan contra ella. Nunca copiar ese número a mano a un CSS de
página; se desincroniza al mover `--ttx-visor-h` y nadie se entera.

**Calibrar es poner variables en el placeholder**, no editar el widget. Un
`style` inline le gana al CSS global de Cargo, que es lo único que siempre
funciona allá.

## Al terminar cualquier cambio en `data/`

```bash
npm run validate
```
