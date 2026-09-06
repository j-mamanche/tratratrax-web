/**
 * Subir material desde el navegador.
 *
 * Las imágenes se comprimen aquí y no en el servidor: una carátula sale de
 * Photoshop en 4000 px y 12 MB, y mandar eso por una función serverless es
 * pedirle a la plataforma que lo rechace. Bajarlo a 2000 px y JPEG deja
 * archivos de 300-600 KB, que es de sobra para lo que el sitio pinta.
 *
 * El video no se puede recomprimir en el navegador. Se manda tal cual y el
 * servidor decide; el tope está explicado allá (`api/subir.js`).
 */

import { irA } from './borrador.js';

const LADO = 2000;
const CALIDAD = 0.86;

const esImagen = (file) => /^image\/(jpeg|png|webp)$/.test(file.type);

/** Redimensiona a JPEG si hace falta. Un GIF pasa intacto: se perdería la animación. */
export async function comprimir(file) {
  if (!esImagen(file)) return { blob: file, extension: extensionDe(file) };

  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, LADO / Math.max(bitmap.width, bitmap.height));

  // Ya cabe y ya es JPEG: no tocarla. Recomprimir un JPEG solo le quita.
  if (escala === 1 && file.type === 'image/jpeg') return { blob: file, extension: 'jpg' };

  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  const ctx = lienzo.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close?.();

  const blob = await new Promise((r) => lienzo.toBlob(r, 'image/jpeg', CALIDAD));
  return { blob, extension: 'jpg' };
}

function extensionDe(file) {
  const porNombre = file.name.split('.').pop()?.toLowerCase();
  if (porNombre && /^[a-z0-9]{2,4}$/.test(porNombre)) return porNombre;
  return { 'video/mp4': 'mp4', 'video/webm': 'webm', 'image/gif': 'gif' }[file.type] ?? 'bin';
}

const aBase64 = (blob) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(String(lector.result).split(',')[1]);
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(blob);
  });

/**
 * Sube y devuelve la ruta del repo (`media/algo.jpg`), que es lo que se
 * escribe en el JSON. `nombre` va sin extensión: la pone la compresión.
 */
export async function subir(file, nombre, { pisar = false } = {}) {
  const { blob, extension } = await comprimir(file);
  const ruta = `media/${nombre}.${extension}`;

  const res = await fetch('/api/subir', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ruta,
      base64: await aBase64(blob),
      pisar,
      mensaje: `Panel: material ${ruta}`,
    }),
  });

  if (res.status === 401) {
    irA(`/entrar?volver=${encodeURIComponent(location.pathname)}`);
    throw new Error('sesión vencida');
  }

  const datos = await res.json().catch(() => ({ error: `respuesta ilegible (${res.status})` }));
  if (!res.ok) {
    const e = new Error(datos.error ?? 'no se pudo subir');
    e.existe = Boolean(datos.existe);
    e.ruta = ruta;
    throw e;
  }
  return datos.ruta;
}
