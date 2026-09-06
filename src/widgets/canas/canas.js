import { registrar } from '../_runtime/mount.js';
import { elemento } from '../_runtime/dom.js';
import { urlMedia } from '../_runtime/datos.js';
import './canas.css';

const ANCHO = 1500;
const ALTO = 959;
const PIXEL = 3;

// Medidas y orden del frame 1:41 de Figma. Cada PNG permanece aislado para
// que el corte ocurra sobre el arte real, no sobre una silueta reconstruida.
const capas = [
  ['cana-01.png', 100, 283], ['cana-02.png', 242, 224],
  ['cana-03.png', 457, 173], ['cana-04.png', 604, 191],
  ['cana-05.png', 625, 435], ['cana-06.png', 830, 71],
  ['cana-07.png', 941, 86], ['cana-09.png', 1036, 224],
  ['cana-08.png', 977, 148], ['cana-10.png', 1225, 218],
];

registrar('canas', async (host) => {
  const lienzo = elemento('canvas', {
    class: 'ttx-canas-lienzo', role: 'img', 'aria-label': 'Plantación de caña de azúcar',
  });
  const machete = elemento('span', {
    class: 'ttx-canas-machete', 'aria-hidden': 'true',
  });
  machete.append(elemento('img', {
    class: 'ttx-canas-hoja', src: urlMedia('media/canas/machete.png'), alt: '',
  }));
  host.replaceChildren(lienzo, machete);

  const [fondo, ...imagenes] = await Promise.all([
    cargar('fondo.png'), ...capas.map(([archivo]) => cargar(archivo)),
  ]);
  const contexto = lienzo.getContext('2d', { alpha: false });
  const estado = imagenes.map((imagen, indice) => ({
    imagen, alfa: crearMapaAlfa(imagen), baseY: 0, indice,
  }));
  const trozos = [];
  const puntero = { x: 0, y: 0 };
  const machetePos = { x: 0, y: 0 };
  let activo = true;
  let raf = 0;
  let ultimo = performance.now();
  let ultimoViento = 0;
  let metrica = null;
  let golpe = 0;
  let primerGesto = true;

  function medir() {
    const caja = host.getBoundingClientRect();
    const ancho = Math.max(1, Math.round(caja.width / PIXEL));
    const alto = Math.max(1, Math.round(caja.height / PIXEL));
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
    }
    const escala = Math.max(ancho / ANCHO, alto / ALTO);
    metrica = { caja, escala, ancho, alto, origenX: (ancho - ANCHO * escala) / 2, origenY: (alto - ALTO * escala) / 2 };
  }

  function dibujar(ahora = performance.now()) {
    medir();
    const { ancho, alto, escala, origenX, origenY } = metrica;
    contexto.imageSmoothingEnabled = false;
    contexto.clearRect(0, 0, ancho, alto);
    contexto.drawImage(fondo, origenX, origenY, ANCHO * escala, ALTO * escala);
    estado.forEach((cana, indice) => {
      const [, x, anchoCana] = capas[indice];
      dibujarBase(contexto, cana, x, anchoCana, escala, origenX, origenY, ahora, indice);
      trozos.filter((trozo) => trozo.indice === indice)
        .forEach((trozo) => dibujarTrozo(contexto, trozo, escala, origenX, origenY));
    });
    posterizar(contexto, ancho, alto);
  }

  function animar(ahora) {
    const delta = Math.min(32, ahora - ultimo);
    ultimo = ahora;
    raf = 0;
    if (activo) {
      // Todavía tiene peso, pero responde antes de sentirse flotante.
      const factor = 1 - Math.pow(1 - 0.26, delta / 16.67);
      machetePos.x += (puntero.x - machetePos.x) * factor;
      machetePos.y += (puntero.y - machetePos.y) * factor;
      colocarMachete();
    }
    let cae = false;
    for (let i = trozos.length - 1; i >= 0; i -= 1) {
      const trozo = trozos[i];
      trozo.t = (ahora - trozo.inicio) / trozo.duracion;
      if (trozo.t >= 1) trozos.splice(i, 1);
      else cae = true;
    }
    // El viento actualiza a 12 fps; durante una caída se mantiene fluido.
    if (cae || ahora - ultimoViento > 84) {
      dibujar(ahora);
      ultimoViento = ahora;
    }
    if (activo || cae) raf = requestAnimationFrame(animar);
  }

  function programar() {
    if (!raf) raf = requestAnimationFrame(animar);
  }

  function mover(evento) {
    puntero.x = evento.clientX;
    puntero.y = evento.clientY;
    if (activo) programar();
  }

  function cortar(evento) {
    mover(evento);
    // El nav de la primera visita no cuenta desde que cargó la página: cuenta
    // desde la decisión de tocar la escena, incluso si el clic cae en aire.
    if (primerGesto) {
      primerGesto = false;
      host.dispatchEvent(new Event('ttx:canas-primera-interaccion'));
    }
    const objetivo = encontrarCana(evento.clientX, evento.clientY);
    if (!objetivo) return;
    const { cana, y, indice } = objetivo;
    const corteY = Math.round(y);
    trozos.push({
      indice, imagen: cana.imagen, x: capas[indice][1], ancho: capas[indice][2],
      inicioY: cana.baseY, corteY, direccion: direccionDeCaida(indice, evento.clientX),
      inicio: performance.now(), duracion: 1300, t: 0,
    });
    cana.baseY = corteY;
    // La pose de impacto es un solo fotograma: no hay interpolación hacia ella.
    machete.dataset.cortando = '';
    colocarMachete();
    clearTimeout(golpe);
    golpe = setTimeout(() => {
      delete machete.dataset.cortando;
      colocarMachete();
    }, 100);
    dibujar();
    programar();
  }

  function colocarMachete() {
    // El punto de corte vive dentro de la hoja, más cerca de su centro que de
    // la punta. El giro, en cambio, conserva el pivote físico del mango.
    machete.style.transform = `translate3d(${machetePos.x}px, ${machetePos.y}px, 0) translate(-28%, -28%)`;
  }

  function puntoEscena(x, y) {
    return {
      x: metrica.caja.left + (metrica.origenX + x * metrica.escala) * PIXEL,
      y: metrica.caja.top + (metrica.origenY + y * metrica.escala) * PIXEL,
    };
  }

  function encontrarCana(clienteX, clienteY) {
    if (!metrica) medir();
    const x = (clienteX - metrica.caja.left) / PIXEL;
    const y = (clienteY - metrica.caja.top) / PIXEL;
    const escenaX = (x - metrica.origenX) / metrica.escala;
    const escenaY = (y - metrica.origenY) / metrica.escala;
    // Desde el primer plano: recibe el golpe lo que de verdad está visible.
    for (let indice = estado.length - 1; indice >= 0; indice -= 1) {
      const cana = estado[indice];
      const [, izquierda, anchoCana] = capas[indice];
      const localX = Math.floor(escenaX - izquierda);
      const localY = Math.floor(escenaY);
      if (
        localX < 0 || localX >= anchoCana || localY <= cana.baseY + 10 || localY >= ALTO - 8 ||
        !opaco(cana.alfa, anchoCana, localX, localY)
      ) continue;
      return { cana, y: escenaY, indice };
    }
    return null;
  }

  const observar = new ResizeObserver(() => {
    dibujar();
    if (activo) programar();
  });
  observar.observe(host);
  host.addEventListener('pointermove', mover);
  host.addEventListener('pointerdown', cortar);
  const reiniciar = () => {
    estado.forEach((cana) => { cana.baseY = 0; });
    trozos.length = 0;
    primerGesto = true;
    dibujar();
  };
  host.addEventListener('ttx:canas-reiniciar', reiniciar);
  dibujar();
  // La posición quieta de Figma, antes de que el usuario decida moverla.
  // El punto de hoja (28 %) dentro de la capa ubicada en 663×362 en Figma.
  const inicio = puntoEscena(730, 428);
  puntero.x = inicio.x;
  puntero.y = inicio.y;
  machetePos.x = inicio.x;
  machetePos.y = inicio.y;
  host.dataset.canasActivo = '';
  colocarMachete();
  programar();

  return {
    destruir() {
      observar.disconnect();
      host.removeEventListener('pointermove', mover);
      host.removeEventListener('pointerdown', cortar);
      host.removeEventListener('ttx:canas-reiniciar', reiniciar);
      clearTimeout(golpe);
      if (raf) cancelAnimationFrame(raf);
    },
  };
});

