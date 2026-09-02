(()=>{
'use strict';
const FALLBACK={
 rack:{model:'ATX PRX-520',title:'ATX Power Rack PRX-520',price:489,stock:'available',stockLabel:'Lieferzeit 6 Tage',dimensions:{w:1.19,d:1.27,h:2.15},note:'119 × 127 × 215 cm'},
 bench:{model:'FID-102',title:'Verstellbare Trainingsbank FID-102',price:179,stock:'available',stockLabel:'bestellbar',dimensions:{w:.63,d:1.135,h:.515},note:'113,5 × 63 × 51,5 cm'},
 dumbbells:{model:'ATX OCTA SET M',title:'ATX Octa-Dumbbells 2 × 24 kg',price:699,stock:'available',stockLabel:'Lieferzeit 6 Tage',dimensions:null,note:'2 × 24 kg inkl. Ablage'},
 bar:{model:'ATX Multi-Powerbar 20 kg',title:'ATX Multi-Powerbar / Hybridbar 20 kg',price:209,stock:'available',stockLabel:'Lieferzeit 6 Tage',dimensions:{w:2.2,d:.05,h:.05},note:'220 cm · 50-mm-Aufnahme'},
 plates:{model:'ATX Gummi-Gripper 100 kg',title:'ATX Gummi-Gripper 100 kg Set',price:379,stock:'unavailable',stockLabel:'Alternative nötig',dimensions:null,note:'100 kg · 50-mm-Bohrung'}
};
const PLANNED={
 floor:{title:'Bodenschutz',price:95,note:'Planwert · Fläche passend zum Raum'},
 pullup:{title:'Klimmzuglösung',price:90,note:'Planwert · kompakte Ergänzung'},
 bands:{title:'Widerstandsbänder',price:40,note:'Planwert · Zubehör'},
 cable:{title:'Kabelzug-Erweiterung',price:220,note:'Planwert · optionales Upgrade'}
};
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
const qs=s=>document.querySelector(s), qsa=s=>[...document.querySelectorAll(s)];
let budget=2500, selected='rack';
function catalog(){return Object.assign({},FALLBACK,window.VAYQUO_LIVE_HOMEGYM||{})}
function allItems(){const c=catalog();return [
 {id:'rack',...c.rack,verified:true},{id:'bench',...c.bench,verified:true},{id:'dumbbells',...c.dumbbells,verified:true},{id:'bar',...c.bar,verified:true},{id:'plates',...c.plates,verified:true},
 {id:'floor',...PLANNED.floor,verified:false,stock:'planned'},{id:'pullup',...PLANNED.pullup,verified:false,stock:'planned'},{id:'bands',...PLANNED.bands,verified:false,stock:'planned'},{id:'cable',...PLANNED.cable,verified:false,stock:'planned'}
]}
function verifiedAvailable(i){return i.verified&&i.stock==='available'}
function included(i){if(i.stock==='unavailable')return false;let threshold={rack:500,bench:900,dumbbells:1400,bar:1750,floor:250,pullup:2100,bands:2250,cable:2800}[i.id]||0;return budget>=threshold}
function renderProducts(){const host=qs('#fsProducts');if(!host)return;const items=allItems();host.innerHTML=items.map((i,idx)=>`<button class="fs-product ${selected===i.id?'active':''}" data-fs-product="${i.id}" type="button"><span class="fs-product-num">${String(idx+1).padStart(2,'0')}</span><span class="fs-product-copy"><b>${i.title}</b><small>${i.verified?(i.model||'verifiziert'):'Planposition'} · ${i.note||''}</small></span><span class="fs-product-side"><b>${money(i.price||0)}</b><span class="fs-stock ${i.stock==='unavailable'?'off':''}">${i.stock==='unavailable'?'nicht eingeplant':i.verified?'verifiziert':'Planwert'}</span></span></button>`).join('');
 qsa('[data-fs-product]').forEach(b=>b.addEventListener('click',()=>selectProduct(b.dataset.fsProduct)));
 updateTotals();
}
function updateTotals(){const items=allItems().filter(included);const planned=items.reduce((s,i)=>s+(i.price||0),0);const verified=items.filter(verifiedAvailable).reduce((s,i)=>s+(i.price||0),0);const reserve=Math.max(0,budget-planned);qs('#fsBudgetValue').textContent=money(budget);qs('#fsTotal').textContent=money(planned);qs('#fsVerified').textContent=money(verified);qs('#fsReserve').textContent=money(reserve);qs('#fsPlanCount').textContent=items.length;qs('#fsBudgetRange').value=Math.min(budget,20000);const fit=planned<=budget?'im Budget':'über Budget';qs('#fsFit').textContent=fit;qs('#fsFit').style.color=planned<=budget?'#cbbd9f':'#e39a8f';
 qsa('[data-fs-product]').forEach(node=>{const id=node.dataset.fsProduct,item=allItems().find(x=>x.id===id);node.style.opacity=item&&included(item)?'1':'.42'});
}
function selectProduct(id){selected=id;qsa('[data-fs-product],.fs-hotspot').forEach(n=>n.classList.toggle('active',n.dataset.fsProduct===id||n.dataset.id===id));const item=allItems().find(x=>x.id===id);if(!item)return;const pop=qs('#fsProductPop');if(pop){pop.innerHTML=`<small>${item.verified?'Verifiziertes Produkt':'Planposition'}</small><b>${item.title}</b><span>${item.note||''} · ${money(item.price||0)}${item.stock==='unavailable'?' · aktuell nicht eingeplant':''}</span>`;const spot=qs(`.fs-hotspot[data-id="${id}"]`);if(spot){const r=spot.getBoundingClientRect(),sr=qs('.fs-stage').getBoundingClientRect();pop.style.left=Math.min(sr.width-290,Math.max(16,r.left-sr.left+42))+'px';pop.style.top=Math.max(70,r.top-sr.top-10)+'px';pop.classList.add('show')}else pop.classList.remove('show')}
}
function init(){const range=qs('#fsBudgetRange');if(range){range.value=budget;range.addEventListener('input',e=>{budget=Number(e.target.value);renderProducts()})}qsa('[data-fs-budget]').forEach(b=>b.addEventListener('click',()=>{budget=Number(b.dataset.fsBudget);renderProducts()}));qsa('.fs-hotspot').forEach(h=>h.addEventListener('click',()=>selectProduct(h.dataset.id)));
 const upload=qs('#fsRoomUpload');if(upload)upload.addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(!f||!f.type.startsWith('image/'))return;const reader=new FileReader();reader.onload=()=>{const room=qs('#fsRoom');room.style.backgroundImage=`linear-gradient(180deg,rgba(7,7,6,.02),rgba(7,7,6,.28)),url("${reader.result}")`;room.classList.add('has-upload');const note=qs('#fsRoomSource');if(note)note.textContent='Dein Raumfoto · lokal im Browser'};reader.readAsDataURL(f)});
 qsa('[data-fs-view]').forEach(b=>b.addEventListener('click',()=>{qsa('[data-fs-view]').forEach(x=>x.classList.remove('active'));b.classList.add('active');qs('#fsProductPop')?.classList.remove('show')}));
 qs('#fsShare')?.addEventListener('click',async()=>{const text=`Mein VAYQUO Home Gym · Budget ${money(budget)}`;try{if(navigator.share)await navigator.share({title:'VAYQUO Home Gym',text,url:location.href});else{await navigator.clipboard.writeText(location.href);qs('#fsShare').textContent='Link kopiert ✓';setTimeout(()=>qs('#fsShare').textContent='Teilen',1500)}}catch(_){}});
 qs('#fsBuy')?.addEventListener('click',()=>{document.querySelector('#planner')?.scrollIntoView({behavior:'smooth',block:'start'});const gym=document.querySelector('.cat[data-cat="gym"]');gym?.click()});
 qsa('.fs-project[data-target]').forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.target;if(t==='gym')return;document.querySelector(`.cat[data-cat="${t}"]`)?.click()}));
 renderProducts();selectProduct('rack');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();