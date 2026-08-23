(()=>{
'use strict';

const ROOT_ID='v44-home-visual-trust';
const CONFIG_URL='config/vayquo-card-advisor.de.json?v=2802';
const IMAGES={
 hero:'https://images.unsplash.com/photo-1663030083159-5a58ca80c4ef?auto=format&fit=crop&w=1400&q=82',
 travel:'https://images.unsplash.com/photo-1549897411-b06572cdf806?auto=format&fit=crop&w=900&q=78',
 card:'https://images.unsplash.com/photo-1703355684811-609896031caa?auto=format&fit=crop&w=900&q=78',
 points:'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=900&q=78'
};

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

function startActive(){
 const nav=q('#bottom [data-view="start"],.bottom [data-view="start"]');
 if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;
 return qa('#app *').some(el=>el.children.length===0&&(el.textContent||'').trim()==='Deine Programme');
}

function ensureStyle(){
 if(q('#v44-home-visual-trust-style'))return;
 const style=document.createElement('style');
 style.id='v44-home-visual-trust-style';
 style.textContent=`
 #${ROOT_ID}{margin:8px 0 22px;color:#171918;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
 .v44-hero{position:relative;min-height:194px;border-radius:22px;overflow:hidden;background:#1b1b1a;box-shadow:0 12px 32px rgba(23,23,22,.12);isolation:isolate}
 .v44-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 48%;display:block;z-index:-2}
 .v44-hero:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(18,18,17,.90) 0%,rgba(18,18,17,.67) 48%,rgba(18,18,17,.10) 100%)}
 .v44-hero-copy{padding:22px 18px 20px;max-width:72%;color:#fffaf3}
 .v44-kicker{font-size:8px;line-height:1.2;font-weight:900;letter-spacing:.16em;color:#c4a16a}
 .v44-hero h2{margin:7px 0 7px;font-size:24px;line-height:1.04;letter-spacing:-.025em;word-spacing:.055em;text-wrap:balance;color:#fffaf3}
 .v44-hero p{margin:0 0 14px;font-size:10.5px;line-height:1.48;color:rgba(255,250,243,.78)}
 .v44-hero-btn{min-height:42px;border:1px solid rgba(255,250,243,.24);border-radius:13px;background:#fffaf3;color:#171918;padding:0 13px;font:850 10.5px inherit;display:inline-flex;align-items:center;gap:9px;box-shadow:0 7px 18px rgba(0,0,0,.10)}
 .v44-head{margin:22px 2px 13px}.v44-head h3{margin:4px 0 0;font-size:20px;line-height:1.08;letter-spacing:-.035em;color:#171918}.v44-head p{margin:6px 0 0;font-size:10px;line-height:1.45;color:#74736f}
 .v44-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
 .v44-card{border:1px solid rgba(45,42,36,.10);border-radius:18px;background:#fffaf3;overflow:hidden;padding:0;text-align:left;color:#171918;box-shadow:0 8px 24px rgba(40,37,31,.055);font:inherit;min-width:0}
 .v44-card-media{height:104px;background:#e8e1d7;overflow:hidden}.v44-card-media img{width:100%;height:100%;display:block;object-fit:cover}
 .v44-card-body{padding:11px 9px 12px;min-height:128px;display:flex;flex-direction:column}
 .v44-card b{font-size:11px;line-height:1.2;letter-spacing:-.012em;text-wrap:balance}.v44-card span{display:block;margin-top:6px;color:#77756f;font-size:8.8px;line-height:1.4}.v44-card i{margin-top:auto;padding-top:9px;color:#9b7849;font-style:normal;font-size:16px;line-height:1}
 .v44-trust{margin-top:13px;padding:14px 10px 11px;border:1px solid rgba(45,42,36,.10);border-radius:18px;background:#f6f0e7}
 .v44-trust-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 .v44-trust-item{display:flex;align-items:center;gap:8px;min-height:38px;padding:5px 6px;border-radius:11px;background:rgba(255,250,243,.7)}
 .v44-trust-icon{width:25px;height:25px;border:1px solid rgba(152,122,77,.32);border-radius:50%;display:grid;place-items:center;color:#987a4d;font-size:11px;flex:0 0 auto}
 .v44-trust-item b{font-size:8.9px;line-height:1.25;color:#272624}
 .v44-checked{margin:10px 0 0;text-align:center;color:#77736c;font-size:8px;line-height:1.4}.v44-checked strong{color:#987a4d;font-weight:850}
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

function makeCard(image,title,copy,action,alt){
 const card=document.createElement('button');card.type='button';card.className='v44-card';
 const media=document.createElement('div');media.className='v44-card-media';media.appendChild(safeImage(image,alt));
 const body=document.createElement('div');body.className='v44-card-body';
 const heading=document.createElement('b');heading.textContent=title;
 const text=document.createElement('span');text.textContent=copy;
 const arrow=document.createElement('i');arrow.setAttribute('aria-hidden','true');arrow.textContent='→';
 body.append(heading,text,arrow);card.append(media,body);card.addEventListener('click',action);
 return card;
}

function formatCheckedAt(value){
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));
 return match?`${match[3]}.${match[2]}.${match[1]}`:'21.08.2026';
}

async function fillCheckedDate(root){
 const target=q('[data-v44-checked]',root);if(!target)return;
 try{
  const response=await fetch(CONFIG_URL,{cache:'no-store'});if(!response.ok)return;
  const data=await response.json();target.textContent=formatCheckedAt(data?.checkedAt);
 }catch{}
}

function build(){
 ensureStyle();
 const root=document.createElement('section');root.id=ROOT_ID;root.setAttribute('aria-label','VAYQUO Möglichkeiten und Vertrauen');

 const hero=document.createElement('div');hero.className='v44-hero';hero.appendChild(safeImage(IMAGES.hero,'Reisegepäck am Flughafen','lazy'));
 const heroCopy=document.createElement('div');heroCopy.className='v44-hero-copy';
 heroCopy.innerHTML='<div class="v44-kicker">MEHR AUS DEINEN MÖGLICHKEITEN</div><h2>Karten, Punkte & Reisen. Besser entschieden.</h2><p>VAYQUO verbindet deine Ziele mit passenden Karten, Punkten und Vorteilen.</p>';
 const heroButton=document.createElement('button');heroButton.type='button';heroButton.className='v44-hero-btn';heroButton.textContent='Kartencheck starten  →';heroButton.addEventListener('click',clickExistingCardCheck);
 heroCopy.appendChild(heroButton);hero.appendChild(heroCopy);root.appendChild(hero);

 const head=document.createElement('div');head.className='v44-head';head.innerHTML='<div class="v44-kicker">DEINE NÄCHSTEN MÖGLICHKEITEN</div><h3>Was möchtest du besser machen?</h3><p>Direkt zu dem Bereich, der für dich gerade wichtig ist.</p>';root.appendChild(head);

 const grid=document.createElement('div');grid.className='v44-grid';
 grid.append(
  makeCard(IMAGES.travel,'Besser reisen','Meilen, Lounges und Reisevorteile clever nutzen',()=>clickExistingView(['benefits','card']),'Hochwertiger Flughafen-Loungebereich'),
  makeCard(IMAGES.card,'Die richtige Karte finden','Welche Karte passt wirklich zu deinem Verhalten?',clickExistingCardCheck,'Schwarzes Kartenetui'),
  makeCard(IMAGES.points,'Mehr aus Punkten machen','Membership Rewards, PAYBACK und Miles & More smarter einsetzen',()=>clickExistingView(['points','wallet']),'Hochwertiges Reisehotel mit Pool')
 );
 root.appendChild(grid);

 const trust=document.createElement('div');trust.className='v44-trust';
 const trustGrid=document.createElement('div');trustGrid.className='v44-trust-grid';
 const items=[['◇','Unabhängig gerechnet'],['✓','Konditionen geprüft'],['↗','Empfehlung unabhängig von Provision'],['◎','Nur offizielle Anbieterquellen']];
 for(const [icon,label] of items){const item=document.createElement('div');item.className='v44-trust-item';const badge=document.createElement('span');badge.className='v44-trust-icon';badge.textContent=icon;const b=document.createElement('b');b.textContent=label;item.append(badge,b);trustGrid.appendChild(item);}
 const checked=document.createElement('p');checked.className='v44-checked';checked.innerHTML='Kartenkonditionen zuletzt geprüft: <strong data-v44-checked>21.08.2026</strong>';
 trust.append(trustGrid,checked);root.appendChild(trust);
 void fillCheckedDate(root);
 return root;
}

function mount(){
 const existing=q(`#${ROOT_ID}`);
 if(!startActive()){existing?.remove();return false;}
 if(existing)return true;
 const anchor=q('#v28-card-advisor-entry');
 if(!anchor?.parentElement)return false;
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
