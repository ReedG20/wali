import sys, json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfiltfilt, fftconvolve, find_peaks
D=sys.argv[1]; SR=48000
sos=butter(4,[200,5000],btype='band',fs=SR,output='sos')
ld=lambda p: sosfiltfilt(sos, wavfile.read(p)[1].astype(np.float64))
memo=ld(f"{D}/memo.wav"); J=json.load(open(f"{D}/sync.json"))
R=int(0.03*SR); out={}
def ncc(seg, m0):
    L=len(seg); lo=max(m0,0); ms=memo[lo:m0+L+2*R]
    if len(ms)<L+2*R:  # memo ends: trim seg
        L=len(ms)-2*R; seg=seg[:L]
    cc=fftconvolve(ms,seg[::-1],'valid')
    c=np.concatenate(([0.],np.cumsum(ms**2))); en=np.sqrt(c[L:]-c[:-L])
    return cc/(np.linalg.norm(seg)*en+1e-12), lo
for c,v in J.items():
    clip=ld(f"{D}/{c}.wav"); co=int(round(v['coarse_s']*SR)); n=len(clip)
    if co+n>len(memo): n=len(memo)-co-2*R; clip=clip[:n]
    res={}
    for name,(a,b) in {"whole":(0,n),"first":(0,n//2),"second":(n//2,n)}.items():
        cc,lo=ncc(clip[a:b], co+a-R)
        pk,_=find_peaks(cc,distance=int(0.002*SR)); pk=pk[np.argsort(cc[pk])[::-1][:3]]
        res[name]=[(round((lo+j-a)/SR,5),round(float(cc[j]),3)) for j in pk]
    out[c]=res; print(c, "trimmed_to=%.1fs"%(n/SR), res)
json.dump(out,open(f"{D}/offsets.json","w"),indent=1)
