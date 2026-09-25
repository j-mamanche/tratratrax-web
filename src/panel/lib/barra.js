/**
 * El botón de guardar, que vive arriba y es uno solo.
 *
 * Antes había uno por pantalla y cada uno commiteaba lo suyo: el del home
 * mandaba `home` y `releases`, el de artistas mandaba `artists` y `releases`.
 * Eso obligaba a saber, antes de tocar nada, en qué pantalla había que estar
 * para que lo tuyo se guardara — y a acordarse de pasar por las dos si habías
 * tocado las dos. Ahora se guarda lo que esté sin guardar, esté donde esté, y
 * el botón dice cuánto es.
 *
 * Vive junto a Salir porque son las dos cosas que se hacen al final, y porque
 * un botón de guardar que hay que ir a buscar es un botón que no se aprieta.
 */

import { alCambiar, irA, leer, publicar, sucios } from './borrador.js';
import { el, parte, vaciar } from './piezas.js';
import { idioma, t, ui, traducirError } from './idioma.js';
import { cambiosDelBorrador, destino, destinoError, textoCambio } from './cambios.js';

const NOMBRES = {
  es: { releases: 'el catálogo', artists: 'los artistas', home: 'el home', about: 'el about', blog: 'el blog' },
  en: { releases: 'the catalog', artists: 'the artists', home: 'the home page', about: 'the about page', blog: 'the blog' },
};
const nombre = (archivo) => NOMBRES[idioma()][archivo] ?? archivo;
const en = () => idioma() === 'en';
const cantidad = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;
const cambiosTexto = (n) => en() ? `${cantidad(n, 'change', 'changes')} pending` : `${cantidad(n, 'cambio', 'cambios')} pendiente${n === 1 ? '' : 's'}`;
const conflictosTexto = (n) => en() ? `${cantidad(n, 'conflict', 'conflicts')} to resolve` : `${cantidad(n, 'conflicto', 'conflictos')} por resolver`;

/** `releases[12] "Gubbins": falta X` → `12`. Para poder saltar al culpable. */
export function indiceDelError(mensaje) {
  const m = /^releases\[(\d+)\]/.exec(mensaje ?? '');
  return m ? Number(m[1]) : null;
}

/**
 * Engancha la barra al borrador.
 *
 * `alFallar` recibe los errores que devolvió el servidor, para que la pantalla
 * los ponga donde se puedan arreglar: el error se marca en el campo, no en un
 * cartel encima del formulario que hay que traducir a mano.
 */
