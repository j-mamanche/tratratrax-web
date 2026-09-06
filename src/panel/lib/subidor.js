/**
 * El campo de material: una ruta escrita a mano, o un archivo que se sube.
 *
 * Lo usan las dos pantallas —la ficha del lanzamiento y el home— sobre el
 * mismo bloque `home` del mismo release, así que vive aquí: si se arreglara
 * en una y no en la otra, el mismo campo se portaría distinto según por dónde
 * se llegara.
 *
 * El nombre del archivo lo pone el panel a partir del lanzamiento (`tra031-video.mp4`)
 * y no del archivo original. Es lo que evita que `media/` termine con un
 * `IMG_4821.jpg` que nadie sabe de quién es.
 */

import { el, campo, parte } from './piezas.js';
import { subir } from './material.js';

export function hacerSubidor({ actual, fijar, aviso }) {
  const leerRuta = (obj, ruta) => ruta.split('.').reduce((o, k) => o?.[k], obj);

  return function subidor(etiqueta, ruta, sufijo, accept, { pie, alElegir, id } = {}) {
    const texto = el('input', {
      type: 'text',
      value: leerRuta(actual(), ruta) ?? '',
      placeholder: 'media/…',
      oninput: (e) => fijar(ruta, e.target.value.trim()),
    });

    const poner = (destino, dicho) => {
      texto.value = destino;
      fijar(ruta, destino);
      parte(aviso, { tono: 'bien', texto: `${dicho}: ${destino}` });
    };

    if (id) texto.id = id;

    const archivo = el('input', {
      type: 'file',
      accept,
      // `capture` a propósito no: en el teléfono conviene poder elegir de la
      // galería tanto como grabar, y ponerlo fuerza la cámara.
      style: 'display:none',
      onchange: async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        const base = `${actual().id}${sufijo ? `-${sufijo}` : ''}`;
        parte(aviso, { texto: `Subiendo ${file.name}…` });

        // Quien pidió el campo puede querer el archivo en la mano —el póster
        // se saca del mp4 que se acaba de elegir, y volver a bajarlo del repo
        // para eso sería pedirle al sello que espere dos veces por lo mismo.
        alElegir?.(file);

        try {
          poner(await subir(file, base), 'listo');
        } catch (err) {
          if (!err.existe) return parte(aviso, { tono: 'mal', texto: err.message });
          if (!confirm(`"${err.ruta}" ya existe. ¿Reemplazarlo?`)) {
            return parte(aviso, { tono: 'ojo', texto: 'Sin cambios.' });
          }
          try {
            poner(await subir(file, base, { pisar: true }), 'reemplazado');
          } catch (otro) {
            parte(aviso, { tono: 'mal', texto: otro.message });
          }
        }
      },
    });

    return campo(
      etiqueta,
      el('div', { clase: 'fila' },
        texto,
        el('button', { clase: 'boton', type: 'button', style: 'flex:0 0 auto', onclick: () => archivo.click() }, 'Subir…'),
        archivo,
      ),
      pie,
    );
  };
}
