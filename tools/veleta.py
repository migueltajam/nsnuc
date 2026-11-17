"""Quita el cuervo de assets/images/fachada.png y deja solo el poste de la veleta.

El cuervo se dibuja animado desde js/environment.js (CROW_FRAMES), así que en la imagen
solo queda el poste con la percha (y = 33) y la cruz (y = 37).
Ejecuta: python3 tools/veleta.py
"""
from PIL import Image
import os

PATH = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'fachada.png')
METAL = (90, 74, 88, 255)


def main():
    im = Image.open(PATH).convert('RGBA')
    px = im.load()
    for y in range(22, 46):
        for x in range(116, 140):
            px[x, y] = px[112 + (x - 112) % 2, y]  # cielo de la misma fila
    for y in range(34, 46):
        px[128, y] = METAL
    for x in range(125, 132):
        px[x, 37] = METAL
    for x in range(123, 134):
        px[x, 33] = METAL
    im.save(PATH)
    print('ok')


if __name__ == '__main__':
    main()
