# Second-pass clips located by their English cue: the siSwati is in the gap after the cue,
# spoken twice. Find speech utterances in the gap by loudness and keep the first.
import json, os, subprocess, sys
import numpy as np
from align import load, energy

# item text: (lesson, gap start, gap end) — gap = after the English cue ends, before the next cue starts.
GAPS = {
    # Lesson 5, useful expressions
    'Cha': ('SZ_siSwati_Lesson_5', 99.95, 107.6),
    'Ngiyacela': ('SZ_siSwati_Lesson_5', 59.15, 68.3),
    'Kulungile': ('SZ_siSwati_Lesson_5', 36.2, 44.0),
    'Wo! Ngiyabona': ('SZ_siSwati_Lesson_5', 212.4, 227.9),
    'Ngeke': ('SZ_siSwati_Lesson_5', 135.85, 144.1),
    'Kungenteka': ('SZ_siSwati_Lesson_5', 162.0, 171.5),
    'Kungenteka vele?': ('SZ_siSwati_Lesson_5', 173.8, 181.1),
    'Ngicela uphindze': ('SZ_siSwati_Lesson_5', 229.05, 242.0),
    'Ngiyacolisa': ('SZ_siSwati_Lesson_5', 199.55, 210.7),
    'Shano kancane, ngiyacela': ('SZ_siSwati_Lesson_5', 243.8, 256.0),
    # Lesson 6, food
    'Shukela': ('SZ_siSwati_Lesson_6', 50.45, 60.6),
    'Emaveji': ('SZ_siSwati_Lesson_6', 118.55, 128.7),
    'Titselo': ('SZ_siSwati_Lesson_6', 129.05, 139.3),
    'Libhulakufesi': ('SZ_siSwati_Lesson_6', 140.25, 152.6),
    'Lidina': ('SZ_siSwati_Lesson_6', 153.65, 163.0),
    # Lesson 7, finding your way (Whisper skipped all the siSwati here)
    'Iyaphi?': ('SZ_siSwati_Lesson_7', 22.6, 31.9),
    'Ngicela ishintji': ('SZ_siSwati_Lesson_7', 54.85, 66.1),
    'Ngesancele': ('SZ_siSwati_Lesson_7', 67.45, 72.2),
    'Etulu': ('SZ_siSwati_Lesson_7', 107.1, 122.9),
    'Entasi': ('SZ_siSwati_Lesson_7', 124.15, 128.4),
    'Esiteshini': ('SZ_siSwati_Lesson_7', 134.6, 156.3),
    'Eposini': ('SZ_siSwati_Lesson_7', 157.8, 180.0),
    'Esitolo': ('SZ_siSwati_Lesson_7', 181.2, 203.0),
    'Edolobheni': ('SZ_siSwati_Lesson_7', 203.75, 224.6),
    # Lesson 8, time
    'Ekuseni': ('SZ_siSwati_Lesson_8', 50.55, 62.6),
    'Kusihlwa': ('SZ_siSwati_Lesson_8', 88.15, 99.0),
    'Umnyaka': ('SZ_siSwati_Lesson_8', 138.85, 150.0),
    # Lesson 4, family
    'Nginemndeni': ('SZ_siSwati_Lesson_4', 119.55, 130.6),
    'Umntfwana': ('SZ_siSwati_Lesson_4', 58.1, 68.5),
}


def utterances(env, a, b):
    seg = env[int(a * 100):int(b * 100)]
    floor = np.percentile(env, 15)
    on = seg > max(floor * 4, seg.max() * 0.08)
    # Close tiny gaps inside a word, then group bursts closer than 0.5 s into one utterance.
    out, cur = [], None
    for i, v in enumerate(on):
        if v:
            if cur and i - cur[1] <= 50:
                cur[1] = i
            else:
                if cur:
                    out.append(cur)
                cur = [i, i]
    if cur:
        out.append(cur)
    return [(a + s / 100, a + (e + 1) / 100) for s, e in out if e - s >= 15]


if __name__ == '__main__':
    only = sys.argv[1:]
    items = {i['t']: i for i in json.load(open('ss-items.json'))}
    envs, report = {}, []
    manifest = json.load(open('ss-manifest.json'))
    for t, (L, a, b) in GAPS.items():
        if only and t not in only:
            continue
        envs.setdefault(L, energy(load(L)))
        # Skip short bursts: those are the tail of the English cue or a click, not a siSwati word.
        utts = [u for u in utterances(envs[L], a, b) if u[1] - u[0] >= 0.55]
        durs = ' '.join(f'{e - s:.1f}' for s, e in utts)
        report.append(f'{t:<26} {len(utts)} utterances [{durs}]')
        if not utts:
            continue
        s, e = utts[0]
        s, e = max(a, s - 0.12), min(b, e + 0.15)
        k = items[t]['key']
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{s:.3f}', '-to', f'{e:.3f}', '-i', f'{L}.wav',
                        '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse,loudnorm=I=-18:TP=-2,aresample=24000',
                        '-ac', '1', '-b:a', '48k', f'../public/audio/ss/{k}.mp3'], check=True)
        manifest[k] = [{'f': f'ss/{k}.mp3', 'v': 'pc'}]
        if len(utts) > 1:  # keep the second reading for calibrating the pronunciation check
            s2, e2 = utts[1]
            os.makedirs('repeats', exist_ok=True)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(a, s2 - 0.12):.3f}', '-to', f'{min(b, e2 + 0.15):.3f}', '-i', f'{L}.wav',
                            '-ac', '1', '-ar', '16000', f'repeats/{k}.wav'], check=True)
    json.dump(manifest, open('ss-manifest.json', 'w'), indent=0)
    print('\n'.join(report))
