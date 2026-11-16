"""Redibuja el cuervo-veleta del tejado en assets/images/fachada.png con más detalle.

Borra el cuervo y el poste antiguos (rellenando con el cielo de la misma fila) y pinta
una veleta de metal con flecha, bola dorada y brazos, con el cuervo posado encima.
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
    'M': (90, 74, 88),     # metal
    'm': (128, 112, 124),  # brillo del metal
    'D': (58, 46, 58),     # metal en sombra
    'G': (214, 176, 98),   # bola dorada
    'g': (240, 214, 150),  # brillo de la bola
}
# (y, x inicial, fila)
ART = [
    (22, 128, 'KKK'),
    (23, 127, 'KKKKK'),
    (24, 127, 'KKKEKBB'),
    (25, 126, 'KKKKKKB'),
    (26, 124, 'KKKKKKKK'),
    (27, 122, 'KKWWWWHKKK'),
    (28, 120, 'KKWWHWWHWKKK'),
    (29, 118, 'KKKWWHWWHWKK'),
    (30, 117, 'KK.KKWWWWKK'),
    (31, 124, 'KKKKK'),
    (32, 125, 'D.D'),
    # Flecha de la veleta: aleta de cola a la izquierda y punta a la derecha
    (31, 117, 'M'),
    (32, 116, 'MmM'),
    (33, 116, 'MMMMmmmmmmmmmmmmmmmmmmMMM'),
    (34, 116, 'DDD.DDDDDDDDDDDDDDDDDDDD'),
    (35, 117, 'D'),
    (31, 137, 'M'),
    (32, 137, 'Mm'),
    (34, 140, '.'),
    (35, 137, 'D'),
    # Eje con bola dorada
    (35, 128, 'M'),
    (36, 127, 'GgG'),
    (37, 127, 'GGG'),
    (38, 128, 'M'),
    # Brazos de los puntos cardinales
    (39, 122, 'm.....M.....m'),
    (40, 121, 'mMMMMMMMMMMMMMm'),
    (41, 122, 'D.....M.....D'),
] + [(y, 128, 'M') for y in range(42, 46)] + [(45, 127, 'DMD')]
# Todo bajado para que el cuervo quede a la altura del antiguo (no lo tapa el marcador)
ART = [(y + (3 if y <= 38 else 2 if y <= 41 else 0), x, r) for y, x, r in ART if y < 42] + \
      [(y, 128, 'M') for y in range(44, 46)] + [(45, 127, 'DMD')]


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
