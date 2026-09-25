import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cambiosDelBorrador, destino, destinoError, equivalente } from '../src/panel/lib/cambios.js';

const base = {
  releases: [{ id:'uno', album:'Uno', order:1, visible:true }, { id:'dos', album:'Dos', order:2, visible:true }],
  artists: [{ slug:'ana', display:'Ana' }], home: { modo:'auto' },
  blog: { highlight:{ article:'a' }, ticker:{ label:'NEWS', url:'' }, items:[{ id:'a', title:'A', order:1, visible:true }, { id:'b', title:'B', order:2, visible:true }] },
};
const estado = (cambios = {}) => ({ ...base, ...cambios, base:Object.fromEntries(Object.entries(base).map(([k,v]) => [k,JSON.stringify(v)])) });

test('ignora el orden de claves, el orden físico de entidades y valores vacíos equivalentes', () => {
  assert.ok(equivalente({ a:1, b:'' }, { b:null, a:1 }));
  const s = estado({ releases:[{ visible:true, order:2, album:'Dos', id:'dos' }, { order:1, id:'uno', album:'Uno', visible:true }] });
  assert.deepEqual(cambiosDelBorrador(s), []);
});

test('múltiples cambios simultáneos enlazan por id y campo; eliminar no enlaza a una ficha', () => {
  const s = estado({
    releases:[{ id:'uno', album:'Uno nuevo', order:1, visible:false }],
    blog:{ highlight:{ article:'b' }, ticker:{ label:'NEWS', url:'https://example.com' }, items:[{ id:'a', title:'A', order:2, visible:true }, { id:'b', title:'B', order:1, visible:true }, { id:'c', title:'C', order:3, visible:true }] },
  });
  const cambios = cambiosDelBorrador(s);
  assert.ok(cambios.some((c) => c.id === 'uno' && c.campo === 'album' && destino(c) === '/catalogo?id=uno&campo=album'));
  assert.ok(cambios.some((c) => c.id === 'uno' && c.accion === 'ocultado'));
  assert.ok(cambios.some((c) => c.id === 'dos' && c.accion === 'eliminado' && !destino(c).includes('id=')));
  assert.ok(cambios.some((c) => c.id === 'c' && c.accion === 'creado'));
  assert.ok(cambios.some((c) => c.campo === 'highlight.article' && destino(c) === '/blog?campo=highlight.article'));
  assert.ok(cambios.some((c) => c.campo === 'ticker.url'));
  assert.ok(cambios.some((c) => c.id === 'a' && c.accion === 'reordenado'));
});

test('validación resuelve identidades del borrador, secciones y link directo', () => {
  const s = estado();
  assert.equal(destinoError('blog items[1] "B": url no es válida', s), '/blog?id=b&campo=url');
  assert.equal(destinoError('blog ticker: url no es válida', s), '/blog?campo=ticker.url');
  assert.equal(destinoError('blog highlight: article "z" no existe', s), '/blog?campo=highlight.article');
  assert.equal(destinoError('home.json: `azar` tiene que ser una lista de ids', s), '/home?campo=azar');
  assert.equal(destinoError('releases[1] "Dos": fecha inválida', s), '/catalogo?id=dos&campo=date');
  assert.equal(destinoError('artists[0]: falta `display`', s), '/catalogo?eliminado=artista+Ana');
});

test('guardar asienta la base; revertir borra cambios; conflicto remoto conserva el borrador recuperable', async () => {
  const memoria = new Map();
  globalThis.sessionStorage = { getItem:k => memoria.get(k) ?? null, setItem:(k,v) => memoria.set(k,v) };
  globalThis.localStorage = { setItem:()=>{} };
  const { abrir, tocar, leer, sucios, asentar, recuperarBorrador } = await import('../src/panel/lib/borrador.js');
  const servidor = { ...base, about:null, shas:{ releases:'a', artists:'a', home:'a', blog:'a', about:'a' } };
  abrir(servidor);
  tocar({ blog:{ ...base.blog, ticker:{ label:'OTRA', url:'' } } });
  assert.deepEqual(sucios(), ['blog']);
  tocar({ blog:base.blog });
  assert.deepEqual(sucios(), []);
  tocar({ blog:{ ...base.blog, ticker:{ label:'OTRA', url:'' } } });
  asentar({ blog:'b' }, ['blog']);
  assert.deepEqual(sucios(), []);
  tocar({ blog:{ ...base.blog, ticker:{ label:'LOCAL', url:'' } } });
  abrir({ ...servidor, blog:{ ...base.blog, ticker:{ label:'REMOTE', url:'' } }, shas:{ ...servidor.shas, blog:'c' } });
  assert.equal(leer().desfasado, true);
  assert.equal(leer().recuperable.blog.ticker.label, 'LOCAL');
  recuperarBorrador();
  assert.equal(leer().blog.ticker.label, 'LOCAL');
  assert.deepEqual(sucios(), ['blog']);
});
