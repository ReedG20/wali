#!/usr/bin/env python3
"""
Builds the wali grade tests:
  luts/*.cube                      33-point Rec.709 creative LUTs for Resolve / Premiere / FCP
  public/luts/*.cube               the same files, for the in-browser preview
  public/grades/<plate>__<lut>.jpg each plate run through each LUT with ffmpeg's lut3d (what Resolve does)
  luts/wali-grain-1080p24.mp4      a soft 35mm-ish grain plate to lay over the edit (Overlay / Soft Light, ~25%)

Run from the project root:  python3 scripts/make_luts.py
Input is Rec.709 display footage. For Apple Log, convert Log to Rec.709 first (Resolve: Color Space Transform),
then apply one of these as the creative look.
"""
import json
import os
import subprocess

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
N = 33
PLATES = ["bedroom", "door", "gym", "quad", "library", "hill"]

# ------------------------------------------------------------------ colour helpers


def to_lin(x):
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)


def to_srgb(x):
    x = np.clip(x, 0, None)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def luma(rgb):
    return rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722


def s_curve(x, c, pivot=0.45):
    """Contrast around a pivot with soft toe and shoulder. c=0 is identity."""
    if c == 0:
        return x
    lo = np.tanh(c * (0 - pivot))
    hi = np.tanh(c * (1 - pivot))
    return (np.tanh(c * (x - pivot)) - lo) / (hi - lo)


def shoulder(x, amount):
    """Rolls highlights off softly above ~0.7 (film-like), keeping 1.0 reachable but gentler."""
    if amount == 0:
        return x
    k = 0.7
    over = np.clip(x - k, 0, None)
    soft = k + (1 - k) * (1 - np.exp(-over / (1 - k) * (1 + amount * 2))) / (1 - np.exp(-(1 + amount * 2)))
    return np.where(x > k, soft, x)


