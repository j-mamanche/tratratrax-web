import { UI_EN } from './textos.js';

export const COPIA = {
  es: {
    catalogo: 'Catálogo', home: 'Home', blog: 'Blog', guardar: 'Guardar cambios', salir: 'Salir',
    nuevo: 'Nuevo lanzamiento', importarBandcamp: 'Importar de Bandcamp', importar: 'Importar',
    todos: 'Todos', bloqueados: 'No publicables', pendientes: 'Pendientes', listos: 'Listos',
    vista: 'Vista previa', fijo: 'Fijo', aleatorio: 'Aleatorio',
    fijoPie: 'Muestra un lanzamiento.', autoPie: 'Elige entre los marcados.',
    seleccionarTodo: 'Seleccionar todo', quitarTodo: 'Quitar todo', borrar: 'Borrar',
    buscar: 'Buscar…', ayudaCatalogo: 'Arrastra para cambiar el orden. Gris: pendiente. Rojo: bloquea la publicación.',
    guardarCorto: 'Guardar', secciones: 'Secciones', opciones: 'Opciones', publicacion: 'Publicación', guardado: 'Guardado',
    volver: 'Volver a la lista', vistaCuadricula: 'Ver catálogo en cuadrícula', anadirLanzamiento: 'Añadir un lanzamiento',
    elegirPortada: 'Cómo se elige la portada', ayudaCatalogoLabel: 'Ayuda del catálogo',
    seleccionarLanzamiento: 'Selecciona o crea un lanzamiento.',
    entrar: 'Entrar', contrasena: 'Contraseña', intro: 'Edita y publica el contenido del sitio.',
    mala: 'Contraseña incorrecta.', vacia: 'Escribe la contraseña.', frenado: 'Demasiados intentos. Espera unos minutos.',
    rota: 'Falta configuración del panel.', errorEntrar: 'No se pudo entrar.', faltan: 'Faltan:', revisa: 'Revisa',
    errorRepo: 'No se pudo leer el repositorio:', sinBorrador: 'sin borrador · datos publicados', bandcampUrl: 'URL de álbum de Bandcamp',
  },
  en: {
    catalogo: 'Catalog', home: 'Home', blog: 'Blog', guardar: 'Save changes', salir: 'Sign out',
    nuevo: 'New release', importarBandcamp: 'Import from Bandcamp', importar: 'Import',
    todos: 'All', bloqueados: 'Blocked', pendientes: 'Needs info', listos: 'Ready',
    vista: 'Preview', fijo: 'Fixed', aleatorio: 'Random',
    fijoPie: 'Shows one release.', autoPie: 'Picks from selected releases.',
    seleccionarTodo: 'Select all', quitarTodo: 'Clear all', borrar: 'Delete',
    buscar: 'Search…', ayudaCatalogo: 'Drag to reorder. Gray: needs info. Red: blocks publishing.',
    guardarCorto: 'Save', secciones: 'Sections', opciones: 'Options', publicacion: 'Publishing', guardado: 'Saved',
    volver: 'Back to list', vistaCuadricula: 'View catalog as grid', anadirLanzamiento: 'Add a release',
    elegirPortada: 'How the cover is chosen', ayudaCatalogoLabel: 'Catalog help',
    seleccionarLanzamiento: 'Select or create a release.',
    entrar: 'Sign in', contrasena: 'Password', intro: 'Edit and publish the site content.',
    mala: 'Incorrect password.', vacia: 'Enter your password.', frenado: 'Too many attempts. Wait a few minutes.',
    rota: 'The Studio is not configured.', errorEntrar: 'Could not sign in.', faltan: 'Missing:', revisa: 'Check',
    errorRepo: 'Could not read the repository:', sinBorrador: 'no draft · published data', bandcampUrl: 'Bandcamp album URL',
  },
};

export const idioma = () => localStorage.getItem('ttx-idioma') === 'en' ? 'en' : 'es';
export const t = (clave) => COPIA[idioma()][clave] ?? COPIA.es[clave] ?? clave;

