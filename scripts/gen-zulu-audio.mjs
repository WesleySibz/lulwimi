// Generates isiZulu audio for every isiZulu item with Microsoft Azure's neural voices (Thando, Themba).
// Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in .env.local. Skips files that already exist,
// and paces requests for the free F0 tier (20 requests per minute).
import fs from 'node:fs';
import { COURSES, audioKey } from '../src/lib.js';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => l.split('=').map((x) => x.trim())),
);
const { AZURE_SPEECH_KEY: KEY, AZURE_SPEECH_REGION: REGION } = env;
if (!KEY || KEY.startsWith('paste')) { console.error('Add your Azure key to .env.local first.'); process.exit(1); }

const VOICES = { thando: 'zu-ZA-ThandoNeural', themba: 'zu-ZA-ThembaNeural' };
const OUT = 'public/audio/zu';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const items = Object.values(COURSES.zu.items);
let made = 0, failed = 0;
for (const it of items) {
  const text = it.t.replace(/\.\.\.|…/g, '').trim();
  for (const [name, voice] of Object.entries(VOICES)) {
    const file = `${OUT}/${audioKey(it.t)}-${name}.mp3`;
    if (fs.existsSync(file)) continue;
    // Slightly slower than normal speech, which suits learners.
    const ssml = `<speak version="1.0" xml:lang="zu-ZA"><voice name="${voice}"><prosody rate="-12%">${esc(text)}</prosody></voice></speak>`;
    for (let attempt = 0; attempt < 4; attempt++) {
      const r = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'lulwimi',
        },
        body: ssml,
      });
      if (r.ok) {
        fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
        made++;
        break;
      }
      if (r.status === 429) { await sleep(15000); continue; }
      console.error(`${r.status} for "${text}" (${name}): ${await r.text()}`);
      if (r.status === 401 || r.status === 403) process.exit(1);
      failed++;
      break;
    }
    await sleep(3200);
  }
  process.stdout.write(`\r${made} made, ${failed} failed`);
}
console.log(`\nDone: ${made} new clips in ${OUT}`);
