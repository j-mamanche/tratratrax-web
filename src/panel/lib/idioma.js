const COPIA = {
  es: {
    catalogo: 'Catálogo', home: 'Home', blog: 'Blog', guardar: 'Guardar cambios', salir: 'Salir',
    nuevo: 'Nuevo lanzamiento', importarBandcamp: 'Importar de Bandcamp', importar: 'Importar',
    todos: 'Todos', bloqueados: 'No publicables', pendientes: 'Pendientes', listos: 'Listos',
    vista: 'Vista previa', fijo: 'Fijo', aleatorio: 'Aleatorio',
    fijoPie: 'Muestra un lanzamiento.', autoPie: 'Elige entre los marcados.',
    seleccionarTodo: 'Seleccionar todo', quitarTodo: 'Quitar todo', borrar: 'Borrar',
    buscar: 'Buscar…', ayudaCatalogo: 'Arrastra para cambiar el orden. Gris: pendiente. Rojo: bloquea la publicación.',
  },
  en: {
    catalogo: 'Catalog', home: 'Home', blog: 'Blog', guardar: 'Save changes', salir: 'Sign out',
    nuevo: 'New release', importarBandcamp: 'Import from Bandcamp', importar: 'Import',
    todos: 'All', bloqueados: 'Blocked', pendientes: 'Needs info', listos: 'Ready',
    vista: 'Preview', fijo: 'Fixed', aleatorio: 'Random',
    fijoPie: 'Shows one release.', autoPie: 'Picks from selected releases.',
    seleccionarTodo: 'Select all', quitarTodo: 'Clear all', borrar: 'Delete',
    buscar: 'Search…', ayudaCatalogo: 'Drag to reorder. Grey: needs info. Red: blocks publishing.',
  },
};

export const idioma = () => localStorage.getItem('ttx-idioma') === 'en' ? 'en' : 'es';
export const t = (clave) => COPIA[idioma()][clave] ?? COPIA.es[clave] ?? clave;

function pintar() {
  const actual = idioma();
  document.documentElement.lang = actual;
  document.querySelectorAll('[data-i18n]').forEach((nodo) => { nodo.textContent = t(nodo.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((nodo) => { nodo.placeholder = t(nodo.dataset.i18nPlaceholder); });
  const boton = document.getElementById('idioma');
  if (boton) {
    boton.textContent = actual === 'es' ? 'EN' : 'ES';
    boton.setAttribute('aria-label', actual === 'es' ? 'Switch to English' : 'Cambiar a español');
  }
  dispatchEvent(new CustomEvent('ttx:idioma'));
}

export function montarIdioma() {
  pintar();
  document.getElementById('idioma')?.addEventListener('click', () => {
    localStorage.setItem('ttx-idioma', idioma() === 'es' ? 'en' : 'es');
    pintar();
  });
}
