// Las tres cosas que el scroll horizontal nativo no da.
//
// El gesto de dedo con inercia, el trackpad de dos dedos y la scrollbar oculta
// ya salen gratis del CSS (`overflow-x: auto` + `scroll-snap`). Esto agrega
// solo lo que falta, y no vuelve a inventar nada de lo anterior.

const UMBRAL_ARRASTRE = 4; // px antes de considerar que es arrastre y no clic

/**
 * @param {HTMLElement} carril  el contenedor con overflow-x
 * @returns {() => void} para desmontar
 */
export function hscroll(carril) {
  const ac = new AbortController();
  const { signal } = ac;
  const on = (t, ev, fn, op) => t.addEventListener(ev, fn, { signal, ...op });

  // ── Arrastre con mouse ────────────────────────────────────────────────
  // Solo para punteros gruesos: en táctil el navegador ya lo hace mejor,
  // y en táctil capturar el puntero mata la inercia.
  let arrastrando = false;
  let x0 = 0;
  let scroll0 = 0;
  let recorrido = 0;

  on(carril, 'pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    arrastrando = true;
    recorrido = 0;
    x0 = e.clientX;
    scroll0 = carril.scrollLeft;
  });

  on(carril, 'pointermove', (e) => {
    if (!arrastrando) return;
    const dx = e.clientX - x0;
    recorrido = Math.max(recorrido, Math.abs(dx));

    // La captura se pide al cruzar el umbral, no antes: así un clic limpio
    // sobre una etiqueta sigue siendo un clic.
    if (recorrido > UMBRAL_ARRASTRE) {
      if (!carril.hasPointerCapture(e.pointerId)) carril.setPointerCapture(e.pointerId);
      carril.dataset.arrastrando = '';
      carril.scrollLeft = scroll0 - dx;
      e.preventDefault();
    }
  });

  const soltar = (e) => {
    if (!arrastrando) return;
    arrastrando = false;
    delete carril.dataset.arrastrando;
    if (carril.hasPointerCapture?.(e.pointerId)) carril.releasePointerCapture(e.pointerId);
  };
  on(carril, 'pointerup', soltar);
  on(carril, 'pointercancel', soltar);

  // Si el puntero se movió, el clic que viene detrás es basura del arrastre.
  // En captura, para llegar antes que cualquier handler del contenido.
  on(
    carril,
    'click',
    (e) => {
      if (recorrido > UMBRAL_ARRASTRE) {
        e.preventDefault();
        e.stopPropagation();
        recorrido = 0;
      }
    },
    { capture: true },
  );

  // ── Rueda vertical → desplazamiento horizontal ────────────────────────
  // Con el carril acostado, la rueda de un mouse común no lo movería nunca.
  on(
    carril,
    'wheel',
    (e) => {
      // Con el carril parado —teléfono— la rueda ya hace lo correcto.
      if (carril.scrollWidth <= carril.clientWidth) return;
      // Trackpad horizontal: ya funciona, no lo tocamos.
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      // Dentro de un bloque que scrollea vertical (el panel de créditos)
      // manda el bloque, no el carril.
      if (e.target instanceof Element && e.target.closest('[data-scroll-y]')) return;

      carril.scrollLeft += e.deltaY;
      e.preventDefault();
    },
    { passive: false },
  );

  // ── Flechas del teclado ───────────────────────────────────────────────
  // Además de ser lo correcto para accesibilidad, es la única forma de
  // recorrer el catálogo sin mouse ni pantalla táctil.
  on(carril, 'keydown', (e) => {
    const paso = carril.clientWidth * 0.8;
    const salto = { ArrowLeft: -paso, ArrowRight: paso, PageUp: -paso, PageDown: paso }[e.key];

    if (salto !== undefined) {
      carril.scrollBy({ left: salto, behavior: 'smooth' });
    } else if (e.key === 'Home') {
      carril.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (e.key === 'End') {
      carril.scrollTo({ left: carril.scrollWidth, behavior: 'smooth' });
    } else {
      return;
    }
    e.preventDefault();
  });

  return () => ac.abort();
}
