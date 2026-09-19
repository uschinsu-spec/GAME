(()=>{'use strict';
const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
let audioCtx=null;
function getAudio(){if(!audioCtx&&AudioContextCtor){try{audioCtx=new AudioContextCtor();}catch(e){}}if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
function tone(ctx,type,f0,f1,duration,gain=0.2,delay=0){const now=ctx.currentTime+delay,osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(f0,now);if(f1&&f1!==f0)osc.frequency.exponentialRampToValueAtTime(Math.max(1,f1),now+duration);g.gain.setValueAtTime(gain,now);g.gain.linearRampToValueAtTime(0.01,now+duration);osc.connect(g);g.connect(ctx.destination);osc.start(now);osc.stop(now+duration);}
function sfx(type){try{const ctx=getAudio();if(!ctx)return;switch(type){case'slash':tone(ctx,'sawtooth',460,90,.12,.22);break;case'hit':tone(ctx,'triangle',150,35,.1,.28);break;case'skill1':tone(ctx,'square',580,180,.18,.18);break;case'skill2':tone(ctx,'sine',260,740,.32,.25);break;case'skill3':tone(ctx,'sawtooth',240,55,.36,.3);break;case'dash':tone(ctx,'triangle',380,80,.15,.22);break;case'item':tone(ctx,'sine',880,1320,.2,.18);break;case'levelUp':[523,659,784,1046].forEach((f,i)=>tone(ctx,'triangle',f,f,.35,.25,i*.09));break;case'breakthrough':[261,329,392,523,659,784,1046].forEach((f,i)=>tone(ctx,'sine',f,f,.55,.3,i*.08));break;case'skill4':[392,523,659,784].forEach((f,i)=>tone(ctx,'sine',f,f,.45,.2,i*.07));break;}}catch(e){}}
window.AudioSystem={getAudio,sfx};
})();
