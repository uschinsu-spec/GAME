(()=>{'use strict';
let activeMap=null;const maps=new Map();
const realmForLevel=level=>level<=12?0:level<=40?1:level<=68?2:level<=96?3:4;
function normalize(config={},meta={}){const minLevel=Number(config.minLevel??meta.min)||1,maxLevel=Number(config.maxLevel??meta.max)||minLevel;return Object.assign(config,{
 id:config.id||meta.id,name:config.name||meta.name||config.id,world:config.world||meta.world||'nhan_gioi',continent:config.continent||meta.continent||'',region:config.region||meta.region||'',
 minRealm:Number.isFinite(config.minRealm)?config.minRealm:realmForLevel(minLevel),maxRealm:Number.isFinite(config.maxRealm)?config.maxRealm:realmForLevel(maxLevel),minLevel,maxLevel,
 element:config.element||meta.element||'Vô',faction:config.faction||meta.faction||'Trung lập',enemyTable:Array.isArray(config.enemyTable)?config.enemyTable:(meta.enemy||[]),bossTable:Array.isArray(config.bossTable)?config.bossTable:[],
 resourceTable:Array.isArray(config.resourceTable)?config.resourceTable:[],resourceZones:Array.isArray(config.resourceZones)?config.resourceZones:[{id:'main',minGrade:1,maxGrade:realmForLevel(maxLevel)+1,count:10}],
 environment:config.environment||{},spawnPoints:Array.isArray(config.spawnPoints)?config.spawnPoints:[],portals:Array.isArray(config.portals)?config.portals:[],safeZones:Array.isArray(config.safeZones)?config.safeZones:[],music:config.music||null,weather:config.weather||'clear',assetGroups:Array.isArray(config.assetGroups)?config.assetGroups:[]
 });}
function register(config,meta={}){const map=normalize(config,meta);if(map.id)maps.set(map.id,map);return map;}
function registerMany(list=[]){return list.map(x=>register(x));}
function setActive(config){activeMap=register(config);return activeMap;}
function get(id){return maps.get(id)||null;}
function all(){return [...maps.values()];}
function accessible(config,state=window.GameState){if(!config)return false;const realm=Number(state&&state.realm)||0,level=Number(state&&state.level)||1;return realm>=Number(config.minRealm||0)&&level>=Number(config.minLevel||1);}
function isPointInSafeZone(x,z,config=activeMap){if(!config||!Array.isArray(config.safeZones))return false;for(const s of config.safeZones){if(!s)continue;if(s.shape==='circle'||s.radius!=null){const dx=x-Number(s.x||0),dz=z-Number(s.z||0),r=Math.max(0,Number(s.radius)||0);if(dx*dx+dz*dz<=r*r)return true;}else if(s.shape==='rect'||s.width!=null||s.height!=null){const hw=Math.max(0,Number(s.width)||0)/2,hh=Math.max(0,Number(s.height)||0)/2;if(Math.abs(x-Number(s.x||0))<=hw&&Math.abs(z-Number(s.z||0))<=hh)return true;}}return false;}
window.WorldSystem={normalize,register,registerMany,setActive,get,all,accessible,isPointInSafeZone,get activeMap(){return activeMap;},realmForLevel};
window.GameEvents.on('mapChanged',({config})=>setActive(config));
window.GameEvents.on('mapManifestReady',({manifest})=>{if(manifest&&Array.isArray(manifest.maps))registerMany(manifest.maps);});
})();