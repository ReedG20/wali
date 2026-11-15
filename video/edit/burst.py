import subprocess, numpy as np, sys

from faster_whisper import WhisperModel
sr=48000; x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",sys.argv[1],"-ac","1","-ar","48000","-f","f32le","-"],capture_output=True).stdout,dtype=np.float32); b=int(0.05*sr)
r=np.array([20*np.log10(np.sqrt(np.mean(x[i:i+b]**2))+1e-9) for i in range(0,len(x)-b,b)])
t=np.arange(len(r))*0.05; regs=[];s=None;last=None
for i,v in enumerate(r>-30):
  if v:
    if s is None: s=t[i]
    elif t[i]-last>0.3: regs.append((s,last+0.05)); s=t[i]
    last=t[i]
regs.append((s,last+0.05))
m=WhisperModel("small.en",device="cpu",compute_type="int8",cpu_threads=8)
for a,e in regs:
    if e-a<0.2: continue
    seg=x[int(max(a-0.1,0)*sr):int((e+0.1)*sr)].astype(np.float32)[::3]
    txt=' '.join(s.text.strip() for s in m.transcribe(seg,beam_size=5,condition_on_previous_text=False)[0])
    print(f"{a:6.2f}-{e:6.2f} {txt}",flush=True)
