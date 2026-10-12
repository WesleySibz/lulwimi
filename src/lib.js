import ss from './data/siswati.js';
import zu from './data/isizulu.js';
import AUDIO from './data/audio.json' with { type: 'json' };

// ---------- content ----------

function prepare(course) {
  const items = {};
  const lessons = [];
  course.units.forEach((unit, ui) => {
    unit.lessons.forEach((lesson, li) => {
      lesson.unitId = unit.id;
      lesson.order = lessons.length;
      lesson.itemIds = lesson.items.map(([t, en, x = {}], ii) => {
        const id = `${lesson.id}#${ii}`;
        const key = norm(t);
        // The same word can appear in several lessons; review it as one card.
        const existing = Object.values(items).find((it) => norm(it.t) === key);
        if (existing) {
          existing.alt = [...new Set([...existing.alt, en, ...(x.alt || [])])];
          return existing.id;
        }
        items[id] = {
          id, t, en,
          alt: x.alt || [], ta: x.ta || [],
          note: x.note, lit: x.lit,
          src: x.src || lesson.src || 'ai',
          lessonId: lesson.id, unit: ui,
        };
        return id;
      });
      lesson.index = li;
      lessons.push(lesson);
    });
  });
  course.items = items;
  course.lessonList = lessons;
  return course;
}

export const COURSES = { ss: prepare(ss), zu: prepare(zu) };

// Link each word to its counterpart in the other course by English meaning.
for (const c of Object.values(COURSES)) {
  const other = COURSES[c.cousinOf];
  const byEn = {};
  for (const it of Object.values(other.items)) byEn[norm(it.en)] ??= it.t;
  for (const it of Object.values(c.items)) {
    const cousin = byEn[norm(it.en)];
    if (cousin && norm(cousin) !== norm(it.t)) it.cousin = cousin;
    else if (cousin) it.same = true;
  }
}

// ---------- audio ----------
// Clips live in public/audio/<course>/ and are listed in src/data/audio.json (built by scripts/).
// voice: 'pc' = Peace Corps native speaker, 'thando' / 'themba' = Azure isiZulu neural voices.

export const audioKey = (text) => norm(text).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

for (const c of Object.values(COURSES)) {
  for (const it of Object.values(c.items)) {
    it.audio = AUDIO[c.id]?.[audioKey(it.t)] || [];
  }
}
// A siSwati word spelled exactly like its isiZulu cousin can borrow the isiZulu voice until a native clip exists.
for (const it of Object.values(COURSES.ss.items)) {
  if (!it.audio.length && it.same) {
    it.audio = (AUDIO.zu?.[audioKey(it.t)] || []).map((a) => ({ ...a, borrowed: true }));
  }
}

export const VOICE_LABEL = { pc: 'Peace Corps speaker', thando: 'Thando (AI voice)', themba: 'Themba (AI voice)' };

let player;
let lastClip = {};
// Plays one of the item's clips. Alternating voices exposes you to more than one speaker,
// which helps you recognise words in real conversation.
export function playItem(item, { slow = false } = {}) {
  if (!item?.audio?.length) return null;
  const clips = item.audio;
  const i = clips.length > 1 ? ((lastClip[item.id] ?? -1) + 1) % clips.length : 0;
  lastClip[item.id] = i;
  try {
    player ??= new Audio();
    player.pause();
    player.src = `./audio/${clips[i].f}`;
    player.playbackRate = slow ? 0.7 : 1;
    player.preservesPitch = true;
    player.play().catch(() => {});
  } catch { /* audio not available */ }
  return clips[i];
}

// Warm the cache so a lesson's audio plays instantly (and works offline afterwards).
export function preloadAudio(items) {
  for (const it of items) for (const a of it.audio || []) fetch(`./audio/${a.f}`).catch(() => {});
}

export const SRC_LABEL = {
  pc: 'Peace Corps lessons',
  hb: 'Peace Corps handbook',
  ai: 'Unverified',
};

// ---------- answer checking ----------

