(()=>{'use strict';
const C=window.GameConstants;let timer=0,dirty=false,stateGetter=()=>window.GameStateService.get(),delay=900,lastSave=0;
function write(reason='debounce'){let state=stateGetter();if(!state)return false;clearTimeout(timer);timer=0;try{if(window.GameStateService)state=window.GameStateService.migrate(state);localStorage.setItem(C.SAVE_KEY,JSON.stringify(state));dirty=false;lastSave=Date.now();window.GameEvents&&window.GameEvents.emit('saveCompleted',{reason,at:lastSave,version:state.version});return true;}catch(error){console.error('[SaveService]',error);window.GameEvents&&window.GameEvents.emit('saveFailed',{reason,error});return false;}}
function markDirty(reason='stateChanged'){dirty=true;clearTimeout(timer);timer=setTimeout(()=>write(reason),delay);}
function read(){try{const raw=localStorage.getItem(C.SAVE_KEY);return raw?JSON.parse(raw):{};}catch(error){console.warn('[SaveService] save lỗi, dùng state mới',error);return{};}}
function bindLifecycle(){if(bindLifecycle.done)return;bindLifecycle.done=true;document.addEventListener('visibilitychange',()=>{if(document.hidden)write('visibilitychange');});window.addEventListener('pagehide',()=>write('pagehide'));}
window.SaveService={configure(options={}){if(options.stateGetter)stateGetter=options.stateGetter;if(options.delay)delay=Math.max(250,Number(options.delay)||900);bindLifecycle();return this;},read,markDirty,forceSave:write,flush:write,isDirty:()=>dirty,lastSave:()=>lastSave};
})();
