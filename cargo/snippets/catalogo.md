# Qué se pega en Cargo para el catálogo

Dos pegadas, y una de ellas solo se hace una vez en la vida del sitio.

## 1. Una sola vez — HTML global de Cargo

`Settings → Edit HTML → Global`, al final del `<head>`:

```html
<script src="https://j-mamanche.github.io/tratratrax-web/ttx.js?v=1" defer></script>
```

Eso es todo. El CSS lo inyecta el propio script — no hay una segunda línea
que mantener sincronizada.

**El `?v=1` importa.** Es lo que hace que un bug nuestro no pueda tumbar el
sitio en vivo: mientras nadie suba el número, Cargo sigue sirviendo la
versión que ya funcionaba. Los datos, en cambio, van siempre frescos: un
release nuevo aparece sin tocar nada de esto.

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
| `--ttx-alto` | alto total del widget | `100svh` |
| `--ttx-visor-h` | alto de la franja de arriba | `clamp(64px, 16%, 190px)` |
| `--ttx-visor-fx` | el filtro del visor: blur, contrast, saturate… | `blur(26px) saturate(1.2)` |
| `--ttx-banda-h` | alto de la franja de etiquetas | `1.45rem` |
| `--ttx-panel-w` | ancho del panel de créditos abierto | `21rem` |
| `--ttx-w-max` | tope de ancho del ítem (para teléfono) | `88vw` |
| `--ttx-dur` | duración del acordeón | `0.5s` |

Si la barra inferior de Cargo tapa el catálogo, se le resta su alto:

```html
<div data-ttx="catalogo" style="--ttx-alto: calc(100svh - 2rem)"></div>
```

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
- **Ni ordenar a mano.** Manda el campo `order` del JSON.
- **Ni volver a entrar a Cargo para publicar.** Un release nuevo es un
  commit en `data/releases.json`.
