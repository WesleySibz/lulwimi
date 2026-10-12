// Pronunciation check without a speech recogniser (none exists for siSwati).
// Your recording is compared straight to the native clip of the same word:
//   sound: MFCC features (the "shape" of each sound) aligned with dynamic time warping;
//   tone:  pitch contour in semitones relative to each speaker's own voice, so a man can match a woman.
// The analysis functions are plain JS so scripts/calibrate-speech.mjs can run them in Node.

const SR = 16000;
const FRAME = 400; // 25 ms
const HOP = 160; // 10 ms
const NFFT = 512;
const NMEL = 26;
const NCEP = 13;

export function resample(x, from, to = SR) {
  if (from === to) return Float32Array.from(x);
  const ratio = from / to;
  const k = Math.max(1, Math.round(ratio)); // box filter against aliasing
  const out = new Float32Array(Math.floor(x.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const c = Math.floor(i * ratio);
    let s = 0, n = 0;
    for (let j = c; j < c + k && j < x.length; j++) { s += x[j]; n++; }
    out[i] = n ? s / n : 0;
  }
  return out;
}

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len;
    const wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}

const mel = (f) => 2595 * Math.log10(1 + f / 700);
const imel = (m) => 700 * (10 ** (m / 2595) - 1);
const FILTERS = (() => {
  const lo = mel(60), hi = mel(7600);
  const pts = [...Array(NMEL + 2)].map((_, i) => Math.floor(((NFFT + 1) * imel(lo + ((hi - lo) * i) / (NMEL + 1))) / SR));
  return [...Array(NMEL)].map((_, m) => {
    const w = new Float32Array(NFFT / 2 + 1);
    for (let k = pts[m]; k < pts[m + 1]; k++) w[k] = (k - pts[m]) / Math.max(1, pts[m + 1] - pts[m]);
    for (let k = pts[m + 1]; k < pts[m + 2]; k++) w[k] = (pts[m + 2] - k) / Math.max(1, pts[m + 2] - pts[m + 1]);
    return w;
  });
})();
const HAMMING = Float32Array.from({ length: FRAME }, (_, i) => 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (FRAME - 1)));

function frameRms(x) {
  const n = Math.max(0, Math.floor((x.length - FRAME) / HOP) + 1);
  const r = new Float32Array(n);
  for (let f = 0; f < n; f++) {
    let s = 0;
    for (let i = 0; i < FRAME; i++) s += x[f * HOP + i] ** 2;
    r[f] = Math.sqrt(s / FRAME);
  }
  return r;
}

// Cut leading/trailing silence. Returns null if there is no clear speech.
export function trim(x) {
  const r = frameRms(x);
  if (!r.length) return null;
  const peak = Math.max(...r);
  if (peak < 0.01) return null;
  const th = Math.max(peak * 0.12, 0.004);
  let a = r.findIndex((v) => v > th);
  let b = r.length - 1 - [...r].reverse().findIndex((v) => v > th);
  a = Math.max(0, a - 3); b = Math.min(r.length - 1, b + 3);
  return x.subarray(a * HOP, b * HOP + FRAME);
}

function mfcc(x) {
  const frames = [];
  const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
  for (let s = 0; s + FRAME <= x.length; s += HOP) {
    re.fill(0); im.fill(0);
    for (let i = 0; i < FRAME; i++) re[i] = (x[s + i] - (i ? 0.97 * x[s + i - 1] : 0)) * HAMMING[i];
    fft(re, im);
    const pow = new Float64Array(NFFT / 2 + 1);
    for (let k = 0; k <= NFFT / 2; k++) pow[k] = re[k] * re[k] + im[k] * im[k];
    const logm = FILTERS.map((w) => { let e = 0; for (let k = 0; k < w.length; k++) e += w[k] * pow[k]; return Math.log(e + 1e-10); });
    const c = new Float32Array(NCEP - 1);
    for (let n = 1; n < NCEP; n++) {
      let v = 0;
      for (let m = 0; m < NMEL; m++) v += logm[m] * Math.cos((Math.PI * n * (m + 0.5)) / NMEL);
      c[n - 1] = v;
    }
    frames.push(c);
  }
  // Mean and variance normalisation per coefficient reduces differences between voices and microphones.
  const d = NCEP - 1;
  for (let j = 0; j < d; j++) {
    let mu = 0; frames.forEach((f) => { mu += f[j]; }); mu /= frames.length || 1;
    let sd = 0; frames.forEach((f) => { sd += (f[j] - mu) ** 2; }); sd = Math.sqrt(sd / (frames.length || 1)) || 1;
    frames.forEach((f) => { f[j] = (f[j] - mu) / sd; });
  }
  // Append deltas (how each coefficient changes), which capture transitions between sounds.
  return frames.map((f, t) => {
    const p = frames[Math.max(0, t - 2)], q = frames[Math.min(frames.length - 1, t + 2)];
    const out = new Float32Array(d * 2);
    out.set(f, 0);
    for (let j = 0; j < d; j++) out[d + j] = (q[j] - p[j]) / 2;
    return out;
  });
}