export function norm(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\.\.\.|…/g, '')
    .replace(/[!?.,;:"()¡¿]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// Returns 'exact' | 'typo' | false
export function checkTyped(input, answers) {
  const a = norm(input);
  if (!a) return false;
  let best = Infinity;
  for (const ans of answers) {
    const b = norm(ans);
    if (a === b) return 'exact';
    best = Math.min(best, lev(a, b));
  }
  const len = norm(answers[0]).length;
  return best <= (len > 8 ? 2 : len > 3 ? 1 : 0) ? 'typo' : false;
}

// ---------- helpers ----------

export const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sample = (arr, n) => shuffle(arr).slice(0, n);

export function today(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
export function dayNumber(dateStr = today()) {
  return Math.floor(new Date(dateStr + 'T12:00:00').getTime() / 86400000);
}

// ---------- exercise generation ----------

function distractors(course, item, field, n) {
  // Leave out anything that could also count as correct (shared meanings or spellings).
  const meanings = (x) => [x.en, ...x.alt].map(norm);
  const mine = new Set(meanings(item));
  const spellings = new Set([item.t, ...item.ta].map(norm));
  const pool = Object.values(course.items).filter(
    (x) => x.id !== item.id && norm(x[field]) !== norm(item[field])
      && !meanings(x).some((m) => mine.has(m))
      && ![x.t, ...x.ta].some((t) => spellings.has(norm(t))),
  );
  // Prefer words from the same unit so the choices are tricky in a useful way.
  const near = pool.filter((x) => x.unit === item.unit);
  const picked = sample(near, n);
  if (picked.length < n) picked.push(...sample(pool.filter((x) => !picked.includes(x)), n - picked.length));
  return picked.map((x) => x[field]);
}

export function mcq(course, item, dir) {
  const field = dir === 't2e' ? 'en' : 't';
  const correct = item[field];
  const opts = shuffle([correct, ...distractors(course, item, field, 3)]);
  return { type: 'mcq', dir, item: item.id, options: opts, answer: correct };
}

function build(course, item) {
  const words = item.t.replace(/\.\.\./g, '').split(/\s+/).filter(Boolean);
  const others = Object.values(course.items)
    .filter((x) => x.id !== item.id)
    .flatMap((x) => x.t.replace(/\.\.\./g, '').split(/\s+/))
    .filter((w) => !words.some((v) => norm(v) === norm(w)));
  const extra = sample([...new Set(others)], Math.min(3, Math.max(2, 5 - words.length)));
  return { type: 'build', item: item.id, tiles: shuffle([...words, ...extra]), answer: words.join(' ') };
}

function typed(item) {
  return { type: 'type', item: item.id };
}

// Listening: hear the word with no text and pick its meaning. With `listen` set, the player hides
// the written prompt; "Can't listen now" turns it back into the normal written question.
function listen(course, item) {
  return { ...mcq(course, item, 't2e'), listen: true };
}

function match(items) {
  return { type: 'match', items: items.map((i) => i.id) };
}

const isPhrase = (it) => it.t.trim().split(/\s+/).length >= 2;

// Lesson flow, built on a few learning-science ideas:
// - Meet a word, then recognise it straight away (errorless start).
// - Recall earlier words again a few screens later, in the harder direction (spacing inside the lesson).
// - Finish with production (typing, building) because recalling is what makes memories stick.
// - Words you already know well skip the introduction so the lesson stays challenging.
export function lessonExercises(course, lesson, srs = {}) {
  const items = [...new Set(lesson.itemIds)].map((id) => course.items[id]);
  const known = (it) => (srs[it.id]?.box || 0) >= 2;
  const fresh = items.filter((it) => !known(it));
  const ex = [];
  const lagged = new Set();
  fresh.forEach((it, i) => {
    ex.push({ type: 'intro', item: it.id });
    ex.push(mcq(course, it, 't2e'));
    if (i >= 2 && i % 2 === 0) {
      const back = fresh[i - 2];
      lagged.add(back.id);
      ex.push(mcq(course, back, 'e2t'));
    }
  });
  if (items.length >= 4) ex.push(match(sample(items, Math.min(5, items.length))));
  const later = shuffle(items).map((it, i) => {
    if (it.audio.length && i % 3 === 1) return listen(course, it);
    if (isPhrase(it)) return build(course, it);
    if ((lagged.has(it.id) || known(it) || i % 3 === 0) && it.t.length <= 14) return typed(it);
    return mcq(course, it, 'e2t');
  });
  ex.push(...later);
  // Finish by saying two of the words with native audio out loud.
  ex.push(...shuffle(items.filter(canSpeak)).slice(0, 2).map(speak));
  return ex;
}

// Speaking: say the word and compare with the native clip (see speech.js).
// Borrowed isiZulu clips are skipped: you'd be copying the wrong language.
export const canSpeak = (it) => it.audio.length > 0 && !it.audio[0].borrowed;
export const speak = (it) => ({ type: 'speak', item: it.id });

// A short session that is only speaking.
export function speakingExercises(course, ids) {
  return ids.map((id) => speak(course.items[id]));
}

// Rough pronunciation guide: Nguni syllables are open (they end in a vowel) and the stress
// usually falls on the second-to-last one. "Ngiyabonga" -> "ngi·ya·BO·nga".
export function stressGuide(text) {
  return text
    .replace(/\.\.\.|…|[!?.,;:"()]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      const parts = lower.match(/[^aeiou]*[aeiou]/g);
      if (!parts || parts.length < 2) return lower;
      parts[parts.length - 1] += lower.slice(parts.join('').length);
      parts[parts.length - 2] = parts[parts.length - 2].toUpperCase();
      return parts.join('·');
    })
    .join('  ');
}

// Lightning round: quick-fire recognition over words you have already met.
export function lightningExercise(course, ids) {
  const it = course.items[ids[Math.floor(Math.random() * ids.length)]];
  return mcq(course, it, Math.random() < 0.5 ? 't2e' : 'e2t');
}

export function reviewExercises(course, ids) {
  const items = ids.map((id) => course.items[id]);
  const ex = items.map((it, i) => {
    const r = i % 4;
    if (it.audio.length && r === 3) return listen(course, it);
    if (it.audio.length && r === 0 && !isPhrase(it) && it.t.length <= 14) return { ...typed(it), listen: true };
    if (isPhrase(it) && r < 2) return build(course, it);
    if (r === 0 && it.t.length <= 14) return typed(it);
    return mcq(course, it, r % 2 ? 'e2t' : 't2e');
  });
  if (items.length >= 5) ex.splice(Math.floor(ex.length / 2), 0, match(sample(items, 5)));
  const sayable = items.filter(canSpeak);
  if (sayable.length) ex.push(speak(sample(sayable, 1)[0]));
  return ex;
}

// Retry for a mistake: a different format, same word.
export function retryExercise(course, ex) {
  if (ex.type === 'match' || ex.type === 'speak') return null;
  const it = course.items[ex.item];
  if (ex.type === 'mcq' && ex.dir === 't2e') return mcq(course, it, 'e2t');
  return mcq(course, it, 't2e');
}

// ---------- spaced repetition (Leitner boxes) ----------

const INTERVALS = [0, 1, 3, 7, 16, 35, 90]; // days

export function srsUpdate(card, correct, now = dayNumber()) {
  const c = card ? { ...card } : { box: 0, due: now, seen: 0, right: 0 };
  c.seen += 1;
  if (correct) {
    c.right += 1;
    c.box = Math.min(c.box + 1, INTERVALS.length - 1);
  } else {
    c.box = Math.max(0, c.box - 2);
  }
  c.due = now + INTERVALS[c.box];
  c.last = now;
  return c;
}

export function dueItems(course, srs, now = dayNumber()) {
  return Object.entries(srs)
    .filter(([id, c]) => course.items[id] && c.due <= now)
    .sort((a, b) => a[1].due - b[1].due || a[1].box - b[1].box)
    .map(([id]) => id);
}

export function dueOn(course, srs, day) {
  return Object.entries(srs).filter(([id, c]) => course.items[id] && c.due === day).length;
}

export function weakestItems(course, srs, n) {
  return Object.entries(srs)
    .filter(([id]) => course.items[id])
    .sort((a, b) => a[1].box - b[1].box || a[1].right / a[1].seen - b[1].right / b[1].seen)
    .slice(0, n)
    .map(([id]) => id);
}

// ---------- levels & achievements ----------

export function levelInfo(xp) {
  // Each level needs 40 XP more than the last: 40, 80, 120...
  let lvl = 1, need = 40, base = 0;
  while (xp >= base + need) { base += need; lvl += 1; need = 40 * lvl; }
  return { lvl, into: xp - base, need };
}

export const ACHIEVEMENTS = [
  { id: 'first', icon: 'sprout', name: 'First steps', desc: 'Finish your first lesson', test: (s) => s.lessonsDone >= 1 },
  { id: 'streak3', icon: 'flame', name: 'Kindling', desc: '3-day streak', test: (s) => s.bestStreak >= 3 },
  { id: 'streak7', icon: 'flame', name: 'Fire keeper', desc: '7-day streak', test: (s) => s.bestStreak >= 7 },
  { id: 'streak30', icon: 'flame', name: 'Eternal flame', desc: '30-day streak', test: (s) => s.bestStreak >= 30 },
  { id: 'xp100', icon: 'bolt', name: 'Hundred', desc: 'Earn 100 XP', test: (s) => s.xp >= 100 },
  { id: 'xp1000', icon: 'bolt', name: 'Thousand', desc: 'Earn 1000 XP', test: (s) => s.xp >= 1000 },
  { id: 'perfect', icon: 'gem', name: 'Flawless', desc: 'Finish a lesson with no mistakes', test: (s) => s.perfects >= 1 },
  { id: 'combo10', icon: 'star', name: 'On a roll', desc: 'Get 10 answers right in a row', test: (s) => s.bestCombo >= 10 },
  { id: 'words50', icon: 'book', name: 'Wordsmith', desc: 'Learn 50 words', test: (s) => s.words >= 50 },
  { id: 'unit', icon: 'medal', name: 'Unit master', desc: 'Complete a whole unit', test: (s) => s.unitsDone >= 1 },
  { id: 'lightning20', icon: 'clock', name: 'Quick tongue', desc: 'Score 20 in a lightning round', test: (s) => s.lightningBest >= 20 },
  { id: 'both', icon: 'link', name: 'Nguni cousins', desc: 'Finish a lesson in both siSwati and isiZulu', test: (s) => s.bothLangs },
  { id: 'wisdom', icon: 'ear', name: 'Elder\'s ear', desc: 'Read 7 daily proverbs', test: (s) => s.proverbsRead >= 7 },
];

// ---------- daily quests ----------
// Three small, varied goals a day. Variety keeps practice from feeling like a chore.

export const QUESTS = [
  { id: 'lesson', text: 'Finish a lesson', key: 'lessons', target: 1 },
  { id: 'review', text: 'Review 10 words', key: 'reviewed', target: 10 },
  { id: 'combo', text: 'Get 5 right in a row', key: 'combo', target: 5 },
  { id: 'perfect', text: 'Finish a session with no mistakes', key: 'perfect', target: 1 },
  { id: 'lightning', text: 'Score 10 in a lightning round', key: 'lightning', target: 10 },
  { id: 'proverb', text: 'Read today\'s proverb', key: 'proverb', target: 1 },
];
export const QUEST_XP = 5;

export function todaysQuests() {
  // Always include the lesson quest so the main path keeps moving, plus two that rotate daily.
  const rest = QUESTS.slice(1);
  const n = dayNumber();
  const a = n % rest.length;
  const b = (a + 1 + (n % (rest.length - 1))) % rest.length; // never equals a
  return [QUESTS[0], rest[a], rest[b]];
}

export function dailyCounters(s) {
  return s.daily?.date === today() ? s.daily : { date: today(), claimed: {} };
}

// Patch values are added, except "combo" and "lightning", which keep the best.
export function bumpDaily(s, patch) {
  const d = { ...dailyCounters(s) };
  for (const [k, v] of Object.entries(patch)) {
    d[k] = k === 'combo' || k === 'lightning' ? Math.max(d[k] || 0, v) : (d[k] || 0) + v;
  }
  return { ...s, daily: d };
}

// Pays out finished quests once. Returns the new state and the quests just completed.
export function claimQuests(s) {
  const d = dailyCounters(s);
  const done = todaysQuests().filter((q) => !d.claimed[q.id] && (d[q.key] || 0) >= q.target);
  if (!done.length) return { s, done };
  const n = { ...s, daily: { ...d, claimed: { ...d.claimed, ...Object.fromEntries(done.map((q) => [q.id, true])) } } };
  return { s: addXp(n, done.length * QUEST_XP), done };
}

// ---------- storage ----------

const KEY = 'lulwimi.v1';

export const DEFAULT_STATE = {
  course: 'ss',
  goal: 20,
  sound: true,
  autoplay: true,
  onTop: false,
  unlockAll: false,
  xp: 0,
  xpByDay: {},
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  freezes: 0,
  progress: { ss: {}, zu: {} }, // lessonId -> { done: n, best: accuracy }
  srs: { ss: {}, zu: {} },
  perfects: 0,
  proverbsSeen: {},
  achievements: {},
  bestCombo: 0,
  lightningBest: 0,
  daily: null,
};

export function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw) return { ...DEFAULT_STATE, ...raw, progress: { ...DEFAULT_STATE.progress, ...raw.progress }, srs: { ...DEFAULT_STATE.srs, ...raw.srs } };
  } catch { /* fall through */ }
  return { ...DEFAULT_STATE };
}