export function montarBarra({ alFallar } = {}) {
  const boton = document.getElementById('guardar');
  const botonMovil = document.getElementById('guardarMovil');
  const textoBotonMovil = botonMovil?.querySelector('span:last-child');
  const pie = document.getElementById('estadoBarra');
  const pieMovil = document.getElementById('estadoBarraMovil');
  const aviso = document.getElementById('parteBarra');
  const detalle = document.getElementById('detalleCambios');
  if (!boton) return;

  let guardando = false;
  let conflictos = [];
  let revision = null;
  let relojRevision = null;
  let relojCerrarDetalle = null;

  function pintarDetalle() {
    const cambios = cambiosDelBorrador(leer());
    vaciar(detalle);

    if (conflictos.length) {
      detalle.append(
        el('strong', { clase: 'detalle-titulo detalle-conflictos' }, conflictosTexto(conflictos.length)),
        el('ul', { clase: 'detalle-conflictos-lista' },
          conflictos.map((mensaje) =>
            el('li', {}, el('button', {
              type: 'button',
              clase: 'detalle-conflicto',
              onclick: () => irAlConflicto(mensaje),
            }, traducirError(mensaje))),
          ),
        ),
      );
    }

    if (cambios.length) {
      detalle.append(
        el('strong', { clase: 'detalle-titulo' }, cambiosTexto(cambios.length)),
        el('ul', { clase: 'detalle-cambios-lista' },
          cambios.map((cambio) => el('li', {}, el('a', {
            clase: 'detalle-cambio', href: destino({ ...cambio, release: cambio.tipo === 'artists' ? leer().releases?.find((r) => r.artists?.includes(cambio.id))?.id : undefined }),
          }, textoCambio(cambio, en())))),
        ),
      );
    }
  }

  function abrirDetalle() {
    clearTimeout(relojCerrarDetalle);
    detalle.hidden = false;
    pie.setAttribute('aria-expanded', 'true');
    pieMovil?.setAttribute('aria-expanded', 'true');
    pintarDetalle();
  }

  function cerrarDetalle() {
    clearTimeout(relojCerrarDetalle);
    detalle.hidden = true;
    pie.setAttribute('aria-expanded', 'false');
    pieMovil?.setAttribute('aria-expanded', 'false');
  }

  // El panel está separado visualmente del botón. Dejamos una fracción de
  // segundo para poder llevar el puntero de uno al otro y usar sus enlaces.
  function programarCierreDetalle() {
    clearTimeout(relojCerrarDetalle);
    relojCerrarDetalle = setTimeout(cerrarDetalle, 120);
  }

  function irAlConflicto(mensaje) {
    const ruta = destinoError(mensaje, leer());
    if (ruta) { irA(ruta); return; }
    alFallar?.([mensaje]);
  }

  async function revisarPendientes() {
    const cambios = sucios();
    if (!cambios.length) {
      conflictos = [];
      refrescar();
      return;
    }

    revision?.abort();
    revision = new AbortController();
    try {
      const res = await fetch('/api/revisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cambios: cambios.map((archivo) => ({ archivo, valor: leer()[archivo] })) }),
        signal: revision.signal,
      });
      const datos = await res.json();
      if (!revision.signal.aborted) {
        conflictos = datos.errores ?? [];
        refrescar();
      }
    } catch (error) {
      // La revisión es una ayuda en vivo: perderla por un instante no debe
      // impedir editar ni convertir un problema de red en un conflicto falso.
      if (error.name !== 'AbortError') console.warn('[panel] no se pudo revisar el borrador', error);
    }
  }

  function programarRevision() {
    clearTimeout(relojRevision);
    relojRevision = setTimeout(revisarPendientes, 250);
  }

  function refrescar() {
    if (guardando) return;
    const cuantos = cambiosDelBorrador(leer()).length;
    boton.disabled = cuantos === 0;
    if (botonMovil) botonMovil.disabled = cuantos === 0;
    const resumenCambios = cuantos ? cambiosTexto(cuantos) : en() ? 'saved' : 'guardado';
    pie.textContent = conflictos.length ? `${cantidad(conflictos.length, en() ? 'conflict' : 'conflicto', en() ? 'conflicts' : 'conflictos')} · ${resumenCambios}` : resumenCambios;
    const ayuda = conflictos.length
      ? en() ? `Cannot save: ${conflictosTexto(conflictos.length)}. Open the list to find the fields to correct.` : `No se puede guardar: ${conflictosTexto(conflictos.length)}. Haz clic para verlos e ir al campo que hay que corregir.`
      : cuantos
        ? en() ? `${resumenCambios}. Open the list to review them or choose Save changes to publish.` : `${resumenCambios}. Abre la lista para revisarlos o pulsa Guardar cambios para publicarlos.`
        : ui('No hay cambios pendientes.');
    // El texto vive en el popover propio, no en el tooltip nativo: ahí sí se
    // puede entrar, leer la lista y accionar cada conflicto.
    pie.title = '';
    pie.setAttribute('aria-label', ayuda);
    pie.disabled = cuantos === 0 && conflictos.length === 0;
    pie.classList.toggle('pendiente', cuantos > 0 || conflictos.length > 0);
    if (pieMovil) {
      pieMovil.textContent = conflictos.length
        ? conflictosTexto(conflictos.length)
        : cuantos ? en() ? cantidad(cuantos, 'unsaved change', 'unsaved changes') : `${cantidad(cuantos, 'cambio', 'cambios')} sin guardar` : ui('Guardado');
      pieMovil.classList.toggle('pendiente', cuantos > 0 || conflictos.length > 0);
      pieMovil.disabled = pie.disabled;
      pieMovil.setAttribute('aria-label', ayuda);
    }
    if (!detalle.hidden) pintarDetalle();
  }

  alCambiar(() => {
    revision?.abort();
    conflictos = [];
    refrescar();
    programarRevision();
  });
  refrescar();
  programarRevision();
  addEventListener('ttx:idioma', () => {
    if (guardando) {
      pie.textContent = ui('guardando…');
      if (pieMovil) pieMovil.textContent = ui('Guardando…');
      if (textoBotonMovil) textoBotonMovil.textContent = ui('Guardando…');
    } else refrescar();
  });

  const objetivo = sessionStorage.getItem('ttx-conflicto-objetivo');
  if (objetivo) {
    sessionStorage.removeItem('ttx-conflicto-objetivo');
    setTimeout(() => alFallar?.([objetivo]), 0);
  }

  pie.addEventListener('click', () => {
    if (pie.disabled) return;
    const abierto = detalle.hidden;
    if (abierto) { abrirDetalle(); detalle.querySelector('a, button')?.focus(); }
    else cerrarDetalle();
  });
  pieMovil?.addEventListener('click', () => {
    if (pieMovil.disabled) return;
    const abierto = detalle.hidden;
    if (abierto) abrirDetalle();
    else cerrarDetalle();
    document.getElementById('opcionesMovil')?.removeAttribute('open');
    if (abierto) detalle.querySelector('a, button')?.focus();
  });
  pie.addEventListener('pointerenter', () => {
    if (!pie.disabled) abrirDetalle();
  });
  pie.addEventListener('pointerleave', programarCierreDetalle);
  detalle.addEventListener('pointerenter', () => clearTimeout(relojCerrarDetalle));
  detalle.addEventListener('pointerleave', programarCierreDetalle);
  pie.addEventListener('focus', () => {
    if (!pie.disabled) abrirDetalle();
  });
  pie.addEventListener('focusout', (event) => {
    if (!detalle.contains(event.relatedTarget)) cerrarDetalle();
  });
  detalle.addEventListener('focusout', (event) => {
    if (!pie.contains(event.relatedTarget) && !detalle.contains(event.relatedTarget)) cerrarDetalle();
  });

  boton.addEventListener('click', async () => {
    const cambiados = sucios();
    if (!cambiados.length) return;

    guardando = true;
    boton.disabled = true;
    if (botonMovil) {
      botonMovil.disabled = true;
      textoBotonMovil.textContent = ui('Guardando…');
    }
    pie.textContent = ui('guardando…');
    pie.classList.remove('pendiente');
    if (pieMovil) {
      pieMovil.textContent = ui('Guardando…');
      pieMovil.classList.remove('pendiente');
    }
    parte(aviso, {});

    const que = cambiados.map(nombre).join(en() ? ' and ' : ' y ');
    let resultado;
    try {
      resultado = await publicar(`Panel: ${que}`);
    } catch (error) {
      // `fetch` puede fallar antes de que exista una respuesta JSON —por
      // ejemplo, si se cae la red o el servidor reinicia—. Sin este cierre la
      // barra se queda en «guardando…» y parece que el botón no hizo nada.
      guardando = false;
      if (textoBotonMovil) textoBotonMovil.textContent = t('guardarCorto');
      refrescar();
      parte(aviso, {
        tono: 'mal',
        texto: {
          es: `No se pudo guardar: ${error?.message ?? 'fallo de conexión'}`,
          en: `Could not save: ${traducirError(error?.message ?? 'fallo de conexión')}`,
        },
      });
      return;
    }
    guardando = false;
    if (textoBotonMovil) textoBotonMovil.textContent = t('guardarCorto');

    if (resultado.ok) {
      conflictos = [];
      refrescar();
      parte(aviso, { tono: 'bien', texto: 'Guardado. El sitio se actualizará en breve.' });
      detalle.hidden = true;
      pie.setAttribute('aria-expanded', 'false');
      pieMovil?.setAttribute('aria-expanded', 'false');
      setTimeout(() => parte(aviso, {}), 6000);
      return;
    }

    const errores = resultado.errores ?? [];
    // Un 422 trae campos concretos por corregir. Un 500, una sesión vencida
    // o una caída temporal de GitHub no son conflictos del contenido y no se
    // deben presentar como si la persona tuviera algo que editar.
    conflictos = errores;
    refrescar();
    if (errores.length) abrirDetalle();
    else cerrarDetalle();
    parte(aviso, {
      tono: resultado.choque ? 'ojo' : 'mal',
      texto: resultado.error,
      lista: errores.slice(0, 3),
    });
    alFallar?.(errores);
  });

  // Un aviso que se queda pegado en pantalla se vuelve parte del decorado.
  aviso.addEventListener('click', () => parte(aviso, {}));
}