// Pitch per frame by autocorrelation (70–400 Hz). NaN where unvoiced.
function pitch(x) {
  const out = [];
  const W = 640; // 40 ms window
  const minLag = Math.floor(SR / 400), maxLag = Math.floor(SR / 70);
  const r = frameRms(x);
  const peak = Math.max(...r, 1e-9);
  for (let f = 0, s = 0; s + W + maxLag < x.length + maxLag && s + W <= x.length; f++, s += HOP) {
    if ((r[f] ?? 0) < peak * 0.15) { out.push(NaN); continue; }
    let e0 = 0;
    for (let i = 0; i < W - maxLag; i++) e0 += x[s + i] * x[s + i];
    let best = 0, bestLag = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let c = 0, e1 = 0;
      for (let i = 0; i < W - maxLag; i++) { c += x[s + i] * x[s + i + lag]; e1 += x[s + i + lag] ** 2; }
      const n = c / Math.sqrt(e0 * e1 + 1e-12);
      if (n > best) { best = n; bestLag = lag; }
    }
    out.push(best > 0.55 ? SR / bestLag : NaN);
  }
  // Semitones relative to this speaker's median pitch.
  const voiced = out.filter((v) => !Number.isNaN(v)).sort((a, b) => a - b);
  const med = voiced[Math.floor(voiced.length / 2)] || 150;
  return out.map((v) => (Number.isNaN(v) ? NaN : 12 * Math.log2(v / med)));
}

export function analyze(samples, sampleRate) {
  const x = trim(resample(samples, sampleRate));
  if (!x || x.length < FRAME * 4) return null;
  return { mfcc: mfcc(x), pitch: pitch(x), seconds: x.length / SR };
}

function dtw(a, b) {
  const n = a.length, m = b.length;
  const D = new Float32Array((n + 1) * (m + 1)).fill(Infinity);
  const idx = (i, j) => i * (m + 1) + j;
  D[0] = 0;
  const dist = (p, q) => {
    let dot = 0, pp = 0, qq = 0;
    for (let k = 0; k < p.length; k++) { dot += p[k] * q[k]; pp += p[k] * p[k]; qq += q[k] * q[k]; }
    return 1 - dot / Math.sqrt(pp * qq + 1e-9);
  };
  // Stay near the diagonal: a word can be said faster or slower, but not wildly out of order.
  const band = Math.max(Math.abs(n - m) + 4, Math.round(0.35 * Math.max(n, m)));
  for (let i = 1; i <= n; i++) {
    const center = Math.round((i * m) / n);
    for (let j = Math.max(1, center - band); j <= Math.min(m, center + band); j++) {
      D[idx(i, j)] = dist(a[i - 1], b[j - 1]) + Math.min(D[idx(i - 1, j)], D[idx(i, j - 1)], D[idx(i - 1, j - 1)]);
    }
  }
  const path = [];
  for (let i = n, j = m; i > 0 && j > 0;) {
    path.push([i - 1, j - 1]);
    const diag = D[idx(i - 1, j - 1)], up = D[idx(i - 1, j)], left = D[idx(i, j - 1)];
    if (diag <= up && diag <= left) { i--; j--; } else if (up < left) i--; else j--;
  }
  return { cost: D[idx(n, m)] / (n + m), path: path.reverse() };
}

