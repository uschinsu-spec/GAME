(()=>{'use strict';
const state={actors:[],boss:null};
function bind(actors,boss=null){state.actors=actors||[];state.boss=boss;return state;}
function all(){return state.actors;}
function living(){return state.actors.filter(a=>a&&!a.dead);}
function nearest(x,z,range=Infinity,filter=null){let best=null,bd2=range*range;for(const a of state.actors){if(!a||a.dead||(filter&&!filter(a)))continue;const dx=a.x-x,dz=a.z-z,d2=dx*dx+dz*dz;if(d2<bd2){bd2=d2;best=a;}}return best;}
function setBoss(actor){state.boss=actor||null;return state.boss;}
window.EnemySystem={bind,all,living,nearest,setBoss,get boss(){return state.boss;}};
})();