import { useEffect, useMemo, useRef, useState } from 'react';
import { SRC_LABEL, beep, checkTyped, norm, retryExercise, shuffle } from './lib.js';

export function SrcBadge({ src }) {
  return <span className={`badge src-${src}`} title={src === 'ai' ? 'Not yet checked by a native speaker' : 'From the Peace Corps siSwati materials'}>{SRC_LABEL[src]}</span>;
}

// Windows can't draw flag emoji, so each course gets a two-colour chip instead.
export function Swatch({ c }) {
  return <i className="swatch" style={{ background: `linear-gradient(135deg, ${c.accent} 50%, ${c.accent2} 50%)` }} />;
}

export default function Player({ course, exercises, title, sound, onFinish, onQuit }) {
  const [queue, setQueue] = useState(exercises);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState('answer'); // answer | right | wrong
  const [picked, setPicked] = useState(null);
  const [typedVal, setTypedVal] = useState('');
  const [typo, setTypo] = useState(null);
  const [built, setBuilt] = useState([]); // indexes into tiles
  const results = useRef({}); // itemId -> first-try correct?
  const retried = useRef(new Set());
  const started = useRef(Date.now());
  const inputRef = useRef(null);

  const ex = queue[idx];
  const item = ex.item ? course.items[ex.item] : null;

  useEffect(() => {
    setStatus(ex.type === 'intro' ? 'right' : 'answer');
    setPicked(null); setTypedVal(''); setTypo(null); setBuilt([]);
    if (ex.type === 'type') setTimeout(() => inputRef.current?.focus(), 30);
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps -- appending retries must not reset the screen

  function record(id, ok) {
    if (!(id in results.current)) results.current[id] = ok;
  }

  function judge(ok, itemIds = [ex.item]) {
    itemIds.forEach((id) => record(id, ok));
    setStatus(ok ? 'right' : 'wrong');
    if (sound) beep(ok ? 'right' : 'wrong');
    if (!ok && !retried.current.has(idx)) {
      retried.current.add(idx);
      const again = retryExercise(course, ex);
      if (again) setQueue((q) => [...q, again]);
    }
  }

  function next() {
    if (idx + 1 < queue.length) { setIdx(idx + 1); return; }
    const vals = Object.values(results.current);
    const right = vals.filter(Boolean).length;
    if (sound) beep('done');
    onFinish({
      results: results.current,
      accuracy: vals.length ? right / vals.length : 1,
      perfect: vals.length > 0 && right === vals.length,
      seconds: Math.round((Date.now() - started.current) / 1000),
    });
  }

  // ----- answer handlers -----
  const answersT = item ? [item.t, ...item.ta] : [];
  const answersE = item ? [item.en, ...item.alt] : [];

  function pickOption(o) {
    if (status !== 'answer') return;
    setPicked(o);
    judge(norm(o) === norm(ex.answer));
  }

  function submitTyped() {
    if (status !== 'answer' || !typedVal.trim()) return;
    const r = checkTyped(typedVal, answersT);
    if (r === 'typo') setTypo(item.t);
    judge(Boolean(r));
  }

  function submitBuilt() {
    if (status !== 'answer' || !built.length) return;
    const s = built.map((i) => ex.tiles[i]).join(' ');
    judge(answersT.some((a) => norm(a) === norm(s)));
  }

  // ----- keyboard -----
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') { onQuit(); return; }
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
        <button className="icon-btn" onClick={onQuit} title="Quit (Esc)">✕</button>
        <div className="bar"><div style={{ width: `${progress * 100}%` }} /></div>
        <span className="muted small">{title}</span>
      </div>

      <div className="stage" key={idx}>
        {ex.type === 'intro' && <Intro item={item} course={course} />}

        {ex.type === 'mcq' && (
          <>
            <p className="prompt-label">{ex.dir === 't2e' ? 'What does this mean?' : `How do you say this in ${course.name}?`}</p>
            <div className={`prompt ${ex.dir === 't2e' ? 'target' : ''}`}>{ex.dir === 't2e' ? item.t : item.en}</div>
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
            <p className="prompt-label">Type this in {course.name}</p>
            <div className="prompt">{item.en}</div>
            <input
              ref={inputRef}
              className={`type-input ${status}`}
              value={typedVal}
              disabled={status !== 'answer'}
              placeholder={`Type in ${course.name}…`}
              onChange={(e) => setTypedVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && status === 'answer') { e.stopPropagation(); submitTyped(); } }}
              autoComplete="off" spellCheck="false"
            />
            {status === 'answer' && <button className="btn primary wide" onClick={submitTyped} disabled={!typedVal.trim()}>Check</button>}
            {status === 'answer' && <p className="muted small center">Not sure? Type your best guess. Getting it wrong helps you remember.</p>}
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
            {status === 'answer' && <button className="btn primary wide" onClick={submitBuilt} disabled={!built.length}>Check <kbd>Enter</kbd></button>}
          </>
        )}

        {ex.type === 'match' && <Match course={course} ex={ex} sound={sound} onDone={(misses) => {
          ex.items.forEach((id) => record(id, !misses.has(id)));
          setStatus('right');
          if (sound) beep('right');
        }} />}
      </div>

      {status !== 'answer' && (
        <div className={`feedback ${status}`}>
          {ex.type === 'intro' ? (
            <span>New word{item.t.includes(' ') ? ' / phrase' : ''}</span>
          ) : ex.type === 'match' ? (
            <span>All matched!</span>
          ) : status === 'right' ? (
            <div>
              <strong>{typo ? 'Correct, but watch the spelling:' : pickPraise()}</strong>
              {typo && <div className="target">{typo}</div>}
              {!typo && ex.dir !== 't2e' && <div className="target small">{item.t} = {item.en}</div>}
            </div>
          ) : (
            <div>
              <strong>Correct answer:</strong>
              <div className="target">{ex.dir === 't2e' ? item.en : item.t}</div>
              {ex.dir === 't2e' ? null : <div className="small">{item.en}</div>}
              {item.note && <div className="small muted">{item.note}</div>}
            </div>
          )}
          <button className="btn primary" onClick={next}>Continue <kbd>Enter</kbd></button>
        </div>
      )}
    </div>
  );
}