export function compare(user, ref) {
  const { cost, path } = dtw(user.mfcc, ref.mfcc);
  // Pitch difference along the aligned path where both voices are voiced (semitones, own-voice relative).
  let diff = 0, n = 0;
  for (const [i, j] of path) {
    const p = user.pitch[i], q = ref.pitch[j];
    if (p !== undefined && q !== undefined && !Number.isNaN(p) && !Number.isNaN(q)) { diff += Math.abs(p - q); n++; }
  }
  return { cost, toneDiff: n >= 5 ? diff / n : null };
}

// Scores an attempt against the target clip AND a cohort of other words' clips. Judging how much better
// you match the target than other words cancels out most of the difference between your voice or mic and
// the native speaker's. Bands set by scripts/calibrate-speech.mjs: the native speaker's own second reading
// scores "great" every time; a learner-like voice saying the right word passes about 60% of the time,
// a different word about 20%.
export const BANDS = globalThis.process?.env?.BANDS ? JSON.parse(process.env.BANDS) : { great: 0.1, closeBeat: 0.875, close: 0.05 };
export const COHORT_SIZE = 8;

export function scoreAttempt(user, target, cohort) {
  const t = compare(user, target);
  const cs = cohort.map((c) => compare(user, c).cost).sort((a, b) => a - b);
  const med = cs[Math.floor(cs.length / 2)];
  const beat = cs.filter((c) => c > t.cost).length;
  const rel = (med - t.cost) / med;
  const level = beat === cs.length && rel > BANDS.great ? 'great'
    : beat >= BANDS.closeBeat * cs.length && rel > BANDS.close ? 'close' : 'retry';
  return { level, beat, of: cs.length, rel, toneDiff: t.toneDiff };
}

// Pitch curve resampled to `n` points for drawing (gaps where unvoiced).
export function curve(p, n = 60) {
  return [...Array(n)].map((_, i) => p[Math.floor((i / n) * p.length)]);
}

// ---------- browser side: microphone and reference clips ----------

let ctx;
const audioCtx = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

const refCache = {};
export async function loadReference(url) {
  if (!refCache[url]) {
    refCache[url] = fetch(url).then((r) => r.arrayBuffer()).then((b) => audioCtx().decodeAudioData(b)).then((buf) => ({
      buffer: buf, features: analyze(buf.getChannelData(0), buf.sampleRate),
    }));
  }
  return refCache[url];
}

export function playBuffer(buffer) {
  const c = audioCtx();
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.connect(c.destination);
  src.start();
}

// Records until you stop talking (0.8 s of silence after speech) or `maxMs` passes.
export async function record({ onLevel, maxMs = 5000 } = {}) {
  const c = audioCtx();
  if (c.state === 'suspended') await c.resume();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
  const src = c.createMediaStreamSource(stream);
  const proc = c.createScriptProcessor(2048, 1, 1);
  const chunks = [];
  let spoke = false, quietSince = 0, done;
  const finished = new Promise((r) => { done = r; });
  const started = performance.now();
  proc.onaudioprocess = (e) => {
    const d = e.inputBuffer.getChannelData(0);
    chunks.push(Float32Array.from(d));
    let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
    const rms = Math.sqrt(s / d.length);
    onLevel?.(rms);
    const now = performance.now();
    if (rms > 0.02) { spoke = true; quietSince = now; }
    if ((spoke && now - quietSince > 800) || now - started > maxMs) stop();
  };
  src.connect(proc);
  proc.connect(c.destination);
  let stopped = false;
  function stop() {
    if (stopped) return;
    stopped = true;
    proc.disconnect(); src.disconnect();
    stream.getTracks().forEach((t) => t.stop());
    const len = chunks.reduce((a, b) => a + b.length, 0);
    const all = new Float32Array(len);
    let o = 0; for (const ch of chunks) { all.set(ch, o); o += ch.length; }
    const buf = c.createBuffer(1, all.length || 1, c.sampleRate);
    buf.copyToChannel(all, 0);
    done({ samples: all, sampleRate: c.sampleRate, buffer: buf, spoke });
  }
  return { stop, finished };
}
