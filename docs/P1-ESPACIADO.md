# P1 — Ejes horizontales de las páginas propias

Medición en Chrome headless el 24-09-2026 sobre `tratratrax.cargo.site`.
«Antes» es el sitio publicado, que aún carga los márgenes fijos de 6 px. «Después»
es el mismo DOM publicado con las declaraciones nuevas inyectadas para medir el
resultado antes de desplegarlas. Se midió `getBoundingClientRect()` del primer
borde de `.ttx-marco` (Home, About, Catalog), de `.ttx-blog-highlight` (Blog) y
del contenido del nav. Se comprobó también el borde derecho y `scrollWidth`.
Los previews locales usan el bundle compilado y una imitación del padding de
Cargo; no sustituyen la comprobación final en Cargo tras publicar.

| Ancho × alto | Eje nav | Home/About antes → después | Catalog antes → después | Blog antes → después |
|---|---:|---:|---:|---:|
| 320 × 844 | 6,99 px | 9,48 → 6,97 | 6,00 → 6,98 | 9,30 → 6,97 |
| 375 × 844 | 8,19 px | 10,09 → 8,19 | 6,00 → 8,19 | 10,91 → 8,19 |
| 390 × 844 | 8,52 px | 10,25 → 8,50 | 6,00 → 8,52 | 11,34 → 8,50 |
| 768 × 1024 | 13,29–13,35 px | 12,64–12,67 → 13,28 | 6,00 → 13,28 | 17,80 → 13,34 |
| 1440 × 900 | 12,96 px | 12,47 → 12,94 | 6,00 → 12,95 | 14,56 → 12,94 |
| 2560 × 1440 | 20,74 px | 16,36 → 20,72 | 6,00 → 20,73 | 23,31 → 20,72 |

Los valores derechos fueron simétricos respecto al ancho útil de cada página
(la diferencia máxima por redondeo fue 0,02 px). A 768 px Home/About/Catalog
tienen scrollbar vertical de 15 px: su borde derecho se mide contra los
753 px útiles, mientras Blog ocupa 768 px. En todos los tamaños medidos el
`scrollWidth` del documento publicado con las reglas nuevas no superó
`innerWidth`. El preview local dio `scrollWidth = innerWidth` en las cuatro
páginas y los seis tamaños tras acotar la pintura del reflejo del catálogo.

## Capas y reglas sustituidas

| Zona | Capas publicadas antes | Regla nueva |
|---|---|---|
| Nav desktop `L3482832595` | `.page-content { padding: 1rem }`, borde efectivo `1rem` | Se conserva. |
| Nav móvil `N1901077103` | `.page-content { padding: 1rem }`; Cargo aplica `--mobile-padding-offset: .75`, borde efectivo `.75rem` | Se conserva. El cambio de nav ocurre entre 819 y 820 px. |
| Home y About | `.page-content` aporta `.5rem` desktop o `.375rem` móvil; placeholder `--ttx-margen: 6px` | Placeholder `--ttx-margen: calc(var(--ttx-eje-nav) * .5)`; esa mitad completa la del contenedor. |
| Catalog | `.page-content` aporta `0`; placeholder `--ttx-margen: 6px` | Placeholder `--ttx-margen: var(--ttx-eje-nav)` completo. |
| Blog | `.page-content` aporta `.5rem` desktop o `.375rem` móvil; host `padding: .625rem` | `padding-block: .625rem` y `padding-inline: calc(var(--ttx-eje-nav) * .5)`. Se quitó `--ttx-nav-h:60px` del CSS del widget. |
| Catalog preview | Reflejo filtrado con pista ancha podía inflar `document.scrollWidth` pese al `overflow:hidden` del marco | `contain:paint` solo en `.ttx-marco` del catálogo; el carril mantiene `overflow-x:auto`. |

`--ttx-eje-nav` vive solo en Home, About, Catalog y Blog: `1rem` desde 820 px
y `.75rem` hasta 819 px. Expresa el eje exterior compartido con el nav, no un
gutter universal. No se sustituyeron `--ttx-inset` del catálogo ni los gaps,
columnas o paddings verticales propios del Blog. El borde interior de etiquetas
y créditos del catálogo sigue desplazado deliberadamente `1.4rem` dentro de
su marco; esos textos se alinean entre sí. El nav tampoco usa la sangría de
los paneles. Las páginas de Cargo ajenas a estos cuatro widgets no recibieron
reglas nuevas.

Los snippets que estaban atrasados frente a los placeholders publicados quedan
con `--ttx-nav-h:60px` en Home/About/Catalog y `80px` en Blog. Es reserva de
contenido, no el alto visible del nav: P0 midió aproximadamente 42,5 px en
desktop, 73,5 px en ultraancho y 50,8 px en móvil con su margen inferior. No
se creó una constante global de altura. Los previews usan las mismas reservas.

## Verificación

`npm run build` pasó (0 errores, 43 avisos editoriales preexistentes) y
`git diff --check` pasó. En el preview local los bordes quedaron en 12 px
hasta 819 px y 16 px desde 820 px, iguales al chrome simulado, en
320/375/390/768/1440/2560 px. El preview tiene `rem` fijo de 16 px; la tabla
anterior refleja la escala variable real de Cargo. La aplicación pública de
los snippets y del bundle, y la medición posterior al despliegue, siguen
pendientes.
