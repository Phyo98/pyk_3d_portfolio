"""Cut a pet turnaround sheet into views, then split each view into a body plus
separately animated parts (legs, tail) for the roaming pets in the 3D room.

  python3 scripts/pet-rig.py corgi --sheet path/to/sheet.png   # cut views + rig
  python3 scripts/pet-rig.py whitecat                           # rig from existing sources

For pet <name>, reads / writes
  src/assets/pets/<name>/source/{front,back,left,right}.webp  full views, transparent bg
  src/assets/pets/<name>/{view}-body.webp, {view}-{part}.webp  animation pieces
  src/components/room/pets/<name>Rig.ts                         pixel layout (generated)

Needs Pillow. Sheet regions, leg columns and tail cuts below were measured by eye
for each sheet; if the art changes, re-measure them.
"""
import argparse
import json
import os
from PIL import Image, ImageDraw, ImageFilter

# ── per-pet configuration ───────────────────────────────────────────────────
# Side views: leg pairs as (x0, seam, x1, which half is the far leg). The near
#   leg is its own half; the far leg is the whole pair drawn behind it, so when
#   they swing apart the gap fills with fur. Legs are sheared from the joint.
# Front / back views: legs as (x0, x1); they lift in turn.
# Optional tail: everything in [x0, x1] above `cut` is the tail; it sways
#   around `pivot` and is drawn behind the body, fading out below `cut`.
PETS = {
    'corgi': dict(
        export='CORGI_RIG',
        key='blue',
        scale=1.15,
        regions={
            'front': (650, 30, 940, 410),
            'back':  (1010, 30, 1290, 410),
            'left':  (580, 455, 960, 830),
            'right': (990, 455, 1370, 830),
        },
        views={
            'left': dict(kind='side', facing=-1, cut=324, top=298, pivot=316,
                         pairs={'fore': (88, 120, 182, 'lo'), 'hind': (288, 318, 380, 'lo')}),
            'right': dict(kind='side', facing=1, cut=324, top=298, pivot=316,
                          pairs={'hind': (4, 72, 94, 'hi'), 'fore': (198, 255, 314, 'hi')}),
            'front': dict(kind='lift', facing=0, cut=354, top=330, pivot=346,
                          legs={'l': (36, 114), 'r': (134, 214)}),
            'back': dict(kind='lift', facing=0, cut=356, top=332, pivot=348,
                         legs={'l': (42, 112), 'r': (146, 220)}),
        },
    ),
    'whitecat': dict(
        export='WHITE_CAT_RIG',
        key='flood',
        scale=1.0,
        regions={
            'front': (652, 4, 1012, 404),
            'back':  (1022, 4, 1382, 404),
            'left':  (652, 452, 1012, 838),
            'right': (1022, 452, 1382, 838),
        },
        views={
            'left': dict(kind='side', facing=-1, cut=262, top=238, pivot=255,
                         pairs={'fore': (62, 85, 125, 'lo'), 'hind': (225, 240, 282, 'lo')},
                         tail=dict(x0=195, x1=None, cut=150, bottom=172, pivot=(265, 156))),
            'right': dict(kind='side', facing=1, cut=262, top=238, pivot=254,
                          pairs={'hind': (56, 100, 116, 'hi'), 'fore': (205, 257, 278, 'hi')},
                          tail=dict(x0=0, x1=140, cut=150, bottom=172, pivot=(72, 156))),
            'front': dict(kind='lift', facing=0, cut=326, top=300, pivot=318,
                          legs={'l': (52, 110), 'r': (114, 172)}),
            'back': dict(kind='lift', facing=0, cut=320, top=294, pivot=312,
                         legs={'l': (42, 97), 'r': (97, 150)}),
        },
    ),
}

SEAM_OVERLAP = 3
RAMP = 14  # alpha fade where a part tucks under the body
# lateral-sequence walk: each paw lands a quarter cycle after the one before
SIDE_PHASE = {'hind-near': 0, 'fore-near': 0.25, 'hind-far': 0.5, 'fore-far': 0.75}
SIDE_ORDER = ['hind-far', 'fore-far', 'hind-near', 'fore-near']  # back to front
LIFT_PHASE = {'l': 0, 'r': 0.5}


# ── step 1: cut views off the sheet ─────────────────────────────────────────
def key_blue(im):
    """Corgi sheet: orange / white dog, so anything bluish is backdrop or shadow."""
    px = im.load()
    alpha = Image.new('L', im.size)
    ap = alpha.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            d = b - max(r, g)
            lum = 0.3 * r + 0.59 * g + 0.11 * b
            if d >= 17 or (d > 2 and lum < 200):
                a = 0
            elif d <= 6:
                a = 255
            else:
                a = int(255 * (17 - d) / 11)
            ap[x, y] = a
    return alpha.filter(ImageFilter.MedianFilter(3))


def key_flood(im, regions):
    """White-cat sheet: the fur picks up lavender shading and the eyes are blue,
    so only dark-and-bluish pixels connected to a panel edge count as backdrop."""
    px = im.load()
    soft = Image.new('L', im.size)
    sp = soft.load()
    cand = Image.new('L', im.size)
    cp = cand.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]
            blu = min(1, max(0, (b - max(r, g) - 3) / 8))
            bright = min(1, max(0, (0.3 * r + 0.59 * g + 0.11 * b - 150) / 38))
            a = 1 - blu * (1 - bright)
            sp[x, y] = int(a * 255)
            cp[x, y] = 255 if a < 0.97 else 0
    alpha = Image.new('L', im.size, 255)
    for (x0, y0, x1, y1) in regions.values():
        sub = cand.crop((x0, y0, x1, y1))
        for seed in [(0, 0), (sub.width - 1, 0), (0, sub.height - 1), (sub.width - 1, sub.height - 1)]:
            if sub.getpixel(seed) == 255:
                ImageDraw.floodfill(sub, seed, 128)
        s = sub.load()
        so = soft.crop((x0, y0, x1, y1)).load()
        a = Image.new('L', sub.size)
        ap = a.load()
        for y in range(sub.height):
            for x in range(sub.width):
                ap[x, y] = so[x, y] if s[x, y] == 128 else 255
        alpha.paste(a.filter(ImageFilter.MedianFilter(3)), (x0, y0))
    return alpha


