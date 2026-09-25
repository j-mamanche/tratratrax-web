# TraTraTrax · integrated manual

**Version:** 24 September 2026 (Bogotá). [Bilingual index and verification status](README.md). Live links: [public site](https://tratratrax.cargo.site/) · [Studio](https://tratratrax-web.netlify.app/).

## Contents

1. [Using the public site](#1-using-the-public-site): [pages](#page-tour), [navigation](#desktop-and-mobile-navigation), [repeat the tour](#repeat-the-tour).
2. [Updating content](#2-updating-content): [editing map](#what-is-edited-where), [Studio](#working-in-tratratrax-studio), [Cargo merch](#merch-in-cargo), [public check](#check-the-public-result).

## 1. Using the public site

<video controls preload="metadata" width="720"><source src="media/en-site.mp4" type="video/mp4"><track kind="captions" src="media/en-site.vtt" srclang="en" label="English" default></video>

[Video: site tour, 00:24](media/en-site.mp4) · [Editable script](guiones/en-site.md). The images are dated original captures; repeat the interactions below on the live site.

### Page tour

| Published route | What it shows and how to use it |
|---|---|
| [`/`](https://tratratrax.cargo.site/) | **Landing** is a full-screen sugar-cane scene. Move the pointer and cut with the machete to start the nav entrance; on the first visit it fades in gradually. The nav logo opens Home. `/landing` is the editor slug, not the public homepage route. |
| [`/home`](https://tratratrax.cargo.site/home) | **Home** features a catalog release. At rest, the title band shows art/video. On desktop, hover over the band to open the split composition, with art and video in two modules. Leaving closes it; the next pass reverses the modules. `BUY` and `LISTEN` open configured external destinations. The title opens that release in `/catalog` only when the release is visible there. On touch, press and hold the band, then release to close. Mobile also shows brief idle flashes. |
| [`/about`](https://tratratrax.cargo.site/about) | `TRA · TRA · TRAX` leaves a gap. Hovering over the gap closes it and reveals the motto, social links and email. On mobile, tap to reveal and tap outside to close. Hover over a founder to show their emblem. **The Instagram link is on the emblem**, not the name. Check the destination before leaving the site. |
| [`/catalog`](https://tratratrax.cargo.site/catalog) | Cover viewer above, labels in the middle band and a horizontal cover rail below. Drag with a mouse, swipe with a finger, use a trackpad or wheel over the rail; keyboard arrows work when the rail has focus. Select a label or cover to open credits in place, and select again to close. The viewer follows the cover crossing the rail center. `Purchase` and `Listen` open external links in another tab. |
| [`/blog`](https://tratratrax.cargo.site/blog) | A linked **highlight**, the `PRENSA` ticker/gap and an archive linking to outside publications. On desktop, the archive is split into three independently scrolling vertical columns: scroll inside the column you want to read. P5's mobile layout places the archive in one two-column flow with **one internal scroll** below the highlight and ticker. If the available height is too small, normal page scrolling takes over. The top sections stay put while the archive scrolls. The P5 mobile capture covers a preview and a local bundle injected on Cargo, not a physical phone test. |
| [`/merca`](https://tratratrax.cargo.site/merca) | Cargo's merch showcase is an **overlay** anchored to the site's middle band. Open it from the nav or direct URL; select a card to open a product overlay with its own hash. `CIÉRRAME` closes the product, then the showcase. Check the product name, stock dot, copy, buy control and URL individually. A `BUY` label is not necessarily an active purchase link: some products have their own text/control. The fifth Tee seen live remains under editorial review and is not a finished product example. |

![Published mobile Home](../p2-evidence/mobile-home.png)

![Published mobile Catalog](../p2-evidence/mobile-catalog.png)

![P2 published mobile Blog capture](../p2-evidence/mobile-blog-published.png)

### Desktop and mobile navigation

The nav keeps a logo and **About, Catalog, Blog and Merca** links; the active page is italic. The logo opens `/home`. On desktop, the motto types itself and hovering over the logo may cover the page with a flag while keeping the nav legible. Outside Home, a flag can briefly appear after inactivity. On mobile there is one logo on the left and links on the right: tap links, without relying on hover. Cargo can navigate through AJAX; check the active mark after each change. External buy/listen, press and Instagram links leave the Cargo flow.

### Repeat the tour

1. Open `/` directly, then use the logo to reach `/home`; record the nav entrance and resting state.
2. Follow Home → About → Catalog → Blog → Merca using the nav. Try one interaction on each page and return to its initial state. In Catalog, distinguish horizontal rail scrolling from vertical scrolling inside open credits.
3. Repeat in a 390×844 mobile viewport using taps and swipes. In Blog, scroll **only the archive** to the last story and back; confirm none is hidden behind the nav. Open and close a merch product, checking its URL hash.
4. Record differences from the dated [P2 captures](../P2-NAV-CURSOR.md) and [P5 evidence](../P5-BLOG.md). They do not replace inspecting the current publication.

## 2. Updating content

### What is edited where

| Public content | Editor |
|---|---|
| Releases, order and visibility, covers, credits and purchase/listen links | **TraTraTrax Studio → Catalog**. |
| Featured release and Home material | **Studio → Home**; material belongs to the same Catalog release. |
| Blog highlight, ticker/gap and articles | **Studio → Blog**. |
| `/merca` showcase, product pages, thumbnails, copy, images and tags | **Cargo directly**, never Studio. |
| Landing, About, nav, flags, design/CSS and page structure | **Outside Studio**; Cargo/code maintenance and technical review. |

### Working in TraTraTrax Studio

<video controls preload="metadata" width="720"><source src="media/en-studio.mp4" type="video/mp4"><track kind="captions" src="media/en-studio.vtt" srclang="en" label="English" default></video>

[Video: Studio, 00:18](media/en-studio.mp4) · [Editable script](guiones/en-studio.md). The chapter is a visual procedure guide; controls were checked in the live Studio without publishing a test edit.

1. Open [Studio](https://tratratrax-web.netlify.app/). If the gate appears, use the team's password; keep it out of captures. Studio opens **Catalog**. On desktop, `EN` switches the interface to English and `ES` switches back; on mobile use **⋯ → English/Español**.
2. In **Catalog**, search for a release or use the rail/grid. Open its record to edit title, number, date, artists, cover, links, credits and Home material. `Visible en el sitio` controls its presence in Catalog. **Añadir un lanzamiento** creates a record; drag its row to reorder. Check Home and Blog references before deleting.
3. In **Home**, choose **Fijo** and a specific release, or **Aleatorio** and the eligible releases. A hidden release can be prepared as a fixed feature, but it will not appear in Catalog and its title must not promise a public detail. Check art, video, poster and band text. **Abrir su ficha** opens the same release in Catalog.
4. In **Blog**, open **Highlight** to choose an article and image. Open **Grieta** for label, text and URL. Under **Artículos**, `+` creates a story, its title opens editing, `↑/↓` reorders, and `Visible/Oculto` controls display. Check title, excerpt and external URL. Deleting is an editorial decision separate from hiding.
5. Select **Vista previa** in the relevant section; it mounts the real widget over the current tab draft. Before saving, open the bar's changes status to review pending fields and references. If someone else saved first, follow the conflict notice, reload/compare the remote version and reapply intended changes; do not blindly overwrite.
6. Select **Guardar cambios** once for changes across sections. It becomes available when changes are pending. Studio validates before committing; fix any flagged field and preview again. Saving starts repository publication; allow Pages and Cargo caching to update before checking the public site.

### Merch in Cargo

<video controls preload="metadata" width="720"><source src="media/en-cargo.mp4" type="video/mp4"><track kind="captions" src="media/en-cargo.vtt" srclang="en" label="English" default></video>

[Video: Cargo, 00:18](media/en-cargo.mp4) · [Editable script](guiones/en-cargo.md). **The tag controls were observed in the editor**; no inventory was changed for this manual.

1. Open the site's Cargo editor with an authorized account. Open **Pages** from the top-right menu. Find **Merca** (`Z4026822794`, route `/merca`) and open it. Its grid uses `thumbnail-index="tag:merch"`. Do not use `/merch` for the showcase route.
2. In **Pages**, open each product by name and **verify its ID, slug and content** before editing. There are two `TEE CLÁSICA TRA` pages. The additional `X0596556527` (`tee-clásica-tra-1`) mixes product copy and requires an editorial decision. The other identified products are beach towel `H0731431535`, Tee `O1289033983`, scarf `H0993208634` and cassette `T2595752217`.
3. Change copy and images **only with editorial authorization**. Edit the product page in Cargo. Its thumbnail is under **Pages → right-click product → Settings… → Thumbnail**. Keep existing prices, purchase destinations and copy until confirmed; do not derive them from a tag.
4. In the same **Settings…**, find **Tags (separate by comma)**. Keep `merch` to include the product in the grid. Once the team confirms inventory, leave exactly **one** of `in-stock`, `few-units` or `out-of-stock`, comma-separated. Remove incompatible stock tags. The tag drives the grid's visual stock dot. Only the checked beach towel page automatically connects its product label to the tag; other product labels and buttons need individual review.
5. Save through Cargo's workflow and review the complete draft before publishing. Do not move products into a Set: a test changed the overlay's containing route. After publication, open `/merca` directly and from the nav. For **each** approved product, check one card, thumbnail, stock dot, open/close behavior, copy, buy control, actual link target where present, and hash/URL.

**Needs editorial attention:** the live inspection showed five cards including the additional Tee; an earlier public backup had four. Tee `O1289033983` was tagged `out-of-stock` while showing `Buy €35`; scarf `H0993208634` was tagged `few-units` while saying “Sold out”. Do not silently reconcile them without approved inventory and copy. [Evidence and editor record](../../cargo/snippets/merca-estado.md).

### Check the public result

After an actual save, reload `/home`, `/catalog`, `/blog` or `/merca` **by direct URL and via the nav**, as applicable. Compare preview and publication on desktop and mobile. For a release, check visibility, order, cover, credits and both external links. For Blog, check highlight, ticker, order and last story. For Merch, complete the per-product checks above. If something differs, inspect publication status and the draft before editing again. [Verified and pending steps](README.md#comprobación-y-límites).
