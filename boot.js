(()=>{'use strict';
const BOOT_VERSION='20260918-clean-v14';
const MASTER_URL='./skill-master-data.js?v=3';
const GAME_URL='./game.js?v=35';

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('Không tải được '+src));
    document.body.appendChild(s);
  });
}

async function boot(){
  const msg=document.querySelector('#loadMsg');
  try{
    if(msg)msg.textContent='Đang vào tiên đồ…';
    if(!window.TuTienSkillMaster)await loadScript(MASTER_URL);
    await loadScript(GAME_URL);
    console.info('[Boot] '+BOOT_VERSION+' compatibility mode');
  }catch(err){
    console.error('Boot compatibility error:',err);
    if(msg)msg.textContent='Lỗi tải GAME: '+err.message;
  }
}

boot();
})();
