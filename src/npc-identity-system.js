(()=>{'use strict';
const NPC_COUNT=100;
const VILLAGE_CENTER={x:-1.0,z:-10.8};
const NEAR_VILLAGE_RADIUS=190;
const RADAR_RANGE=140;
const NAMEPLATE_RANGE=95;
const NPC_MINIMAP_COLOR='#ffd84a';
const SURNAMES=['Lâm','Tần','Tiêu','Diệp','Sở','Cố','Hàn','Lục','Thẩm','Tô','Bạch','Mộ Dung','Âu Dương','Nam Cung','Đường','Triệu','Vương','Lý','Trần','Phương'];
const GIVEN_NAMES=['Thanh Vân','Mặc Trần','Tử Hàn','Vân Khê','Trường Phong','Nhược Thủy','Thiên Minh','Lạc Dao','Cảnh Hành','Nguyệt Bạch','Tử Mặc','Thanh Trúc','Huyền Phong','Tuyết Ninh','Vân Sinh','Tinh Hà','Dạ Lan','Minh Nguyệt','Trường An','Thanh Huyền'];
const PALETTE=['#8fd3ff','#ffd36b','#a7f3d0','#d6b4ff','#ff9ca8','#79e0d0','#f4b183','#b9c7ff','#c6e27a','#f2a6e8','#8cc8a5','#e8c47d'];
const state={scene:null,npcs:new Map(),labels:new Map(),mini:null,observer:null,lastSync:0,lastMini:0};

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function hashIndex(index){let x=(index+1)*2654435761>>>0;x^=x>>>16;x=Math.imul(x,2246822507)>>>0;x^=x>>>13;return x>>>0;}
function parseIndex(value){const m=String(value||'').match(/^ally_(\d+)$/);return m?Number(m[1]):-1;}
function displayName(index){
  const surname=SURNAMES[index%SURNAMES.length];
  const block=Math.floor(index/SURNAMES.length);
  const given=GIVEN_NAMES[(index*7+block*4)%GIVEN_NAMES.length];
  return `${surname} ${given}`;
}
function cultivationAt(x,z){
  const distance=Math.hypot((Number(x)||0)-VILLAGE_CENTER.x,(Number(z)||0)-VILLAGE_CENTER.z);
  const middle=distance>NEAR_VILLAGE_RADIUS;
  return {
    distance,
    stage:middle?'Trung Kỳ':'Sơ Kỳ',
    realm:middle?'Luyện Khí · Trung Kỳ':'Luyện Khí · Sơ Kỳ',
    minor:middle?1:0,
    score:middle?1:0
  };
}
function profileFor(index){
  const h=hashIndex(index);
  return {
    color:PALETTE[index%PALETTE.length],
    overlayAlpha:0.055+((h>>>4)%5)*0.018,
    widthScale:0.94+((h>>>8)%5)*0.03,
    heightScale:0.96+((h>>>12)%5)*0.025
  };
}
function identityFor(index,x,z){
  const cultivation=cultivationAt(x,z);
  return {
    index,
    name:displayName(index),
    cultivation,
    appearance:profileFor(index),
    minimapColor:NPC_MINIMAP_COLOR
  };
}
function decorateNpcObject(npc){
  if(!npc||typeof npc!=='object')return npc;
  const index=parseIndex(npc.id);
  if(index<0||index>=NPC_COUNT)return npc;
  const identity=identityFor(index,npc.homeX??npc.x,npc.homeZ??npc.z);
  const c=identity.cultivation;
  npc.name=identity.name;
  npc.displayName=identity.name;
  npc.realm=c.realm;
  npc.cultivationStage=c.stage;
  npc.level=c.minor===0?1+(hashIndex(index)%3):4+(hashIndex(index)%3);
  npc.realmInfo={major:0,minor:c.minor,grade:0,period:c.minor,score:c.score,gradeName:'Nhất Phẩm',periodName:c.stage,displayName:c.realm};
  npc.identity=identity;
  npc.appearanceId=`npc-look-${String(index+1).padStart(3,'0')}`;
  npc.minimapColor=NPC_MINIMAP_COLOR;
  if(c.minor===1){
    const hpBase=Math.max(1,Number(npc.maxHp)||Number(npc.hp)||1600);
    const mpBase=Math.max(1,Number(npc.maxMp)||Number(npc.mp)||500);
    npc.maxHp=Math.round(hpBase*1.35);npc.hp=npc.maxHp;
    npc.maxMp=Math.round(mpBase*1.25);npc.mp=npc.maxMp;
    npc.atk=Math.round(Math.max(1,Number(npc.atk)||38)*1.28);
  }
  if(npc.mesh){
    npc.mesh.metadata=npc.mesh.metadata||{};
    npc.mesh.metadata.npcIdentity=identity;
    npc.mesh.metadata.npcId=npc.id;
    npc.mesh.metadata.npcRealm=c.realm;
  }
  return npc;
}

// Compatibility bridge for the current runtime, where alliedNpcs is intentionally private
// inside the main IIFE. Only objects with exact ids ally_0..ally_99 are touched.
(function installRegistrationBridge(){
  if(Array.prototype.__tuTienNpcIdentityBridge)return;
  const nativePush=Array.prototype.push;
  Object.defineProperty(Array.prototype,'__tuTienNpcIdentityBridge',{value:true,configurable:false,enumerable:false,writable:false});
  Array.prototype.push=function(...items){
    if(items.length===1){
      const item=items[0];
      if(item&&typeof item==='object'&&typeof item.id==='string'&&/^ally_\d+$/.test(item.id))decorateNpcObject(item);
    }
    return nativePush.apply(this,items);
  };
})();

function getScene(){
  if(!window.BABYLON)return null;
  if(BABYLON.EngineStore&&BABYLON.EngineStore.LastCreatedScene)return BABYLON.EngineStore.LastCreatedScene;
  const engines=(BABYLON.EngineStore&&BABYLON.EngineStore.Instances)||[];
  const engine=engines.length?engines[engines.length-1]:null;
  return engine&&engine.scenes&&engine.scenes.length?engine.scenes[engine.scenes.length-1]:null;
}
function getPlayerPosition(scene){
  const camera=scene&&scene.activeCamera;
  if(camera&&typeof camera.getTarget==='function'){
    const t=camera.getTarget();
    if(t&&Number.isFinite(t.x)&&Number.isFinite(t.z))return {x:t.x,z:t.z};
  }
  if(camera&&camera.position)return {x:Number(camera.position.x)||0,z:Number(camera.position.z)||0};
  return {x:0,z:0};
}
function ensureMeshIdentity(mesh,index){
  mesh.metadata=mesh.metadata||{};
  let identity=mesh.metadata.npcIdentity;
  if(!identity){
    identity=identityFor(index,mesh.position.x,mesh.position.z);
    mesh.metadata.npcIdentity=identity;
    mesh.metadata.npcId=`ally_${index}`;
    mesh.metadata.npcRealm=identity.cultivation.realm;
  }
  if(!mesh.metadata.npcAppearanceApplied){
    const a=identity.appearance;
    const sx=Math.abs(mesh.scaling.x)||1;
    mesh.scaling.x=(mesh.scaling.x<0?-1:1)*sx*a.widthScale;
    mesh.scaling.y=(mesh.scaling.y||1)*a.heightScale;
    mesh.renderOverlay=true;
    mesh.overlayColor=BABYLON.Color3.FromHexString(a.color);
    mesh.overlayAlpha=a.overlayAlpha;
    mesh.metadata.npcAppearanceApplied=true;
  }
  state.npcs.set(index,mesh);
  return identity;
}
function drawNameplateTexture(texture,identity){
  const ctx=texture.getContext();
  const w=512,h=128;
  ctx.clearRect(0,0,w,h);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.shadowColor='rgba(0,0,0,.95)';ctx.shadowBlur=9;
  ctx.font='700 34px Arial, sans-serif';ctx.fillStyle='#ffe59b';
  ctx.fillText(identity.name,w/2,38);
  ctx.font='600 24px Arial, sans-serif';
  ctx.fillStyle=identity.cultivation.minor===0?'#aee9ff':'#d7bdff';
  ctx.fillText(identity.cultivation.realm,w/2,84);
  texture.hasAlpha=true;texture.update(false);
}
function createNameplate(scene,index,mesh,identity){
  const texture=new BABYLON.DynamicTexture(`npc_name_tex_${index}`,{width:512,height:128},scene,false);
  drawNameplateTexture(texture,identity);
  const material=new BABYLON.StandardMaterial(`npc_name_mat_${index}`,scene);
  material.diffuseTexture=texture;material.emissiveTexture=texture;material.opacityTexture=texture;
  material.useAlphaFromDiffuseTexture=true;material.disableLighting=true;material.backFaceCulling=false;
  material.specularColor=BABYLON.Color3.Black();material.emissiveColor=BABYLON.Color3.White();
  material.transparencyMode=BABYLON.Material.MATERIAL_ALPHABLEND;
  const plane=BABYLON.MeshBuilder.CreatePlane(`npc_nameplate_${index}`,{width:5.8,height:1.45},scene);
  plane.billboardMode=BABYLON.Mesh.BILLBOARDMODE_ALL;plane.material=material;plane.isPickable=false;plane.renderingGroupId=3;
  plane.metadata={npcLabel:true,index,texture,material};
  state.labels.set(index,plane);
  return plane;
}
function syncNameplates(scene,playerPos){
  for(const [index,mesh] of state.npcs){
    if(!mesh||mesh.isDisposed&&mesh.isDisposed())continue;
    const identity=ensureMeshIdentity(mesh,index);
    const dx=mesh.position.x-playerPos.x,dz=mesh.position.z-playerPos.z;
    const d2=dx*dx+dz*dz;
    let label=state.labels.get(index);
    const shouldShow=mesh.isEnabled()&&d2<=NAMEPLATE_RANGE*NAMEPLATE_RANGE;
    if(shouldShow&&!label)label=createNameplate(scene,index,mesh,identity);
    if(!label)continue;
    label.setEnabled(shouldShow);
    if(shouldShow){
      const spriteSize=clamp((Number(mesh.position.y)||1.54)/0.48,2.8,4.2);
      label.position.set(mesh.position.x,mesh.position.y+spriteSize*0.66,mesh.position.z);
    }
  }
}
function ensureMiniOverlay(){
  const base=document.getElementById('mini');
  if(!base)return null;
  if(state.mini&&state.mini.isConnected)return state.mini;
  const parent=base.parentElement;if(!parent)return null;
  const overlay=document.createElement('canvas');
  overlay.id='npcMiniOverlay';overlay.width=base.width;overlay.height=base.height;
  overlay.setAttribute('aria-hidden','true');
  if(getComputedStyle(parent).position==='static')parent.style.position='relative';
  overlay.style.position='absolute';overlay.style.left=`${base.offsetLeft}px`;overlay.style.top=`${base.offsetTop}px`;
  overlay.style.width=`${base.clientWidth||base.width}px`;overlay.style.height=`${base.clientHeight||base.height}px`;
  overlay.style.pointerEvents='none';overlay.style.zIndex='2';
  parent.appendChild(overlay);state.mini=overlay;return overlay;
}
function drawNpcMini(scene,playerPos){
  const overlay=ensureMiniOverlay();if(!overlay)return;
  const ctx=overlay.getContext('2d');ctx.clearRect(0,0,overlay.width,overlay.height);
  const cx=overlay.width/2,cy=overlay.height/2,rx=overlay.width*.44,ry=overlay.height*.44;
  for(const [index,mesh] of state.npcs){
    if(!mesh||mesh.isDisposed&&mesh.isDisposed())continue;
    const dx=mesh.position.x-playerPos.x,dz=mesh.position.z-playerPos.z;
    const d=Math.hypot(dx,dz);if(d>RADAR_RANGE)continue;
    const px=cx+(dx/RADAR_RANGE)*rx,py=cy-(dz/RADAR_RANGE)*ry;
    ctx.fillStyle=NPC_MINIMAP_COLOR;ctx.shadowColor=NPC_MINIMAP_COLOR;ctx.shadowBlur=4;
    ctx.beginPath();ctx.arc(px,py,2.35,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }
}
function discover(scene){
  for(const mesh of scene.meshes||[]){
    if(!mesh||typeof mesh.name!=='string')continue;
    const m=mesh.name.match(/^ally_npc1_(\d+)$/);if(!m)continue;
    const index=Number(m[1]);if(index<0||index>=NPC_COUNT)continue;
    ensureMeshIdentity(mesh,index);
  }
}
function sync(){
  const scene=state.scene;if(!scene||scene.isDisposed&&scene.isDisposed())return;
  const now=performance.now();if(now-state.lastSync<45)return;state.lastSync=now;
  discover(scene);
  const playerPos=getPlayerPosition(scene);
  syncNameplates(scene,playerPos);
  if(now-state.lastMini>=90){state.lastMini=now;drawNpcMini(scene,playerPos);}
}
function attach(scene){
  if(!scene||state.scene===scene)return;
  if(state.observer&&state.scene&&state.scene.onBeforeRenderObservable){try{state.scene.onBeforeRenderObservable.remove(state.observer);}catch(e){}}
  state.scene=scene;state.npcs.clear();state.lastSync=0;state.lastMini=0;
  state.observer=scene.onBeforeRenderObservable.add(sync);
  discover(scene);sync();
  console.info('[NPC Identity] 100 hồ sơ NPC Trung Hoa + tu vi theo khoảng cách + minimap vàng đã kích hoạt.');
}
function waitForScene(){
  const scene=getScene();if(scene){attach(scene);return;}
  setTimeout(waitForScene,120);
}

window.NpcIdentitySystem={
  count:NPC_COUNT,
  villageCenter:{...VILLAGE_CENTER},
  nearVillageRadius:NEAR_VILLAGE_RADIUS,
  minimapColor:NPC_MINIMAP_COLOR,
  getIdentity:(index,x=0,z=0)=>identityFor(clamp(Number(index)||0,0,NPC_COUNT-1),x,z),
  decorateNpc:decorateNpcObject,
  refresh:()=>{const scene=getScene();if(scene){attach(scene);discover(scene);sync();}}
};
waitForScene();
})();
