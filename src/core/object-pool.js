(()=>{'use strict';
class ObjectPool{constructor({create,reset=()=>{},dispose=()=>{},max=128}){this.create=create;this.reset=reset;this.dispose=dispose;this.max=max;this.free=[];this.active=new Set();}acquire(data){const value=this.free.pop()||this.create(data);this.reset(value,data,true);this.active.add(value);return value;}release(value){if(!this.active.delete(value))return false;this.reset(value,null,false);if(this.free.length<this.max)this.free.push(value);else this.dispose(value);return true;}clear(){for(const v of this.active)this.dispose(v);for(const v of this.free)this.dispose(v);this.active.clear();this.free.length=0;}stats(){return{active:this.active.size,free:this.free.length,max:this.max};}}
window.ObjectPool=ObjectPool;window.GamePools=new Map();
})();
