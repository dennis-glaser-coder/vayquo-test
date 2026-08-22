(()=>{
'use strict';

const q=(s,r=document)=>r.querySelector(s);

function ensureStyle(){
  if(q('#v38-ratgeber-card-advisor-style'))return;
  const style=document.createElement('style');
  style.id='v38-ratgeber-card-advisor-style';
  style.textContent=`
    /* The former standalone Start-page entry stays available in the DOM for
       existing Ratgeber routing, but is no longer part of the visible layout. */
    #app .v24-ratgeber-home{display:none!important}

    #v28-card-advisor-entry .v38-ratgeber-inline{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      width:100%;
      margin:12px 0 0;
      padding:13px 15px;
      box-sizing:border-box;
      border:1px solid rgba(138,112,71,.24);
      border-radius:16px;
      background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(249,247,242,.82));
      box-shadow:0 8px 22px rgba(18,22,21,.045);
      color:inherit;
      text-decoration:none;
      -webkit-tap-highlight-color:transparent;
    }
    #v28-card-advisor-entry .v38-ratgeber-copy{min-width:0}
    #v28-card-advisor-entry .v38-ratgeber-copy small{
      display:block;
      margin:0;
      color:#8a7047;
      font-size:9px;
      line-height:1.2;
      font-weight:850;
      letter-spacing:.13em;
    }
    #v28-card-advisor-entry .v38-ratgeber-copy strong{
      display:block;
      margin-top:4px;
      color:#253330;
      font-size:12px;
      line-height:1.35;
      font-weight:760;
      letter-spacing:-.01em;
    }
    #v28-card-advisor-entry .v38-ratgeber-arrow{
      flex:0 0 auto;
      color:#8a7047;
      font-size:21px;
      line-height:1;
      font-weight:600;
    }
  `;
  document.head.appendChild(style);
}

function mount(){
  ensureStyle();
  const advisor=q('#app #v28-card-advisor-entry');
  const existing=q('.v38-ratgeber-inline');
  if(!advisor){existing?.remove();return;}

  let link=q('.v38-ratgeber-inline',advisor);
  if(!link){
    existing?.remove();
    link=document.createElement('a');
    link.className='v38-ratgeber-inline';
    link.href='/ratgeber/';
    link.setAttribute('aria-label','Ratgeber: PAYBACK Geld oder Meilen öffnen');
    link.innerHTML='<span class="v38-ratgeber-copy"><small>RATGEBER</small><strong>PAYBACK: Geld oder Meilen?</strong></span><span class="v38-ratgeber-arrow" aria-hidden="true">›</span>';
    advisor.appendChild(link);
  }
}

let scheduled=false;
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    try{mount();}catch(e){console.warn('VAYQUO integrated Ratgeber',e);}
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0));
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
