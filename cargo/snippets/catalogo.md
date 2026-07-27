# Qué se pega en Cargo para el catálogo

Dos pegadas, y una de ellas solo se hace una vez en la vida del sitio.

## 1. Una sola vez — HTML global de Cargo

`Settings → Edit HTML → Global`, al final del `<head>`:

```html
<script src="https://j-mamanche.github.io/tratratrax-web/ttx.js?v=1" defer></script>
```

Eso es todo. El CSS lo inyecta el propio script — no hay una segunda línea
que mantener sincronizada.

**Qué hace el `?v=1`:** rompe la caché. GitHub Pages cachea diez minutos;
subir el número obliga a Cargo a pedir el archivo de nuevo en vez de esperar.

**Qué NO hace:** *no* fija una versión. Hay un solo `ttx.js` publicado, así
que cada push a `main` sale en vivo con o sin cambiar el número — igual que
los datos. Si más adelante queremos que un bug nuestro no pueda tumbar el
sitio, el build tiene que publicar nombres versionados (`ttx-3.js`) y el
script apuntar a uno fijo. Hoy no es así.

## 2. En la página de Catálogo

Se borran las columnas con marquee y en su lugar queda **una línea**:

```html
<div data-ttx="catalogo"></div>
```

El widget se encarga del resto: pide `releases.json`, arma las 35 fichas,
el carril horizontal y el acordeón.

### Calibrar sin tocar el código

Las variables van en el mismo `<div>`. Un `style` inline le gana a cualquier
CSS, incluido el global de Cargo, así que esto siempre funciona:

```html
<div data-ttx="catalogo"
     style="--ttx-visor-h: 22%; --ttx-visor-fx: blur(40px) saturate(1.4)"></div>
```

| Variable | Qué hace | Por defecto |
|---|---|---|
| `--ttx-margen` | aire por los **cuatro** lados | `0px` |
| `--ttx-nav-h` | hueco reservado **abajo** para la barra de navegación | `0px` |
| `--ttx-radio` | esquinas redondeadas | `0px` |
| `--ttx-alto` | alto total; ya descuenta margen y nav | `calc(100svh - …)` |
| `--ttx-visor-h` | alto de la franja de arriba | `clamp(64px, 16%, 190px)` |
| `--ttx-visor-fx` | el filtro del reflejo: blur, saturate, contrast… | `blur(20px) saturate(3.2) contrast(1.18)` |
| `--ttx-banda-h` | alto de la franja de etiquetas | `1.45rem` |
| `--ttx-etiqueta-sep` | separador entre número, álbum y artistas | `'_____'` |
| `--ttx-panel-w` | ancho del panel de créditos abierto | `21rem` |
| `--ttx-w-max` | tope de ancho del ítem (para teléfono) | `88vw` |
| `--ttx-dur` | duración del acordeón | `0.5s` |

### El recorte de la página

Para que el widget quede como una tarjeta flotando, con aire alrededor y
sitio abajo para la barra de navegación:

```html
<div data-ttx="catalogo"
     style="--ttx-margen: 10px; --ttx-nav-h: 1.6rem; --ttx-radio: 8px"></div>
```

Lo importante: **los dos salen del alto**. Poner aire arriba y a los lados
sin descontarlo abajo es lo que hacía que la página scrolleara de más. Con
esto no hay que tocar `--ttx-alto` a mano nunca.

En `tratratrax.cargo.site/catalog`, Cargo deja unos 6px de aire arriba y 24
abajo por su cuenta; `--ttx-margen: 6px; --ttx-nav-h: 18px` los absorbe.

### El visor

Lo de arriba no es una imagen aparte: es **el reflejo del carril**. Las
mismas carátulas, de cabeza, con el color subido, corriendo pegadas al
scroll de abajo. No hay cruce ni fundido entre discos porque no hay nada
que cruzar — si abajo se movió, arriba ya se movió.

Todo el color se calibra en una sola variable. Un par de puntos de partida:

```css
--ttx-visor-fx: blur(20px) saturate(3.2) contrast(1.18);   /* el de ahora */
--ttx-visor-fx: blur(8px) saturate(5) contrast(1.3);       /* más definido */
--ttx-visor-fx: blur(34px) saturate(2) hue-rotate(20deg);  /* más lavado */
```

En teléfono el carril va parado, y un reflejo que corre a lo ancho ahí no
significa nada: el visor muestra la carátula activa sola, con el mismo
filtro y la misma volteada.

### Opciones de contenido

```html
<!-- solo los releases de un artista -->
<div data-ttx="catalogo" data-artista="ehua-flore"></div>

<!-- solo los primeros diez -->
<div data-ttx="catalogo" data-limite="10"></div>
```

`data-artista` usa el `slug` de `data/artists.json`, no el nombre visible.

## Lo que ya no hay que hacer

- **Ni marquee ni columnas.** El scroll horizontal es nativo: gesto de dedo
  con inercia, trackpad de dos dedos, arrastre con mouse, rueda y flechas.
- **Ni `scroll-snap`.** Recorrer treinta y cinco discos y que el carril
  frenara y se acomodara en cada uno se sentía mal. Lo único que se coloca
  solo es el release que se abre.
- **Ni cerrar el `_` a mano.** Los guiones bajos ya llevan el tracking
  negativo que los pega en una línea continua, tanto en la etiqueta como en
  los créditos.
- **Ni ordenar a mano.** Manda el campo `order` del JSON.
- **Ni volver a entrar a Cargo para publicar.** Un release nuevo es un
  commit en `data/releases.json`.
