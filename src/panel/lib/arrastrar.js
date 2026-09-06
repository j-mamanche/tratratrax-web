/**
 * Reordenar la lista arrastrando, con el dedo o con el ratón.
 *
 * Nada de la API nativa de *drag and drop* del navegador: no existe en táctil,
 * y el catálogo se reordena desde el teléfono tanto como desde el escritorio.
 * Con eventos de puntero el mismo código sirve para los dos.
 *
 * El truco es mover el nodo en el DOM mientras se arrastra, en vez de calcular
 * dónde caería al soltar. Las filas del catálogo no miden todas lo mismo —hay
 * títulos de una línea y de tres—, y con alturas distintas el cálculo de «a
 * qué hueco entra» se equivoca justo cuando más importa. Moviéndolo de verdad,
 * la respuesta la da el navegador.
 *
 * ## Se agarra por donde sea
 *
 * La fila entera es a la vez el botón que abre el release y el asa que lo
 * mueve, y eso se resuelve con el gesto, no con la zona:
 *
 *   - **Ratón y lápiz**: mover seis píxeles con el botón apretado es arrastrar.
 *     Soltar antes es un clic, y el clic abre la ficha como siempre.
 *   - **Dedo**: sobre la fila hace falta mantener pulsado un tercio de segundo,
 *     porque ahí el gesto de mover compite con el de hacer scroll y no hay
 *     forma de saber cuál es hasta que el dedo se queda quieto. Sobre el asa
 *     —que sigue ahí y sigue siendo lo que se ve— arranca de una.
 *
 * Mientras el dedo decide, el navegador todavía no ha empezado a rodar la
 * lista: por eso el `touchmove` no pasivo alcanza a cancelarlo cuando el
 * arrastre gana. Al revés no se puede, y de ahí que el asa exista.
 */

const BORDE = 56; // franja del borde donde la lista empieza a rodar sola
const UMBRAL = 6; // px de ratón que separan un clic de un arrastre
const PULSACION = 350; // ms de dedo quieto que separan un toque de un arrastre

/** Lo que ya hace algo por su cuenta no puede además empezar un arrastre. */
const INTERACTIVO = 'button, a, input, select, textarea, label';

