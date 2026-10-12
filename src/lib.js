import ss from './data/siswati.js';
import zu from './data/isizulu.js';

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

function mcq(course, item, dir) {
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

function match(items) {
  return { type: 'match', items: items.map((i) => i.id) };
}

const isPhrase = (it) => it.t.trim().split(/\s+/).length >= 2;

export function lessonExercises(course, lesson) {
  const items = [...new Set(lesson.itemIds)].map((id) => course.items[id]);
  const ex = [];
  // Phase 1: meet each word, then recognise it straight away.
  for (const it of items) {
    ex.push({ type: 'intro', item: it.id });
    ex.push(mcq(course, it, 't2e'));
  }
  // Phase 2: pairs.
  if (items.length >= 4) ex.push(match(sample(items, Math.min(5, items.length))));
  // Phase 3: recall in the other direction, harder formats.
  const later = shuffle(items).map((it, i) => {
    if (isPhrase(it)) return build(course, it);
    if (i % 3 === 0 && it.t.length <= 14) return typed(it);
    return mcq(course, it, 'e2t');
  });
  ex.push(...later);
  return ex;
}

export function reviewExercises(course, ids) {
  const items = ids.map((id) => course.items[id]);
  const ex = items.map((it, i) => {
    const r = i % 4;
    if (isPhrase(it) && r < 2) return build(course, it);
    if (r === 0 && it.t.length <= 14) return typed(it);
    return mcq(course, it, r % 2 ? 'e2t' : 't2e');
  });
  if (items.length >= 5) ex.splice(Math.floor(ex.length / 2), 0, match(sample(items, 5)));
  return ex;
}

// Retry for a mistake: a different format, same word.
export function retryExercise(course, ex) {
  if (ex.type === 'match') return null;
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
  { id: 'first', icon: '🌱', name: 'First steps', desc: 'Finish your first lesson', test: (s) => s.lessonsDone >= 1 },
  { id: 'streak3', icon: '🔥', name: 'Kindling', desc: '3-day streak', test: (s) => s.bestStreak >= 3 },
  { id: 'streak7', icon: '🔥', name: 'Fire keeper', desc: '7-day streak', test: (s) => s.bestStreak >= 7 },
  { id: 'streak30', icon: '🌋', name: 'Eternal flame', desc: '30-day streak', test: (s) => s.bestStreak >= 30 },
  { id: 'xp100', icon: '⭐', name: 'Hundred', desc: 'Earn 100 XP', test: (s) => s.xp >= 100 },
  { id: 'xp1000', icon: '🌟', name: 'Thousand', desc: 'Earn 1000 XP', test: (s) => s.xp >= 1000 },
  { id: 'perfect', icon: '💎', name: 'Flawless', desc: 'Finish a lesson with no mistakes', test: (s) => s.perfects >= 1 },
  { id: 'words50', icon: '📚', name: 'Wordsmith', desc: 'Learn 50 words', test: (s) => s.words >= 50 },
  { id: 'unit', icon: '🏅', name: 'Unit master', desc: 'Complete a whole unit', test: (s) => s.unitsDone >= 1 },
  { id: 'both', icon: '🤝', name: 'Nguni cousins', desc: 'Finish a lesson in both siSwati and isiZulu', test: (s) => s.bothLangs },
  { id: 'wisdom', icon: '🦉', name: 'Elder\'s ear', desc: 'Read 7 daily proverbs', test: (s) => s.proverbsRead >= 7 },
];

// ---------- storage ----------

const KEY = 'lulwimi.v1';

export const DEFAULT_STATE = {
  course: 'ss',
  goal: 20,
  sound: true,
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
    const notes = { right: [660, 880], wrong: [220, 180], done: [523, 659, 784, 1046] }[kind];
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
