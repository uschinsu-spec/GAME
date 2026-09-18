(()=>{'use strict';
// Mobile camera framing: zoom the orthographic world view in without scaling HUD/UI.
// Runtime default viewHeight = 38. Portrait mobile uses 32 (~18.75% closer).
const MOBILE=/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent||'')||(navigator.maxTouchPoints||0)>1||Math.min(innerWidth||9999,innerHeight||9999)<820;
if(!MOBILE)return;

const CONFIG={portraitViewHeight:32,landscapeViewHeight:35,minAspect:0.45};
window.GameCameraZoom=Object.freeze({...CONFIG});

function desiredViewHeight(){
  return innerHeight>=innerWidth?CONFIG.portraitViewHeight:CONFIG.landscapeViewHeight;
}

function apply(camera,engine){
  if(!camera||!engine||camera.mode!==BABYLON.Camera.ORTHOGRAPHIC_CAMERA)return;
  const renderW=Math.max(1,engine.getRenderWidth());
  const renderH=Math.max(1,engine.getRenderHeight());
  const aspect=Math.max(CONFIG.minAspect,renderW/renderH);
  const halfH=desiredViewHeight()*0.5;
  if(camera.orthoTop===halfH&&camera.orthoBottom===-halfH&&camera.orthoLeft===-halfH*aspect&&camera.orthoRight===halfH*aspect)return;
  camera.orthoTop=halfH;
  camera.orthoBottom=-halfH;
  camera.orthoLeft=-halfH*aspect;
  camera.orthoRight=halfH*aspect;
}

function attach(){
  if(!window.BABYLON)return false;
  const engine=BABYLON.EngineStore&&BABYLON.EngineStore.LastCreatedEngine;
  const scene=BABYLON.EngineStore&&BABYLON.EngineStore.LastCreatedScene;
  if(!engine||!scene||!scene.activeCamera)return false;
  if(scene.__mobileCameraZoomAttached)return true;
  scene.__mobileCameraZoomAttached=true;
  const update=()=>apply(scene.activeCamera,engine);
  scene.onBeforeRenderObservable.add(update);
  addEventListener('resize',()=>requestAnimationFrame(update),{passive:true});
  addEventListener('orientationchange',()=>setTimeout(update,80),{passive:true});
  update();
  return true;
}

let tries=0;
const timer=setInterval(()=>{
  if(attach()||++tries>240)clearInterval(timer);
},50);
})();
