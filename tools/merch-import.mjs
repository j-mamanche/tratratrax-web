/** Actualiza data/merch.json desde un listado Bandcamp, sin pisar fichas editadas. */
import { readFile, writeFile } from 'node:fs/promises';
import { listarMerch, importarMerch } from '../src/lib/bandcamp-merch.mjs';

const url = process.argv[2] || 'https://tratratrax.bandcamp.com/merch';
const archivo = new URL('../data/merch.json', import.meta.url);
const previos = JSON.parse(await readFile(archivo, 'utf8'));
const listado = await listarMerch(url);
const nuevos = [];
const errores = [];
for (const [i, item] of listado.entries()) {
  if (previos.some((p) => p.sourceItemId === item.itemId)) continue;
  try {
    const p = await importarMerch(item.url, { itemId: item.itemId, listado: item });
    if (!p.thumbnail) throw new Error('sin imagen');
    let id = p.id;
    for (let n = 2; [...previos, ...nuevos].some((x) => x.id === id); n++) id = `${p.id}-${n}`;
    nuevos.push({ ...p, id, order: previos.length + nuevos.length, visible: false });
    console.log(`${i + 1}/${listado.length} ${p.title}`);
  } catch (e) { errores.push(`${item.title}: ${e.message}`); }
}
if (errores.length) {
  console.error(`No se guardó el lote. Fallaron ${errores.length} productos:\n${errores.join('\n')}`);
  process.exitCode = 1;
} else {
  await writeFile(archivo, JSON.stringify([...previos, ...nuevos], null, 2) + '\n');
  console.log(`${nuevos.length} productos añadidos como borradores a data/merch.json.`);
}
