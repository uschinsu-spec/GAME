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
    // QUAN TRỌNG: nếu patch skill sinh mã JS lỗi, tự động quay về source trước patch để GAME vẫn mở được.
    try{
      const [masterRes,runtimeRes]=await Promise.all([
        fetch('./skill-master-data.js?v=2',{cache:'no-store'}),
        fetch('./skill-runtime.js?v=2',{cache:'no-store'})
      ]);
      if(!masterRes.ok)throw new Error('Không tải được skill-master-data.js ('+masterRes.status+')');
      if(!runtimeRes.ok)throw new Error('Không tải được skill-runtime.js ('+runtimeRes.status+')');
      (0,eval)((await masterRes.text())+'\n//# sourceURL=skill-master-data.js');
      (0,eval)((await runtimeRes.text())+'\n//# sourceURL=skill-runtime.js');
      if(typeof window.TuTienSkillPatch!=='function')throw new Error('TuTienSkillPatch không tồn tại');

      const beforeSkillPatch=src;
      const patched=window.TuTienSkillPatch(src);
      try{
        // Compile-only validation: bắt SyntaxError trước khi chạy GAME.
        // new Function không thực thi game, chỉ kiểm tra source có parse được hay không.
        new Function(patched);
        src=patched;
        console.info('[Boot] Skill patch hợp lệ.');
      }catch(skillSyntaxErr){
        src=beforeSkillPatch;
        console.error('[Boot] Skill patch tạo source lỗi cú pháp — đã tự fallback về GAME gốc:',skillSyntaxErr);
        if(msg)msg.textContent='Đang khởi động GAME (đã bỏ qua patch skill lỗi)…';
      }
    }catch(skillErr){
      // Skill mở rộng không được phép làm toàn GAME chết.
      console.error('Skill runtime fallback:',skillErr);
      if(msg)msg.textContent='Đang khởi động GAME (skill mở rộng tạm bỏ qua)…';
    }

    // Không preload toàn bộ quái x 16 frame ngay khi mở trang.
    // makeBillboard()/spriteFrames() sẽ tự nạp đúng loại quái khi cần.
    src=src.replace(/\n\s*preloadEnemySprites\(\);[^\n]*/,'\n  // Enemy textures: lazy-load theo loại quái đang xuất hiện');

    // Chỉ tạo vài pack ban đầu; vòng game sẽ bổ sung dần sau khi người chơi vào.
    src=src.replace('for(let i=0;i<16;i++)spawnPack();','for(let i=0;i<4;i++)spawnPack();');

    // Kiểm tra lần cuối trước khi chạy để tránh đứng màn hình loading vì SyntaxError.
    try{new Function(src)}catch(finalSyntaxErr){
      console.error('[Boot] Final source syntax error:',finalSyntaxErr);
      throw new Error('Mã GAME lỗi cú pháp: '+finalSyntaxErr.message);
    }

    (0,eval)(src+'\n//# sourceURL=game.optimized.js');
  }catch(err){
    console.error('Boot error:',err);
    if(msg)msg.textContent='Lỗi tải GAME: '+err.message;
  }
}
boot();
})();