def cut_sheet(pet, cfg, path, source):
    im = Image.open(path).convert('RGB')
    alpha = key_blue(im) if cfg['key'] == 'blue' else key_flood(im, cfg['regions'])
    rgba = im.copy()
    rgba.putalpha(alpha)
    os.makedirs(source, exist_ok=True)
    for name, (x0, y0, x1, y1) in cfg['regions'].items():
        bb = alpha.crop((x0, y0, x1, y1)).point(lambda v: 255 if v > 60 else 0).getbbox()
        box = (max(x0, x0 + bb[0] - 4), max(y0, y0 + bb[1] - 4),
               min(x1, x0 + bb[2] + 4), min(y1, y0 + bb[3] + 2))
        c = rgba.crop(box)
        s = cfg['scale']
        if s != 1:
            c = c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS)
        c.save(f'{source}/{name}.webp', quality=90, method=6)
        print('cut', pet, name, c.size)


# ── step 2: rig ─────────────────────────────────────────────────────────────
def fade(piece, top=0, bottom=0):
    pp = piece.load()
    for y in range(piece.height):
        f = 1.0
        if top and y < top:
            f = y / top
        if bottom and y >= piece.height - bottom:
            f = min(f, (piece.height - 1 - y) / bottom)
        if f < 1:
            for x in range(piece.width):
                r, g, b, a = pp[x, y]
                pp[x, y] = (r, g, b, int(a * f))
    return piece


def rig(pet, cfg, assets, source, rig_ts):
    meta = {}
    for name, v in cfg['views'].items():
        im = Image.open(f'{source}/{name}.webp').convert('RGBA')
        W, H = im.size
        body = im.copy()
        bp = body.load()
        parts = {}

        def erase(x0, x1, y0, y1):
            for y in range(max(0, y0), min(H, y1)):
                for x in range(max(0, x0), min(W, x1 + 1)):
                    r, g, b, _ = bp[x, y]
                    bp[x, y] = (r, g, b, 0)

        def add(key, piece, x0, y0, pivot, phase, mode, depth):
            piece.save(f'{assets}/{name}-{key}.webp', quality=90, method=6)
            parts[key] = dict(
                x0=x0, x1=x0 + piece.width, y0=y0, y1=y0 + piece.height,
                pivotX=pivot[0], pivotY=pivot[1], phase=phase, mode=mode, depth=depth,
            )

        def leg(key, x0, x1, phase, mode, depth):
            piece = fade(im.crop((x0, v['top'], x1 + 1, H)), top=RAMP)
            add(key, piece, x0, v['top'], ((x0 + x1 + 1) / 2, v['pivot']), phase, mode, depth)

        if 'tail' in v:
            t = v['tail']
            x1 = W - 1 if t['x1'] is None else t['x1']
            erase(t['x0'], x1, 0, t['cut'])
            piece = fade(im.crop((t['x0'], 0, x1 + 1, t['bottom'])), bottom=t['bottom'] - t['cut'])
            add('tail', piece, t['x0'], 0, t['pivot'], 0, 'sway', 0)

        if v['kind'] == 'side':
            spans = {}
            for part, (x0, seam, x1, far) in v['pairs'].items():
                erase(x0, x1, v['cut'], H)
                spans[f'{part}-near'] = (x0, seam + SEAM_OVERLAP) if far == 'hi' else (seam - SEAM_OVERLAP, x1)
                spans[f'{part}-far'] = (x0, x1)
            for i, key in enumerate(SIDE_ORDER):
                leg(key, *spans[key], SIDE_PHASE[key], 'shear', i + 1)
        else:
            for i, (key, (x0, x1)) in enumerate(v['legs'].items()):
                erase(x0, x1, v['cut'], H)
                leg(key, x0, x1, LIFT_PHASE[key], 'lift', i + 1)

        body.save(f'{assets}/{name}-body.webp', quality=90, method=6)
        meta[name] = dict(facing=v['facing'], width=W, height=H, parts=parts)
        print('rig', pet, name, list(parts))

    ts = f'/* generated by scripts/pet-rig.py {pet} — do not edit by hand. */\n'
    ts += "import type { PetRig } from './petRig';\n\n"
    ts += f"export const {cfg['export']}: PetRig = " + json.dumps(meta, indent=2) + ';\n'
    with open(rig_ts, 'w') as f:
        f.write(ts)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('pet', choices=sorted(PETS))
    ap.add_argument('--sheet', help='turnaround sheet to cut the views from')
    args = ap.parse_args()
    cfg = PETS[args.pet]
    assets = f'src/assets/pets/{args.pet}'
    source = f'{assets}/source'
    rig_ts = f"src/components/room/pets/{args.pet}Rig.ts"
    os.makedirs(assets, exist_ok=True)
    os.makedirs(os.path.dirname(rig_ts), exist_ok=True)
    if args.sheet:
        cut_sheet(args.pet, cfg, args.sheet, source)
    rig(args.pet, cfg, assets, source, rig_ts)
