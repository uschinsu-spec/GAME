(()=>{'use strict';
const tasks=new Map();let elapsed=0;
function add(id,interval,fn,{immediate=false,enabled=true}={}){tasks.set(id,{id,interval:Math.max(.001,Number(interval)||.001),fn,acc:immediate?Number(interval)||0:0,enabled});return id;}
function remove(id){tasks.delete(id);}
function enable(id,value=true){const t=tasks.get(id);if(t)t.enabled=!!value;}
function tick(dt,ctx){dt=Math.max(0,Number(dt)||0);elapsed+=dt;for(const t of tasks.values()){if(!t.enabled||typeof t.fn!=='function')continue;t.acc+=dt;if(t.acc<t.interval)continue;const runs=Math.min(4,Math.floor(t.acc/t.interval));t.acc-=runs*t.interval;for(let i=0;i<runs;i++){try{t.fn(t.interval,ctx);}catch(error){console.error('[GameLoopSystem]',t.id,error);}}}}
function clear(){tasks.clear();}
function stats(){return{taskCount:tasks.size,elapsed};}
window.GameLoopSystem={add,remove,enable,tick,clear,stats};
})();