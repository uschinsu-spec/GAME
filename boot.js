(()=>{'use strict';
async function boot(){
  const msg=document.querySelector('#loadMsg');
  try{
    if(msg)msg.textContent='Đang tối ưu tài nguyên khởi động…';
    const res=await fetch('./game.js?v=27',{cache:'no-store'});
    if(!res.ok)throw new Error('Không tải được game.js ('+res.status+')');
    let src=await res.text();

    // Không preload toàn bộ 7 loại quái x 16 frame ngay khi mở trang.
    // makeBillboard()/spriteFrames() sẽ tự nạp đúng loại quái khi cần.
    src=src.replace(/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy textures: lazy-load theo loại quái đang xuất hiện');

    // Chỉ tạo vài pack ban đầu; vòng game sẽ bổ sung dần sau khi người chơi vào.
    src=src.replace('for(let i=0;i<16;i++)spawnPack();','for(let i=0;i<4;i++)spawnPack();');

    // Trên điện thoại giảm mật độ decor khởi tạo để tránh tràn RAM/GPU lúc mở game.
    const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if(mobile){
      src=src.replace('treeCount:160','treeCount:90');
      src=src.replace('rockCount:90','rockCount:50');
      src=src.replace('grassCount:140','grassCount:80');
    }

    // Chạy nguyên game.js sau khi áp dụng patch khởi động; logic/save game không đổi.
    (0,eval)(src+'\n//# sourceURL=game.optimized.js');
  }catch(err){
    console.error('Boot error:',err);
    if(msg)msg.textContent='Lỗi tải GAME: '+err.message;
  }
}
boot();
})();
