// Rebuilds src/data/audio.json from the clips in public/audio/.
//   public/audio/ss/<key>.mp3                 Peace Corps native speaker (cut by audio-src/cut.py)
//   public/audio/zu/<key>-thando.mp3 / -themba.mp3   Azure neural voices (scripts/gen-zulu-audio.mjs)
import fs from 'node:fs';

const manifest = { ss: {}, zu: {} };
for (const course of ['ss', 'zu']) {
  const dir = `public/audio/${course}`;
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mp3')).sort()) {
    // Only isiZulu files carry a voice suffix ("Sawubona Themba" is a siSwati phrase, not a voice).
    const m = course === 'zu' ? f.match(/^(.*)-(thando|themba)\.mp3$/) : f.match(/^(.*)\.mp3$/);
    if (!m) continue;
    const [, key, voice = 'pc'] = m;
    (manifest[course][key] ??= []).push({ f: `${course}/${f}`, v: voice });
  }
}
fs.writeFileSync('src/data/audio.json', JSON.stringify(manifest, null, 1) + '\n');
console.log(`audio.json: ${Object.keys(manifest.ss).length} siSwati, ${Object.keys(manifest.zu).length} isiZulu items with audio`);
