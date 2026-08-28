# Apache — canal rock and roll para Raspberry Pi

## Propósito

Convertir el televisor de Apache en un canal audiovisual continuo: una biblioteca de archivos independientes que se reproducen en secuencia, acompañados ocasionalmente por intervenciones gráficas sutiles del logo **APACHE**. El resultado toma como referencia el mundo del primer rock and roll cinematográfico —salones de baile, orquestas, boliche, titulares de prensa, cromados y película a color— sin utilizar imaginarios del Viejo Oeste ni estereotipos de pueblos nativos.

La referencia de tono es *Rock Around the Clock* (1956): elegancia de club nocturno que va acumulando energía hasta que la pista de baile se llena. Es una referencia estética, no material de reproducción.

## Principio técnico

La Raspberry Pi 4 reproducirá **un solo vídeo a la vez**, en pantalla completa. Encima habrá una capa HTML/SVG para el logo. No se usarán dos vídeos simultáneos ni vídeo con canal alfa: esa complejidad no aporta suficiente valor y sí compromete la operación continua.

```text
Biblioteca de vídeo local ──> lista de reproducción ──> vídeo fullscreen
                                                           +
                                                   capa SVG del logo APACHE
                                                           +
                                                supervisor de arranque y recuperación
```

La interfaz puede funcionar sin conexión a internet una vez instalado el contenido.

## Operación diaria

- La videoteca queda en un SSD USB; la tarjeta microSD se reserva para el sistema.
- Cada archivo se normaliza a MP4/H.264, 1080p y 24, 25 o 30 fps antes de incorporarse.
- Un catálogo local controla orden, estado activo, duración, carátula y ficha de derechos de cada pieza.
- El vídeo siguiente se deja preparado antes del final del actual para minimizar cortes entre archivos.
- El logo aparece aproximadamente cada cinco minutos, por 6–10 segundos, sin interrumpir el vídeo.
- El sistema arranca solo después de un corte eléctrico y reinicia el reproductor si éste deja de responder.
- Se conserva una copia de seguridad del catálogo y la configuración.

## Cinco movimientos para el logo SVG

Todos trabajan únicamente con el SVG de Apache existente, con cada letra en su propio grupo. No llevan textos extra, efectos de neón agresivos ni transiciones de “tráiler”. La idea es que se sientan como respiraciones elegantes de identidad.

| Movimiento | Entrada | Presencia | Salida | Duración |
|---|---|---|---|---|
| **Pulso coral** | Las letras aparecen juntas desde una opacidad baja. | Una expansión de 1–2 % y regreso, como un pulso. | Desvanecimiento lento. | 7 s |
| **Barrido de sala** | Las letras entran una a una de izquierda a derecha, con pocos píxeles de desplazamiento vertical. | Se quedan quietas. | Se disuelven en el mismo orden. | 8 s |
| **Contratiempo** | A, A y E entran primero; P y C llegan una fracción después. | Un único acento leve, nunca repetitivo. | Todas se apagan juntas. | 6 s |
| **Luz de proyector** | El logo surge suavemente desde una luz cálida, con sombra muy difusa. | Parpadeo imperceptible de luminosidad, como proyección analógica. | La luz se recoge y el logo desaparece. | 9 s |
| **Desplazamiento de vinilo** | El conjunto aparece desplazado unos píxeles y encuentra su centro con inercia leve. | Quietud total. | Sale de forma lateral muy lenta. | 8 s |

Las cinco variantes se alternan aleatoriamente, sin repetir la misma dos veces seguidas. La frecuencia base será una aparición cada cinco minutos, con una variación de hasta 45 segundos para que la intervención no se perciba como alarma o pauta.

## Lenguaje visual

- Paleta: marfil, crema, tabaco, negro de esmoquin, oro cálido, rosa empolvado y verde grisáceo.
- Materialidad: grano de película discreto, reflejos de cromo, papel impreso y luz de salón.
- Formato: los archivos 4:3 se preservan en su proporción; no se estiran. El espacio lateral se completa con un fondo sobrio de la identidad Apache.
- Ritmo: planos de banda, baile, manos, instrumentos, autos, boliche, luces y ciudad. Menos narración lineal; más sensación de emisión en vivo encontrada.

