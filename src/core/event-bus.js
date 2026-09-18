(()=>{'use strict';
class EventBus{
 constructor(){this.listeners=new Map();this.emitting=new Set();}
 on(type,handler,{once=false,signal}={}){if(typeof handler!=='function')throw new TypeError('Event handler phải là function');const row={handler,once};const list=this.listeners.get(type)||[];list.push(row);this.listeners.set(type,list);const off=()=>this.off(type,handler);if(signal){if(signal.aborted)off();else signal.addEventListener('abort',off,{once:true});}return off;}
 once(type,handler,options={}){return this.on(type,handler,{...options,once:true});}
 off(type,handler){const list=this.listeners.get(type);if(!list)return;const next=list.filter(x=>x.handler!==handler);if(next.length)this.listeners.set(type,next);else this.listeners.delete(type);}
 emit(type,payload){const list=(this.listeners.get(type)||[]).slice();if(!list.length)return 0;let called=0;for(const row of list){try{row.handler(payload);called++;}catch(error){console.error('[Events]',type,error);}if(row.once)this.off(type,row.handler);}return called;}
 clear(type){if(type)this.listeners.delete(type);else this.listeners.clear();}
 count(type){return (this.listeners.get(type)||[]).length;}
}
window.GameEvents=window.GameEvents||new EventBus();
window.EventBus=EventBus;
})();
