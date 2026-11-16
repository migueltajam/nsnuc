"""Redibuja el cuervo-veleta del tejado en assets/images/fachada.png.

Borra el cuervo y el poste (rellenando con el cielo de la misma fila) y pinta el cuervo
original con algo más de detalle sobre su poste de siempre.
Ejecuta: python3 tools/veleta.py
"""
from PIL import Image
import os

PATH = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images', 'fachada.png')
C = {
    'K': (42, 36, 48),     # plumaje
    'W': (62, 54, 72),     # ala
    'H': (92, 84, 110),    # brillo de las plumas
    'E': (255, 255, 255),  # ojo
    'B': (201, 179, 126),  # pico
    'b': (150, 128, 88),   # pico, parte de abajo
    'M': (90, 74, 88),     # metal
    'm': (128, 112, 124),  # brillo del metal
    'D': (58, 46, 58),     # metal en sombra
    'G': (214, 176, 98),   # bola dorada
    'g': (240, 214, 150),  # brillo de la bola
}
# Cuervo original con algo más de detalle: pico en dos tonos, brillos en el ala y cola en punta.
# Cada fila empieza en x = 118; el poste y la cruz son los originales.
ROWS = ['..........KKK.......',
        '..........KEKBB.....',
        '......KKKKKKKb......',
        '......KWHWKK........',
        '....KKKWWHWK........',
        '...KKKKKWWKK........',
        '......KKKKK.........',
        '.....MMKMKMMMMMM....']
ART = [(26 + i, 118, r) for i, r in enumerate(ROWS)] + [(y, 128, 'M') for y in range(34, 46)] + [(37, 125, 'MMMMMMM')]

def main():
    im = Image.open(PATH).convert('RGBA')
    px = im.load()
    # 1) Borrar lo antiguo: cada píxel toma el cielo de su fila (misma paridad del tramado)
    for y in range(24, 46):  # desde la fila 24: la nube de al lado queda intacta
        for x in range(116, 142):
            src = 112 + (x - 112) % 2
            px[x, y] = px[src, y]
    # 2) Pintar la veleta y el cuervo
    for y, x0, row in ART:
        for i, ch in enumerate(row):
            if ch != '.':
                px[x0 + i, y] = C[ch] + (255,)
    im.save(PATH)
    print('ok')


if __name__ == '__main__':
    main()
