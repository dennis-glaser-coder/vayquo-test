(()=>{
'use strict';

const LEGAL_PAGE='rechtliches.html';
let authLinksMounted=false;
let settingsMounted=false;
let publicLinksMounted=false;

function addStyle(){
 if(document.getElementById('v24-legal-style'))return;
 const style=document.createElement('style');
 style.id='v24-legal-style';
 style.textContent=`
 .v24-legal-auth-links,.v24-legal-public-links{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:8px;color:#909a97;font-size:10px;line-height:1.4}
 .v24-legal-auth-links{margin:14px 0 0}.v24-legal-public-links{margin:18px auto 86px;padding:0 12px;max-width:442px}
 .v24-legal-auth-links a,.v24-legal-public-links a{color:#768380;text-decoration:none;font-weight:700}.v24-legal-auth-links span,.v24-legal-public-links span{opacity:.45}
 .v24-legal-row{cursor:pointer}.v24-legal-row *{pointer-events:none}
 `;
 document.head.appendChild(style);
}

function leaves(root=document){return Array.from(root.querySelectorAll('*')).filter(el=>el.children.length===0);}
function leafExact(text,root=document){return leaves(root).find(el=>(el.textContent||'').trim()===text)||null;}
function startActive(){
 const nav=document.querySelector('#bottom [data-view="start"],.bottom [data-view="start"]');
 if(nav&&(nav.classList.contains('active')||nav.getAttribute('aria-current')==='page'))return true;
 return leaves(document.getElementById('app')||document).some(el=>(el.textContent||'').trim()==='Deine Programme');
}

function rowForLeaf(leaf){
 if(!leaf)return null;
 const clickable=leaf.closest('button,[role="button"],a');
 if(clickable)return clickable;
 let node=leaf;
 let best=null;
 for(let i=0;i<6;i++){
  const parent=node.parentElement;
  if(!parent)break;
  const text=(parent.textContent||'').trim();
  if(text.length>220)break;
  if(parent.children.length>=2&&parent.querySelector('svg'))best=parent;
  node=parent;
 }
 return best||leaf.parentElement?.parentElement||leaf.parentElement;
}

function legalLinksHtml(){
 return `<a href="${LEGAL_PAGE}#impressum">Impressum</a><span>·</span><a href="${LEGAL_PAGE}#werbung">Affiliate-Hinweis</a><span>·</span><a href="${LEGAL_PAGE}#datenschutz">Datenschutz</a>`;
}

function mountAuthLinks(){
 if(authLinksMounted&&document.querySelector('.v24-legal-auth-links'))return;
 const root=document.getElementById('v24-auth');
 const card=root?.querySelector('.v24a-card');
 if(!card)return;
 const existing=card.querySelector('.v24-legal-auth-links');
 if(existing){authLinksMounted=true;return;}
 const links=document.createElement('div');
 links.className='v24-legal-auth-links';
 links.innerHTML=legalLinksHtml();
 card.appendChild(links);
 authLinksMounted=true;
}

function mountPublicLinks(){
 const existing=document.querySelector('.v24-legal-public-links');
 if(!startActive()){
  existing?.remove();
  publicLinksMounted=false;
  return;
 }
 if(existing){publicLinksMounted=true;return;}
 const app=document.getElementById('app');
 if(!app)return;
 const links=document.createElement('div');
 links.className='v24-legal-public-links';
 links.setAttribute('aria-label','Rechtliche Informationen');
 links.innerHTML=legalLinksHtml();
 app.appendChild(links);
 publicLinksMounted=true;
}

function prepareClonedRow(source){
 const row=source.cloneNode(true);
 row.removeAttribute('id');
 row.classList.add('v24-legal-row');
 row.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
 row.querySelectorAll('input,select,textarea').forEach(el=>el.remove());
 row.setAttribute('role','button');
 row.setAttribute('tabindex','0');
 return row;
}

function rewriteRow(row){
 const textLeaves=leaves(row).filter(el=>(el.textContent||'').trim());
 if(textLeaves[0])textLeaves[0].textContent='Datenschutz & Impressum';
 if(textLeaves[1])textLeaves[1].textContent='Rechtliche Informationen zu VAYQUO.';
 for(let i=2;i<textLeaves.length;i++){
  const t=(textLeaves[i].textContent||'').trim();
  if(/Daten|Quelle|Regel|Prüf|Aktual/i.test(t))textLeaves[i].textContent='';
 }
 const svg=row.querySelector('svg');
 if(svg){
  svg.setAttribute('viewBox','0 0 24 24');
  svg.innerHTML='<path d="M12 3 5.5 5.7v5.4c0 4.1 2.7 7.8 6.5 9.1 3.8-1.3 6.5-5 6.5-9.1V5.7L12 3Zm0 2.1 4.5 1.9v4.1c0 3.1-1.9 5.9-4.5 7-2.6-1.1-4.5-3.9-4.5-7V7L12 5.1Zm-1 4v4.8h2V9.1h-2Zm0 6.2v2h2v-2h-2Z" fill="currentColor"/>';
 }
 const open=()=>{location.href=`${LEGAL_PAGE}#datenschutz`;};
 row.addEventListener('click',open);
 row.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open();}});
 return row;
}

function mountSettingsRow(){
 const settingsHeading=leafExact('Einstellungen');
 if(!settingsHeading)return;
 if(document.querySelector('.v24-legal-row')){settingsMounted=true;return;}
 const sourceLeaf=leafExact('Daten & Quellen')||leafExact('Datenstand & Quellen')||leafExact('Programme & Karten')||leafExact('Programme & Amex');
 const sourceRow=rowForLeaf(sourceLeaf);
 if(!sourceRow||!sourceRow.parentElement)return;
 const row=rewriteRow(prepareClonedRow(sourceRow));
 sourceRow.parentElement.insertBefore(row,sourceRow.nextSibling);
 settingsMounted=true;
}

function boot(){
 addStyle();
 mountAuthLinks();
 mountPublicLinks();
 mountSettingsRow();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(()=>setTimeout(boot,20)).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-current','hidden']});
})();