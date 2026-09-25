# P5 — Blog móvil, variante A

Fecha: 24-09-2026. La variante A se aplica al widget normal. El archivo móvil es un solo flujo DOM en orden editorial, con dos columnas de 15,5 px y un único scroll. Destacado y PRENSA quedan en filas superiores independientes. El preview `?variante=b` conserva la comparación de una columna.

La altura usa el viewport visual disponible y se actualiza al cambiar tamaño, orientación o área visible por teclado. El espacio inferior del archivo suma la altura medida del nav visible, `safe-area-inset-bottom` y 16 px. En el nav móvil de Cargo publicado, el contenido visible comienza en y=800 de un viewport 390×844: 44 px de ocupación real. El preview usa una barra de 80 px; las capturas siguientes prueban ese caso más exigente. Si destacado y grieta dejan menos de 112 px para el archivo, la página vuelve a scroll normal y elimina el scroll interno.

## Evidencia de A

Chrome móvil emulado, escala 1. La captura «final» desplaza únicamente el archivo hasta el fondo. El destacado y PRENSA conservan su posición. [Medidas completas](p5-evidence/medidas.json).

| Viewport | Primer artículo | Último artículo |
|---|---|---|
| 320×568 | [Inicio](p5-evidence/a-320x568-inicio.png) | [Final](p5-evidence/a-320x568-final.png) |
| 320×844 | [Inicio](p5-evidence/a-320x844-inicio.png) | [Final](p5-evidence/a-320x844-final.png) |
| 375×568 | [Inicio](p5-evidence/a-375x568-inicio.png) | [Final](p5-evidence/a-375x568-final.png) |
| 375×844 | [Inicio](p5-evidence/a-375x844-inicio.png) | [Final](p5-evidence/a-375x844-final.png) |
| 390×568 | [Inicio](p5-evidence/a-390x568-inicio.png) | [Final](p5-evidence/a-390x568-final.png) |
| 390×844 | [Inicio](p5-evidence/a-390x844-inicio.png) | [Final](p5-evidence/a-390x844-final.png) |

En los seis casos del preview el documento mide el alto del viewport, las dos columnas tienen el mismo tamaño de letra, y el último artículo queda visible sobre el nav al llegar al final. La misma comprobación pasó en WebKit emulado, con entre 25 y 27 px de separación entre el último artículo y la barra. [Medidas WebKit](p5-evidence/webkit-medidas.json). A 320×300 y con un destacado artificialmente largo, se activó el scroll de página y no quedó contenido atrapado.

También se interceptó temporalmente `ttx.js` en el navegador de prueba para ejecutar el bundle local sobre la página real de Cargo, sin publicarlo. En 320/375/390×568, tanto `/blog` directo como el recorrido `/blog → /catalog → /blog` por el nav AJAX mostraron las 14 lecturas. Al final, el último artículo quedó entre 14 y 15 px por encima del contenido del nav real. [Medidas de Cargo](p5-evidence/cargo-rutas.json). Cargo conservó la posición del scroll al regresar por AJAX; el primer artículo sigue accesible al volver al inicio del archivo.

Las comprobaciones de teclado y orientación se hicieron reduciendo y rotando el viewport emulado en Chromium; el layout también se comprobó en WebKit. No sustituyen una prueba en hardware iOS y Android. El bundle aún debe publicarse en Cargo para comprobar el estado público final.