function cargar(archivo) {
  return new Promise((resolve, reject) => {
    const imagen = new Image();
    // Cargo carga el bundle desde GitHub Pages: las cañas llegan desde otro
    // origen. Vamos a leer sus píxeles para detectar qué tallo se cortó, así
    // que la petición tiene que ser CORS antes de asignar `src`; de otro modo
    // `getImageData()` rechaza el canvas aunque la imagen se alcance a ver.
    imagen.crossOrigin = 'anonymous';
    imagen.decoding = 'async';
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error(`No se pudo cargar media/canas/${archivo}`));
    imagen.src = urlMedia(`media/canas/${archivo}`);
  });
}

function crearMapaAlfa(imagen) {
  const canvas = document.createElement('canvas');
  canvas.width = imagen.naturalWidth;
  canvas.height = imagen.naturalHeight;
  const contexto = canvas.getContext('2d', { willReadFrequently: true });
  contexto.drawImage(imagen, 0, 0);
  return contexto.getImageData(0, 0, canvas.width, canvas.height).data;
}

function opaco(alfa, ancho, x, y) {
  return alfa[(y * ancho + x) * 4 + 3] > 28;
}

function dibujarBase(contexto, cana, x, anchoCana, escala, origenX, origenY, ahora, indice) {
  const altoBase = ALTO - cana.baseY;
  if (altoBase <= 0) return;
  // Apenas perceptible: periodo de unos 13 s, menos de un cuarto de grado y
  // un zoom de 1.5 %. El pivote está abajo, como una caña plantada.
  const viento = Math.sin(ahora * 0.00048 + indice * 1.71) * 0.0035;
  contexto.save();
  contexto.translate(origenX + (x + anchoCana / 2) * escala, origenY + ALTO * escala);
  contexto.rotate(viento);
  contexto.scale(1.015, 1.015);
  contexto.drawImage(cana.imagen, 0, cana.baseY, anchoCana, altoBase,
    -anchoCana * escala / 2, -altoBase * escala,
    anchoCana * escala, altoBase * escala);
  contexto.restore();
}

