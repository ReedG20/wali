import json, re, sys
S=sys.argv[1]; A_DUR=float(sys.argv[2]); B0=2.0
memo=json.load(open(f"{S}/tx_memo.json")); tail=json.load(open(f"{S}/tx_memo_tail.json"))
lb=json.load(open(f"{S}/tx_lastbit.json"))
segs=[(183.89,192.90,0.0),(368.87,379.81,9.01),(577.66,589.55,19.95),(638.81,644.61,31.84)]
def words(src, a, b):
    out=[]; seen=set()
    for s in src:
        for w in s['words']:
            if a<=w['s']<b and (round(w['s'],2)) not in seen:
                seen.add(round(w['s'],2)); out.append(dict(w['w'] and w, ))
    return sorted(out,key=lambda w:w['s'])
cues=[]
def chunk(ws, shift):
    cur=[]
    for i,w in enumerate(ws):
        cur.append(w); t=w['w'].strip()
        if t.endswith(('.','?')) or (t.endswith(',') and len(cur)>=3) or len(cur)>=8 and not (i+1<len(ws) and ws[i+1]['w'].strip().endswith(('.','?')) ) or i==len(ws)-1:
            if t.endswith(',') and len(cur)<3 and i<len(ws)-1: continue
            cues.append([cur[0]['s']+shift, cur[-1]['e']+shift, ' '.join(x['w'].strip() for x in cur)]); cur=[]
for a,b,start in segs: chunk(words(memo if a<500 else tail,a,b), start-a)
chunk(words(lb,2.0,60), A_DUR-B0)
fix=[(r"\bI'm meeting",'A meeting'),(r'\bWally\b','wali'),(r'\bwell\b','wali'),(r"Let's Dig In","‘Let’s dig in’"),(r"'",'’')]
for c in cues:
    for p,r in fix: c[2]=re.sub(p,r,c[2])
    c[2]=c[2].rstrip(',')
# extend each cue to next start (max +0.6s) for readability
for i,c in enumerate(cues):
    nxt=cues[i+1][0] if i+1<len(cues) else c[1]+0.8
    c[1]=min(max(c[1]+0.25,c[0]+0.9), nxt-0.02) if nxt>c[1] else c[1]
def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60; return f"{h}:{m:02d}:{s:05.2f}"
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Helvetica Neue,50,&H00FFFFFF,&H00FFFFFF,&H80000000,&H64000000,1,0,0,0,100,100,0,0,1,2.2,1.2,2,200,200,64,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(f"{S}/subs.ass","w").write(hdr+''.join(f"Dialogue: 0,{ts(a)},{ts(b)},Default,,0,0,0,,{t}\n" for a,b,t in cues))
for c in cues: print(f"{c[0]:6.2f}-{c[1]:6.2f} {c[2]}")
