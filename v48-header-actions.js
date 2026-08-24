(()=>{
'use strict';

const ROOT_ID='v48-header-actions';
const MENU_ID='v48-header-menu';
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
  if(q('#v48-header-actions-style'))return;
  const style=document.createElement('style');
  style.id='v48-header-actions-style';
  style.textContent=`
    .v48-header-host{position:relative!important;min-height:52px!important;padding-right:108px!important}
    #${ROOT_ID}{position:absolute;right:0;top:50%;transform:translateY(-50%);display:flex;align-items:center;gap:7px;z-index:18;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
    #${ROOT_ID}[hidden]{display:none!important}
    .v48-action{width:48px;height:48px;padding:0;border:1px solid rgba(23,25,24,.09);border-radius:15px;background:rgba(255,254,251,.94);color:#171918;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font:inherit;box-shadow:0 6px 18px rgba(18,31,28,.045),inset 0 1px 0 rgba(255,255,255,.78);-webkit-tap-highlight-color:transparent}
    .v48-action:active{transform:scale(.975);background:#f4f4ef}
    .v48-action svg{width:18px;height:18px;display:block;fill:none;stroke:#171918;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
    .v48-action span{display:block;max-width:44px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#6a716f;font-size:7.8px;line-height:1.05;font-weight:760;letter-spacing:-.01em}
    .v48-fallback-host{position:relative;min-height:52px;margin:0 0 8px;display:flex;justify-content:flex-end;align-items:center}
    .v48-fallback-host #${ROOT_ID}{position:static;transform:none}
    #${MENU_ID}{position:fixed;z-index:2147483500;width:min(224px,calc(100vw - 28px));padding:7px;box-sizing:border-box;border:1px solid rgba(23,25,24,.10);border-radius:18px;background:rgba(255,254,251,.985);box-shadow:0 20px 55px rgba(12,24,21,.18);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif}
    #${MENU_ID}[hidden]{display:none!important}
    .v48-menu-item{width:100%;min-height:44px;padding:0 12px;border:0;border-radius:12px;background:transparent;color:#171918;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font:760 12px/1.2 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;text-decoration:none;box-sizing:border-box}
    .v48-menu-item:active{background:#f2efe8}
    .v48-menu-item small{color:#9a804c;font-size:15px;line-height:1}
    .v48-menu-sep{height:1px;margin:5px 7px;background:rgba(23,25,24,.075)}
    @media(max-width:390px){.v48-header-host{padding-right:102px!important}.v48-action{width:45px;height:45px;border-radius:14px}.v48-action svg{width:17px;height:17px}.v48-action span{font-size:7.4px}}
  `;
  document.head.appendChild(style);
}

function userIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5.5 19c.7-4 3-6 6.5-6s5.8 2 6.5 6"></path></svg>';}
function menuIcon(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14"></path></svg>';}

function authUser(){
  try{return window.VAYQUO_AUTH?.getUser?.()||null;}catch{return null;}
}

function login(){
  const u=authUser();
  if(u){openSettings();return;}
  if(window.VAYQUO_AUTH?.show){
    window.VAYQUO_AUTH.show({mode:'login',title:'Dein VAYQUO-Konto.',copy:'Melde dich an, um deine gespeicherten Entscheidungen und Stände wieder zu laden.'});
  }
}

function findSettingsTarget(){
  const direct=q('#bottom [data-view="settings"],.bottom [data-view="settings"],#bottom [data-view="einstellungen"],.bottom [data-view="einstellungen"],[data-view="settings"],[data-view="einstellungen"]');
  if(direct)return direct;
  return qa('button,a,[role="button"]')
    .filter(el=>!el.closest(`#${ROOT_ID},#${MENU_ID},#v24-auth`))
    .find(el=>/^(Einstellungen|Settings)$/i.test(txt(el))||/Einstellungen|Settings/i.test(String(el.getAttribute('aria-label')||el.getAttribute('title')||'')))||null;
}

function openSettings(){
  closeMenu();
  const target=findSettingsTarget();
  if(target){target.click();return true;}
  return false;
}

function closeMenu(){
  q(`#${MENU_ID}`)?.setAttribute('hidden','');
  q('#v48-menu-button')?.setAttribute('aria-expanded','false');
}

function positionMenu(menu,button){
  const r=button.getBoundingClientRect();
  const width=Math.min(224,window.innerWidth-28);
  const left=Math.max(14,Math.min(window.innerWidth-width-14,r.right-width));
  const top=Math.min(window.innerHeight-190,r.bottom+8);
  menu.style.left=`${left}px`;
  menu.style.top=`${Math.max(12,top)}px`;
}

function buildMenu(){
  let menu=q(`#${MENU_ID}`);
  if(menu)return menu;
  menu=document.createElement('div');
  menu.id=MENU_ID;menu.hidden=true;menu.setAttribute('role','menu');
  document.body.appendChild(menu);
  return menu;
}

function openMenu(button){
  const menu=buildMenu();
  const user=authUser();
  menu.innerHTML=`
    <button class="v48-menu-item" type="button" data-v48-menu="settings"><span>Einstellungen</span><small>›</small></button>
    <a class="v48-menu-item" href="/ratgeber/" data-v48-menu="ratgeber"><span>Ratgeber</span><small>›</small></a>
    <div class="v48-menu-sep"></div>
    <a class="v48-menu-item" href="/rechtliches.html" data-v48-menu="legal"><span>Impressum & Datenschutz</span><small>›</small></a>
    ${user?'<button class="v48-menu-item" type="button" data-v48-menu="logout"><span>Abmelden</span><small>›</small></button>':''}
  `;
  q('[data-v48-menu="settings"]',menu)?.addEventListener('click',()=>{
    if(!openSettings())closeMenu();
  });
  q('[data-v48-menu="logout"]',menu)?.addEventListener('click',async()=>{
    closeMenu();
    try{await window.VAYQUO_AUTH?.logout?.();}catch{}
    setTimeout(sync,50);
  });
  positionMenu(menu,button);
  menu.removeAttribute('hidden');
  button.setAttribute('aria-expanded','true');
}

function toggleMenu(button){
  const menu=buildMenu();
  if(!menu.hidden&&!menu.hasAttribute('hidden')){closeMenu();return;}
  openMenu(button);
}

function topBrand(){
  const app=q('#app');if(!app)return null;
  const ar=app.getBoundingClientRect();
  return qa('*',app)
    .filter(el=>el.children.length===0&&visible(el)&&/^VAYQUO$/i.test(txt(el)))
    .filter(el=>{const r=el.getBoundingClientRect();return r.top>=ar.top-4&&r.top<ar.top+170;})
    .sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top)[0]||null;
}

function headerHost(){
  const app=q('#app'),brand=topBrand();if(!app||!brand)return null;
  let node=brand.parentElement,best=null;
  for(let i=0;i<5&&node&&node!==app;i++,node=node.parentElement){
    const r=node.getBoundingClientRect(),ar=app.getBoundingClientRect();
    if(r.width>=Math.min(260,ar.width*.72)&&r.height>=30&&r.height<=92)best=node;
  }
  return best;
}

function fallbackHost(){
  const app=q('#app');if(!app)return null;
  let host=q('.v48-fallback-host',app);
  if(host)return host;
  host=document.createElement('div');host.className='v48-fallback-host';
  const anchor=q('.v34usp-headerline',app)||q('#v44-home-visual-trust',app)||app.firstElementChild;
  if(anchor?.parentElement)anchor.insertAdjacentElement('beforebegin',host);else app.prepend(host);
  return host;
}

function mount(){
  ensureStyle();
  let root=q(`#${ROOT_ID}`);
  if(!root){
    root=document.createElement('div');root.id=ROOT_ID;
    root.innerHTML=`
      <button class="v48-action" id="v48-login-button" type="button" aria-label="Anmelden">${userIcon()}<span>Anmelden</span></button>
      <button class="v48-action" id="v48-menu-button" type="button" aria-label="Menü" aria-haspopup="menu" aria-expanded="false">${menuIcon()}<span>Menü</span></button>`;
    q('#v48-login-button',root)?.addEventListener('click',login);
    q('#v48-menu-button',root)?.addEventListener('click',ev=>{ev.stopPropagation();toggleMenu(ev.currentTarget);});
  }
  if(!homeActive()){
    root.setAttribute('hidden','');closeMenu();return root;
  }
  root.removeAttribute('hidden');
  const host=headerHost()||fallbackHost();
  if(host&&root.parentElement!==host){
    qa('.v48-header-host').forEach(el=>el.classList.remove('v48-header-host'));
    if(!host.classList.contains('v48-fallback-host'))host.classList.add('v48-header-host');
    host.appendChild(root);
  }
  return root;
}

function sync(){
  const root=mount();
  const btn=q('#v48-login-button',root);if(!btn)return;
  const user=authUser();
  const label=q('span',btn);
  if(label)label.textContent=user?'Konto':'Anmelden';
  btn.setAttribute('aria-label',user?'Konto öffnen':'Anmelden');
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;try{sync();}catch(e){console.warn('VAYQUO header actions',e);}});
}

document.addEventListener('click',ev=>{
  if(!ev.target.closest?.(`#${MENU_ID},#v48-menu-button`))closeMenu();
  setTimeout(schedule,0);
},true);
window.addEventListener('resize',closeMenu);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','aria-current']});
})();
