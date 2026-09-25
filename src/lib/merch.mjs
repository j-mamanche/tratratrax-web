/** Modelo único para la merca experimental. Los borradores ocultos pueden estar incompletos. */
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STOCK = new Set(['in-stock', 'few-units', 'out-of-stock']);
const url = (s) => { try { return ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; } };
const imagen = (s) => typeof s === 'string' && (url(s) || /^media\/[a-z0-9][a-z0-9._/-]*$/i.test(s) && !s.includes('..'));

export function revisarMerch(items, media = null) {
  const errores = [];
  if (!Array.isArray(items)) return ['merch.json: debe ser una lista'];
  const ids = new Set();
  const sourceIds = new Set();
  for (const [i, p] of items.entries()) {
    const at = `merch[${i}] "${p?.title ?? '¿?'}"`;
    if (!ID.test(p?.id ?? '')) errores.push(`${at}: id inválido`);
    else if (ids.has(p.id)) errores.push(`${at}: id duplicado "${p.id}"`);
    else ids.add(p.id);
    if (!STOCK.has(p?.stock)) errores.push(`${at}: stock debe ser in-stock, few-units u out-of-stock`);
    if (typeof p?.order !== 'number' || !Number.isFinite(p.order)) errores.push(`${at}: falta order numérico`);
    if (typeof p?.visible !== 'boolean') errores.push(`${at}: falta visible`);
    if (!Array.isArray(p?.details) || p.details.some((x) => typeof x !== 'string')) errores.push(`${at}: details debe ser una lista de textos`);
    const images = Array.isArray(p?.images) ? p.images : [];
    if (!Array.isArray(p?.images) || images.some((x) => x !== '' && !imagen(x))) errores.push(`${at}: images debe ser una lista de imágenes válidas`);
    for (const [campo, ruta] of [['thumbnail', p?.thumbnail], ...images.map((x) => ['images', x])]) {
      if (ruta && !imagen(ruta)) errores.push(`${at}: ${campo} no es URL ni ruta media/ válida`);
      else if (ruta?.startsWith('media/') && media && !media.has(ruta)) errores.push(`${at}: ${campo} apunta a "${ruta}", que no está en el repo`);
    }
    if (p?.buyUrl && !url(p.buyUrl)) errores.push(`${at}: buyUrl no es una URL válida`);
    if (p?.sourceUrl && !url(p.sourceUrl)) errores.push(`${at}: sourceUrl no es una URL válida`);
    if (p?.sourceItemId) {
      if (sourceIds.has(p.sourceItemId)) errores.push(`${at}: sourceItemId duplicado "${p.sourceItemId}"`);
      sourceIds.add(p.sourceItemId);
    }
    if (p?.visible) {
      if (!p.title?.trim()) errores.push(`${at}: falta title`);
      if (!p.thumbnail && !p.images?.[0]) errores.push(`${at}: falta imagen para la vitrina`);
      if (p.stock !== 'out-of-stock' && !p.buyUrl) errores.push(`${at}: falta buyUrl para un producto disponible`);
    }
  }
  return errores;
}
