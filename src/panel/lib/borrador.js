/**
 * El borrador: lo que se está editando, antes de commitear.
 *
 * Vive en el navegador —`sessionStorage`— y no en el servidor, y eso no es
 * pereza: una función serverless no tiene memoria entre invocaciones, así que
 * un borrador «del servidor» habría que guardarlo en alguna parte, y esa parte
 * sería una base de datos que este proyecto decidió no tener.
 *
 * Tenerlo aquí además es lo que hace posible la previsualización en vivo:
 * `/vista` abre los widgets de verdad y les cambia el `fetch` por debajo para
 * que lean **esto** en vez de `data/*.json`. Lo que se ve ahí es lo que se va
 * a publicar, no una maqueta parecida.
 *
 * Se guardan los archivos juntos, con su `sha`, porque las pantallas se
 * cruzan: el home apunta a un release, un release estrena un artista. Y junto
 * a ellos va `base`, que es cómo estaban al abrir. Comparar contra `base` es
 * lo que permite que el botón de arriba diga «2 cambios» y commitee solo esos
 * dos archivos, en vez de mandar los cuatro y esperar que GitHub descarte los
 * que no cambiaron.
 */

const LLAVE = 'ttx-borrador';

/**
 * El espejo para la previsualización.
 *
 * El borrador vive en `sessionStorage` a propósito —es de esta pestaña y de
 * nadie más—, pero `sessionStorage` **se copia** al abrir una ventana nueva y
 * a partir de ahí las dos copias son independientes. La ventana de vista se
 * quedaba entonces con la foto del momento en que se abrió: se tocaba algo,
 * se volvía a dar a «Ver», el navegador reusaba la ventana con nombre, y lo
 * que salía era el borrador de hace media hora — o ninguno, y el home caía al
 * respaldo, que es el release más reciente. De ahí «me lleva al último».
 *
 * Así que lo mismo se escribe también en `localStorage`, que sí lo comparten
 * todas las pestañas del origen, y la vista lee de ahí. No es una segunda
 * fuente de verdad: es la misma, publicada donde la otra ventana la alcanza.
 */
const ESPEJO = 'ttx-borrador-vista';

/** Los archivos que el panel edita. `about` viaja pero todavía no se toca. */
export const ARCHIVOS = ['releases', 'artists', 'home', 'about', 'blog'];

const oyentes = new Set();

const congelar = (valor) => JSON.stringify(valor ?? null);

/** Lo que el servidor pintó en la página, o lo que quedó de la última vez. */
export function abrir(delServidor) {
  const guardado = leerCrudo();
  // La foto de cómo está el repo ahora mismo. Nunca sale del borrador
  // guardado: si viniera de ahí, un cambio sin guardar se daría por guardado.
  const base = Object.fromEntries(ARCHIVOS.map((a) => [a, congelar(delServidor[a])]));

  // Si el sha del servidor cambió, lo de este navegador quedó viejo: alguien
  // guardó desde otra parte. Se descarta en silencio solo si no había nada
  // tocado; si había, se avisa y decide quien está editando.
  // No basta comparar releases: Blog, About o Home pueden haber cambiado en
  // el mock mientras el catálogo siguió idéntico. Si se mirara solo ese sha,
  // el navegador resurrecta un borrador viejo y parece que el servidor tiene
  // artículos fantasma.
  const mismoRepo = guardado && ARCHIVOS.every((a) => guardado.shas?.[a] === delServidor.shas?.[a]);
  if (mismoRepo) {
    const estado = { ...delServidor, ...guardado, shas: delServidor.shas, base };

    // Al sumar un archivo nuevo al panel, los borradores que ya estaban en el
    // navegador no tenían una base para él. Conservar su valor —normalmente un
    // objeto vacío o una forma provisional— lo hacía aparecer como «cambio
    // sin guardar» en cada recarga. Para ese archivo recién incorporado, el
    // repo es la única base válida; los demás siguen conservando su borrador.
    for (const archivo of ARCHIVOS) {
      if (guardado.base?.[archivo] === undefined) estado[archivo] = delServidor[archivo];
    }

    return escribir(estado);
  }

  if (guardado && sucios(guardado).length) {
    // No se pierde trabajo por una actualización ajena: se puede recuperar
    // la copia local y decidir conscientemente cómo resolver el choque.
    return escribir({ ...delServidor, base, desfasado: true, recuperable: guardado });
  }

  return escribir({ ...delServidor, base });
}

function leerCrudo() {
  try {
    return JSON.parse(sessionStorage.getItem(LLAVE) ?? 'null');
  } catch {
    return null;
  }
}

function escribir(estado) {
  const texto = JSON.stringify(estado);
  sessionStorage.setItem(LLAVE, texto);
  try {
    localStorage.setItem(ESPEJO, texto);
  } catch {
    // Sin cuota para el espejo la vista lee los datos publicados y lo dice en
    // su sello. Perder la previsualización no puede costar el borrador.
  }
  for (const o of oyentes) o(estado);
  return estado;
}

/**
 * Abre la previsualización, y la recarga si ya estaba abierta.
 *
 * Sin el `replace` el navegador reusa la ventana con nombre sin navegarla
 * cuando la URL es la misma: se ve lo de antes y parece que el botón no hace
 * nada. Por eso también desapareció el «recarga esa ventana» de debajo.
 */
