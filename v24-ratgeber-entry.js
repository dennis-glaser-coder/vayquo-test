(()=>{
'use strict';

const params=new URLSearchParams(window.location.search);
const targets={mr_value:{view:'points',labels:['Punkte']},payback_value:{view:'points',labels:['Punkte']},offer_compare:{view:'check',labels:['Prüfen','Optimieren']}};
const target=params.get('source')==='ratgeber'?targets[params.get('entry')]:null;
const text=el=>(el?.textContent||'').replace(/\s+/g,' ').trim();
let completed=false,entryObserver=null;

function addLinkStyle(){
 if(document.getElementById('v24-ratgeber-link-style'))return;
 const style=document.createElement('style');
 style.id='v24-ratgeber-link-style';
 style.textContent='.v24-ratgeber-row{cursor:pointer}.v24-ratgeber-row *{pointer-events:none}';
 document.head.appendChild(style);
}
function leaves(root=document){return Array.from(root.querySelectorAll('*')).filter(el=>el.children.length===0);}
function mountRatgeberLink(){
 if(document.querySelector('.v24-ratgeber-row'))return;
 const legalRow=document.querySelector('.v24-legal-row');
 if(!legalRow||!legalRow.parentElement)return;
 const row=legalRow.cloneNode(true);
 row.removeAttribute('id');
 row.classList.remove('v24-legal-row');
 row.classList.add('v24-ratgeber-row');
 row.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
 row.setAttribute('role','button');row.setAttribute('tabindex','0');
 const textLeaves=leaves(row).filter(el=>(el.textContent||'').trim());
 if(textLeaves[0])textLeaves[0].textContent='Ratgeber';
 if(textLeaves[1])textLeaves[1].textContent='Punkte, Meilen und Vorteile besser nutzen.';
 for(let i=2;i<textLeaves.length;i++)textLeaves[i].textContent='';
 const svg=row.querySelector('svg');
 if(svg){svg.setAttribute('viewBox','0 0 24 24');svg.innerHTML='<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v16H7.5A2.5 2.5 0 0 0 5 20.5v-16Zm2.5-.5A.5.5 0 0 0 7 4.5v12.55c.16-.03.33-.05.5-.05H18V4H7.5ZM5 20.5A1.5 1.5 0 0 1 6.5 19H20v3H6.5A1.5 1.5 0 0 1 5 20.5Z" fill="currentColor"/>';}
 const open=()=>{location.href='/ratgeber/';};
 row.addEventListener('click',open);
 row.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open();}});
 legalRow.parentElement.insertBefore(row,legalRow);
}
function isVisible(el){if(!el)return false;const style=getComputedStyle(el);if(style.display==='none'||style.visibility==='hidden')return false;return !!(el.offsetWidth||el.offsetHeight||el.getClientRects().length);}
function findTarget(){
 if(!target)return null;
 const scoped=[...document.querySelectorAll(`#bottom [data-view="${target.view}"],.bottom [data-view="${target.view}"]`),...document.querySelectorAll(`[data-view="${target.view}"]`)];
 const direct=scoped.find(isVisible);if(direct)return direct;
 const nav=[...document.querySelectorAll('#bottom .nav,.bottom .nav,#bottom button,.bottom button,#bottom a,.bottom a,nav [role="button"],nav button,nav a')];
 return nav.find(el=>isVisible(el)&&target.labels.includes(text(el)))||null;
}
function isActive(el){return !!el&&(el.classList.contains('active')||el.getAttribute('aria-current')==='page'||el.getAttribute('aria-selected')==='true');}
function cleanEntryUrl(){const url=new URL(window.location.href);url.searchParams.delete('entry');url.searchParams.delete('source');const query=url.searchParams.toString();history.replaceState(history.state,'',url.pathname+(query?'?'+query:'')+url.hash);}
function finish(){if(completed)return;completed=true;entryObserver?.disconnect();cleanEntryUrl();}
function route(){if(!target||completed)return;const el=findTarget();if(!el)return;if(isActive(el)){finish();return;}el.click();requestAnimationFrame(()=>requestAnimationFrame(finish));}
function boot(){
 addLinkStyle();mountRatgeberLink();
 if(target)requestAnimationFrame(()=>{try{route();}catch(e){console.warn('VAYQUO Ratgeber entry',e);}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
new MutationObserver(()=>setTimeout(mountRatgeberLink,20)).observe(document.documentElement,{childList:true,subtree:true});
if(target){entryObserver=new MutationObserver(boot);entryObserver.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','aria-current','aria-selected']});document.addEventListener('vq-auth-ready',boot);window.addEventListener('pageshow',boot);}
})();
