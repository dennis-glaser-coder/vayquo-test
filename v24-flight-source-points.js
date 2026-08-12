(()=>{
'use strict';
const q=(s,r=document)=>r.querySelector(s);
const fmt=n=>new Intl.NumberFormat('de-DE',{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(n)||0)));
function ensureStyle(){
 if(q('#vayquo-flight-source-points-style'))return;
 const style=document.createElement('style');
 style.id='vayquo-flight-source-points-style';
 style.textContent=`.vqo-source-points{display:block;margin-top:4px;font-size:10px;font-weight:750;line-height:1.25;color:#6f7e7b;white-space:normal}`;
 document.head.appendChild(style);
}
function mrNeeded(item){
 const path=String(item?.path||'').trim();
 const match=path.match(/^([\d.\s]+)\s*MR(?:\s*·|\b)/i);
 if(!match)return null;
 const value=Number(match[1].replace(/[.\s]/g,''));
 return Number.isFinite(value)&&value>0?value:null;
}
function apply(detail){
 const evaluated=Array.isArray(detail?.evaluated)?detail.evaluated:[];
 const list=q('#vayquo-flight-optimizer .vqo-list');if(!list||!evaluated.length)return;
 const cards=Array.from(list.children).filter(el=>el.classList.contains('vqo-option'));
 if(cards.length!==evaluated.length)return;
 ensureStyle();
 evaluated.forEach((item,index)=>{
  const needed=mrNeeded(item);if(!needed)return;
  const award=cards[index]?.querySelector('.vqo-award');if(!award)return;
  let line=award.querySelector('.vqo-source-points');
  const copy=`dafür brauchst du ${fmt(needed)} MR`;
  if(!line){line=document.createElement('span');line.className='vqo-source-points';award.appendChild(line);}
  if(line.textContent!==copy)line.textContent=copy;
 });
}
window.addEventListener('vayquo:flight-optimizer',ev=>apply(ev.detail||{}));
})();
