(()=>{'use strict';
function within2D(a,b,range){if(!a||!b)return false;const dx=(a.x||0)-(b.x||0),dz=(a.z||0)-(b.z||0);return dx*dx+dz*dz<=range*range;}
function setActorVisible(actor,viewer,meshRange=180,shadowRange=70){if(!actor||!viewer)return;const meshVisible=within2D(actor,viewer,meshRange),shadowVisible=within2D(actor,viewer,shadowRange);if(actor.mesh)actor.mesh.setEnabled(meshVisible&&!actor.dead);if(actor.shadow)actor.shadow.setEnabled(shadowVisible&&!actor.dead);return meshVisible;}
window.CullingSystem={within2D,setActorVisible};
})();