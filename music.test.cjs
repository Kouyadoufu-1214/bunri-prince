const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {tracks,createPlayer}=require('./music.js');
class FakeAudio {
  paused=true; src=''; loads=0; plays=0; listeners={}; pending=[];
  addEventListener(type,fn){this.listeners[type]=fn;}
  pause(){this.paused=true;this.listeners.pause?.();}
  load(){this.loads++;}
  removeAttribute(){this.src='';}
  play(){this.paused=false;this.plays++;return new Promise((resolve,reject)=>this.pending.push({resolve,reject}));}
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('all six ending tracks exist and are unique, including every adult and minor ending',()=>{
  const paths=[];
  for(const mode of ['minor','adult'])for(const ending of ['sweet','promise','buddy']){
    const track=tracks[mode][ending];assert.ok(track.title);
    assert.ok(fs.statSync(path.join(__dirname,track.src)).size>100000);paths.push(track.src);
  }
  assert.equal(new Set(paths).size,6);
});
test('mute, tab visibility, and returning to title stop the track; unmute resumes without reloading',async()=>{
  const audio=new FakeAudio();const player=createPlayer(audio);const track=tracks.adult.sweet;
  player.set(track,false);assert.equal(audio.plays,0);
  player.set(track,true);assert.equal(audio.plays,1);audio.pending.shift().resolve();await tick();
  player.set(track,true);assert.equal(audio.plays,1,'rendering cannot restart the track');
  player.set(track,true,false);assert.equal(audio.paused,true);
  const loads=audio.loads;player.set(track,true,true);assert.equal(audio.loads,loads);assert.equal(audio.plays,2);
  player.set(track,false,true);assert.equal(audio.paused,true);
  audio.pending.shift().resolve();await tick();assert.equal(audio.paused,true,'late play resolution cannot unmute');
  player.set(null,true);assert.equal(audio.src,'');assert.equal(audio.paused,true);
});
test('switching endings does not report stale play failures, but current failures allow recovery',async()=>{
  const audio=new FakeAudio();const failures=[];const player=createPlayer(audio,()=>{},e=>failures.push(e));
  player.set(tracks.minor.sweet,true);const old=audio.pending.shift();
  player.set(tracks.adult.promise,true);assert.equal(audio.src,tracks.adult.promise.src);
  old.reject(new Error('old request'));await tick();assert.equal(failures.length,0);
  audio.pending.shift().reject(new Error('network'));await tick();assert.equal(failures.length,1);assert.equal(audio.paused,true);
  player.set(tracks.adult.promise,false);player.set(tracks.adult.promise,true);assert.equal(audio.plays,3);
});
