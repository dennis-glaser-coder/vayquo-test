(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let scheduled=false;

function fieldWrap(id){const el=q('#'+id);return el?.closest('.field')||el?.parentElement||null;}
function toInt(value,min=0,max=9){const n=Math.trunc(Number(value));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}

function summary(){
 const adults=toInt(q('#fAdults')?.value,1,9);
 const children=toInt(q('#fChildren')?.value,0,9);
 const infants=toInt(q('#fInfants')?.value,0,9);
 const total=adults+children+infants;
 const parts=[];
 if(adults)parts.push(`${adults} Erw.`);
 if(children)parts.push(`${children} Kind${children===1?'':'er'}`);
 if(infants)parts.push(`${infants} Baby${infants===1?'':'s'}`);
 const label=q('#vayquo-traveller-summary');
 if(label)label.textContent=parts.join(' · ')||`${total} Reisende`;
}

function setCount(id,value){
 const input=q('#'+id);if(!input)return;
 const min=id==='fAdults'?1:0;
 const otherIds=['fAdults','fChildren','fInfants'].filter(x=>x!==id);
 const other=otherIds.reduce((sum,x)=>sum+toInt(q('#'+x)?.value,x==='fAdults'?1:0,9),0);
 input.value=String(Math.max(min,Math.min(9-other,toInt(value,min,9))));
 input.dispatchEvent(new Event('change',{bubbles:true}));
 summary();
}

function syncReturn(){
 const trip=q('#fTripType');
 const wrap=q('#vayquo-return-date-wrap');
 const ret=q('#fReturnDate');
 const depart=q('#fDate,#fDepartureDate,#flightDate')||Array.from(document.querySelectorAll('input[type="date"]')).find(el=>el.id!=='fReturnDate');
 if(!trip||!wrap||!ret)return;
 const round=trip.value==='roundtrip';
 wrap.hidden=!round;
 ret.required=round;
 const departure=String(depart?.value||'');
 if(departure){
  ret.min=departure;
  if(ret.value&&ret.value<departure)ret.value='';
 }
 if(!round&&ret.value)ret.value='';
}

function ensureStyle(){
 if(q('#vayquo-flight-search-controls-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-search-controls-style';
 style.textContent=`
 #vayquo-flight-search-controls{grid-column:1/-1;margin:2px 0 4px}
 .vayquo-search-extra-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
 .vayquo-extra-field{min-width:0}
 .vayquo-extra-label{display:block;margin:0 0 8px;font-size:13px;font-weight:720;color:inherit}
 .vayquo-extra-control{width:100%;min-height:56px;box-sizing:border-box;border:1px solid rgba(120,126,124,.18);background:rgba(255,255,255,.52);border-radius:16px;padding:0 14px;color:inherit;font:inherit;font-size:15px}
 select.vayquo-extra-control{appearance:auto}
 details.vayquo-travellers{position:relative}
 details.vayquo-travellers>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer}
 details.vayquo-travellers>summary::-webkit-details-marker{display:none}
 .vayquo-traveller-panel{margin-top:8px;border:1px solid rgba(120,126,124,.18);background:rgba(255,255,255,.9);border-radius:16px;padding:4px 14px}
 .vayquo-traveller-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid rgba(120,126,124,.12)}
 .vayquo-traveller-row:last-child{border-bottom:0}
 .vayquo-traveller-name{font-size:14px;font-weight:700}.vayquo-traveller-age{margin-top:2px;font-size:11px;color:var(--muted,#879391)}
 .vayquo-stepper{display:flex;align-items:center;gap:8px}.vayquo-stepper button{width:32px;height:32px;border-radius:50%;border:1px solid rgba(120,126,124,.25);background:transparent;color:inherit;font:inherit;font-size:20px;line-height:1}.vayquo-stepper output{min-width:18px;text-align:center;font-size:14px;font-weight:700}
 #vayquo-return-date-wrap{margin-top:12px}
 @media(max-width:420px){.vayquo-search-extra-grid{grid-template-columns:1fr 1fr;gap:10px}.vayquo-extra-control{padding:0 11px;font-size:14px}}
 `;
 document.head.appendChild(style);
}

function create(){
 if(q('#vayquo-flight-search-controls')||!q('#fFrom')||!q('#fTo')||!q('#fCabin'))return;
 const program=fieldWrap('fProgram');
 const anchor=program||fieldWrap('fCash');
 if(!anchor?.parentElement)return;
 ensureStyle();
 const wrap=document.createElement('div');
 wrap.id='vayquo-flight-search-controls';
 wrap.innerHTML=`
  <div class="vayquo-search-extra-grid">
   <div class="vayquo-extra-field">
    <label class="vayquo-extra-label" for="fTripType">Reise</label>
    <select id="fTripType" class="vayquo-extra-control" aria-label="Reiseart">
     <option value="oneway">Hinflug</option>
     <option value="roundtrip">Hin & zurück</option>
    </select>
   </div>
   <div class="vayquo-extra-field">
    <span class="vayquo-extra-label">Reisende</span>
    <details class="vayquo-travellers" id="vayquo-travellers">
     <summary class="vayquo-extra-control"><span id="vayquo-traveller-summary">1 Erw.</span><span aria-hidden="true">⌄</span></summary>
     <div class="vayquo-traveller-panel">
      <div class="vayquo-traveller-row"><div><div class="vayquo-traveller-name">Erwachsene</div><div class="vayquo-traveller-age">12+</div></div><div class="vayquo-stepper"><button type="button" data-count="fAdults" data-delta="-1" aria-label="Erwachsene verringern">−</button><output data-output="fAdults">1</output><button type="button" data-count="fAdults" data-delta="1" aria-label="Erwachsene erhöhen">+</button></div></div>
      <div class="vayquo-traveller-row"><div><div class="vayquo-traveller-name">Kinder</div><div class="vayquo-traveller-age">2–11</div></div><div class="vayquo-stepper"><button type="button" data-count="fChildren" data-delta="-1" aria-label="Kinder verringern">−</button><output data-output="fChildren">0</output><button type="button" data-count="fChildren" data-delta="1" aria-label="Kinder erhöhen">+</button></div></div>
      <div class="vayquo-traveller-row"><div><div class="vayquo-traveller-name">Babys</div><div class="vayquo-traveller-age">unter 2</div></div><div class="vayquo-stepper"><button type="button" data-count="fInfants" data-delta="-1" aria-label="Babys verringern">−</button><output data-output="fInfants">0</output><button type="button" data-count="fInfants" data-delta="1" aria-label="Babys erhöhen">+</button></div></div>
     </div>
    </details>
   </div>
  </div>
  <div id="vayquo-return-date-wrap" class="vayquo-extra-field" hidden>
   <label class="vayquo-extra-label" for="fReturnDate">Rückflug</label>
   <input id="fReturnDate" class="vayquo-extra-control" type="date" aria-label="Rückflugdatum">
  </div>
  <input id="fAdults" type="hidden" value="1"><input id="fChildren" type="hidden" value="0"><input id="fInfants" type="hidden" value="0">
 `;
 anchor.parentElement.insertBefore(wrap,anchor);
 q('#fTripType')?.addEventListener('change',()=>{syncReturn();q('#fReturnDate')?.dispatchEvent(new Event('change',{bubbles:true}));});
 wrap.addEventListener('click',ev=>{
  const btn=ev.target.closest?.('button[data-count]');if(!btn)return;
  ev.preventDefault();ev.stopPropagation();
  const id=btn.dataset.count;const delta=Number(btn.dataset.delta)||0;
  setCount(id,toInt(q('#'+id)?.value,id==='fAdults'?1:0,9)+delta);
  const out=q(`[data-output="${id}"]`);if(out)out.textContent=q('#'+id)?.value||'0';
 });
 document.addEventListener('change',ev=>{if(ev.target?.matches?.('#fDate,#fDepartureDate,#flightDate'))syncReturn();});
 summary();syncReturn();
}

function patchOutputs(){
 ['fAdults','fChildren','fInfants'].forEach(id=>{const out=q(`[data-output="${id}"]`);if(out)out.textContent=q('#'+id)?.value||'0';});
 summary();syncReturn();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{create();patchOutputs();}catch(e){console.warn('VAYQUO flight controls',e);}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
