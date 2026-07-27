// El espejo del visor.
//
// El visor no es una imagen sola que se reemplaza cuando cambia el disco
// activo: es **el mismo carril, reflejado**. Una copia de las carátulas, de
// cabeza, con un filtro de color fuerte, corriendo pegada al scroll de abajo.
//
// Por qué importa: la versión anterior cruzaba dos `background-image` con
// `startViewTransition`, y esa API fotografía **la página entera** — por eso
// en cada cambio de disco se difuminaba también la barra de etiquetas y
// volvía a aparecer. Aquí no hay cruce que animar: si abajo se movió, arriba
// ya se movió, porque es lo mismo.

/**
 * @param {HTMLElement} visor   la franja de arriba del stack
 * @param {HTMLElement} carril  el contenedor con overflow del contenido
 * @param {string[]} urls       una carátula por ítem, en el mismo orden
 * @returns {{ bombear: (ms?: number) => void, destruir: () => void }}
 */
export function espejo(visor, carril, urls) {
  // El marco es del tamaño del visor (no del carril): el `filter` procesa
  // solo lo que se ve, no las 35 carátulas. Se desborda un poco para que el
  // blur tenga material y no se desvanezca contra el papel en los bordes.
  const marco = document.createElement('div');
  marco.className = 'ttx-espejo-marco';

  const pista = document.createElement('div');
  pista.className = 'ttx-espejo-pista';
  pista.append(
    ...urls.map((url) => {
      const celda = document.createElement('div');
      celda.className = 'ttx-espejo-celda';
      celda.style.backgroundImage = `url("${url}")`;
      return celda;
    }),
  );

  marco.append(pista);
  visor.append(marco);

  // ── Sincronía ─────────────────────────────────────────────────────────
  // Se mide con rects, no con `offsetLeft`: así funciona igual esté donde
  // esté el visor respecto al carril, y no hay que saber quién es el
  // `offsetParent` de quién.
  const sincronizar = () => {
    const x = carril.getBoundingClientRect().left -
      carril.scrollLeft -
      marco.getBoundingClientRect().left;
    pista.style.transform = `translate3d(${Math.round(x)}px, 0, 0)`;
  };

  // El rAF no corre siempre: se mantiene vivo mientras algo se está
  // moviendo — el scroll, o el acordeón abriéndose — y se apaga solo.
  let hasta = 0;
  let corriendo = false;

  const paso = () => {
    sincronizar();
    if (performance.now() < hasta) requestAnimationFrame(paso);
    else corriendo = false;
  };

  const bombear = (ms = 160) => {
    hasta = Math.max(hasta, performance.now() + ms);
    if (corriendo) return;
    corriendo = true;
    requestAnimationFrame(paso);
  };

  const ac = new AbortController();
  carril.addEventListener('scroll', () => bombear(), { passive: true, signal: ac.signal });

  // El ancho de la celda tiene que seguir al del ítem, incluido cuando el
  // acordeón lo hace crecer. En vez de que el catálogo tenga que avisar, se
  // copia el atributo: el CSS de la celda hace el resto, con la misma
  // transición, así que las dos capas se mueven juntas sin coordinación.
  const mo = new MutationObserver(() => {
    const items = carril.children;
    for (let i = 0; i < pista.children.length; i++) {
      pista.children[i].toggleAttribute('data-abierto', items[i]?.hasAttribute('data-abierto'));
    }
    bombear(1200);
  });
  mo.observe(carril, { attributes: true, attributeFilter: ['data-abierto'], subtree: true });

  // La primera pasada tiene que esperar a que el layout exista.
  requestAnimationFrame(sincronizar);
  const ro = new ResizeObserver(() => bombear(80));
  ro.observe(carril);

  return {
    bombear,
    destruir() {
      ac.abort();
      mo.disconnect();
      ro.disconnect();
      hasta = 0;
      marco.remove();
    },
  };
}
