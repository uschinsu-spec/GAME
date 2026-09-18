(()=>{'use strict';
async function boot(){
  const msg=document.querySelector('#loadMsg');
  try{
    if(msg)msg.textContent='Đang tối ưu tài nguyên khởi động…';
    const res=await fetch('./game.js?v=31',{cache:'no-store'});
    if(!res.ok)throw new Error('Không tải được game.js ('+res.status+')');
    let src=await res.text();

    // Hệ thống đại thế giới được tách riêng để game.js không phình khi số map tăng.
    try{
      const wr=await fetch('./world-runtime.js?v=4',{cache:'no-store'});
      if(wr.ok){
        (0,eval)((await wr.text())+'\n//# sourceURL=world-runtime.js');
        if(typeof window.TuTienWorldPatch==='function')src=window.TuTienWorldPatch(src);
      }else{
        console.warn('Không tải được world-runtime.js:',wr.status);
      }
    }catch(worldErr){
      console.warn('World runtime fallback:',worldErr);
    }

    // MASTER SKILL 144 chiêu: dữ liệu/thông số theo file Excel + runtime status/CC.
    // VFX vẫn chỉ đọc asset path hiện có; người dùng sẽ thay PNG VFX riêng sau.
    try{
      const [masterRes,runtimeRes]=await Promise.all([
        fetch('./skill-master-data.js?v=1',{cache:'no-store'}),
        fetch('./skill-runtime.js?v=1',{cache:'no-store'})
      ]);
      if(!masterRes.ok)throw new Error('Không tải được skill-master-data.js ('+masterRes.status+')');
      if(!runtimeRes.ok)throw new Error('Không tải được skill-runtime.js ('+runtimeRes.status+')');
      (0,eval)((await masterRes.text())+'\n//# sourceURL=skill-master-data.js');
      (0,eval)((await runtimeRes.text())+'\n//# sourceURL=skill-runtime.js');
      if(typeof window.TuTienSkillPatch!=='function')throw new Error('TuTienSkillPatch không tồn tại');
      src=window.TuTienSkillPatch(src);
    }catch(skillErr){
      console.error('Skill runtime error:',skillErr);
      throw skillErr;
    }

    // Không preload toàn bộ quái x 16 frame ngay khi mở trang.
    // makeBillboard()/spriteFrames() sẽ tự nạp đúng loại quái khi cần.
    src=src.replace(/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy textures: lazy-load theo loại quái đang xuất hiện');

    // Chỉ tạo vài pack ban đầu; vòng game sẽ bổ sung dần sau khi người chơi vào.
    src=src.replace('for(let i=0;i<16;i++)spawnPack();','for(let i=0;i<4;i++)spawnPack();');

    (0,eval)(src+'\n//# sourceURL=game.optimized.js');
  }catch(err){
    console.error('Boot error:',err);
    if(msg)msg.textContent='Lỗi tải GAME: '+err.message;
  }
}
boot();
})();
