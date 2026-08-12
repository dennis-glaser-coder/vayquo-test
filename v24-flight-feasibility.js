(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);

function ensureStyle(){
 if(q('#vayquo-flight-feasibility-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-feasibility-style';
 style.textContent=`
 .vqof-heading{margin:13px 0 7px;font-size:11px;font-weight:800;color:#273532;letter-spacing:.01em}
 .vqof-empty{margin-top:9px;padding:11px 12px;border-radius:14px;background:rgba(120,126,124,.07);font-size:11px;line-height:1.45;color:var(--muted,#74817f)}
 .vqof-more{margin-top:10px;border-top:1px solid rgba(120,126,124,.12);padding-top:8px}
 .vqof-more>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;padding:7px 2px;font-size:11px;font-weight:800;color:#596865}
 .vqof-more>summary::-webkit-details-marker{display:none}
 .vqof-more>summary::after{content:'⌄';font-size:16px;line-height:1;color:#82908d;transition:transform .18s ease}
 .vqof-more[open]>summary::after{transform:rotate(180deg)}
 .vqof-more-body{display:grid;gap:8px;padding-top:5px}
 `;
 document.head.appendChild(style);
}

function feasibility(item){
 const text=String(item?.status?.text||'');
 if(text==='Mit deinem Stand möglich'||text.startsWith('Punkte reichen'))return 'usable';
 if(text.startsWith('Noch '))return 'insufficient';
 return 'other';
}

function summaryText(entries){
 const insufficient=entries.filter(x=>x.kind==='insufficient').length;
 if(insufficient===entries.length){
  return `${entries.length} ${entries.length===1?'Option benötigt':'Optionen benötigen'} mehr Punkte`;
 }
 return `Weitere Möglichkeiten · ${entries.length}`;
}

function apply(detail){
 const evaluated=Array.isArray(detail?.evaluated)?detail.evaluated:[];
 const list=q('#vayquo-flight-optimizer .vqo-list');
 if(!list||!evaluated.length)return;
 const cards=Array.from(list.children).filter(el=>el.classList.contains('vqo-option'));
 if(cards.length!==evaluated.length)return;
 ensureStyle();

 const rows=evaluated.map((item,index)=>({item,card:cards[index],kind:feasibility(item)}));
 const usable=rows.filter(x=>x.kind==='usable');
 const deferred=rows.filter(x=>x.kind!=='usable');

 list.replaceChildren();
 if(usable.length){
  const heading=document.createElement('div');
  heading.className='vqof-heading';
  heading.textContent='Für dich nutzbar';
  list.appendChild(heading);
  usable.forEach(x=>list.appendChild(x.card));
 }else{
  const empty=document.createElement('div');
  empty.className='vqof-empty';
  empty.textContent='Mit deinem aktuell hinterlegten Punktestand ist keine dieser Testoptionen vollständig nutzbar.';
  list.appendChild(empty);
 }

 if(deferred.length){
  const details=document.createElement('details');
  details.className='vqof-more';
  const summary=document.createElement('summary');
  summary.textContent=summaryText(deferred);
  const body=document.createElement('div');
  body.className='vqof-more-body';
  deferred
   .sort((a,b)=>Number(a.kind!=='insufficient')-Number(b.kind!=='insufficient'))
   .forEach(x=>body.appendChild(x.card));
  details.append(summary,body);
  list.appendChild(details);
 }
}

window.addEventListener('vayquo:flight-optimizer',ev=>apply(ev.detail||{}));
})();
