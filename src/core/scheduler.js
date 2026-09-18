(()=>{'use strict';
let nextId=1;const tasks=[];
function schedule(delaySeconds,callback,tag='default'){const task={id:nextId++,at:performance.now()+Math.max(0,delaySeconds)*1000,callback,tag,cancelled:false};tasks.push(task);return task.id;}
function cancel(id){const task=tasks.find(x=>x.id===id);if(task)task.cancelled=true;}
function cancelTag(tag){for(const task of tasks)if(task.tag===tag)task.cancelled=true;}
function update(now=performance.now()){for(let i=tasks.length-1;i>=0;i--){const task=tasks[i];if(task.cancelled){tasks.splice(i,1);continue;}if(task.at<=now){tasks.splice(i,1);try{task.callback();}catch(error){console.error('[Scheduler]',error);}}}}
window.GameScheduler={schedule,cancel,cancelTag,update,count:()=>tasks.length};
})();
