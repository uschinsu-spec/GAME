(()=>{'use strict';
const p=window.PerformanceProfile;
if(!p||!p.PROFILES)return;
const scales={LOW:1.5,MEDIUM:2.25,HIGH:3};
for(const [name,scale] of Object.entries(scales)){
  if(p.PROFILES[name])p.PROFILES[name].renderScale=scale;
}
if(typeof p.set==='function')p.set(p.name);
})();
