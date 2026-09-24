const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const S = require('./story.js');
const M = require('./music.js');
const E = require('./episodes.js');
const L = require('./episode-lessons.js');

for (const courseId of ['junior','senior','adult']) {
  for (const {id: episodeId} of S.episodes[courseId === 'adult' ? 'adult' : 'minor'].slice(1)) {
    test(`${courseId}/${episodeId}: all 729 paths finish with correct records, branching, and independent endings`, () => {
      const original = JSON.stringify([E, L]);
      const endings = new Set(), detours = new Set();
      for (let socialCode = 0; socialCode < 27; socialCode++) {
        const sameRelationship = new Set();
        for (let quizCode = 0; quizCode < 27; quizCode++) {
          const state = S.createState(courseId, episodeId);
          let social = socialCode, quiz = quizCode, steps = 0, expectedScore = 0;
          while (S.scene(state).type !== 'ending') {
            const current = S.scene(state);
            assert.ok(++steps < 40);
            if (current.type === 'quiz' || current.type === 'choice') {
              assert.equal(S.advance(state), false);
              const answer = current.type === 'quiz' ? quiz % 3 : social % 3;
              if (current.type === 'quiz') { quiz = Math.floor(quiz / 3); expectedScore += Number(answer === current.correct); }
              else social = Math.floor(social / 3);
              assert.ok(S.answer(state, answer));
              const before = JSON.stringify(state);
              assert.equal(S.answer(state, answer), false);
              assert.equal(JSON.stringify(state), before);
            } else {
              assert.ok(current.text?.length > 0, current.id);
              if (current.variants) detours.add(current.text);
            }
            assert.ok(S.advance(state));
          }
          assert.equal(state.chapter, 4);
          assert.equal(state.answers.length, 3);
          assert.equal(state.choices.length, 3);
          assert.equal(state.answers.filter(a => a.correct).length, expectedScore);
          assert.deepEqual(state.learned, S.course(state).lessons.map(l => l.id));
          assert.ok(S.endingContent(state).text);
          assert.equal(S.advance(state), false);
          endings.add(S.ending(state)); sameRelationship.add(S.ending(state));
        }
        assert.equal(sameRelationship.size, 1);
      }
      assert.deepEqual([...endings].sort(), ['buddy','promise','sweet']);
      assert.equal(detours.size, 3, 'the first choice changes an actual follow-up scene');
      assert.equal(JSON.stringify([E,L]), original);
    });
  }
}
test('all six stories have distinct endings and eighteen distinct, present musical cues', () => {
  const titles = new Set(), music = new Set();
  for (const courseId of ['junior', 'adult']) for (const entry of S.episodes[courseId === 'adult' ? 'adult' : 'minor']) {
    const state = S.createState(courseId, entry.id);
    const scenes = S.activeScenes(state);
    assert.equal(new Set(scenes.map(s => s.id)).size, scenes.length);
    assert.equal(S.course(state).chapters.length, 5);
    for (const points of [0,2,6]) {
      state.affection = points;
      titles.add(S.endingContent(state).title);
      const track = M.getTrack(state.mode, state.episodeId, S.ending(state));
      assert.ok(track.title);
      assert.ok(fs.statSync(path.join(__dirname,track.src)).size > 100000);
      music.add(track.src);
    }
  }
  assert.equal(titles.size, 18); assert.equal(music.size,18);
});
test('new lessons have correct answer keys and independent grade-specific questions', () => {
  const expected = {
    festival: {junior:['01 02 03 04 05','公開先と目的を伝えて確認','2'],senior:['(A,3)(B,1)(C,2)','選んだ展示','3']},
    rescue: {junior:['昨日18時までの内容','関係しそうな一箇所を直して再確認','7個'],senior:['翌10時に追記した説明文','−1、0、1','i < 3']},
    rain: {adult:['この情報だけでは到達を断定できない','同じ依頼の処理結果を確認','閲覧権限']},
    presentation: {adult:['回答した20人ではこの傾向だった','3分','気温など他の要因も調べる']}
  };
  const prompts = new Set();
  for(const [id, levels] of Object.entries(L)) for(const [level, lessons] of Object.entries(levels)) {
    assert.equal(lessons.length,3);
    for (const [i,l] of lessons.entries()) {
      for (const field of ['body','example','dialogue','intro']) assert.ok(l[field]);
      for (const field of ['hint','explanation','right','wrong']) assert.ok(l.quiz[field]);
      assert.equal(l.quiz.options[l.quiz.correct],expected[id][level][i]);
      prompts.add(l.quiz.prompt);
    }
  }
  assert.equal(prompts.size,18);
});
test('minor/adult selection cannot cross episodes and switching starts clean', () => {
  for (const courseId of ['junior','senior']) for(const id of ['rain','presentation']) assert.throws(()=>S.createState(courseId,id),RangeError);
  for(const id of ['festival','rescue','missing','toString','__proto__',null]) assert.throws(()=>S.createState('adult',id),RangeError);
  const old=S.createState('adult','rain'); old.affection=6; old.learned.push('access'); old.choices.push(0); old.history.push('old');
  const fresh=S.createState('junior','rescue');
  assert.equal(fresh.mode,'minor'); assert.equal(fresh.index,0); assert.equal(fresh.affection,0);
  for(const key of ['answers','choices','learned','history']) assert.deepEqual(fresh[key],[]);
  assert.equal(fresh.feedback,null);
});
test('adult protagonists are adults', () => {
  for(const id of ['lecture','rain','presentation']) {
    const state=S.createState('adult',id);
    assert.match(S.scene(state).text,/22歳/);
    state.affection=6;
    assert.match(S.endingContent(state).text,/卒業/);
    assert.match(S.endingContent(state).text,/指導関係.*終わ/);
  }
});
