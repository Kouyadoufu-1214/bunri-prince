(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' && module.exports ? require('./minigame-challenges.js') : root.BunriChallenges;
  const catalog = {
    'minor:lecture': { kind: 'bits', title: 'ふたりのビット・ラボ', subtitle: 'スイッチを灯して、数字を届けよう。', after: 'dataQuiz', sprite: 'campus-lecture', intro: '「今度は、手を動かしてみよう。このランプ、1のところだけ点けるんだ。五つの数字、俺と一緒に届けてみない？」雄一がカーディガンの袖を引き、ペンを差し出した。', reply: '「できること、一つ増えたね。君が考えているときの顔、つい見ちゃった」雄一はペンを受け取って、少しだけ照れた。', lesson: '各桁の重みを足すと、二進数が表す数になる。', reward: 'ビットの相棒' },
    'minor:festival': { kind: 'memory', title: 'ひみつのペア通信', subtitle: '符号と言葉をそろえて、手紙をひらこう。', after: 'codeQuiz', sprite: 'campus-festival', intro: '雄一が、星の封をした手紙を取り出した。「この符号表は、俺たちだけのルール。カードをめくって、符号と文字のペアを見つけて」いつもより、いたずらっぽい笑顔だった。', reply: '「手紙、開けられたね。……伝えたかった言葉、もうわかった？」封筒を受け取る指先に、少しだけ力が入った。', lesson: '符号は、対応するルールを共有して初めて読める。符号化だけで秘密になるわけではない。', reward: 'ひみつ通信の名人' },
    'minor:rescue': { kind: 'sequence', title: '展示レスキュー・コマンド', subtitle: '作業カードを組んで、展示を復旧しよう。', after: 'debugQuiz', sprite: 'campus-rescue', intro: '上着を脱いだ雄一が、ノートパソコンを抱えて戻ってきた。「一度に全部変えると、原因がわからなくなるね。やることをカードにしたから、順番を組んでくれる？」', reply: '「手順が見えると、落ち着けるね。助かった」袖をまくった雄一と、画面の前で小さく拳を合わせた。', lesson: '保存・観察・一つずつの変更・再確認。順序と記録が復旧を助ける。', reward: '復旧チームの司令塔' },
    'adult:lecture': { kind: 'logic', title: '放課後のロジック回路', subtitle: '複数の条件を満たす、最小限の切り替えを。', after: 'conditionQuiz', sprite: 'teacher-lecture', intro: '先生が眼鏡をかけ、演習用の回路を開いた。「答えを選ぶだけでなく、条件を変えて確かめましょう。失敗しても戻せますから」すぐそばでペンが止まり、目が合った。', reply: '「条件を一つずつ確かめられましたね。今度は、君の説明を聞く側になれそうです」先生が眼鏡を外して笑う。その声に、回路とは違うところが反応した。', lesson: 'ANDは両方、ORは少なくとも片方、NOTは反転、XORは片方だけ。複数の出力と変更数を一緒に満たす。', reward: 'ロジックの設計者' },
    'adult:rain': { kind: 'route', title: '雨音のパケット便', subtitle: '中継の順番とコストから、通信経路を考えよう。', after: 'retryQuiz', sprite: 'teacher-rain', intro: '先生は傘を手に、通信の練習画面を指した。「雨で使えない道があります。中継点を順番に通り、通信コスト内で宛先まで届けてみましょう」届けたい言葉まで、見透かされている気がした。', reply: '「届きましたね。途中で戻って考え直すことも、必要な手順です」先生が傘の柄を握り直した。送れない言葉にも、そのひと言を覚えておきたい。', lesson: 'この模擬ネットワークでは、使える隣接ノードをつないで宛先まで届ける。経路ができることと受信確認は別。', reward: '雨の日の通信士' },
    'adult:presentation': { kind: 'median', title: 'データの向こうを読む', subtitle: '代表値を選び、計算して、理由を伝えよう。', after: 'medianQuiz', sprite: 'teacher-presentation', intro: '発表用のジャケットを整えた先生が、クリッカーをこちらへ向けた。「最後の仕上げをしましょう。何を伝えたいかで、選ぶ代表値は変わります」励ます笑顔に、肩の力が抜けていく。', reply: '「その数字を選んだ理由まで、伝えられそうですね」先生が小さく拍手をくれた。誰かの正解を借りるのではなく、自分の言葉で話したい。', lesson: '中央値は外れ値に左右されにくく、偶数件なら中央2件の平均。平均値は合計÷件数。伝える目的に応じて使い分ける。', reward: '伝わるデータの案内人' }
  };
  const pairs = [['01', 'あ'], ['10', 'り'], ['11', 'が'], ['100', 'と'], ['101', 'う'], ['110', '！']];
  const sequences = [
    { title: '消えた案内を取り戻す', steps: ['今の状態を別名で保存', '昨日のコピーを開く', '足りない案内文を追加', '復旧版を別の場所にも保存'], hint: 'まず現状を残そう。最後は、直せた版のコピー。' },
    { title: 'ボタンの不具合を調べる', steps: ['押したボタンと結果を記録', '原因の候補を一つ選ぶ', 'その候補だけ変更', '同じ操作で結果を再確認'], hint: '最初に現象を記録。一度の変更は一つだけ。' },
    { title: '残り0席の受付テスト', steps: ['残り席数を0に設定', '受付ボタンを一度押す', '表示結果を記録', '満席表示になるか照合'], hint: '条件を設定 → 操作 → 記録 → 期待した結果と比較。' },
    { title: '完成版を次の担当へ', steps: ['完成版の動作を確認', '確認した版に名前を付けて保存', 'その版の保存先をメモ', 'メモと完成版を次の担当へ渡す'], hint: '動く版を確認して保存。その版を特定できるメモと渡そう。' }
  ];
  const logic = C.logic, routes = C.routes, samples = C.statistics;
  const keyFor = state => `${state.mode}:${state.episodeId}`;
  function config(key) { if (!Object.hasOwn(catalog, key)) throw new RangeError('Unknown mini game'); return catalog[key]; }
  function shuffle(values, random = Math.random) {
    const out = [...values];
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  function total(game) { return ({ bits: 5, memory: 1, sequence: 4, logic: 4, route: 3, median: 4 })[game.kind]; }
  function resetRound(game) {
    game.bits = [false,false,false,false]; game.order = []; game.path = [0]; game.revealed = [];
    game.metric = null; game.estimate = null; game.analyzed = false; game.checked = false;
    const p = puzzle(game);
    game.switches = game.kind === 'logic' ? [...p.initial] : [];
    if (game.kind === 'sequence') game.bankOrder = shuffle(p.steps.map((_,i) => i));
    if (game.kind === 'memory') game.matched = [];
    game.message = game.key.startsWith('adult:') ? '条件を整理して考えてみましょう。ヒントは考え方の手がかりです。' : 'ゆっくり考えて大丈夫。ヒントも使えます。';
    game.status = 'playing'; game.showHint = false;
  }
  function create(key, courseId, random = Math.random) {
    const cfg = config(key);
    const game = { key, kind: cfg.kind, courseId, round: 0, attempts: 0, mistakes: 0, hints: 0, status: 'playing', matched: [], cards: shuffle(pairs.flatMap((pair, id) => pair.map(label => ({ id, label }))), random) };
    resetRound(game); return game;
  }
  function puzzle(game) {
    if (game.kind === 'bits') {
      const junior = game.courseId === 'junior';
      return { value: (junior ? [3,5,6,5,6] : [6,9,11,10,13])[game.round], weights: junior ? [4,2,1] : [8,4,2,1], clue: game.round === 3 ? (junior ? '3に2を足した数を届けよう。' : '8より大きく、12より小さい偶数を届けよう。') : game.round === 4 ? (junior ? '5より大きい、一番小さい偶数を届けよう。' : '15より2小さい数を届けよう。') : '' };
    }
    if (game.kind === 'sequence') return sequences[game.round];
    if (game.kind === 'logic') return logic[game.round];
    if (game.kind === 'route') return routes[game.round];
    if (game.kind === 'median') return samples[game.round];
    return { pairs };
  }
  function pass(game, message) { game.status = 'round-clear'; game.message = message; }
  function fail(game, message) { game.mistakes++; game.message = message; }
  function act(game, action, value) {
    if (game.status === 'complete') return false;
    if (action === 'next' && game.status === 'round-clear') {
      if (game.round + 1 === total(game)) { game.status = 'complete'; return true; }
      game.round++; resetRound(game); return true;
    }
    if (game.status !== 'playing') return false;
    const p = puzzle(game);
    if (action === 'hint') { if (!game.showHint) game.hints++; game.showHint = !game.showHint; return true; }
    if (action === 'undo') { if (!['route','sequence'].includes(game.kind)) return false; if (game.kind === 'route') { if (game.path.length > 1) game.path.pop(); } else game.order.pop(); return true; }
    if (action === 'reset') { resetRound(game); return true; }
    if (action === 'bit' && game.kind === 'bits' && Number.isInteger(value) && value >= 0 && value < p.weights.length) { game.bits[value] = !game.bits[value]; return true; }
    if (action === 'switch' && game.kind === 'logic' && Number.isInteger(value) && value >= 0 && value < p.labels.length && !p.locked.includes(value)) { game.switches[value] = !game.switches[value]; game.checked = false; return true; }
    if (action === 'card' && game.kind === 'memory' && Number.isInteger(value) && value >= 0 && value < game.cards.length) {
      if (game.matched.includes(game.cards[value].id) || game.revealed.includes(value)) return false;
      if (game.revealed.length === 2) game.revealed = [];
      game.revealed.push(value);
      if (game.revealed.length === 2) {
        game.attempts++;
        const [a,b] = game.revealed.map(i => game.cards[i]);
        if (a.id === b.id) { game.matched.push(a.id); game.message = `ペア発見！ ${a.label} ↔ ${b.label}`; if (game.matched.length === pairs.length) pass(game, '6組のペアがそろった。手紙の言葉は「ありがとう！」'); }
        else fail(game, 'この2枚は別のペア。場所を覚えて、次のカードをめくろう。');
      }
      return true;
    }
    if (action === 'pick' && game.kind === 'sequence') {
      const values = p.steps;
      if (!Number.isInteger(value) || value < 0 || value >= values.length || game.order.includes(value)) return false;
      game.order.push(value); return true;
    }
    if (action === 'cell' && game.kind === 'route' && Number.isInteger(value) && value >= 0 && value < 25) {
      const last = game.path.at(-1);
      if (p.blocked.includes(value) || game.path.includes(value)) return false;
      if (Math.abs(Math.floor(last / 5) - Math.floor(value / 5)) + Math.abs(last % 5 - value % 5) !== 1) { game.message = '光っている経路の先から、上下左右に一マスずつ進もう。'; return true; }
      game.path.push(value);
      if (value === 24) {
        game.attempts++;
        const first = game.path.indexOf(p.relays[0]), second = game.path.indexOf(p.relays[1]), cost = C.routeCost(p, game.path);
        if (first < 0 || second < first) fail(game, '中継A → 中継Bの順を守れていません。一つ戻して経路を考え直しましょう。');
        else if (cost > p.budget) fail(game, `通信コストが ${cost - p.budget} オーバー。マス数だけでなく、通過コストも比べましょう。`);
        else pass(game, `A → Bの順で到着。通信コスト ${cost} / ${p.budget}、受信確認も返ってきた！`);
      }
      return true;
    }
    if (game.kind === 'median' && ['metric','estimate','reason'].includes(action)) {
      const count = action === 'metric' ? C.metrics.length : action === 'estimate' ? p.estimates.length : p.reasons.length;
      if (!Number.isInteger(value) || value < 0 || value >= count || ((action === 'reason') !== game.analyzed)) return false;
      if (action === 'reason') {
        game.attempts++;
        value === p.reason ? pass(game, `${C.metrics[p.metric]}は ${p.answer}${p.unit}。目的に合う値と理由を説明できた！`) : fail(game, '値は合っています。なぜその指標を使うのか、目的と定義を照らし合わせましょう。');
      } else game[action] = value;
      return true;
    }
    if (action !== 'check' || !['bits','logic','sequence','median'].includes(game.kind) || game.analyzed) return false;
    if (game.kind === 'sequence' && game.order.length !== p.steps.length) { game.message = 'すべてのカードを並べてから確かめよう。'; return true; }
    if (game.kind === 'median' && (game.metric === null || game.estimate === null)) { game.message = '代表値の種類と計算した値を、両方選んでください。'; return true; }
    game.attempts++;
    if (game.kind === 'bits') {
      const sum = p.weights.reduce((n,w,i) => n + (game.bits[i] ? w : 0), 0);
      sum === p.value ? pass(game, `${game.bits.slice(0,p.weights.length).map(Number).join('')} → ${sum}。数字が届いた！`) : fail(game, `今は ${sum}。${p.clue ? '文の条件をもう一度読んでみよう。' : `目標の ${p.value} になる組み合わせを探そう。`}`);
    } else if (game.kind === 'logic') {
      game.checked = true;
      const missed = C.logicResults(p,game.switches).filter(r => !r.matched);
      const over = C.changes(p,game.switches) > p.maxChanges;
      if (!missed.length && !over) pass(game, 'すべての出力と変更数の条件を満たした。回路が完成した！');
      else fail(game, `${missed.length ? '未達成：'+missed.map(r => r.label).join('・')+'。' : ''}${over ? '変更数が上限を超えています。' : ''}条件を組み合わせて考え直しましょう。`);
    } else if (game.kind === 'sequence') {
      game.order.every((v,i) => v === i) ? pass(game, '手順がつながった。これなら落ち着いて実行できる！') : fail(game, '前の作業が終わってからできることを探そう。一つ戻すか、並べ直してみよう。');
    } else {
      if (game.metric === p.metric && p.estimates[game.estimate] === p.answer) { game.analyzed = true; game.message = '代表値と計算は正解。最後に、この指標を選ぶ理由を説明しましょう。'; }
      else fail(game, '代表値の選び方か、計算した値を見直しましょう。目的と件数に注目。');
    }
    return true;
  }
  function hint(game) {
    const p = puzzle(game);
    if (game.kind === 'bits') return '大きい位から考えよう。その重みが目標より大きければOFF。ONにした分を引き、残りを次の位で作ります。';
    if (game.kind === 'memory') return '符号表を見ながら、同じ組の「符号」と「文字」を探そう。ヒント中はカードの中身が見える。';
    if (game.kind === 'route') return 'Aまで・AからB・Bから宛先に分けて考えましょう。高コストのマスを避ける遠回りと、短い道を比べます。出発以外のマスは入るたびにコストを払います。';
    return p.hint;
  }
  function solution(game) {
    if (game.kind === 'bits') return Array.from({length:5},(_,round) => { const p = puzzle({...game,round}); return `${p.value}：${p.value.toString(2).padStart(p.weights.length,'0')} → ${p.weights.filter(w => p.value & w).join('＋')}＝${p.value}`; }).join('\n');
    if (game.kind === 'memory') return pairs.map(p => p.join('＝')).join(' ／ ');
    if (game.kind === 'sequence') return sequences.map(p => `${p.title}：${p.steps.join(' → ')}`).join('\n');
    if (game.kind === 'logic') return logic.map(p => `${p.title}：${p.labels.map((label,i) => `${label}＝${p.solve[i] ? 'ON' : 'OFF'}`).join('、')}。変更 ${C.changes(p,p.solve)}個。`).join('\n');
    if (game.kind === 'route') return routes.map((p,i) => `${i+1}通目のお手本（コスト ${C.routeCost(p,p.path)}）：\n${p.path.map(n => `${Math.floor(n/5)+1}行${n%5+1}列${p.relays.includes(n) ? '（中継'+('AB'[p.relays.indexOf(n)])+'）' : ''}`).join(' → ')}`).join('\n\n');
    return samples.map(p => `${p.title}：${C.metrics[p.metric]}＝${p.answer}${p.unit}。${p.reasons[p.reason]}`).join('\n');
  }
  const expanded = new WeakMap();
  function expand(scenes, state) {
    if (!expanded.has(scenes)) {
      const key = keyFor(state), cfg = config(key);
      expanded.set(scenes, scenes.flatMap(scene => scene.id !== cfg.after ? [scene] : [scene,
        { id: 'miniIntro', speaker: '御家雄一', text: cfg.intro, exclusive: true },
        { id: 'miniGame', type: 'minigame', minigame: key, text: cfg.subtitle, exclusive: true },
        { id: 'miniAfter', speaker: '御家雄一', text: cfg.reply, exclusive: true }
      ]));
    }
    return expanded.get(scenes);
  }
  const api = { challenges: C, catalog, keyFor, config, create, puzzle, total, act, hint, solution, expand };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriMinigames = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
