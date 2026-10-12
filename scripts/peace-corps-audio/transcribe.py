# Transcribe each lesson with word timings so we can find the English prompts and the siSwati replies.
import json, sys, wave
import numpy as np

def load(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
from faster_whisper import WhisperModel
m = WhisperModel('base', device='cpu', compute_type='int8')
for name in sys.argv[1:]:
    segs, info = m.transcribe(load(name + '.wav'), language='en', word_timestamps=True, vad_filter=True,
                              vad_parameters={'min_silence_duration_ms': 300})
    out = []
    for s in segs:
        out.append({'start': s.start, 'end': s.end, 'text': s.text.strip(), 'p': s.avg_logprob, 'nsp': s.no_speech_prob,
                    'words': [[w.start, w.end, w.word, w.probability] for w in s.words]})
    json.dump(out, open(name + '.json', 'w'), indent=0)
    print(name, len(out), 'segments')
