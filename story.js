(function (root) {
  'use strict';
  const courses = typeof module !== 'undefined' && module.exports ? require('./courses.js') : root.BunriCourses;
  const scenes = [
    { id: 'intro', chapter: 0, speaker: 'あなた', text: '名古屋文理大学、午後の講義。窓から差し込む光が、机に四角い模様を作っている。空いている席を探していると、窓際の学生がこちらを見た。' },
    { id: 'meet', speaker: '御家雄一', text: '「ここ、空いてるよ。今日、ペアで課題をやるんだって。……よかったら、俺と組まない？」' },
    { id: 'introduce', speaker: 'あなた', text: '御家雄一。説明がうまくて、誰にでも親切で、なぜかいつも絵になる人。周りがこっそり「ブンリの王子様」と呼んでいるのを、本人は知っているのだろうか。' },
    { id: 'assignment', speaker: '担当教員', text: '「今日のテーマは、伝える・分ける・探す。三つの小さな課題を、隣の人と考えてください。答えだけでなく、どう考えたかも大事ですよ」' },
    { id: 'reassure', speaker: '御家雄一', text: '「難しそうな顔してる。大丈夫。わからないところは、二人で見つければいいから。俺だって、全部わかるわけじゃないし」' },
    { id: 'greeting', type: 'choice', prompt: '少し緊張する、隣の席。最初のひと言は？', options: [
      { text: '「一緒なら、ちょっと楽しみかも」', points: 2, response: '「……それ、俺も。じゃあ、今日はいいペアになれそうだね」雄一はうれしそうに、ノートを二人の真ん中へ置いた。' },
      { text: '「まずは自己紹介からしよう」', points: 1, response: '「確かに。御家雄一です。好きなものは、わかりやすいコードと、学食の時間。……よろしく」少し照れた笑顔に、こちらも肩の力が抜けた。' },
      { text: '「単位のために、がんばります！」', points: 0, response: '「目標が明確でいいね。俺も単位はほしい」思ったより真剣な返事で、二人そろって笑ってしまった。' }
    ] },
    { id: 'dataIntro', chapter: 1, speaker: '担当教員', lesson: 'binary', lessonPart: 'intro' },
    { id: 'dataExplain', speaker: '御家雄一', lesson: 'binary', lessonPart: 'explain' },
    { id: 'dataThought', speaker: 'あなた', text: 'ノートを指さす指が近い。いや、今は数字を見る時間だ。雄一は端に「二人なら解ける」と小さく書いて、こちらにペンを渡した。' },
    { id: 'dataQuiz', type: 'quiz', lesson: 'binary', lessonPart: 'quiz' },
    { id: 'dataAfter', speaker: '御家雄一', text: '「じゃあ、俺からもう一つ。ノートのこの数字、読める？」端に書かれていたのは『10』。答えは2。「今日のチームの人数。……一人じゃないってこと」' },
    { id: 'dataHeart', speaker: 'あなた', text: '王子様って、こういう台詞を自然に言うものなのか。胸の中で何かが動いたけれど、これはきっと講義への意欲。そういうことにしておこう。' },
    { id: 'conditionIntro', chapter: 2, speaker: '担当教員', lesson: 'condition', lessonPart: 'intro' },
    { id: 'conditionExplain', speaker: '御家雄一', lesson: 'condition', lessonPart: 'explain' },
    { id: 'conditionQuiz', type: 'quiz', lesson: 'condition', lessonPart: 'quiz' },
    { id: 'conditionThought', speaker: 'あなた', text: '雄一は自分のノートに、もう一行書き足した。『もし講義が終わったら、一緒に文化祭を回る』。その下の条件欄は、まだ空白だった。' },
    { id: 'conditionQuestion', speaker: '御家雄一', text: '「このプログラム、条件が決まらなくてさ。……どう書いたら、実行できそう？」普段あんなに説明がうまいのに、今は少しだけ、言葉がたどたどしい。' },
    { id: 'invitation', type: 'choice', prompt: '空白の条件欄に、どう答える？', options: [
      { text: '「私たち二人が、行きたいなら」', points: 2, response: '「じゃあ、俺の方はもうtrueだ」言い終わってから、雄一は照れたように目をそらした。「……そっちは？」' },
      { text: '「課題を提出できたら、かな」', points: 1, response: '「うん。まずは一緒に、最後までやろう」雄一は条件欄に丁寧に書き込んだ。さっきより少し、ペンを握る手に力が入っている。' },
      { text: '「屋台の焼きそばが残っていたら！」', points: 0, response: '「それ、かなり大切な条件だね」雄一が吹き出した。「売り切れる前に、課題を終わらせないと」' }
    ] },
    { id: 'algorithmIntro', chapter: 3, speaker: '担当教員', lesson: 'algorithm', lessonPart: 'intro' },
    { id: 'algorithmExplain', speaker: '御家雄一', lesson: 'algorithm', lessonPart: 'explain' },
    { id: 'algorithmQuiz', type: 'quiz', lesson: 'algorithm', lessonPart: 'quiz' },
    { id: 'algorithmThought', speaker: 'あなた', text: '二人で最後の答えを書き込む。最初は記号にしか見えなかったものが、少しずつ意味を持ち始めていた。隣の席も、さっきより近く感じる。' },
    { id: 'algorithmFlirt', speaker: '御家雄一', text: '「でもさ。教室で君を見つけたときは、二分探索じゃなかった」雄一は提出ボタンから目を上げた。「……最初から、こっちに来てくれたらいいなって思ってた」' },
    { id: 'fluster', speaker: 'あなた', text: '予想外の言葉に、返事が止まる。雄一は慌てて「今の、ノートに書かなくていいから」と付け足した。もう遅い。たぶん、しばらく覚えている。' },
    { id: 'wrapup', chapter: 4, speaker: '担当教員', text: '「はい、今日はここまで。わからなかったところを一緒に考える、それも大切な学びです。課題を提出したペアから終了してください」' },
    { id: 'submitted', speaker: '御家雄一', text: '「提出、完了。ありがとう。君とだったから、いつもの講義より楽しかった」閉じかけたノートの間から、あの条件欄が見える。まだ、実行前の一行。' },
    { id: 'farewell', type: 'choice', prompt: '講義が終わった。隣の王子様に、ひと言。', options: [
      { text: '「このあとも、隣にいてくれる？」', points: 2, response: '雄一は一瞬だけ目を丸くして、それから、ゆっくり笑った。「……うん。俺も、そう言いたかった」' },
      { text: '「また、次の講義もペアになろう」', points: 1, response: '「約束。窓際のこの席、覚えてて」雄一がノートの端に、小さな星を一つ書いた。次回の目印らしい。' },
      { text: '「よし、焼きそば争奪戦へ出発！」', points: 0, response: '「了解。最短ルート、考えとく」雄一が鞄を持って立ち上がる。王子様も、焼きそばの前では頼れる戦友だ。' }
    ] },
    { id: 'ending', type: 'ending' }
  ];
  const endings = {
    sweet: { number: '01', label: 'SWEET END', title: '君だけの、王子様。', quote: '「みんなの王子様より、君の隣がいい」', text: '教室を出るとき、雄一はあなたの歩幅に合わせて立ち止まった。ノートの条件欄には、二つのtrue。手が触れるくらいの距離で、二人は文化祭のにぎわいへ歩き出す。今日覚えたどの手順にもない、少し特別な続きが始まった。', after: '恋のアルゴリズムは、ここから二人で。' },
    promise: { number: '02', label: 'NEXT CHAPTER END', title: '次の講義も、隣で。', quote: '「この席、来週も空けておくね」', text: '二人で学んだノートには、答えと、小さな星が一つ。名前のつかない気持ちは、まだ未定義のままでいい。次にこの教室へ来るのが、少し楽しみになった。雄一も同じ気持ちなのは、振り返ったときの笑顔でわかった。', after: 'まだ書かれていない、二行目がある。' },
    buddy: { number: '03', label: 'BEST BUDDY END', title: '最高の相棒、発見。', quote: '「君と組むと、なんでも楽しくなるね」', text: '向かう先は、もちろん焼きそばの屋台。効率のいいルートを考える雄一と、ソースの香りを頼りに進むあなた。方法は違っても、目指す先は同じだ。「次の課題も、このチームで」王子様は笑って、拳を軽く合わせてきた。', after: '二人なら、難問だってきっと解ける。' }
  };
  function createState(courseId = 'junior') {
    if (!Object.prototype.hasOwnProperty.call(courses, courseId)) throw new RangeError('Unknown course: ' + courseId);
    return { courseId, index: 0, chapter: 0, affection: 0, answers: [], choices: [], learned: [], history: [], feedback: null };
  }
  function course(state) { return courses[state.courseId]; }
  function scene(state) {
    const base = scenes[state.index];
    const selected = course(state);
    if (base.lessonPart) {
      const lesson = selected.lessons.find(item => item.id === base.lesson);
      if (base.lessonPart === 'intro') return { ...base, text: lesson.intro };
      if (base.lessonPart === 'explain') return { ...base, text: lesson.dialogue, board: lesson.board };
      return { ...base, ...lesson.quiz };
    }
    return { ...base, ...selected.sceneOverrides[base.id] };
  }
  function advance(state) { if (scene(state).type === 'ending' || ((scene(state).type === 'quiz' || scene(state).type === 'choice') && !state.feedback)) return false; state.feedback = null; state.index++; if (scene(state).chapter !== undefined) state.chapter = scene(state).chapter; return true; }
  function answer(state, index) {
    const current = scene(state);
    if (state.feedback || !['quiz', 'choice'].includes(current.type) || !Number.isInteger(index) || index < 0 || index >= current.options.length) return false;
    if (current.type === 'quiz') {
      const correct = index === current.correct;
      state.answers.push({ lesson: current.lesson, selected: index, correct });
      if (!state.learned.includes(current.lesson)) state.learned.push(current.lesson);
      state.feedback = { type: 'quiz', correct, text: correct ? current.right : current.wrong, explanation: current.explanation };
    } else {
      const choice = current.options[index]; state.affection += choice.points; state.choices.push(index);
      state.feedback = { type: 'choice', text: choice.response };
    }
    return true;
  }
  function ending(state) { return state.affection >= 4 ? 'sweet' : state.affection >= 2 ? 'promise' : 'buddy'; }
  function endingContent(state) { const key = ending(state); return { ...endings[key], ...course(state).endings?.[key] }; }
  const api = { courses, course, scenes, createState, scene, advance, answer, ending, endingContent };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
