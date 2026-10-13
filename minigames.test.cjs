const test=require('node:test'),assert=require('node:assert/strict');
const M=require('./minigames.js'),S=require('./story.js'),U=require('./minigame-ui.js'),C=M.challenges;
function solve(g){
 const p=M.puzzle(g);
 if(g.kind==='bits')p.plan.forEach(i=>M.act(g,'bit',i));
 if(g.kind==='cipher')p.answer.forEach((v,i)=>M.act(g,'map',i*4+v));
 if(g.kind==='logic')p.plan.forEach(i=>M.act(g,'switch',i));
 if(g.kind==='sequence')p.required.forEach(i=>M.act(g,'pick',i));
 if(g.kind==='route')p.path.slice(1).forEach(i=>M.act(g,'cell',i));
 if(g.kind==='median'){p.records.forEach((_,i)=>{if(!p.keep.includes(i))M.act(g,'record',i);});M.act(g,'metric',p.metric);M.act(g,'estimate',p.answer);}
 if(g.kind!=='route')M.act(g,'check');
 if(g.kind==='median'){assert.ok(g.analyzed);M.act(g,'reason',p.reason);}
 assert.equal(g.status,'round-clear',g.key+' round '+g.round+' '+g.message);
}
for(const key of Object.keys(M.catalog))test(key+': all rounds, reset, help and single completion',()=>{
 for(const course of key.startsWith('minor')?['junior','senior']:['adult']){
  const g=M.create(key,course);
  for(let round=0;round<M.total(g);round++){
   assert.equal(g.round,round);assert.ok(U.render(g).includes(M.config(key).title));
   M.act(g,'hint');assert.equal(g.showHint,true);assert.ok(M.hint(g));M.act(g,'hint');
   solve(g);assert.match(U.render(g),/fieldset class="mini-board" disabled/);
   const snap=JSON.stringify(g);assert.equal(M.act(g,'check'),false);assert.equal(JSON.stringify(g),snap);
   M.act(g,'next');
  }
  assert.equal(g.status,'complete');assert.equal(M.act(g,'reset'),false);assert.ok(M.solution(g).length>40);
  const s=S.createState(course,key.split(':')[1]);s.index=S.activeScenes(s).findIndex(x=>x.type==='minigame');s.affection=4;
  assert.equal(S.advance(s),false);assert.equal(S.finishMiniGame(s),false);s.miniGame=g;
  assert.ok(S.finishMiniGame(s));assert.equal(S.finishMiniGame(s),false);assert.equal(s.affection,4);assert.equal(S.ending(s),'sweet');assert.ok(S.advance(s));
 }
});
test('assistance can finish every game without changing the romance',()=>{
 for(const key of Object.keys(M.catalog)){
  const s=S.createState(key.startsWith('adult')?'adult':'junior',key.split(':')[1]);s.index=S.activeScenes(s).findIndex(x=>x.type==='minigame');
  assert.ok(S.finishMiniGame(s,true));assert.equal(s.affection,0);assert.ok(U.render(s.miniGame,s.minigames[0]).includes('お手本'));assert.ok(S.advance(s));assert.ok(S.scene(s).text.includes('解説')||S.scene(s).text.includes('半分ずつ'));
 }
});
test('linked lamps require the advertised minimum moves, with undo and limit enforcement',()=>{
 for(const course of ['junior','senior'])for(let round=0;round<5;round++){
  const g=M.create('minor:lecture',course);g.round=round;M.act(g,'reset');const p=M.puzzle(g),original=[...g.bits];
  M.act(g,'bit',0);assert.equal(g.bits.filter((v,i)=>v!==original[i]).length,p.links[0].length);M.act(g,'undo');assert.deepEqual(g.bits,original);
  let min=99;
  for(let mask=0;mask<2**p.links.length;mask++){
   const b=[...p.initial];let moves=0;
   p.links.forEach((link,i)=>{if(mask&(1<<i)){moves++;link.forEach(j=>b[j]=!b[j]);}});
   if(p.weights.reduce((s,w,i)=>s+(b[i]?w:0),0)===p.value)min=Math.min(min,moves);
  }
  assert.equal(min,p.maxMoves);for(let n=0;n<p.maxMoves+2;n++)M.act(g,'bit',0);assert.equal(g.order.length,p.maxMoves);
  M.act(g,'reset');solve(g);
 }
});
test('cipher clues have exactly one solution and repeated values cannot pass',()=>{
 const perms=a=>a.length?a.flatMap((x,i)=>perms(a.filter((_,j)=>j!==i)).map(t=>[x,...t])):[[]];
 for(const course of ['junior','senior'])for(let round=0;round<3;round++){
  const g=M.create('minor:festival',course);g.round=round;M.act(g,'reset');const p=M.puzzle(g);
  const satisfy=(a,b,c,d)=>course==='junior'?[a===c+1&&b>a,a===c+1&&b<c,b===a+2&&c>a][round]:[a===c+1&&b===a+1&&d<b,a===c+1&&c===b+1&&d<b,d===a+1&&b===a+2&&c<d][round];
  assert.deepEqual(perms(p.values).filter(v=>satisfy(...v)),[p.answer]);
  p.symbols.forEach((_,i)=>M.act(g,'map',i*4+p.values[0]));M.act(g,'check');assert.equal(g.status,'playing');
  const before=[...g.mapping];M.act(g,'hint');assert.deepEqual(g.mapping,before);solve(g);
 }
});
test('circuits have reachable minimum-length safe plans, including temporary toggles',()=>{
 for(const p of C.logic){
  let queue=[{state:p.initial,depth:0}],seen=new Set([p.initial.join()]),shortest;
  for(let head=0;head<queue.length;head++){
   const {state,depth}=queue[head];
   if(state.every((b,i)=>b===p.goal[i])){shortest=depth;break;}
   for(let input=0;input<state.length;input++){
    if(p.guards.some(g=>g.input===input&&!g.allow(state)))continue;
    const next=[...state];next[input]=!next[input];
    if(p.safety.some(c=>!c.evaluate(next))||seen.has(next.join()))continue;
    seen.add(next.join());queue.push({state:next,depth:depth+1});
   }
  }
  assert.equal(shortest,p.maxMoves,p.title);assert.ok(C.logicTrace(p,p.plan).reached);assert.equal(C.logicTrace(p,p.plan).error,'');
 }
 const g=M.create('adult:lecture','adult');[0,1,2,3].forEach(i=>M.act(g,'switch',i));
 M.act(g,'check');assert.equal(g.status,'playing');assert.match(g.message,/1手目/);
 M.act(g,'undo');assert.equal(g.order.length,3);M.act(g,'reset');solve(g);
 const p=C.logic[2];assert.ok(p.plan.length>p.goal.filter((v,i)=>v!==p.initial[i]).length,'safe transitions require temporary work, not just final matching');
});
test('route requires key, relay order, cost and TTL simultaneously',()=>{
 for(let round=0;round<3;round++){
  const g=M.create('adult:rain','adult');g.round=round;M.act(g,'reset');const p=M.puzzle(g);
  assert.equal(M.act(g,'cell',p.blocked[0]),false);M.act(g,'cell',24);assert.deepEqual(g.path,[0]);
  let valid=0,ttlRejected=0,keyRejected=0;
  function walk(path,cost){
   const at=path.at(-1);if(path.length>20)return;
   if(at===24){
    const a=path.indexOf(p.relays[0]),b=path.indexOf(p.relays[1]),k=path.indexOf(p.key);
    const ordinary=a>=0&&b>a&&cost<=p.budget;
    if(ordinary&&k>=0&&k<b&&path.length-1<=p.ttl)valid++;
    if(ordinary&&k>=0&&k<b&&path.length-1>p.ttl)ttlRejected++;
    if(ordinary&&(k<0||k>b))keyRejected++;
    const model=M.create('adult:rain','adult');model.round=round;M.act(model,'reset');path.slice(1).forEach(n=>M.act(model,'cell',n));
    assert.equal(model.status==='round-clear',ordinary&&k>=0&&k<b&&path.length-1<=p.ttl);return;
   }
   for(const n of [at-5,at+5,at-1,at+1])if(n>=0&&n<25&&!p.blocked.includes(n)&&!path.includes(n)&&Math.abs(Math.floor(at/5)-Math.floor(n/5))+Math.abs(at%5-n%5)===1)walk([...path,n],cost+(p.costs[n]||1));
  }
  walk([0],0);assert.ok(valid>0);assert.ok(ttlRejected+keyRejected>0,'new conditions exclude previously valid paths');solve(g);
 }
});
test('rescue distractors fail, order matters, and reset/undo allow recovery',()=>{
 for(const course of ['junior','senior'])for(let round=0;round<4;round++){
  const g=M.create('minor:rescue',course);g.round=round;M.act(g,'reset');const p=M.puzzle(g);
  [4,...p.required.slice(1)].forEach(i=>M.act(g,'pick',i));M.act(g,'check');assert.equal(g.status,'playing');assert.match(g.message,/守れません/);
  M.act(g,'reset');[...p.required].reverse().forEach(i=>M.act(g,'pick',i));M.act(g,'check');assert.equal(g.status,'playing');
  M.act(g,'undo');assert.equal(g.order.length,p.required.length-1);M.act(g,'reset');solve(g);
 }
});
test('statistics validates actual records, weighted counts, numeric answer and reason',()=>{
 for(let round=0;round<4;round++){
  const g=M.create('adult:presentation','adult');g.round=round;M.act(g,'reset');const p=M.puzzle(g);
  const values=p.keep.flatMap(i=>Array(p.records[i].count).fill(p.records[i].value)).sort((a,b)=>a-b);
  const answer=p.metric===0?values.reduce((a,b)=>a+b,0)/values.length:(values[values.length/2-1]+values[values.length/2])/2;assert.equal(answer,p.answer);
  M.act(g,'metric',p.metric);M.act(g,'estimate',p.answer);M.act(g,'check');assert.equal(g.analyzed,false,'right value with bad records does not pass');
  p.records.forEach((_,i)=>{if(!p.keep.includes(i))M.act(g,'record',i);});M.act(g,'estimate',p.answer+1);M.act(g,'check');assert.equal(g.analyzed,false);
  M.act(g,'estimate',p.answer);M.act(g,'check');assert.ok(g.analyzed);assert.equal(M.act(g,'record',0),false);M.act(g,'reason',(p.reason+1)%3);assert.equal(g.status,'playing');M.act(g,'reason',p.reason);assert.equal(g.status,'round-clear');
 }
 const g=M.create('adult:presentation','adult');assert.equal(M.act(g,'estimate',NaN),false);M.act(g,'check');assert.equal(g.attempts,0);
 g.round=2;M.act(g,'reset');M.act(g,'record',1);M.act(g,'metric',1);M.act(g,'estimate',11.5);M.act(g,'check');assert.ok(g.analyzed,'either identical ID copy may be kept');
});
test('replay state is isolated and invalid actions cannot advance any board',()=>{
 for(const key of Object.keys(M.catalog)){
  const g=M.create(key,'junior'),before=JSON.stringify(g);
  for(const action of ['bit','map','pick','cell','switch','record','metric','reason'])assert.equal(M.act(g,action,99),false);
  assert.equal(JSON.stringify(g),before);assert.equal(M.act(g,'next'),false);
  M.act(g,'hint');M.act(g,'reset');assert.equal(g.hints,1);assert.equal(g.showHint,false);assert.equal(M.create(key,'junior').hints,0);
 }
});
