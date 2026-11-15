"""Find exact offset of each camera clip inside the voice memo.
Coarse: GCC-PHAT cross-correlation at 8 kHz over the whole clip.
Fine: 48 kHz GCC-PHAT on 4 s windows at several points along the clip -> offset + drift.
"""
import sys, json
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly, fftconvolve

D = sys.argv[1]
SR = 48000

def load(p):
    sr, x = wavfile.read(p)
    assert sr == SR
    return x.astype(np.float64)

def gcc_phat(a, b, max_lag=None):
    """returns lag (samples) such that b[n] ~ a[n - lag]... we compute corr of a vs b; peak at index k => a shifted by k aligns with b"""
    n = len(a) + len(b)
    nfft = 1 << (n - 1).bit_length()
    A = np.fft.rfft(a, nfft)
    B = np.fft.rfft(b, nfft)
    R = A * np.conj(B)
    R /= np.abs(R) + 1e-12
    cc = np.fft.irfft(R, nfft)
    # lag k>=0: a[k+i] ~ b[i]
    cc = np.concatenate((cc[-(len(b) - 1):], cc[:len(a)]))
    lags = np.arange(-(len(b) - 1), len(a))
    return lags, cc

memo = load(f"{D}/memo.wav")
memo8 = resample_poly(memo, 1, 6)
out = {}
for c in ["C0195", "C0196", "C0197", "C0198", "C0199"]:
    clip = load(f"{D}/{c}.wav")
    clip8 = resample_poly(clip, 1, 6)
    lags, cc = gcc_phat(memo8, clip8)
    i = np.argmax(cc)
    peak = cc[i]
    # second best peak outside +-0.25 s
    mask = np.abs(lags - lags[i]) > 2000
    second = cc[mask].max()
    noise = np.std(cc)
    coarse = lags[i] * 6  # samples @48k: memo index where clip starts (may be negative)
    # fine windows
    dur = len(clip) / SR
    pts = np.linspace(2, dur - 6, 6) if dur > 12 else [1, max(1, dur - 5)]
    fine = []
    for t in pts:
        s = int(t * SR); w = 4 * SR
        seg = clip[s:s + w]
        m0 = coarse + s - SR // 4
        if m0 < 0 or m0 + w + SR // 2 > len(memo):
            continue
        mseg = memo[m0:m0 + w + SR // 2]
        l, c2 = gcc_phat(mseg, seg)
        valid = (l >= 0) & (l <= SR // 2)
        l, c2 = l[valid], c2[valid]
        j = np.argmax(c2)
        # parabolic sub-sample
        if 0 < j < len(c2) - 1:
            y0, y1, y2 = c2[j - 1], c2[j], c2[j + 1]
            d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)
        else:
            d = 0
        off = m0 + l[j] + d - s  # memo sample where clip sample 0 lands
        fine.append(dict(t=round(float(t), 2), offset_s=float(off / SR), pk=float(c2[j] / (np.std(c2) + 1e-12))))
    out[c] = dict(coarse_s=coarse / SR, peak_snr=float(peak / noise), peak_ratio=float(peak / second), dur=dur, fine=fine)
    print(c, f"coarse={coarse/SR:.4f}s snr={peak/noise:.1f} ratio={peak/second:.2f}")
    for f in fine:
        print("   t=%6.2f offset=%.5f s  pkSNR=%.1f" % (f["t"], f["offset_s"], f["pk"]))
json.dump(out, open(f"{D}/sync.json", "w"), indent=1)
