import json, subprocess, difflib, re
import numpy as np
from align import key
from faster_whisper import WhisperModel
m = WhisperModel('base', device='cpu', compute_type='int8')
items = {i['key']: i['t'] for i in json.load(open('ss-items.json'))}
man = json.load(open('ss-manifest.json'))
rows = []
for k in man:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'../public/audio/ss/{k}.mp3', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    dur = len(x) / 16000
    pad = np.zeros(8000, np.float32)
    heard = ' '.join(s.text.strip() for s in m.transcribe(np.concatenate([pad, x, pad]), language='en', temperature=0)[0])
    t = items[k]
    syl = max(1, len(re.findall(r'[aeiou]', t.lower())))
    sim = difflib.SequenceMatcher(None, key(t), key(heard)).ratio()
    rows.append((sim, dur / syl, dur, t, heard))
for r in sorted(rows):
    flag = ' <-- check' if r[0] < 0.6 or r[1] > 0.6 or r[1] < 0.18 else ''
    print(f'{r[0]:.2f} {r[1]:.2f}s/syl {r[2]:.1f}s {r[3]:<24} -> {r[4]}{flag}')
