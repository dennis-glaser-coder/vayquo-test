(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));

function ensureStyle(){
 if(q('#vayquo-flight-feasibility-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-feasibility-style';
 style.textContent=`
 .vqof-heading{margin:13px 0 7px;font-size:11px;font-weight:800;color:#273532;letter-spacing:.01em}
 .vqof-empty{margin-top:9px;padding:11px 12px;border-radius:14px;background:rgba(120,126,124,.07);font-size:11px;line-height:1.45;color:var(--muted,#74817f)}
 .vqof-next{margin-top:12px}
 .vqof-gap{display:inline-flex;margin:8px 0 1px;padding:5px 8px;border-radius:999px;background:rgba(190,145,70,.12);font-size:10px;font-weight:800;color:#8b6f3f}
 .vqof-more{margin-top:10px;border-top:1px solid rgba(120,126,124,.12);padding-top:8px}
 .vqof-more>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;padding:7px 2px;font-size:11px;font-weight:800;color:#596865}
 .vqof-more>summary::-webkit-details-marker{display:none}
 .vqof-more>summary::after{content:'⌄';font-size:16px;line-height:1;color:#82908d;transition:transform .18s ease}
 .vqof-more[open]>summary::after{transform:rotate(180deg)}
 .vqof-more-body{display:grid;gap:8px;padding-top:5px}
 .vqof-why{margin-top:12px;border-top:1px solid rgba(120,126,124,.12);padding-top:9px}
 .vqof-why>summary{list-style:none;cursor:pointer;font-size:10px;font-weight:800;color:#667674}
 .vqof-why>summary::-webkit-details-marker{display:none}
 .vqof-why p{margin:6px 0 0;font-size:10px;line-height:1.5;color:var(--muted,#879391)}
 #vayquo-flight-optimizer~#vayquo-flight-results::before{display:none!important}
 `;
 document.head.appendChild(style);
}

function feasibility(item){
 const text=String(item?.status?.text||'');
 if(text==='Mit deinem Stand möglich'||text.startsWith('Punkte reichen'))return 'usable';
 if(text.startsWith('Noch '))return 'insufficient';
 return 'other';
}

function missingInfo(item){
 const text=String(item?.status?.text||'').trim();
 const match=text.match(/^Noch\s+([\d.\s]+)\s+(.+?)\s+nötig$/i);
 if(!match)return null;
 const amount=Number(match[1].replace(/[.\s]/g,''));
 if(!Number.isFinite(amount)||amount<=0)return null;
 return {amount,unit:match[2].trim()};
}

function mrRequired(item){
 const path=String(item?.path||'').trim();
 const match=path.match(/^([\d.\s]+)\s*MR(?:\s*·|\b)/i);
 if(!match)return null;
 const amount=Number(match[1].replace(/[.\s]/g,''));
 return Number.isFinite(amount)&&amount>0?amount:null;
}

function nextBest(rows){
 const insufficient=rows.filter(x=>x.kind==='insufficient').map(x=>({...x,missing:missingInfo(x.item)})).filter(x=>x.missing);
 if(!insufficient.length)return null;
 const mr=insufficient.filter(x=>/^MR$/i.test(x.missing.unit));
 const pool=mr.length?mr:insufficient;
 return pool.sort((a,b)=>a.missing.amount-b.missing.amount)[0]||null;
}

function summaryText(entries){
 if(!entries.length)return '';
 const insufficient=entries.filter(x=>x.kind==='insufficient').length;
 if(insufficient===entries.length){
  return `${entries.length} weitere ${entries.length===1?'Möglichkeit':'Möglichkeiten'}`;
 }
 return `Weitere Möglichkeiten · ${entries.length}`;
}

function addGap(card,row){
 const info=row?.missing||missingInfo(row?.item);if(!card||!info)return;
 const old=card.querySelector('.vqof-gap');if(old)old.remove();
 const gap=document.createElement('div');gap.className='vqof-gap';
 gap.textContent=`Dir fehlen ${fmt(info.amount)} ${info.unit}`;
 card.appendChild(gap);
 const required=mrRequired(row.item);
 if(required){
  const award=card.querySelector('.vqo-award');
  if(award&&!award.querySelector('.vqo-source-points')){
   const line=document.createElement('span');
   line.className='vqo-source-points';
   line.textContent=`dafür brauchst du ${fmt(required)} MR`;
   award.appendChild(line);
  }
 }
}

function shortenExplanation(){
 const foot=q('#vayquo-flight-optimizer .vqo-foot');if(!foot)return;
 foot.innerHTML='<details class="vqof-why"><summary>Warum noch keine echte Empfehlung?</summary><p>Awardpreise und Cashpreise sind hier noch Testdaten. Eine echte Empfehlung wird erst mit Live-Verfügbarkeit freigeschaltet.</p></details>';
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
 let deferred=rows.filter(x=>x.kind!=='usable');

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
  empty.textContent='Mit deinem aktuellen Punktestand reicht keine Punkteoption vollständig.';
  list.appendChild(empty);

  const closest=nextBest(deferred);
  if(closest){
   const heading=document.createElement('div');
   heading.className='vqof-heading vqof-next';
   heading.textContent='Nächstbeste Möglichkeit';
   list.appendChild(heading);
   addGap(closest.card,closest);
   list.appendChild(closest.card);
   deferred=deferred.filter(x=>x!==closest);
  }
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
 shortenExplanation();
}

window.addEventListener('vayquo:flight-optimizer',ev=>apply(ev.detail||{}));
})();
