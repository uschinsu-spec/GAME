import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=process.cwd();
const fail=message=>{throw new Error(message)};
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){if(!['.git','assets','node_modules'].includes(entry.name))walk(full);}else files.push(path.relative(root,full).replaceAll('\\','/'));}}
walk(root);

const js=files.filter(file=>/\.js$/.test(file)&&!/^legacy\//.test(file)&&!/^game_before_/.test(file));
for(const file of js){const source=fs.readFileSync(file,'utf8');if(/tokens truncated|…\d+ tokens truncated/.test(source))fail(`${file}: có marker truncated`);try{new vm.Script(source,{filename:file});}catch(error){fail(`${file}: ${error.message}`);}}

const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match=>match[1].split('?')[0]).filter(src=>!/^https?:/.test(src));
for(const file of scripts)if(!fs.existsSync(file))fail(`index.html tham chiếu file không tồn tại: ${file}`);
if(new Set(scripts).size!==scripts.length)fail('index.html không được load trùng script');
if(scripts.filter(file=>file==='game.js').length!==1)fail('game.js phải chỉ được load đúng một lần');
if(/boot\.js/.test(html))fail('boot.js legacy không được là entrypoint production');
if(/styles\.css/.test(html))fail('Không được load đồng thời styles.css legacy');

const bootstrap=fs.readFileSync('game.js','utf8');
if(!/build\.json/.test(bootstrap))fail('game.js phải lấy runtime version từ build.json');
if(/GameConstants\.BUILD_VERSION/.test(bootstrap))fail('game.js không được dùng BUILD_VERSION hard-code từ constants');

const refiningSource=fs.readFileSync('refining-system.js','utf8');
if(/\nensureEcosystemModules\(\);/.test(refiningSource))fail('refining-system.js không được tự chèn module crafting vào production');

const progressionSource=fs.readFileSync('systems-progression.js','utf8');
for(const marker of ['PILL_RECIPES','FORGING_RECIPES','PROF_MAT'])if(progressionSource.includes(marker))fail(`systems-progression.js còn crafting legacy: ${marker}`);
if(!/function onKill\(\)\{/.test(progressionSource))fail('systems-progression.js phải giữ onKill compatibility không drop legacy');

const craftingCore=fs.readFileSync('crafting-core.js','utf8');
if(!/consumeInPlace/.test(craftingCore))fail('crafting-core.js phải consume canonical inventory in-place');
if(/Object\.assign\(\{\},inv\|\|\{\}\)/.test(craftingCore))fail('crafting-core.js không được clone inventory khi craft');

const coreOrder=['src/data/constants.js','src/core/event-bus.js','src/core/state.js','src/items/inventory-system.js','src/core/save-service.js','src/core/performance.js','src/core/asset-manager.js','src/core/object-pool.js','src/core/scheduler.js','src/core/lifecycle.js','src/core/telemetry.js','src/combat/realm-system.js','src/combat/damage-system.js','src/world/world-system.js'];
const expectedCore='/* Generated runtime bundle. Source modules remain canonical under src/. */\n'+coreOrder.map(file=>fs.readFileSync(file,'utf8').trimEnd()+'\n;').join('\n')+'\n';
const runtimeCore='src/runtime-core.js';
let regeneratedCore=false;
if(!fs.existsSync(runtimeCore)||fs.readFileSync(runtimeCore,'utf8').trimEnd()!==expectedCore.trimEnd()){
 fs.writeFileSync(runtimeCore,expectedCore,'utf8');
 regeneratedCore=true;
}
try{new vm.Script(fs.readFileSync(runtimeCore,'utf8'),{filename:runtimeCore});}catch(error){fail(`${runtimeCore}: ${error.message}`);}

const master=fs.readFileSync('skill-master-data.js','utf8');
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(master,sandbox,{filename:'skill-master-data.js'});
if(sandbox.window.TuTienSkillMaster?.skillCount!==144)fail('Skill master không đủ 144 skill');

const manifest=JSON.parse(fs.readFileSync('maps/manifest.json','utf8'));
if(!manifest.defaultMap||!Array.isArray(manifest.catalogs)||!manifest.catalogs.length)fail('Map manifest không hợp lệ');
let mapCount=0;
for(const catalog of manifest.catalogs){const data=JSON.parse(fs.readFileSync(catalog,'utf8'));for(const map of data.maps||[]){mapCount++;if(!fs.existsSync(map.file))fail(`Thiếu map: ${map.file}`);}}

const tree=files.filter(file=>file.startsWith('assets/'));
console.log(JSON.stringify({ok:true,jsFiles:js.length,startupScripts:scripts.length,skills:144,maps:mapCount,assetFilesInCheckout:tree.length,runtimeCoreRegenerated:regeneratedCore},null,2));
