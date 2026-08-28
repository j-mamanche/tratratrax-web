# TraTraTrax — el sitio en dos idiomas

Fecha: 2026-08-21
Estado: **propuesta**. Nada de esto está decidido y la sección 1 hay que
consultarla con el sello antes de escribir una línea de código.

> **Esto contradice una decisión cerrada.** `PLAN.md` dice, en la tabla del
> punto 0: *«Idiomas — decisión editorial (mezcla ES/EN deliberada), no hay
> selector ni i18n técnico»*. Ese renglón no se tacha por escribir este archivo.
> Si el toggle entra, se cambia allá y se apunta para acá; si no entra, este
> archivo se queda como el registro de por qué no.

---

## 1. La pregunta primero: qué **no** se traduce

Esta es la parte difícil y es editorial, no técnica. El sitio hoy no está «en
inglés con partes en español»: está en una mezcla que dice algo. El nav dice
`ABOUT CATALOG MERCA BLOG` —tres en inglés y una que no se traduce porque es la
palabra— y debajo, el lema rota entre `TODOS LOS IZQUIERDOS PÚBLICOS` y
`SONIC HUSTLERS`. Un toggle que traduzca todo convierte eso en dos sitios
correctos y aburridos: `ALL PUBLIC LEFTS` no existe en ningún idioma.

Así que el toggle no puede ser «traducir el sitio». Tiene que ser **traducir lo
que informa, y dejar quieto lo que suena.** Propongo tres baldes y que el sello
mueva lo que quiera entre ellos, pero que la línea sea esa.

**Invariante** — no cambia nunca, en ningún idioma:

- Nombres de artistas, títulos de álbum, números de catálogo (`TRA031`).
- `MERCA`. Es el chiste y es el nombre de la sección.
- Los **roles de crédito**. Vienen de Bandcamp en inglés (`Mastering`,
  `Mixed by`, `Artwork`) y así se leen en cualquier release del mundo. Además
  son texto libre importado, no una lista cerrada: traducirlos es mantener un
  diccionario que se desactualiza solo. Ver `data/releases.json`.
- Las cinco frases del lema (`nav.md`, `var PHRASES`). Es el sello hablando,
  no una descripción de nada. Rotan igual en los dos idiomas.
- `TRA · TRA · TRAX` y las sílabas de `about.json`.

**Traducible** — es información y el visitante la necesita en su idioma:

- Los rótulos del nav: `ABOUT`, `CATALOG`, `BLOG`. (`MERCA` no, ver arriba.)
- El estado de stock: `IN STOCK` · `FEW UNITS` · `SOLD OUT`.
- `Released__ September 18, 2026` — la palabra **y** el formato de la fecha.
- `Credits`, y el texto de error de los widgets.
- El copy del About: `sello`, `lema`, `bookings.texto` de `about.json`.
- El blog, si algún día tiene contenido de verdad.

**Sin decidir** — esto es lo que hay que preguntar:

| Texto | Dónde | La duda |
|---|---|---|
| `BUY` / `LISTEN` | `home.js:298` | Son botones (información) pero también son el ritmo de la franja. `COMPRAR__ ESCUCHAR` mide **79% más** que `BUY__ LISTEN` —medido con la tipografía y el tracking de verdad— y la franja se envuelve distinto. |
| `MENU` | nav de escritorio | Es rótulo funcional, pero en móvil no existe. Traducirlo o borrarlo. |
| `SONIC HUSTLERS *since 2020*` | `about.json:lema` | ¿Es copy o es lema? Si es lema, es invariante. |
| El lema del nav | `nav.md` | Si el sitio está en inglés, ¿el lema sigue rotando frases en español? Yo digo que sí, y que ahí está la gracia. |

---

## 2. Dónde vive cada texto hoy

No hay un solo lugar, y por eso esto no es un `i18n.json` y ya. Son seis
superficies con seis dueños distintos:

| Superficie | Qué texto | Quién lo edita |
|---|---|---|
| HTML global de Cargo | Las 5 frases del lema | Cargo (pegar snippet) |
| Página nav ×2 (`L3482832595`, `N1901077103`) | `ABOUT CATALOG MERCA BLOG`, `MENU`, y los `data-label` | Cargo (Edit HTML) |
| CSS de página, merca | `--estado-rotulo` ×3 (`merca-estado.md:67-77`) | Cargo (Edit CSS → Page) |
| Páginas de blog | El contenido, hoy placeholder | Cargo (editor) |
| Widgets del repo | `'Credits'` (`catalogo.js:130`), `'Buy'`/`'Listen'` (`home.js:298-299`), `'Released'` + `Intl('en-US')` (`format.js:24,58`), `'No se pudo cargar el contenido.'` (`mount.js:73`) | Este repo |
| `data/*.json` | `about.json` → `sello`, `lema`, `bookings.texto`; `data/posts/` | El panel |

