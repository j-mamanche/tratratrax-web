# TraTraTrax — web

Contenido, widgets y herramientas del sitio de TraTraTrax.

El sitio vive en **Cargo.site**. Este repo no lo reemplaza: le pone el contenido.
Cargo aporta el dominio, las fuentes y el cascarón; todo lo que es catálogo,
merca y datos se genera desde aquí.

La arquitectura completa y el porqué de cada decisión están en **[PLAN.md](PLAN.md)**.

---

## Empezar

```bash
npm install
npm run dev        # abre el tablero de datos en localhost:4321
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el tablero de estado de los datos |
| `npm run validate` | Revisa `data/*.json` — errores y avisos |
| `npm run build` | Valida y compila (falla si hay errores) |
| `npm run import -- <url>` | Trae un release desde Bandcamp |

---

## Agregar un release

Bandcamp ya tiene casi todo, así que no se escribe a mano:

```bash
npm run import -- https://tratratrax.bandcamp.com/album/pyrexia --append
npm run validate
```

De ahí sale el título, los artistas, la fecha, la carátula, los créditos y el
número de catálogo. **Lo único que hay que poner a mano es `listenUrl`**, el
linktree — Bandcamp no lo sabe.

Sin `--append` el release se imprime en pantalla en vez de guardarse, que es
útil para revisarlo antes.

Para traer una discografía entera de una vez:

```bash
npm run import -- https://tratratrax.bandcamp.com/music
```

> Ojo: la página `/music` del sello **no lista todo**. Los releases alojados en
> el Bandcamp del artista solo aparecen si están etiquetados con el sello. Seis
> del catálogo actual no salen ahí y hubo que importarlos por URL individual.

### Por qué el importador corre en Node y no en el navegador

Bandcamp no manda cabeceras CORS, así que un `fetch` desde una página web sería
bloqueado. No hace falta API ni token: los datos están en el HTML de la página.

---

## Cómo están escritos los créditos

El sello ya usa la convención `Rol__ Valor` en Bandcamp, así que el importador
los guarda estructurados:

```json
"credits": [{ "role": "Mastering", "name": "Beau Thomas at Ten Eight Seven" }]
```

Se guardan como objetos y se renderizan como `Mastering__ Beau Thomas…`. El
formato bonito es de **salida**, no de almacenamiento — así nadie tiene que
parsear texto libre para cambiar un dato.

Los releases viejos escribieron los créditos como texto corrido. En esos casos
todo queda en `note` y se pueden ir pasando a `credits` con calma. El tablero de
`npm run dev` lista cuáles faltan.

---

## Mapa del repo

```
data/        La fuente de verdad. Es lo único que el equipo necesita entender.
src/widgets/ Lo que corre DENTRO de Cargo: JS sin framework, CSS scopeado.
src/pages/   El taller: tablero, previews y (pronto) el panel de edición.
tools/       Importador de Bandcamp y validador.
cargo/       Espejo versionado de lo que vive dentro de Cargo.
```

`cargo/` no es decoración: Cargo no tiene historial propio, así que este es el
único backup de su HTML y CSS. Cada vez que se toque algo allá, se actualiza acá.

---

## Publicar

Push a `main` → GitHub Actions compila y publica en GitHub Pages. Cargo carga el
bundle desde ahí, así que **publicar contenido nuevo no requiere entrar a Cargo**.
Solo se toca Cargo cuando nace una página nueva.