function dibujarTrozo(contexto, trozo, escala, origenX, origenY) {
  const altoTrozo = trozo.corteY - trozo.inicioY;
  const t = trozo.t;
  const angulo = trozo.direccion * Math.min(1.45, t * 1.95);
  const avanceX = trozo.direccion * (t * t * 340);
  // Al terminar, el pivote ya está por debajo de la escena: no existe un
  // suelo imaginario ni un trozo quieto en el borde inferior.
  const avanceY = t * t * 1140;
  contexto.save();
  contexto.translate(
    origenX + (trozo.x + trozo.ancho / 2 + avanceX) * escala,
    origenY + (trozo.corteY + avanceY) * escala,
  );
  contexto.rotate(angulo);
  contexto.drawImage(trozo.imagen, 0, trozo.inicioY, trozo.ancho, altoTrozo,
    -trozo.ancho * escala / 2, -altoTrozo * escala,
    trozo.ancho * escala, altoTrozo * escala);
  contexto.restore();
}

function direccionDeCaida(indice, x) {
  if (Math.abs(x - innerWidth / 2) > 32) return x < innerWidth / 2 ? -1 : 1;
  return indice % 2 ? 1 : -1;
}

function posterizar(contexto, ancho, alto) {
  const fotograma = contexto.getImageData(0, 0, ancho, alto);
  const datos = fotograma.data;
  const salto = 255 / 5;
  for (let i = 0; i < datos.length; i += 4) {
    datos[i] = Math.round(datos[i] / salto) * salto;
    datos[i + 1] = Math.round(datos[i + 1] / salto) * salto;
    datos[i + 2] = Math.round(datos[i + 2] / salto) * salto;
  }
  contexto.putImageData(fotograma, 0, 0);
}