## Curaduría de contenidos

La biblioteca no dependerá de largometrajes famosos. Se construirá como una programación de material breve, variado y verificable.

### Líneas editoriales

1. **Música y baile**: actuaciones, salones, swing, jive, rock and roll, coreografías y público.
2. **Noche Apache**: boliche, barras, letreros, luces, mesas, humo y marquesinas.
3. **Carretera y cromo**: automóviles, estaciones de servicio, talleres, autopistas y drive-ins.
4. **La noticia**: periódicos, afiches, imprentas, cámaras, carteleras y televisión temprana.
5. **Interludios propios**: piezas originales de Apache, textura de película y el logo SVG.

### Regla de derechos

Un archivo no entra a la Raspberry sin una ficha con fuente, licencia, fecha de descarga, territorio de uso, condición de exhibición y copia del comprobante.

Orden de preferencia:

1. Material producido por Apache o encargado con cesión escrita.
2. CC0 o material con dominio público documentado.
3. CC BY o CC BY-SA, con atribución y condiciones correctamente cumplidas.
4. Licencia comercial que incluya exhibición pública en Colombia.

Se excluyen de la selección base las licencias no comerciales (NC), las obras que no admiten adaptación (ND) y cualquier archivo de Internet Archive cuya página no permita comprobar sus condiciones. Una película disponible en línea no equivale a una película autorizada para exhibirse en el televisor.

La música seguirá la misma regla. La solución más limpia es producir o encargar una biblioteca instrumental original con energía rockabilly —contrabajo, guitarra, batería, palmas— sin reproducir melodías, letras ni grabaciones conocidas.

## Fuentes para investigar

- Internet Archive, priorizando la ficha de licencia de cada ítem y no solamente su disponibilidad.
- Prelinger Archives, seleccionando únicamente piezas con licencia explícita compatible.
- Library of Congress / National Screening Room y Citizen DJ, con atención a la declaración de derechos por pieza.
- Bancos de vídeo y música con licencia comercial para cualquier imagen o sonido que requiera cobertura contractual.

## Fases de trabajo

### 1. Inventario y prueba

Confirmar RAM, almacenamiento, resolución del televisor, orientación, salida de audio y estado de la Raspberry entregada. Copiar el material existente antes de modificar la instalación.

### 2. Prototipo

Montar una biblioteca corta de 10–15 piezas legalmente aprobadas, el reproductor continuo y las cinco animaciones SVG. Ejecutar una prueba de 48–72 horas.

### 3. Panel de operación

Crear la pantalla local para subir vídeos, ordenar programación, activar/desactivar archivos y consultar las fichas de derechos.

### 4. Estabilización

Configurar arranque automático, recuperación del reproductor, copia de seguridad, apagado seguro y manual de una página para el equipo.

### 5. Curaduría sostenida

Construir la biblioteca por lotes, manteniendo una tabla de procedencia y renovando el contenido sin alterar la operación de la pantalla.

## Entregables

- Raspberry configurada para reproducción continua y recuperación automática.
- Catálogo editable de vídeo y derechos.
- Cinco animaciones SVG del logo Apache.
- Biblioteca inicial aprobada y normalizada.
- Guía breve de operación, respaldo y recuperación.

## Referencias de consulta

- [AFI Catalog — *Rock Around the Clock* (1956)](https://catalog.afi.com/Film/51976-ROCK-AROUND-THE-CLOCK)
- [Internet Archive — derechos](https://archivesupport.zendesk.com/hc/en-us/articles/360014759692-Rights)
- [Internet Archive — Prelinger Archive](https://archivesupport.zendesk.com/hc/en-us/articles/360004715031-Prelinger-Archive)
- [Creative Commons — licencias](https://creativecommons.org/share-your-work/use-remix/cc-licenses/)
- [Creative Commons — CC0](https://creativecommons.org/publicdomain/zero/1.0/)
- [DNDA Colombia — comunicación pública](https://www.derechodeautor.gov.co/es/node/1433)
