(()=>{'use strict';
function emit(pos,text,color='#ffd08a',crit=false){if(window.GameEvents)window.GameEvents.emit('floatingTextRequested',{pos,text,color,crit});}
window.FloatingTextSystem={emit};
})();