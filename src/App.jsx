import { useEffect, useMemo, useState } from 'react';
import Player, { SrcBadge, Swatch } from './Player.jsx';
import {
  ACHIEVEMENTS, COURSES, DEFAULT_STATE, SRC_LABEL, addXp, dailyCulture, dailyProverb, dailyWord,
  dueItems, lessonExercises, levelInfo, loadState, newAchievements, refreshStreak, reviewExercises, saveState,
  setOnTop, setWindowMode, srsUpdate, stats, today, weakestItems,
} from './lib.js';

export default function App() {
  const [s, setS] = useState(() => refreshStreak(loadState()));
  const [tab, setTab] = useState('learn');
  const [session, setSession] = useState(null); // { kind, lesson?, exercises }
  const [result, setResult] = useState(null);
  const [compact, setCompact] = useState(false);

  const course = COURSES[s.course];
  useEffect(() => saveState(s), [s]);
  useEffect(() => { setOnTop(s.onTop); }, [s.onTop]);
  useEffect(() => { setWindowMode(compact ? 'compact' : 'full'); }, [compact]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', course.accent);
    document.documentElement.style.setProperty('--accent2', course.accent2);
  }, [course]);

  const due = useMemo(() => dueItems(course, s.srs[course.id]), [course, s.srs]);
  const todayXp = s.xpByDay[today()] || 0;
  const progress = s.progress[course.id];
  const nextLesson = course.lessonList.find((l) => !progress[l.id]) || null;

  function isUnlocked(lesson) {
    if (s.unlockAll || lesson.order === 0) return true;
    return Boolean(progress[course.lessonList[lesson.order - 1].id]) || Boolean(progress[lesson.id]);
  }

  function startLesson(lesson) {
    setSession({ kind: 'lesson', lesson, exercises: lessonExercises(course, lesson), title: lesson.title });
  }

  function startReview() {
    let ids = due.slice(0, 12);
    if (ids.length < 5) ids = [...new Set([...ids, ...weakestItems(course, s.srs[course.id], 10)])].slice(0, 10);
    if (!ids.length) return;
    setSession({ kind: 'review', exercises: reviewExercises(course, ids), title: due.length ? 'Review' : 'Practice' });
  }

  function finish(r) {
    const cid = course.id;
    let n = { ...s, srs: { ...s.srs, [cid]: { ...s.srs[cid] } }, progress: { ...s.progress, [cid]: { ...s.progress[cid] } } };
    for (const [id, ok] of Object.entries(r.results)) n.srs[cid][id] = srsUpdate(n.srs[cid][id], ok);
    let xp;
    if (session.kind === 'lesson') {
      const prev = n.progress[cid][session.lesson.id];
      n.progress[cid][session.lesson.id] = { done: (prev?.done || 0) + 1, best: Math.max(prev?.best || 0, r.accuracy) };
      xp = 10 + (r.perfect ? 5 : 0);
    } else {
      xp = Math.max(5, Object.values(r.results).filter(Boolean).length);
    }
    if (r.perfect) n.perfects += 1;
    const before = todayXp;
    n = addXp(n, xp);
    const fresh = newAchievements(n);
    if (fresh.length) n.achievements = { ...n.achievements, ...Object.fromEntries(fresh.map((a) => [a.id, today()])) };
    setS(n);
    setResult({ ...r, xp, fresh, goalHit: before < n.goal && before + xp >= n.goal, kind: session.kind });
    setSession(null);
  }

  const update = (patch) => setS((p) => ({ ...p, ...patch }));

  if (compact) {
    return <Compact s={s} setS={setS} course={course} due={due} todayXp={todayXp} onExpand={() => setCompact(false)} />;
  }

  if (session) {
    return (
      <Player
        course={course}
        exercises={session.exercises}
        title={session.title}
        sound={s.sound}
        onFinish={finish}
        onQuit={() => setSession(null)}
      />
    );
  }

  if (result) return <Result r={result} s={s} onClose={() => setResult(null)} />;

  return (
    <div className="app">
      <header className="top">
        <div className="course-switch">
          {Object.values(COURSES).map((c) => (
            <button key={c.id} className={c.id === course.id ? 'on' : ''} onClick={() => update({ course: c.id })}>
              <Swatch c={c} /> {c.name}
            </button>
          ))}
        </div>
        <div className="top-stats">
          <span title="Day streak">🔥 {s.streak}</span>
          <span title="Total XP">⭐ {s.xp}</span>
          <button className="icon-btn" title="Mini widget" onClick={() => setCompact(true)}>⤡</button>
        </div>
      </header>

      <main className="content">
        {tab === 'learn' && (
          <Learn {...{ s, course, due, todayXp, nextLesson, progress, isUnlocked, startLesson, startReview, setTab, update }} />
        )}
        {tab === 'review' && <Review {...{ s, course, due, startReview }} />}
        {tab === 'wisdom' && <Wisdom {...{ s, course, update }} />}
        {tab === 'guide' && <Guide course={course} />}
        {tab === 'me' && <Me {...{ s, setS, update }} />}
      </main>

      <nav className="tabs">
        {[['learn', '🏠', 'Learn'], ['review', '🔁', 'Review'], ['wisdom', '🦉', 'Wisdom'], ['guide', '📖', 'Guide'], ['me', '👤', 'Me']].map(([id, ic, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            <span className="tab-ic">{ic}</span>{label}
            {id === 'review' && due.length > 0 && <i className="dot">{due.length}</i>}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ---------------- Learn (home) ----------------

function GoalRing({ value, goal, size = 54 }) {
  const pct = Math.min(1, value / goal);
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="ring">
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle">{pct >= 1 ? '✓' : `${value}`}</text>
    </svg>
  );
}

function Learn({ s, course, due, todayXp, nextLesson, progress, isUnlocked, startLesson, startReview, setTab, update }) {
  const proverb = dailyProverb(course);
  const word = dailyWord(course);
  const [reveal, setReveal] = useState(false);
  const lvl = levelInfo(s.xp);
  const doneCount = Object.keys(progress).length;

  function readProverb() {
    setReveal(true);
    const key = `${course.id}:${today()}`;
    if (!s.proverbsSeen[key]) update({ proverbsSeen: { ...s.proverbsSeen, [key]: true } });
  }

  return (
    <>
      <section className="bento">
        <div className="tile-card span2 hero">
          <div>
            <div className="muted small">Level {lvl.lvl} · {doneCount}/{course.lessonList.length} lessons</div>
            {nextLesson ? (
              <>
                <h2>{nextLesson.title}</h2>
                <div className="muted small">{course.units.find((u) => u.id === nextLesson.unitId).title}</div>
                <button className="btn primary" onClick={() => startLesson(nextLesson)}>Start lesson ▶</button>
              </>
            ) : (
              <>
                <h2>Course complete! 🎉</h2>
                <button className="btn primary" onClick={startReview}>Keep practising</button>
              </>
            )}
          </div>
          <div className="goal">
            <GoalRing value={todayXp} goal={s.goal} />
            <div className="muted small">{todayXp}/{s.goal} XP</div>
          </div>
        </div>

        <button className="tile-card" onClick={() => (due.length ? startReview() : setTab('review'))}>
          <div className="tile-ic">🔁</div>
          <strong>{due.length ? `${due.length} to review` : 'All caught up'}</strong>
          <div className="muted small">{due.length ? 'Keep them fresh' : 'Spaced repetition'}</div>
        </button>

        <div className="tile-card">
          <div className="muted small">Word of the day</div>
          <strong className="target big">{word.t}</strong>
          <div className="small">{word.en}</div>
        </div>

        <div className="tile-card span2 wisdom-card" onClick={readProverb}>
          <div className="muted small">🦉 Wisdom of the day</div>
          <div className="target proverb">{proverb.t}</div>
          <div className="small">“{proverb.lit}”</div>
          {reveal ? (
            <>
              <div className="meaning">{proverb.meaning}</div>
              <div className="reflect">✦ {proverb.reflect}</div>
            </>
          ) : <div className="muted small">Tap to reveal the meaning</div>}
        </div>

        <div className="tile-card span2 culture">
          <span className="muted small">Culture tip</span>
          <div className="small">{dailyCulture(course)}</div>
        </div>
      </section>

      <section className="path">
        {course.units.map((u, ui) => {
          const done = u.lessons.filter((l) => progress[l.id]).length;
          return (
            <div className="unit" key={u.id}>
              <div className="unit-head">
                <span className="unit-ic">{u.icon}</span>
                <div>
                  <div className="unit-title">Unit {ui + 1}: {u.title}</div>
                  <div className="muted small">{u.desc}</div>
                </div>
                <span className="muted small">{done}/{u.lessons.length}</span>
              </div>
              <div className="nodes">
                {u.lessons.map((l) => {
                  const open = isUnlocked(l);
                  const p = progress[l.id];
                  return (
                    <button
                      key={l.id}
                      className={`node ${p ? 'done' : ''} ${open ? '' : 'locked'} ${nextLesson?.id === l.id ? 'current' : ''}`}
                      disabled={!open}
                      title={open ? l.title : 'Finish the previous lesson first'}
                      onClick={() => startLesson(l)}
                    >
                      <span className="node-dot">{p ? (p.best >= 0.999 ? '💎' : '✓') : open ? '▶' : '🔒'}</span>
                      <span className="node-label">{l.title}</span>
                    </button>
                  );
                })}
              </div>
              <details className="unit-tip">
                <summary>💡 Grammar & tips</summary>
                <p>{u.tip}</p>
              </details>
            </div>
          );
        })}
      </section>
    </>
  );
}

// ---------------- Review ----------------

function Review({ s, course, due, startReview }) {
  const cards = s.srs[course.id];
  const learned = Object.keys(cards).filter((id) => course.items[id]);
  const boxes = [0, 0, 0, 0, 0, 0, 0];
  learned.forEach((id) => { boxes[cards[id].box] += 1; });
  const names = ['New', 'Learning', 'Learning', 'Familiar', 'Familiar', 'Strong', 'Mastered'];
  const max = Math.max(1, ...boxes);
  return (
    <div className="page">
      <h2>Review</h2>
      <p className="muted">Words come back just before you'd forget them: after 1 day, then 3, 7, 16, 35 and 90 days. Mistakes send a word back a few steps.</p>
      <button className="btn primary wide" disabled={!learned.length} onClick={startReview}>
        {due.length ? `Review ${Math.min(12, due.length)} due words` : learned.length ? 'Practise weakest words' : 'Finish a lesson first'}
      </button>
      <h3>Memory strength · {learned.length} words</h3>
      <div className="boxes">
        {boxes.map((n, i) => (
          <div key={i} className="box-col" title={`${names[i]}: ${n}`}>
            <div className="box-bar" style={{ height: `${(n / max) * 100}%` }} />
            <span>{n}</span>
          </div>
        ))}
      </div>
      <div className="box-legend muted small"><span>Fragile</span><span>Mastered</span></div>
    </div>
  );
}

// ---------------- Wisdom ----------------

function Wisdom({ s, course, update }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="page">
      <h2>🦉 Wisdom</h2>
      <p className="muted">Proverbs (<span className="target">{course.id === 'ss' ? 'tisho' : 'izaga'}</span>) carry a people's theology and poetry in a few words. Read one, then sit with the question.</p>
      <h3>Proverbs</h3>
      {course.proverbs.map((p, i) => (
        <div key={p.t} className={`wisdom-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="target">{p.t}</div>
          <div className="small">“{p.lit}”</div>
          {open === i && (
            <>
              <div className="meaning">{p.meaning}</div>
              <div className="reflect">✦ {p.reflect}</div>
              <SrcBadge src={p.src} />
            </>
          )}
        </div>
      ))}
      <h3>Theology & worldview</h3>
      {course.concepts.map((c) => (
        <div key={c.t} className="concept">
          <div><span className="target">{c.t}</span> · <span className="muted">{c.en}</span></div>
          <p className="small">{c.body}</p>
          <SrcBadge src={c.src} />
        </div>
      ))}
    </div>
  );
}

// ---------------- Guide ----------------

function Guide({ course }) {
  const [q, setQ] = useState('');
  const items = Object.values(course.items).filter((i) => {
    const n = q.toLowerCase();
    return !n || i.t.toLowerCase().includes(n) || i.en.toLowerCase().includes(n) || i.alt.some((a) => a.toLowerCase().includes(n));
  });
  const counts = Object.values(course.items).reduce((a, i) => ({ ...a, [i.src]: (a[i.src] || 0) + 1 }), {});
  return (
    <div className="page">
      <h2>📖 {course.name} guide</h2>
      <h3>Sounds</h3>
      <table className="sounds">
        <tbody>
          {course.sounds.map(([l, how, ex]) => (
            <tr key={l}><td className="target">{l}</td><td className="small">{how}{ex && <div className="muted">e.g. <span className="target">{ex}</span></div>}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>Dictionary · {Object.keys(course.items).length} entries</h3>
      <input className="search" placeholder="Search either language…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="dict">
        {items.map((i) => (
          <div key={i.id} className="dict-row">
            <span className="target">{i.t}</span>
            <span className="small">{i.en}{i.cousin && <span className="muted"> · {course.cousinOf === 'zu' ? 'zu' : 'ss'}: {i.cousin}</span>}</span>
            <SrcBadge src={i.src} />
          </div>
        ))}
      </div>

      <h3>Where this content comes from</h3>
      <ul className="small">
        {Object.entries(counts).map(([k, n]) => <li key={k}><SrcBadge src={k} /> {n} entries</li>)}
      </ul>
      <p className="small muted">
        {course.id === 'ss'
          ? 'Peace Corps siSwati Language Lessons (9-lesson audio course) and the siSwati Special Skills Handbook (1980; proverbs collected by E.C.L. Kunene). Both are US-government public-domain materials. "Unverified" entries were added from general knowledge to complete the course. Have a siSwati speaker check them.'
          : 'No isiZulu course text was supplied, so most entries are general knowledge (Unverified). The sound rules linking Zulu and siSwati come from the Peace Corps handbook\'s chapter "siSwati and Zulu" by E.C.L. Kunene. Have a Zulu speaker check them.'}
      </p>
    </div>
  );
}

// ---------------- Me ----------------

function Me({ s, setS, update }) {
  const lvl = levelInfo(s.xp);
  const st = stats(s);
  const week = [...Array(7)].map((_, i) => {
    const d = today(new Date(Date.now() - (6 - i) * 86400000));
    return { d, xp: s.xpByDay[d] || 0 };
  });
  const maxW = Math.max(s.goal, ...week.map((w) => w.xp));

  function exportData() {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lulwimi-progress-${today()}.json`;
    a.click();
  }
  function importData(e) {
    const f = e.target.files[0];
    if (!f) return;
    f.text().then((t) => {
      try { setS({ ...DEFAULT_STATE, ...JSON.parse(t) }); alert('Progress restored.'); } catch { alert('That file is not a Lulwimi backup.'); }
    });
  }

  return (
    <div className="page">
      <h2>👤 Your journey</h2>
      <div className="level">
        <div className="level-badge">{lvl.lvl}</div>
        <div style={{ flex: 1 }}>
          <div className="small">Level {lvl.lvl} · {lvl.into}/{lvl.need} XP to next</div>
          <div className="bar"><div style={{ width: `${(lvl.into / lvl.need) * 100}%` }} /></div>
        </div>
      </div>
      <div className="stat-grid">
        <div><strong>🔥 {s.streak}</strong><span>day streak</span></div>
        <div><strong>🏆 {s.bestStreak}</strong><span>best streak</span></div>
        <div><strong>🧊 {s.freezes}</strong><span>streak freezes</span></div>
        <div><strong>⭐ {s.xp}</strong><span>total XP</span></div>
        <div><strong>📚 {st.words}</strong><span>words</span></div>
        <div><strong>✅ {st.lessonsDone}</strong><span>lessons</span></div>
      </div>

      <h3>This week</h3>
      <div className="week">
        {week.map((w) => (
          <div key={w.d} className="week-col" title={`${w.d}: ${w.xp} XP`}>
            <div className={`week-bar ${w.xp >= s.goal ? 'hit' : ''}`} style={{ height: `${(w.xp / maxW) * 100}%` }} />
            <span>{'SMTWTFS'[new Date(w.d + 'T12:00').getDay()]}</span>
          </div>
        ))}
      </div>

      <h3>Achievements</h3>
      <div className="achievements">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`ach ${s.achievements[a.id] ? 'got' : ''}`} title={a.desc}>
            <span>{a.icon}</span><strong>{a.name}</strong><small>{a.desc}</small>
          </div>
        ))}
      </div>

      <h3>Settings</h3>
      <label className="setting">Daily goal
        <select value={s.goal} onChange={(e) => update({ goal: Number(e.target.value) })}>
          {[[10, 'Casual · 10 XP'], [20, 'Regular · 20 XP'], [30, 'Serious · 30 XP'], [50, 'Intense · 50 XP']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="setting">Sound effects <input type="checkbox" checked={s.sound} onChange={(e) => update({ sound: e.target.checked })} /></label>
      <label className="setting">Keep window on top <input type="checkbox" checked={s.onTop} onChange={(e) => update({ onTop: e.target.checked })} /></label>
      <label className="setting">Unlock all lessons <input type="checkbox" checked={s.unlockAll} onChange={(e) => update({ unlockAll: e.target.checked })} /></label>
      <div className="row">
        <button className="btn" onClick={exportData}>Back up progress</button>
        <label className="btn">Restore<input type="file" accept=".json" hidden onChange={importData} /></label>
        <button className="btn danger" onClick={() => { if (confirm('Reset ALL progress? This cannot be undone.')) setS({ ...DEFAULT_STATE }); }}>Reset</button>
      </div>
      <p className="muted small">Shortcuts: <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> shows/hides Lulwimi from anywhere · <kbd>1</kbd>–<kbd>4</kbd> pick an answer · <kbd>Enter</kbd> continue · <kbd>Esc</kbd> quit lesson. Closing the window sends it to the tray.</p>
      <p className="muted small">Labels: {Object.values(SRC_LABEL).join(' · ')}</p>
    </div>
  );
}

// ---------------- Result ----------------

function Result({ r, s, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Enter' || e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="result">
      <div className="result-ic">{r.perfect ? '💎' : '🎉'}</div>
      <h2>{r.kind === 'lesson' ? (r.perfect ? 'Flawless lesson!' : 'Lesson complete!') : 'Review done!'}</h2>
      <div className="result-stats">
        <div><strong>+{r.xp}</strong><span>XP</span></div>
        <div><strong>{Math.round(r.accuracy * 100)}%</strong><span>accuracy</span></div>
        <div><strong>{Math.floor(r.seconds / 60)}:{String(r.seconds % 60).padStart(2, '0')}</strong><span>time</span></div>
      </div>
      {r.goalHit && <div className="banner">🎯 Daily goal reached! 🔥 {s.streak}-day streak</div>}
      {r.fresh.map((a) => <div key={a.id} className="banner ach-banner">{a.icon} Achievement unlocked: <strong>{a.name}</strong></div>)}
      <button className="btn primary wide" onClick={onClose}>Continue <kbd>Enter</kbd></button>
    </div>
  );
}

// ---------------- Compact widget ----------------

function Compact({ s, setS, course, due, todayXp, onExpand }) {
  const [flip, setFlip] = useState(false);
  const pool = due.length ? due : Object.keys(s.srs[course.id]).filter((id) => course.items[id]);
  const [pick, setPick] = useState(0);
  const id = pool.length ? pool[pick % pool.length] : null;
  const item = id ? course.items[id] : dailyWord(course);

  function grade(ok) {
    if (id) {
      setS((p) => {
        const n = { ...p, srs: { ...p.srs, [course.id]: { ...p.srs[course.id], [id]: srsUpdate(p.srs[course.id][id], ok) } } };
        return ok ? addXp(n, 1) : n;
      });
    }
    setFlip(false);
    setPick((x) => x + 1);
  }

  return (
    <div className="compact">
      <div className="compact-top">
        <span><Swatch c={course} /> 🔥{s.streak} · {todayXp}/{s.goal} XP {due.length ? `· ${due.length} due` : ''}</span>
        <button className="icon-btn" onClick={onExpand} title="Open full app">⤢</button>
      </div>
      <button className="flash" onClick={() => setFlip(!flip)}>
        <div className="target big">{item.t}</div>
        {flip ? <div>{item.en}</div> : <div className="muted small">{id ? 'Tap to reveal' : 'Word of the day · tap'}</div>}
      </button>
      {flip && id && (
        <div className="row">
          <button className="btn danger" onClick={() => grade(false)}>Again</button>
          <button className="btn primary" onClick={() => grade(true)}>Got it +1</button>
        </div>
      )}
      {!id && <div className="muted small center">Do a lesson to fill your deck</div>}
    </div>
  );
}
