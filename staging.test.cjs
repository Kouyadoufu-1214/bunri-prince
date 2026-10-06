const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const S = require('./story.js');
const D = require('./staging.js');

for (const course of ['junior','senior','adult']) for (const {id} of S.episodes[course === 'adult' ? 'adult' : 'minor']) {
  test(`${course}/${id}: the two new pauses change prose and framing with each answer`, () => {
    const variants = [new Set(), new Set()];
    for (const choice of [0,1,2]) {
      const state = S.createState(course,id);
      while (S.scene(state).type !== 'ending') {
        const scene = S.scene(state);
        if (scene.type === 'minigame') S.finishMiniGame(state, true);
        if (scene.type === 'choice') S.answer(state, choice);
        if (scene.type === 'quiz') {
          const before = D.direction(state, scene);
          S.answer(state, choice);
          assert.deepEqual(D.direction(state, scene), before, 'quiz score does not change affection cues');
        }
        const cue = D.direction(state, scene);
        assert.ok(fs.statSync(path.join(__dirname, cue.src)).size > 10000);
        assert.ok(['far','normal','near','close'].includes(cue.distance));
        if (scene.pause) {
          assert.equal(scene.text, scene.variants[choice]);
          variants[scene.choiceIndex - 1].add(scene.text);
          assert.equal(cue.expression, ['shy','calm','smile'][choice]);
          assert.equal(cue.distance, choice === 0 && scene.choiceIndex === 2 && state.mode === 'minor' ? 'close' : ['near','normal','far'][choice]);
        }
        S.advance(state);
      }
      assert.equal(S.activeScenes(state).filter(s => s.pause).length, 2);
    }
    variants.forEach(v => assert.equal(v.size,3));
    assert.equal(D.direction(S.createState(course,id), S.scene(S.createState(course,id))).distance,'far');
  });
}
