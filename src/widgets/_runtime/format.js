// Serialización de los datos a las formas que el sello ya usa.
// Nada de esto toca el DOM: son funciones puras, fáciles de probar.

/**
 * URL de carátula en Bandcamp. Guardamos el id (`a1974794830`), no la URL,
 * porque el sufijo decide el tamaño. Los que usamos:
 *   _7  → 150px   (nada, por ahora)
 *   _16 → 700px   (el visor, que va difuminado: no necesita más)
 *   _10 → 1200px  (la carátula del carril)
 */
export function cover(bcImageId, tam = 10) {
  return `https://f4.bcbits.com/img/${bcImageId}_${tam}.jpg`;
}

/** `TRA031` → `TRA 031`. Si no hay número, no inventamos uno. */
export function numeroCatalogo(catalog) {
  if (!catalog) return '';
  const m = /^([A-Z]+)\s*(\d+)$/.exec(catalog.trim());
  return m ? `${m[1]} ${m[2]}` : catalog.trim();
}

// El sitio está en inglés — así están escritos los créditos en Bandcamp y
// así se leían en el sitio viejo: `Released__ February 20, 2026`.
const FECHA = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC', // sin esto, un release del día 1 se muestra como del 30 anterior
});

/** `2026-02-20` → `February 20, 2026`. */
export function fechaLarga(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? '' : FECHA.format(d);
}

/**
 * Los créditos, que son un bloque continuo con dos clases de línea.
 *
 * La mayoría son juntas `Rol__ Valor`, que es como el sello ya escribe en
 * Bandcamp. Las demás son líneas sueltas sin rótulo —«All NRG programmed
 * by…», la nota con asterisco— y van en la misma lista, en su sitio: son el
 * final del mismo texto, no un párrafo aparte que se pega debajo.
 *
 * La fecha es la primera línea y tiene la misma forma que las demás
 * —`Released__ February 20, 2026`— porque así estaba en el sitio viejo: no
 * es una frase aparte, es un crédito más. El que la pinta la separa del
 * resto con aire, no con otro formato.
 *
 * El número de catálogo entra en el panel, no en la etiqueta. Así el carril
 * conserva una lectura breve (álbum y artista) y el dato técnico aparece al
 * abrir el release.
 */
export function lineasCredito(release) {
  const lineas = [];
  // `suelta` le dice al que la pinta que esta línea va separada del resto.
  if (release.date) {
    lineas.push({ rol: 'Released', valor: fechaLarga(release.date), suelta: true });
  }
  if (release.catalog) {
    lineas.push({ rol: 'Catalog', valor: numeroCatalogo(release.catalog) });
  }

  let previaLibre = false;
  for (const c of release.credits ?? []) {
    if (!c) continue;

    if (!c.role || !c.name) {
      const texto = (c.texto ?? c.name ?? c.role ?? '').trim();
      if (!texto) continue;
      // `libre` abre bloque, salvo que venga pegada a otra libre: dos líneas
      // seguidas sin rótulo son un párrafo, y el aire en medio lo partiría.
      lineas.push({ texto, libre: true, pegada: previaLibre });
      previaLibre = true;
      continue;
    }

    // El campo estructurado `catalog` ya se añadió arriba; ignorar la copia
    // que pueda venir en créditos evita mostrar el número dos veces.
    if (/^cat/i.test(c.role)) continue;
    lineas.push({ rol: c.role, valor: c.name });
    previaLibre = false;
  }

  // `note` es de antes de que las líneas sueltas vivieran dentro de
  // `credits`. Se sigue leyendo porque los datos y el bundle no llegan al
  // sitio en el mismo momento, y en ese hueco un release viejo se quedaría
  // sin su última línea.
  const cola = (release.note ?? '').trim();
  if (cola) {
    for (const [i, linea] of cola.split('\n').map((l) => l.trim()).filter(Boolean).entries()) {
      lineas.push({ texto: linea, libre: true, pegada: i > 0 });
    }
  }

  return lineas;
}

/** Slugs → nombres visibles. Sin guiones: "Nick León", nunca "Nick-León". */
export function nombresArtistas(slugs, indice) {
  return (slugs ?? []).map((s) => indice.get(s) ?? s).join(' & ');
}

// ── La regla de las juntas ──────────────────────────────────────────────
//
// Una línea compuesta del sitio se lee así:
//
//   SONIC HUSTLERS__ SINCE 2020
//   ░░░░░░░░░░░░░░░░ ▉▉▉▉▉▉▉▉▉▉
//   └─ grupo 0 ────┘ └─ grupo 1┘
//    liviano, con junta   fuerte, sin junta
//
// Tres reglas, y las tres viven **solo aquí**:
//
//   1. **El peso alterna** y arranca en liviano. El índice 0 va en peso normal
//      y el 1 en negrita. (Antes era al revés; las capturas del sello del 19 de
//      agosto de 2026 lo corrigen en las tres pantallas.)
//   2. **Cada grupo cierra con `__`** seguido de un espacio pequeño. El `__` no
//      se escribe en el DOM: lo imprime un `::after` desde `tokens.css`, así
//      hereda el peso y el color de su grupo sin un nodo de más.
//   3. **El último grupo del enunciado no lleva junta.** Nunca queda un `__`
//      colgando al final de una línea.
//
// `Rol__ Valor` (un crédito del catálogo) y `Grupo__ Grupo` (la línea del
// About o la franja del home) son la misma regla vista de dos maneras: un solo
// helper, dos llamadas. El crédito pide `peso: false` porque ahí lo que separa
// el rol del valor es la junta y la columna, no la alternancia.

