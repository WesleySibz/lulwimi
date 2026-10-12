# Cuts the hand-approved matches into clips, snapping edges to silence, then re-transcribes
# each clip so we can confirm it holds just the siSwati word (no English narration).
import json, subprocess, wave, os
import numpy as np
from align import energy, load, snap, key
from faster_whisper import WhisperModel
import difflib

# Reviewed by hand against the transcripts and the lesson order (see the conversation of 2026-10-12).
APPROVED = '''Make|Bhuti|Sala kahle|Hamba kahle|Ngiyajabula kukwati|Entsambama|Ngiyagula|Ngijabulile|Ngidziniwe|Ncesi|
Indvodzakati|Ijusi|Inyanga|Ngubani ligama lakho?|Sawubona Themba|Ligama lami ngu...|Khuluma|Ligama|Wemukelekile|Uyagula?|
Kakhulu|Indvodza|Ngesutsi|Kusasa|Sikhatsi|Liviki|Kute inkinga|Sawubona|Nami futsi|Indvodzana|Nginamake|Ngite bhuti|
Hhayi bo!|Isuka nini?|Ngite indvodza|Ngiyabonga|Namuhla|Umndeni|Ebusuku|Ngilambile|Nginemkhuhlane|Unjani namuhla?|
Yebo|Babe|Hamba|Fundza|Kusile|Unjani?|Ninjani?|Ngikhona|Sikhona|Wena ke?|Nami ngikhona|Ngiyaphila|Angiphili|Sisi|Umfati|
Singani|Nginababe|Nginasisi|Nginesingani|Ngite umfati|Lapha|Nyalo|Emanti|Likhofi|Lubisi|Ngomile|Sinkhwa|Lilayisi|Luswayi|
Kumnandzi|Malini?|Itolo|Emini|Likati'''.replace('\n', '').split('|')
# The drinks list goes water, tea, coffee, milk, juice: "Lidia" there is litiya (tea), not lidina.
BORROW = {'Litiya': 'Lidina'}

items = {i['t']: i for i in json.load(open('ss-items.json'))}
matches = json.load(open('matches.json'))
by_text = {m['t']: m for m in matches.values()}
OUT = '../public/audio/ss'
os.makedirs(OUT, exist_ok=True)

envs, audio = {}, {}
model = WhisperModel('base', device='cpu', compute_type='int8')
manifest, report = {}, []
for t in APPROVED + list(BORROW):
    m = by_text.get(BORROW.get(t, t))
    if not m:
        report.append(f'MISSING {t}')
        continue
    L = m['lesson']
    if L not in envs:
        audio[L] = load(L)
        envs[L] = energy(audio[L])
    start = snap(envs[L], m['start'] - 0.08, -1)
    end = snap(envs[L], m['end'] + 0.12, +1)
    start, end = max(0, start - 0.05), end + 0.08
    k = items[t]['key']
    path = f'{OUT}/{k}.mp3'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.3f}', '-to', f'{end:.3f}', '-i', f'{L}.wav',
                    '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse,loudnorm=I=-18:TP=-2,aresample=24000',
                    '-ac', '1', '-b:a', '48k', path], check=True)
    clip = audio[L][int(start * 16000):int(end * 16000)]
    heard = ' '.join(s.text.strip() for s in model.transcribe(clip, language='en')[0])
    sim = difflib.SequenceMatcher(None, key(t), key(heard)).ratio()
    manifest[k] = [{'f': f'ss/{k}.mp3', 'v': 'pc'}]
    report.append(f'{sim:.2f} {end - start:4.1f}s {t:<26} -> {heard}')

json.dump(manifest, open('ss-manifest.json', 'w'), indent=0)
print('\n'.join(sorted(report)))
print(len(manifest), 'clips')
