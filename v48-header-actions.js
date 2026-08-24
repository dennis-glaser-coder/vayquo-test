(()=>{
'use strict';

const ROOT_ID='v48-header-actions';
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();

function visible(el){
  if(!el)return false;
  const cs=getComputedStyle(el),r=el.getBoundingClientRect();
  return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0';
}

function homeActive(){
  const active=q('#bottom [data-view].active,.bottom [data-view].active,#bottom [aria-current="page"],.bottom [aria-current="page"]');
  if(active){
    const v=String(active.dataset?.view||txt(active)).toLowerCase();
    if(v)return v==='start'||v==='today';
  }
  return !!q('#v44-home-visual-trust')||qa('#app *').some(el=>el.children.length===0&&txt(el)==='Deine Programme');
}

function ensureStyle(){
  let style=q('#v48-header-actions-style');
  if(!style){style=document.createElement('style');style.id='v48-header-actions-style';document.head.appendChild(style);}
  style.textContent=`
    #${ROOT_ID}{position:relative!important;flex:0 0 auto!important;display:grid!important;place-items:center!important;padding:0!important;overflow:hidden!important;-webkit-tap-highlight-color:transparent!important}
    #${ROOT_ID}[hidden]{display:none!important}
    #${ROOT_ID} svg{width:22px!important;height:22px!important;display:block!important;fill:none!important;stroke:#171918!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;pointer-events:none!important}
    #${ROOT_ID}:active{transform:scale(.97)!important}
    #v24-auth .v24a-card{position:relative!important}
    #v24-auth .v48-auth-close{position:absolute!important;top:14px!important;right:14px!important;width:38px!important;height:38px!important;padding:0!important;border:1px solid rgba(23,25,24,.10)!important;border-radius:50%!important;background:rgba(255,254,251,.92)!important;color:#171918!important;display:grid!important;place-items:center!important;font:400 22px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif!important;box-shadow:0 5px 16px rgba(18,31,28,.06)!important;z-index:4!important;-webkit-tap-highlight-color:transparent!important}
    #v24-auth .v48-auth-close:active{transform:scale(.96)!important;background:#f1eee8!important}
  `;
}

function userIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5.5 19c.7-4 3-6 6.5-6s5.8 2 6.5 6"></path></svg>';}

function authUser(){try{return window.VAYQUO_AUTH?.getUser?.()||null;}catch{return null;}}

function findSettingsTarget(){
  const direct=q('#bottom [data-view="settings"],.bottom [data-view="settings"],#bottom [data-view="einstellungen"],.bottom [data-view="einstellungen"],[data-view="settings"],[data-view="einstellungen"]');
  if(direct)return direct;
  return qa('button,a,[role="button"]')
    .filter(el=>el.id!==ROOT_ID&&!el.closest?.('#v24-auth'))
    .find(el=>/^(Einstellungen|Settings)$/i.test(txt(el))||/Einstellungen|Settings/i.test(String(el.getAttribute('aria-label')||el.getAttribute('title')||'')))||null;
}

function login(){
  if(authUser()){
    const target=findSettingsTarget();
    target?.click();
    return;
  }
  if(window.VAYQUO_AUTH?.show){
    window.VAYQUO_AUTH.show({mode:'login',title:'Dein VAYQUO-Konto.',copy:'Melde dich an, um deine gespeicherten Entscheidungen und Stände wieder zu laden.'});
    setTimeout(ensureAuthClose,0);
  }
}

function topBrand(){
  const app=q('#app');if(!app)return null;
  const ar=app.getBoundingClientRect();
  return qa('*',app)
    .filter(el=>el.children.length===0&&visible(el)&&/^VAYQUO$/i.test(txt(el)))
    .filter(el=>{const r=el.getBoundingClientRect();return r.top>=ar.top-4&&r.top<ar.top+170;})
    .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]||null;
}

function headerControls(){
  const app=q('#app'),brand=topBrand();if(!app||!brand)return null;
  const br=brand.getBoundingClientRect();
  const controls=qa('button,a,[role="button"]',app)
    .filter(el=>el.id!==ROOT_ID&&!el.closest?.('#bottom,.bottom,#v24-auth')&&visible(el))
    .filter(el=>{
      const r=el.getBoundingClientRect();
      return r.left>br.right+8&&r.top<br.bottom+32&&r.bottom>br.top-24&&r.width>=34&&r.width<=72&&r.height>=34&&r.height<=72;
    })
    .sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);
  if(controls.length<2)return null;

  const first=controls[0],second=controls[1];
  if(first.parentElement===second.parentElement)return {host:first.parentElement,controls:[first,second]};

  let node=first.parentElement;
  while(node&&node!==app){
    if(node.contains(second)){
      const r=node.getBoundingClientRect();
      if(r.width<=260&&r.height<=90)return {host:node,controls:[first,second]};
      break;
    }
    node=node.parentElement;
  }
  return null;
}

