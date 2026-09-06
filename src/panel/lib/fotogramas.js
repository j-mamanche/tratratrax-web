/**
 * Los cinco fotogramas que se ofrecen como póster del video.
 *
 * El póster es lo que se ve cuando el teléfono tiene el movimiento apagado, así
 * que casi siempre lo que se quiere es un cuadro del propio video — y pedirle
 * al sello que exporte uno a mano es pedirle que abra otro programa a mitad de
 * una tarea de dos minutos.
 *
 * Se sacan aquí y no en el servidor. La función de Netlify tendría que llevar
 * ffmpeg encima, recibir el video entero por HTTP y devolver imágenes, con un
 * tope de tiempo y de tamaño que un mp4 de portada roza sin esfuerzo. El
 * navegador ya tiene el archivo en la mano —acaba de elegirlo— y ya sabe
 * decodificarlo: es la máquina que menos trabajo tiene que hacer.
 *
 * Cinco, repartidos y sin los extremos: el primer cuadro de un video suele ser
 * negro y el último también.
 */

const CUANTOS = 5;
const CALIDAD = 0.86;
const LADO = 2000;

/**
 * Saca los fotogramas de un video. `fuente` es el archivo recién elegido o la
 * URL del que ya está subido.
 *
 * Devuelve `[{ segundo, blob, url }]`. Las `url` son objetos temporales para
 * pintar las miniaturas; quien las pinta las suelta con `soltarFotogramas`.
 */
export async function sacarFotogramas(fuente, cuantos = CUANTOS) {
  const propia = typeof fuente !== 'string';
  const src = propia ? URL.createObjectURL(fuente) : fuente;

  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  // Sin esto un video servido desde otro origen tiñe el lienzo y `toBlob`
  // lanza. Con el nuestro no hace falta, pero no cuesta nada y cubre el día
  // que el material se sirva desde Pages en vez de desde el propio panel.
  if (!propia) video.crossOrigin = 'anonymous';
  video.src = src;

  try {
    const duracion = await listo(video);
    if (!duracion || !Number.isFinite(duracion)) {
      throw new Error('no se pudo leer la duración del video');
    }

    const lienzo = document.createElement('canvas');
    const escala = Math.min(1, LADO / Math.max(video.videoWidth, video.videoHeight));
    lienzo.width = Math.round(video.videoWidth * escala);
    lienzo.height = Math.round(video.videoHeight * escala);
    const ctx = lienzo.getContext('2d');

    const sacados = [];
    for (let i = 1; i <= cuantos; i++) {
      const segundo = (duracion * i) / (cuantos + 1);
      await saltarA(video, segundo);
      ctx.drawImage(video, 0, 0, lienzo.width, lienzo.height);

      const blob = await new Promise((r) => lienzo.toBlob(r, 'image/jpeg', CALIDAD));
      if (!blob) throw new Error('el navegador no pudo leer el video');
      sacados.push({ segundo, blob, url: URL.createObjectURL(blob) });
    }
    return sacados;
  } catch (e) {
    // `SecurityError` significa lienzo teñido: el video viene de un origen que
    // no da permiso. Decirlo así no le sirve a nadie del sello.
    if (e?.name === 'SecurityError') {
      throw new Error('este video no se puede leer desde aquí; sube el póster a mano');
    }
    throw e;
  } finally {
    video.removeAttribute('src');
    video.load();
    if (propia) URL.revokeObjectURL(src);
  }
}

/** Suelta las miniaturas cuando dejan de estar en pantalla. */
export const soltarFotogramas = (lista) => {
  for (const f of lista ?? []) URL.revokeObjectURL(f.url);
};

/** Un fotograma listo para `subir()`, que espera un archivo y no un blob. */
export const comoArchivo = (fotograma, nombre) =>
  new File([fotograma.blob], `${nombre}.jpg`, { type: 'image/jpeg' });

// ── esperas ─────────────────────────────────────────────────────────────────

function listo(video) {
  return new Promise((resolver, rechazar) => {
    const bien = () => { limpiar(); resolver(video.duration); };
    const mal = () => { limpiar(); rechazar(new Error('no se pudo abrir el video')); };
    const limpiar = () => {
      video.removeEventListener('loadedmetadata', bien);
      video.removeEventListener('error', mal);
    };
    video.addEventListener('loadedmetadata', bien, { once: true });
    video.addEventListener('error', mal, { once: true });
  });
}

/**
 * Saltar a un segundo y esperar a que el cuadro esté de verdad pintado.
 *
 * `seeked` dispara cuando el navegador llegó al sitio, que no siempre es
 * cuando hay imagen que copiar. El plazo es la red de seguridad: un video
 * al que le falta el índice puede no disparar `seeked` nunca, y quedarse
 * colgado esperando es peor que sacar un cuadro repetido.
 */
function saltarA(video, segundo) {
  return new Promise((resolver) => {
    const seguir = () => { clearTimeout(plazo); resolver(); };
    const plazo = setTimeout(seguir, 3000);
    video.addEventListener('seeked', seguir, { once: true });
    video.currentTime = segundo;
  });
}
