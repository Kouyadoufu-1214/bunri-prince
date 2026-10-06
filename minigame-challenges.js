(function (root) {
  'use strict';
  const logic = [
    { title: '許可と警報を両立する', labels: ['A：本人認証', 'B：予約あり', 'C：一般招待', 'D：点検中'], initial: [false,false,true,true], locked: [], maxChanges: 4, solve: [true,true,false,false],
      checks: [
        { label: '入室許可', formula: 'A AND (B OR C) AND NOT D', target: true, evaluate: b => b[0] && (b[1] || b[2]) && !b[3] },
        { label: '受付の一本化', formula: 'B XOR C', target: true, evaluate: b => b[1] !== b[2] },
        { label: '追加審査', formula: 'C OR D', target: false, evaluate: b => b[2] || b[3] }
      ], hint: 'まずOFFにしたい出力から考えましょう。ORをOFFにするには、両方ともOFFが必要です。' },
    { title: '固定された条件から逆算する', labels: ['A：学内回線', 'B：外部回線', 'C：学内認証', 'D：暗号化'], initial: [true,true,false,false], locked: [0], maxChanges: 3, solve: [true,false,true,true],
      checks: [
        { label: '通信の準備', formula: '(A OR B) AND (C OR D)', target: true, evaluate: b => (b[0] || b[1]) && (b[2] || b[3]) },
        { label: '二重接続', formula: 'A AND B', target: false, evaluate: b => b[0] && b[1] },
        { label: '認証の食い違い', formula: 'A XOR C', target: false, evaluate: b => b[0] !== b[2] },
        { label: '保護経路', formula: 'B OR D', target: true, evaluate: b => b[1] || b[3] }
      ], hint: 'Aは固定です。XORがOFFなら、左右の値は同じ。決まった条件をほかの式へ代入しましょう。' },
    { title: '二つの変更で復旧する', labels: ['A：主回線', 'B：認証済み', 'C：予備回線', 'D：中継有効', 'E：保守中'], initial: [false,true,true,false,true], locked: [2], maxChanges: 2, solve: [false,true,true,true,false],
      checks: [
        { label: '送信許可', formula: '(A AND B) OR (C AND D)', target: true, evaluate: b => (b[0] && b[1]) || (b[2] && b[3]) },
        { label: '警報', formula: '(NOT B OR E) AND D', target: false, evaluate: b => (!b[1] || b[4]) && b[3] },
        { label: '回線の一本化', formula: 'A XOR C', target: true, evaluate: b => b[0] !== b[2] }
      ], hint: '固定された予備回線とXORから、主回線の値が決まります。残りの変更枠を送信と警報に使いましょう。' },
    { title: '最小限の切り替えで本番へ', labels: ['A：主系統', 'B：制限中', 'C：予備系統', 'D：暗号化', 'E：公開回線'], initial: [false,true,true,false,true], locked: [], maxChanges: 3, solve: [false,false,true,true,false],
      checks: [
        { label: '本番への送信', formula: '((A AND NOT B) OR C) AND (D XOR E)', target: true, evaluate: b => ((b[0] && !b[1]) || b[2]) && (b[3] !== b[4]) },
        { label: '情報漏えい警報', formula: '(B AND C) OR (A AND E)', target: false, evaluate: b => (b[1] && b[2]) || (b[0] && b[4]) },
        { label: '構成の検証', formula: '(A XOR C) AND D', target: true, evaluate: b => (b[0] !== b[2]) && b[3] }
      ], hint: '最後の式から先に考えると、暗号化と系統の条件が絞れます。初期状態から何個変えたかにも注目。' }
  ];
  const routes = [
    { blocked: [6], relays: [7,17], costs: {12:6,22:3,8:2}, budget: 13, path: [0,1,2,7,12,17,18,23,24] },
    { blocked: [6,18], relays: [10,8], costs: {11:4,12:3,13:3,19:2}, budget: 15, path: [0,5,10,15,16,17,12,7,8,9,14,19,24] },
    { blocked: [6,18], relays: [16,3], costs: {11:4,12:4,13:2,8:3,9:3}, budget: 19, path: [0,5,10,15,16,17,12,7,2,3,4,9,14,19,24] }
  ];
  const metrics = ['平均値', '中央値', '範囲（最大−最小）'];
  const statistics = [
    { title: '「普段の待ち時間」を伝える', unit: '分', values: [3,4,4,5,6,38], task: '1件だけ大幅な遅延があった。極端な値に引っぱられにくい、普段の待ち時間の代表値を出そう。', metric: 1, answer: 4.5, estimates: [4,4.5,5,10],
      reasons: ['一番大きい値を使えば、安全な目安になる', '合計を人数で割ると、極端な値の影響を消せる', '小さい順の中央2件の平均なら、極端な1件の大きさに左右されにくい'], reason: 2,
      hint: '件数は偶数です。中央値は中央2件を足して2で割ります。最大値を勝手に除外する必要はありません。' },
    { title: '印刷用紙を見積もる', unit: '枚', values: [4,8,8,12,16,24], task: '6人が使った用紙の合計を、人数で均等にならしたい。1人あたりの見積もりに使う代表値と、その値を選ぼう。', metric: 0, answer: 12, estimates: [8,10,12,72],
      reasons: ['全員の使用枚数を足して人数で割ると、合計と対応する1人あたりの量になる', '真ん中の2人だけを見れば、用紙の合計を必ず再現できる', '最大と最小の差は、1人が使った平均の枚数を表す'], reason: 0,
      hint: '今回は「よくある人」ではなく「全員分を均等にならす」目的です。6人分を足したあと、何で割りますか？' },
    { title: '極端な遅延のある通信ログ', unit: 'ms', values: [9,10,10,11,12,12,13,67], task: 'すべてのログを残しながら、外れ値に影響されにくい代表値を報告したい。同じ値が複数あることにも注意しよう。', metric: 1, answer: 11.5, estimates: [11,11.5,12,18],
      reasons: ['異なる値だけにまとめてから中央を取ればよい', '重複もそれぞれ1件と数え、小さい順の4番目と5番目を平均する', '最大の67を選ぶと、普段の通信を最もよく表せる'], reason: 1,
      hint: '同じ数も別々の観測です。8件なら中央は4番目と5番目。18という値は何を計算した結果でしょう？' },
    { title: '平均と中央値を使い分ける', unit: '秒', values: [6,12,12,18,18,30], task: 'この6件を順番に処理する合計時間を見積もりたい。「代表値 × 6件」で今回の合計を再現できる指標と値を選ぼう。', metric: 0, answer: 16, estimates: [15,16,18,24],
      reasons: ['中央値なら、件数を掛けると常に合計になる', '範囲なら、短い処理と長い処理を両方含められる', '平均値は合計を件数で割ったものなので、件数を掛けると元の合計に戻る'], reason: 2,
      hint: '中央値と平均値は一致するとは限りません。「代表値 × 件数」の条件に合う定義を選びましょう。' }
  ];
  const routeCost = (p, path) => path.slice(1).reduce((sum, cell) => sum + (p.costs[cell] || 1), 0);
  const changes = (p, switches) => switches.filter((value, i) => value !== p.initial[i]).length;
  const logicResults = (p, switches) => p.checks.map(check => ({ label: check.label, matched: check.evaluate(switches) === check.target }));
  const api = { logic, routes, statistics, metrics, routeCost, changes, logicResults };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriChallenges = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
