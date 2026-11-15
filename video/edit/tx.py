import sys, json, subprocess, numpy as np
def load(p): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True,check=True).stdout,dtype=np.float32)
from faster_whisper import WhisperModel
try:
    DEV="mps"; m = WhisperModel("medium.en", device=DEV, compute_type="float16")
except Exception as e:
    print("mps failed",e); DEV="cpu"
    m = WhisperModel("medium.en", device=DEV, compute_type="int8", cpu_threads=8)
for src, out in zip(sys.argv[1::2], sys.argv[2::2]):
    segs, _ = m.transcribe(load(src), word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False,
        initial_prompt="wali, a pendant. Composio, Canvas, the Bakke, Let's dig in.")
    res = []
    for s in segs:
        res.append(dict(start=s.start, end=s.end, text=s.text, words=[dict(w=w.word, s=w.start, e=w.end, p=w.probability) for w in s.words]))
        print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text}", flush=True)
    json.dump(res, open(out, "w"), indent=1)
