(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
const HEADER_COPY='Die App für Kreditkarten, Punkte & Meilen';

function ensureStyle(){
  if(q('#v34-home-usp-style'))return;
  const style=document.createElement('style');
  style.id='v34-home-usp-style';
  style.textContent=`
    .v34usp-brand{display:inline-flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;line-height:1!important}
    .v34usp-headerline{display:block!important;margin-top:6px!important;font-size:8.5px!important;line-height:1.15!important;font-weight:700!important;letter-spacing:.015em!important;text-transform:none!important;color:#7b8582!important;white-space:nowrap!important}
    @media(max-width:390px){.v34usp-headerline{font-size:7.8px!important}}
  `;
  document.head.appendChild(style);
}

function findHeaderBrand(){
  const app=q('#app');
  if(!app||!q('#bottom,.bottom'))return null;
  const exact=qa('*',app).filter(el=>{
    if(el.children.length!==0||el.closest('button,a,[role="button"]'))return false;
    return text(el).replace(/\s+/g,'').toUpperCase()==='VAYQUO';
  });
  if(!exact.length)return null;

  const greeting=qa('*',app).find(el=>el.children.length===0&&/^Hallo\b/i.test(text(el)));
  if(greeting){
    return exact.sort((a,b)=>{
      const ar=a.getBoundingClientRect();
      const br=b.getBoundingClientRect();
      const gr=greeting.getBoundingClientRect();
      return Math.abs(ar.top-gr.top)-Math.abs(br.top-gr.top);
    })[0];
  }
  return exact[0];
}

function clearOldHeroOverride(){
  qa('.v34usp-title').forEach(el=>{el.classList.remove('v34usp-title');el.removeAttribute('aria-label');});
  qa('.v34usp-support').forEach(el=>el.remove());
}

function apply(){
  ensureStyle();
  clearOldHeroOverride();
  const brand=findHeaderBrand();
  if(!brand)return;
  brand.classList.add('v34usp-brand');
  let line=q('.v34usp-headerline',brand);
  if(!line){
    line=document.createElement('span');
    line.className='v34usp-headerline';
    line.textContent=HEADER_COPY;
    brand.appendChild(line);
  }else if(text(line)!==HEADER_COPY){
    line.textContent=HEADER_COPY;
  }
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{apply();}catch(e){console.warn('VAYQUO header USP',e);}});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current']});
})();
