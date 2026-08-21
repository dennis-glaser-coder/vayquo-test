const fs=require('fs');
const zlib=require('zlib');

function decodeCore(){
 const parts=[];
 for(let i=1;i<=7;i++)parts.push(fs.readFileSync(`assets/data-${String(i).padStart(2,'0')}.txt`,'utf8').trim());
 return zlib.gunzipSync(Buffer.from(parts.join(''),'base64')).toString('utf8');
}
const core=decodeCore();
const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
function snippets(term,radius=260,limit=8){
 const out=[];let from=0;
 while(out.length<limit){const i=core.indexOf(term,from);if(i<0)break;out.push(compact(core.slice(Math.max(0,i-radius),Math.min(core.length,i+term.length+radius))));from=i+term.length;}
 return out;
}
function all(re,limit=100){const out=[];let m;while((m=re.exec(core))&&out.length<limit)out.push(m[1]??m[0]);return [...new Set(out)];}

console.log('=== VAYQUO CORE FLOW AUDIT ===');
console.log('Core bytes:',Buffer.byteLength(core));
console.log('Views:',all(/data-view=["']([^"']+)["']/g));
console.log('localStorage keys:',all(/localStorage\.(?:getItem|setItem|removeItem)\(["']([^"']+)["']/g));
console.log('Named functions sample:',all(/function\s+([A-Za-z0-9_$]+)\s*\(/g,200).join(', '));
console.log('History API:',{pushState:/history\.pushState/.test(core),replaceState:/history\.replaceState/.test(core),popstate:/popstate/.test(core),hashchange:/hashchange/.test(core)});
console.log('Reload hooks:',{beforeunload:/beforeunload/.test(core),pagehide:/pagehide/.test(core)});
for(const term of ['function save','function render','data-view','localStorage','openModal','closeModal','Zurück','Beste Nutzung finden','Punkte & Meilen','Vorteile']){
 console.log(`\n--- ${term} ---`);for(const x of snippets(term))console.log(x);
}
console.log('\n=== END AUDIT ===');
