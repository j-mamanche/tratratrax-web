# Merca — el estado de stock lo dice el tag

Página de producto `[id="H0731431535"]` (BEACH TOWEL "AÑAÑAY").

Hoy el estado está escrito dos veces: como tag de la página (que pinta el punto
en la vitrina) y otra vez a mano dentro de la ficha, con el color inline y el
texto "IN STOCK". Cambiar el tag no actualiza la ficha. Esto lo reduce a una
sola fuente: **el tag manda y la ficha lo lee**.

Tres tags posibles: `in-stock`, `few-units`, `out-of-stock`.

---

## 1. Global — HTML → **Global** (una vez para todo el sitio)

El script de [`tags-de-pagina.html`](tags-de-pagina.html): copia los tags de
cada página al `div.page` como clases `tag-<tag>`. No pinta nada, solo deja el
dato disponible para el CSS. Es la única pieza global; todo lo demás es CSS de
página.

Si `window.store` desaparece, la falla es silenciosa: la página se queda sin
clase, no hay punto ni rótulo. Callar antes que mentir en una tienda.

---

## 2. La fila de la nav — Edit HTML de la página

El `column-unit slot="1"` de la primera `column-set`, sin colores inline y sin
los spans anidados que no hacían nada:

```html
<column-unit slot="1" span="5"><span class="overlay-text-256161 estado-stock"><span style="--font-scale: 1.5; line-height: 0.5;"><text-icon icon="dot"></text-icon></span> <span class="estado-label">IN STOCK</span></span></column-unit>
```

El "IN STOCK" escrito queda oculto por CSS: está solo para que el editor de
Cargo no se coma el span vacío al guardar. El rótulo que se ve sale del tag.

---

## 3. Edit CSS → **Page**

```css
/* ── Semáforo de stock ─────────────────────────────────────────
   Fuente única: el tag de la página (in-stock / few-units /
   out-of-stock), que el script global copia al div.page.
   Aquí solo se lee. Sin tag no hay punto ni rótulo.             */

[id="H0731431535"] .estado-stock,
[id="H0731431535"] .estado-stock .estado-label {
	display: none;
}

[id="H0731431535"].tag-in-stock .estado-stock,
[id="H0731431535"].tag-few-units .estado-stock,
[id="H0731431535"].tag-out-of-stock .estado-stock {
	display: inline;
	color: var(--estado-punto);
}

[id="H0731431535"] .estado-stock::after {
	content: var(--estado-rotulo, "");
	color: rgba(16, 16, 16, 0.38);
}

[id="H0731431535"].tag-in-stock {
	--estado-punto: #22c55e;
	--estado-rotulo: "IN STOCK";
}

[id="H0731431535"].tag-few-units {
	--estado-punto: #facc15;
	--estado-rotulo: "FEW UNITS";
}

[id="H0731431535"].tag-out-of-stock {
	--estado-punto: #ef4444;
	--estado-rotulo: "SOLD OUT";
}
```

Los mismos colores del punto de la vitrina (`page-merch-grid.css`), para que la
ficha y el grid digan lo mismo.

Para otra ficha: el mismo bloque cambiando el id.

---

## Opcional — que el botón responda igual

No está aplicado. Si algún día el `Buy` tiene que desaparecer cuando el tag es
`out-of-stock`:

```css
[id="H0731431535"].tag-out-of-stock .button-15 { display: none; }
```
