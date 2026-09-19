(()=>{'use strict';
const AudioContextCtor=window.AudioContext||window.webkitAudioContext;
let audioCtx=null;
function getAudio(){if(!audioCtx&&AudioContextCtor){try{audioCtx=new AudioContextCtor();}catch(e){}}if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
function tone(ctx,type,f0,f1,duration,gain=0.2,delay=0){const now=ctx.currentTime+delay,osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(Math.max(1,f0),now);if(f1&&f1!==f0)osc.frequency.exponentialRampToValueAtTime(Math.max(1,f1),now+duration);g.gain.setValueAtTime(gain,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(g);g.connect(ctx.destination);osc.start(now);osc.stop(now+duration+.02);}
function noise(ctx,duration=.12,gain=.12,delay=0,highpass=180){const rate=ctx.sampleRate,len=Math.max(1,Math.floor(rate*duration)),buffer=ctx.createBuffer(1,len,rate),data=buffer.getChannelData(0);for(let i=0;i<len;i++)data[i]=(Math.random()*2-1)*(1-i/len);const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain(),now=ctx.currentTime+delay;src.buffer=buffer;filter.type='highpass';filter.frequency.value=highpass;g.gain.setValueAtTime(gain,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);src.connect(filter);filter.connect(g);g.connect(ctx.destination);src.start(now);src.stop(now+duration+.02);}
function chord(ctx,notes,type='sine',duration=.22,gain=.08,step=.025){notes.forEach((f,i)=>tone(ctx,type,f,f*.98,duration,gain,step*i));}
function sfx(type){try{const ctx=getAudio();if(!ctx)return;switch(type){
case'slash':tone(ctx,'sawtooth',460,90,.12,.22);break;case'hit':tone(ctx,'triangle',150,35,.1,.28);noise(ctx,.07,.08,0,120);break;
case'skill1':tone(ctx,'square',580,180,.18,.18);break;case'skill2':tone(ctx,'sine',260,740,.32,.25);break;case'skill3':tone(ctx,'sawtooth',240,55,.36,.3);break;case'dash':tone(ctx,'triangle',380,80,.15,.22);break;case'item':tone(ctx,'sine',880,1320,.2,.18);break;
case'swordCast':chord(ctx,[392,587,784],'triangle',.2,.065,.035);noise(ctx,.12,.07,0,650);break;case'swordImpact':tone(ctx,'sawtooth',540,95,.14,.16);noise(ctx,.1,.13,0,260);break;
case'bladeCast':tone(ctx,'sawtooth',320,760,.16,.12);noise(ctx,.15,.12,0,900);break;case'bladeImpact':tone(ctx,'square',210,55,.15,.15);noise(ctx,.13,.16,0,190);break;
case'fireCast':tone(ctx,'sawtooth',120,390,.25,.11);noise(ctx,.24,.1,0,140);break;case'fireImpact':tone(ctx,'triangle',180,42,.22,.16);noise(ctx,.2,.18,0,80);break;
case'thunderCast':chord(ctx,[110,220,440],'square',.18,.045,.02);noise(ctx,.14,.11,0,700);break;case'thunder':case'thunderImpact':tone(ctx,'sawtooth',880,48,.2,.14);noise(ctx,.23,.2,0,90);break;
case'iceCast':chord(ctx,[659,988,1318],'sine',.28,.06,.025);break;case'iceImpact':tone(ctx,'triangle',1200,180,.18,.12);noise(ctx,.14,.1,0,1100);break;
case'natureCast':chord(ctx,[330,494,659],'sine',.3,.055,.03);break;case'natureImpact':tone(ctx,'triangle',520,130,.2,.12);noise(ctx,.12,.075,0,500);break;
case'windCast':tone(ctx,'sine',280,1100,.28,.09);noise(ctx,.25,.08,0,1100);break;case'windImpact':tone(ctx,'sine',920,140,.16,.11);noise(ctx,.13,.1,0,850);break;
case'earthCast':tone(ctx,'triangle',95,150,.24,.14);noise(ctx,.18,.12,0,45);break;case'earthImpact':tone(ctx,'square',105,36,.25,.18);noise(ctx,.24,.2,0,35);break;
case'metalCast':chord(ctx,[740,988,1480],'triangle',.19,.055,.018);break;case'metalImpact':tone(ctx,'triangle',1550,260,.2,.13);noise(ctx,.1,.08,0,1500);break;
case'levelUp':[523,659,784,1046].forEach((f,i)=>tone(ctx,'triangle',f,f,.35,.25,i*.09));break;case'breakthrough':[261,329,392,523,659,784,1046].forEach((f,i)=>tone(ctx,'sine',f,f,.55,.3,i*.08));break;case'skill4':[392,523,659,784].forEach((f,i)=>tone(ctx,'sine',f,f,.45,.2,i*.07));break;}}catch(e){}}
window.AudioSystem={getAudio,sfx};
})();