/**
 * El asterisco es **la junta**, y así llega el copy escrito:
 *
 *   "*Sonic hustlers*since*2020*"  →  ["Sonic hustlers", "since", "2020"]
 *
 * No se imprime nunca; solo dice dónde termina un grupo y empieza el otro. Se
 * guarda así en `data/about.json` porque es la única forma de que el sello
 * escriba la línea entera —texto y ritmo— en un solo sitio. Una frase sin
 * asteriscos es un grupo y ya: no se rompe nada.
 */
export function partir(frase) {
  if (!frase) return [];
  return String(frase)
    .split('*')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Los grupos de un enunciado, cada uno con lo que le toca: el peso, si cierra
 * con junta, y las clases que imprimen las dos cosas.
 *
 *   grupos(['Sonic hustlers', 'since 2020'])
 *   → [{ texto: 'Sonic hustlers', liviano: true,  junta: true,  clase: 'ttx-suave ttx-junta' },
 *      { texto: 'since 2020',     liviano: false, junta: false, clase: 'ttx-fuerte' }]
 *
 * `desde` es cuántos grupos vinieron antes en el mismo enunciado, para los
 * casos en que parte de la línea se construye aparte —los nombres del About
 * son `<button>`, no `<span>`— y la alternancia no se puede reiniciar.
 *
 * `peso: false` deja solo la junta, sin alternancia: es el caso del crédito.
 *
 * **Los vacíos se caen** —un release sin artista no debe gastar un turno de la
 * alternancia ni dejar una junta suelta—, así que quien empareje el resultado
 * con otra lista por índice tiene que filtrar antes de llamar.
 */
export function grupos(textos, { desde = 0, peso = true } = {}) {
  const limpios = (textos ?? []).map((t) => String(t ?? '').trim()).filter(Boolean);
  const ultimo = limpios.length - 1;

  return limpios.map((texto, i) => {
    const liviano = esLiviano(desde + i);
    const junta = i < ultimo;
    return {
      texto,
      liviano,
      junta,
      clase: [peso && (liviano ? 'ttx-suave' : 'ttx-fuerte'), junta && 'ttx-junta']
        .filter(Boolean)
        .join(' '),
    };
  });
}

/** La alternancia arranca en liviano: el grupo 0 va en peso normal. */
export function esLiviano(i) {
  return i % 2 === 0;
}

// ── El home cuelga del catálogo ─────────────────────────────────────────
//
// El destacado del home **es un release**: `data/home.json` guarda la política
// —`fijo` con un id, o `auto`— y el material vive con su release, en el bloque
// `home` de `releases.json`. Así no hay dos sitios donde escribir el mismo
// título ni un destacado que no exista en el catálogo.
//
// Un lanzamiento por anunciar —sin Bandcamp y sin número— también es un
// release: se crea con `visible: false` y el bloque `home` lleno, y el
// catálogo no lo muestra hasta que salga.

/**
 * Si un release puede salir sorteado en `modo: "auto"`.
 *
 * Tres condiciones, y las tres son "que no quede una pantalla a medias":
 *
 *   - **arte**, que es lo único que la composición no puede inventar. La
 *     carátula de Bandcamp cuenta: es la imagen que el release ya trae, y
 *     `home.arte` está para reemplazarla cuando la portada merezca otra cosa,
 *     no para que un disco entero se quede fuera del home por no tenerla;
 *   - **texto**, propio (`home.texto`) o derivable del título;
 *   - **visible**, porque un anuncio se elige a dedo (`fijo`) y no por azar.
 *
 * Los links no entran. `listenUrl` no lo sabe Bandcamp y va a mano, así que
 * exigirlo dejaba el sorteo vacío —ningún release lo tenía— y el modo `auto`
 * muerto sin que nadie se enterara. La franja pinta los links que haya.
 *
 * El sorteo entre los que cumplen ocurre en el cliente, en cada carga: Pages
 * sirve archivos estáticos y no hay quién rote nada del otro lado.
 *
 * Vive aquí, y no en `home.js`, porque `tools/validate.mjs` pregunta lo mismo
 * antes de publicar. Una sola definición de "cumple" para las dos.
 */
export function cumpleHome(r) {
  return Boolean(
    tieneArteHome(r) && (r.home?.texto || r.album) && r.visible !== false,
  );
}

/** El arte de la portada: el propio si lo subieron, la carátula de Bandcamp si no. */
export const tieneArteHome = (r) => Boolean(r?.home?.arte || r?.bcImageId);
