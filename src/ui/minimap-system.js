(()=>{'use strict';
function project(dx,dz,range,cx,cy,rx,ry){return{x:cx+(dx/range)*rx,y:cy-(dz/range)*ry};}
function drawDot(ctx,x,y,color,r=2.2,glow=0){ctx.fillStyle=color;if(glow){ctx.shadowColor=color;ctx.shadowBlur=glow;}ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
function visible(dx,dz,range){return dx*dx+dz*dz<=range*range;}
window.MinimapSystem={project,drawDot,visible};
})();