(()=>{'use strict';
const PROFILES={
  kiem_0_0:{style:'sword',color:'#7ceaff',core:'#ffffff',castSfx:'swordCast',impactSfx:'swordImpact',castRune:'seven_star',castRadius:1.65,projectileSize:1.9,speed:7.2,intervalMs:190,impactRadius:1.15,shake:.055},
  dao_0_0:{style:'fan',color:'#ff5f55',core:'#ffd2a6',castSfx:'bladeCast',impactSfx:'bladeImpact',castRune:'bagua',castRadius:1.75,projectileSize:2.15,speed:11.4,intervalMs:130,spread:.13,impactRadius:1.35,shake:.07},
  hoa_0_0:{style:'arc',color:'#ff5b24',core:'#ffd05a',castSfx:'fireCast',impactSfx:'fireImpact',castRune:'bagua',castRadius:1.7,projectileSize:1.75,speed:9.4,intervalMs:155,arcHeight:.72,impactRadius:1.55,groundMark:true,shake:.085},
  loi_0_0:{style:'skyStrike',color:'#9d7cff',core:'#f4edff',castSfx:'thunderCast',impactSfx:'thunderImpact',castRune:'seven_star',castRadius:1.8,projectileSize:2.25,intervalMs:115,impactDelay:.13,impactRadius:1.3,shake:.09},
  thuy_0_0:{style:'lance',color:'#55cfff',core:'#e5fbff',castSfx:'iceCast',impactSfx:'iceImpact',castRune:'seven_star',castRadius:1.55,projectileSize:1.75,speed:10.2,intervalMs:145,spread:.08,impactRadius:1.25,groundMark:true,shake:.06},
  moc_0_0:{style:'seeking',color:'#65df78',core:'#e2ffc7',castSfx:'natureCast',impactSfx:'natureImpact',castRune:'bagua',castRadius:1.65,projectileSize:1.8,speed:9.2,intervalMs:165,curve:.52,impactRadius:1.35,groundMark:true,shake:.06},
  phong_0_0:{style:'wave',color:'#83f4dc',core:'#edfffb',castSfx:'windCast',impactSfx:'windImpact',castRune:'seven_star',castRadius:1.6,projectileSize:1.8,speed:12.8,intervalMs:105,spread:.18,curve:.68,impactRadius:1.2,shake:.05},
  tho_0_0:{style:'groundStrike',color:'#d29a4c',core:'#ffe2a1',castSfx:'earthCast',impactSfx:'earthImpact',castRune:'bagua',castRadius:1.9,projectileSize:2.55,intervalMs:150,impactDelay:.18,impactRadius:1.65,groundMark:true,shake:.11},
  kim_0_0:{style:'converge',color:'#ffd75f',core:'#fffbe5',castSfx:'metalCast',impactSfx:'metalImpact',castRune:'seven_star',castRadius:1.6,projectileSize:1.65,speed:13.2,intervalMs:115,spread:.28,impactRadius:1.15,shake:.07}
};
function get(skillOrId){const id=typeof skillOrId==='string'?skillOrId:skillOrId&&skillOrId.id;return PROFILES[id]||null;}
function validate(){const ids=Object.keys(PROFILES),elements=new Set(ids.map(id=>id.split('_')[0]));return{ok:ids.length===9&&elements.size===9,count:ids.length};}
window.HoangHaVfx={PROFILES,get,validate};
})();
