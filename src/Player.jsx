import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import {
  SRC_LABEL, VOICE_LABEL, beep, buzz, checkTyped, lightningExercise, norm, playItem, preloadAudio, retryExercise, shuffle, stressGuide,
} from './lib.js';

export function SrcBadge({ src }) {
  return <span className={`badge src-${src}`} title={src === 'ai' ? 'Not yet checked by a native speaker' : 'From the Peace Corps siSwati materials'}>{SRC_LABEL[src]}</span>;
}

// Windows can't draw flag emoji, so each course gets a two-colour chip instead.
export function Swatch({ c }) {
  return <i className="swatch" style={{ background: `linear-gradient(135deg, ${c.accent} 50%, ${c.accent2} 50%)` }} />;
}

const cousinName = (course) => (course.cousinOf === 'zu' ? 'isiZulu' : 'siSwati');

// Speaker + slow buttons. `big` is the listening-exercise version.
export function Speak({ item, big = false }) {
  const [voice, setVoice] = useState(null);
  if (!item?.audio?.length) return null;
  const play = (slow) => setVoice(playItem(item, { slow }));
  return (
    <span className={`speak ${big ? 'big' : ''}`}>
      <button className="speak-btn" onClick={(e) => { e.stopPropagation(); play(false); }} title="Play (R)" aria-label="Play pronunciation">
        <Icon name="volume" size={big ? 34 : 18} />
      </button>
      <button className="speak-slow" onClick={(e) => { e.stopPropagation(); play(true); }} title="Play slowly" aria-label="Play slowly">Slow</button>
      {big && voice && <span className="voice-label muted small">{VOICE_LABEL[voice.v]}{voice.borrowed ? ' · isiZulu voice' : ''}</span>}
    </span>
  );
}

