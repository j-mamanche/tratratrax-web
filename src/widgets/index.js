// Entrada del bundle. Esto es lo que Cargo carga con una sola línea en el
// HTML global:
//
//   <script src="https://j-mamanche.github.io/tratratrax-web/ttx.js?v=1" defer></script>
//
// El CSS lo inyecta el propio loader; no hay una segunda línea que mantener.

import './tokens.css';
import './catalogo/catalogo.js';
import './home/home.js';
import './about/about.js';
import './canas/canas.js';

import { iniciar } from './_runtime/mount.js';

iniciar();
