(()=>{'use strict';
let state=null;
const stackBuckets=['materials','consumables','talismans','formations','questItems'];
const uniqueBuckets=['equipment','artifacts'];
const inv=()=>{const s=state||window.GameStateService.get();if(!s)throw new Error('Inventory chưa gắn GameState');return s.inventory;};
const emit=(type,data)=>window.GameEvents&&window.GameEvents.emit(type,data);
function resolveBucket(id,meta={}){if(meta.bucket&&inv()[meta.bucket]!=null)return meta.bucket;if(meta.kind==='gear'||meta.type==='equipment')return'equipment';if(meta.kind==='artifact'||meta.type==='artifact')return'artifacts';if(meta.type==='talisman')return'talismans';if(meta.type==='formation')return'formations';if(meta.type==='quest')return'questItems';if(meta.type==='consumable')return'consumables';return'materials';}
function get(id,bucket){const data=inv();if(bucket){const b=data[bucket];return Array.isArray(b)?b.find(x=>x&&(x.id===id||x.uid===id))||null:Number(b[id]||0);}for(const name of stackBuckets)if(data[name][id]!=null)return Number(data[name][id]||0);for(const name of uniqueBuckets){const found=data[name].find(x=>x&&(x.id===id||x.uid===id));if(found)return found;}return null;}
function count(id,bucket){const value=get(id,bucket);return typeof value==='number'?value:(value?1:0);}
function has(id,qty=1,bucket){return count(id,bucket)>=Math.max(0,Number(qty)||0);}
function add(id,qty=1,meta={}){const bucket=resolveBucket(id,meta),data=inv()[bucket];if(Array.isArray(data)){const item=typeof id==='object'?id:{...meta,id:meta.id||id};if(!item.id&&!item.uid)throw new Error('Item unique thiếu id');data.push(item);emit('itemAdded',{id:item.id||item.uid,qty:1,bucket,item});return item;}qty=Math.max(0,Number(qty)||0);if(!qty)return Number(data[id]||0);data[id]=Number(data[id]||0)+qty;emit('itemAdded',{id,qty,bucket,total:data[id],meta});return data[id];}
function remove(id,qty=1,bucket){const data=inv(),target=bucket||resolveBucket(id,{}),b=data[target];if(Array.isArray(b)){const index=b.findIndex(x=>x&&(x.id===id||x.uid===id));if(index<0)return false;const [item]=b.splice(index,1);emit('itemRemoved',{id,qty:1,bucket:target,item});return item;}qty=Math.max(0,Number(qty)||0);if(Number(b[id]||0)<qty)return false;b[id]-=qty;if(b[id]<=0)delete b[id];emit('itemRemoved',{id,qty,bucket:target,total:Number(b[id]||0)});return true;}
function move(id,from,to,qty=1){if(from===to)return true;const value=get(id,from);if(!value)return false;if(Array.isArray(inv()[from])){const item=remove(id,1,from);if(!item)return false;add(item,1,{...item,bucket:to});return true;}if(!remove(id,qty,from))return false;add(id,qty,{bucket:to});return true;}
function find(predicate,buckets=[...stackBuckets,...uniqueBuckets]){const out=[];const data=inv();for(const name of buckets){const b=data[name];if(Array.isArray(b)){for(const item of b)if(predicate(item,name))out.push(item);}else for(const [id,qty] of Object.entries(b))if(predicate({id,qty},name))out.push({id,qty,bucket:name});}return out;}
function getByType(type){const name={material:'materials',consumable:'consumables',equipment:'equipment',artifact:'artifacts',talisman:'talismans',formation:'formations',quest:'questItems'}[type]||type;return inv()[name];}
window.InventorySystem={attach(s){state=s;return this;},has,get,add,remove,move,find,count,getByType,getMaterials:()=>inv().materials,getEquipment:()=>inv().equipment,getArtifacts:()=>inv().artifacts,getConsumables:()=>inv().consumables};
window.GameEvents&&window.GameEvents.on('stateReady',({state:s})=>window.InventorySystem.attach(s));
})();