export function arrastrable(contenedor, { fila = '[data-fila]', asa = '[data-asa]', alSoltar }) {
  contenedor.addEventListener('pointerdown', (ev) => {
    if (ev.button != null && ev.button !== 0) return;

    const nodo = ev.target.closest?.(fila);
    if (!nodo || !contenedor.contains(nodo)) return;

    const gancho = ev.target.closest(asa);
    // Un clic en el asa es siempre arrastre; en cualquier otro control de la
    // fila —el punto, un botón que se añada mañana— no es ninguno de los dos.
    if (!gancho && ev.target.closest(INTERACTIVO)) return;

    const filas = () => [...contenedor.querySelectorAll(fila)];
    const desde = filas().indexOf(nodo);
    const partida = { x: ev.clientX, y: ev.clientY };

    let vivo = false;
    let origenPuntero = ev.clientY;
    let rodando = 0;
    let espera = null;

    // Después de cada salto en el DOM la fila tiene otra posición de reposo:
    // si no se vuelve a tomar la referencia, el nodo pega un brinco.
    const recalibrar = (y) => {
      nodo.style.transform = '';
      origenPuntero = y;
    };

    function arrancar(y) {
      vivo = true;
      clearTimeout(espera);
      origenPuntero = y;

      // La captura es una comodidad, no un requisito: los `pointermove` van al
      // documento igual. Si el puntero ya no existe —pasa con eventos
      // sintéticos y con algunos lápices— capturar lanza, y perder el arrastre
      // entero por eso sería absurdo.
      try {
        (gancho ?? nodo).setPointerCapture(ev.pointerId);
      } catch {}

      nodo.classList.add('arrastrando');
      contenedor.classList.add('arrastrandose');
      navigator.vibrate?.(8);
    }

    const mover = (e) => {
      const lejos = Math.hypot(e.clientX - partida.x, e.clientY - partida.y);

      if (!vivo) {
        // Con el dedo, moverse antes de tiempo es hacer scroll: se cancela la
        // espera y esto deja de ser un arrastre en potencia.
        if (e.pointerType === 'touch') {
          if (lejos > UMBRAL) return soltar();
          return;
        }
        if (lejos <= UMBRAL) return;
        arrancar(e.clientY);
      }

      e.preventDefault();
      nodo.style.transform = `translateY(${e.clientY - origenPuntero}px)`;

      // La lista larga tiene que poder rodar sola: en el teléfono no hay
      // rueda ni sitio donde soltar para hacer scroll a medio arrastre.
      const caja = contenedor.getBoundingClientRect();
      if (e.clientY < caja.top + BORDE) rodando = -1;
      else if (e.clientY > caja.bottom - BORDE) rodando = 1;
      else rodando = 0;

      // `pointer-events: none` sobre la fila que viaja: si no, lo único que
      // hay debajo del dedo es ella misma.
      const debajo = document.elementFromPoint(e.clientX, e.clientY)?.closest(fila);
      if (!debajo || debajo === nodo || !contenedor.contains(debajo)) return;

      const caja2 = debajo.getBoundingClientRect();
      const arriba = e.clientY < caja2.top + caja2.height / 2;
      debajo[arriba ? 'before' : 'after'](nodo);
      recalibrar(e.clientY);
    };

    // El dedo ya está apoyado y el navegador aún no sabe si esto es scroll.
    // Decírselo aquí es lo único que llega a tiempo; `touch-action` en el CSS
    // de la fila mataría el scroll de la lista entera.
    const frenar = (e) => { if (vivo) e.preventDefault(); };

    const rodar = () => {
      if (vivo && rodando) contenedor.scrollTop += rodando * 10;
    };
    const reloj = setInterval(rodar, 16);

    function soltar() {
      clearTimeout(espera);
      clearInterval(reloj);
      try { (gancho ?? nodo).releasePointerCapture?.(ev.pointerId); } catch {}
      removeEventListener('pointermove', mover);
      removeEventListener('pointerup', soltar);
      removeEventListener('pointercancel', soltar);
      removeEventListener('touchmove', frenar);

      if (!vivo) return;

      nodo.style.transform = '';
      nodo.classList.remove('arrastrando');
      contenedor.classList.remove('arrastrandose');

      // Soltar después de arrastrar dispara un `click` sobre la fila, y ese
      // clic abriría la ficha del release que se acaba de mover. Se come uno.
      //
      // Con `once` no bastaba: quien escucha `alSoltar` vuelve a pintar la
      // lista entera, y si el nodo donde empezó la pulsación ya no está en el
      // documento el navegador no llega a disparar ningún `click`. El guardia
      // se quedaba armado y se comía el siguiente de verdad — el arrastre
      // funcionaba y a cambio la fila de al lado dejaba de abrirse. Así que se
      // retira solo en el turno siguiente, haya comido o no.
      const comer = (e) => { e.stopPropagation(); e.preventDefault(); };
      addEventListener('click', comer, { capture: true });
      setTimeout(() => removeEventListener('click', comer, { capture: true }), 0);

      const hasta = filas().indexOf(nodo);
      if (hasta >= 0 && hasta !== desde) alSoltar(desde, hasta);
    }

    if (gancho) {
      ev.preventDefault();
      arrancar(ev.clientY);
    } else if (ev.pointerType === 'touch') {
      espera = setTimeout(() => arrancar(partida.y), PULSACION);
    }

    addEventListener('pointermove', mover, { passive: false });
    addEventListener('pointerup', soltar);
    addEventListener('pointercancel', soltar);
    addEventListener('touchmove', frenar, { passive: false });
  });
}

/** Saca el elemento de `desde` y lo mete en `hasta`, sin tocar el original. */
export function recolocar(lista, desde, hasta) {
  const copia = [...lista];
  const [pieza] = copia.splice(desde, 1);
  copia.splice(hasta, 0, pieza);
  return copia;
}
