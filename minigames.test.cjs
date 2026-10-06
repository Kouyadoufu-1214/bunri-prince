const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('./minigames.js');
const S = require('./story.js');
const U = require('./minigame-ui.js');

function solveRound(g) {
  const p = M.puzzle(g);
  if (g.kind === 'bits') p.weights.forEach((w,i) => { if (Boolean(p.value & w) !== g.bits[i]) M.act(g,'bit',i); });
  if (g.kind === 'logic') p.solve.forEach((v,i) => { if (v !== g.switches[i]) M.act(g,'switch',i); });
  if (g.kind === 'sequence') p.steps.forEach((_,i) => M.act(g,'pick',i));
  if (g.kind === 'median') { M.act(g,'metric',p.metric); M.act(g,'estimate',p.estimates.indexOf(p.answer)); }
  if (g.kind === 'memory') for (let id=0;id<6;id++) g.cards.forEach((c,i) => { if(c.id===id) M.act(g,'card',i); });
  else if (g.kind === 'route') p.path.slice(1).forEach(i => { assert.ok(!p.blocked.includes(i)); assert.ok(M.act(g,'cell',i)); });
  else M.act(g,'check');
  if (g.kind === 'median') { assert.ok(g.analyzed); M.act(g,'reason',p.reason); }
  assert.equal(g.status,'round-clear');
}
for (const [key,cfg] of Object.entries(M.catalog)) test(`${key}: every mission is playable, finish is single-counted, romance is independent`, () => {
  for (const course of key.startsWith('minor') ? ['junior','senior'] : ['adult']) {
    const g=M.create(key,course,()=>.3);
    for (let i=0;i<M.total(g);i++) {
      assert.equal(g.round,i);
      assert.ok(U.render(g).includes(cfg.title));
      solveRound(g);
      const snapshot=JSON.stringify(g);assert.equal(M.act(g,'check'),false);assert.equal(JSON.stringify(g),snapshot);
      assert.ok(M.act(g,'next'));
    }
    assert.equal(g.status,'complete');
    const snap=JSON.stringify(g);assert.equal(M.act(g,'next'),false);assert.equal(JSON.stringify(g),snap);
    const state=S.createState(course,key.split(':')[1]);state.index=S.activeScenes(state).findIndex(s=>s.type==='minigame');state.affection=4;
    assert.equal(S.advance(state),false);assert.equal(S.finishMiniGame(state),false);
    state.miniGame=g;assert.ok(S.finishMiniGame(state));assert.equal(S.finishMiniGame(state),false);assert.equal(state.minigames.length,1);assert.equal(state.affection,4);assert.equal(S.ending(state),'sweet');assert.ok(S.advance(state));
  }
});
test('assistance and new sessions cannot leak progress or change affection',()=>{
  const a=S.createState('adult','rain');a.index=S.activeScenes(a).findIndex(s=>s.type==='minigame');a.affection=2;
  assert.ok(S.finishMiniGame(a,true));assert.ok(a.minigames[0].assisted);assert.equal(a.affection,2);assert.ok(U.render(a.miniGame,a.minigames[0]).includes('お手本'));
  const b=S.createState('junior','lecture');assert.deepEqual(b.minigames,[]);assert.equal(b.miniGame,null);assert.equal(S.finishMiniGame(b,true),false);
});
test('memory mismatches recover, matching is unique, reset clears pairs, and hint count is deliberate',()=>{
  const g=M.create('minor:festival','junior',()=>.2);const a=0,b=g.cards.findIndex(c=>c.id!==g.cards[a].id),c=g.cards.findIndex((c,i)=>i!==a&&c.id===g.cards[a].id);
  M.act(g,'card',a);assert.equal(M.act(g,'card',a),false);M.act(g,'card',b);assert.equal(g.mistakes,1);assert.equal(g.matched.length,0);
  M.act(g,'card',c);M.act(g,'card',a);assert.equal(g.matched.length,1);assert.equal(M.act(g,'card',a),false);
  M.act(g,'hint');assert.equal(g.hints,1);M.act(g,'hint');assert.equal(g.hints,1);M.act(g,'reset');assert.deepEqual(g.matched,[]);assert.deepEqual(g.revealed,[]);
});
test('incorrect order and invalid moves do not win; undo and retry remain usable',()=>{
  const g=M.create('minor:rescue','junior');[1,0,2,3].forEach(i=>M.act(g,'pick',i));M.act(g,'check');assert.equal(g.status,'playing');assert.equal(g.mistakes,1);assert.equal(M.act(g,'pick',2),false);M.act(g,'undo');assert.equal(g.order.length,3);M.act(g,'reset');solveRound(g);
  const r=M.create('adult:rain','adult');M.act(r,'cell',24);assert.deepEqual(r.path,[0]);assert.equal(M.act(r,'cell',6),false);M.act(r,'cell',1);M.act(r,'undo');assert.deepEqual(r.path,[0]);solveRound(r);
});
test('statistics needs both a correct calculation and a valid explanation',()=>{
  const g=M.create('adult:presentation','adult'),p=M.puzzle(g);
  assert.equal(M.act(g,'reason',p.reason),false);
  M.act(g,'check');assert.equal(g.attempts,0);
  M.act(g,'metric',p.metric); M.act(g,'estimate',p.estimates.indexOf(p.answer));M.act(g,'check');
  assert.ok(g.analyzed);assert.equal(g.status,'playing');assert.equal(M.act(g,'metric',0),false);
  M.act(g,'reason',(p.reason+1)%3);assert.equal(g.status,'playing');M.act(g,'reason',p.reason);assert.equal(g.status,'round-clear');
});

