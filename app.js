(() => {
  'use strict';
  const S = window.BunriStory;
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const icons = {
    book: '<path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3z"/><path d="M12 6v15"/>',
    sound: '<path d="M11 4 5 9H2v6h3l6 5z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="M11 4 5 9H2v6h3l6 5z"/><path d="m16 9 5 6m0-6-5 6"/>',
    full: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',
    history: '<path d="M3 4v5h5M3 9a9 9 0 1 1 0 6m9-9v6l4 2"/>',
    home: '<path d="m3 10 9-7 9 7v11h-6v-7H9v7H3z"/>',
    crown: '<path d="m3 6 4 4 5-7 5 7 4-4-3 13H6zM7 22h10"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let state = S.createState();
  const copy = (standard, simple) => state.courseId === 'elementary' ? simple : standard;
  const courseClass = () => state.courseId === 'elementary' ? ' elementary-course' : '';
  let screen = 'title';
  let typeTimer = null;
  let autoTimer = null;
  let fullText = '';
  let typing = false;
  let auto = false;
  let sound = false;
  let audioContext;
  let audioLoop;
  let audioMaster;
  let noteIndex = 0;
  let lastModalFocus;
  let recordedKey = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const art = '<img class="scene-art" src="assets/classroom-yuichi.png" alt="午後の光が差し込む講義室で、御家雄一がこちらを向いてほほえんでいる">';
  const sparkles = '<span class="sparkle one"></span><span class="sparkle two"></span><span class="sparkle three"></span>';

  function clearTimers() { clearInterval(typeTimer); clearTimeout(autoTimer); typing = false; }
  function title() {
    clearTimers(); auto = false; screen = 'title'; state = S.createState(); recordedKey = null;
    app.innerHTML = `<section class="stage title-stage" aria-labelledby="game-title">${art}${sparkles}
      <div class="title-content"><p class="title-location">名古屋文理大学、ある日の講義室。</p>
      <p class="title-kicker">その恋は、まだ未定義。</p><h1 class="game-title" id="game-title">ブンリの<span class="second-line"><span class="crown-decoration">${icon('crown')}</span>王子様</span></h1>
      <div class="title-english">THE PRINCE OF BUNRI</div><p class="title-description">隣の席は、ちょっと特別。<br>小・中・高の3コースで楽しむ、約5分の物語。</p>
      <button class="primary-button start-button" id="start-game">物語をはじめる<span class="button-arrow" aria-hidden="true">→</span></button>
      <div class="title-links"><button class="text-button" data-action="how">${icon('info')}あそびかた</button><button class="text-button" data-action="notebook">${icon('book')}講義ノート</button></div></div>
      <div class="title-bottom"><div class="facts"><div class="fact"><strong>5</strong><div><span>MINUTES</span><small>ひと休みの物語</small></div></div><div class="fact"><strong>3</strong><div><span>LESSONS</span><small>小さな学び</small></div></div><div class="fact"><strong>3</strong><div><span>ENDINGS</span><small>選んだ先の未来</small></div></div></div><div class="character-note"><small>今日、隣の席にいるのは</small><p>御家雄一<span>THE PRINCE</span></p></div></div></section>`;
    document.getElementById('start-game').addEventListener('click', () => chooseCourse());
    bindCommon();
  }
  function chooseCourse(preview = false) {
    openModal('CHOOSE YOUR COURSE', 'コースをえらぼう', `<p class="course-intro">学年は目安です。大人の方も、好きなむずかしさでどうぞ。<br><span>どのコースも約5分・3つのミニ問題。ヒントつきです。</span></p><div class="course-list">${Object.values(S.courses).map((course, i) => `<button class="course-option" data-course="${course.id}" aria-label="${course.label}で${preview ? '内容を見る' : 'はじめる'}"><span class="course-number" aria-hidden="true">0${i + 1}</span><span class="course-details"><span class="course-heading"><strong><ruby>${course.label.replace('コース', '')}<rt>${course.reading}</rt></ruby>コース</strong><span class="course-mood">${course.mood}</span></span><span class="course-description">${course.description}</span><span class="course-topics">${course.topics}</span></span><span class="course-arrow" aria-hidden="true">→</span></button>`).join('')}</div><p class="course-footnote">${preview ? 'えらぶと、そのコースで学べる内容を見られます。' : 'えらぶと物語がはじまります。まちがえても最後まで遊べます。'}</p>`);
    modal.classList.add('course-picker');
    modal.querySelectorAll('[data-course]').forEach(button => button.addEventListener('click', () => {
      if (preview) { notebook(button.dataset.course); return; }
      const courseId = button.dataset.course;
      modal.close(); start(courseId);
    }));
  }
  function start(courseId) { state = S.createState(courseId); screen = 'play'; recordedKey = null; auto = false; chime(); render(); app.focus({ preventScroll: true }); }
  function bindCommon() { app.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => action(button.dataset.action))); }
  function action(name) {
    if (name === 'notebook') notebook();
    if (name === 'how') how();
    if (name === 'history') history();
    if (name === 'home') goHome();
    if (name === 'auto') { auto = !auto; const b = app.querySelector('[data-action="auto"]'); b.textContent = `AUTO ${auto ? 'ON' : 'OFF'}`; b.setAttribute('aria-pressed', String(auto)); b.classList.toggle('active', auto); scheduleAuto(); }
  }
  function topBar() {
    const selected = S.course(state);
    return `<div class="play-top"><div class="play-top-left"><span class="chapter-label">${state.chapter === 0 ? 'PROLOGUE' : state.chapter === 4 ? 'EPILOGUE' : 'LESSON 0' + state.chapter} / ${selected.label}</span><h1 class="chapter-title">${selected.chapters[state.chapter]}</h1><div class="lesson-progress" aria-label="講義の進み具合">${[1, 2, 3].map(i => `<span class="${state.learned.includes(selected.lessons[i - 1].id) ? 'done' : state.chapter === i ? 'current' : ''}"></span>`).join('')}</div></div><div class="play-tools"><button class="glass-button${auto ? ' active' : ''}" data-action="auto" aria-label="会話の自動送り" aria-pressed="${auto}">AUTO ${auto ? 'ON' : 'OFF'}</button><button class="glass-button" data-action="history" aria-label="会話ログ">${icon('history')}<span>ログ</span></button><button class="glass-button" data-action="notebook" aria-label="講義ノート">${icon('book')}<span>ノート</span></button><button class="glass-button" data-action="home" aria-label="タイトルに戻る">${icon('home')}</button></div></div>`;
  }
  function addHistory(speaker, text) { state.history.push({ speaker, text }); }
  function render() {
    clearTimers();
    const current = S.scene(state);
    if (current.type === 'ending') { renderEnding(); return; }
    screen = 'play';
    app.innerHTML = `<section class="stage play-stage${current.type === 'quiz' ? ' quiz-stage' : ''}${courseClass()}" aria-label="物語">${art}${topBar()}<div id="scene-content"></div></section>`;
    bindCommon();
    const target = document.getElementById('scene-content');
    if (state.feedback) {
      if (state.feedback.type === 'quiz') {
        const f = state.feedback;
        target.innerHTML = `<section class="choice-panel feedback-panel" aria-labelledby="feedback-title"><span class="feedback-status">${f.correct ? copy('✓ 正解！', '✓ せいかい！') : copy('なるほど、を持ち帰ろう。', 'いっしょに、たしかめよう。')}</span><h2 id="feedback-title">${escape(f.text)}</h2><p class="feedback-explanation">${escape(f.explanation)}</p><button class="primary-button" id="continue-feedback">${copy('わかった、物語へ', 'わかった、つづきへ')}<span class="button-arrow" aria-hidden="true">→</span></button><p class="learned-label">${icon('book')}${copy('講義ノートに追加しました', 'ノートにかきとめたよ')}</p></section>`;
        document.getElementById('continue-feedback').addEventListener('click', next);
        document.getElementById('continue-feedback').focus({ preventScroll: true });
      } else dialogue('御家雄一', state.feedback.text, target);
      return;
    }
    if (current.type === 'quiz' || current.type === 'choice') { showChoices(current, target); return; }
    if (current.lesson) {
      const lesson = S.course(state).lessons.find(item => item.id === current.lesson);
      target.innerHTML = `<aside class="lecture-card"><span class="eyebrow">TODAY’S LESSON / ${lesson.number}</span><h2>${lesson.title}</h2><p>${lesson.subtitle}</p></aside>`;
    }
    if (current.board) target.innerHTML = `<aside class="lecture-card"><span class="eyebrow">${escape(current.board.label)}</span><pre>${escape(current.board.text)}</pre></aside>`;
    if (recordedKey !== state.index) { addHistory(current.speaker, current.text); recordedKey = state.index; }
    dialogue(current.speaker, current.text, target);
  }
  function dialogue(speaker, text, target) {
    target.insertAdjacentHTML('beforeend', `<div class="dialogue-box"><span class="speaker-tab${speaker === 'あなた' || speaker === '担当教員' ? ' narrator' : ''}">${escape(speaker)}</span><p class="dialogue-text" id="dialogue-text"><span id="visible-text" aria-hidden="true"></span><span class="sr-only">${escape(text)}</span></p><div class="dialogue-actions"><span class="keyboard-hint">クリック / Enter でつづきを読む</span><button class="next-button" id="next-line"><span id="next-label">全文を表示</span><span class="button-arrow" aria-hidden="true">→</span></button></div></div>`);
    document.getElementById('next-line').addEventListener('click', next);
    document.getElementById('dialogue-text').addEventListener('click', next);
    document.getElementById('next-line').focus({ preventScroll: true });
    fullText = text;
    const el = document.getElementById('visible-text');
    if (reducedMotion.matches) { el.textContent = text; document.getElementById('next-label').textContent = 'つづきを読む'; scheduleAuto(); return; }
    const chars = Array.from(text); let offset = 0; typing = true;
    typeTimer = setInterval(() => { if (!modal.open && !document.hidden) { offset += 2; el.textContent = chars.slice(0, offset).join(''); if (offset >= chars.length) finishTyping(); } }, 24);
  }
  function finishTyping() { clearInterval(typeTimer); typing = false; const el = document.getElementById('visible-text'); if (el) el.textContent = fullText; const label = document.getElementById('next-label'); if (label) label.textContent = 'つづきを読む'; scheduleAuto(); }
  function scheduleAuto() {
    clearTimeout(autoTimer);
    if (!auto || typing || modal.open || document.hidden || screen !== 'play') return;
    const current = S.scene(state);
    if (current.type === 'quiz' || (current.type === 'choice' && !state.feedback)) return;
    if (current.type === 'ending') return;
    const text = state.feedback ? state.feedback.text : current.text;
    autoTimer = setTimeout(next, Math.max(3800, Array.from(text || '').length * 95));
  }
  function next() {
    if (modal.open || screen !== 'play') return;
    if (typing) { finishTyping(); return; }
    if (S.advance(state)) { chime(); render(); }
  }
  function showChoices(current, target) {
    const quiz = current.type === 'quiz';
    const lesson = quiz ? S.course(state).lessons.find(l => l.id === current.lesson) : null;
    target.innerHTML = `<section class="choice-panel" aria-labelledby="choice-title"><span class="eyebrow">${quiz ? 'MINI LESSON ' + lesson.number + ' / ' + lesson.title : 'YOUR CHOICE / あなたの選択'}</span><h2 id="choice-title">${escape(current.prompt)}</h2>${current.board ? `<pre class="question-board">${escape(current.board)}</pre>` : ''}<div class="choices">${current.options.map((option, i) => `<button class="choice-button" data-choice="${i}"><span class="choice-index" aria-hidden="true">0${i + 1}</span><span>${escape(quiz ? option : option.text)}</span></button>`).join('')}</div>${quiz ? '<button class="hint-toggle" id="hint-toggle" aria-expanded="false" aria-controls="hint-text">考え方のヒントを見る ＋</button><p class="hint-text" id="hint-text" hidden></p>' : ''}</section>`;
    app.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.choice))));
    if (quiz) document.getElementById('hint-toggle').addEventListener('click', () => { const hint = document.getElementById('hint-text'); hint.hidden = !hint.hidden; hint.textContent = current.hint; const button = document.getElementById('hint-toggle'); button.setAttribute('aria-expanded', String(!hint.hidden)); button.textContent = hint.hidden ? '考え方のヒントを見る ＋' : 'ヒントを閉じる −'; });
    target.querySelector('[data-choice]').focus({ preventScroll: true });
  }
  function choose(index) {
    const current = S.scene(state);
    if (!S.answer(state, index)) return;
    addHistory('あなたの選択', current.type === 'quiz' ? `${current.prompt} → ${current.options[index]}` : current.options[index].text);
    addHistory('御家雄一', state.feedback.text);
    if (state.feedback.explanation) addHistory('講義メモ', state.feedback.explanation);
    chime(); render();
  }
  function renderEnding() {
    clearTimers(); auto = false; screen = 'ending';
    const end = S.endingContent(state);
    if (recordedKey !== 'ending') { addHistory('エピローグ', end.quote + end.text); recordedKey = 'ending'; }
    app.innerHTML = `<section class="stage ending-stage${courseClass()}" aria-labelledby="ending-title">${art}${sparkles}<div class="ending-content"><div class="ending-badge">ENDING ${end.number} / ${end.label}</div><h1 id="ending-title">${end.title}</h1><p class="ending-quote">${end.quote}</p><p class="ending-prose">${end.text}</p><p class="ending-after">${end.after}</p><div class="result-card"><p class="result-course">${S.course(state).label} / ${copy('修了', 'おわり！')}</p><div class="result-head"><span>${copy('今日、持ち帰る小さな学び', '今日、わかったこと')}</span><strong>${state.answers.filter(a => a.correct).length}<small> / 3 ${copy('正解', 'せいかい')}</small></strong></div><div class="result-lessons">${S.course(state).lessons.map(lesson => `<span class="lesson-chip">✓ ${lesson.title}</span>`).join('')}</div></div><div class="ending-actions"><button class="primary-button" data-action="notebook">${icon('book')}${copy('学びを振り返る', 'ノートをみる')}</button><button class="secondary-button" id="finish-game">タイトルへ戻る →</button></div><p class="ending-bottom-note">${copy('遊んでくれて、ありがとう。別の選択で、別の未来にも出会えます。', 'あそんでくれて、ありがとう。ほかのコースも、ためしてみてね。')}<br>次の方は「タイトルへ戻る」から、コースを選び直せます。</p></div></section>`;
    document.getElementById('finish-game').addEventListener('click', () => { title(); document.getElementById('start-game').focus({ preventScroll: true }); }); bindCommon();
    app.focus({ preventScroll: true });
  }
  function openModal(kicker, heading, body) {
    clearTimeout(autoTimer); if (!modal.open) lastModalFocus = document.activeElement;
    modal.classList.remove('course-picker', 'elementary-notebook');
    document.getElementById('modal-kicker').textContent = kicker;
    document.getElementById('modal-title').textContent = heading;
    document.getElementById('modal-body').innerHTML = body;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  }
  function notebook(previewCourseId) {
    const preview = screen === 'title';
    if (preview && !previewCourseId) { chooseCourse(true); return; }
    const selected = preview ? S.courses[previewCourseId] : S.course(state);
    const simple = selected.id === 'elementary';
    openModal('YOUR LITTLE NOTEBOOK', simple ? '今日のまなびノート' : '今日の講義ノート', `<span class="notebook-course">${selected.label}</span><p>${simple ? '今日、わかったことを、ノートにのこそう。' : preview ? 'このコースで出会う、三つの小さな学び。予習なしで大丈夫。雄一と一緒に考えてみよう。' : 'わかったことも、もう一度考えたいことも。二人のノートに残しておこう。'}</p>${selected.lessons.map(lesson => { const unlocked = !preview && state.learned.includes(lesson.id); return `<section class="notebook-entry${unlocked ? '' : ' locked'}"><span class="eyebrow">LESSON ${lesson.number}${unlocked ? ' / LEARNED' : ' / これからの学び'}</span><h3>${lesson.title}</h3><p>${unlocked ? escape(lesson.body) : lesson.subtitle}</p>${unlocked ? `<pre>${escape(lesson.example)}</pre>` : `<p class="modal-note">${simple ? 'もんだいをとくと、せつめいがここにのこるよ。' : 'ミニ問題を解くと、解説がここに残ります。'}</p>`}</section>`; }).join('')}${preview ? '<button class="secondary-button notebook-back" id="back-to-courses">ほかのコースを見る</button>' : ''}`);
    modal.classList.toggle('elementary-notebook', simple);
    document.getElementById('back-to-courses')?.addEventListener('click', () => chooseCourse(true));
    document.getElementById('close-modal').focus({ preventScroll: true });
  }
  function how() { openModal('HOW TO PLAY', '5分だけ、隣の席へ。', '<ol class="how-list"><li>「物語をはじめる」で小学生・中学生・高校生のコースを選びます。学年は目安で、大人の方も自由に選べます。クリック、Enter、Spaceで会話が進みます。文字の表示中に押すと、全文を表示します。</li><li>会話の選択肢で、雄一との距離が変わります。選択肢はクリック、または数字の1・2・3で選べます。</li><li>講義には三つのミニ問題。ヒントを見ても、間違えても大丈夫。必ず解説が出て、物語の最後まで遊べます。</li><li>結末は三種類。クイズの点数ではなく、会話の選択で決まります。最後はタイトルに戻して、次の方へ。</li></ol><p class="modal-note">所要時間の目安は約4〜6分。AUTOは会話だけを自動で進め、問題と選択肢では止まります。音は最初はオフ。スピーカーボタンで、小さなオリジナルBGMを流せます。</p>'); }
  function history() { openModal('STORY LOG', 'ここまでの会話', state.history.map(item => `<div class="history-item"><strong>${escape(item.speaker)}</strong><p>${escape(item.text)}</p></div>`).join('') || '<p>まだ会話はありません。</p>'); document.getElementById('modal-body').lastElementChild?.scrollIntoView({ block: 'nearest' }); }
  function goHome() {
    if (screen === 'title') return;
    if (screen === 'ending') { title(); return; }
    openModal('BACK TO TITLE', '最初からやり直す？', '<p>今の物語と講義ノートをリセットして、タイトルに戻ります。</p><div class="confirm-actions"><button class="primary-button" id="confirm-home">タイトルに戻る</button><button class="secondary-button" id="cancel-home">物語を続ける</button></div>');
    document.getElementById('confirm-home').addEventListener('click', () => { modal.close(); title(); document.getElementById('start-game').focus({ preventScroll: true }); });
    document.getElementById('cancel-home').addEventListener('click', () => modal.close());
  }
  function tone(frequency, duration, volume = .08, delay = 0) {
    if (!sound || !audioContext || audioContext.state !== 'running') return;
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .025); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain); gain.connect(audioMaster); oscillator.start(start); oscillator.stop(start + duration + .1);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function chime() { tone(659.25, .2, .025); }
  function updateSoundButton() { const button = document.getElementById('sound-toggle'); button.innerHTML = icon(sound ? 'sound' : 'mute'); button.setAttribute('aria-label', sound ? '音をオフにする' : '音をオンにする'); button.setAttribute('aria-pressed', String(sound)); }
  async function toggleSound() {
    try {
      if (!audioContext) { const Context = window.AudioContext || window.webkitAudioContext; audioContext = new Context(); audioMaster = audioContext.createGain(); audioMaster.gain.value = .3; audioMaster.connect(audioContext.destination); }
      sound = !sound; clearInterval(audioLoop);
      if (sound) {
        await audioContext.resume();
        const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66, 261.63, 349.23, 440, 523.25, 493.88, 392, 293.66, 329.63];
        const playNote = () => { if (document.hidden) return; tone(notes[noteIndex % notes.length], 2.2, .09); if (noteIndex % 4 === 0) tone(notes[noteIndex % notes.length] / 2, 3.3, .075); noteIndex++; };
        playNote(); audioLoop = setInterval(playNote, 740);
      } else await audioContext.suspend();
    } catch { sound = false; clearInterval(audioLoop); openModal('SOUND', '音声を再生できませんでした', '<p>このブラウザでは音声が利用できません。物語はそのまま遊べます。</p>'); }
    updateSoundButton();
  }
  document.getElementById('close-modal').addEventListener('click', () => modal.close());
  modal.addEventListener('close', () => { if (lastModalFocus?.isConnected) lastModalFocus.focus({ preventScroll: true }); scheduleAuto(); });
  modal.addEventListener('click', event => { if (event.target === modal) { const r = modal.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close(); } });
  document.getElementById('brand-home').addEventListener('click', event => { event.preventDefault(); goHome(); });
  document.getElementById('sound-toggle').addEventListener('click', toggleSound);
  document.getElementById('fullscreen-toggle').innerHTML = icon('full');
  if (!document.fullscreenEnabled) document.getElementById('fullscreen-toggle').hidden = true;
  document.getElementById('fullscreen-toggle').addEventListener('click', async () => { try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); } catch { openModal('DISPLAY', '全画面に切り替えられませんでした', '<p>ブラウザのメニューから全画面表示を選ぶか、このまま遊んでください。</p>'); } });
  document.addEventListener('fullscreenchange', () => document.getElementById('fullscreen-toggle').setAttribute('aria-label', document.fullscreenElement ? '全画面を終了する' : '全画面にする'));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(autoTimer); if (audioContext) audioContext.suspend().catch(() => {}); } else { scheduleAuto(); if (sound && audioContext) audioContext.resume().catch(() => {}); } });
  document.addEventListener('keydown', event => {
    if (modal.open || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const focusedButton = document.activeElement?.closest('button,a');
    if (screen === 'play' && /^[123]$/.test(event.key) && !state.feedback && ['quiz', 'choice'].includes(S.scene(state).type)) { event.preventDefault(); choose(Number(event.key) - 1); return; }
    if (screen === 'play' && ['Enter', ' '].includes(event.key) && (!focusedButton || focusedButton.id === 'next-line')) { event.preventDefault(); next(); }
  });
  updateSoundButton(); title();
})();
