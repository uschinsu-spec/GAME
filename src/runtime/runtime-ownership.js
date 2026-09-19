(()=>{'use strict';
const owners=new Map();
function claim(system,owner='modern'){if(!system)return false;const current=owners.get(system);if(current&&current!==owner)return false;owners.set(system,owner);window.GameEvents&&window.GameEvents.emit('runtimeOwnershipChanged',{system,owner});return true;}
function release(system,owner='modern'){if(owners.get(system)!==owner)return false;owners.delete(system);window.GameEvents&&window.GameEvents.emit('runtimeOwnershipChanged',{system,owner:null});return true;}
function isOwned(system,owner='modern'){return owners.get(system)===owner;}
function ownerOf(system){return owners.get(system)||null;}
function snapshot(){return Object.fromEntries(owners);}
window.RuntimeOwnership={claim,release,isOwned,ownerOf,snapshot};
})();
