(()=>{'use strict';
const PATCH_VERSION='20260918-world-v5';

function sourceSyntaxOK(src,label){
  try{new Function(src);return true;}
  catch(err){console.error('[WorldPatch] Patch làm hỏng cú pháp:',label,err);return false;}
}
function patchOnce(src,needle,replacement,label){
  const before=src;
  let candidate;
  if(needle instanceof RegExp)candidate=src.replace(needle,replacement);
  else candidate=src.replace(needle,replacement);
  if(candidate===before){
    console.warn('[WorldPatch] Không tìm thấy điểm vá:',label);
    return before;
  }
  if(!sourceSyntaxOK(candidate,label)){
    if(!Array.isArray(window.TuTienWorldPatchErrors))window.TuTienWorldPatchErrors=[];
    window.TuTienWorldPatchErrors.push(label);
    return before;
  }
  console.info('[WorldPatch] OK:',label);
  return candidate;
}

function applyWorldPatch(src){
  window.TuTienWorldPatchErrors=[];
  if(typeof src!=='string'||!src.includes("const DEFAULT_MAP_ID='thanh_van_thon'")){
    console.warn('[WorldPatch] game.js không đúng phiên bản kỳ vọng; bỏ qua.');
    return src;
  }
  if(!sourceSyntaxOK(src,'game.js đầu vào')){
    console.error('[WorldPatch] game.js đầu vào đã lỗi cú pháp; không patch world.');
    return src;
  }

  src=patchOnce(src,"const MAP_DATA_VERSION='20260918-1';","const MAP_DATA_VERSION='20260918-2';",'map data version');

  src=patchOnce(
    src,
    /async function loadMapManifest\(\)\{[\s\S]*?\n\}\n\nfunction normalizeMapConfig/,
`async function loadMapManifest(){
  try{
    const root=await fetchMapJson('maps/manifest.json');
    let allMaps=Array.isArray(root.maps)?root.maps:[];
    if(allMaps.length===0&&Array.isArray(root.catalogs)&&root.catalogs.length){
      const catalogs=await Promise.all(root.catalogs.map(file=>fetchMapJson(file)));
      allMaps=catalogs.flatMap(c=>Array.isArray(c.maps)?c.maps:[]);
    }
    if(allMaps.length===0)throw new Error('Danh mục map trống');
    mapManifest={...root,maps:allMaps};
    regions=allMaps;

    const legacyRegionIds=['thanh_van_thon','linh_son_ngoai_vi','bach_ngoc_thanh','thanh_van_tong','van_dam_sa_mac','yeu_vuc','cam_dia_han_uyen','ma_vuc'];
    const legacyIndex=Number.isInteger(S.region)?clamp(S.region,0,legacyRegionIds.length-1):0;
    const legacyId=legacyRegionIds[legacyIndex]||root.defaultMap||DEFAULT_MAP_ID;
    const requestedId=(typeof S.regionId==='string'&&S.regionId)?S.regionId:legacyId;
    const resolvedId=regions.some(r=>r.id===requestedId)?requestedId:(root.defaultMap||DEFAULT_MAP_ID);
    const resolvedIndex=Math.max(0,regions.findIndex(r=>r.id===resolvedId));
    S.region=resolvedIndex;
    S.regionId=resolvedId;
  }catch(err){
    console.warn('Dùng danh mục map dự phòng:',err);
    mapManifest={schemaVersion:1,defaultMap:DEFAULT_MAP_ID,maps:[DEFAULT_REGION]};
    regions=mapManifest.maps;
    S.region=0;
    S.regionId=DEFAULT_MAP_ID;
  }
}

function normalizeMapConfig`,
    'hierarchical manifest + save migration'
  );

  src=patchOnce(
    src,
    /async function getMapConfig\(id\)\{[\s\S]*?\n\}\n\n\/\/ Bản đồ thế giới mở rộng/,
`async function getMapConfig(id){
  if(MAP_CONFIGS[id])return MAP_CONFIGS[id];
  const meta=regions.find(r=>r.id===id);
  const file=(meta&&meta.file)||('maps/'+id+'.json');
  try{
    const raw=await fetchMapJson(file);
    let cfg=raw;
    if(raw&&raw.extends){
      const base=await fetchMapJson(raw.extends);
      cfg={...base,...raw,...(raw.overrides||{})};
      delete cfg.extends;
      delete cfg.overrides;
    }
    cfg=normalizeMapConfig(cfg,id);
    MAP_CONFIGS[id]=cfg;
    return cfg;
  }catch(err){
    if(id===DEFAULT_MAP_ID)throw err;
    console.warn('Map '+id+' chưa có file riêng, dùng '+DEFAULT_MAP_ID,err);
    const fallback=await getMapConfig(DEFAULT_MAP_ID);
    const cfg={...fallback,id,name:(meta&&meta.name)||id,specialSpawns:[]};
    MAP_CONFIGS[id]=cfg;
    return cfg;
  }
}

// Bản đồ thế giới mở rộng`,
    'template map inheritance'
  );

  src=patchOnce(
    src,
    "function region(){return regions[S.region||0]||regions[0]}",
`function regionIndexById(id){
  if(!id)return -1;
  return regions.findIndex(r=>r.id===id);
}
function region(){
  const byId=regionIndexById(S.regionId);
  if(byId>=0){
    S.region=byId;
    return regions[byId];
  }
  const byIndex=regions[S.region||0]||regions[0]||DEFAULT_REGION;
  if(byIndex)S.regionId=byIndex.id;
  return byIndex;
}
function mapRealmLabel(r){
  const a=realms[clamp(Number(r.minRealm)||0,0,realms.length-1)]||realms[0];
  const b=realms[clamp(Number(r.maxRealm??r.minRealm)||0,0,realms.length-1)]||a;
  return a===b?a:(a+' → '+b);
}
function isMapAccessible(r){
  if(!r)return false;
  if(r.id===S.regionId||r===regions[S.region||0])return true;
  const minRealm=Number(r.minRealm)||0;
  const minLevel=Number(r.min)||1;
  return (S.realm||0)>=minRealm && (S.level||1)>=minLevel;
}
function enemyDisplayName(id){
  return ({boar:'Sơn Trư',archer:'Tiễn Thủ',bandit:'Đạo Tặc',tiger:'Hổ Thần',skeleton:'Khô Cốt',undead:'Bạo Thi',ice_wolf:'Băng Lang',wolf:'Ma Lang',fox:'Linh Hồ',golem:'Thạch Khôi',shadow:'Ảnh Thú'})[id]||id;
}
function renderWorldMapCards(){
  const groups=new Map();
  regions.forEach((r,i)=>{
    const key=r.continentName||'Khu vực khác';
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({r,i});
  });
  let html=\`<div class="card"><b>🌏 Nhân Giới</b><p>11 đại châu/vực · 22 khu vực · \${regions.length} map. Map mở theo cảnh giới và cấp độ nhân vật.</p><div class="stat"><span>Hiện tại</span><b>\${realmName()} · Lv.\${S.level}</b></div></div>\`;
  for(const [continent,items] of groups){
    const first=items[0]&&items[0].r;
    html+=\`<div class="card" style="margin-top:8px"><b>🗺 \${continent}</b><p>\${first&&first.element?'Thuộc tính: '+first.element:''} \${first&&first.faction?'· '+first.faction:''}</p></div><div class="cards">\`;
    for(const {r,i} of items){
      const current=(r.id===S.regionId)||i===S.region;
      const unlocked=isMapAccessible(r);
      const status=current?'Đang ở đây':unlocked?'Dịch chuyển':\`Yêu cầu \${mapRealmLabel(r)} · Lv.\${r.min}\`;
      html+=\`<div class="card">
        <b>\${r.kind} · \${r.name}</b>
        <p>\${r.regionName||''}</p>
        <p><b>\${mapRealmLabel(r)}</b> · Lv.\${r.min}–\${r.max}</p>
        <p>\${r.element?'Hệ '+r.element+' · ':''}\${r.faction||'Trung lập'}</p>
        <p>\${(r.enemy||[]).map(enemyDisplayName).join(', ')}</p>
        <small>\${(r.features||[]).join(' · ')}</small>
        <button data-region="\${i}" \${unlocked?'':'disabled'}>\${status}</button>
      </div>\`;
    }
    html+='</div>';
  }
  return html;
}`,
    'region id + realm gating helpers'
  );

  src=patchOnce(
    src,
    /function isVillageSafe\(x,z\)\{\n\s*return ellipseNorm\(x,z,VILLAGE_SAFE_RX,VILLAGE_SAFE_RZ\)<1;\n\}/,
`function isVillageSafe(x,z){
  const current=regions&&regions.length?(regions[S.region||0]||regions[0]):null;
  if(current&&current.id!==DEFAULT_MAP_ID)return false;
  return ellipseNorm(x,z,VILLAGE_SAFE_RX,VILLAGE_SAFE_RZ)<1;
}`,
    'village safe zone scope'
  );

  src=patchOnce(
    src,
    /function resolveVillageWallMove\(fromX,fromZ,toX,toZ\)\{\n/,
`function resolveVillageWallMove(fromX,fromZ,toX,toZ){
  const current=regions&&regions.length?(regions[S.region||0]||regions[0]):null;
  if(current&&current.id!==DEFAULT_MAP_ID)return {x:toX,z:toZ};
`,
    'village wall collision scope'
  );

  src=patchOnce(
    src,
    /title='Bản Đồ Thế Giới \(8 Đại Khu Vực\)';\n\s*html=`[^\n]*`;/,
`title='Nhân Giới · Đại Thế Giới';
      html=renderWorldMapCards();`,
    'world map UI'
  );

  src=patchOnce(src,"S.region=+b.dataset.region;","S.region=+b.dataset.region; S.regionId=(regions[S.region]||DEFAULT_REGION).id;",'stable region id');

  src=patchOnce(
    src,
    "boss=makeActor('shadow',bx,bz,true);\n  boss.name='Xích Viêm Ma Lang';",
`const bossRegion=region();
  const bossType=bossRegion.bossType||'shadow';
  boss=makeActor(bossType,bx,bz,true);
  boss.name=bossRegion.boss||'Xích Viêm Ma Lang';`,
    'regional boss'
  );

  src=patchOnce(src,"toast('☯ Chào mừng đạo hữu đến Thanh Vân Thôn');","toast('☯ Chào mừng đạo hữu đến '+region().name);",'dynamic welcome');

  if(window.TuTienWorldPatchErrors.length){
    console.warn('[WorldPatch] Đã bỏ qua các patch lỗi:',window.TuTienWorldPatchErrors);
  }
  console.info('[WorldPatch] Đã áp dụng',PATCH_VERSION);
  return src;
}

window.TuTienWorldPatch=applyWorldPatch;
window.TuTienWorldPatchVersion=PATCH_VERSION;
})();