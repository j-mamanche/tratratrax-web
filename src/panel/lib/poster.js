/**
 * El póster del video: cinco cuadros del propio video, y se elige uno.
 *
 * Aparece pegado al video y solo cuando hay video, porque solo entonces
 * significa algo. Antes vivía suelto entre los campos del material, siempre
 * visible, y un campo que pide algo que todavía no se puede dar es un campo
 * que se aprende a saltar.
 *
 * Los cuadros salen del archivo que se acaba de elegir —está en la mano, no
 * hace falta bajarlo de ninguna parte— o, si el video ya estaba subido, del
 * que sirve el propio studio. Subir uno a mano sigue estando: hay portadas
 * donde el cuadro bueno no está dentro del video.
 */

import { el, parte, vaciar } from './piezas.js';
import { subir } from './material.js';
import { sacarFotogramas, soltarFotogramas, comoArchivo } from './fotogramas.js';

const reloj = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const urlDeMedia = (ruta) => (/^https?:/.test(ruta) ? ruta : `/${String(ruta).replace(/^\//, '')}`);

export function montarPoster({ actual, fijar, aviso, subidor }) {
  const tira = el('div', { clase: 'fotogramas', hidden: true });
  let puestos = [];

  const sacar = el('button', {
    clase: 'boton chico',
    type: 'button',
    onclick: () => desdeElRepo(),
  }, 'Sacar del video');

  const campoRuta = subidor('Póster del video', 'home.video.poster', 'poster', 'image/*', {
    id: 'campoPoster',
  });

  const nodo = el('div', { clase: 'poster', hidden: true },
    campoRuta,
    el('div', { clase: 'poster-acciones' }, sacar),
    tira,
  );

  function limpiar() {
    soltarFotogramas(puestos);
    puestos = [];
    vaciar(tira).hidden = true;
  }

  /** Se muestra solo cuando hay video del que sacarlo. */
  function revisar() {
    const hay = Boolean(actual()?.home?.video?.mp4);
    nodo.hidden = !hay;
    if (!hay) limpiar();
    return hay;
  }

  async function pintar(fuente) {
    limpiar();
    parte(aviso, { texto: 'Preparando fotogramas…' });
    sacar.disabled = true;

    try {
      puestos = await sacarFotogramas(fuente);
      parte(aviso, {});
      tira.hidden = false;
      tira.append(
        ...puestos.map((f) =>
          el('button', {
            type: 'button',
            clase: 'fotograma',
            title: `Poner el cuadro de ${reloj(f.segundo)}`,
            onclick: () => elegir(f),
          },
            el('img', { src: f.url, alt: '' }),
            el('small', {}, reloj(f.segundo)),
          ),
        ),
      );
    } catch (e) {
      parte(aviso, { tono: 'mal', texto: e.message });
    } finally {
      sacar.disabled = false;
    }
  }

  /** Un cuadro elegido se sube y pasa a ser el póster. */
  async function elegir(f) {
    const r = actual();
    if (!r) return;
    const base = `${r.id}-poster`;
    parte(aviso, { texto: 'Subiendo póster…' });

    try {
      // `pisar` sin preguntar, a diferencia del campo de subir: elegir un
      // cuadro de la tira es exactamente decir «el póster es este otro», y
      // preguntar si se reemplaza el anterior es preguntar dos veces lo mismo.
      const ruta = await subir(comoArchivo(f, base), base, { pisar: true });
      fijar('home.video.poster', ruta);
      const texto = campoRuta.querySelector('input[type="text"]');
      if (texto) texto.value = ruta;
      parte(aviso, { tono: 'bien', texto: `póster: ${reloj(f.segundo)}` });
      marcar(f);
    } catch (e) {
      parte(aviso, { tono: 'mal', texto: e.message });
    }
  }

  function marcar(f) {
    const i = puestos.indexOf(f);
    for (const [j, b] of [...tira.children].entries()) b.classList.toggle('puesto', j === i);
  }

  /** El video que se acaba de elegir en el campo de arriba. */
  function desdeArchivo(file) {
    nodo.hidden = false;
    pintar(file);
  }

  /** El video que ya estaba subido, servido por el propio studio. */
  function desdeElRepo() {
    const mp4 = actual()?.home?.video?.mp4;
    if (!mp4) return;
    pintar(urlDeMedia(mp4));
  }

  revisar();
  return { nodo, revisar, desdeArchivo };
}