test('a wrong bit total and logic output show feedback without ending the round',()=>{
  for(const key of ['minor:lecture','adult:lecture']){const g=M.create(key,'senior');M.act(g,'check');assert.equal(g.status,'playing');assert.equal(g.mistakes,1);assert.equal(M.act(g,'bit',99),false);solveRound(g);}
});

test('all adult circuits accept exactly the states satisfying every output and the change limit',()=>{
  for(let round=0;round<4;round++) {
    let solutions=0;const p=M.challenges.logic[round];
    for(let mask=0;mask<2**p.labels.length;mask++) {
      const g=M.create('adult:lecture','adult');g.round=round;M.act(g,'reset');
      const bits=p.labels.map((_,i)=>Boolean(mask & (1<<i)));
      if(p.locked.some(i=>bits[i]!==p.initial[i]))continue;
      bits.forEach((b,i)=>{if(b!==g.switches[i])M.act(g,'switch',i);});
      const expected=p.checks.every(c=>c.evaluate(bits)===c.target)&&M.challenges.changes(p,bits)<=p.maxChanges;
      M.act(g,'check');assert.equal(g.status==='round-clear',expected);
      if(expected)solutions++;
    }
    assert.ok(solutions>0);assert.ok(solutions<2**p.labels.length/2);
    const g=M.create('adult:lecture','adult');g.round=round;M.act(g,'reset');
    for(const i of p.locked){assert.equal(M.act(g,'switch',i),false);assert.equal(g.switches[i],p.initial[i]);}
  }
});

test('route rejects missing or reversed relays and an expensive otherwise valid path',()=>{
  const invalid=[
    [0,1,2,3,4,9,14,19,24],
    [0,5,10,15,16,17,12,7,8,9,14,19,24],
    [0,1,2,7,8,13,12,17,22,23,24]
  ];
  for(const path of invalid){const g=M.create('adult:rain','adult');for(const cell of path.slice(1))assert.ok(M.act(g,'cell',cell));assert.equal(g.status,'playing');assert.equal(g.mistakes,1);assert.ok(M.act(g,'undo'));assert.notEqual(g.path.at(-1),24);}
  for(let round=0;round<3;round++){
    const g=M.create('adult:rain','adult');g.round=round;M.act(g,'reset');const p=M.puzzle(g);
    assert.equal(new Set(p.path).size,p.path.length);assert.equal(p.path[0],0);assert.equal(p.path.at(-1),24);
    assert.ok(p.path.indexOf(p.relays[0])<p.path.indexOf(p.relays[1]));assert.ok(M.challenges.routeCost(p,p.path)<=p.budget);
    solveRound(g);
  }
});

test('adult statistics calculations include duplicates, even-sized medians and correct means',()=>{
  for(let round=0;round<4;round++) {
    const p=M.challenges.statistics[round],sorted=[...p.values].sort((a,b)=>a-b),n=sorted.length;
    const calculated=p.metric===0?p.values.reduce((s,v)=>s+v,0)/n:(sorted[n/2-1]+sorted[n/2])/2;
    assert.equal(calculated,p.answer);assert.equal(p.estimates.filter(v=>v===p.answer).length,1);
    for(let metric=0;metric<3;metric++)for(let choice=0;choice<p.estimates.length;choice++){
      const g=M.create('adult:presentation','adult');g.round=round;M.act(g,'reset');M.act(g,'metric',metric);M.act(g,'estimate',choice);M.act(g,'check');
      assert.equal(g.analyzed,metric===p.metric&&p.estimates[choice]===p.answer);
    }
  }
});

test('minor final bit puzzles ask for inference without expanding beyond the taught bit width',()=>{
  for(const course of ['junior','senior'])for(let round=0;round<5;round++){
    const g=M.create('minor:lecture',course);g.round=round;const p=M.puzzle(g);
    assert.ok(p.value<2**p.weights.length);assert.equal(Boolean(p.clue),round>=3);
    if(p.clue)assert.ok(!U.render(g).includes('届ける数字</small><strong>'+p.value+'</strong>'));
    solveRound(g);
  }
});
