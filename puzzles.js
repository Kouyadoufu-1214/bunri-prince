(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' && module.exports ? require('./minigame-challenges.js') : root.BunriChallenges;
  const check = (label, formula, evaluate) => ({ label, formula, evaluate });
  const supply = check('通信を途切れさせない', 'A OR B', b => b[0] || b[1]);
  const protectedLine = check('公開中は暗号化する', 'NOT D OR C', b => !b[3] || b[2]);
  const logic = [
    { title: '回線を止めずに切り替える', labels: ['A：主回線','B：予備回線','C：暗号化','D：公開'], initial:[true,false,false,false], goal:[false,true,true,true], maxMoves:4,
      safety:[supply,protectedLine], guards:[], plan:[1,2,3,0], hint:'古い回線を切る前に、新しい回線を用意します。公開と暗号化も、順序を逆にすると途中で条件を破ります。' },
    { title:'認証を引き継ぐ', labels:['A：主回線','B：予備回線','C：暗号化','D：公開','E：予備の認証'], initial:[true,false,true,true,false], goal:[false,true,true,true,true], maxMoves:3,
      safety:[supply,protectedLine,check('予備は認証後に使う','NOT B OR E',b=>!b[1]||b[4])], guards:[], plan:[4,1,0], hint:'三つだけ変わります。その三つを、通信と認証の条件が一度も崩れない順に並べます。' },
    { title:'稼働中の主回線を更新する', labels:['A：主回線','B：予備回線','C：新設定','D：一般公開','E：新設定の認証'], initial:[true,false,false,true,false], goal:[true,false,true,true,true], maxMoves:8,
      safety:[supply,check('一般公開は主回線で行う','NOT D OR A',b=>!b[3]||b[0]),check('新設定は認証が必要','NOT C OR E',b=>!b[2]||b[4])],
      guards:[{input:2,label:'Cを切り替えられるのは、AがOFFの間だけ',allow:b=>!b[0]}], plan:[3,1,0,4,2,0,1,3], hint:'最終状態が同じスイッチも、一時的に変える必要があります。退避、更新、元に戻す作業に分けて考えます。' },
    { title:'公開を再開するまでの六手', labels:['A：主回線','B：予備回線','C：暗号化','D：公開','E：認証','F：予備の検証'], initial:[true,false,true,true,false,false], goal:[false,true,true,true,true,true], maxMoves:6,
      safety:[supply,protectedLine,check('予備は検証後に使う','NOT B OR F',b=>!b[1]||b[5])],
      guards:[{input:5,label:'Fの切り替えは、公開DがOFFかつ認証EがONの間だけ',allow:b=>!b[3]&&b[4]}], plan:[4,3,5,1,0,3], hint:'公開は最初も最後もONですが、検証のため一度止めます。検証後に予備を起動し、最後の復帰まで数えてください。' }
  ];
  function logicTrace(p, order) {
    const state=[...p.initial],trace=[];
    for(const input of order){
      const guard=p.guards.find(g=>g.input===input&&!g.allow(state));
      if(guard)return {state,trace,error:`${trace.length+1}手目：${guard.label}`};
      state[input]=!state[input];trace.push({input,state:[...state]});
      const broken=p.safety.find(c=>!c.evaluate(state));
      if(broken)return {state,trace,error:`${trace.length}手目：${broken.label}（${broken.formula}）を満たしません。`};
    }
    return {state,trace,error:'',reached:state.every((v,i)=>v===p.goal[i])};
  }
  const routePaths=[
    [0,1,2,7,8,9,14,19,18,17,22,23,24],
    [0,5,10,11,12,7,2,3,8,9,14,19,24],
    [0,5,10,15,16,17,12,13,8,3,4,9,14,19,24]
  ];
  const routes=C.routes.map((p,i)=>({...p,key:[9,3,13][i],ttl:[12,12,14][i],budget:[15,18,22][i],path:routePaths[i]}));
  const record=(id,value,note='本番・成功',count=1)=>({id,value,note,count});
  const statistics=[
    {title:'本番ログに紛れた一行',unit:'分',task:'本番で成功した受付だけから、普段の待ち時間を報告する。極端に長くても成功した記録は残す。練習データは対象外。',
      records:[record('R01',6),record('R02',38),record('R03',4),record('TEST',0,'練習'),record('R04',3),record('R05',5),record('R06',4)],keep:[0,1,2,4,5,6],metric:1,answer:4.5,
      reasons:['最大値を除いたので、平均値と一致する','極端な値も残し、並べ替えた中央2件で典型的な位置を表した','中央値に件数を掛ければ合計になる'],reason:1,hint:'大きな値と無効な記録は別物です。対象を選んだあと、小さい順に並べ、中央の位置を数えます。'},
    {title:'人数の違うグループ',unit:'枚',task:'本番6人分の用紙を見積もる。各行は「1人の枚数 × その人数」。全員分を均等に配ったときの1人あたりを求めよう。練習班は除く。',
      records:[record('A班',4,'本番',3),record('B班',12,'本番',2),record('C班',24,'本番',1),record('練習班',30,'練習',2)],keep:[0,1,2],metric:0,answer:10,
      reasons:['三つの班の値を単純に3で割った','人数に関係なく中央の班を代表にした','各行の値に人数を掛けて合計し、本番の総人数で割った'],reason:2,hint:'行数と人数は違います。用紙の総枚数と、本番の総人数をそれぞれ計算しましょう。'},
    {title:'再送された通信記録',unit:'ms',task:'成功した通信1件につき1記録として、普段の応答を報告する。同じIDの再送コピーは1件にまとめる。値が同じでもIDが違えば別の通信。',
      records:[record('K03',10),record('K01',9),record('K07',13),record('K02',10),record('K01',9,'再送コピー'),record('K08',67),record('K04',11),record('K06',12),record('K05',12)],keep:[0,1,2,3,5,6,7,8],metric:1,answer:11.5,
      reasons:['値が同じ行も全部まとめた','IDで通信を区別し、8件の中央2件を平均した','再送を含めた全9行の中央を選んだ'],reason:1,hint:'重複判定に使うのは値ではなくIDです。IDが違う10や12は、それぞれ残します。'},
    {title:'測定失敗の0を見抜く',unit:'秒',task:'測定に成功した処理だけで合計時間を見積もる。「代表値 × 有効な件数」で実測の合計を再現したい。失敗時の0は処理時間ではない。',
      records:[record('P01',30),record('P02',12),record('P03',0,'測定失敗'),record('P04',18),record('P05',6),record('P06',18),record('P07',12)],keep:[0,1,3,4,5,6],metric:0,answer:16,
      reasons:['有効な6件の合計を6で割ったので、掛け戻すと合計になる','0は常に異常なので、どんなデータでも除く','中央2件だけで、必ず合計を再現できる'],reason:0,hint:'0を消す理由は小さいからではなく、測定失敗の印だからです。有効な件数を先に数えましょう。'}
  ];
  function bits(course,round){
    const junior=course==='junior',weights=junior?[4,2,1]:[8,4,2,1];
    const links=weights.map((_,i)=>i===weights.length-1?[i]:[i,i+1]);
    const plan=(junior?[[0,1],[1,2],[0,2],[0,1,2],[0,1,2]]:[[0,2],[1,3],[0,1,3],[0,2,3],[0,1,2,3]])[round];
    const value=(junior?[3,5,6,5,6]:[6,9,11,10,13])[round],initial=weights.map(w=>Boolean(value&w));
    plan.forEach(i=>links[i].forEach(j=>{initial[j]=!initial[j];}));
    return {value,weights,links,plan,initial,maxMoves:plan.length,clue:round<3?'':round===3?(junior?'3に2を足した数':'8より大きく12より小さい偶数'):(junior?'5より大きい一番小さい偶数':'15より2小さい数')};
  }
  function cipher(course,round){
    const junior=course==='junior',symbols=junior?['月','星','雲']:['月','星','雲','雨'],values=junior?[1,2,3]:[0,1,2,3];
    const answers=junior?[[2,3,1],[3,1,2],[1,3,2]]:[[2,3,1,0],[3,1,2,0],[1,3,0,2]];
    const clues=junior?[
      ['月は雲より1大きい','星は月より大きい'],['月は雲より1大きい','星は雲より小さい'],['星は月より2大きい','雲は月より大きい']
    ]:[['月は雲より1大きい','星は月より1大きい','雨は星より小さい'],['月は雲より1大きい','雲は星より1大きい','雨は星より小さい'],['雨は月より1大きい','星は月より2大きい','雲は雨より小さい']];
    return {symbols,values,answer:answers[round],clues:clues[round],message:['ありがとう','君が最初でよかった','このあとも、一緒に'][round],hint:'同じ値は2回使いません。「1大きい」で隣り合う組を作り、余った値を残りの記号に当てはめよう。'};
  }
  const sequences=[
    {title:'消えた案内を救う',evidence:'現在版は案内文だけが欠けている。昨日のコピーには案内文があるが、今日の受付名簿は入っていない。名簿は残して復旧する。',steps:['現在版を複製して退避','昨日のコピーを別画面で開く','案内文だけ現在版へ戻す','案内と今日の名簿を確認','現在版を昨日のコピーで丸ごと置き換える','現在版を消してからバックアップを探す'],hint:'昨日に戻すと、今日増えたものはどうなる？ 戻したい部分と残したい部分を分けよう。'},
    {title:'表示の不具合を切り分ける',evidence:'案内ボタンだけが誤った教室を表示する。文字色は読める。直すのは教室番号だけで、変更前後を比べたい。',steps:['現在の表示と設定を記録','ボタンの教室番号だけ修正','同じボタンを同じ条件で押す','記録と比べ教室番号を確認','教室番号と文字色を同時に変える','すべての設定を初期化する'],hint:'直った理由を説明できるよう、比較条件を一つにしよう。'},
    {title:'満席の判定を確かめる',evidence:'残席0でも予約を受け付けてしまう。残席が0以下なら満席、とする条件を直し、問題が起きた状況で確かめたい。',steps:['問題が起きた残席0を設定','満席条件を「残席が0以下」に直す','受付ボタンを押す','満席表示と予約数が増えないことを確認','残席を1に増やしてエラーを隠す','条件を「残席が1以上」に直す'],hint:'エラーが出なくなることと、原因が直ることは同じではないよ。'},
    {title:'公開する版を選ぶ',evidence:'v3は修正済みだが未確認。v2は確認済みだが不具合が残る。確認したものと同じ版を公開し、変更履歴も残す。',steps:['v3の動作を確認','確認したv3を確定版として保存','その確定版を公開先へ渡す','公開先の版番号と動作を確認','確認済みという理由だけでv2を公開','確認後にv3を編集してそのまま公開'],hint:'確認した版と公開する版が、途中で違うものになっていないか追ってみよう。'}
  ];
  function sequence(course,round){
    const p=sequences[round],senior=course==='senior';
    return {...p,steps:senior?[...p.steps,'検証した結果と版名を記録','結果の記録を消して作業完了']:[...p.steps],required:senior?[0,1,2,3,6]:[0,1,2,3],dependencies:[[0,1],[1,2],[2,3],...(senior?[[3,6]]:[])]};
  }
  const api={logic,logicTrace,routes,statistics,metrics:C.metrics,routeCost:C.routeCost,bits,cipher,sequence};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.BunriPuzzles=api;
})(typeof globalThis!=='undefined'?globalThis:this);
