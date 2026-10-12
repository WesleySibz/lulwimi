# Second pass: for items still without audio, list the top candidates with surrounding words,
# so each can be confirmed by meaning (the English nearby) as well as by sound.
import json, difflib, sys
from align import LESSONS, key

want = set(json.load(open('missing.json')))
items = [i for i in json.load(open('ss-items.json')) if i['t'] in want]
words = []
for L in LESSONS:
    for s in json.load(open(L + '.json')):
        for w in s['words']:
            words.append((L, w[0], w[1], w[2].strip()))

out = {}
for it in items:
    target = key(it['t'])
    n = len(it['t'].split())
    cands = []
    for i in range(len(words)):
        for span in range(1, n + 3):
            run = words[i:i + span]
            if len(run) < span or len({r[0] for r in run}) > 1 or run[-1][1] - run[0][2] > 1.5 * span:
                break
            cand = key(''.join(r[3] for r in run))
            if len(cand) < 2:
                continue
            r = difflib.SequenceMatcher(None, target, cand).ratio()
            if r >= 0.6:
                cands.append((r, i, span))
    cands.sort(reverse=True)
    picked, used = [], set()
    for r, i, span in cands:
        if any(abs(i - u) < 4 for u in used):
            continue
        used.add(i)
        ctx = ' '.join(w[3] for w in words[max(0, i - 8):i]) + ' [[' + ' '.join(w[3] for w in words[i:i + span]) + ']] ' + ' '.join(w[3] for w in words[i + span:i + span + 4])
        picked.append({'r': round(r, 2), 'lesson': words[i][0], 'start': words[i][1], 'end': words[i + span - 1][2], 'ctx': ctx})
        if len(picked) == 3:
            break
    out[it['t']] = picked
    print(f"\n## {it['t']}  ({it['en']})")
    for n_, p in enumerate(picked):
        print(f"  {n_} {p['r']:.2f} {p['lesson'][11:]:<8} {p['start']:6.1f}  {p['ctx']}")
json.dump(out, open('candidates.json', 'w'), indent=1)
