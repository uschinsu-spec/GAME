(()=>{'use strict';
// Mobile camera zoom controller.
// One button cycles progressively closer. After the closest level, the next tap wraps to extreme far.
const MOBILE=/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent||'')||(navigator.maxTouchPoints||0)>1||Math.min(innerWidth||9999,innerHeight||9999)<820;
if(!MOBILE)return;

const STORAGE_KEY='tutien_camera_zoom_mode_v2';
const MIN_ASPECT=0.45;
const MODES=[
  {id:'extreme-far', label:'CỰC XA', portrait:54, landscape:58},
  {id:'far',         label:'XA',     portrait:46, landscape:50},
  {id:'wide',        label:'RỘNG',   portrait:40, landscape:44},
  {id:'normal',      label:'VỪA',    portrait:35, landscape:39},
  {id:'close',       label:'GẦN',    portrait:32, landscape:35},
  {id:'very-close',  label:'RẤT GẦN',portrait:28, landscape:31},
  {id:'max-close',   label:'CỰC GẦN',portrait:25, landscape:28}
];

// Keep the current game framing as the default on first load.
let modeIndex=4;
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

function currentMode(){return MODES[modeIndex]||MODES[4];}
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
  button.setAttribute('aria-label','Zoom camera: '+mode.label+'. Nhấn để zoom gần hơn');
  button.title='Camera '+mode.label+' — nhấn để zoom gần hơn';
  if(levelText)levelText.textContent=(modeIndex+1)+'/'+MODES.length;
}

function showToast(){
  if(!toast)return;
  const mode=currentMode();
  toast.textContent='CAMERA · '+mode.label;
  toast.style.opacity='1';
  toast.style.transform='translateY(0)';
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{
    toast.style.opacity='0';
    toast.style.transform='translateY(6px)';
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
  // Sequence is extreme far -> far -> ... -> extreme close -> extreme far.
  // Therefore every tap zooms closer until max, then the next tap jumps back to extreme far.
  setMode(modeIndex+1,true);
}

function makeUI(){
  if(button)return;
  const hud=document.querySelector('#hud')||document.body;

  button=document.createElement('button');
  button.id='cameraZoomBtn';
  button.type='button';
  button.innerHTML='<span aria-hidden="true" style="font-size:22px;line-height:1">🔍</span><b style="font-size:15px;line-height:1;margin-left:-4px;margin-top:-10px">+</b><small id="cameraZoomLevel" style="position:absolute;right:3px;bottom:2px;min-width:22px;padding:1px 4px;border-radius:9px;background:rgba(0,0,0,.64);font:700 9px/14px system-ui;color:#ffe59a">5/7</small>';
  Object.assign(button.style,{
    position:'absolute',
    right:'max(10px, env(safe-area-inset-right))',
    top:'52%',
    transform:'translateY(-50%)',
    width:'52px',
    height:'52px',
    borderRadius:'50%',
    border:'1.5px solid rgba(255,224,132,.9)',
    background:'radial-gradient(circle at 38% 30%,rgba(39,78,88,.96),rgba(8,25,31,.96) 68%)',
    boxShadow:'0 3px 14px rgba(0,0,0,.42), inset 0 0 12px rgba(102,220,224,.16)',
    color:'#fff7d0',
    zIndex:'92',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    gap:'0',
    padding:'0',
    margin:'0',
    touchAction:'manipulation',
    WebkitTapHighlightColor:'transparent',
    userSelect:'none',
    cursor:'pointer'
  });
  button.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    nextMode();
  });
  button.addEventListener('pointerdown',e=>e.stopPropagation());
  hud.appendChild(button);
  levelText=button.querySelector('#cameraZoomLevel');

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