export function saveState(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// Streak bookkeeping when the app opens: a missed day uses a freeze if available.
export function refreshStreak(s) {
  if (!s.lastActive) return s;
  const gap = dayNumber() - dayNumber(s.lastActive);
  if (gap <= 1) return s;
  const missed = gap - 1;
  if (s.freezes >= missed) return { ...s, freezes: s.freezes - missed, lastActive: today(new Date(Date.now() - 86400000)) };
  return { ...s, streak: 0 };
}

export function addXp(s, amount) {
  const d = today();
  const n = { ...s, xp: s.xp + amount, xpByDay: { ...s.xpByDay, [d]: (s.xpByDay[d] || 0) + amount } };
  if (n.lastActive !== d) {
    const gap = n.lastActive ? dayNumber(d) - dayNumber(n.lastActive) : 99;
    n.streak = gap === 1 ? n.streak + 1 : 1;
    n.lastActive = d;
    n.bestStreak = Math.max(n.bestStreak, n.streak);
    // Earn a streak freeze every 7 days (hold at most 2).
    if (n.streak % 7 === 0) n.freezes = Math.min(2, n.freezes + 1);
  }
  return n;
}

export function stats(s) {
  const lessonsDone = Object.values(s.progress).reduce((a, p) => a + Object.keys(p).length, 0);
  const words = Object.values(s.srs).reduce((a, p) => a + Object.keys(p).length, 0);
  let unitsDone = 0;
  for (const c of Object.values(COURSES)) {
    for (const u of c.units) if (u.lessons.every((l) => s.progress[c.id]?.[l.id])) unitsDone++;
  }
  return {
    xp: s.xp, bestStreak: s.bestStreak, lessonsDone, words, unitsDone, perfects: s.perfects,
    bestCombo: s.bestCombo || 0, lightningBest: s.lightningBest || 0,
    bothLangs: Object.keys(s.progress.ss).length > 0 && Object.keys(s.progress.zu).length > 0,
    proverbsRead: Object.keys(s.proverbsSeen).length,
  };
}

export function newAchievements(s) {
  const st = stats(s);
  return ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.test(st));
}

