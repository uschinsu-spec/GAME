import fs from 'node:fs';
import assert from 'node:assert/strict';

const legacy=fs.readFileSync('src/runtime/legacy-runtime.js','utf8');
const npcIdentity=fs.readFileSync('src/npc-identity-system.js','utf8');
const index=fs.readFileSync('index.html','utf8');

const count=(text,re)=>[...text.matchAll(re)].length;
assert.equal(count(legacy,/function\s+launchAoeProjectile\s*\(/g),1,'launchAoeProjectile không được khai báo trùng');
assert.equal(/Array\.prototype\.push\s*=/.test(npcIdentity),false,'không được monkey-patch Array.prototype.push');
assert.equal(/style\.css\?v=20260918-v72/.test(index),false,'index không được ghim cache CSS v72 cũ');
assert.equal(/game\.js\?v=20260918-v70/.test(index),false,'index không được ghim bootstrap v70 cũ');
console.log('runtime-cleanup.test: OK');
