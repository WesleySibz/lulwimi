Cuts native-speaker clips for siSwati items from the Peace Corps siSwati Language Lessons (public domain).

Run from `audio-src/` (gitignored) after downloading the 9 MP3s and converting them to 16 kHz mono WAV:

1. `transcribe.py <lesson names>`: Whisper (English, base) word timings per lesson.
2. `align.py`: finds each item by comparing simplified sound-keys, writes `matches.json`.
3. `cut.py`: cuts the hand-approved matches into `public/audio/ss/`, snapping edges to silence.
4. `verify.py`: re-transcribes clips and flags odd ones to listen to.

Then run `npm run audio:manifest`. The approved list in `cut.py` was checked by hand; add to it carefully.
