(()=>{'use strict';
// Mobile camera zoom controller.
// One button cycles progressively closer. After the closest level, the next tap wraps to extreme far.
const MOBILE=/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent||'')||(navigator.maxTouchPoints||0)>1||Math.min(innerWidth||9999,innerHeight||9999)<820;
if(!MOBILE)return;

const STORAGE_KEY='tutien_camera_zoom_mode_v3';
const MIN_ASPECT=0.45;
const MODES=[
  {id:'extreme-far', label:'CỰC XA',   portrait:54, landscape:58},
  {id:'ultra-close', label:'SIÊU GẦN', portrait:22, landscape:25}
];

// Default to extreme-far overview on first load
let modeIndex=0;
try{
  const saved=Number(localStorage.getItem(STORAGE_KEY));
  if(Number.isInteger(saved)&&saved>=0&&saved<MODES.length)modeIndex=saved;
}catch(e){}

let attachedScene=null;
let updateCamera=null;
let button=null;
let levelText=null;
let toast=null;
let toastTimer=0;

function currentMode(){return MODES[modeIndex]||MODES[0];}
function desiredViewHeight(){
  const mode=currentMode();
  return innerHeight>=innerWidth?mode.portrait:mode.landscape;
}

function apply(camera,engine){
  if(!camera||!engine||!window.BABYLON||camera.mode!==BABYLON.Camera.ORTHOGRAPHIC_CAMERA)return;
  const renderW=Math.max(1,engine.getRenderWidth());
  const renderH=Math.max(1,engine.getRenderHeight());
  const aspect=Math.max(MIN_ASPECT,renderW/renderH);
  const halfH=desiredViewHeight()*0.5;
  camera.orthoTop=halfH;
  camera.orthoBottom=-halfH;
  camera.orthoLeft=-halfH*aspect;
  camera.orthoRight=halfH*aspect;
}

function updateButton(){
  if(!button)return;
  const mode=currentMode();
  button.setAttribute('aria-label','Zoom camera: '+mode.label+'. Nhấn để chuyển góc nhìn');
  button.title='Camera '+mode.label+' — nhấn để đổi góc nhìn (CỰC XA / SIÊU GẦN)';
  if(levelText)levelText.textContent=(modeIndex+1)+'/'+MODES.length;
}

function showToast(){
  if(!toast)return;
  const mode=currentMode();
  toast.textContent='CAMERA · '+mode.label;
  toast.style.opacity='1';
  toast.style.transform='translate(-50%,0)';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{
    toast.style.opacity='0';
    toast.style.transform='translate(-50%,6px)';
  },850);
}

function setMode(index,announce=true){
  modeIndex=((index%MODES.length)+MODES.length)%MODES.length;
  try{localStorage.setItem(STORAGE_KEY,String(modeIndex));}catch(e){}
  updateButton();
  if(updateCamera)updateCamera();
  if(announce)showToast();
  try{window.dispatchEvent(new CustomEvent('game-camera-zoom-changed',{detail:{index:modeIndex,mode:currentMode()}}));}catch(e){}
}

function nextMode(){
  // Toggle between extreme far and super close
  setMode(modeIndex+1,true);
}

function makeUI(){
  if(button)return;
  const hud=document.querySelector('#hud')||document.body;
  const existing=document.getElementById('cameraZoomBtn');

  if(existing){
    button=existing;
    levelText=button.querySelector('#cameraZoomLevel');
    button.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      nextMode();
    });
    button.addEventListener('pointerdown',e=>e.stopPropagation());
  } else {
    button=document.createElement('button');
    button.id='cameraZoomBtn';
    button.type='button';
    button.innerHTML='<span aria-hidden="true" style="font-size:22px;line-height:1">🔍</span><b style="font-size:15px;line-height:1;margin-left:-4px;margin-top:-10px">±</b><small id="cameraZoomLevel" style="position:absolute;right:3px;bottom:2px;min-width:26px;padding:1px 4px;border-radius:9px;background:rgba(0,0,0,.64);font:700 9px/14px system-ui;color:#ffe59a">1/2</small>';
    button.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      nextMode();
    });
    button.addEventListener('pointerdown',e=>e.stopPropagation());
    hud.appendChild(button);
    levelText=button.querySelector('#cameraZoomLevel');
  }

  toast=document.createElement('div');
  toast.id='cameraZoomToast';
  Object.assign(toast.style,{
    position:'absolute',
    left:'50%',
    top:'46%',
    transform:'translate(-50%,6px)',
    padding:'7px 12px',
    borderRadius:'16px',
    background:'rgba(4,16,21,.84)',
    border:'1px solid rgba(255,222,128,.62)',
    color:'#fff1bd',
    font:'700 11px/1.1 system-ui',
    letterSpacing:'.6px',
    zIndex:'120',
    pointerEvents:'none',
    opacity:'0',
    transition:'opacity .16s ease, transform .16s ease',
    whiteSpace:'nowrap'
  });
  hud.appendChild(toast);
  updateButton();
}

function attach(){
  if(!window.BABYLON)return false;
  const engine=BABYLON.EngineStore&&BABYLON.EngineStore.LastCreatedEngine;
  const scene=BABYLON.EngineStore&&BABYLON.EngineStore.LastCreatedScene;
  if(!engine||!scene||!scene.activeCamera)return false;

  makeUI();
  if(attachedScene===scene){if(updateCamera)updateCamera();return true;}
  attachedScene=scene;
  updateCamera=()=>apply(scene.activeCamera,engine);
  scene.onBeforeRenderObservable.add(updateCamera);
  addEventListener('resize',()=>requestAnimationFrame(updateCamera),{passive:true});
  addEventListener('orientationchange',()=>setTimeout(updateCamera,80),{passive:true});
  updateCamera();
  return true;
}

window.GameCameraZoom={
  modes:MODES.map(m=>({...m})),
  get index(){return modeIndex;},
  get mode(){return {...currentMode()};},
  next:nextMode,
  set:index=>setMode(Number(index)||0,true)
};

let tries=0;
const timer=setInterval(()=>{
  if(attach()||++tries>240)clearInterval(timer);
},50);
})();
