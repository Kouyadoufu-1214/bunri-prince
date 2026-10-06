(function (root) {
  'use strict';
  // Short, choice-specific pauses: the same exchange can bring the pair closer or leave space.
  const moments = {
    minor: {
      lecture: [
        ['二人の真ん中に置いたノートを、雄一が少しだけこちらへ寄せる。「もう一回、聞いてもいい？」さっきまで見ていた条件欄より、今はその目の方が近い。', '雄一は椅子を引き直して、ノート一冊分の場所を空けた。「じゃあ、ここが作戦本部ね」きちんと空けてくれたその場所が、かえってうれしかった。', '「焼きそば、そんなに好きなんだ」雄一は声を抑えて笑う。緊張していた肩がほどけて、二人の机の間には、もう気まずさがなかった。'],
        ['鞄を持つ手が、同時に止まった。雄一がこちらへ半歩。「……このくらいの隣？」うなずくと、いつも余裕のある王子様が、先に目をそらした。', '出口へ向かいかけた雄一が、振り返る。「来週まで、星の目印を消さないでね」離れたところから見える笑顔に、次の講義が待ち遠しくなった。', '雄一がドアを押さえて待っている。「相棒、準備は？」こちらも笑ってうなずいた。足並みがぴたりとそろう。それも、ちょっと特別だ。']
      ],
      festival: [
        ['展示の音が、一瞬遠くなった。雄一が身を寄せ、小さな声で言う。「最後のヒントは、君にだけ」顔を上げると、思っていたよりずっと近くで目が合った。', '雄一は案内図を二人に見える向きへ回した。「急がなくていいよ。一緒に解きたいから」並んで考える距離を、彼も気に入っているらしい。', '「寄り道の予感がするなあ」雄一が楽しそうに笑い、一歩先で待ってくれる。追いかけると、ちょうど同じ速さで歩き出した。'],
        ['帰ろうとした瞬間、雄一が名前を呼んだ。足を止めると、彼も近づいてくる。「今日のこと、答え合わせだけで終わりたくないんだ」その声だけは、謎かけではなかった。', '雄一は手元の案内図を丁寧に折った。「次は、君が行きたい展示からね」約束が一つ増えた。それだけで、人混みの向こうにも彼を見つけられそうだった。', '「本日の名探偵に拍手！」大げさな身振りに思わず吹き出す。雄一も笑った。難しい暗号より、この笑顔を解く方が簡単だった。']
      ],
      rescue: [
        ['同じキーに手を伸ばして、二人とも止まる。「……先、どうぞ」譲り合って、また笑う。雄一の耳が少し赤い。画面より隣の人が気になって、カーソルを見失った。', '雄一が画面の角度を変え、こちらのために椅子を引いた。「ここ、一番よく見える」任せてもらえる場所がある。その安心が、静かに胸を温めた。', '「よし、緊急対策チーム再始動！」雄一の明るい声に、こちらも背筋を伸ばす。焦りの代わりに、小さな自信が二人の間に戻ってきた。'],
        ['展示の光を見つめていると、すぐ隣から声がした。「成功した顔、ちゃんと見ておきたくて」振り向いた距離の近さに、今度は自分の言葉が止まった。', '片付けの手を止め、雄一がこちらへ笑いかけた。「次の展示も、相談に乗ってくれる？」次、という言葉が、今日一番うれしい成果になった。', '雄一と少し離れて展示を眺める。目が合うと、どちらからともなく親指を立てた。言葉がなくても通じる合図を、今日ひとつ覚えた。']
      ]
    },
    adult: {
      lecture: [
        ['先生が返そうとしたペンを、受け取る。その一瞬だけ、視線が重なった。「……君は、ときどき難しい問いを出すね」朗らかな声が、最後の一音だけ柔らかくなる。', '先生は資料をそろえ、いつもの距離へ椅子を戻した。「君の考え、最後まで聞かせて」急がず聞いてくれる。その姿に、また少し惹かれてしまう。', '先生がぱっと笑った。「いいね、その調子！」明るい声につられて笑うと、胸のつかえがほどけた。今は、この時間を大事にしよう。'],
        ['扉の前で振り返る。先生も、まだこちらを見ていた。「……気をつけて帰ってね」たったそれだけの言葉に、言わなかった続きがあるような気がした。', '先生は教卓から手を振った。「次も、君らしい答えを楽しみにしてる」返した会釈に、ありがとう以外の気持ちまで乗っていなかっただろうか。', '「お疲れさま！」最後まで明るい声だった。廊下へ出ると、講義の余韻が静かに残る。自分で考え抜いた一日を、少し誇らしく思った。']
      ],
      rain: [
        ['窓を打つ雨音に、先生の声が重なる。「今の言葉は、ちゃんと届いたよ」目が合い、すぐには逸らせなかった。送信ボタンのない気持ちだけが、胸に残っている。', '先生は隣の資料へ視線を戻し、小さくうなずいた。「続きは、君が言葉にできたときでいい」その余白をくれる優しさに、呼吸がゆっくり戻った。', '「通信も気持ちも、慌てると難しいね」先生が笑った。つられて笑うと、雨音まで少し軽く聞こえた。今は、こうして話せるだけでいい。'],
        ['傘を持って立ち上がると、先生も顔を上げた。「またね」いつもより短い挨拶。そのあとに残った沈黙を、雨上がりの光がそっと埋めた。', '廊下から振り返る。先生は窓辺で、穏やかに手を振っていた。伝えきれなかった分まで、もう一度、丁寧に会釈を返した。', '「足元、気をつけて！」はっきりした声が背中を押してくれる。雨はもう弱まっていた。今日持ち帰るのは、三つの学びと、少し軽くなった心。']
      ],
      presentation: [
        ['画面から顔を上げると、先生はまっすぐこちらを見ていた。「君の言葉で伝わっているよ」その声にうなずく。大丈夫と言われるより、ずっと力が湧いた。', '先生が椅子を少し引き、発表を聞く姿勢になる。「じゃあ、最初の一文から」その距離は、もう答えを教えるためではなく、受け取るためのものだった。', '「よし、本番を楽しんでおいで！」先生の明るい笑顔が、緊張を一つほどく。握りしめていた原稿を、少し緩めることができた。'],
        ['拍手がやんでも、目が合った瞬間だけ、胸の音はやまなかった。先生が小さくうなずく。今はまだ言えない言葉を、いつか自分の声で伝えたいと思った。', '片付ける先生に、もう一度お礼を言う。「こちらこそ。いい発表だったよ」穏やかな笑顔を見て、この時間を積み重ねてきてよかったと思った。', '「お疲れさま、やりきったね！」先生が笑う。こちらも、ようやく大きく息を吐いた。この達成感だけは、誰かとの比較では測れない。']
      ]
    }
  };
  const cache = new WeakMap();
  function expand(scenes, state) {
    if (!cache.has(scenes)) {
      const rows = moments[state.mode][state.episodeId];
      cache.set(scenes, scenes.flatMap(scene => {
        const i = scene.id === 'invitation' ? 0 : scene.id === 'farewell' ? 1 : -1;
        if (i < 0) return [scene];
        const sharedLine = state.mode === 'minor' && state.episodeId === 'rescue' && i === 0;
        return [scene, {
          id: scene.id + 'Pause', speaker: 'あなた', choiceIndex: i + 1,
          variants: rows[i], pause: true, quoteSpeakers: ['御家雄一'],
          variantSpeakers: sharedLine ? [['あなたと雄一'], ['御家雄一'], ['御家雄一']] : undefined
        }];
      }));
    }
    return cache.get(scenes);
  }
  const assets = Object.fromEntries(['calm', 'explain', 'smile', 'shy'].map(key => [key, `assets/yuichi-${key}.png`]));
  const exclusiveAssets = Object.fromEntries([
    ['minor:lecture', 'campus-lecture'], ['minor:festival', 'campus-festival'], ['minor:rescue', 'campus-rescue'],
    ['adult:lecture', 'teacher-lecture'], ['adult:rain', 'teacher-rain'], ['adult:presentation', 'teacher-presentation']
  ].map(([key, file]) => [key, `assets/yuichi-${file}.png`]));
  function direction(state, scene, ending) {
    let expression = 'calm', distance = state.chapter === 0 ? 'far' : 'normal';
    if (scene.lesson || scene.type === 'quiz') expression = 'explain';
    if (/meet|reassure|arrived|restore|submitted|applause|open|rainStops/.test(scene.id)) expression = 'smile';
    if (/Thought|Heart|Flirt|fluster|confession|private|words|reason/.test(scene.id)) { expression = 'shy'; distance = 'near'; }
    if (scene.variants || state.feedback?.type === 'choice') {
      const choice = scene.variants ? state.choices[scene.choiceIndex] : state.choices.at(-1);
      expression = ['shy', 'calm', 'smile'][choice] || 'calm';
      distance = ['near', 'normal', 'far'][choice] || 'normal';
      if (state.mode === 'minor' && scene.id === 'farewellPause' && choice === 0) distance = 'close';
    }
    if (ending) { expression = ending === 'sweet' ? 'shy' : 'smile'; distance = ending === 'sweet' ? 'close' : 'normal'; }
    // Establish the episode outfit immediately; keep close-ups for emotional beats.
    const exclusive = scene.exclusive || Boolean(ending) || (!scene.variants && state.feedback?.type !== 'choice' && expression !== 'shy');
    return { expression, distance, src: exclusive ? exclusiveAssets[`${state.mode}:${state.episodeId}`] : assets[expression], mood: state.episodeId === 'rain' && state.chapter < 4 ? 'rain' : state.chapter === 4 ? 'sunset' : 'day' };
  }
  const api = { expand, direction, assets, exclusiveAssets };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriStaging = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