const PRAISE = ['Kuhle!', 'Yebo!', 'Correct!', 'Sharp!', 'Great!', 'Nice one!'];
const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

function Intro({ item, course }) {
  return (
    <div className="intro">
      <p className="prompt-label">New {item.t.includes(' ') ? 'phrase' : 'word'}</p>
      <div className="intro-word target">{item.t}</div>
      <div className="intro-en">{item.en}</div>
      {item.lit && <div className="muted">Literally: “{item.lit}”</div>}
      {item.note && <div className="note">{item.note}</div>}
      {item.cousin && (
        <div className="cousin">
          {course.cousinOf === 'zu' ? 'isiZulu' : 'siSwati'}: <span className="target">{item.cousin}</span>
        </div>
      )}
      {item.same && <div className="cousin">Same word in {course.cousinOf === 'zu' ? 'isiZulu' : 'siSwati'} ✨</div>}
      <SrcBadge src={item.src} />
    </div>
  );
}

function Match({ course, ex, sound, onDone }) {
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
      if (d.size === ex.items.length) onDone(misses.current);
    } else {
      misses.current.add(sel.l); misses.current.add(sel.r);
      setFlash([sel.l, sel.r]);
      if (sound) beep('wrong');
      setTimeout(() => setFlash(null), 450);
    }
    setSel({ l: null, r: null });
  }, [sel]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = (side, id) => [
    'option',
    done.has(id) ? 'matched' : '',
    sel[side] === id ? 'selected' : '',
    flash && flash.includes(id) && (side === 'l' ? flash[0] === id : flash[1] === id) ? 'bad shake' : '',
  ].join(' ');

  return (
    <>
      <p className="prompt-label">Tap the matching pairs</p>
      <div className="match">
        <div>{left.map((id) => <button key={id} className={cls('l', id) + ' target'} disabled={done.has(id)} onClick={() => setSel((s) => ({ ...s, l: id }))}>{course.items[id].t}</button>)}</div>
        <div>{right.map((id) => <button key={id} className={cls('r', id)} disabled={done.has(id)} onClick={() => setSel((s) => ({ ...s, r: id }))}>{course.items[id].en}</button>)}</div>
      </div>
    </>
  );
}
