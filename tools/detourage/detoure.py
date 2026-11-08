"""Détourage des images Gemini (fond uni magenta ou vert) en PNG transparents recadrés.

Utilisation :
    python detoure.py <dossier_source> <dossier_sortie> [fichier.jpg ...]
Sans liste de fichiers : tous les *.jpg du dossier source.
Sans argument : ancien usage (src_jpg/ -> png/).

Fond magenta : méthode d'origine (2026-11-08), inchangée.
Fond vert (#00FF00) : même principe, mais seul le vert « pur » est retiré à l'intérieur de l'objet et la teinte verte
n'est corrigée que sur le bord, pour ne pas trouer ni griser les pelouses et les feuillages.
"""
import sys, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage as nd


def proc(f, out):
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32)
    h, w, _ = a.shape
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    bg = np.median(border, 0)
    green = bg[1] > bg[0] and bg[1] > bg[2]
    d = np.sqrt(((a - bg) ** 2).sum(2))
    loose = d < 90; tight = d < 40
    lab, _ = nd.label(loose)
    ids = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); ids = ids[ids > 0]
    bgmask = np.isin(lab, ids) | tight
    alpha = np.where(bgmask, 0, 255).astype(np.float32)
    edge = nd.binary_dilation(~bgmask, iterations=2) & bgmask
    t = np.clip((d - 40) / (110 - 40), 0, 1)
    alpha[edge] = 255 * t[edge]
    fringe = nd.binary_dilation(bgmask, iterations=2) & ~bgmask
    alpha[fringe] = np.minimum(alpha[fringe], 255 * np.clip((d[fringe] - 30) / 90, 0, 1))
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    if not green:
        k = np.minimum(R, B) - G
        keyish = (np.abs(R - B) < 80) & (np.minimum(R, B) > 120)
        ak = np.where(keyish, 255 * np.clip((110 - k) / 60, 0, 1), 255)
    else:
        k = G - np.maximum(R, B)
        # seul un vert très saturé (écart G - max(R, B) > 85) est retiré à l'intérieur ; plantes et pelouses : écart < 85
        keyish = (G > 110) & (k > 0)
        ak = np.where(keyish, 255 * np.clip((120 - k) / 35, 0, 1), 255)
    ad = 255 * np.clip((d - 45) / 50, 0, 1)
    alpha = np.minimum(alpha, np.minimum(ak, ad))
    if not green:
        s = np.clip(k - 15, 0, None) * keyish
        a[..., 0] = R - s * 0.9; a[..., 2] = B - s * 0.9
    else:
        # bande de 3 px autour du transparent : le vert ne dépasse pas max(R, B) + 10 (contours sans liseré vert)
        band = nd.binary_dilation(alpha < 250, iterations=3) & (alpha >= 20)
        a[..., 1] = np.where(band, np.minimum(G, np.maximum(R, B) + 10), G)
    alpha[alpha < 20] = 0
    rgba = np.dstack([np.clip(a, 0, 255), alpha]).astype(np.uint8)
    ys, xs = np.where(alpha > 8)
    y0, y1, x0, x1 = max(ys.min() - 4, 0), min(ys.max() + 5, h), max(xs.min() - 4, 0), min(xs.max() + 5, w)
    Image.fromarray(rgba[y0:y1, x0:x1]).save(out, optimize=True)
    return bg, (x1 - x0, y1 - y0), 'vert' if green else 'magenta'


if __name__ == '__main__':
    if len(sys.argv) >= 3:
        src, dst = sys.argv[1], sys.argv[2]
        files = [os.path.join(src, n) for n in sys.argv[3:]] or sorted(glob.glob(os.path.join(src, '*.jpg')))
    else:
        dst = 'png'; files = sorted(glob.glob('src_jpg/*.jpg'))
    os.makedirs(dst, exist_ok=True)
    for f in files:
        o = os.path.join(dst, os.path.basename(f)[:-4] + '.png')
        bg, sz, key = proc(f, o)
        print(os.path.basename(o), key, bg.astype(int), sz)
