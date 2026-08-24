(()=>{
'use strict';

const ROOT_ID='v44-home-visual-trust';
const CARD_ENTRY_PAINT_CLASS='v44-card-entry-pending';
const CORE_STATE_KEY='vayquo-v1-state';
const BALANCE_META_KEY='vayquo:balanceMeta';
const PROGRAMS={
 mr:{label:'Membership Rewards',unit:'Punkte'},
 pb:{label:'PAYBACK',unit:'Punkte'},
 mm:{label:'Miles & More',unit:'Meilen'}
};
const IMAGES={
 hero:'https://images.unsplash.com/photo-1758192838598-a1de4da5dcaf?auto=format&fit=crop&w=1400&q=82',
 travel:'https://images.unsplash.com/photo-1772064901543-fb4a5d9f4736?auto=format&fit=crop&w=900&q=80',
 card:'assets/vayquo-card-wallet.webp?v=1',
 points:'https://images.unsplash.com/photo-1762280251209-f4c2cddeb53f?auto=format&fit=crop&w=900&q=80'
};

const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();

function startActive(){
 const nav=q('#bottom [data-view="start"],.bottom [data-view="start"]');
 if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;
 return qa('#app *').some(el=>el.children.length===0&&text(el)==='Deine Programme');
}

function readCoreState(){
 try{if(typeof state!=='undefined'&&state&&typeof state==='object')return state;}catch{}
 try{const saved=JSON.parse(localStorage.getItem(CORE_STATE_KEY)||'{}');return saved&&typeof saved==='object'?saved:{};}catch{return {};}
}
function readBalanceMeta(){
 try{const saved=JSON.parse(localStorage.getItem(BALANCE_META_KEY)||'{}');return saved&&typeof saved==='object'?saved:{};}catch{return {};}
}
function activePrograms(){
 const s=readCoreState();
 return Object.keys(PROGRAMS).filter(id=>!!s?.programs?.[id]);
}
function balance(id){
 const s=readCoreState();
 return Math.max(0,Math.round(Number(s?.balances?.[id])||0));
}
function knownBalance(id){
 const meta=readBalanceMeta();
 return meta?.[id]?.known===true||balance(id)>0;
}
function programCount(n){return `${n} ${n===1?'Programm':'Programme'} eingerichtet`;}
function missingCount(n){return n===1?'1 Stand offen':`${n} Stände offen`;}

function personalAction(){
 const active=activePrograms();
 if(!active.length){
  return {
   hasSetup:false,kind:'setup',meta:'Noch kein persönliches Setup',
   title:'Mach VAYQUO persönlich.',
   body:'Wähle deine Programme. Danach kann VAYQUO dir konkrete nächste Schritte aus deinem Setup zeigen.',
   cta:'Programme auswählen'
  };
 }

 const missing=active.filter(id=>!knownBalance(id));
 const meta=missing.length?`${programCount(active.length)} · ${missingCount(missing.length)}`:`${programCount(active.length)} · vollständig`;
 if(missing.length===1){
  const p=PROGRAMS[missing[0]];
  return {
   hasSetup:true,kind:'evaluation',meta,
   title:`${p.label}-Stand fehlt noch.`,
   body:`Ergänze deinen aktuellen ${p.unit.toLowerCase()}stand, damit VAYQUO dein Setup vollständig auswerten kann.`,
   cta:'Setup vervollständigen'
  };
 }
 if(missing.length>1){
  return {
   hasSetup:true,kind:'evaluation',meta,
   title:`Noch ${missing.length} Stände – dann ist dein Setup vollständig.`,
   body:'Vervollständige die fehlenden Stände, damit VAYQUO deine Programme gemeinsam einordnen kann.',
   cta:'Setup vervollständigen'
  };
 }

 const positive=active.filter(id=>balance(id)>0);
 if(!positive.length){
  return {
   hasSetup:true,kind:'points',meta,
   title:'Dein Setup ist vollständig.',
   body:'Deine hinterlegten Stände liegen aktuell bei 0. Prüfe oder aktualisiere sie, sobald sich etwas ändert.',
   cta:'Punktestände prüfen'
  };
 }

 if(active.length===1){
  const id=active[0];
  const content={
   mr:{title:'Prüfe die beste Nutzung deiner Membership Rewards.',body:'VAYQUO zeigt dir passende Transfer- und Einsatzmöglichkeiten für deinen hinterlegten Stand.'},
   pb:{title:'Hol mehr aus deinen PAYBACK Punkten heraus.',body:'VAYQUO ordnet die vorhandenen Einsatzmöglichkeiten für deinen hinterlegten Stand ein.'},
   mm:{title:'Prüfe, ob sich deine Meilen gerade lohnen.',body:'VAYQUO hilft dir, einen konkreten Meileneinsatz gegen die Alternative einzuordnen.'}
  }[id];
  return {hasSetup:true,kind:'evaluation',meta,title:content.title,body:content.body,cta:'Auswertung öffnen'};
 }

 return {
  hasSetup:true,kind:'evaluation',meta,
  title:'Deine Auswertung ist bereit.',
  body:'VAYQUO führt deine hinterlegten Punkte, Meilen und Vorteile zusammen und zeigt dir die sinnvollsten nächsten Möglichkeiten.',
  cta:'Auswertung öffnen'
 };
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
 .v44-home-entry-proxy,.v44-personal-proxy{position:fixed!important;left:-10000px!important;top:0!important;width:1px!important;height:1px!important;min-width:1px!important;min-height:1px!important;margin:0!important;padding:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;z-index:-1!important}
 .v44-hero{position:relative;min-height:194px;border-radius:22px;overflow:hidden;background:#1b1b1a;box-shadow:0 12px 32px rgba(23,23,22,.12);isolation:isolate}
 .v44-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 58%;display:block;z-index:-2;filter:saturate(.92) contrast(1.02)}
 .v44-hero:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(18,18,17,.90) 0%,rgba(18,18,17,.64) 48%,rgba(18,18,17,.10) 100%)}
 .v44-hero-copy{padding:22px 18px 20px;max-width:72%;color:#fffaf3}
 .v44-kicker{font-size:8px;line-height:1.2;font-weight:900;letter-spacing:.16em;color:#c4a16a}
 .v44-hero h2{margin:7px 0 7px;font-size:24px;line-height:1.04;letter-spacing:-.025em;word-spacing:.055em;text-wrap:balance;color:#fffaf3}
 .v44-hero p{margin:0 0 14px;font-size:10.5px;line-height:1.48;color:rgba(255,250,243,.80)}
 .v44-hero-btn{min-height:42px;border:1px solid rgba(255,250,243,.24);border-radius:13px;background:#fffaf3;color:#171918;padding:0 13px;font:850 10.5px inherit;display:inline-flex;align-items:center;gap:9px;box-shadow:0 7px 18px rgba(0,0,0,.10)}
 .v44-head{margin:22px 2px 13px}.v44-head h3{margin:4px 0 0;font-size:20px;line-height:1.08;letter-spacing:-.035em;color:#171918}.v44-head p{margin:6px 0 0;font-size:10px;line-height:1.45;color:#74736f}
 .v44-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 .v44-card{border:1px solid rgba(45,42,36,.10);border-radius:18px;background:#fffaf3;overflow:hidden;padding:0;text-align:left;color:#171918;box-shadow:0 8px 24px rgba(40,37,31,.055);font:inherit;min-width:0}
 .v44-card[data-v44-kind="card"]{display:none!important}
 .v44-card-media{position:relative;height:116px;background:#e8e1d7;overflow:hidden}.v44-card-media img{width:100%;height:100%;display:block;object-fit:cover;filter:saturate(.93) contrast(1.02)}
 .v44-card-media:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,18,17,0) 48%,rgba(18,18,17,.12) 100%);pointer-events:none}
 .v44-card[data-v44-kind="travel"] .v44-card-media img{object-position:center 58%}
 .v44-card[data-v44-kind="card"] .v44-card-media img{object-position:center 61%}
 .v44-card[data-v44-kind="points"] .v44-card-media img{object-position:center 54%}
 .v44-card-body{padding:12px 11px 13px;min-height:112px;display:flex;flex-direction:column}
 .v44-card b{font-size:12.3px;line-height:1.2;letter-spacing:-.012em;text-wrap:balance}.v44-card span{display:block;margin-top:6px;color:#77756f;font-size:9.3px;line-height:1.42}.v44-card i{margin-top:auto;padding-top:9px;color:#9b7849;font-style:normal;font-size:16px;line-height:1}
 .v44-personal-action{margin:22px 0 18px;padding:17px 16px 16px;border:1px solid rgba(92,82,65,.14);border-radius:20px;background:linear-gradient(145deg,#fffdf8,#f7f2e8);box-shadow:0 9px 25px rgba(40,37,31,.055);box-sizing:border-box}
 .v44-personal-status{display:inline-flex;align-items:center;min-height:25px;margin-top:9px;padding:0 9px;border-radius:999px;background:#f0ede5;color:#65706c;font-size:8.5px;font-weight:760}
 .v44-personal-action[data-v44-personal-kind="setup"] .v44-personal-status,.v44-personal-action[data-v44-personal-kind="evaluation"] .v44-personal-status{background:#f4eee2;color:#806a47}
 .v44-personal-action h3{margin:10px 0 0;font-size:20px;line-height:1.08;letter-spacing:-.035em;color:#171918;text-wrap:balance}
 .v44-personal-action p{margin:7px 0 0;font-size:10px;line-height:1.48;color:#6f7673}
 .v44-personal-cta{width:100%;min-height:43px;margin-top:14px;padding:0 13px;border:0;border-radius:13px;background:#171918;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:10px;font:850 10.5px inherit;text-align:left;box-shadow:0 8px 18px rgba(23,25,24,.12)}
 .v44-personal-cta:active{transform:scale(.992)}.v44-personal-cta b{font-size:16px;line-height:1}
 @media(max-width:390px){.v44-hero{min-height:184px}.v44-hero-copy{max-width:76%;padding:19px 16px}.v44-hero h2{font-size:22px;line-height:1.05;word-spacing:.06em}.v44-grid{gap:7px}.v44-card-media{height:104px}.v44-card-body{padding:11px 9px 12px;min-height:118px}.v44-card b{font-size:11.6px}.v44-card span{font-size:8.9px}.v44-personal-action{padding:16px 14px 15px}.v44-personal-action h3{font-size:18.5px}}
 @media(min-width:680px){#${ROOT_ID}{max-width:760px;margin-left:auto;margin-right:auto}.v44-hero{min-height:245px}.v44-card-media{height:150px}.v44-card-body{min-height:108px}}
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

function findPersonalHero(){
 const app=q('#app');if(!app)return null;
 const primary=qa('button,a,[role="button"]',app).find(el=>!el.closest(`#${ROOT_ID}`)&&text(el)==='Beste Nutzung finden');
 if(!primary)return null;
 let node=primary.parentElement;
 for(let i=0;i<8&&node&&node!==app;i++,node=node.parentElement){
  const own=text(node);
  if(/Beste Nutzung finden/.test(own)&&/Warum\?/.test(own)&&/Maximum daraus machen/i.test(own))return node;
 }
 return null;
}
function setPersonalHeroCollapsed(active){
 const hero=findPersonalHero();
 if(!hero)return false;
 hero.classList.toggle('v44-personal-proxy',!!active);
 const controls=qa('button,a,[role="button"],[tabindex]',hero);
 if(active){
  hero.setAttribute('aria-hidden','true');
  controls.forEach(control=>{
   if(!control.hasAttribute('data-v44-personal-prev-tabindex'))control.setAttribute('data-v44-personal-prev-tabindex',control.getAttribute('tabindex')??'');
   control.setAttribute('tabindex','-1');
  });
 }else{
  hero.removeAttribute('aria-hidden');
  controls.forEach(control=>{
   if(!control.hasAttribute('data-v44-personal-prev-tabindex'))return;
   const previous=control.getAttribute('data-v44-personal-prev-tabindex')||'';
   control.removeAttribute('data-v44-personal-prev-tabindex');
   if(previous)control.setAttribute('tabindex',previous);else control.removeAttribute('tabindex');
  });
 }
 return true;
}

function clickExistingCardCheck(){
 const button=q('#v28-card-advisor-entry .v28ca-entry-btn');
 if(button){button.click();return true;}
 return false;
}
function clickExistingPersonal(){
 const hero=findPersonalHero();
 const button=hero&&qa('button,a,[role="button"]',hero).find(el=>text(el)==='Beste Nutzung finden');
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

function findProgramsBlock(){
 const app=q('#app');if(!app)return null;
 const heading=qa('*',app).find(el=>el.children.length===0&&text(el)==='Deine Programme');
 if(!heading)return null;
 const section=heading.closest('section');
 if(section&&section!==app)return section;
 let node=heading.parentElement;
 let fallback=heading.parentElement;
 for(let i=0;i<7&&node&&node!==app;i++,node=node.parentElement){
  const own=text(node);
  if(/Deine Programme/.test(own))fallback=node;
  if(/Deine Programme/.test(own)&&/Ändern/.test(own))return node;
 }
 return fallback&&fallback!==app?fallback:null;
}
function clickProgramsChange(){
 const block=findProgramsBlock();
 const button=block&&qa('button,a,[role="button"]',block).find(el=>text(el)==='Ändern');
 if(button){button.click();return true;}
 return false;
}
function runPersonalAction(action){
 if(!action)return false;
 if(action.kind==='setup')return clickProgramsChange();
 if(action.kind==='points')return clickExistingView(['points','wallet']);
 return clickExistingPersonal();
}

function makeCard(image,title,copy,action,alt,kind){
 const card=document.createElement('button');card.type='button';card.className='v44-card';card.dataset.v44Kind=kind||'';
 const media=document.createElement('div');media.className='v44-card-media';media.appendChild(safeImage(image,alt));
 const body=document.createElement('div');body.className='v44-card-body';
 const heading=document.createElement('b');heading.textContent=title;
 const copyText=document.createElement('span');copyText.textContent=copy;
 const arrow=document.createElement('i');arrow.setAttribute('aria-hidden','true');arrow.textContent='→';
 body.append(heading,copyText,arrow);card.append(media,body);card.addEventListener('click',action);
 return card;
}

function makePersonalCard(){
 const card=document.createElement('section');card.className='v44-personal-action';card.setAttribute('aria-label','Für dich jetzt');
 card.innerHTML='<div class="v44-kicker">FÜR DICH JETZT</div><div class="v44-personal-status"></div><h3></h3><p></p><button type="button" class="v44-personal-cta"><span></span><b aria-hidden="true">→</b></button>';
 q('.v44-personal-cta',card)?.addEventListener('click',()=>runPersonalAction(card.__v44PersonalAction));
 return card;
}
function setNodeText(node,value){if(node&&text(node)!==value)node.textContent=value;}
function updatePersonal(root){
 if(!root)return;
 const action=personalAction();
 let card=q('.v44-personal-action',root);
 if(!card){card=makePersonalCard();root.appendChild(card);}
 card.__v44PersonalAction=action;
 card.dataset.v44PersonalKind=action.kind;
 setNodeText(q('.v44-personal-status',card),action.meta);
 setNodeText(q('h3',card),action.title);
 setNodeText(q('p',card),action.body);
 setNodeText(q('.v44-personal-cta span',card),action.cta);

 const hero=q('.v44-hero',root),head=q('.v44-head',root),grid=q('.v44-grid',root);
 if(!hero||!head||!grid)return;
 if(action.hasSetup){
  setNodeText(q('.v44-kicker',head),'WEITERE MÖGLICHKEITEN');
  setNodeText(q('h3',head),'Punkte, Meilen & Vorteile');
  setNodeText(q('p',head),'Öffne einen Bereich, wenn du gerade etwas anderes prüfen möchtest.');
 }else{
  setNodeText(q('.v44-kicker',head),'PUNKTE, MEILEN & VORTEILE');
  setNodeText(q('h3',head),'Was möchtest du besser nutzen?');
  setNodeText(q('p',head),'Entdecke, was deine Punkte wert sind und welche Vorteile du wirklich nutzen kannst.');
 }
 const desired=action.hasSetup?[hero,card,head,grid]:[hero,head,grid,card];
 if(desired.some((node,index)=>root.children[index]!==node))root.append(...desired);
}

function build(){
 ensureStyle();
 const root=document.createElement('section');root.id=ROOT_ID;root.setAttribute('aria-label','VAYQUO Möglichkeiten');

 const hero=document.createElement('div');hero.className='v44-hero';hero.appendChild(safeImage(IMAGES.card,'Premium-Kreditkarte in einem eleganten Wallet','lazy'));
 const heroCopy=document.createElement('div');heroCopy.className='v44-hero-copy';
 heroCopy.innerHTML='<div class="v44-kicker">KREDITKARTEN</div><h2>Welche Karte passt wirklich zu dir?</h2><p>VAYQUO prüft, welche Karte zu deinem Verhalten und deinen Vorteilen passt.</p>';
 const heroButton=document.createElement('button');heroButton.type='button';heroButton.className='v44-hero-btn';heroButton.textContent='Kartencheck starten  →';heroButton.addEventListener('click',clickExistingCardCheck);
 heroCopy.appendChild(heroButton);hero.appendChild(heroCopy);root.appendChild(hero);

 const head=document.createElement('div');head.className='v44-head';head.innerHTML='<div class="v44-kicker">PUNKTE, MEILEN & VORTEILE</div><h3>Was möchtest du besser nutzen?</h3><p>Entdecke, was deine Punkte wert sind und welche Vorteile du wirklich nutzen kannst.</p>';root.appendChild(head);

 const grid=document.createElement('div');grid.className='v44-grid';
 grid.append(
  makeCard(IMAGES.card,'Die richtige Karte finden','Welche Karte passt wirklich zu deinem Verhalten?',clickExistingCardCheck,'Elegantes Wallet mit Premium-Karte','card'),
  makeCard(IMAGES.points,'Punkte & Meilen','Wert erkennen, clever einsetzen und Transfers prüfen.',()=>clickExistingView(['points','wallet']),'Urlaub als mögliches Ziel für Punkte und Meilen','points'),
  makeCard(IMAGES.travel,'Vorteile','Guthaben, Lounges und weitere Kartenleistungen wirklich nutzen.',()=>clickExistingView(['benefits','card']),'Resort mit Pool als Beispiel für Reisevorteile','travel')
 );
 root.appendChild(grid);
 root.appendChild(makePersonalCard());
 updatePersonal(root);
 return root;
}

function mount(){
 const existing=q(`#${ROOT_ID}`);
 const anchor=q('#v28-card-advisor-entry');
 if(!anchor?.parentElement)return false;
 if(!startActive()){
  setHomeEntryCollapsed(false);
  setPersonalHeroCollapsed(false);
  releaseCardEntryPaintGate();
  existing?.remove();
  return true;
 }
 setHomeEntryCollapsed(true);
 setPersonalHeroCollapsed(true);
 releaseCardEntryPaintGate();
 if(existing){updatePersonal(existing);return true;}
 const root=build();
 anchor.insertAdjacentElement('afterend',root);
 setPersonalHeroCollapsed(true);
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
document.addEventListener('click',()=>setTimeout(schedule,0));
document.addEventListener('change',()=>setTimeout(schedule,0));
window.addEventListener('popstate',schedule);
})();