export default function Player({ course, exercises, title, sound, autoplay = true, onFinish, onQuit }) {
  const [queue, setQueue] = useState(exercises);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('answer'); // answer | right | wrong
  const [picked, setPicked] = useState(null);
  const [typedVal, setTypedVal] = useState('');
  const [typo, setTypo] = useState(null);
  const [hints, setHints] = useState(0);
  const [built, setBuilt] = useState([]); // indexes into tiles
  const [combo, setCombo] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [noListen, setNoListen] = useState(false); // "Can't listen now" for the rest of this session
  const bestCombo = useRef(0);
  const results = useRef({}); // itemId -> first-try correct?
  const retries = useRef({}); // itemId -> retries queued, capped so a hard word can't make the lesson endless
  const started = useRef(Date.now());
  const inputRef = useRef(null);

  const ex = queue[idx];
  const item = ex.item ? course.items[ex.item] : null;
  const listening = Boolean(ex.listen && !noListen && item?.audio.length);

  useEffect(() => {
    preloadAudio([...new Set(exercises.flatMap((e) => (e.item ? [e.item] : e.items || [])))].map((id) => course.items[id]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setStatus(ex.type === 'intro' ? 'right' : 'answer');
    setPicked(null); setTypedVal(''); setTypo(null); setBuilt([]); setHints(0);
    if (ex.type === 'type') setTimeout(() => inputRef.current?.focus(), 30);
    // Hear the word whenever seeing it doesn't give the answer away.
    const hearNow = ex.type === 'intro' || (ex.type === 'mcq' && ex.dir === 't2e');
    if (item && (listening || (autoplay && hearNow))) {
      const t = setTimeout(() => playItem(item), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [idx, noListen]); // eslint-disable-line react-hooks/exhaustive-deps -- appending retries must not reset the screen

  function record(id, ok) {
    if (!(id in results.current)) results.current[id] = ok;
  }

  function bumpCombo(ok) {
    if (!ok) { setCombo(0); return; }
    const c = combo + 1;
    setCombo(c);
    bestCombo.current = Math.max(bestCombo.current, c);
    if (c % 5 === 0) {
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
      if (sound) setTimeout(() => beep('combo'), 160);
    }
  }

  // `remember` = what the spaced-repetition system should store (a hinted answer is shown as right but rescheduled sooner).
  function judge(ok, remember = ok) {
    record(ex.item, remember);
    setStatus(ok ? 'right' : 'wrong');
    bumpCombo(ok && remember);
    if (sound) beep(ok ? 'right' : 'wrong');
    if (!ok) buzz(40);
    // After answering, hear the word you were producing, so sound and spelling get linked.
    if (autoplay && item?.audio.length && !(ex.type === 'mcq' && ex.dir === 't2e')) setTimeout(() => playItem(item), 450);
    if (!ok && (retries.current[ex.item] || 0) < 2) {
      retries.current[ex.item] = (retries.current[ex.item] || 0) + 1;
      const again = retryExercise(course, ex);
      // Bring the mistake back a few screens later, while it's still fresh, rather than at the very end.
      if (again) setQueue((q) => { const n = [...q]; n.splice(Math.min(idx + 3, n.length), 0, again); return n; });
    }
  }

  function next() {
    if (idx + 1 < queue.length) { setIdx(idx + 1); return; }
    const entries = Object.entries(results.current);
    const right = entries.filter(([, ok]) => ok).length;
    if (sound) beep('done');
    onFinish({
      results: results.current,
      accuracy: entries.length ? right / entries.length : 1,
      perfect: entries.length > 0 && right === entries.length,
      seconds: Math.round((Date.now() - started.current) / 1000),
      bestCombo: bestCombo.current,
      missed: entries.filter(([, ok]) => !ok).map(([id]) => id),
      practised: entries.map(([id]) => id),
    });
  }

  function quit() {
    if (idx < 3 || confirmQuit) { onQuit(); return; }
    setConfirmQuit(true);
  }

  // ----- answer handlers -----
  const answersT = item ? [item.t, ...item.ta] : [];

  function pickOption(o) {
    if (status !== 'answer') return;
    setPicked(o);
    judge(norm(o) === norm(ex.answer));
  }

  function submitTyped() {
    if (status !== 'answer' || !typedVal.trim()) return;
    const r = checkTyped(typedVal, answersT);
    if (r === 'typo') setTypo(item.t);
    judge(Boolean(r), Boolean(r) && hints === 0);
  }

  function giveUp() {
    if (status !== 'answer') return;
    judge(false);
  }

  function hint() {
    const word = item.t.replace(/\.\.\./g, '');
    const n = Math.min(hints + 1, Math.max(1, word.length - 1));
    setHints(n);
    setTypedVal(word.slice(0, n));
    inputRef.current?.focus();
  }

  function submitBuilt() {
    if (status !== 'answer' || !built.length) return;
    const s = built.map((i) => ex.tiles[i]).join(' ');
    judge(answersT.some((a) => norm(a) === norm(s)));
  }

  // ----- keyboard -----
  useEffect(() => {
    function onKey(e) {
      if (confirmQuit) {
        if (e.key === 'Escape') setConfirmQuit(false);
        return;
      }
      if (e.key === 'Escape') { quit(); return; }
      if ((e.key === 'r' || e.key === 'R') && e.target.tagName !== 'INPUT' && item) { playItem(item); return; }
      if (status !== 'answer') {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
        return;
      }
      if (ex.type === 'mcq' && /^[1-4]$/.test(e.key)) pickOption(ex.options[Number(e.key) - 1]);
      if (ex.type === 'build' && e.key === 'Enter') submitBuilt();
      if (ex.type === 'build' && e.key === 'Backspace') setBuilt((b) => b.slice(0, -1));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const progress = (idx + (status === 'answer' ? 0 : 1)) / queue.length;

  return (
    <div className="player">
      <div className="player-top">
        <button className="icon-btn" onClick={quit} title="Quit (Esc)" aria-label="Quit"><Icon name="x" /></button>
        <div className="bar"><div style={{ width: `${progress * 100}%` }} /></div>
        <span className={`combo ${combo >= 3 ? 'on' : ''} ${pulse ? 'pulse' : ''}`} title="Answers right in a row">
          <Icon name="flame" size={15} fill={combo >= 3} />{combo}
        </span>
      </div>
      <div className="player-title muted small">{title}</div>

      <div className="stage" key={idx}>
        {ex.type === 'intro' && <Intro item={item} course={course} />}

        {ex.type === 'mcq' && (
          <>
            {listening ? (
              <>
                <p className="prompt-label">What do you hear?</p>
                <div className="listen-box"><Speak item={item} big /></div>
                <button className="link-btn" onClick={() => setNoListen(true)}><Icon name="mute" size={14} /> Can't listen now</button>
              </>
            ) : (
              <>
                <p className="prompt-label">{ex.dir === 't2e' ? 'What does this mean?' : `How do you say this in ${course.name}?`}</p>
                <div className={`prompt ${ex.dir === 't2e' ? 'target' : ''}`}>
                  {ex.dir === 't2e' ? item.t : item.en} {ex.dir === 't2e' && <Speak item={item} />}
                </div>
              </>
            )}
            <div className="options">
              {ex.options.map((o, i) => {
                const cls = status === 'answer' ? '' : norm(o) === norm(ex.answer) ? 'good' : o === picked ? 'bad' : 'dim';
                return (
                  <button key={o + i} className={`option ${cls} ${ex.dir === 'e2t' ? 'target' : ''}`} onClick={() => pickOption(o)}>
                    <kbd>{i + 1}</kbd>{o}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {ex.type === 'type' && (
          <>
            {listening ? (
              <>
                <p className="prompt-label">Type what you hear</p>
                <div className="listen-box"><Speak item={item} big /></div>
                <button className="link-btn" onClick={() => setNoListen(true)}><Icon name="mute" size={14} /> Can't listen now</button>
              </>
            ) : (
              <>
                <p className="prompt-label">Type this in {course.name}</p>
                <div className="prompt">{item.en}</div>
              </>
            )}
            <input
              ref={inputRef}
              className={`type-input ${status}`}
              value={typedVal}
              disabled={status !== 'answer'}
              placeholder={`Type in ${course.name}…`}
              onChange={(e) => setTypedVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && status === 'answer') { e.stopPropagation(); submitTyped(); } }}
              autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false"
            />
            {status === 'answer' && (
              <>
                <button className="btn primary wide" onClick={submitTyped} disabled={!typedVal.trim()}>Check</button>
                <div className="row helper-row">
                  <button className="btn ghost" onClick={hint}><Icon name="bulb" size={15} /> Hint</button>
                  <button className="btn ghost" onClick={giveUp}>I don't know</button>
                </div>
                <p className="muted small center">Have a guess first. Trying to remember, even if you get it wrong, helps the word stick.</p>
              </>
            )}
          </>
        )}

        {ex.type === 'build' && (
          <>
            <p className="prompt-label">Build this in {course.name}</p>
            <div className="prompt">{item.en}</div>
            <div className="build-line">
              {built.map((ti, k) => (
                <button key={k} className="tile target" disabled={status !== 'answer'} onClick={() => setBuilt(built.filter((_, j) => j !== k))}>{ex.tiles[ti]}</button>
              ))}
            </div>
            <div className="bank">
              {ex.tiles.map((w, ti) => (
                <button key={ti} className={`tile target ${built.includes(ti) ? 'used' : ''}`} disabled={built.includes(ti) || status !== 'answer'} onClick={() => setBuilt([...built, ti])}>{w}</button>
              ))}
            </div>
            {status === 'answer' && (
              <>
                <button className="btn primary wide" onClick={submitBuilt} disabled={!built.length}>Check <kbd>Enter</kbd></button>
                <div className="row helper-row"><button className="btn ghost" onClick={giveUp}>I don't know</button></div>
              </>
            )}
          </>
        )}

        {ex.type === 'match' && <Match course={course} ex={ex} sound={sound} autoplay={autoplay} onDone={(misses) => {
          ex.items.forEach((id) => record(id, !misses.has(id)));
          setStatus('right');
          bumpCombo(misses.size === 0);
          if (sound) beep('right');
        }} />}
      </div>

      {status !== 'answer' && (
        <div className={`feedback ${status}`}>
          <div className="feedback-body">
            {ex.type === 'intro' ? (
              <span className="muted">New {item.t.includes(' ') ? 'phrase' : 'word'}. It will come up again in a moment.</span>
            ) : ex.type === 'match' ? (
              <strong>All matched</strong>
            ) : status === 'right' ? (
              <>
                <strong>{typo ? 'Correct, but check the spelling:' : hints ? 'Correct, with a hint' : pickPraise(combo)}</strong>
                {typo && <div className="target">{typo}</div>}
                {!typo && (ex.dir !== 't2e' || listening) && <div className="small"><span className="target">{item.t}</span> = {item.en} <Speak item={item} /></div>}
                {!typo && ex.dir === 't2e' && item.cousin && <div className="small muted">{cousinName(course)}: {item.cousin}</div>}
              </>
            ) : (
              <>
                <strong>The answer is</strong>
                <div className="target">{ex.dir === 't2e' && !listening ? item.en : item.t} <Speak item={item} /></div>
                {(ex.dir !== 't2e' || listening) && <div className="small">{item.en}</div>}
                {item.note && <div className="small muted">{item.note}</div>}
                <div className="small muted">You'll see this one again shortly.</div>
              </>
            )}
          </div>
          <button className="btn primary" onClick={next} autoFocus>Continue <kbd>Enter</kbd></button>
        </div>
      )}

      {confirmQuit && (
        <div className="overlay" onClick={() => setConfirmQuit(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <strong>Leave this lesson?</strong>
            <p className="muted small">You're {Math.round(progress * 100)}% through. Progress in this lesson won't be saved.</p>
            <div className="row">
              <button className="btn primary" onClick={() => setConfirmQuit(false)}>Keep going</button>
              <button className="btn danger" onClick={onQuit}>Quit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const PRAISE = ['Kuhle!', 'Yebo!', 'Correct!', 'Sharp!', 'Great!', 'Nice one!'];
const pickPraise = (combo) => (combo >= 4 && combo % 5 === 4 ? `${combo + 1} in a row!` : PRAISE[Math.floor(Math.random() * PRAISE.length)]);

function Intro({ item, course }) {
  return (
    <div className="intro">
      <p className="prompt-label">New {item.t.includes(' ') ? 'phrase' : 'word'}</p>
      <div className="intro-word target">{item.t}</div>
      <Speak item={item} />
      <div className="say" title="Stress usually falls on the second-to-last syllable">Say it: {stressGuide(item.t)}</div>
      <div className="intro-en">{item.en}</div>
      {item.lit && <div className="muted">Literally: “{item.lit}”</div>}
      {item.note && <div className="note">{item.note}</div>}
      {item.cousin && (
        <div className="cousin"><Icon name="link" size={14} /> {cousinName(course)}: <span className="target">{item.cousin}</span></div>
      )}
      {item.same && <div className="cousin"><Icon name="link" size={14} /> Same word in {cousinName(course)}</div>}
      <SrcBadge src={item.src} />
    </div>
  );
}

function Match({ course, ex, sound, autoplay, onDone }) {
  const left = useMemo(() => shuffle(ex.items), [ex]);
  const right = useMemo(() => shuffle(ex.items), [ex]);
  const [sel, setSel] = useState({ l: null, r: null });
  const [done, setDone] = useState(new Set());
  const [flash, setFlash] = useState(null);
  const misses = useRef(new Set());

  useEffect(() => {
    if (sel.l == null || sel.r == null) return;
    if (sel.l === sel.r) {
      const d = new Set(done); d.add(sel.l);
      setDone(d);
      if (sound && d.size < ex.items.length) beep('right');
      if (d.size === ex.items.length) onDone(misses.current);
    } else {
      misses.current.add(sel.l); misses.current.add(sel.r);
      setFlash([sel.l, sel.r]);
      if (sound) beep('wrong');
      buzz(40);
      setTimeout(() => setFlash(null), 450);
    }
    setSel({ l: null, r: null });
  }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = (side, id) => [
    'option',
    done.has(id) ? 'matched' : '',
    sel[side] === id ? 'selected' : '',
    flash && (side === 'l' ? flash[0] === id : flash[1] === id) ? 'bad shake' : '',
  ].join(' ');

  return (
    <>
      <p className="prompt-label">Tap the matching pairs</p>
      <div className="match">
        <div>{left.map((id) => <button key={id} className={cls('l', id) + ' target'} disabled={done.has(id)} onClick={() => { if (autoplay) playItem(course.items[id]); setSel((s) => ({ ...s, l: id })); }}>{course.items[id].t}</button>)}</div>
        <div>{right.map((id) => <button key={id} className={cls('r', id)} disabled={done.has(id)} onClick={() => setSel((s) => ({ ...s, r: id }))}>{course.items[id].en}</button>)}</div>
      </div>
    </>
  );
}

// ---------------- Lightning round ----------------
// 60 seconds of quick recognition. Short, timed and scored, for when you want a game rather than a lesson.

const ROUND_SECONDS = 60;

export function Lightning({ course, ids, best, sound, onFinish, onQuit }) {
  const [ex, setEx] = useState(() => lightningExercise(course, ids));
  const [left, setLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [picked, setPicked] = useState(null);
  const [round, setRound] = useState(0);
  const tally = useRef({ right: 0, total: 0 });
  const over = left <= 0;
  const item = course.items[ex.item];

  useEffect(() => {
    if (over) return undefined;
    const t = setTimeout(() => setLeft((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [left, over]);

  useEffect(() => {
    if (!over) return;
    if (sound) beep('done');
    onFinish({ score, ...tally.current });
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(o) {
    if (picked || over) return;
    const ok = norm(o) === norm(ex.answer);
    setPicked(o);
    tally.current.total += 1;
    if (ok) {
      tally.current.right += 1;
      // A streak of 3+ is worth double.
      setScore((x) => x + (streak >= 2 ? 2 : 1));
      setStreak((x) => x + 1);
    } else {
      setStreak(0);
      buzz(40);
    }
    if (sound) beep(ok ? 'right' : 'wrong');
    setTimeout(() => { setPicked(null); setEx(lightningExercise(course, ids)); setRound((x) => x + 1); }, ok ? 250 : 900);
  }

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') onQuit();
      if (/^[1-4]$/.test(e.key)) pick(ex.options[Number(e.key) - 1]);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  return (
    <div className="player lightning">
      <div className="player-top">
        <button className="icon-btn" onClick={onQuit} title="Quit (Esc)" aria-label="Quit"><Icon name="x" /></button>
        <div className="bar timer"><div style={{ width: `${(left / ROUND_SECONDS) * 100}%` }} className={left <= 10 ? 'low' : ''} /></div>
        <span className="lt-score"><Icon name="bolt" size={15} fill />{score}</span>
      </div>
      <div className="player-title muted small">Lightning round · best {best} {streak >= 2 && <span className="double">· double points</span>}</div>
      <div className="stage" key={round}>
        <p className="prompt-label">{ex.dir === 't2e' ? 'Meaning?' : `In ${course.name}?`}</p>
        <div className={`prompt ${ex.dir === 't2e' ? 'target' : ''}`}>{ex.dir === 't2e' ? item.t : item.en}</div>
        <div className="options">
          {ex.options.map((o, i) => {
            const cls = !picked ? '' : norm(o) === norm(ex.answer) ? 'good' : o === picked ? 'bad' : 'dim';
            return (
              <button key={o + i} className={`option ${cls} ${ex.dir === 'e2t' ? 'target' : ''}`} onClick={() => pick(o)}>
                <kbd>{i + 1}</kbd>{o}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
