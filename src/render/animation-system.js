(()=>{'use strict';
const DEFAULTS={idle:{frames:4,fps:6,loop:true},run:{frames:4,fps:10,loop:true},attack:{frames:8,fps:12,loop:false},cast:{frames:8,fps:12,loop:false},dash:{frames:6,fps:14,loop:false}};
function tick(actor,dt,defs=DEFAULTS){if(!actor)return actor;const def=defs[actor.state]||defs.idle||DEFAULTS.idle;actor.animTimer=(actor.animTimer||0)+dt;const step=1/Math.max(1,def.fps||1);while(actor.animTimer>=step){actor.animTimer-=step;actor.frame=(actor.frame||0)+1;if(actor.frame>=def.frames){if(def.loop)actor.frame=0;else{actor.state='idle';actor.frame=0;break;}}}return actor;}
function reset(actor,state='idle'){if(!actor)return;actor.state=state;actor.frame=0;actor.animTimer=0;}
window.AnimationSystem={DEFAULTS,tick,reset};
})();