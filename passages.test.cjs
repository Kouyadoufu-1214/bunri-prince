const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('./passages.js');
const S = require('./story.js');

function sceneAt(course, episode, id, choices = [0, 0, 0]) {
  const state = S.createState(course, episode);
  state.index = S.activeScenes(state).findIndex(scene => scene.id === id);
  state.choices = choices;
  assert.ok(state.index >= 0);
  return { state, scene: S.scene(state) };
}
test('speech, movement and subsequent speech retain their original order and exact text', () => {
  const text = '「ここ、空いてるよ」雄一は椅子を引いた。「どうぞ」';
  const pages = P.split({ speaker: '御家雄一', text });
  assert.deepEqual(pages, [
    { kind: 'speech', speaker: '御家雄一', text: '「ここ、空いてるよ」' },
    { kind: 'narration', speaker: '情景・心の声', text: '雄一は椅子を引いた。' },
    { kind: 'speech', speaker: '御家雄一', text: '「どうぞ」' }
  ]);
  assert.equal(pages.map(p => p.text).join(''), text);
});
test('written words, nicknames and unspoken thoughts stay in the narrator frame', () => {
  for (const id of ['introduce', 'dataThought', 'conditionThought']) {
    const { scene } = sceneAt('junior', 'lecture', id);
    assert.deepEqual(P.split(scene), [{ kind: 'narration', speaker: '情景・心の声', text: scene.text }]);
  }
  const { scene } = sceneAt('junior', 'rescue', 'firstDetour', [2, 0, 0]);
  assert.equal(P.split(scene).length, 1);
  assert.equal(P.split(scene)[0].kind, 'narration');
});
test('quotes within dialogue and unmatched brackets do not drop or reshuffle text', () => {
  const text = '先生は言った。「「true」は真、という意味。『1』も確認しよう」未完成の「メモ';
  const pages = P.split({ speaker: '御家雄一', text });
  assert.equal(pages.length, 3);
  assert.equal(pages[1].text, '「「true」は真、という意味。『1』も確認しよう」');
  assert.equal(pages[2].kind, 'narration');
  assert.equal(pages.map(p => p.text).join(''), text);
  assert.deepEqual(P.split(), []);
});
test('explicit null attribution keeps a quoted term in prose without hiding the next spoken line', () => {
  const pages = P.split({ speaker: '御家雄一', text: 'ノートに「true」と書いた。「できたね」', quoteSpeakers: [null, '御家雄一'] });
  assert.equal(pages.length, 2);
  assert.equal(pages[0].text, 'ノートに「true」と書いた。');
  assert.equal(pages[1].kind, 'speech');
});
test('protagonist, teacher, and overlapping voices are attributed deliberately', () => {
  const expected = [
    ['junior', 'festival', 'firstDetour', [2, 0, 0], ['あなた']],
    ['junior', 'rescue', 'firstDetour', [0, 0, 0], ['あなた', '御家雄一']],
    ['junior', 'rescue', 'stars', [0, 0, 0], ['あなたと雄一']],
    ['junior', 'rescue', 'invitationPause', [0, 0, 0], ['あなたと雄一']],
    ['junior', 'rescue', 'invitationPause', [0, 1, 0], ['御家雄一']],
    ['adult', 'rain', 'retrySetup', [0, 0, 0], ['御家雄一']],
    ['adult', 'presentation', 'firstDetour', [0, 0, 0], ['御家雄一']],
    ['junior', 'lecture', 'assignment', [0, 0, 0], ['担当教員']]
  ];
  for (const [course, episode, id, choices, speakers] of expected) {
    assert.deepEqual(P.split(sceneAt(course, episode, id, choices).scene).filter(p => p.kind === 'speech').map(p => p.speaker), speakers, `${course}/${episode}/${id}`);
  }
});
test('choice replies keep both speakers rather than assigning the protagonist reply to Yuichi', () => {
  const { state } = sceneAt('junior', 'rescue', 'farewell', [2, 2]);
  S.answer(state, 2);
  const pages = P.split({ speaker: '御家雄一', ...state.feedback });
  assert.deepEqual(pages.map(p => p.speaker), ['御家雄一', 'あなた', '情景・心の声']);
  assert.equal(pages[1].text, '「もちろん」');
});
test('spoken choice prompts are separate from the instruction to the player', () => {
  for (const [course, episode, id] of [
    ['junior', 'festival', 'invitation'], ['adult', 'rain', 'greeting'], ['adult', 'presentation', 'greeting']
  ]) {
    const { scene } = sceneAt(course, episode, id);
    assert.ok(scene.promptSpeech.startsWith('「') && scene.promptSpeech.endsWith('」'));
    assert.ok(!scene.prompt.includes('「'));
    assert.equal(scene.options.length, 3);
  }
});
test('epilogues distinguish a written note, the protagonist, a visitor and Yuichi', () => {
  for (const [course, episode, affection, speakers] of [
    ['junior', 'festival', 4, []], ['junior', 'rescue', 0, ['来場者']],
    ['adult', 'rain', 4, ['あなた']], ['adult', 'lecture', 4, ['御家雄一']],
    ['adult', 'presentation', 4, ['御家雄一']], ['junior', 'lecture', 0, ['御家雄一']]
  ]) {
    const state = S.createState(course, episode); state.affection = affection;
    const end = S.endingContent(state);
    assert.deepEqual(P.split({ speaker: 'あなた', ...end }).filter(p => p.kind === 'speech').map(p => p.speaker), speakers);
  }
});
for (const course of ['junior', 'senior', 'adult']) {
  for (const episode of S.episodes[course === 'adult' ? 'adult' : 'minor']) {
    test(`${course}/${episode.id}: every choice route preserves text through scene, reply and ending pages`, () => {
      for (let route = 0; route < 27; route++) {
        const state = S.createState(course, episode.id);
        let choiceIndex = 0, steps = 0;
        const verify = data => {
          const before = JSON.stringify(data);
          const pages = P.split(data);
          assert.ok(pages.length > 0);
          assert.equal(pages.map(p => p.text).join(''), data.text);
          assert.ok(pages.every(p => p.text.length > 0 && p.speaker));
          assert.equal(JSON.stringify(data), before, 'the presentation must not mutate story data');
          for (const page of pages.filter(p => p.kind === 'speech')) {
            assert.ok(page.text.startsWith('「') && page.text.endsWith('」'));
          }
        };
        while (S.scene(state).type !== 'ending') {
          assert.ok(++steps < 100, 'story remains completable');
          const scene = S.scene(state);
          if (scene.type === 'choice') {
            S.answer(state, Math.floor(route / 3 ** choiceIndex++) % 3);
            verify({ speaker: '御家雄一', ...state.feedback });
          } else if (scene.type === 'minigame') S.finishMiniGame(state, true);
          else if (scene.type === 'quiz') S.answer(state, route % 3);
          else verify(scene);
          S.advance(state);
        }
        verify({ speaker: 'あなた', ...S.endingContent(state) });
        assert.equal(state.answers.length, 3);
        assert.equal(state.choices.length, 3);
      }
    });
  }
}
