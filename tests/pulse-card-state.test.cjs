const fs=require('fs');
const zlib=require('zlib');

function decodeCore(){
 const parts=[];
 for(let i=1;i<=7;i++)parts.push(fs.readFileSync(`assets/data-${String(i).padStart(2,'0')}.txt`,'utf8').trim());
 return zlib.gunzipSync(Buffer.from(parts.join(''),'base64')).toString('utf8');
}
const core=decodeCore();
const needles=['state.card','card===','card ===','card:'];
for(const needle of needles){
 let from=0,count=0;
 while((from=core.indexOf(needle,from))!==-1&&count<12){
  const start=Math.max(0,from-220),end=Math.min(core.length,from+420);
  console.log(`CORE_CARD_SNIPPET ${needle} #${count+1}:`,core.slice(start,end).replace(/\s+/g,' '));
  from+=needle.length;count++;
 }
}
console.log('PULSE card-state probe complete');
