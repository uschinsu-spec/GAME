(()=>{'use strict';
const active=[];
function add(projectile){if(projectile)active.push(projectile);return projectile;}
function update(dt){let w=0;for(let i=0;i<active.length;i++){const p=active[i];if(!p||p.done)continue;p.t=(Number(p.t)||0)-dt;if(typeof p.update==='function')p.update(dt,p);if(p.t<=0){p.done=true;try{if(typeof p.complete==='function')p.complete(p);}catch(e){console.error('[ProjectileSystem]',e);}try{if(p.mesh&&!p.mesh.isDisposed())p.mesh.dispose();}catch(e){}continue;}active[w++]=p;}active.length=w;}
function clear(){for(const p of active){try{if(p.mesh&&!p.mesh.isDisposed())p.mesh.dispose();}catch(e){}}active.length=0;}
function count(){return active.length;}
window.ProjectileSystem={add,update,clear,count,active};
})();