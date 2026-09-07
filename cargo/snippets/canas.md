# Qué se pega en Cargo para la landing de cañas

La landing no lleva HTML de Cargo aparte del placeholder:

```html
<div data-ttx="canas"></div>
```

El script global debe ser el bundle actual (se pega una sola vez en `Settings →
Edit HTML → Global`):

```html
<script src="https://j-mamanche.github.io/tratratrax-web/ttx.js?v=4" defer></script>
```

Ese bundle contiene tres correcciones que antes estaban separadas o faltaban:

- libera el recorte que Cargo pone alrededor de la página, para que el lienzo
  ocupe el viewport completo, incluso después de una transición AJAX;
- coloca el machete en coordenadas de la escena y no desplazado por el
  contenedor transformado de Cargo;
- controla la nav de las dos instancias de Cargo. En primera visita permanece
  oculta hasta que el primer corte inicia una entrada de 10 segundos; en las
  visitas siguientes se muestra inmediatamente. La página transparente del nav
  deja pasar los clics a la escena; sólo sus enlaces siguen capturándolos. La
  transición de opacidad y el velo inferior viven dentro del mismo bundle.

No se pega otro script para la nav. El controlador está dentro de `ttx.js`; el
loader del bundle vuelve a montar la escena cuando Cargo navega por AJAX, así
que la lógica no se pierde al cambiar de página.
