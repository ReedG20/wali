import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("medium.en", device="cpu", compute_type="int8", cpu_threads=6)
src=sys.argv[1]; res=[]
for a,b in [(399.0,467.5),(577.0,592.0),(625.0,677.8)]:
    x=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-ss",str(a),"-t",str(b-a),"-i",src,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32)
    segs,_=m.transcribe(x,word_timestamps=True,beam_size=5,condition_on_previous_text=False,vad_filter=True,
        initial_prompt="wali, a pendant. The Bakke has a $10 intro class. One sec. Let's do it.")
    for s in segs:
        res.append(dict(start=s.start+a,end=s.end+a,text=s.text,words=[dict(w=w.word,s=w.start+a,e=w.end+a,p=w.probability) for w in s.words]))
        print(f"[{s.start+a:7.2f}-{s.end+a:7.2f}] {s.text}",flush=True)
json.dump(res,open(sys.argv[2],"w"),indent=1)