export function verVista(url) {
  const w = window.open(url, 'ttx-vista');
  if (!w) return;
  try {
    w.location.replace(new URL(url, location.href).href);
  } catch {
    // Otro origen no debería pasar nunca, y si pasa la ventana ya está abierta.
  }
  w.focus?.();
}

export const leer = () =>
  leerCrudo() ?? { releases: [], artists: [], home: {}, about: null, blog: { ticker: '', items: [] }, shas: {}, base: {} };

/** Cambia una parte del borrador. Lo tocado se deduce, no se declara. */
export function tocar(cambios) {
  return escribir({ ...leer(), ...cambios });
}

/** Qué archivos difieren de como estaban al abrir. */
export function sucios(estado = leer()) {
  const base = estado.base ?? {};
  return ARCHIVOS.filter((a) => base[a] !== undefined && congelar(estado[a]) !== base[a]);
}

export const estaSucio = () => sucios().length > 0;

/** Recupera la copia local tras detectar que otra persona guardó antes. */
export function recuperarBorrador() {
  const estado = leer();
  const copia = estado.recuperable;
  if (!copia) return estado;
  return escribir({ ...copia, shas: estado.shas, base: estado.base, desfasado: false, recuperable: null });
}

/** Acepta los datos recién leídos del repo y descarta la copia local. */
export function descartarBorrador() {
  const { recuperable, desfasado, ...estado } = leer();
  return escribir(estado);
}

/** Después de guardar: los shas nuevos, y la base puesta al día. */
export function asentar(shas, guardados = ARCHIVOS) {
  const estado = leer();
  const base = { ...estado.base };
  for (const a of guardados) base[a] = congelar(estado[a]);
  return escribir({ ...estado, shas: { ...estado.shas, ...shas }, base, desfasado: false });
}

export function alCambiar(fn) {
  oyentes.add(fn);
  return () => oyentes.delete(fn);
}

/**
 * Manda al servidor los archivos que cambiaron. Devuelve lo que contestó, ya
 * distinguiendo los tres finales que importan: bien, se pudo revisar y está
 * mal, y alguien guardó primero.
 */
export async function publicar(mensaje) {
  const estado = leer();
  const archivos = sucios(estado);
  if (!archivos.length) return { ok: true, nada: true };

  const cambios = archivos.map((archivo) => ({
    archivo,
    valor: estado[archivo],
    sha: estado.shas?.[archivo] ?? null,
  }));

  const res = await fetch('/api/guardar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cambios, mensaje }),
  });

  // La sesión vencida contesta 401 desde el middleware; llevar de vuelta a la
  // puerta es mejor que pintar «falló algo» sobre un formulario lleno.
  if (res.status === 401) {
    irA(`/entrar?volver=${encodeURIComponent(location.pathname)}`);
    return { ok: false, error: 'sesión vencida' };
  }

  const datos = await res.json().catch(() => ({ error: `respuesta ilegible (${res.status})` }));
  if (res.ok && datos.ok) asentar(datos.shas ?? {}, archivos);
  return { ...datos, ok: Boolean(res.ok && datos.ok), archivos };
}

/**
 * «No cierres, que tienes algo sin guardar».
 *
 * Solo al **salir del studio**. Moverse entre el catálogo y el home es una
 * carga de página entera —el panel no es una SPA—, y el borrador vive en
 * `sessionStorage`, así que al otro lado sigue estando todo: preguntar ahí es
 * preguntar por nada. Y un aviso que sale cuando no hay nada que perder es un
 * aviso que se aprende a despachar sin leer, justo antes del día que sí.
 *
 * Se distingue marcando la navegación propia antes de que ocurra: un clic en un
 * link de casa, un formulario nuestro, o `irA()`. Lo que quede sin marcar es
 * cerrar la pestaña o irse a otro sitio, que es cuando el borrador de verdad
 * desaparece.
 */
let adentro = false;

/** Navegar a otra pantalla del studio sin que salte el aviso. */
export function irA(url) {
  adentro = true;
  location.href = url;
}

export function avisarAlSalir() {
  const propio = (url) => {
    try {
      return new URL(url, location.href).origin === location.origin;
    } catch {
      return false;
    }
  };

  // El plazo es por si la navegación no llega a pasar —una descarga, un link
  // que el navegador ignora—: la marca no puede quedarse puesta para siempre.
  const marcar = () => {
    adentro = true;
    setTimeout(() => { adentro = false; }, 2000);
  };

  addEventListener('click', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = e.target.closest?.('a[href]');
    // Un `target` con nombre abre otra ventana y esta se queda donde está.
    if (!a || a.target || a.hasAttribute('download')) return;
    if (propio(a.getAttribute('href'))) marcar();
  }, true);

  addEventListener('submit', (e) => {
    const f = e.target;
    if (f?.tagName === 'FORM' && !f.target && propio(f.getAttribute('action') ?? '')) marcar();
  }, true);

  addEventListener('beforeunload', (e) => {
    if (adentro || !estaSucio()) return;
    e.preventDefault();
    e.returnValue = '';
  });
}
