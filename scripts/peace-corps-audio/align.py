# Finds each siSwati course item in the Peace Corps recordings and cuts a clip for it.
# Whisper (English model) writes siSwati words phonetically, e.g. "Saobona" for "Sawubona",
# so we compare simplified sound-keys of the item and of runs of transcribed words.
import json, subprocess, wave, difflib, re, sys
import numpy as np

LESSONS = ['SZ_siSwati_Introduction'] + [f'SZ_siSwati_Lesson_{i}' for i in range(1, 9)]
SR = 16000


def key(s):
    s = s.lower()
    s = re.sub(r'[^a-z]', '', s)
    for a, b in [('tf', 'f'), ('dv', 'v'), ('dz', 'z'), ('ts', 's'), ('tj', 'j'), ('ch', 'k'), ('c', 'k'), ('q', 'k'),
                 ('kh', 'k'), ('ph', 'p'), ('th', 't'), ('bh', 'b'), ('hh', 'h'), ('sh', 's'), ('x', 'k'),
                 ('ng', 'n'), ('gc', 'k'), ('gw', 'g'), ('dl', 'l'), ('hl', 'l')]:
        s = s.replace(a, b)
    s = re.sub(r'(?<=[aeiou])[wy](?=[aeiou])', '', s)  # glides between vowels are often dropped
    s = re.sub(r'(.)\1+', r'\1', s)
    return s


def load(name):
    with wave.open(name + '.wav') as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768


def energy(x, hop=160):
    n = len(x) // hop
    return np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-10)  # 10 ms frames


def snap(env, t, direction, limit=0.35):
    """Move a boundary to the quietest point within `limit` seconds in `direction` (-1 earlier, +1 later)."""
    f = int(t * 100)
    lo, hi = (max(0, f - int(limit * 100)), f + 1) if direction < 0 else (f, min(len(env), f + int(limit * 100)))
    seg = env[lo:hi]
    if not len(seg):
        return t
    thresh = np.percentile(env, 20) * 1.8
    quiet = np.where(seg < thresh)[0]
    if len(quiet):
        pick = quiet[-1] if direction < 0 else quiet[0]
    else:
        pick = int(np.argmin(seg))
    return (lo + pick) / 100


def main():
    items = json.load(open('ss-items.json'))
    words = []  # (lesson, start, end, text)
    for L in LESSONS:
        for s in json.load(open(L + '.json')):
            for w in s['words']:
                words.append((L, w[0], w[1], w[2].strip()))

    results = {}
    for it in items:
        target = key(it['t'])
        n_words = len(it['t'].split())
        best = None
        for i in range(len(words)):
            for span in range(1, n_words + 2):
                run = words[i:i + span]
                if len(run) < span or len({r[0] for r in run}) > 1:
                    break
                if run[-1][1] - run[0][2] > 1.2 * span:  # words too far apart to be one phrase
                    break
                cand = key(''.join(r[3] for r in run))
                if not cand:
                    continue
                r = difflib.SequenceMatcher(None, target, cand).ratio()
                # Reward the item being said twice in a row (the course's read-twice pattern).
                nxt = key(''.join(x[3] for x in words[i + span:i + 2 * span]))
                twice = difflib.SequenceMatcher(None, target, nxt).ratio() > 0.7
                score = r + (0.05 if twice else 0)
                if best is None or score > best['score']:
                    best = {'score': score, 'ratio': r, 'lesson': run[0][0], 'start': run[0][1], 'end': run[-1][2],
                            'heard': ' '.join(x[3] for x in run), 'twice': twice}
        if best and best['ratio'] >= 0.75 and len(target) >= 3:
            results[it['key']] = {**best, 't': it['t']}

    print(f'matched {len(results)} of {len(items)} items')
    json.dump(results, open('matches.json', 'w'), indent=1)
    for k, m in sorted(results.items(), key=lambda kv: kv[1]['ratio']):
        print(f"{m['ratio']:.2f} {'2x' if m['twice'] else '  '} {m['t']:<28} heard: {m['heard']:<28} {m['lesson'][11:]} {m['start']:.1f}")


if __name__ == "__main__":
    main()
