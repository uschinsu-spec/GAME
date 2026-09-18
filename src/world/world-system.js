(()=>{'use strict';
let activeMap=null;
const realmForLevel=level=>level<=12?0:level<=40?1:level<=68?2:level<=96?3:4;
function normalize(config={},meta={}){const minLevel=Number(config.minLevel??meta.min)||1,maxLevel=Number(config.maxLevel??meta.max)||minLevel;return Object.assign(config,{
 id:config.id||meta.id,name:config.name||meta.name||config.id,world:config.world||meta.world||'nhan_gioi',continent:config.continent||meta.continent||'',region:config.region||meta.region||'',
 minRealm:Number.isFinite(config.minRealm)?config.minRealm:realmForLevel(minLevel),maxRealm:Number.isFinite(config.maxRealm)?config.maxRealm:realmForLevel(maxLevel),minLevel,maxLevel,
 element:config.element||meta.element||'Vô',faction:config.faction||meta.faction||'Trung lập',enemyTable:Array.isArray(config.enemyTable)?config.enemyTable:(meta.enemy||[]),bossTable:Array.isArray(config.bossTable)?config.bossTable:[],
 resourceTable:Array.isArray(config.resourceTable)?config.resourceTable:[],resourceZones:Array.isArray(config.resourceZones)?config.resourceZones:[{id:'main',minGrade:1,maxGrade:realmForLevel(maxLevel)+1,count:10}],
 environment:config.environment||{},spawnPoints:Array.isArray(config.spawnPoints)?config.spawnPoints:[],portals:Array.isArray(config.portals)?config.portals:[],safeZones:Array.isArray(config.safeZones)?config.safeZones:[],music:config.music||null,weather:config.weather||'clear',assetGroups:Array.isArray(config.assetGroups)?config.assetGroups:[]
 });}
function setActive(config){activeMap=config;return config;}
window.WorldSystem={normalize,setActive,get activeMap(){return activeMap;},realmForLevel};
window.GameEvents.on('mapChanged',({config})=>setActive(config));
})();
