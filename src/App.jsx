import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon.jsx';
import Player, { Lightning, Speak, SrcBadge, Swatch } from './Player.jsx';
import {
  ACHIEVEMENTS, COURSES, DEFAULT_STATE, QUEST_XP, SRC_LABEL, addXp, bumpDaily, claimQuests, dailyCounters, dailyCulture,
  dailyProverb, dailyWord, dayNumber, dueItems, dueOn, lessonExercises, levelInfo, loadState, newAchievements,
  refreshStreak, reviewExercises, saveState, setOnTop, setWindowMode, srsUpdate, stats, tauri, today, todaysQuests,
  weakestItems,
} from './lib.js';

const isDesktop = Boolean(tauri);
const MIN_LIGHTNING_WORDS = 6;

export default function App() {
  const [s, setS] = useState(() => refreshStreak(loadState()));
  const [tab, setTab] = useState('learn');
  const [session, setSession] = useState(null); // { kind, lesson?, exercises?, title }
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
  const learned = useMemo(() => Object.keys(s.srs[course.id]).filter((id) => course.items[id]), [course, s.srs]);
  const todayXp = s.xpByDay[today()] || 0;
  const progress = s.progress[course.id];
  const nextLesson = course.lessonList.find((l) => !progress[l.id]) || null;

  function isUnlocked(lesson) {
    if (s.unlockAll || lesson.order === 0) return true;
    return Boolean(progress[course.lessonList[lesson.order - 1].id]) || Boolean(progress[lesson.id]);
  }

  function startLesson(lesson) {
    setSession({ kind: 'lesson', lesson, exercises: lessonExercises(course, lesson, s.srs[course.id]), title: lesson.title });
  }

  function startReview() {
    let ids = due.slice(0, 12);
    if (ids.length < 5) ids = [...new Set([...ids, ...weakestItems(course, s.srs[course.id], 10)])].slice(0, 10);
    if (!ids.length) return;
    setSession({ kind: 'review', exercises: reviewExercises(course, ids), title: due.length ? 'Review' : 'Practice' });
  }

  function startLightning() {
    if (learned.length < MIN_LIGHTNING_WORDS) return;
    setSession({ kind: 'lightning', title: 'Lightning round' });
  }

  function finish(r) {
    const cid = course.id;
    const before = s;
    let n = { ...s };
    let xp;

    if (session.kind === 'lightning') {
      xp = Math.max(2, Math.ceil(r.score / 2));
      n.lightningBest = Math.max(s.lightningBest || 0, r.score);
      n = bumpDaily(n, { lightning: r.score });
    } else {
      n.srs = { ...s.srs, [cid]: { ...s.srs[cid] } };
      n.progress = { ...s.progress, [cid]: { ...s.progress[cid] } };
      for (const [id, ok] of Object.entries(r.results)) n.srs[cid][id] = srsUpdate(n.srs[cid][id], ok);
      const comboBonus = Math.min(5, Math.floor(r.bestCombo / 5));
      if (session.kind === 'lesson') {
        const prev = n.progress[cid][session.lesson.id];
        n.progress[cid][session.lesson.id] = { done: (prev?.done || 0) + 1, best: Math.max(prev?.best || 0, r.accuracy) };
        xp = 10 + (r.perfect ? 5 : 0) + comboBonus;
      } else {
        xp = Math.max(5, Object.values(r.results).filter(Boolean).length) + comboBonus;
      }
      if (r.perfect) n.perfects += 1;
      n.bestCombo = Math.max(s.bestCombo || 0, r.bestCombo);
      n = bumpDaily(n, {
        lessons: session.kind === 'lesson' ? 1 : 0,
        reviewed: session.kind === 'review' ? r.practised.length : 0,
        combo: r.bestCombo,
        perfect: r.perfect ? 1 : 0,
      });
    }

    n = addXp(n, xp);
    const claimed = claimQuests(n);
    n = claimed.s;
    const fresh = newAchievements(n);
    if (fresh.length) n.achievements = { ...n.achievements, ...Object.fromEntries(fresh.map((a) => [a.id, today()])) };
    setS(n);
    const beforeToday = before.xpByDay[today()] || 0;
    const afterToday = n.xpByDay[today()] || 0;
    setResult({
      ...r, xp, fresh, kind: session.kind, quests: claimed.done,
      goalHit: beforeToday < n.goal && afterToday >= n.goal,
      levelUp: levelInfo(n.xp).lvl > levelInfo(before.xp).lvl ? levelInfo(n.xp).lvl : 0,
      newBest: session.kind === 'lightning' && r.score > (before.lightningBest || 0) && r.score > 0,
    });
    setSession(null);
  }

  const update = (patch) => setS((p) => ({ ...p, ...patch }));

  function readProverb() {
    const key = `${course.id}:${today()}`;
    if (s.proverbsSeen[key]) return;
    setS((p) => {
      let n = { ...p, proverbsSeen: { ...p.proverbsSeen, [key]: true } };
      n = claimQuests(bumpDaily(n, { proverb: 1 })).s;
      const fresh = newAchievements(n);
      if (fresh.length) n.achievements = { ...n.achievements, ...Object.fromEntries(fresh.map((a) => [a.id, today()])) };
      return n;
    });
  }

  if (compact) {
    return <Compact s={s} setS={setS} course={course} due={due} todayXp={todayXp} onExpand={() => setCompact(false)} />;
  }

  if (session?.kind === 'lightning') {
    return <Lightning course={course} ids={learned} best={s.lightningBest || 0} sound={s.sound} onFinish={finish} onQuit={() => setSession(null)} />;
  }

  if (session) {
    return <Player course={course} exercises={session.exercises} title={session.title} sound={s.sound} autoplay={s.autoplay} onFinish={finish} onQuit={() => setSession(null)} />;
  }

  if (result) return <Result r={result} s={s} course={course} onClose={() => setResult(null)} />;

  const TABS = [['learn', 'home', 'Learn'], ['review', 'review', 'Review'], ['wisdom', 'quote', 'Wisdom'], ['guide', 'book', 'Guide'], ['me', 'user', 'Me']];

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
          <span className={`stat-pill ${s.lastActive === today() ? 'lit' : ''}`} title={s.lastActive === today() ? 'Day streak (done today)' : 'Day streak: practise today to keep it'}>
            <Icon name="flame" size={16} fill={s.lastActive === today()} />{s.streak}
          </span>
          <span className="stat-pill" title="Total XP"><Icon name="bolt" size={16} />{s.xp}</span>
          {isDesktop && <button className="icon-btn" title="Mini widget" aria-label="Mini widget" onClick={() => setCompact(true)}><Icon name="shrink" size={16} /></button>}
        </div>
      </header>

      <main className="content">
        {tab === 'learn' && (
          <Learn {...{ s, course, due, learned, todayXp, nextLesson, progress, isUnlocked, startLesson, startReview, startLightning, setTab, readProverb }} />
        )}
        {tab === 'review' && <Review {...{ s, course, due, learned, startReview, startLightning }} />}
        {tab === 'wisdom' && <Wisdom course={course} />}
        {tab === 'guide' && <Guide course={course} />}
        {tab === 'me' && <Me {...{ s, setS, update }} />}
      </main>

      <nav className="tabs">
        {TABS.map(([id, ic, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            <Icon name={ic} size={20} />{label}
            {id === 'review' && due.length > 0 && <i className="dot">{due.length}</i>}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ---------------- Learn (home) ----------------

function GoalRing({ value, goal, size = 58 }) {
  const pct = Math.min(1, value / goal);
  const r = size / 2 - 5, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={`ring ${pct >= 1 ? 'full' : ''}`}>
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      {pct >= 1
        ? <path d={`M${size / 2 - 8} ${size / 2}l5 5 10-11`} className="ring-check" />
        : <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle">{value}</text>}
    </svg>
  );
}

function WeekDots({ s }) {
  const days = [...Array(7)].map((_, i) => {
    const d = today(new Date(Date.now() - (6 - i) * 86400000));
    const xp = s.xpByDay[d] || 0;
    return { d, xp, isToday: i === 6 };
  });
  return (
    <div className="week-dots">
      {days.map((w) => (
        <div key={w.d} className={`wd ${w.xp > 0 ? 'active' : ''} ${w.xp >= s.goal ? 'goal' : ''} ${w.isToday ? 'today' : ''}`} title={`${w.d}: ${w.xp} XP`}>
          <i>{w.xp > 0 && <Icon name="check" size={12} />}</i>
          <span>{'SMTWTFS'[new Date(w.d + 'T12:00').getDay()]}</span>
        </div>
      ))}
    </div>
  );
}

function Quests({ s }) {
  const d = dailyCounters(s);
  return (
    <div className="tile-card span2 quests">
      <div className="tile-head"><Icon name="target" size={16} /> <strong>Daily quests</strong><span className="muted small">+{QUEST_XP} XP each</span></div>
      {todaysQuests().map((q) => {
        const v = Math.min(q.target, d[q.key] || 0);
        const done = Boolean(d.claimed[q.id]);
        return (
          <div key={q.id} className={`quest ${done ? 'done' : ''}`}>
            <span className="quest-check">{done && <Icon name="check" size={13} />}</span>
            <span className="quest-text small">{q.text}</span>
            {!done && q.target > 1 && <span className="muted small">{v}/{q.target}</span>}
            <div className="quest-bar"><div style={{ width: `${(v / q.target) * 100}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

function Learn({ s, course, due, learned, todayXp, nextLesson, progress, isUnlocked, startLesson, startReview, startLightning, setTab, readProverb }) {
  const proverb = dailyProverb(course);
  const word = dailyWord(course);
  const seenToday = Boolean(s.proverbsSeen[`${course.id}:${today()}`]);
  const [reveal, setReveal] = useState(seenToday);
  const doneCount = Object.keys(progress).length;
  const nextUnit = nextLesson ? course.units.find((u) => u.id === nextLesson.unitId) : null;
  const newWords = nextLesson ? nextLesson.itemIds.filter((id) => !s.srs[course.id][id]).length : 0;
  const [openUnit, setOpenUnit] = useState(nextUnit?.id ?? null);

  return (
    <>
      <section className="bento">
        <div className="tile-card span2 hero">
          <div className="hero-main">
            {nextLesson ? (
              <>
                <div className="eyebrow">Unit {course.units.indexOf(nextUnit) + 1} · {nextUnit.title}</div>
                <h2>{nextLesson.title}</h2>
                <div className="muted small">
                  {newWords ? `${newWords} new ${newWords === 1 ? 'word' : 'words'}` : 'Practice'} · about {Math.max(2, Math.round(nextLesson.itemIds.length * 0.45))} min
                </div>
                <button className="btn primary" onClick={() => startLesson(nextLesson)}><Icon name="play" size={14} fill /> {doneCount ? 'Continue' : 'Start learning'}</button>
              </>
            ) : (
              <>
                <div className="eyebrow">All {course.lessonList.length} lessons done</div>
                <h2>Course complete</h2>
                <div className="muted small">Keep your words strong with reviews and lightning rounds.</div>
                <button className="btn primary" onClick={startReview}>Keep practising</button>
              </>
            )}
          </div>
          <div className="goal">
            <GoalRing value={todayXp} goal={s.goal} />
            <div className="muted small">{todayXp >= s.goal ? 'Goal met' : `${todayXp}/${s.goal} XP`}</div>
          </div>
          <div className="hero-foot">
            <WeekDots s={s} />
            <div className="streak-note small">
              <Icon name="flame" size={14} fill={s.lastActive === today()} /> {s.streak}-day streak
              {s.freezes > 0 && <span className="muted"> · <Icon name="snow" size={12} /> {s.freezes} {s.freezes === 1 ? "freeze" : "freezes"}</span>}
            </div>
          </div>
        </div>

        <Quests s={s} />

        <button className="tile-card action" onClick={() => (due.length ? startReview() : setTab('review'))}>
          <span className="tile-ic"><Icon name="review" /></span>
          <strong>{due.length ? `${due.length} to review` : 'All caught up'}</strong>
          <span className="muted small">{due.length ? 'Before you forget them' : 'Nothing due today'}</span>
        </button>

        <button className="tile-card action" disabled={learned.length < MIN_LIGHTNING_WORDS} onClick={startLightning}>
          <span className="tile-ic bolt"><Icon name="bolt" /></span>
          <strong>Lightning round</strong>
          <span className="muted small">{learned.length < MIN_LIGHTNING_WORDS ? `Learn ${MIN_LIGHTNING_WORDS - learned.length} more words` : `60 seconds · best ${s.lightningBest || 0}`}</span>
        </button>

        <div className="tile-card span2 wotd">
          <div className="eyebrow">Word of the day</div>
          <div className="wotd-row">
            <strong className="target big">{word.t}</strong>
            <Speak item={word} />
            <span>{word.en}</span>
          </div>
        </div>

        <button className="tile-card span2 wisdom-card" onClick={() => { setReveal(true); readProverb(); }}>
          <div className="eyebrow"><Icon name="quote" size={13} /> Wisdom of the day</div>
          <div className="target proverb">{proverb.t}</div>
          <div className="small">“{proverb.lit}”</div>
          {reveal ? (
            <>
              <div className="meaning">{proverb.meaning}</div>
              <div className="reflect">{proverb.reflect}</div>
            </>
          ) : <div className="muted small">Guess what it means, then tap to see.</div>}
        </button>

        <div className="tile-card span2 culture">
          <div className="eyebrow">Culture tip</div>
          <div className="small">{dailyCulture(course)}</div>
        </div>
      </section>

      <h3>Your path</h3>
      <section className="path">
        {course.units.map((u, ui) => {
          const done = u.lessons.filter((l) => progress[l.id]).length;
          const complete = done === u.lessons.length;
          const isOpen = openUnit === u.id;
          const reachable = u.lessons.some(isUnlocked);
          return (
            <div className={`unit ${isOpen ? 'open' : ''} ${complete ? 'complete' : ''} ${reachable ? '' : 'far'}`} key={u.id}>
              <button className="unit-head" onClick={() => setOpenUnit(isOpen ? null : u.id)} aria-expanded={isOpen}>
                <span className="unit-num">{complete ? <Icon name="check" size={16} /> : ui + 1}</span>
                <span className="unit-text">
                  <span className="unit-title">{u.title}</span>
                  <span className="muted small">{u.desc}</span>
                  <span className="unit-bar"><i style={{ width: `${(done / u.lessons.length) * 100}%` }} /></span>
                </span>
                <span className="muted small">{done}/{u.lessons.length}</span>
                <Icon name="chevron" size={16} className="chev" />
              </button>
              {isOpen && (
                <div className="unit-body">
                  <div className="nodes">
                    {u.lessons.map((l) => {
                      const open = isUnlocked(l);
                      const p = progress[l.id];
                      const current = nextLesson?.id === l.id;
                      return (
                        <button
                          key={l.id}
                          className={`node ${p ? 'done' : ''} ${open ? '' : 'locked'} ${current ? 'current' : ''}`}
                          disabled={!open}
                          title={open ? l.title : 'Finish the previous lesson first'}
                          onClick={() => startLesson(l)}
                        >
                          <span className="node-dot">
                            <Icon name={p ? (p.best >= 0.999 ? 'star' : 'check') : open ? 'play' : 'lock'} size={13} fill={p?.best >= 0.999 || (!p && open)} />
                          </span>
                          <span className="node-label">{l.title}</span>
                          <span className="node-meta muted small">{p ? `${Math.round(p.best * 100)}%` : current ? 'Next' : `${l.itemIds.length} words`}</span>
                        </button>
                      );
                    })}
                  </div>
                  <details className="unit-tip">
                    <summary><Icon name="bulb" size={14} /> Grammar & tips</summary>
                    <p>{u.tip}</p>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}

// ---------------- Review ----------------

function Review({ s, course, due, learned, startReview, startLightning }) {
  const cards = s.srs[course.id];
  const boxes = [0, 0, 0, 0, 0, 0, 0];
  learned.forEach((id) => { boxes[cards[id].box] += 1; });
  const names = ['New', 'Learning', 'Learning', 'Familiar', 'Familiar', 'Strong', 'Mastered'];
  const max = Math.max(1, ...boxes);
  const tomorrow = dueOn(course, cards, dayNumber() + 1);
  const trouble = learned
    .filter((id) => cards[id].seen >= 2 && cards[id].right / cards[id].seen < 0.75)
    .sort((a, b) => cards[a].right / cards[a].seen - cards[b].right / cards[b].seen)
    .slice(0, 8);

  return (
    <div className="page">
      <h2>Review</h2>
      <p className="muted">Words come back just before you'd forget them: after 1 day, then 3, 7, 16, 35 and 90 days. A mistake sends a word back a few steps.</p>
      <button className="btn primary wide" disabled={!learned.length} onClick={startReview}>
        {due.length ? `Review ${Math.min(12, due.length)} due words` : learned.length ? 'Practise your weakest words' : 'Finish a lesson first'}
      </button>
      <button className="btn wide" disabled={learned.length < MIN_LIGHTNING_WORDS} onClick={startLightning}>
        <Icon name="bolt" size={15} /> Lightning round · best {s.lightningBest || 0}
      </button>
      <div className="forecast small muted">
        <span>Due now: <strong>{due.length}</strong></span>
        <span>Tomorrow: <strong>{tomorrow}</strong></span>
      </div>

      <h3>Memory strength · {learned.length} words</h3>
      <div className="boxes">
        {boxes.map((n, i) => (
          <div key={i} className="box-col" title={`${names[i]}: ${n}`}>
            <div className="box-bar" style={{ height: `${(n / max) * 100}%`, opacity: 0.45 + i * 0.09 }} />
            <span>{n}</span>
          </div>
        ))}
      </div>
      <div className="box-legend muted small"><span>Fragile</span><span>Mastered</span></div>

      {trouble.length > 0 && (
        <>
          <h3>Tricky words</h3>
          <div className="dict">
            {trouble.map((id) => (
              <div key={id} className="dict-row">
                <span className="target">{course.items[id].t}</span>
                <span className="small">{course.items[id].en}</span>
                <span className="muted small">{Math.round((cards[id].right / cards[id].seen) * 100)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Wisdom ----------------

function Wisdom({ course }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="page">
      <h2>Wisdom</h2>
      <p className="muted">Proverbs (<span className="target">{course.id === 'ss' ? 'tisho' : 'izaga'}</span>) carry a people's theology and poetry in a few words. Read one, guess its meaning, then sit with the question.</p>
      <h3>Proverbs</h3>
      {course.proverbs.map((p, i) => (
        <button key={p.t} className={`wisdom-item ${open === i ? 'open' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
          <div className="target">{p.t}</div>
          <div className="small">“{p.lit}”</div>
          {open === i && (
            <>
              <div className="meaning">{p.meaning}</div>
              <div className="reflect">{p.reflect}</div>
              <SrcBadge src={p.src} />
            </>
          )}
        </button>
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
      <h2>{course.name} guide</h2>
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
            <span className="target">{i.t} <Speak item={i} /></span>
            <span className="small">{i.en}{i.cousin && <span className="muted"> · {course.cousinOf}: {i.cousin}</span>}</span>
            <SrcBadge src={i.src} />
          </div>
        ))}
        {!items.length && <p className="muted small">No matches.</p>}
      </div>

      <h3>Where this content comes from</h3>
      <ul className="small">
        {Object.entries(counts).map(([k, n]) => <li key={k}><SrcBadge src={k} /> {n} entries</li>)}
        <li><Icon name="volume" size={13} /> {Object.values(course.items).filter((i) => i.audio.length).length} entries have audio
          {course.id === 'ss' ? ' (Peace Corps native speakers; a few borrow the isiZulu voice where the word is identical)' : ' (Microsoft Azure neural voices Thando and Themba)'}</li>
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
  const [confirmReset, setConfirmReset] = useState(false);
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
      try { setS(refreshStreak({ ...DEFAULT_STATE, ...JSON.parse(t) })); alert('Progress restored.'); } catch { alert('That file is not a Lulwimi backup.'); }
    });
  }

  const STATS = [
    ['flame', s.streak, 'day streak'], ['trophy', s.bestStreak, 'best streak'], ['snow', s.freezes, 'streak freezes'],
    ['bolt', s.xp, 'total XP'], ['book', st.words, 'words'], ['star', s.bestCombo || 0, 'best combo'],
  ];

  return (
    <div className="page">
      <h2>Your journey</h2>
      <div className="level">
        <div className="level-badge">{lvl.lvl}</div>
        <div style={{ flex: 1 }}>
          <div className="small">Level {lvl.lvl} · {lvl.need - lvl.into} XP to level {lvl.lvl + 1}</div>
          <div className="bar"><div style={{ width: `${(lvl.into / lvl.need) * 100}%` }} /></div>
        </div>
      </div>
      <div className="stat-grid">
        {STATS.map(([ic, v, label]) => (
          <div key={label}><strong><Icon name={ic} size={15} /> {v}</strong><span>{label}</span></div>
        ))}
      </div>

      <h3>This week</h3>
      <div className="week">
        {week.map((w) => (
          <div key={w.d} className="week-col" title={`${w.d}: ${w.xp} XP`}>
            <small>{w.xp || ''}</small>
            <div className={`week-bar ${w.xp >= s.goal ? 'hit' : ''}`} style={{ height: `${(w.xp / maxW) * 100}%` }} />
            <span>{'SMTWTFS'[new Date(w.d + 'T12:00').getDay()]}</span>
          </div>
        ))}
      </div>

      <h3>Achievements · {Object.keys(s.achievements).filter((k) => ACHIEVEMENTS.some((a) => a.id === k)).length}/{ACHIEVEMENTS.length}</h3>
      <div className="achievements">
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`ach ${s.achievements[a.id] ? 'got' : ''}`} title={a.desc}>
            <span className="ach-ic"><Icon name={a.icon} size={18} /></span><strong>{a.name}</strong><small>{a.desc}</small>
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
      <label className="setting">Play pronunciation automatically <input type="checkbox" checked={s.autoplay} onChange={(e) => update({ autoplay: e.target.checked })} /></label>
      {isDesktop && <label className="setting">Keep window on top <input type="checkbox" checked={s.onTop} onChange={(e) => update({ onTop: e.target.checked })} /></label>}
      <label className="setting">Unlock all lessons <input type="checkbox" checked={s.unlockAll} onChange={(e) => update({ unlockAll: e.target.checked })} /></label>
      <div className="row">
        <button className="btn" onClick={exportData}>Back up progress</button>
        <label className="btn">Restore<input type="file" accept=".json,application/json" hidden onChange={importData} /></label>
      </div>
      <p className="muted small">Your progress is saved on this device only. Use Back up and Restore to move it between your laptop and phone.</p>
      {confirmReset ? (
        <div className="row">
          <button className="btn" onClick={() => setConfirmReset(false)}>Cancel</button>
          <button className="btn danger" onClick={() => { setS({ ...DEFAULT_STATE }); setConfirmReset(false); }}>Yes, erase everything</button>
        </div>
      ) : (
        <button className="btn danger wide" onClick={() => setConfirmReset(true)}>Reset all progress</button>
      )}
      {isDesktop && <p className="muted small">Shortcuts: <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> shows or hides Lulwimi from anywhere · <kbd>1</kbd>–<kbd>4</kbd> pick an answer · <kbd>Enter</kbd> continue · <kbd>Esc</kbd> quit. Closing the window sends it to the tray.</p>}
      <p className="muted small">Labels: {Object.values(SRC_LABEL).join(' · ')}</p>
    </div>
  );
}

// ---------------- Result ----------------

function Confetti() {
  const colors = ['var(--accent)', 'var(--accent2)', 'var(--good)', '#fff'];
  return (
    <div className="confetti" aria-hidden="true">
      {[...Array(28)].map((_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, background: colors[i % 4], animationDelay: `${(i % 7) * 0.06}s`, '--dx': `${((i * 53) % 60) - 30}px` }} />
      ))}
    </div>
  );
}

function Result({ r, s, course, onClose }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Enter' || e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const lightning = r.kind === 'lightning';
  const great = lightning ? r.newBest : r.perfect;
  const headline = lightning
    ? (r.newBest ? 'New best!' : 'Time!')
    : r.kind === 'lesson' ? (r.perfect ? 'Flawless lesson' : 'Lesson complete') : 'Review done';
  const sub = lightning
    ? `${r.right} of ${r.total} right`
    : r.perfect ? 'Not a single mistake.' : r.accuracy >= 0.8 ? 'Strong work. The tricky ones will come back in review.' : 'Mistakes are how memory is built. These words will come back soon.';

  return (
    <div className="result">
      {(great || r.levelUp || r.goalHit) && <Confetti />}
      <div className={`result-badge ${great ? 'gold' : ''}`}><Icon name={lightning ? 'bolt' : r.perfect ? 'star' : 'check'} size={40} fill={lightning || r.perfect} /></div>
      <h2>{headline}</h2>
      <p className="muted small">{sub}</p>
      <div className="result-stats">
        <div><strong>+{r.xp}</strong><span>XP</span></div>
        {lightning ? (
          <div><strong>{r.score}</strong><span>score</span></div>
        ) : (
          <>
            <div><strong>{Math.round(r.accuracy * 100)}%</strong><span>accuracy</span></div>
            <div><strong>{r.bestCombo}</strong><span>best combo</span></div>
          </>
        )}
        <div><strong>{lightning ? '1:00' : `${Math.floor(r.seconds / 60)}:${String(r.seconds % 60).padStart(2, '0')}`}</strong><span>time</span></div>
      </div>
      <div className="banners">
        {r.levelUp > 0 && <div className="banner"><Icon name="trophy" size={16} /> Level {r.levelUp} reached</div>}
        {r.goalHit && <div className="banner"><Icon name="target" size={16} /> Daily goal reached · {s.streak}-day streak</div>}
        {r.quests.map((q) => <div key={q.id} className="banner"><Icon name="check" size={16} /> Quest done: {q.text} · +{QUEST_XP} XP</div>)}
        {r.fresh.map((a) => <div key={a.id} className="banner ach-banner"><Icon name={a.icon} size={16} /> Achievement: <strong>{a.name}</strong></div>)}
      </div>
      {!lightning && r.missed.length > 0 && (
        <div className="recap">
          <div className="eyebrow">Words to watch</div>
          {r.missed.slice(0, 5).map((id) => (
            <div key={id} className="recap-row"><span className="target">{course.items[id].t}</span><span className="small">{course.items[id].en}</span></div>
          ))}
        </div>
      )}
      <button className="btn primary wide" onClick={onClose} autoFocus>Continue <kbd>Enter</kbd></button>
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
        <span className="compact-stats"><Swatch c={course} /> <Icon name="flame" size={14} />{s.streak} · {todayXp}/{s.goal} XP {due.length ? `· ${due.length} due` : ''}</span>
        <button className="icon-btn" onClick={onExpand} title="Open full app" aria-label="Open full app"><Icon name="expand" size={16} /></button>
      </div>
      <button className="flash" onClick={() => setFlip(!flip)}>
        <div className="target big">{item.t} <Speak item={item} /></div>
        {flip ? <div>{item.en}</div> : <div className="muted small">{id ? 'Say the meaning, then tap' : 'Word of the day · tap'}</div>}
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
