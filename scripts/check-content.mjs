// Sanity-checks both courses: ids, duplicates, and that every lesson can build its exercises.
import { COURSES, lessonExercises, reviewExercises, checkTyped, levelInfo, stressGuide, todaysQuests, lightningExercise } from '../src/lib.js';

let problems = 0;
const fail = (m) => { problems++; console.log('  ✗', m); };

for (const c of Object.values(COURSES)) {
  const ids = new Set();
  const items = Object.values(c.items);
  console.log(`${c.name}: ${c.units.length} units, ${c.lessonList.length} lessons, ${items.length} unique items, ${c.proverbs.length} proverbs, ${c.concepts.length} concepts`);
  for (const l of c.lessonList) {
    if (ids.has(l.id)) fail(`duplicate lesson id ${l.id}`);
    ids.add(l.id);
    if (l.items.length < 4) fail(`${l.id} has only ${l.items.length} items`);
    // Also build the lesson as if every word were already known (the skip-intro path).
    const knownAll = Object.fromEntries(l.itemIds.map((id) => [id, { box: 3 }]));
    for (let n = 0; n < 20; n++) {
      const ex = lessonExercises(c, l, n % 2 ? knownAll : {});
      if (!ex.length) fail(`${l.id}: no exercises`);
      for (const e of ex) {
        if (e.type === 'mcq') {
          if (new Set(e.options).size !== 4) fail(`${l.id}: mcq for ${c.items[e.item].t} has duplicate/missing options ${JSON.stringify(e.options)}`);
          if (!e.options.includes(e.answer)) fail(`${l.id}: answer missing`);
        }
        if (e.type === 'build' && !e.answer.split(' ').every((w) => e.tiles.includes(w))) fail(`${l.id}: build tiles incomplete`);
      }
    }
  }
  for (const it of items) {
    if (!it.t || !it.en) fail(`empty item ${it.id}`);
    if (checkTyped(it.t, [it.t, ...it.ta]) !== 'exact') fail(`self-check failed: ${it.t}`);
  }
  reviewExercises(c, items.slice(0, 12).map((i) => i.id));
  for (let n = 0; n < 50; n++) {
    const e = lightningExercise(c, items.slice(0, 8).map((i) => i.id));
    if (new Set(e.options).size !== 4) fail(`lightning options broken for ${c.items[e.item].t}`);
  }
  const cousins = items.filter((i) => i.cousin || i.same).length;
  const bySrc = items.reduce((a, i) => ({ ...a, [i.src]: (a[i.src] || 0) + 1 }), {});
  console.log(`  cousins linked: ${cousins}  sources: ${JSON.stringify(bySrc)}`);
}
console.assert(checkTyped('ngiyabonga', ['Ngiyabonga']) === 'exact');
console.assert(checkTyped('ngiyabonag', ['Ngiyabonga']) === 'typo');
console.assert(checkTyped('sawubona', ['Ngiyabonga']) === false);
console.assert(levelInfo(0).lvl === 1 && levelInfo(40).lvl === 2 && levelInfo(119).lvl === 2 && levelInfo(120).lvl === 3);
console.assert(stressGuide('Ngiyabonga') === 'ngi·ya·BO·nga', stressGuide('Ngiyabonga'));
console.assert(stressGuide('Sala kahle.') === 'SA·la  KA·hle', stressGuide('Sala kahle.'));
console.assert(new Set(todaysQuests().map((q) => q.id)).size === 3);
console.log(problems ? `\n${problems} problem(s)` : '\nAll content checks passed.');
process.exit(problems ? 1 : 0);
