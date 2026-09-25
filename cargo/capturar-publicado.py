#!/usr/bin/env python3
"""Respalda el estado público de Cargo sin credenciales ni API privada.

Uso: python3 cargo/capturar-publicado.py cargo/respaldo-AAAA-MM-DD/publicado
"""

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

BASE = "https://tratratrax.cargo.site"
RUTAS = ("", "home", "about", "catalog", "blog", "merca", "nav-(desktop)", "nav-(mobile)")
MARCA = "window.__PRELOADED_STATE__="


def capturar(ruta, destino):
    url = f"{BASE}/{ruta}"
    html = subprocess.check_output(["curl", "--fail", "--location", "--silent", "--show-error", url])
    texto = html.decode("utf-8")
    if MARCA not in texto:
        raise RuntimeError(f"Cargo no entregó el estado esperado: {url}")
    inicio = texto.index(MARCA) + len(MARCA)
    estado, _ = json.JSONDecoder().raw_decode(texto[inicio:])
    nombre = ruta or "landing"
    (destino / f"{nombre}.html").write_bytes(html)
    (destino / f"{nombre}.json").write_text(json.dumps(estado, ensure_ascii=False, indent=2) + "\n")
    return {
        "ruta": "/" + ruta,
        "url": url,
        "sha256_html": hashlib.sha256(html).hexdigest(),
        "ids": list(estado.get("pages", {}).get("byId", {})),
        "root": estado.get("structure", {}).get("byParent", {}).get("root", []),
    }


def main():
    destino = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("cargo/respaldo-publicado")
    destino.mkdir(parents=True, exist_ok=True)
    indice = [capturar(ruta, destino) for ruta in RUTAS]
    (destino / "manifest.json").write_text(json.dumps(indice, ensure_ascii=False, indent=2) + "\n")
    print(f"{len(indice)} rutas guardadas en {destino}")


if __name__ == "__main__":
    main()
