// Measures the pronunciation check in src/speech.js (scoreAttempt) on three kinds of attempt:
//   native repeat:  the Peace Corps speaker's second reading of a word (audio-src/repeats, from gaps.py)
//   learner right:  Windows' English voice reading the siSwati spelling (audio-src/learner), a rough
//                   stand-in for a learner: different voice, foreign accent
//   learner wrong:  that recording scored against a different word
// Re-run after changing the features or BANDS; real learners imitating the clip should do better than the stand-in.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { COHORT_SIZE, analyze, scoreAttempt } from '../src/speech.js';

const decode = (file) => {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], { maxBuffer: 1 << 26 });
  const i16 = new Int16Array(raw.buffer, raw.byteOffset, raw.length / 2);
  return analyze(Float32Array.from(i16, (v) => v / 32768), 16000);
};

const ref = {};
for (const f of fs.readdirSync('public/audio/ss')) ref[f.replace('.mp3', '')] = decode(`public/audio/ss/${f}`);
const keys = Object.keys(ref).filter((k) => ref[k]);
const N = Number(process.env.N || COHORT_SIZE);
const cohortFor = (t) => keys.filter((o) => o !== t).sort(() => Math.random() - 0.5).slice(0, N).map((o) => ref[o]);
const score = (a, t) => scoreAttempt(a, ref[t], cohortFor(t)).level;

const groups = { 'native repeat': [], 'learner right': [], 'learner wrong': [] };
if (fs.existsSync('audio-src/repeats')) {
  for (const f of fs.readdirSync('audio-src/repeats')) {
    const k = f.replace('.wav', ''), a = decode(`audio-src/repeats/${f}`);
    if (a && ref[k]) groups['native repeat'].push(score(a, k));
  }
}
for (const k of keys) {
  const f = `audio-src/learner/${k}.wav`;
  if (!fs.existsSync(f)) continue;
  const a = decode(f);
  if (!a) continue;
  for (let r = 0; r < 3; r++) groups['learner right'].push(score(a, k));
  groups['learner wrong'].push(score(a, keys.filter((o) => o !== k)[Math.floor(Math.random() * (keys.length - 1))]));
}
for (const [name, xs] of Object.entries(groups)) {
  if (!xs.length) continue;
  const pct = (l) => `${l} ${Math.round((100 * xs.filter((x) => x === l).length) / xs.length)}%`;
  console.log(name.padEnd(15), `n=${xs.length}`.padEnd(7), ['great', 'close', 'retry'].map(pct).join('  '));
}
