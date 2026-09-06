# Blog — widget TraTraBuilder

Cargo ya no contiene las noticias ni su layout. **Borra el HTML y CSS viejo**
de la página —incluyendo cualquier regla `.press-*`, `column-set.press-columns`
o `marquee-set`— y deja este único placeholder. Los textos, links, orden,
columnas y destacados se editan en TraTraTrax Studio → Blog.

```html
<div data-ttx="blog" style="--ttx-margen: 0px; --ttx-nav-h: 60px"></div>
```

El script global `ttx.js` debe estar activo, como en los demás widgets.
El CSS visual del blog viaja dentro de ese bundle: no se pega CSS adicional en
Cargo. El widget ya reserva los **60px** de la barra inferior del blog. Si
alguna vez esa barra cambia de alto, el único ajuste válido es:

```html
<div data-ttx="blog" style="--ttx-margen: 0px; --ttx-nav-h: 60px"></div>
```