def rgb_to_hsv(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.max(rgb, axis=-1)
    mn = np.min(rgb, axis=-1)
    d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rm = m & (mx == r)
    gm = m & (mx == g) & ~rm
    bm = m & ~rm & ~gm
    h[rm] = ((g - b)[rm] / d[rm]) % 6
    h[gm] = (b - r)[gm] / d[gm] + 2
    h[bm] = (r - g)[bm] / d[bm] + 4
    h = h * 60.0
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    return np.stack([h, s, mx], -1)


def hsv_to_rgb(hsv):
    h, s, v = hsv[..., 0] % 360, hsv[..., 1], hsv[..., 2]
    c = v * s
    hp = h / 60.0
    x = c * (1 - np.abs(hp % 2 - 1))
    z = np.zeros_like(h)
    conds = [(hp < 1), (hp < 2), (hp < 3), (hp < 4), (hp < 5), (hp <= 6)]
    rs = [c, x, z, z, x, c]
    gs = [x, c, c, x, z, z]
    bs = [z, z, x, c, c, x]
    r = np.select(conds, rs)
    g = np.select(conds, gs)
    b = np.select(conds, bs)
    m = v - c
    return np.stack([r + m, g + m, b + m], -1)


def hue_band(h, centre, width):
    d = np.abs(((h - centre + 180) % 360) - 180)
    return np.clip(1 - d / width, 0, 1) ** 1.5


# ------------------------------------------------------------------ the looks


def grade(rgb, look):
    x = rgb.copy()
    # white balance in linear light
    lin = to_lin(x) * np.array(look["gains"])
    x = to_srgb(lin)
    # exposure-ish lift of mids
    x = np.clip(x, 0, 1) ** look.get("gamma", 1.0)
    # tone curve on luma, applied as a ratio so hue holds
    y = luma(x)
    y2 = shoulder(s_curve(y, look["contrast"], look.get("pivot", 0.45)), look["shoulder"])
    ratio = np.where(y > 1e-5, y2 / np.maximum(y, 1e-5), 1)
    x = x * ratio[..., None]
    # hue work: greens toward olive, skin protected, blues toward teal and calmer
    hsv = rgb_to_hsv(np.clip(x, 0, 1))
    h, s = hsv[..., 0], hsv[..., 1]
    g = hue_band(h, 115, 55)
    hsv[..., 0] = h - g * look["green_shift"]
    hsv[..., 1] = s * (1 - g * look["green_desat"])
    skin = hue_band(h, 28, 25)
    hsv[..., 1] = hsv[..., 1] * (1 + skin * look.get("skin_sat", 0))
    blue = hue_band(h, 220, 45)
    hsv[..., 0] = hsv[..., 0] - blue * look.get("blue_shift", 0)
    hsv[..., 1] = hsv[..., 1] * (1 - blue * look.get("blue_desat", 0))
    x = hsv_to_rgb(hsv)
    # global saturation around luma
    y = luma(x)[..., None]
    x = y + (x - y) * look["sat"]
    # split tone
    l = np.clip(luma(x), 0, 1)[..., None]
    x = x + np.array(look["shadow_tint"]) * (1 - l) ** 2 + np.array(look["high_tint"]) * l**2
    # black and white points (warm blacks: never pure black, never cool)
    lo = np.array(look["black"])
    hi = np.array(look["white"])
    x = lo + (hi - lo) * np.clip(x, 0, 1)
    return np.clip(x, 0, 1)


LOOKS = {
    "wali-portra": {
        "title": "Portra (house look)",
        "about": "Warm, soft and filmic. Lifted warm blacks, gentle highlight roll-off, greens pushed to olive, skin kept rich. Start here.",
        "gains": [1.07, 1.0, 0.89],
        "contrast": 1.7,
        "shoulder": 0.55,
        "sat": 0.9,
        "green_shift": 22,
        "green_desat": 0.38,
        "skin_sat": 0.08,
        "blue_shift": 10,
        "blue_desat": 0.18,
        "shadow_tint": [0.012, 0.004, -0.008],
        "high_tint": [0.012, 0.006, -0.012],
        "black": [0.046, 0.04, 0.032],
        "white": [0.985, 0.97, 0.94],
    },
    "wali-late-light": {
        "title": "Late light",
        "about": "Golden-hour push for the climbing gym and outdoor scenes: amber highlights, brown shadows, a touch more contrast.",
        "gains": [1.15, 1.0, 0.78],
        "contrast": 2.2,
        "shoulder": 0.45,
        "sat": 1.0,
        "green_shift": 28,
        "green_desat": 0.25,
        "skin_sat": 0.08,
        "blue_shift": 14,
        "blue_desat": 0.28,
        "shadow_tint": [0.016, 0.006, -0.01],
        "high_tint": [0.04, 0.016, -0.035],
        "black": [0.04, 0.032, 0.024],
        "white": [0.99, 0.965, 0.9],
    },
    "wali-screen-glow": {
        "title": "Screen glow (before)",
        "about": "For the doomscroll: low-key, muted and a little cool in the highlights, like a room lit by a phone. Cut to a warm look when he gets up.",
        "gains": [0.97, 1.0, 1.05],
        "contrast": 2.4,
        "pivot": 0.5,
        "gamma": 1.12,
        "shoulder": 0.3,
        "sat": 0.72,
        "green_shift": 10,
        "green_desat": 0.4,
        "skin_sat": -0.05,
        "blue_shift": -6,
        "blue_desat": 0.05,
        "shadow_tint": [0.006, 0.003, 0.0],
        "high_tint": [-0.012, 0.004, 0.022],
        "black": [0.03, 0.028, 0.026],
        "white": [0.94, 0.95, 0.96],
    },
    "wali-matte": {
        "title": "Matte",
        "about": "Faded and calm: low contrast, lifted blacks, softened whites. For interstitials, long exposures and the end card.",
        "gains": [1.04, 1.0, 0.94],
        "contrast": 0.9,
        "shoulder": 0.7,
        "sat": 0.8,
        "green_shift": 20,
        "green_desat": 0.35,
        "skin_sat": 0.0,
        "blue_shift": 8,
        "blue_desat": 0.25,
        "shadow_tint": [0.01, 0.006, 0.0],
        "high_tint": [0.008, 0.004, -0.01],
        "black": [0.085, 0.078, 0.068],
        "white": [0.94, 0.925, 0.9],
    },
    "wali-clean": {
        "title": "Clean",
        "about": "The safe baseline: a little warmth and a little contrast, nothing that reads as a look. Good for app close-ups.",
        "gains": [1.025, 1.0, 0.965],
        "contrast": 1.2,
        "shoulder": 0.35,
        "sat": 0.97,
        "green_shift": 8,
        "green_desat": 0.1,
        "skin_sat": 0.02,
        "blue_shift": 0,
        "blue_desat": 0.05,
        "shadow_tint": [0.004, 0.002, -0.002],
        "high_tint": [0.004, 0.002, -0.004],
        "black": [0.02, 0.018, 0.015],
        "white": [0.995, 0.99, 0.975],
    },
}


def write_cube(path, name, table):
    with open(path, "w") as f:
        f.write(f'TITLE "{name}"\n')
        f.write("# wali launch video grade test. Input: Rec.709. Output: Rec.709.\n")
        f.write(f"LUT_3D_SIZE {N}\nDOMAIN_MIN 0.0 0.0 0.0\nDOMAIN_MAX 1.0 1.0 1.0\n")
        # .cube order: red changes fastest, then green, then blue
        for b in range(N):
            for g in range(N):
                for r in range(N):
                    v = table[r, g, b]
                    f.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")


def main():
    os.makedirs(f"{ROOT}/luts", exist_ok=True)
    os.makedirs(f"{ROOT}/public/luts", exist_ok=True)
    os.makedirs(f"{ROOT}/public/grades", exist_ok=True)
    grid = np.linspace(0, 1, N)
    r, g, b = np.meshgrid(grid, grid, grid, indexing="ij")
    rgb = np.stack([r, g, b], -1)

    meta = []
    for key, look in LOOKS.items():
        table = grade(rgb, look)
        for d in ("luts", "public/luts"):
            write_cube(f"{ROOT}/{d}/{key}.cube", look["title"], table)
        meta.append({"id": key, "title": look["title"], "about": look["about"]})
        print("wrote", key)

    with open(f"{ROOT}/public/luts/looks.json", "w") as f:
        json.dump(meta, f, indent=2)

    # Plates through each LUT, exactly as an NLE would apply it (tetrahedral interpolation).
    for plate in PLATES:
        src = f"{ROOT}/public/plates/{plate}.jpg"
        if not os.path.exists(src):
            continue
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "scale=1600:-2", "-q:v", "3", f"{ROOT}/public/grades/{plate}__none.jpg"], check=True)
        for key in LOOKS:
            out = f"{ROOT}/public/grades/{plate}__{key}.jpg"
            vf = f"scale=1600:-2,lut3d=file={ROOT}/luts/{key}.cube:interp=tetrahedral"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf, "-q:v", "3", out], check=True)
        print("graded", plate)

    grain = f"{ROOT}/luts/wali-grain-1080p24.mp4"
    if not os.path.exists(grain):
        subprocess.run(
            [
                "ffmpeg", "-v", "error", "-y",
                "-f", "lavfi", "-i", "color=c=0x808080:s=1920x1080:r=24:d=10",
                "-vf", "noise=alls=14:allf=t+u,gblur=sigma=0.6,format=yuv420p",
                "-c:v", "libx264", "-crf", "12", "-preset", "slow", "-tune", "grain", grain,
            ],
            check=True,
        )
        print("wrote grain plate")


if __name__ == "__main__":
    main()
