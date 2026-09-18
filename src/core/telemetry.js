(()=>{'use strict';
const providers=new Map();let host=null,timer=0;
function register(name,fn){providers.set(name,fn);return()=>providers.delete(name);}
function snapshot(){const out={};for(const [name,fn] of providers){try{out[name]=fn();}catch(error){out[name]={error:error.message};}}return out;}
function startPanel(){if(!new URLSearchParams(location.search).has('debug'))return;if(host)return;host=document.createElement('pre');host.id='performanceDebug';Object.assign(host.style,{position:'fixed',left:'6px',bottom:'6px',zIndex:9999,margin:0,padding:'7px',maxWidth:'48vw',maxHeight:'42svh',overflow:'auto',font:'10px/1.35 monospace',color:'#bfffd4',background:'rgba(0,0,0,.76)',border:'1px solid #4b8',borderRadius:'6px',pointerEvents:'none'});document.body.appendChild(host);timer=setInterval(()=>{host.textContent=JSON.stringify(snapshot(),null,2);},500);}
window.RuntimeTelemetry={register,snapshot,startPanel,stopPanel(){clearInterval(timer);timer=0;if(host)host.remove();host=null;}};
document.addEventListener('DOMContentLoaded',startPanel,{once:true});
})();
