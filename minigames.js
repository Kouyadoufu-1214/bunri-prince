(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' && module.exports ? require('./puzzles.js') : root.BunriPuzzles;
  const catalog = {
    'minor:lecture': { kind: 'bits', title: 'ふたりのビット・ラボ', subtitle: '連動するランプを、限られた手数でそろえよう。', after: 'dataQuiz', sprite: 'campus-lecture', intro: '「今度は、手を動かしてみよう。このスイッチ、隣のランプも一緒に変わるんだ。五つの数字、決まった手数で届けられるかな？」雄一がカーディガンの袖を引き、ペンを差し出した。', reply: '「できること、一つ増えたね。君が考えているときの顔、つい見ちゃった」雄一はペンを受け取って、少しだけ照れた。', lesson: '各桁の重みを足すと二進数が表す数になる。同じビットを2回反転すると元に戻る。', reward: 'ビットの相棒' },
    'minor:festival': { kind: 'cipher', title: 'ひみつの暗号表', subtitle: '手掛かりを組み合わせて、君だけの手紙をひらく。', after: 'codeQuiz', sprite: 'campus-festival', intro: '雄一が、星の封をした手紙を取り出した。「符号表をなくしちゃった。残った手掛かりから、記号と数字の組を考えてくれる？ 封は三つあるんだ」いつもより、いたずらっぽい笑顔だった。', reply: '「手紙、開けられたね。……伝えたかった言葉、もうわかった？」封筒を受け取る指先に、少しだけ力が入った。', lesson: '符号は、対応するルールを共有して初めて読める。符号化だけで秘密になるわけではない。', reward: 'ひみつ通信の名人' },
    'minor:rescue': { kind: 'sequence', title: '展示レスキュー・コマンド', subtitle: '作業カードを組んで、展示を復旧しよう。', after: 'debugQuiz', sprite: 'campus-rescue', intro: '上着を脱いだ雄一が、ノートパソコンを抱えて戻ってきた。「一度に全部変えると、原因がわからなくなるね。候補をカードにしたけど、全部は使わない。状況に合う作業だけ選んで、順番を組んでくれる？」', reply: '「手順が見えると、落ち着けるね。助かった」袖をまくった雄一と、画面の前で小さく拳を合わせた。', lesson: '保存・観察・一つずつの変更・再確認。順序と記録が復旧を助ける。', reward: '復旧チームの司令塔' },
    'adult:lecture': { kind: 'logic', title: '放課後のロジック回路', subtitle: '最終状態だけでなく、切り替えの途中も守れるか。', after: 'conditionQuiz', sprite: 'teacher-lecture', intro: '先生が眼鏡をかけ、演習用の回路を開いた。「最終状態だけでなく、切り替え途中の通信も守ってください。手順を組み、まとめて検証しましょう」すぐそばでペンが止まり、目が合った。', reply: '「条件を一つずつ確かめられましたね。今度は、君の説明を聞く側になれそうです」先生が眼鏡を外して笑う。その声に、回路とは違うところが反応した。', lesson: 'ANDは両方、ORは少なくとも片方、NOTは反転、XORは片方だけ。完成した回路だけでなく、切り替えの途中も条件を満たす。', reward: 'ロジックの設計者' },
    'adult:rain': { kind: 'route', title: '雨音のパケット便', subtitle: '鍵・コスト・転送回数。三つの制約を両立しよう。', after: 'retryQuiz', sprite: 'teacher-rain', intro: '先生は傘を手に、通信の練習画面を指した。「雨で使えない道があります。中継点と鍵を通り、コストと転送回数の上限内で宛先まで届けてみましょう」届けたい言葉まで、見透かされている気がした。', reply: '「届きましたね。途中で戻って考え直すことも、必要な手順です」先生が傘の柄を握り直した。送れない言葉にも、そのひと言を覚えておきたい。', lesson: 'この模擬ネットワークでは、使える隣接ノードをつないで宛先まで届ける。各マスへ進むたびに転送回数も消費する模擬ルール。安い経路が、回数の上限にも収まるとは限らない。', reward: '雨の日の通信士' },
    'adult:presentation': { kind: 'median', title: 'データの向こうを読む', subtitle: '記録の選別から計算まで、自分の数字で説明する。', after: 'medianQuiz', sprite: 'teacher-presentation', intro: '発表用のジャケットを整えた先生が、クリッカーをこちらへ向けた。「最後の仕上げをしましょう。練習や再送が混ざった記録です。集計対象を決め、自分で数字を計算して説明してください」励ます笑顔に、肩の力が抜けていく。', reply: '「その数字を選んだ理由まで、伝えられそうですね」先生が小さく拍手をくれた。誰かの正解を借りるのではなく、自分の言葉で話したい。', lesson: '中央値は外れ値に左右されにくく、偶数件なら中央2件の平均。平均値は合計÷件数。集計対象を確かめ、人数の違う班では人数を重みとして合計する。', reward: '伝わるデータの案内人' }
  };
  const keyFor = state => `${state.mode}:${state.episodeId}`;
  function config(key) { if (!Object.hasOwn(catalog,key)) throw new RangeError('Unknown mini game'); return catalog[key]; }
  function shuffle(values,random=Math.random) { const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; }
  function total(game) { return ({bits:5,cipher:3,sequence:4,logic:4,route:3,median:4})[game.kind]; }
  function puzzle(game) {
    if(game.kind==='bits')return C.bits(game.courseId,game.round);
    if(game.kind==='cipher')return C.cipher(game.courseId,game.round);
    if(game.kind==='sequence')return C.sequence(game.courseId,game.round);
    return ({logic:C.logic,route:C.routes,median:C.statistics})[game.kind][game.round];
  }
  function resetRound(game) {
    const p=puzzle(game);
    game.order=[];game.path=[0];game.metric=null;game.estimate=null;game.analyzed=false;game.trace=null;
    game.bits=game.kind==='bits'?[...p.initial]:[];
    game.mapping=game.kind==='cipher'?p.symbols.map(()=>null):[];
    game.included=game.kind==='median'?p.records.map(()=>true):[];
    if(game.kind==='sequence')game.bankOrder=shuffle(p.steps.map((_,i)=>i));
    game.message='操作を組み立ててから確かめよう。時間制限はありません。';
    game.status='playing';game.showHint=false;
  }
  function create(key,courseId) { const game={key,kind:config(key).kind,courseId,round:0,attempts:0,mistakes:0,hints:0};resetRound(game);return game; }
  function pass(game,message){game.status='round-clear';game.message=message;}
  function fail(game,message){game.mistakes++;game.message=message;}
  function act(game,action,value){
    if(game.status==='complete')return false;
    if(action==='next'&&game.status==='round-clear'){
      if(game.round+1===total(game)){game.status='complete';return true;}
      game.round++;resetRound(game);return true;
    }
    if(game.status!=='playing')return false;
    const p=puzzle(game);
    if(action==='hint'){if(!game.showHint)game.hints++;game.showHint=!game.showHint;return true;}
    if(action==='reset'){resetRound(game);return true;}
    if(action==='undo'){
      if(!['bits','sequence','logic','route'].includes(game.kind))return false;
      if(game.kind==='route'){if(game.path.length>1)game.path.pop();}
      else{const last=game.order.pop();if(game.kind==='bits'&&last!==undefined)p.links[last].forEach(i=>{game.bits[i]=!game.bits[i];});}
      game.trace=null;game.message='一手戻しました。続きから組み直せます。';return true;
    }
    if(action==='bit'&&game.kind==='bits'&&Number.isInteger(value)&&value>=0&&value<p.weights.length){
      if(game.order.length>=p.maxMoves){game.message='手数の上限です。一つ戻すか、やり直して別の組み合わせを試そう。';return true;}
      p.links[value].forEach(i=>{game.bits[i]=!game.bits[i];});game.order.push(value);return true;
    }
    if(action==='map'&&game.kind==='cipher'&&Number.isInteger(value)&&value>=0&&value<p.symbols.length*4){
      const row=Math.floor(value/4),n=value%4;if(!p.values.includes(n))return false;game.mapping[row]=n;return true;
    }
    if(action==='switch'&&game.kind==='logic'&&Number.isInteger(value)&&value>=0&&value<p.labels.length){
      if(game.order.length>=p.maxMoves){game.message='手順の枠がいっぱいです。「一つ戻す」で組み直せます。';return true;}
      game.order.push(value);game.trace=null;return true;
    }
    if(action==='pick'&&game.kind==='sequence'&&Number.isInteger(value)&&value>=0&&value<p.steps.length&&!game.order.includes(value)){
      if(game.order.length>=p.required.length){game.message='作業の枠がいっぱいです。不要なカードを外して組み直そう。';return true;}
      game.order.push(value);return true;
    }
    if(action==='cell'&&game.kind==='route'&&Number.isInteger(value)&&value>=0&&value<25){
      const last=game.path.at(-1);
      if(p.blocked.includes(value)||game.path.includes(value))return false;
      if(Math.abs(Math.floor(last/5)-Math.floor(value/5))+Math.abs(last%5-value%5)!==1){game.message='経路の先から、上下左右に一マスずつ進みます。';return true;}
      game.path.push(value);
      if(value===24){
        game.attempts++;
        const a=game.path.indexOf(p.relays[0]),b=game.path.indexOf(p.relays[1]),key=game.path.indexOf(p.key),cost=C.routeCost(p,game.path);
        if(a<0||b<a)fail(game,'中継A → 中継Bの順になっていません。');
        else if(key<0||key>b)fail(game,'中継Bの前に、鍵Kを受け取る必要があります。');
        else if(game.path.length-1>p.ttl)fail(game,`転送回数が上限より${game.path.length-1-p.ttl}回多く、届く前に破棄されました。安い道でも遠回りしすぎると届きません。`);
        else if(cost>p.budget)fail(game,`コストが${cost-p.budget}オーバー。転送回数とコストの両方を比べましょう。`);
        else pass(game,`鍵と中継条件を守って受信！ コスト${cost}/${p.budget}・転送${game.path.length-1}/${p.ttl}。`);
      }
      return true;
    }
    if(game.kind==='median'&&!game.analyzed){
      if(action==='record'&&Number.isInteger(value)&&value>=0&&value<p.records.length){game.included[value]=!game.included[value];return true;}
      if(action==='metric'&&Number.isInteger(value)&&value>=0&&value<C.metrics.length){game.metric=value;return true;}
      if(action==='estimate'&&(value===null||Number.isFinite(value))){game.estimate=value;return true;}
    }
    if(action==='reason'&&game.kind==='median'&&game.analyzed&&Number.isInteger(value)&&value>=0&&value<p.reasons.length){
      game.attempts++;value===p.reason?pass(game,`${C.metrics[p.metric]}は${p.answer}${p.unit}。対象・計算・理由を説明できた！`):fail(game,'値は合っています。対象の選び方と、指標の定義を結びつけましょう。');return true;
    }
    if(action!=='check'||game.analyzed||game.kind==='route')return false;
    if(game.kind==='sequence'&&game.order.length!==p.required.length){game.message=`${p.required.length}枚を選んでから実行しよう。すべてのカードを使う必要はありません。`;return true;}
    if(game.kind==='cipher'&&game.mapping.includes(null)){game.message='すべての記号に値を割り当てよう。';return true;}
    if(game.kind==='median'&&(game.metric===null||game.estimate===null)){game.message='指標を選び、計算した値を入力してください。小数も使えます。';return true;}
    game.attempts++;
    if(game.kind==='bits'){
      const sum=p.weights.reduce((n,w,i)=>n+(game.bits[i]?w:0),0);
      sum===p.value?pass(game,`${game.bits.map(Number).join('')} → ${sum}。${game.order.length}手で届いた！`):fail(game,`今は${sum}。同じランプを2回反転すると元に戻ることを使ってみよう。`);
    }else if(game.kind==='cipher'){
      game.mapping.every((v,i)=>v===p.answer[i])?pass(game,`封が開いた。中の言葉は「${p.message}」。`):fail(game,'使っていない値・重なった値と、すべての手掛かりを確かめよう。');
    }else if(game.kind==='logic'){
      game.trace=C.logicTrace(p,game.order);
      if(game.trace.error)fail(game,game.trace.error+' 手順を組み直しましょう。');
      else if(!game.trace.reached)fail(game,'途中の条件は守れていますが、最後の状態が目標と違います。');
      else pass(game,`${game.order.length}手を検証。途中も安全なまま、目標の状態へ切り替えられた！`);
    }else if(game.kind==='sequence'){
      const wrong=game.order.find(i=>!p.required.includes(i));
      if(wrong!==undefined)fail(game,`「${p.steps[wrong]}」では、今回残すべき情報や確認条件を守れません。状況メモを読み直そう。`);
      else if(p.dependencies.some(([a,b])=>game.order.indexOf(a)>game.order.indexOf(b)))fail(game,'必要な作業は選べています。保存・変更・検証の順を見直そう。');
      else pass(game,'必要な作業だけで復旧できた。残すべき情報も守れた！');
    }else{
      const correctRecords=game.included.every((on,i)=>on===p.keep.includes(i));
      // Either identical copy may represent the same ID; count it exactly once.
      const validRecords=game.round===2 ? p.records.filter((r,i)=>game.included[i]).length===8&&new Set(p.records.filter((r,i)=>game.included[i]).map(r=>r.id)).size===8 : correctRecords;
      if(!validRecords)fail(game,'集計対象が違います。大きさだけで行を除かず、用途・ID・測定結果を確認してください。');
      else if(game.metric!==p.metric||Math.abs(game.estimate-p.answer)>1e-8)fail(game,'対象は正しく選べています。指標の目的、人数・件数、計算を見直してください。');
      else{game.analyzed=true;game.message='対象と計算が合いました。この方法を選ぶ理由を説明してください。';}
    }
    return true;
  }
  function hint(game){const p=puzzle(game);if(game.kind==='bits')return '目標の二進数を作り、今と違うランプを探そう。一つのスイッチは隣も反転します。同じランプを2回変えると元に戻ります。';if(game.kind==='route')return 'KをBより先に通ります。遠回りは安くても転送回数を使います。宛先まで残り何回かを数え、高コストの近道と比べましょう。';return p.hint;}
  function solution(game){
    return Array.from({length:total(game)},(_,round)=>{const p=puzzle({...game,round});
      if(game.kind==='bits')return `${round+1}：${p.plan.map(i=>String.fromCharCode(65+i)).join(' → ')}。目標${p.value}（${p.value.toString(2).padStart(p.weights.length,'0')}）`;
      if(game.kind==='cipher')return `${round+1}：${p.symbols.map((s,i)=>`${s}=${p.answer[i].toString(2).padStart(2,'0')}`).join('、')}`;
      if(game.kind==='logic')return `${p.title}：${p.plan.map(i=>p.labels[i][0]).join(' → ')}`;
      if(game.kind==='sequence')return `${p.title}：${p.required.map(i=>p.steps[i]).join(' → ')}`;
      if(game.kind==='route')return `${round+1}：${p.path.map(n=>`${Math.floor(n/5)+1}行${n%5+1}列`).join(' → ')}`;
      return `${p.title}：対象${p.keep.map(i=>p.records[i].id).join('・')}。${C.metrics[p.metric]}=${p.answer}${p.unit}。${p.reasons[p.reason]}`;
    }).join('\n\n');
  }
  const expanded=new WeakMap();
  function expand(scenes,state){
    if(!expanded.has(scenes)){
      const key=keyFor(state),cfg=config(key);
      expanded.set(scenes,scenes.flatMap(scene=>scene.id!==cfg.after?[scene]:[scene,
        {id:'miniIntro',speaker:'御家雄一',text:cfg.intro,exclusive:true},
        {id:'miniGame',type:'minigame',minigame:key,text:cfg.subtitle,exclusive:true},
        {id:'miniAfter',speaker:'御家雄一',text:cfg.reply,exclusive:true}
      ]));
    }return expanded.get(scenes);
  }
  const api={challenges:C,catalog,keyFor,config,create,puzzle,total,act,hint,solution,expand};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BunriMinigames=api;
})(typeof globalThis!=='undefined'?globalThis:this);
