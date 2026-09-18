(()=>{'use strict';
const entries=new Map();const mapRefs=new Map();
function normalize(path){try{const u=new URL(path,location.href);u.searchParams.delete('v');return u.pathname.replace(/^\//,'');}catch(_){return String(path).replace(/\?v=[^&]+/,'');}}
async function loadJSON(path){const key='json:'+normalize(path);if(entries.has(key))return entries.get(key).value;const promise=fetch(path,{cache:'default'}).then(r=>{if(!r.ok)throw new Error(`${path} (${r.status})`);return r.json();});entries.set(key,{value:promise,refs:1,type:'json'});try{return await promise;}catch(error){entries.delete(key);throw error;}}
function loadTexture(path,scene,options={}){const key='texture:'+normalize(path);const found=entries.get(key);if(found){found.refs++;return found.value;}if(!window.BABYLON||!scene)throw new Error('Babylon scene chưa sẵn sàng');const texture=new BABYLON.Texture(path,scene,options.noMipmap!==false,options.invertY!==false,options.samplingMode);entries.set(key,{value:texture,refs:1,type:'texture'});return texture;}
function retain(path,mapId){const key=normalize(path),set=mapRefs.get(mapId)||new Set();set.add(key);mapRefs.set(mapId,set);return key;}
function release(path){const suffix=normalize(path);for(const [key,entry] of entries)if(key.endsWith(suffix)){entry.refs--;if(entry.refs<=0){if(entry.type==='texture'&&entry.value&&entry.value.dispose)entry.value.dispose();entries.delete(key);}return true;}return false;}
function releaseMap(mapId){const set=mapRefs.get(mapId);if(!set)return;for(const path of set)release(path);mapRefs.delete(mapId);}
async function preload(paths,loader=loadJSON){return Promise.allSettled(paths.map(loader));}
window.AssetManager={normalize,loadJSON,loadTexture,retain,release,releaseMap,preload,get(path){const suffix=normalize(path);for(const [key,e] of entries)if(key.endsWith(suffix))return e.value;return null;},stats:()=>({loaded:entries.size,mapGroups:mapRefs.size,textures:[...entries.values()].filter(x=>x.type==='texture').length})};
})();