// ---------- daily picks ----------

export function dailyProverb(course, offset = 0) {
  const list = course.proverbs;
  return list[(((dayNumber() + offset) * 7) % list.length + list.length) % list.length];
}

export function dailyWord(course) {
  const all = Object.values(course.items).filter((i) => !isPhrase(i));
  return all[(dayNumber() * 13) % all.length];
}

export function dailyCulture(course) {
  return course.culture[dayNumber() % course.culture.length];
}

// ---------- sound effects (no audio files) ----------

let ctx;
export function beep(kind) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const notes = { right: [660, 880], wrong: [220, 180], done: [523, 659, 784, 1046], combo: [784, 988, 1175] }[kind];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = kind === 'wrong' ? 'triangle' : 'sine';
      o.frequency.value = f;
      const t = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.2);
    });
  } catch { /* audio not available */ }
}

// Short vibration on phones that support it.
export function buzz(ms = 30) {
  try { navigator.vibrate?.(ms); } catch { /* not supported */ }
}

// ---------- desktop shell (Tauri) ----------

export const tauri = typeof window !== 'undefined' ? window.__TAURI__ : undefined;

export async function setWindowMode(mode) {
  if (!tauri) return;
  const w = tauri.window.getCurrentWindow();
  const { LogicalSize } = tauri.dpi;
  if (mode === 'compact') await w.setSize(new LogicalSize(360, 250));
  else await w.setSize(new LogicalSize(420, 700));
}

export async function setOnTop(on) {
  if (!tauri) return;
  await tauri.window.getCurrentWindow().setAlwaysOnTop(on);
}
