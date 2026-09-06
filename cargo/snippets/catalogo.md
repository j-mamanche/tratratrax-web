# Qué se pega en Cargo para el catálogo

Dos pegadas, y una de ellas solo se hace una vez en la vida del sitio.

## 1. Una sola vez — HTML global de Cargo

`Settings → Edit HTML → Global`, al final del `<head>`:

```html
<script src="https://j-mamanche.github.io/tratratrax-web/ttx.js?v=1" defer></script>
```

Eso es todo. El CSS va **dentro** del `ttx.js` y el script lo inyecta al
arrancar: no hay una segunda línea que mantener sincronizada, y tampoco un
segundo archivo.

Eso último no es cosmético. Cuando el CSS era un `ttx.css` aparte, los dos
archivos se cacheaban por su cuenta diez minutos cada uno, y el navegador
podía revalidar uno y no el otro: quedaba corriendo el JS de una versión con
el CSS de otra y la página se desmaquetaba. Pasó en vivo. Un solo archivo no
se puede desincronizar consigo mismo.

**Qué hace el `?v=1`:** rompe la caché. GitHub Pages cachea diez minutos;
subir el número obliga a Cargo a pedir el archivo de nuevo en vez de esperar.
Como ahora es un archivo solo, subirlo actualiza todo de golpe.

**Si algo se ve raro después de un cambio**, casi siempre es la caché: sube
el número y recarga con `Cmd+Shift+R`.

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
| `--ttx-alto` | alto total; ya descuenta margen y nav | `calc(100svh - …)` |
| `--ttx-visor-h` | alto de la franja de arriba | `clamp(64px, 16%, 190px)` |
| `--ttx-visor-fx` | el filtro del reflejo | `url(#ttx-visor-fx)` |
| `--ttx-banda-h` | alto de la franja de etiquetas | `1.45rem` |
| `--ttx-etiqueta-sep` | separador entre álbum y artistas | `__` |
| `--ttx-panel-w` | ancho del panel de créditos abierto | `21rem` |
| `--ttx-w-max` | tope de ancho del ítem (para teléfono) | `88vw` |
| `--ttx-dur` | duración del acordeón | `0.5s` |

### El recorte de la página

Para que el widget quede como una tarjeta flotando, con aire alrededor y
sitio abajo para la barra de navegación:

```html
<div data-ttx="catalogo" style="--ttx-margen: 10px; --ttx-nav-h: 1.6rem"></div>
```

Lo importante: **los dos salen del alto**. Poner aire arriba y a los lados
sin descontarlo abajo es lo que hacía que la página scrolleara de más. Con
esto no hay que tocar `--ttx-alto` a mano nunca.

En `tratratrax.cargo.site/catalog`, Cargo deja unos 6px de aire arriba y 24
abajo por su cuenta; `--ttx-margen: 6px; --ttx-nav-h: 18px` los absorbe.

Las esquinas van cuadradas y no hay variable para redondearlas: es una regla
del diseño, no una calibración.

### El visor

Lo de arriba no es una imagen aparte: es **el reflejo del carril**. Las
mismas carátulas, de cabeza, corriendo pegadas al scroll de abajo. No hay
cruce ni fundido entre discos porque no hay nada que cruzar — si abajo se
movió, arriba ya se movió.

Encima va una estampa en **blanco y negro**, sin un solo gris: un poco de
blur, a grises, el gris aplanado a dos valores **en inverso** —lo oscuro
sale blanco— y un blur suave al final que le quita el filo de recorte al
salto entre los dos tonos. Como `posterize` y el umbral no existen en CSS,
el filtro es SVG y lo inyecta el propio script; `--ttx-visor-fx` sigue
siendo el único punto de calibración y admite encadenar filtros de CSS antes
o después.

Todo lo que vale la pena tocar está en el `tableValues` del filtro
(`src/widgets/_runtime/stack.js`), y va al revés de lo que uno esperaría
porque el umbral está invertido:

- **dar la vuelta:** `"1 0"` es el inverso, `"0 1"` el directo.
- **dónde corta:** `"1 0"` parte por la mitad; `"1 1 0"` deja más blanco,
  `"1 0 0"` más negro.
- **cuántos tonos:** `"1 .45 0"` mete un gris medio, si se quiere menos
  brutal.

Y el `stdDeviation` del último `feGaussianBlur` es cuánto se ablandan los
bordes: `0` los deja de recorte, `2` es lo que hay, `5` ya los derrite.

En teléfono el carril va parado, y un reflejo que corre a lo ancho ahí no
significa nada: el visor muestra la carátula activa sola, con el mismo
filtro y la misma volteada.

### Cómo se abre un release

Con la carátula o con el título, indistinto. El control de verdad —el que
ve el teclado y el lector de pantalla— es el título, que es un `<button>`;
la carátula es un blanco más grande para el puntero, no un segundo control.

Al abrirlo, el carril lleva ese release al comienzo: acostado, a la
izquierda; parado, arriba, o sea con su título justo debajo del visor.
Cualquier gesto del usuario cancela ese movimiento.

### En teléfono

El carril se para: una columna que se recorre hacia abajo, con el panel
abriéndose debajo de la carátula. Los títulos quedan pegados arriba mientras
uno recorre su release, y cuando llega el siguiente lo empuja hacia afuera y
toma su lugar — así el de la segunda banda es siempre el del disco que uno
está mirando. Es `position: sticky` con hermanos, sin una línea de JS.

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
- **Sin número en la etiqueta.** Cada release muestra solo álbum y artistas,
  unidos con `__`; el álbum va en negrita. El número de catálogo, cuando
  exista, aparece dentro del panel de información expandido. Si alguna
  pantalla necesita otro separador, `--ttx-etiqueta-sep` conserva el tracking
  negativo para que los guiones bajos se lean como una raya y no picados.
- **Ni cerrar el `__` de los créditos a mano.** Ese tracking ya está puesto.
- **Ni ordenar a mano.** Manda el campo `order` del JSON.
- **Ni volver a entrar a Cargo para publicar.** Un release nuevo es un
  commit en `data/releases.json`.
