(()=>{'use strict';
const props=[];
function register(mesh,meta={}){if(!mesh)return mesh;props.push({mesh,meta});return mesh;}
function disposeAll(){for(const row of props){try{if(row.mesh&&!row.mesh.isDisposed())row.mesh.dispose();}catch(e){}}props.length=0;}
function cull(viewer,near=160){if(!viewer)return;const r2=near*near;for(const row of props){const m=row.mesh;if(!m||m.isDisposed())continue;const dx=m.position.x-viewer.x,dz=m.position.z-viewer.z;m.setEnabled(dx*dx+dz*dz<=r2||row.meta.alwaysVisible===true);}}
function count(){return props.length;}
window.MapRenderer={register,disposeAll,cull,count,props};
})();