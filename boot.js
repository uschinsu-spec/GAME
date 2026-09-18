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
      const wr=await fetch('./world-runtime.js?v=1',{cache:'no-store'});
      if(wr.ok){
        (0,eval)((await wr.text())+'\n//# sourceURL=world-runtime.js');
        if(typeof window.TuTienWorldPatch==='function')src=window.TuTienWorldPatch(src);
      }else{
        console.warn('Không tải được world-runtime.js:',wr.status);
      }
    }catch(worldErr){
      console.warn('World runtime fallback:',worldErr);
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
