"""Build dated, captioned visual chapters from original project captures.

Requires Pillow and ffmpeg. This does not record or log into an editor.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import subprocess

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'media'
SCRIPTS = ROOT / 'guiones'
OUT.mkdir(exist_ok=True)
SCRIPTS.mkdir(exist_ok=True)
FONT = '/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
font = ImageFont.truetype(FONT, 39)
small = ImageFont.truetype(FONT, 25)
bold = ImageFont.truetype(BOLD, 63)

SHOTS = {
    'home': ROOT.parent / 'p2-evidence/mobile-home.png',
    'catalog': ROOT.parent / 'p2-evidence/mobile-catalog.png',
    'blog': ROOT.parent / 'p2-evidence/mobile-blog-published.png',
}

CHAPTERS = {
 'es-sitio': [
  ('Landing / y navegación', 'Abrir la portada; cortar la caña y usar el logo para ir a Home.', None),
  ('Home /home y About /about', 'La grieta revela el destacado y, en About, las redes y emblemas.', 'home'),
  ('Catálogo /catalog', 'Deslizar el carril; abrir una carátula y revisar créditos y enlaces.', 'catalog'),
  ('Blog /blog y Merca /merca', 'Desplazar el archivo; abrir y cerrar una ficha por su hash.', 'blog'),
 ],
 'en-site': [
  ('Landing / and navigation', 'Open the landing; cut through the cane and use the logo for Home.', None),
  ('Home /home and About /about', 'The split reveals the feature; About reveals links and emblems.', 'home'),
  ('Catalog /catalog', 'Scroll the rail; open a cover and check credits and links.', 'catalog'),
  ('Blog /blog and Merch /merca', 'Scroll the archive; open and close a product using its hash.', 'blog'),
 ],
 'es-studio': [
  ('TraTraTrax Studio', 'Entrar sin grabar credenciales. Elegir idioma en EN / ES.', None),
  ('Catálogo + Home', 'Editar el release, su visibilidad y orden; elegir destacado fijo o aleatorio.', 'catalog'),
  ('Blog + publicación', 'Editar highlight, grieta y artículos; previsualizar y revisar pendientes.', 'blog'),
 ],
 'en-studio': [
  ('TraTraTrax Studio', 'Sign in without recording credentials. Choose EN / ES.', None),
  ('Catalog + Home', 'Edit release, visibility and order; choose fixed or random feature.', 'catalog'),
  ('Blog + publication', 'Edit highlight, ticker and stories; preview and review changes.', 'blog'),
 ],
 'es-cargo': [
  ('Cargo → Pages → Merca', 'Abrir /merca y verificar cada ficha por ID y slug.', None),
  ('Settings… → Tags', 'Conservar merch y un solo tag de stock confirmado.', None),
  ('Guardar y verificar', 'Revisar grilla, ficha, botón y URL tras publicar.', None),
 ],
 'en-cargo': [
  ('Cargo → Pages → Merca', 'Open /merca and verify each product by ID and slug.', None),
  ('Settings… → Tags', 'Keep merch and one confirmed stock tag.', None),
  ('Save and verify', 'Check grid, page, button and URL after publication.', None),
 ],
}

def wrapped(draw, text, max_w):
    words, rows, row = text.split(), [], ''
    for word in words:
        candidate = (row + ' ' + word).strip()
        if draw.textbbox((0, 0), candidate, font=font)[2] > max_w and row:
            rows.append(row)
            row = word
        else:
            row = candidate
    if row: rows.append(row)
    return rows

def frame(title, narration, shot, locale):
    canvas = Image.new('RGB', (1280, 720), '#141414')
    draw = ImageDraw.Draw(canvas)
    if shot:
        source = Image.open(SHOTS[shot]).convert('RGB')
        if source.height > source.width:
            source.thumbnail((570, 540), Image.Resampling.LANCZOS)
            canvas.paste(source, (1280 - source.width - 55, 0))
        else:
            source = ImageOps.fit(source, (1280, 550), method=Image.Resampling.LANCZOS)
            canvas.paste(Image.blend(source, Image.new('RGB', source.size, 'black'), 0.25), (0, 0))
    draw.rectangle((0, 540, 1280, 720), fill='#141414')
    draw.text((60, 46 if not shot else 44), title, font=bold, fill='white')
    y = 574
    for row in wrapped(draw, narration, 1140):
        draw.text((60, y), row, font=font, fill='#f3f3f3')
        y += 47
    draw.text((60, 504), 'TRATRATRAX  ·  24.09.2026', font=small, fill='#ededed')
    if shot:
        draw.text((60, 458), 'CAPTURA ORIGINAL / ORIGINAL CAPTURE', font=small, fill='#ededed')
    else:
        draw.text((800, 504), 'GUÍA VISUAL / VISUAL GUIDE', font=small, fill='#ededed')
    return canvas

def stamp(s):
    seconds = int(s)
    return f'00:00:{seconds:02d}.000'

for name, slides in CHAPTERS.items():
    locale = 'es' if name.startswith('es-') else 'en'
    folder = OUT / f'.frames-{name}'
    folder.mkdir(exist_ok=True)
    concat = []
    vtt = ['WEBVTT', '']
    script = [f'# {name} — guion editable', '',
              f'Duración: {len(slides)*6} s. Versión: 24-09-2026, Bogotá.',
              'Formato: capítulo visual anotado con subtítulos; no es una grabación continua del editor.', '']
    for i, (title, narration, shot) in enumerate(slides):
        path = folder / f'{i:02d}.png'
        frame(title, narration, shot, locale).save(path)
        concat.extend([f"file '{path}'", 'duration 6'])
        vtt.extend([str(i+1), f'{stamp(i*6)} --> {stamp((i+1)*6)}', narration, ''])
        script.extend([f'## {stamp(i*6)}–{stamp((i+1)*6)} · {title}', '',
                       f'Narración/subtítulo: {narration}',
                       f'Imagen: {"captura original P2 — " + shot if shot else "tarjeta creada para este manual"}.', ''])
    concat.append(f"file '{folder / f'{len(slides)-1:02d}.png'}'")
    manifest = folder / 'concat.txt'
    manifest.write_text('\n'.join(concat) + '\n')
    (OUT / f'{name}.vtt').write_text('\n'.join(vtt), encoding='utf-8')
    (SCRIPTS / f'{name}.md').write_text('\n'.join(script), encoding='utf-8')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-safe', '0',
                    '-f', 'concat', '-i', str(manifest), '-vf', 'fps=15,format=yuv420p',
                    '-t', str(len(slides)*6),
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28', '-movflags', '+faststart',
                    str(OUT / f'{name}.mp4')], check=True)
    for item in folder.iterdir(): item.unlink()
    folder.rmdir()
