(()=>{'use strict';
let current=null;
function open(id,payload={}){current=id||null;window.GameEvents&&window.GameEvents.emit('panelOpenRequested',{id:current,payload});return current;}
function close(){const prev=current;current=null;window.GameEvents&&window.GameEvents.emit('panelCloseRequested',{id:prev});return prev;}
function toggle(id,payload={}){return current===id?close():open(id,payload);}
window.PanelSystem={open,close,toggle,get current(){return current;}};
})();