function directChild(el,host){
  let node=el;
  while(node?.parentElement&&node.parentElement!==host)node=node.parentElement;
  return node?.parentElement===host?node:null;
}

function cleanClone(template){
  const btn=template.cloneNode(false);
  [...btn.attributes].forEach(attr=>{
    const n=attr.name.toLowerCase();
    if(n==='id'||n==='href'||n==='aria-current'||n==='aria-expanded'||n==='aria-haspopup'||n.startsWith('data-'))btn.removeAttribute(attr.name);
  });
  btn.id=ROOT_ID;
  btn.innerHTML=userIcon();
  btn.setAttribute('aria-label',authUser()?'Konto öffnen':'Anmelden');
  btn.setAttribute('title',authUser()?'Konto':'Anmelden');
  if(btn.tagName==='BUTTON')btn.type='button';
  else{btn.setAttribute('role','button');btn.setAttribute('tabindex','0');}
  btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();login();});
  btn.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();login();}});
  const r=template.getBoundingClientRect();
  btn.style.width=`${Math.round(r.width)}px`;
  btn.style.height=`${Math.round(r.height)}px`;
  return btn;
}

function mount(){
  ensureStyle();
  const old=q(`#${ROOT_ID}`);
  if(!homeActive()){
    old?.setAttribute('hidden','');
    return old;
  }

  const group=headerControls();
  if(!group){old?.remove();return null;}
  const {host,controls}=group;
  if(old&&old.parentElement===host){
    old.removeAttribute('hidden');
    old.setAttribute('aria-label',authUser()?'Konto öffnen':'Anmelden');
    old.setAttribute('title',authUser()?'Konto':'Anmelden');
    return old;
  }
  old?.remove();
  const btn=cleanClone(controls[0]);
  const anchor=directChild(controls[0],host)||host.firstChild;
  host.insertBefore(btn,anchor||null);
  return btn;
}

function closeAuth(){
  const root=q('#v24-auth');
  if(!root)return;
  root.setAttribute('hidden','');
  document.documentElement.classList.remove('vq-auth-pending');
  try{document.activeElement?.blur?.();}catch{}
}

function ensureAuthClose(){
  const root=q('#v24-auth'),card=q('#v24-auth .v24a-card');
  if(!root||!card)return;
  let close=q('.v48-auth-close',card);
  if(!close){
    close=document.createElement('button');
    close.type='button';close.className='v48-auth-close';close.setAttribute('aria-label','Zurück zu VAYQUO');close.textContent='×';
    close.addEventListener('click',closeAuth);
    card.appendChild(close);
  }
}

function cleanupLegacy(){
  q('#v48-header-menu')?.remove();
  qa('.v48-header-host').forEach(el=>el.classList.remove('v48-header-host'));
  qa('.v48-fallback-host').forEach(el=>el.remove());
}

function sync(){
  cleanupLegacy();
  ensureAuthClose();
  const btn=mount();
  if(btn){btn.setAttribute('aria-label',authUser()?'Konto öffnen':'Anmelden');btn.setAttribute('title',authUser()?'Konto':'Anmelden');}
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{sync();}catch(e){console.warn('VAYQUO account header',e);}});
}

ensureStyle();
cleanupLegacy();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',()=>setTimeout(schedule,0),true);
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','aria-current']});
})();
