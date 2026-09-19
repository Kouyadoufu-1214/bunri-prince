const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('./story.js');

for (const courseId of Object.keys(S.courses)) {
test(`${courseId}: all 729 combinations finish, learn all lessons, and separate romance from quiz score`, () => {
  const definitionsBefore = JSON.stringify(S.courses);
  const reached = new Set();
  for (let socialCode = 0; socialCode < 27; socialCode++) {
    const expected = new Set();
    for (let quizCode = 0; quizCode < 27; quizCode++) {
      const state = S.createState(courseId); let social = socialCode; let quiz = quizCode; let steps = 0;
      while (S.scene(state).type !== 'ending') {
        assert.ok(++steps < 50, 'story must terminate');
        const current = S.scene(state);
        if (current.type === 'quiz' || current.type === 'choice') {
          assert.equal(S.advance(state), false, 'an unanswered question cannot be skipped');
          const selected = current.type === 'quiz' ? quiz % 3 : social % 3;
          if (current.type === 'quiz') quiz = Math.floor(quiz / 3); else social = Math.floor(social / 3);
          assert.equal(S.answer(state, selected), true);
          const snapshot = JSON.stringify(state);
          assert.equal(S.answer(state, selected), false, 'double clicks must not double count');
          assert.equal(JSON.stringify(state), snapshot);
        }
        assert.equal(S.advance(state), true);
      }
      assert.equal(state.answers.length, 3);
      assert.equal(state.choices.length, 3);
      assert.deepEqual(state.learned, S.course(state).lessons.map(l => l.id));
      assert.equal(state.courseId, courseId);
      assert.ok(S.endingContent(state).text.length > 0);
      assert.equal(S.advance(state), false);
      assert.equal(state.chapter, 4);
      reached.add(S.ending(state)); expected.add(S.ending(state));
    }
    assert.equal(expected.size, 1, 'quiz performance cannot change the relationship ending');
  }
  assert.deepEqual([...reached].sort(), ['buddy', 'promise', 'sweet']);
  assert.equal(JSON.stringify(S.courses), definitionsBefore, 'playing must not mutate any course definition');
});

test(`${courseId}: all correct and all incorrect answers produce accurate scores`, () => {
  for (const allCorrect of [true, false]) {
    const state = S.createState(courseId);
    while (S.scene(state).type !== 'ending') {
      const current = S.scene(state);
      if (current.type === 'quiz') S.answer(state, allCorrect ? current.correct : (current.correct + 1) % 3);
      if (current.type === 'choice') S.answer(state, 1);
      S.advance(state);
    }
    assert.equal(state.answers.filter(a => a.correct).length, allCorrect ? 3 : 0);
  }
});

test(`${courseId}: switching courses gives the next visitor a clean state`, () => {
  const old = S.createState(courseId === 'senior' ? 'elementary' : 'senior'); old.history.push({ text: 'previous visitor' }); old.learned.push('binary'); old.affection = 6;
  const fresh = S.createState(courseId);
  assert.equal(S.course(fresh).id, courseId);
  assert.deepEqual(fresh.history, []); assert.deepEqual(fresh.learned, []); assert.equal(fresh.affection, 0);
  while (S.scene(fresh).type !== 'choice') S.advance(fresh);
  for (const invalid of [-1, 3, 1.5, '1', NaN]) { const before = JSON.stringify(fresh); assert.equal(S.answer(fresh, invalid), false); assert.equal(JSON.stringify(fresh), before); }
});
}

test('each course has its own complete lessons and mathematically correct answer keys', () => {
  const expectedAnswers = {
    elementary: ['2つ', 'きょうしつ', '3ばん目'],
    junior: ['6', '「受付で確認」', '4回'],
    senior: ['11', '「受付で確認」', '3回']
  };
  const prompts = new Set();
  const sceneIds = S.scenes.map(s => s.id);
  assert.equal(new Set(sceneIds).size, sceneIds.length);
  for (const course of Object.values(S.courses)) {
    assert.equal(course.lessons.length, 3);
    assert.equal(course.chapters.length, 5);
    for (const id of Object.keys(course.sceneOverrides)) assert.ok(sceneIds.includes(id), `Unknown override ${id}`);
    for (const [i, lesson] of course.lessons.entries()) {
      for (const key of ['intro', 'dialogue', 'body', 'example']) assert.ok(lesson[key].length > 0);
      assert.equal(lesson.quiz.options.length, 3);
      assert.ok(lesson.quiz.hint && lesson.quiz.explanation && lesson.quiz.right && lesson.quiz.wrong);
      assert.equal(lesson.quiz.options[lesson.quiz.correct], expectedAnswers[course.id][i]);
      prompts.add(lesson.quiz.prompt);
    }
  }
  assert.equal(prompts.size, 9, 'the three courses must offer different questions');
});

test('elementary story, quizzes, and endings do not inherit advanced vocabulary', () => {
  const state = S.createState('elementary');
  const forbidden = /二進数|二分探索|線形探索|条件分岐|アルゴリズム|\bAND\b|\bNOT\b|\btrue\b/;
  for (let index = 0; index < S.scenes.length; index++) {
    state.index = index;
    const current = S.scene(state);
    assert.doesNotMatch(JSON.stringify(current), forbidden, current.id);
  }
  for (const affection of [0, 2, 6]) {
    state.affection = affection;
    assert.doesNotMatch(JSON.stringify(S.endingContent(state)), forbidden);
  }
});

test('unknown courses are rejected instead of silently selecting the wrong material', () => {
  for (const invalid of ['missing', 'toString', '__proto__', null]) assert.throws(() => S.createState(invalid), RangeError);
});
