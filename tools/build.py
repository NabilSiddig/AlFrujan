"""Expand <img data-img="name" ...> in src/index.src.html into full responsive <img> tags.

Usage: python3 tools/build.py   (run from the site folder; writes index.html)
"""
import os, re
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

def expand(m):
    attrs, name = m.group(1) + m.group(3), m.group(2)
    w, h = Image.open(os.path.join(IMG, name + ".webp")).size
    src = f"assets/img/{name}.webp"
    small = os.path.join(IMG, name + "-sm.webp")
    srcset = ""
    if os.path.exists(small):
        sw = Image.open(small).size[0]
        srcset = f' srcset="assets/img/{name}-sm.webp {sw}w, {src} {w}w"'
    return f'<img src="{src}"{srcset} width="{w}" height="{h}" loading="lazy" decoding="async"{attrs}>'

html = open(os.path.join(ROOT, "src", "index.src.html"), encoding="utf-8").read()
html = re.sub(r'<img((?:(?!data-img)[^>])*?)\s*data-img="([^"]+)"([^>]*)>', expand, html)
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(html)
print("index.html written")
