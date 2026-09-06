/**
 * Los créditos, de texto a estructura y de vuelta.
 *
 * El sello escribe los créditos como un bloque continuo —es como están en
 * Bandcamp y como se leían en el sitio viejo—:
 *
 *     Artwork__ César Augusto
 *     Mastering__ Beau Thomas at Ten Eight Seven
 *
 *     All NRG programmed by 1OO1O, WOST, DNZA between Mexico D.F y Bogotá
 *
 * Hay dos clases de línea y esa es toda la gramática: una junta `Rol__ Valor`,
 * y una línea suelta que no rotula nada. El archivo guarda la lista ordenada
 * —`{ role, name }` o `{ texto }`— porque el sitio necesita saber cuál es cuál
 * para pintar la junta; el panel edita el bloque de texto, que es lo que la
 * persona tiene en la mano cuando lo copia del correo.
 *
 * `Released__` no vive aquí: sale de `date`. Si alguien pega el bloque entero
 * con su fecha adentro, `analizar` la devuelve aparte para que el formulario
 * pueda ofrecerla, en vez de dejar dos fechas que se contradicen.
 */

const JUNTA = '__';
const ES_FECHA = /^released\s*__/i;

/** Texto → `{ creditos, fecha }`. `fecha` es el `Released__` que venía pegado. */
export function analizar(texto = '') {
  const creditos = [];
  let fecha = null;

  for (const cruda of String(texto).split('\n')) {
    const linea = cruda.trim();
    if (!linea) continue; // los blancos son aire, no contenido: se regeneran

    if (ES_FECHA.test(linea)) {
      fecha ??= linea.slice(linea.indexOf(JUNTA) + JUNTA.length).trim();
      continue;
    }

    const corte = linea.indexOf(JUNTA);
    const role = corte > 0 ? linea.slice(0, corte).trim() : '';
    const name = corte > 0 ? linea.slice(corte + JUNTA.length).trim() : '';

    // Con un solo lado no es una junta: es una línea suelta que llevaba
    // guiones bajos por casualidad. Se guarda tal cual antes que romperla.
    if (role && name) creditos.push({ role, name });
    else creditos.push({ texto: linea });
  }

  return { creditos, fecha };
}

/** `{ role, name } | { texto }` → el bloque de texto que se edita. */
export function escribir(creditos = []) {
  const lineas = [];
  let previaSuelta = false;

  for (const c of creditos) {
    if (!c) continue;
    const suelta = !c.role || !c.name;

    // Una línea suelta abre bloque: va con aire encima, salvo que venga
    // pegada a otra suelta —ahí son un párrafo y el aire las partiría.
    if (suelta && lineas.length && !previaSuelta) lineas.push('');

    lineas.push(suelta ? c.texto ?? c.name ?? c.role ?? '' : `${c.role}${JUNTA} ${c.name}`);
    previaSuelta = suelta;
  }

  return lineas.join('\n');
}

/** ¿Es una entrada rotulada (`Rol__ Valor`) o una línea suelta? */
export const esJunta = (c) => Boolean(c?.role && c?.name);
