(()=>{
'use strict';

const ROOT_ID='v44-home-visual-trust';
const CARD_ENTRY_PAINT_CLASS='v44-card-entry-pending';
const CARD_IMAGE='data:image/webp;base64,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';
const IMAGES={
 hero:'https://images.unsplash.com/photo-1758192838598-a1de4da5dcaf?auto=format&fit=crop&w=1400&q=82',
 travel:'https://images.unsplash.com/photo-1772064901543-fb4a5d9f4736?auto=format&fit=crop&w=900&q=80',
 card:CARD_IMAGE,
 points:'https://images.unsplash.com/photo-1762280251209-f4c2cddeb53f?auto=format&fit=crop&w=900&q=80'
};

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

function startActive(){
 const nav=q('#bottom [data-view="start"],.bottom [data-view="start"]');
 if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;
 return qa('#app *').some(el=>el.children.length===0&&(el.textContent||'').trim()==='Deine Programme');
}

function releaseCardEntryPaintGate(){
 document.documentElement.classList.remove(CARD_ENTRY_PAINT_CLASS);
 try{clearTimeout(window.__v44CardEntryPaintFallback);}catch{}
}

function ensureStyle(){
 if(q('#v44-home-visual-trust-style'))return;
 const style=document.createElement('style');
 style.id='v44-home-visual-trust-style';
 style.textContent=`
 #${ROOT_ID}{margin:8px 0 18px;color:#171918;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
 .v44-home-entry-proxy{position:fixed!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;min-width:1px!important;min-height:1px!important;margin:0!important;padding:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;z-index:-1!important}
 .v44-hero{position:relative;min-height:194px;border-radius:22px;overflow:hidden;background:#1b1b1a;box-shadow:0 12px 32px rgba(23,23,22,.12);isolation:isolate}
 .v44-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 58%;display:block;z-index:-2;filter:saturate(.92) contrast(1.02)}
 .v44-hero:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(18,18,17,.88) 0%,rgba(18,18,17,.61) 47%,rgba(18,18,17,.08) 100%)}
 .v44-hero-copy{padding:22px 18px 20px;max-width:72%;color:#fffaf3}
 .v44-kicker{font-size:8px;line-height:1.2;font-weight:900;letter-spacing:.16em;color:#c4a16a}
 .v44-hero h2{margin:7px 0 7px;font-size:24px;line-height:1.04;letter-spacing:-.025em;word-spacing:.055em;text-wrap:balance;color:#fffaf3}
 .v44-hero p{margin:0 0 14px;font-size:10.5px;line-height:1.48;color:rgba(255,250,243,.80)}
 .v44-hero-btn{min-height:42px;border:1px solid rgba(255,250,243,.24);border-radius:13px;background:#fffaf3;color:#171918;padding:0 13px;font:850 10.5px inherit;display:inline-flex;align-items:center;gap:9px;box-shadow:0 7px 18px rgba(0,0,0,.10)}
 .v44-head{margin:22px 2px 13px}.v44-head h3{margin:4px 0 0;font-size:20px;line-height:1.08;letter-spacing:-.035em;color:#171918}.v44-head p{margin:6px 0 0;font-size:10px;line-height:1.45;color:#74736f}
 .v44-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
 .v44-card{border:1px solid rgba(45,42,36,.10);border-radius:18px;background:#fffaf3;overflow:hidden;padding:0;text-align:left;color:#171918;box-shadow:0 8px 24px rgba(40,37,31,.055);font:inherit;min-width:0}
 .v44-card-media{position:relative;height:104px;background:#e8e1d7;overflow:hidden}.v44-card-media img{width:100%;height:100%;display:block;object-fit:cover;filter:saturate(.93) contrast(1.02)}
 .v44-card-media:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,18,17,0) 48%,rgba(18,18,17,.12) 100%);pointer-events:none}
 .v44-card[data-v44-kind="travel"] .v44-card-media img{object-position:center 58%}
 .v44-card[data-v44-kind="card"] .v44-card-media img{object-position:center 58%}
 .v44-card[data-v44-kind="points"] .v44-card-media img{object-position:center 54%}
 .v44-card-body{padding:11px 9px 12px;min-height:128px;display:flex;flex-direction:column}
 .v44-card b{font-size:11px;line-height:1.2;letter-spacing:-.012em;text-wrap:balance}.v44-card span{display:block;margin-top:6px;color:#77756f;font-size:8.8px;line-height:1.4}.v44-card i{margin-top:auto;padding-top:9px;color:#9b7849;font-style:normal;font-size:16px;line-height:1}
 @media(max-width:390px){.v44-hero{min-height:184px}.v44-hero-copy{max-width:76%;padding:19px 16px}.v44-hero h2{font-size:22px;line-height:1.05;word-spacing:.06em}.v44-grid{gap:6px}.v44-card-media{height:94px}.v44-card-body{padding:10px 7px 11px;min-height:132px}.v44-card b{font-size:10.3px}.v44-card span{font-size:8.2px}}
 @media(min-width:680px){#${ROOT_ID}{max-width:760px;margin-left:auto;margin-right:auto}.v44-hero{min-height:245px}.v44-card-media{height:150px}.v44-card-body{min-height:116px}}
 `;
 document.head.appendChild(style);
}

function safeImage(src,alt,loading='lazy'){
 const img=document.createElement('img');
 img.src=src;img.alt=alt;img.loading=loading;img.decoding='async';img.referrerPolicy='no-referrer';
 img.addEventListener('error',()=>{img.hidden=true;},{once:true});
 return img;
}

function setHomeEntryCollapsed(active){
 const entry=q('#v28-card-advisor-entry');
 if(!entry)return;
 entry.classList.toggle('v44-home-entry-proxy',!!active);
 const button=q('.v28ca-entry-btn',entry);
 if(active){
  entry.setAttribute('aria-hidden','true');
  if(button&&!button.hasAttribute('data-v44-prev-tabindex'))button.setAttribute('data-v44-prev-tabindex',button.getAttribute('tabindex')??'');
  button?.setAttribute('tabindex','-1');
 }else{
  entry.removeAttribute('aria-hidden');
  if(button?.hasAttribute('data-v44-prev-tabindex')){
   const previous=button.getAttribute('data-v44-prev-tabindex')||'';
   button.removeAttribute('data-v44-prev-tabindex');
   if(previous)button.setAttribute('tabindex',previous);else button.removeAttribute('tabindex');
  }
 }
}

function clickExistingCardCheck(){
 const button=q('#v28-card-advisor-entry .v28ca-entry-btn');
 if(button){button.click();return true;}
 return false;
}

function clickExistingView(names){
 const navs=qa('#bottom [data-view],.bottom [data-view]');
 const wanted=new Set(names);
 const button=navs.find(el=>wanted.has(String(el.dataset?.view||'').toLowerCase()));
 if(button){button.click();return true;}
 return false;
}

function makeCard(image,title,copy,action,alt,kind){
 const card=document.createElement('button');card.type='button';card.className='v44-card';card.dataset.v44Kind=kind||'';
 const media=document.createElement('div');media.className='v44-card-media';media.appendChild(safeImage(image,alt));
 const body=document.createElement('div');body.className='v44-card-body';
 const heading=document.createElement('b');heading.textContent=title;
 const text=document.createElement('span');text.textContent=copy;
 const arrow=document.createElement('i');arrow.setAttribute('aria-hidden','true');arrow.textContent='→';
 body.append(heading,text,arrow);card.append(media,body);card.addEventListener('click',action);
 return card;
}

function build(){
 ensureStyle();
 const root=document.createElement('section');root.id=ROOT_ID;root.setAttribute('aria-label','VAYQUO Möglichkeiten');

 const hero=document.createElement('div');hero.className='v44-hero';hero.appendChild(safeImage(IMAGES.hero,'Luxuriöser Urlaub am Pool mit Palmen','lazy'));
 const heroCopy=document.createElement('div');heroCopy.className='v44-hero-copy';
 heroCopy.innerHTML='<div class="v44-kicker">MEHR AUS DEINEN MÖGLICHKEITEN</div><h2>Karten, Punkte & Reisen. Besser entschieden.</h2><p>VAYQUO verbindet deine Ziele mit passenden Karten, Punkten und Vorteilen.</p>';
 const heroButton=document.createElement('button');heroButton.type='button';heroButton.className='v44-hero-btn';heroButton.textContent='Kartencheck starten  →';heroButton.addEventListener('click',clickExistingCardCheck);
 heroCopy.appendChild(heroButton);hero.appendChild(heroCopy);root.appendChild(hero);

 const head=document.createElement('div');head.className='v44-head';head.innerHTML='<div class="v44-kicker">DEINE NÄCHSTEN MÖGLICHKEITEN</div><h3>Was möchtest du besser machen?</h3><p>Direkt zu dem Bereich, der für dich gerade wichtig ist.</p>';root.appendChild(head);

 const grid=document.createElement('div');grid.className='v44-grid';
 grid.append(
  makeCard(IMAGES.travel,'Besser reisen','Meilen, Lounges und Reisevorteile clever nutzen',()=>clickExistingView(['benefits','card']),'Luxuriöser Resorturlaub mit Pool und Palmen','travel'),
  makeCard(IMAGES.card,'Die richtige Karte finden','Welche Karte passt wirklich zu deinem Verhalten?',clickExistingCardCheck,'Elegantes Wallet mit Premium-Karte im luxuriösen Urlaubsambiente','card'),
  makeCard(IMAGES.points,'Mehr aus Punkten machen','Membership Rewards, PAYBACK und Miles & More smarter einsetzen',()=>clickExistingView(['points','wallet']),'Hochwertiger Urlaub am Pool','points')
 );
 root.appendChild(grid);
 return root;
}

function mount(){
 const existing=q(`#${ROOT_ID}`);
 const anchor=q('#v28-card-advisor-entry');
 if(!anchor?.parentElement)return false;
 if(!startActive()){
  setHomeEntryCollapsed(false);
  releaseCardEntryPaintGate();
  existing?.remove();
  return true;
 }
 setHomeEntryCollapsed(true);
 releaseCardEntryPaintGate();
 if(existing)return true;
 anchor.insertAdjacentElement('afterend',build());
 return true;
}

let retryTimer=0;
function retryMount(attempt=0){
 clearTimeout(retryTimer);
 if(mount()||attempt>=20)return;
 retryTimer=setTimeout(()=>retryMount(attempt+1),250);
}
function schedule(){setTimeout(()=>retryMount(0),0);}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',ev=>{if(ev.target?.closest?.('#bottom [data-view],.bottom [data-view]'))schedule();},true);
window.addEventListener('popstate',schedule);
})();
