const test=require('node:test'),assert=require('node:assert/strict');
const S=require('./story.js'),D=require('./staging.js'),P=require('./passages.js');
function at(course,episode,id,choices,affection=6){
  const state=S.createState(course,episode);state.index=S.activeScenes(state).findIndex(s=>s.id===id);state.choices=choices;state.affection=affection;
  return {state,scene:S.scene(state)};
}
test('all six arcs recall each opening, pull away, and respect the final choice',()=>{
  for(const course of ['junior','adult'])for(const {id} of S.episodes[course==='adult'?'adult':'minor']){
    const texts=new Set();
    for(let answer=0;answer<3;answer++){
      const {scene}=at(course,id,'tensionRecall',[answer,0,0]);texts.add(scene.text);
      assert.equal(P.split(scene).map(p=>p.text).join(''),scene.text);
      assert.ok(P.split(scene).filter(p=>p.kind==='speech').every(p=>p.speaker==='御家雄一'));
    }
    assert.equal(texts.size,3);
    const apart=at(course,id,'tensionBreak',[0,0,0]),near=at(course,id,'tensionCoda',[0,0,0]);
    assert.equal(D.direction(apart.state,apart.scene).distance,'far');
    assert.equal(near.scene.beat,'heart');
    assert.equal(D.direction(near.state,near.scene).distance,course==='adult'?'normal':'close');
    for(const choice of [1,2]){
      const space=at(course,id,'tensionCoda',[0,0,choice]);assert.equal(space.scene.beat,'hold');assert.notEqual(space.scene.text,near.scene.text);
    }
  }
});
test('minigame retry changes dialogue, not affection or ending',()=>{
  for(const course of ['junior','adult']){
    const variants=new Set();
    for(const result of [{assisted:true,mistakes:0},{assisted:false,mistakes:2},{assisted:false,mistakes:0}]){
      const {state}=at(course,'lecture','miniAfter',[0],2);state.minigames=[result];variants.add(S.scene(state).text);
      assert.equal(state.affection,2);assert.equal(S.ending(state),'promise');
    }
    assert.equal(variants.size,3);
  }
});
