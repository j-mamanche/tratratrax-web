/**
 * GitHub Contents API de mentira para recorrer el Studio sin tocar el repo.
 * Solo atiende `data/*.json` y los guarda bajo `data/mock/`. Se inicia con
 * `npm run dev:mock`; borrar o restaurar esos cuatro JSON reinicia la prueba.
 */
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

const puerto = Number(process.env.TTX_MOCK_PORT || 8787);
const raiz = resolve('data/mock');
const sha = (bytes) => createHash('sha1').update(bytes).digest('hex');
const tipos = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
const responder = (res, estado, valor) => {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(valor));
};

function rutaMock(ruta) {
  const limpia = decodeURIComponent(ruta).replace(/^\/+/, '');
  const relativa = limpia.startsWith('data/') ? limpia.slice(5) : limpia.startsWith('media/') ? limpia : null;
  if (!relativa || relativa.includes('..')) return null;
  const destino = resolve(raiz, relativa);
  return destino.startsWith(`${raiz}${sep}`) ? destino : null;
}

async function archivo(ruta) {
  try { return await readFile(ruta); } catch { return null; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const media = /^\/media\/(.+)$/.exec(url.pathname);
  if (req.method === 'GET' && media) {
    const destino = rutaMock(`media/${media[1]}`);
    const bytes = destino && await archivo(destino);
    if (!bytes) return responder(res, 404, { message: 'Not Found' });
    const extension = media[1].split('.').pop()?.toLowerCase();
    res.writeHead(200, { 'Content-Type': tipos[extension] ?? 'application/octet-stream' });
    return res.end(bytes);
  }
  const contenido = /^\/repos\/[^/]+\/[^/]+\/contents\/(.+)$/.exec(url.pathname);
  if (req.method === 'GET' && /\/git\/trees\//.test(url.pathname)) return responder(res, 200, { tree: [] });
  if (!contenido) return responder(res, 404, { message: 'Ruta mock desconocida' });

  const destino = rutaMock(contenido[1]);
  if (!destino) return responder(res, 400, { message: 'Solo se permite data/*.json y media/* en el mock' });

  if (req.method === 'GET') {
    const bytes = await archivo(destino);
    if (!bytes) return responder(res, 404, { message: 'Not Found' });
    return responder(res, 200, { sha: sha(bytes), content: bytes.toString('base64') });
  }

  if (req.method !== 'PUT') return responder(res, 405, { message: 'Método no permitido' });
  let cuerpo = '';
  for await (const parte of req) cuerpo += parte;
  let pedido;
  try { pedido = JSON.parse(cuerpo); } catch { return responder(res, 400, { message: 'JSON inválido' }); }
  const anterior = await archivo(destino);
  if (anterior && pedido.sha && pedido.sha !== sha(anterior)) {
    return responder(res, 422, { message: 'sha no coincide' });
  }
  const bytes = Buffer.from(pedido.content || '', 'base64');
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, bytes);
  return responder(res, 201, { content: { sha: sha(bytes) }, commit: { message: pedido.message } });
}).listen(puerto, () => {
  console.log(`Mock de TraTraTrax Studio en http://localhost:${puerto} · datos: data/mock/`);
});
