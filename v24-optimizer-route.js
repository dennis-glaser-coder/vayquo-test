(()=>{
'use strict';
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const label=el=>{
 const leaf=qa('*',el).find(x=>x.children.length===0&&/^(Prüfen|Optimieren)$/i.test((x.textContent||'').trim()));
 if(leaf){leaf.textContent='Optimieren';return;}
 Array.from(el.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE&&/^(Prüfen|Optimieren)$/i.test((n.textContent||'').trim())).forEach(n=>n.textContent='Optimieren');
};
function normalize(){
 qa('#bottom [data-view="check"],.bottom [data-view="check"],#bottom [data-view="optimize"],.bottom [data-view="optimize"]').forEach(el=>{el.dataset.view='optimize';label(el);});
}
function wrapGo(){
 if(typeof window.go!=='function'||window.go.__v24OptimizerRoute)return;
 const original=window.go;
 const routed=function(view,...args){
  if(String(view).toLowerCase()!=='optimize')return original.call(this,view,...args);
  const navs=qa('#bottom [data-view="optimize"],.bottom [data-view="optimize"]');
  navs.forEach(el=>{el.dataset.view='check';});
  try{return original.call(this,'check',...args);}
  finally{navs.forEach(el=>{el.dataset.view='optimize';label(el);});}
 };
 routed.__v24OptimizerRoute=true;
 window.go=routed;
}
function apply(){wrapGo();normalize();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();