(function (root) {
  'use strict';
  const courses = typeof module !== 'undefined' && module.exports ? require('./courses.js') : root.BunriCourses;
  // Learning material is shared; narrative data never modifies the original three courses.
  const course = {
    id: 'adult', label: '成年向け・教員編',
    chapters: ['先生と、私。', '言えない気持ちの符号', '越えられない条件', '答えのない探索', '先生と呼ぶ、その先で'],
    lessons: courses.senior.lessons.map(lesson => ({
      ...lesson,
      board: { ...lesson.board, label: lesson.id === 'binary' ? '御家先生の板書' : lesson.board.label },
      quiz: { ...lesson.quiz, options: [...lesson.quiz.options] }
    })),
    sceneOverrides: {}
  };
  const scenes = [
    { id: 'intro', chapter: 0, speaker: 'あなた', text: '22歳、大学4年の秋。名古屋文理大学の文化祭が近づく頃、私は最後の情報の講義を受けていた。教壇に立つ御家雄一先生を、今日も目で追ってしまう。' },
    { id: 'introduce', speaker: 'あなた', text: '穏やかな声、少しだけ緩んだネクタイ。みんなが冗談めかして呼ぶ「ブンリの王子様」。私にとっては、好きになってはいけない人、のはずだった。' },
    { id: 'assignment', speaker: '御家雄一', text: '「今日の演習は三問。二進数、条件分岐、探索です。考え方を確かめる練習なので、成績には入りません。質問があれば、手を挙げてください」' },
    { id: 'meet', speaker: 'あなた', text: '手を挙げると、先生が窓際の席まで来てくれた。机一つ分の距離。それだけで、さっきまで読めていた問題文が頭から抜けてしまう。' },
    { id: 'greeting', type: 'choice', prompt: '「どこで迷いましたか？」先生に、どう答える？', options: [
      { text: '「先生が近いと、少し緊張します」', points: 2, response: '「……それは、困りましたね」先生の指が、ページの途中で止まる。少し離れてから、いつもの声に戻った。「では、ここから説明しましょう」' },
      { text: '「この講義が終わるの、寂しいです」', points: 1, response: '「私も、最後の講義は少し寂しいですよ」先生は目を細めた。「だから今日は、持ち帰れるものを一つ増やしましょう」' },
      { text: '「二進数から、お願いします」', points: 0, response: '「もちろん。焦らず、一つずつ」差し出されたプリントの余白に、先生が数字を書き込む。その丁寧さに、また少し惹かれてしまう。' }
    ] },
    { id: 'dataIntro', chapter: 1, speaker: '御家雄一', lesson: 'binary', lessonPart: 'intro' },
    { id: 'dataExplain', speaker: '御家雄一', lesson: 'binary', lessonPart: 'explain' },
    { id: 'dataThought', speaker: 'あなた', text: '0か1なら、こんなに迷わないのに。先生を好きかと聞かれたら、答えはもう決まっている。でも、口にしていいかどうかは、別の問題だ。' },
    { id: 'dataQuiz', type: 'quiz', lesson: 'binary', lessonPart: 'quiz' },
    { id: 'dataAfter', speaker: '御家雄一', text: '「数字は、読み方が決まっているから伝わります。言葉は……そう簡単ではありませんね」ふと視線が重なった。先生は何か言いかけて、ペンの蓋を閉じた。' },
    { id: 'dataHeart', speaker: 'あなた', text: '今の沈黙まで、期待してしまう。先生は誰にでも親切だ。その事実と、私だけを見てほしい気持ちを、同じ余白に書くことはできなかった。' },
    { id: 'conditionIntro', chapter: 2, speaker: '御家雄一', lesson: 'condition', lessonPart: 'intro' },
    { id: 'conditionExplain', speaker: '御家雄一', lesson: 'condition', lessonPart: 'explain' },
    { id: 'conditionQuiz', type: 'quiz', lesson: 'condition', lessonPart: 'quiz' },
    { id: 'conditionThought', speaker: 'あなた', text: '条件がそろわなければ、先には進めない。先生と学生。黒板のANDとNOTが、今だけ妙に遠回しな言葉に見えた。私は小さく息を吸った。' },
    { id: 'conditionQuestion', speaker: '御家雄一', text: '「まだ、聞きたいことがありますか？」うなずくと、先生は待ってくれた。窓の外から、文化祭の準備をする学生たちの笑い声が届く。' },
    { id: 'invitation', type: 'choice', prompt: '講義の質問ではない。それでも、伝える？', options: [
      { text: '「先生じゃなかったら、誘っていました」', points: 2, response: '「……簡単に答えてはいけない質問ですね」先生が目を伏せる。「今は、あなたの先生でいさせてください」拒まれたはずなのに、その声は少しだけ揺れていた。' },
      { text: '「卒業しても、覚えていてくれますか」', points: 1, response: '「覚えています。質問の前に、いつも一度だけ息を吸うことも」そこまで言って、先生は困ったように笑った。「……よく、考えてから話しますね」' },
      { text: '「考え方がわかりました。ありがとう」', points: 0, response: '「それなら、よかった」先生がいつもの表情に戻る。口にしなかった言葉は、ノートに挟んでおこう。今は、この講義を最後まで受けたい。' }
    ] },
    { id: 'algorithmIntro', chapter: 3, speaker: '御家雄一', lesson: 'algorithm', lessonPart: 'intro' },
    { id: 'algorithmExplain', speaker: '御家雄一', lesson: 'algorithm', lessonPart: 'explain' },
    { id: 'algorithmQuiz', type: 'quiz', lesson: 'algorithm', lessonPart: 'quiz' },
    { id: 'algorithmThought', speaker: 'あなた', text: '数字なら、候補を半分ずつにできる。先生の気持ちには、順番も正解表もない。探すのをやめるかどうかだけは、自分で決められる。' },
    { id: 'algorithmFlirt', speaker: '御家雄一', text: '「急いで答えを出さなくてもいいんです」プリントを返す先生の声が、少し低くなる。「答える側にも、時間が必要なことがありますから」' },
    { id: 'fluster', speaker: 'あなた', text: 'それが演習の話だけではない気がして、顔を上げた。先生はもう教壇へ戻っていた。伸ばしかけた手を、私はノートの上に戻す。' },
    { id: 'wrapup', chapter: 4, speaker: '御家雄一', text: '「これで、今日の講義は終わりです。ここで覚えたことを、どこかで使ってもらえたら嬉しいです」椅子の音が重なり、学生たちが廊下へ出ていく。' },
    { id: 'submitted', speaker: 'あなた', text: '私も鞄を持って立ち上がる。教室の扉は開いたまま。最後に一度だけ振り返ると、先生はまだ、こちらを見ていた。' },
    { id: 'farewell', type: 'choice', prompt: '「先生」と呼べる時間が、少なくなっていく。最後のひと言は？', options: [
      { text: '「いつか、名前で呼んでもいいですか」', points: 2, response: '「……そのときは、もう一度聞いてください」先生の笑顔が、ほんの少し崩れた。「今日の言葉を、忘れずにいます」' },
      { text: '「この続きは、卒業した私に聞いてください」', points: 1, response: '「わかりました。続きを、急がないでおきます」答えは約束より曖昧で、沈黙より温かかった。私はうなずいて、ノートを抱きしめる。' },
      { text: '「先生の講義を受けられて、よかった」', points: 0, response: '「その言葉は、教員として一番嬉しいです」まっすぐな笑顔だった。この気持ちが恋のままでも、感謝はきっと、ちゃんと届いた。' }
    ] },
    { id: 'ending', type: 'ending' }
  ];
  const endings = {
    sweet: { number: '01', label: 'AFTER GRADUATION END', title: '先生と呼ばない、春。', quote: '「今日は、雄一でいいですよ」', text: '春。卒業し、成績評価も指導関係も終わった後、街のカフェで再会した。もう一度、あの日の質問をする。雄一は今度こそ迷わず笑った。「私からも、誘っていいですか」机一つ分の距離を、今度は二人の意思で少しずつ縮めていく。', after: '言えなかった恋に、ようやく名前がつく。' },
    promise: { number: '02', label: 'UNSENT LETTER END', title: 'まだ、送れない一行。', quote: '「続きは、いつか聞かせてください」', text: 'ノートの最後には、解き終えた三問と、書きかけの言葉。私はそのページを閉じた。先生は先生のまま、私は自分の未来へ進もう。卒業した日に読み返したら、違う答えが見つかるかもしれない。その余白を、今は大切にしたかった。', after: '未送信は、終わりの意味ではない。' },
    buddy: { number: '03', label: 'DEAR TEACHER END', title: '恋を、栞にして。', quote: '「あなたなら、この先も考えていけます」', text: '文化祭のにぎわいへ、一人で歩き出す。胸が少し痛むのは、好きだった証拠だ。先生にもらった考え方は、これから何度でも使える。この恋は、学生最後のノートに挟んでおこう。いつか笑って開ける、大切な一ページとして。', after: '好きになった時間まで、間違いにはしない。' }
  };
  const api = { course, scenes, endings };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriAdultStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
