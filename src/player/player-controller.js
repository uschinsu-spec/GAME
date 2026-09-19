(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function axis(input={}){let x=Number(input.joyX)||0,z=Number(input.joyY)||0;x+=(input.left?-1:0)+(input.right?1:0);z+=(input.up?1:0)+(input.down?-1:0);const l=Math.hypot(x,z);if(l>.001){x/=Math.max(1,l);z/=Math.max(1,l);}return{x,z,length:Math.min(1,l)};}
function nextPosition(player,input,dt,speed,bound=500,resolveMove=null){if(!player)return null;const a=axis(input);if(a.length<.01)return{x:player.x,z:player.z,moving:false,facing:player.facing};let nx=clamp(player.x+a.x*speed*dt,-bound,bound),nz=clamp(player.z+a.z*speed*dt,-bound,bound);if(typeof resolveMove==='function'){const p=resolveMove(player.x,player.z,nx,nz)||{x:nx,z:nz};nx=p.x;nz=p.z;}return{x:nx,z:nz,moving:true,facing:a.x<-.05?'left':a.x>.05?'right':player.facing,moveAngle:Math.atan2(a.z,a.x)};}
function apply(player,result){if(!player||!result)return player;player.x=result.x;player.z=result.z;player.facing=result.facing||player.facing;player.moveAngle=result.moveAngle!=null?result.moveAngle:player.moveAngle;player.state=result.moving?'run':(player.state==='attack'?'attack':'idle');return player;}
function dashVector(player,input){const a=axis(input);if(a.length<.05)return{x:player&&player.facing==='left'?-1:1,z:0};return{x:a.x,z:a.z};}
window.PlayerController={axis,nextPosition,apply,dashVector};
})();