(()=>{'use strict';
const BUILD=window.GameConstants&&window.GameConstants.BUILD_VERSION||'dev';
const script=document.createElement('script');
script.src=`src/game-runtime.js?v=${encodeURIComponent(BUILD)}`;
script.async=false;
script.onerror=()=>{
 const message=document.querySelector('#loadMsg');
 if(message)message.textContent='Lỗi tải GAME runtime';
 console.error('[Bootstrap] Không tải được src/game-runtime.js');
};
document.body.appendChild(script);
})();