Lo bueno: **son cinco cadenas en los widgets**. El About ya saca todo su texto
de `about.json` y no tiene una sola palabra escrita en el JS — eso ya estaba
bien hecho y hoy paga. Lo caro no es el repo, es Cargo.

El panel (**TraTraTrax Studio**) no entra en el toggle: su interfaz es para el
sello y va en español y ya. Lo que sí cambia es que tiene que poder **editar dos
versiones** de cada campo traducible.

---

## 3. El mecanismo: un solo interruptor en `<html>`

Un atributo en el elemento raíz, y todo lo demás lo lee de ahí:

```js
document.documentElement.lang = "es";              // para el navegador
document.documentElement.dataset.idioma = "es";    // para nosotros
```

Dos atributos y no uno porque `lang` es el que usan el lector de pantalla y el
corrector, y `data-idioma` es el que usamos en los selectores — no quiero que un
día alguien ponga `lang="es-CO"` y se caiga medio CSS.

De ahí salen tres técnicas, una por superficie:

**a. CSS puro, donde el texto ya está en una variable.** Es gratis, no toca
JS y ya funciona así en merca:

```css
:root[data-idioma="es"] .page.tag-in-stock    { --estado-rotulo: "DISPONIBLE"; }
:root[data-idioma="es"] .page.tag-few-units   { --estado-rotulo: "ÚLTIMAS"; }
:root[data-idioma="es"] .page.tag-out-of-stock{ --estado-rotulo: "AGOTADO"; }
```

Tres renglones en el CSS global y los rótulos de stock están traducidos. Que
esas cadenas vivan en `content:` —que parecía un pecado— resulta ser la razón de
que esto sea barato.

**b. Texto doble en el mismo nodo, para lo que se escribe en Cargo:**

```html
<a href="about" rel="history"><span lang="en">ABOUT</span><span lang="es">ACERCA</span></a>
```

```css
[data-idioma="en"] [lang="es"], [data-idioma="es"] [lang="en"] { display: none; }
```

Es incómodo de editar dentro de Cargo y hay que decirlo: el editor visual va a
mostrar las dos palabras pegadas mientras se edita. Pero es lo único que Cargo
permite sin duplicar páginas (sección 4), y son cuatro rótulos, no un sitio
entero.

**c. Diccionario en el bundle, para los widgets.** Cinco cadenas y una fecha:

```js
// src/widgets/_runtime/idioma.js
export const t = (clave) => TEXTOS[idioma()][clave] ?? TEXTOS.en[clave];
```

Con `fechaLarga(iso)` recibiendo el idioma en vez de tener `'en-US'` clavado en
`format.js:24`. El `??` al final no es adorno: si falta una traducción se cae al
inglés y se ve raro, que es infinitamente mejor que un `undefined` en la página.

### Dónde vive el estado

`localStorage` manda; `?lang=es` en la URL le gana por esta visita y se queda
guardado; si no hay ninguno de los dos, `navigator.language`. Y **por defecto,
inglés** cuando ni eso ayude — el público del sello es de afuera y el sitio ya
está casi todo en inglés. (Decisión, no dato. Se puede voltear.)

### Y hay que sobrevivir la navegación AJAX

Cargo reescribe el `<body>` en cada navegación. El atributo va en `<html>`, que
no se toca, así que **el interruptor sobrevive solo** — pero el texto doble que
Cargo repinta y los widgets que se remontan, no. El patrón ya está resuelto tres
veces en este repo y hay que copiarlo, no inventarlo: ronda de reparación con
`setInterval` cada 3 s, eventos delegados en el documento, y **nada de
`MutationObserver` para esto** — el lema teclea letra por letra y el observer se
dispararía sin parar (está explicado en `nav.md`, en la sección de la bandera).

El cambio de idioma emite un evento y cada widget montado se vuelve a pintar:

```js
window.addEventListener("ttx:idioma", () => remontar());
```

---

## 4. Por qué **no** se duplican las páginas de Cargo

La alternativa obvia es la que usaría cualquiera: `/about` y `/es/about`, dos
juegos de páginas. URLs compartibles, Google indexa los dos idiomas, sin JS. En
casi cualquier otro sitio sería la respuesta correcta.

Acá no, y la razón es concreta: **en este sitio cada página de Cargo carga su
propio CSS escrito a mano y scopeado a su id.** El nav son dos páginas y
~2.000 líneas de CSS entre las dos, todo bajo `[id="L3482832595"]` y
`[id="N1901077103"]`. Una página duplicada nace con un id nuevo, así que hay que
copiar ese CSS entero y re-scopearlo — y desde ese día son dos copias que se
desincronizan calladas. El primer arreglo que se haga en una y no en la otra
deja el sitio en español con un bug que el de inglés no tiene.

