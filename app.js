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
  const courseClass = () => state.mode === 'adult' ? ' adult-course' : '';
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
  const activeTones = new Set();
  let noteIndex = 0;
  let audioRevision = 0;
  let endingTrack = null;
  let musicPlaying = false;
  let musicError = false;
  const endingAudio = document.createElement('audio');
  endingAudio.id = 'ending-audio';
  document.body.appendChild(endingAudio);
  const endingPlayer = window.BunriMusic.createPlayer(endingAudio, status => {
    musicPlaying = status.playing;
    updateEndingMusic();
  }, () => {
    musicError = true; sound = false; syncAudio(); updateSoundButton();
  });
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
      <div class="title-english">THE PRINCE OF BUNRI</div><p class="title-description">隣の席の恋。先生に言えない恋。<br>未成年向け・成年向け、それぞれ3編。<br>ひとつ約5分、恋と学びの短編集。</p>
      <button class="primary-button start-button" id="start-game">物語をはじめる<span class="button-arrow" aria-hidden="true">→</span></button>
      <div class="title-links"><button class="text-button" data-action="how">${icon('info')}あそびかた</button><button class="text-button" data-action="notebook">${icon('book')}講義ノート</button></div></div>
      <div class="title-bottom"><div class="facts"><div class="fact"><strong>5</strong><div><span>MINUTES</span><small>ひと休みの物語</small></div></div><div class="fact"><strong>6</strong><div><span>STORIES</span><small>選べる短編集</small></div></div><div class="fact"><strong>18</strong><div><span>ENDINGS</span><small>各物語に3つの結末</small></div></div></div><div class="character-note"><small>どの物語でも、出会うのは</small><p>御家雄一<span>THE PRINCE</span></p></div></div></section>`;
    document.getElementById('start-game').addEventListener('click', () => chooseMode());
    endingTrack = null; musicError = false; syncAudio();
    bindCommon();
  }
  function chooseMode(preview = false) {
    openModal('SIX STORIES, ONE PRINCE', 'どちらの物語をひらく？', `<p class="course-intro">恋も、学びも、あなたのペースで。<br><span>各モードに3編。1編約5分、ミニ問題3問と結末3種類。</span></p><div class="mode-list"><button class="mode-option minor-option" id="minor-mode"><span class="mode-caption">CAMPUS STORY <span>18歳未満向け</span></span><strong>未成年向け</strong><span class="mode-story">隣の席の、王子様。</span><span class="mode-description">同級生の雄一と、講義・謎解き・展示の大ピンチ。<br>中学生・高校生の2コースから選べます。</span><span class="mode-link">${preview ? '学べる内容を見る' : 'コースをえらぶ'} →</span></button><button class="mode-option adult-option" id="adult-mode"><span class="mode-caption">AFTER CLASS <span>18歳以上向け</span></span><strong>成年向け</strong><span class="mode-story">先生と呼べなくなる、その日まで。</span><span class="mode-description">大学4年生のあなたと、教員の御家雄一。<br>講義・雨の日・最終発表。言えない恋の3編。</span><span class="mode-link">${preview ? '学べる内容を見る' : '物語の紹介へ'} →</span></button></div><p class="course-footnote">未成年向けの物語は、大人の方も遊べます。</p>`);
    modal.classList.add('mode-picker');
    document.getElementById('minor-mode').addEventListener('click', () => chooseCourse(preview));
    document.getElementById('adult-mode').addEventListener('click', () => preview ? chooseEpisode('adult', true) : adultIntro());
  }
  function adultIntro() {
    openModal('AFTER CLASS / 成年向け', '先生と呼べなくなる、その日まで。', `<div class="adult-intro"><span class="audience-badge">18歳以上向け・教員との恋</span><p class="adult-catch">好きになる条件なんて、<br>教えてくれなかった。</p><p>あなたは22歳の大学4年生。<br>講義、雨の日の作業、最後の発表。<br>三つの物語から、先生に言えない恋を選べます。</p><p>先生と学生。その距離を前に、あなたは何を伝える？</p><div class="adult-specs"><span>全3編・1編約5分</span><span>各編ミニ問題 × 3</span><span>各編結末 × 3</span></div><p class="modal-note">登場人物の設定・関係・台詞はフィクションです。<br>学習問題にはヒントと解説があります。</p><button class="primary-button" id="start-adult">18歳以上・物語を選ぶ <span aria-hidden="true">→</span></button><button class="text-button mode-back" id="back-to-modes">← モード選択に戻る</button></div>`);
    modal.classList.add('adult-intro-modal');
    document.getElementById('start-adult').addEventListener('click', () => chooseEpisode('adult'));
    document.getElementById('back-to-modes').addEventListener('click', () => chooseMode());
  }
  function chooseCourse(preview = false) {
    openModal('CAMPUS STORY / 未成年向け', 'コースをえらぼう', `<p class="course-intro">隣の席の雄一と、いっしょに学ぼう。学年はむずかしさの目安です。<br><span>どのコースも約5分・3つのミニ問題。ヒントつきです。</span></p><div class="course-list">${Object.values(S.courses).map((course, i) => `<button class="course-option" data-course="${course.id}" aria-label="${course.label}で${preview ? '内容を見る' : '物語を選ぶ'}"><span class="course-number" aria-hidden="true">0${i + 1}</span><span class="course-details"><span class="course-heading"><strong><ruby>${course.label.replace('コース', '')}<rt>${course.reading}</rt></ruby>コース</strong><span class="course-mood">${course.mood}</span></span><span class="course-description">${course.description}</span><span class="course-topics">${course.topics}</span></span><span class="course-arrow" aria-hidden="true">→</span></button>`).join('')}</div><p class="course-footnote">${preview ? 'えらぶと、そのコースで学べる内容を見られます。' : 'このあと、お話をえらべます。まちがえても最後まで遊べます。'}</p><button class="text-button mode-back" id="back-to-modes">← モード選択に戻る</button>`);
    modal.classList.add('course-picker');
    modal.querySelectorAll('[data-course]').forEach(button => button.addEventListener('click', () => {
      chooseEpisode(button.dataset.course, preview);
    }));
    document.getElementById('back-to-modes').addEventListener('click', () => chooseMode(preview));
  }
  function chooseEpisode(courseId, preview = false) {
    const mode = courseId === 'adult' ? 'adult' : 'minor';
    openModal(mode === 'adult' ? 'AFTER CLASS / 成年向け' : 'CAMPUS STORY / 未成年向け', '今日の物語を選ぼう',
      `<p class="course-intro">${'どの物語からでも、初めて遊べます。'}<br><span>1編約5分・ミニ問題3問・結末3種類。${'物語ごとに、学べる内容も変わります。'}</span></p><div class="episode-list">${S.episodes[mode].map((entry, i) => {
        const selected = S.createState(courseId, entry.id), meta = S.episode(selected);
        return `<button class="episode-option${mode === 'adult' ? ' adult-episode' : ''}" data-episode="${entry.id}"><span class="episode-top"><span>STORY 0${i + 1}</span><span>${i ? 'NEW' : 'ORIGINAL'}</span></span><strong>${escape(meta.title)}</strong><span class="episode-description">${escape(meta.description)}</span><span class="episode-topics">${S.course(selected).lessons.map(l => escape(l.title)).join(' / ')}</span><span class="episode-link">${preview ? 'この物語の学びを見る' : 'この物語をはじめる'} →</span></button>`;
      }).join('')}</div><button class="text-button mode-back" id="back-from-episodes">← ${mode === 'adult' ? 'モード選択' : 'コース選択'}に戻る</button>`);
    modal.classList.add('episode-picker');
    modal.querySelectorAll('[data-episode]').forEach(button => button.addEventListener('click', () => {
      if (preview) { notebook(courseId, button.dataset.episode); return; }
      modal.close(); start(courseId, button.dataset.episode);
    }));
    document.getElementById('back-from-episodes').addEventListener('click', () => mode === 'adult' ? chooseMode(preview) : chooseCourse(preview));
  }
  function start(courseId, episodeId = 'lecture') { state = S.createState(courseId, episodeId); endingTrack = null; musicError = false; syncAudio(); screen = 'play'; recordedKey = null; auto = false; chime(); render(); app.focus({ preventScroll: true }); }
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
    return `<div class="play-top"><div class="play-top-left"><span class="chapter-label">${state.chapter === 0 ? 'PROLOGUE' : state.chapter === 4 ? 'EPILOGUE' : 'LESSON 0' + state.chapter} / ${state.mode === 'adult' ? selected.label : '未成年向け・' + selected.label}</span><p class="play-episode">${escape(S.episode(state).title)}</p><h1 class="chapter-title">${selected.chapters[state.chapter]}</h1><div class="lesson-progress" aria-label="講義の進み具合">${[1, 2, 3].map(i => `<span class="${state.learned.includes(selected.lessons[i - 1].id) ? 'done' : state.chapter === i ? 'current' : ''}"></span>`).join('')}</div></div><div class="play-tools"><button class="glass-button${auto ? ' active' : ''}" data-action="auto" aria-label="会話の自動送り" aria-pressed="${auto}">AUTO ${auto ? 'ON' : 'OFF'}</button><button class="glass-button" data-action="history" aria-label="会話ログ">${icon('history')}<span>ログ</span></button><button class="glass-button" data-action="notebook" aria-label="講義ノート">${icon('book')}<span>ノート</span></button><button class="glass-button" data-action="home" aria-label="タイトルに戻る">${icon('home')}</button></div></div>`;
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
        target.innerHTML = `<section class="choice-panel feedback-panel" aria-labelledby="feedback-title"><span class="feedback-status">${f.correct ? '✓ 正解！' : 'なるほど、を持ち帰ろう。'}</span><h2 id="feedback-title">${escape(f.text)}</h2><p class="feedback-explanation">${escape(f.explanation)}</p><button class="primary-button" id="continue-feedback">${'わかった、物語へ'}<span class="button-arrow" aria-hidden="true">→</span></button><p class="learned-label">${icon('book')}${'講義ノートに追加しました'}</p></section>`;
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
    endingTrack = window.BunriMusic.getTrack(state.mode, state.episodeId, S.ending(state));
    if (recordedKey !== 'ending') { addHistory('エピローグ', end.quote + end.text); recordedKey = 'ending'; }
    app.innerHTML = `<section class="stage ending-stage${courseClass()}" aria-labelledby="ending-title">${art}${sparkles}<div class="ending-content"><p class="ending-episode">${escape(S.episode(state).title)}</p><div class="ending-badge">ENDING ${end.number} / ${end.label}</div><h1 id="ending-title">${end.title}</h1><p class="ending-quote">${end.quote}</p><p class="ending-prose">${end.text}</p><p class="ending-after">${end.after}</p><div class="ending-music"><div><span>ENDING MUSIC</span><strong>${escape(endingTrack.title)}</strong><small id="music-status" aria-live="polite"></small></div><button class="secondary-button" id="ending-music-toggle" aria-pressed="false">音楽を再生</button></div><div class="result-card"><p class="result-course">${S.course(state).label} / ${'修了'}</p><div class="result-head"><span>${'今日、持ち帰る小さな学び'}</span><strong>${state.answers.filter(a => a.correct).length}<small> / 3 ${'正解'}</small></strong></div><div class="result-lessons">${S.course(state).lessons.map(lesson => `<span class="lesson-chip">✓ ${lesson.title}</span>`).join('')}</div></div><div class="ending-actions"><button class="primary-button" data-action="notebook">${icon('book')}${'学びを振り返る'}</button><button class="secondary-button" id="another-story">${'別の物語を読む'}</button><button class="secondary-button" id="finish-game">タイトルへ戻る →</button></div><p class="ending-bottom-note">${'遊んでくれて、ありがとう。別の選択で、別の未来にも出会えます。'}<br>次の方は「タイトルへ戻る」から、モードを選び直せます。</p></div></section>`;
    document.getElementById('finish-game').addEventListener('click', () => { title(); document.getElementById('start-game').focus({ preventScroll: true }); }); bindCommon();
    document.getElementById('another-story').addEventListener('click', () => chooseEpisode(state.courseId));
    document.getElementById('ending-music-toggle').addEventListener('click', toggleSound);
    musicError = false; syncAudio(); updateEndingMusic();
    app.focus({ preventScroll: true });
  }
  function openModal(kicker, heading, body) {
    clearTimeout(autoTimer); if (!modal.open) lastModalFocus = document.activeElement;
    modal.classList.remove('course-picker', 'mode-picker', 'adult-intro-modal', 'episode-picker');
    document.getElementById('modal-kicker').textContent = kicker;
    document.getElementById('modal-title').textContent = heading;
    document.getElementById('modal-body').innerHTML = body;
    if (!modal.open) modal.showModal();
    modal.scrollTop = 0;
  }
  function notebook(previewCourseId, previewEpisodeId = 'lecture') {
    const preview = screen === 'title';
    if (preview && !previewCourseId) { chooseMode(true); return; }
    const notebookState = preview ? S.createState(previewCourseId, previewEpisodeId) : state;
    const selected = S.course(notebookState);
    openModal('YOUR LITTLE NOTEBOOK', '今日の講義ノート', `<span class="notebook-course">${selected.label} / ${escape(S.episode(notebookState).title)}</span><p>${preview ? 'この物語で出会う、三つの小さな学び。予習なしで大丈夫。雄一と一緒に考えてみよう。' : state.mode === 'adult' ? '先生と確かめた三つの学び。自分の言葉で、もう一度振り返ってみよう。' : 'わかったことも、もう一度考えたいことも。二人のノートに残しておこう。'}</p>${selected.lessons.map(lesson => { const unlocked = !preview && state.learned.includes(lesson.id); return `<section class="notebook-entry${unlocked ? '' : ' locked'}"><span class="eyebrow">LESSON ${lesson.number}${unlocked ? ' / LEARNED' : ' / これからの学び'}</span><h3>${lesson.title}</h3><p>${unlocked ? escape(lesson.body) : lesson.subtitle}</p>${unlocked ? `<pre>${escape(lesson.example)}</pre>` : `<p class="modal-note">${'ミニ問題を解くと、解説がここに残ります。'}</p>`}</section>`; }).join('')}${preview ? '<button class="secondary-button notebook-back" id="back-to-courses">ほかの物語を見る</button>' : ''}`);
    document.getElementById('back-to-courses')?.addEventListener('click', () => chooseEpisode(selected.id, true));
    document.getElementById('close-modal').focus({ preventScroll: true });
  }
  function how() { openModal('HOW TO PLAY', '5分だけ、物語の中へ。', '<ol class="how-list"><li>「物語をはじめる」で未成年向け・成年向けを選びます。未成年向けは同級生との物語で、中学生・高校生の2コース。成年向けは18歳以上の方に向けた、大学生と教員の恋の物語です。クリック、Enter、Spaceで会話が進みます。文字の表示中に押すと、全文を表示します。</li><li>会話の選択肢で、雄一との距離が変わります。選択肢はクリック、または数字の1・2・3で選べます。</li><li>講義には三つのミニ問題。ヒントを見ても、間違えても大丈夫。必ず解説が出て、物語の最後まで遊べます。</li><li>各モードに三編ずつ、合計六編の物語があります。どの物語からでも遊べて、それぞれの結末は三種類。クイズの点数ではなく、会話の選択で決まります。最後はタイトルに戻して、次の方へ。</li></ol><p class="modal-note">所要時間の目安は約4〜6分。AUTOは会話だけを自動で進め、問題と選択肢では止まります。音は最初はオフ。スピーカーボタンで音楽を流せます。結末では、そのエンディング専用の曲に切り替わります。結末の「音楽を再生」から聴くこともできます。</p>'); }
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
    activeTones.add(oscillator);
    oscillator.onended = () => { activeTones.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
  }
  function chime() { tone(659.25, .2, .025); }
  function updateSoundButton() { const button = document.getElementById('sound-toggle'); button.innerHTML = icon(sound ? 'sound' : 'mute'); button.setAttribute('aria-label', sound ? '音をオフにする' : '音をオンにする'); button.setAttribute('aria-pressed', String(sound)); }
  function updateEndingMusic() {
    const button = document.getElementById('ending-music-toggle');
    if (!button) return;
    button.textContent = sound ? '音楽を止める' : '音楽を再生';
    button.setAttribute('aria-pressed', String(sound));
    document.getElementById('music-status').textContent = musicError ? '再生できませんでした。もう一度お試しください。' : musicPlaying ? 'このエンディングのオリジナル曲を再生中' : sound ? '曲を読み込んでいます…' : 'このエンディングのオリジナル曲';
  }
  function syncAudio() {
    const ticket = ++audioRevision;
    clearInterval(audioLoop); audioLoop = null;
    for (const oscillator of activeTones) { try { oscillator.stop(); } catch {} }
    activeTones.clear();
    endingPlayer.set(endingTrack, sound, !document.hidden);
    updateEndingMusic();
    if (!sound || endingTrack || document.hidden) {
      if (audioContext) audioContext.suspend().catch(() => {});
      return;
    }
    try {
      if (!audioContext) {
        const Context = window.AudioContext || window.webkitAudioContext;
        audioContext = new Context(); audioMaster = audioContext.createGain();
        audioMaster.gain.value = .3; audioMaster.connect(audioContext.destination);
      }
      audioContext.resume().then(() => {
        if (ticket !== audioRevision || !sound || endingTrack || document.hidden) return;
        const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66, 261.63, 349.23, 440, 523.25, 493.88, 392, 293.66, 329.63];
        const playNote = () => { if (document.hidden) return; tone(notes[noteIndex % notes.length], 2.2, .09); if (noteIndex % 4 === 0) tone(notes[noteIndex % notes.length] / 2, 3.3, .075); noteIndex++; };
        playNote(); audioLoop = setInterval(playNote, 740);
      }).catch(() => { if (ticket === audioRevision) audioFailed(); });
    } catch { audioFailed(); }
  }
  function audioFailed() {
    sound = false; clearInterval(audioLoop); updateSoundButton();
    openModal('SOUND', '音声を再生できませんでした', '<p>音声を再生するには、スピーカーボタンからもう一度お試しください。物語はそのまま遊べます。</p>');
  }
  function toggleSound() {
    sound = !sound; musicError = false;
    syncAudio(); updateSoundButton();
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(autoTimer); else scheduleAuto(); syncAudio(); });
  document.addEventListener('keydown', event => {
    if (modal.open || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const focusedButton = document.activeElement?.closest('button,a');
    if (screen === 'play' && /^[123]$/.test(event.key) && !state.feedback && ['quiz', 'choice'].includes(S.scene(state).type)) { event.preventDefault(); choose(Number(event.key) - 1); return; }
    if (screen === 'play' && ['Enter', ' '].includes(event.key) && (!focusedButton || focusedButton.id === 'next-line')) { event.preventDefault(); next(); }
  });
  updateSoundButton(); title();
})();
