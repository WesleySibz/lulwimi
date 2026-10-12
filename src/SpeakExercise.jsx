import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { playItem, shuffle } from './lib.js';
import { COHORT_SIZE, analyze, curve, loadReference, playBuffer, record, scoreAttempt } from './speech.js';

const COPY = {
  great: { title: 'Great match', body: 'You sound like the native speaker.' },
  close: { title: 'Close', body: 'Most of it is there. Listen again and copy the rhythm and pitch.' },
  retry: { title: 'Not quite', body: 'Play the native clip, then try to copy it exactly, including the melody.' },
};

// Pitch curves, native vs yours, both relative to each speaker's own voice.
function PitchCurves({ native, mine }) {
  const W = 260, H = 70;
  const path = (pts) => {
    let d = '', pen = false;
    pts.forEach((v, i) => {
      if (v === undefined || Number.isNaN(v)) { pen = false; return; }
      const x = (i / (pts.length - 1)) * W;
      const y = H / 2 - Math.max(-8, Math.min(8, v)) * (H / 18);
      d += `${pen ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
      pen = true;
    });
    return d;
  };
  return (
    <div className="pitch">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-label="Pitch of the native speaker and of your recording">
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} className="pitch-mid" />
        <path d={path(native)} className="pitch-native" />
        {mine && <path d={path(mine)} className="pitch-mine" />}
      </svg>
      <div className="pitch-legend small"><span className="lg-native">Native</span>{mine && <span className="lg-mine">You</span>} <span className="muted">· pitch (tone)</span></div>
    </div>
  );
}

export default function SpeakExercise({ course, item, onResult, onSkipAll }) {
  const [phase, setPhase] = useState('ready'); // ready | recording | thinking | done | error
  const [level, setLevel] = useState(0);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [refData, setRefData] = useState(null);
  const mine = useRef(null);
  const rec = useRef(null);
  const cohort = useRef(null);

  useEffect(() => {
    // Target clip plus other words' clips, used to judge the attempt fairly across voices and microphones.
    const others = shuffle(Object.values(course.items).filter((i) => i.id !== item.id && i.audio.length && !i.audio[0].borrowed)).slice(0, COHORT_SIZE);
    cohort.current = Promise.all(others.map((o) => loadReference(`./audio/${o.audio[0].f}`)));
    loadReference(`./audio/${item.audio[0].f}`).then(setRefData).catch(() => {});
    const t = setTimeout(() => playItem(item), 250);
    return () => { clearTimeout(t); rec.current?.stop(); };
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    setErr('');
    try {
      const r = await record({ onLevel: (v) => setLevel(Math.min(1, v * 8)) });
      rec.current = r;
      setPhase('recording');
      const out = await r.finished;
      setLevel(0);
      if (!out.spoke) { setPhase('error'); setErr("I didn't hear anything. Check your microphone and speak a little louder."); return; }
      setPhase('thinking');
      mine.current = out;
      const user = analyze(out.samples, out.sampleRate);
      const [target, others] = await Promise.all([loadReference(`./audio/${item.audio[0].f}`), cohort.current]);
      if (!user || !target.features) { setPhase('error'); setErr('That was too short to check. Say the whole word.'); return; }
      const s = scoreAttempt(user, target.features, others.map((o) => o.features).filter(Boolean));
      setRes({ ...s, mine: curve(user.pitch) });
      setPhase('done');
      onResult(s.level);
    } catch (e) {
      setPhase('error');
      setErr(e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
        ? 'Microphone access is blocked. Allow it for Lulwimi, or skip speaking for now.'
        : 'Could not use the microphone on this device.');
    }
  }

  const c = res && COPY[res.level];
  return (
    <div className="speak-ex">
      <p className="prompt-label">Say it</p>
      <div className="speak-word">
        <span className="target">{item.t}</span>
        <button className="speak-btn" onClick={() => playItem(item)} aria-label="Play native"><Icon name="volume" size={18} /></button>
        <button className="speak-slow" onClick={() => playItem(item, { slow: true })}>Slow</button>
      </div>
      <div className="muted">{item.en}</div>

      {refData?.features && <PitchCurves native={curve(refData.features.pitch)} mine={res?.mine} />}

      <div className="mic-wrap">
        <button
          className={`mic ${phase}`}
          style={{ '--lvl': level }}
          onClick={() => (phase === 'recording' ? rec.current?.stop() : start())}
          disabled={phase === 'thinking'}
          aria-label={phase === 'recording' ? 'Stop recording' : 'Record yourself'}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {phase === 'recording' ? <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" /> : <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3" />}
          </svg>
        </button>
        <div className="muted small">
          {phase === 'ready' && 'Tap and say the word'}
          {phase === 'recording' && 'Listening… stops when you finish'}
          {phase === 'thinking' && 'Comparing with the native speaker…'}
          {phase === 'done' && 'Tap to try again'}
          {phase === 'error' && 'Tap to try again'}
        </div>
      </div>

      {err && <div className="speak-err small">{err}</div>}

      {c && (
        <div className={`speak-result ${res.level}`}>
          <strong>{c.title}</strong>
          <span className="small">{c.body}</span>
          <span className="small muted">Your recording matched this word better than {res.beat} of {res.of} other words.</span>
          <div className="row">
            <button className="btn ghost" onClick={() => playBuffer(mine.current.buffer)}>Hear yourself</button>
            <button className="btn ghost" onClick={() => playItem(item)}>Hear native</button>
          </div>
        </div>
      )}

      <button className="link-btn" onClick={onSkipAll}><Icon name="mute" size={14} /> Can't speak now</button>
    </div>
  );
}