Súmele que los placeholders de widget (`<div data-ttx="catalogo">`) también se
duplican, y que el script de la bandera y el del blanco/negro tienen listas de
ids escritas a mano que habría que doblar.

**El costo de no duplicar, dicho claro:** no hay URL por idioma, así que un link
compartido llega en el idioma de quien lo abre (mitigado por `?lang=`, que sí se
puede compartir), y los buscadores indexan un solo idioma. Para un sello con
cinco páginas eso es aceptable. Si algún día el blog importa para SEO, se
revisa.

---

## 5. Dónde se va a romper

La parte honesta. Nada de esto es un impedimento, pero todo esto va a pasar y
más vale saberlo antes:

- **El nav reserva ancho con `data-label`.** Cada link lleva dos pseudo-elementos
  invisibles con `content: attr(data-label)` (`nav.md:276` y `:1296`) para que
  marcar la página activa no empuje a los demás. El truco del texto doble **no
  sirve ahí**: el atributo es uno solo. Hay que poner `data-label-en` /
  `data-label-es` y que el script escriba `data-label` al cambiar de idioma.
- **El lema teclea letra por letra.** Cambiar de idioma en la mitad de una
  palabra no puede ser un `textContent = otro`. Se aborta y se vuelve a arrancar
  — el controlador ya tiene `ctl.dead = true` para exactamente esto, se reusa.
- **La regla `__` está calibrada en inglés.** El tracking de −0.13em y la
  alternancia de juntas se midieron sobre cadenas inglesas.
  `Publicado__ 18 de septiembre de 2026` mide ~21% más que
  `Released__ September 18, 2026`, y la franja del home envuelve. Hay que mirar
  la franja y el panel del catálogo con las cadenas largas puestas, no antes.
- **La alternancia arranca en liviano.** Si una traducción cambia el número de
  grupos, cambia cuál junta queda pesada. Es `format.js:grupos` y se ve a ojo.
- **`Intl` con `es-CO`** da `18 de septiembre de 2026`, con el mes en minúscula y
  con dos preposiciones. Contra la caja tipográfica de hoy eso se ve distinto,
  no solo más largo.
- **El panel necesita dos campos por cadena traducible**, y el validador tiene
  que decidir qué hacer con la mitad que falte. Propongo: **aviso, no error**.
  Hoy el validador ya saca 39 avisos por los `listenUrl` que faltan; sumarle 70
  errores duros lo vuelve ruido y nadie lo lee más.
- **Las tres cadenas de stock viven solo en el CSS de una página de Cargo.**
  Ninguna herramienta del repo las ve. Quedan anotadas en `merca-estado.md` y
  esa anotación es la única defensa contra que se pierdan.

---

## 6. En qué orden

Cada paso tiene que quedar verificable solo, sin depender del siguiente.

1. **Decidir la sección 1.** Con Silvi y con el sello. Hasta que los tres baldes
   no estén, no arranca nada más — traducir y después destraducir cuesta el
   doble.
2. **El interruptor, sin traducir nada.** Script global que pone
   `lang`/`data-idioma`, persiste, y sobrevive la navegación AJAX.
   *Verificable:* navegar por todo el sitio y que `data-idioma` siga puesto.
3. **Los widgets.** `_runtime/idioma.js`, las cinco cadenas, `fechaLarga` con
   idioma. *Verificable en `/preview`*, sin tocar Cargo.
4. **Los datos.** `{ es, en }` donde toque en `about.json`, fallback al otro
   idioma, validador que avisa, y el panel con los dos campos.
5. **Cargo.** Primero los rótulos de stock (tres renglones de CSS, gratis);
   después el nav con `data-label-*`; el lema solo si en el paso 1 se decidió
   que se traduce.
6. **El botón.** Al final a propósito: hasta acá nada de esto se ve y todo se
   puede probar con `?lang=es`. Dónde va es decisión de diseño — la única barra
   persistente es el nav, así que o va al lado del lema o es un quinto elemento
   de `.nav-links`. Ojo con que el nav de móvil ya va apretado en dos filas.
7. **El blog.** Probablemente fuera de la primera versión: hoy es placeholder y
   traducir placeholder no sirve de nada.

Los pasos 2, 3 y 5 son cortos. El 4 es el que tiene trabajo de verdad, porque
toca el panel. El 1 no es trabajo mío.

---

## 7. Lo que hay que preguntar

- ¿Qué se traduce y qué no? (la tabla de «sin decidir», sección 1)
- ¿Idioma por defecto para quien llega sin preferencia: inglés o español?
- ¿El lema sigue en español cuando el sitio está en inglés?
- ¿Quién escribe las traducciones del About? No las inventa el código.
- ¿El blog entra o se queda en un solo idioma?