export function ui(texto) {
  if (idioma() !== 'en' || typeof texto !== 'string') return texto;
  return UI_EN[texto] ?? texto;
}

// Los errores del validador conservan su prefijo (archivo, índice y título)
// para que la barra pueda abrir el campo correcto en ambos idiomas.
export function traducirError(texto) {
  if (idioma() !== 'en' || !texto) return texto;
  const reglas = [
    [/^No se pudo guardar:/, 'Could not save:'],
    [/^Se guardó /, 'Saved '], [/\. Recarga y guarda el resto\.$/, '. Reload and save the rest.'],
    [/^el panel no está configurado:/, 'the Studio is not configured:'],
    [/^hay (\d+) lanzamientos por traer y por aquí solo caben (\d+) de una\. La discografía entera se importa desde el repo: `npm run import -- <url> --append`\.$/, 'There are $1 releases to import, but the Studio can import only $2 at once. Import the full discography from the repository with `npm run import -- <url> --append`.'],
    [/^falló algo del lado del servidor$/, 'a server error occurred'],
    [/^el cuerpo pesa ([\d.]+) MB y el tope son ([\d.]+) MB$/, 'The request is $1 MB; the limit is $2 MB'],
    [/^archivo desconocido /, 'unknown file '], [/ llegó sin contenido/, ' has no content'],
    [/: falta /g, ': missing '], [/artista ("[^"]*") no existe en artists\.json/g, 'artist $1 does not exist in artists.json'],
    [/ no existe en releases\.json/g, ' does not exist in releases.json'],
    [/ no es una URL válida/g, ' is not a valid URL'], [/ fecha inválida /g, ' invalid date '],
    [/ id duplicado /g, ' duplicate ID '], [/ slug duplicado /g, ' duplicate slug '],
    [/ apunta a /g, ' points to '], [/ que no está en el repo/g, ' which is not in the repository'],
    [/ es absoluta/g, ' is absolute'],
    [/ solo se importa de bandcamp\.com/g, 'only bandcamp.com can be imported'],
    [/eso no es una URL/g, 'enter a valid URL'],
    [/el material propio va en `media\//g, 'custom media must be in `media/'],
    [/ ya existe en el repo/g, ' already exists in the repository'],
    [/ no es un nombre de archivo que se pueda publicar/g, ' is not a valid file name'],
    [/ no es un tipo que el sitio sepa pintar/g, ' is not a supported file type'],
    [/ pesa /g, ' is '], [/ y por aquí solo caben /g, '; maximum size is '],
    [/Vuelve a exportar el video más liviano, o métele `git push` desde el repo\./g, 'Export a smaller video or add it to the repository with `git push`.'],
    [/Baja la resolución o guárdala en JPEG\./g, 'Reduce the resolution or save it as JPEG.'],
    [/necesita al menos un artista/g, 'needs at least one artist'],
    [/`azar` tiene que ser una lista de ids/g, '`azar` must be a list of IDs'],
    [/`items` debe ser una lista/g, '`items` must be a list'],
    [/debe ser minúsculas y guiones/g, 'must use lowercase letters and hyphens'],
    [/bcImageId inválido/g, 'invalid bcImageId'],
    [/ — se espera algo como a750972864/g, ' — expected an image ID such as a750972864'],
    [/ — se espera AAAA-MM-DD/g, ' — expected YYYY-MM-DD'],
    [/sin `bcImageId` y sin `home\.arte` — no hay ninguna imagen que mostrar/g, 'no `bcImageId` or `home.arte` — there is no image to show'],
    [/o `role` y `name`, o una línea suelta en `texto`/g, 'provide `role` and `name`, or a plain line in `texto`'],
    [/hay `video` pero sin `mp4`/g, '`video` has no `mp4`'],
    [/`order` \(número\)/g, '`order` (number)'],
    [/todavía tiene `destacado` — el material se mudó al bloque `home` del release/g, 'still has `destacado` — media now belongs in the release `home` block'],
    [/modo "([^"]*)" desconocido — se espera fijo \| auto/g, 'unknown mode "$1" — expected fijo | auto'],
    [/modo `fijo` sin `release` — falta decir cuál/g, 'fixed mode has no `release` selected'],
    [/el destacado no tiene imagen —ni `home\.arte` ni carátula de Bandcamp— y el home caería al respaldo/g, 'the featured release has no image (`home.arte` or Bandcamp cover), so the home page would use a fallback'],
    [/`azar` nombra ("[^"]*"), que no existe en releases\.json/g, '`azar` names $1, which does not exist in releases.json'],
    [/id inválido/g, 'invalid ID'], [/url no es válida/g, 'invalid URL'],
    [/image debe ser una URL o ruta media\//g, 'image must be a URL or media/ path'],
    [/article ("[^"]*") no existe/g, 'article $1 does not exist'],
    [/ — se espera una ruta del repo, como /g, ' — expected a repository path such as '],
    [/ no existe/g, ' does not exist'], [/ se espera /g, ' expected '],
    [/ falta /g, ' is missing '], [/ debe ser /g, ' must be '], [/ tiene que ser /g, ' must be '],
  ];
  let traducido = ui(texto);
  for (const [patron, reemplazo] of reglas) traducido = traducido.replace(patron, reemplazo);
  const detalle = (traducido.includes(':') ? traducido.slice(traducido.indexOf(':') + 1) : traducido)
    .replace(/"[^"]*"|`[^`]*`/g, '');
  if (/\b(?:falta|tiene|debe|sin|para|puede|ninguna|aquí|válida|desconocido|reemplazarlo|archivo|lanzamiento|artista|imagen|ruta|contenido|guardó|recarga|espera|que|del|una)\b/i.test(detalle)) {
    const contexto = /^(releases\[\d+\](?: "[^"]*")?|artists\[\d+\]|blog items\[\d+\](?: "[^"]*")?|home\.json|blog\.json):/.exec(traducido)?.[1];
    return contexto ? `${contexto}: Review this field.` : 'Request failed. Please try again.';
  }
  return traducido;
}

function pintar() {
  const actual = idioma();
  document.documentElement.lang = actual;
  const pagina = location.pathname.split('/').filter(Boolean).at(-1);
  if (['catalogo', 'home', 'blog'].includes(pagina)) document.title = `${t(pagina)} · TraTraTrax Studio`;
  if (pagina === 'entrar') document.title = `${t('entrar')} · TraTraTrax Studio`;
  document.querySelectorAll('[data-i18n]').forEach((nodo) => { nodo.textContent = t(nodo.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((nodo) => { nodo.placeholder = t(nodo.dataset.i18nPlaceholder); });
  for (const atributo of ['title', 'aria-label']) {
    document.querySelectorAll(`[data-i18n-${atributo}]`).forEach((nodo) => nodo.setAttribute(atributo, t(nodo.getAttribute(`data-i18n-${atributo}`))));
  }
  const boton = document.getElementById('idioma');
  if (boton) {
    boton.textContent = actual === 'es' ? 'EN' : 'ES';
    boton.setAttribute('aria-label', actual === 'es' ? 'Switch to English' : 'Cambiar a español');
  }
  const idiomaMovil = document.querySelector('#idiomaMovil span:last-child');
  if (idiomaMovil) idiomaMovil.textContent = actual === 'es' ? 'English' : 'Español';
  document.querySelectorAll('[data-ui-es][data-ui-en]').forEach((nodo) => {
    nodo.textContent = actual === 'en' ? nodo.dataset.uiEn : nodo.dataset.uiEs;
  });
  dispatchEvent(new CustomEvent('ttx:idioma'));
}

export function montarIdioma() {
  pintar();
  document.getElementById('idioma')?.addEventListener('click', () => {
    localStorage.setItem('ttx-idioma', idioma() === 'es' ? 'en' : 'es');
    pintar();
  });
}
